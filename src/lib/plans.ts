// ─── Download Plans ───────────────────────────────────────────────────────────
// Recharge model, NOT a subscription: a recharge adds download credits to the
// user's balance and those credits stay until they are spent OR until they go
// stale — see CREDIT_EXPIRY_DAYS below. Once the balance is empty (spent or
// expired) the user drops back to the free daily allowance until they recharge
// again.
//
// This file is imported by both client and server — it must never contain secrets.

/**
 * Enterprise is not self-serve: there is no fixed price or pack size. An admin
 * negotiates the deal and grants the credits by hand from /admin/users.
 */
export type PlanTier = 'Free' | 'Plus' | 'Pro' | 'Enterprise';

/** Tiers an admin can assign manually. */
export const ASSIGNABLE_TIERS: PlanTier[] = ['Free', 'Plus', 'Pro', 'Enterprise'];

/** Downloads a user with no credits gets each day, reset at midnight. */
export const FREE_DAILY_DOWNLOADS = 3;

/**
 * Tiers a customer can buy themselves. Enterprise is excluded on purpose — it has
 * no fixed price or pack size, so it can only be assigned by an admin.
 */
export type RechargePlanId = 'Plus' | 'Pro';

export type RechargePlan = {
  id: RechargePlanId;
  name: string;
  /** Price in rupees. Converted to paise server-side when creating the order. */
  priceInr: number;
  /** Download credits added to the balance on a successful recharge. */
  credits: number;
};

export const RECHARGE_PLANS: Record<RechargePlanId, RechargePlan> = {
  Plus: { id: 'Plus', name: 'Plus', priceInr: 149, credits: 350 },
  Pro:  { id: 'Pro',  name: 'Pro',  priceInr: 249, credits: 700 },
};

export function isRechargePlanId(value: unknown): value is RechargePlanId {
  return value === 'Plus' || value === 'Pro';
}

export function getRechargePlan(planId: string): RechargePlan | null {
  return isRechargePlanId(planId) ? RECHARGE_PLANS[planId] : null;
}

/** Local calendar day key (YYYY-MM-DD) used to bucket free daily downloads. */
export function dayKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** A paid balance goes stale this many days after the most recent recharge or grant. */
export const CREDIT_EXPIRY_DAYS = 30;

/**
 * Balances that predate the expiry policy get a fresh 30-day countdown from
 * this rollout date instead of their real (possibly much older) purchase
 * date — nobody loses credits the instant this shipped just because they
 * recharged a while back. Once CREDIT_EXPIRY_DAYS have passed since rollout,
 * every account's own lastRechargeAt/lastManualGrantAt takes over naturally.
 */
export const CREDIT_EXPIRY_ROLLOUT_AT = new Date('2026-09-19T00:00:00Z');

/** Firestore Timestamps (client or admin SDK), a REST-style `_seconds`, a Date, or an ISO string. */
type TimestampLike = { toDate: () => Date } | { _seconds: number } | Date | string | number | null | undefined;

function toMillis(value: TimestampLike): number {
  if (!value) return 0;
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = new Date(value).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  if (typeof (value as { toDate?: () => Date }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate().getTime();
  }
  if (typeof (value as { _seconds?: number })._seconds === 'number') {
    return (value as { _seconds: number })._seconds * 1000;
  }
  return 0;
}

export type ExpiryInput = {
  plan?: string;
  lastRechargeAt?: TimestampLike;
  lastManualGrantAt?: TimestampLike;
};

/**
 * The real timestamp of the most recent recharge or manual grant — for
 * display ("plan taken on") — unlike creditExpiresAt this is NOT clamped to
 * the rollout date. Null if the account has never recharged or been granted
 * credits.
 */
export function lastCreditEventAt(user: ExpiryInput | null | undefined): Date | null {
  const ms = Math.max(toMillis(user?.lastRechargeAt), toMillis(user?.lastManualGrantAt));
  return ms > 0 ? new Date(ms) : null;
}

/** The date a user's current balance goes stale — see isCreditBalanceExpired. */
export function creditExpiresAt(user: ExpiryInput | null | undefined): Date {
  const lastEvent = Math.max(
    toMillis(user?.lastRechargeAt),
    toMillis(user?.lastManualGrantAt),
    CREDIT_EXPIRY_ROLLOUT_AT.getTime(),
  );
  return new Date(lastEvent + CREDIT_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
}

/**
 * True once more than CREDIT_EXPIRY_DAYS have passed since the most recent
 * recharge or manual grant (or the rollout date, whichever is later). An
 * expired balance is treated as spent everywhere credits are read.
 *
 * Enterprise is exempt — it's not a self-serve pack, it's a custom deal an
 * admin negotiates by hand (see ASSIGNABLE_TIERS doc comment), and those
 * terms can run far longer than 30 days.
 */
export function isCreditBalanceExpired(user: ExpiryInput | null | undefined, now = new Date()): boolean {
  if (String(user?.plan) === 'Enterprise') return false;
  const lastEvent = Math.max(
    toMillis(user?.lastRechargeAt),
    toMillis(user?.lastManualGrantAt),
    CREDIT_EXPIRY_ROLLOUT_AT.getTime(),
  );
  const expiresAt = lastEvent + CREDIT_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  return now.getTime() > expiresAt;
}

/**
 * Human label for when the current balance goes stale, for admin display.
 * '—' when there's no active balance to show a date for; Enterprise never
 * auto-expires, so it gets its own label instead of a real date.
 */
export function creditExpiryLabel(user: (ExpiryInput & { downloadCredits?: number }) | null | undefined): string {
  if (effectiveTier(user) === 'Free') return '—';
  if (String(user?.plan) === 'Enterprise') return 'No auto-expiry (Enterprise)';
  return creditExpiresAt(user).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export type DownloadAllowance = {
  /** Where the next download would be taken from. */
  source: 'credits' | 'daily';
  /** Downloads still available right now from that source. */
  remaining: number;
  /** Paid credits left on the account. */
  credits: number;
  /** Free downloads already used today. */
  dailyUsed: number;
  dailyLimit: number;
  allowed: boolean;
};

type AllowanceInput = ExpiryInput & {
  downloadCredits?: number;
  dailyDownloads?: Record<string, number>;
};

/**
 * Paid credits are spent first; once they run out — or once they go stale,
 * see isCreditBalanceExpired — the user falls back to the free daily
 * allowance. Shared by the client (to display balances) and the download API
 * (to enforce them) so the two can never disagree.
 */
export function resolveAllowance(user: AllowanceInput | null | undefined, today = dayKey()): DownloadAllowance {
  const credits = isCreditBalanceExpired(user) ? 0 : Math.max(0, Number(user?.downloadCredits ?? 0));
  const dailyUsed = Math.max(0, Number(user?.dailyDownloads?.[today] ?? 0));
  const dailyRemaining = Math.max(0, FREE_DAILY_DOWNLOADS - dailyUsed);

  if (credits > 0) {
    return {
      source: 'credits',
      remaining: credits,
      credits,
      dailyUsed,
      dailyLimit: FREE_DAILY_DOWNLOADS,
      allowed: true,
    };
  }

  return {
    source: 'daily',
    remaining: dailyRemaining,
    credits: 0,
    dailyUsed,
    dailyLimit: FREE_DAILY_DOWNLOADS,
    allowed: dailyRemaining > 0,
  };
}

function sumCounters(map: unknown): number {
  if (!map || typeof map !== 'object') return 0;
  return Object.values(map as Record<string, unknown>)
    .reduce<number>((total, value) => total + Math.max(0, Number(value) || 0), 0);
}

/**
 * True all-time download count.
 *
 * `totalDownloads` only started counting when the recharge model shipped, so on
 * its own it under-reports for anyone who downloaded before that. The per-period
 * maps together cover the whole history — `monthlyDownloads` is the frozen
 * legacy record and `dailyDownloads` everything since — so the larger of the two
 * is the honest number whether or not the counter has been backfilled.
 */
export function allTimeDownloads(user: {
  totalDownloads?: unknown;
  monthlyDownloads?: unknown;
  dailyDownloads?: unknown;
} | null | undefined): number {
  const counter = Math.max(0, Number(user?.totalDownloads) || 0);
  const fromPeriods = sumCounters(user?.monthlyDownloads) + sumCounters(user?.dailyDownloads);
  return Math.max(counter, fromPeriods);
}

/**
 * The tier a user effectively has right now. A recharge tier only counts while
 * there are credits left to spend — a balance that is exhausted OR expired
 * (see isCreditBalanceExpired) is back to Free.
 */
export function effectiveTier(user: (ExpiryInput & { downloadCredits?: number }) | null | undefined): PlanTier {
  const credits = isCreditBalanceExpired(user) ? 0 : Number(user?.downloadCredits ?? 0);
  if (credits <= 0) return 'Free';
  const plan = String(user?.plan || 'Free');
  if (plan === 'Enterprise') return 'Enterprise';
  if (plan === 'Pro') return 'Pro';
  if (plan === 'Plus') return 'Plus';
  return 'Free';
}

/**
 * Plus and Pro are merged into one access level: either tier unlocks every
 * asset tier, including "Pro"-tagged ones. The only difference between the
 * two recharge packs is how many download credits they add — see
 * RECHARGE_PLANS (Plus: 350 credits, Pro: 700 credits).
 */
export function tierUnlocksProAssets(tier: PlanTier): boolean {
  return tier !== 'Free';
}

/** Display label — Plus and Pro read as one merged tier everywhere a tier badge is shown. */
export function tierLabel(tier: PlanTier): string {
  if (tier === 'Plus' || tier === 'Pro') return 'Plus + Pro';
  return tier;
}
