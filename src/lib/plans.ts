// ─── Download Plans ───────────────────────────────────────────────────────────
// Recharge model, NOT a subscription: a recharge adds download credits to the
// user's balance and those credits stay until they are spent. When the balance
// hits zero the user drops back to the free daily allowance until they recharge
// again. Nothing resets monthly.
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

type AllowanceInput = {
  downloadCredits?: number;
  dailyDownloads?: Record<string, number>;
};

/**
 * Paid credits are spent first; once they run out the user falls back to the
 * free daily allowance. Shared by the client (to display balances) and the
 * download API (to enforce them) so the two can never disagree.
 */
export function resolveAllowance(user: AllowanceInput | null | undefined, today = dayKey()): DownloadAllowance {
  const credits = Math.max(0, Number(user?.downloadCredits ?? 0));
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
 * there are credits left to spend — an exhausted balance is back to Free.
 */
export function effectiveTier(user: { plan?: string; downloadCredits?: number } | null | undefined): PlanTier {
  const credits = Number(user?.downloadCredits ?? 0);
  if (credits <= 0) return 'Free';
  const plan = String(user?.plan || 'Free');
  if (plan === 'Enterprise') return 'Enterprise';
  if (plan === 'Pro') return 'Pro';
  if (plan === 'Plus') return 'Plus';
  return 'Free';
}

/** Enterprise gets the same asset access as Pro. */
export function tierUnlocksProAssets(tier: PlanTier): boolean {
  return tier === 'Pro' || tier === 'Enterprise';
}
