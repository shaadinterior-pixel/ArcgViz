// ─── Download Plans ───────────────────────────────────────────────────────────
// Recharge model, NOT a subscription: a recharge adds download credits to the
// user's balance and those credits stay until they are spent. When the balance
// hits zero the user drops back to the free daily allowance until they recharge
// again. Nothing resets monthly.
//
// This file is imported by both client and server — it must never contain secrets.

export type PlanTier = 'Free' | 'Plus' | 'Pro';

/** Downloads a user with no credits gets each day, reset at midnight. */
export const FREE_DAILY_DOWNLOADS = 3;

export type RechargePlan = {
  id: Exclude<PlanTier, 'Free'>;
  name: string;
  /** Price in rupees. Converted to paise server-side when creating the order. */
  priceInr: number;
  /** Download credits added to the balance on a successful recharge. */
  credits: number;
};

export const RECHARGE_PLANS: Record<Exclude<PlanTier, 'Free'>, RechargePlan> = {
  Plus: { id: 'Plus', name: 'Plus', priceInr: 149, credits: 350 },
  Pro:  { id: 'Pro',  name: 'Pro',  priceInr: 249, credits: 700 },
};

export function isRechargePlanId(value: unknown): value is Exclude<PlanTier, 'Free'> {
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

/**
 * The tier a user effectively has right now. A recharge tier only counts while
 * there are credits left to spend — an exhausted balance is back to Free.
 */
export function effectiveTier(user: { plan?: string; downloadCredits?: number } | null | undefined): PlanTier {
  const credits = Number(user?.downloadCredits ?? 0);
  if (credits <= 0) return 'Free';
  const plan = String(user?.plan || 'Free');
  if (plan === 'Pro') return 'Pro';
  if (plan === 'Plus') return 'Plus';
  return 'Free';
}
