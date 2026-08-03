// ─── Revenue Sharing & Order Classification ───────────────────────────────────
// Company data, so the numbers come from the Supabase `orders` table.
//
// Change a partner's cut here and it updates everywhere — the tracker reads
// these values rather than hardcoding percentages in the page.

import { parsePriceInr } from './pricing';

export type RevenueShare = {
  id: string;
  name: string;
  /** Whole percent of net revenue. Must add up to 100 across all partners. */
  percent: number;
};

export const REVENUE_SHARES: RevenueShare[] = [
  { id: 'shaad', name: 'Shaad Sir', percent: 90 },
  { id: 'raj',   name: 'Raj',       percent: 10 },
];

/** Guards against a typo silently mis-paying someone. */
export function sharesAreValid(shares: RevenueShare[] = REVENUE_SHARES): boolean {
  return shares.reduce((total, share) => total + share.percent, 0) === 100;
}

export type PartnerPayout = RevenueShare & { amountInr: number };

export function splitRevenue(totalInr: number, shares: RevenueShare[] = REVENUE_SHARES): PartnerPayout[] {
  const total = Math.max(0, Number(totalInr) || 0);
  return shares.map(share => ({
    ...share,
    amountInr: Math.round(total * share.percent) / 100,
  }));
}

// ── Order classification ──────────────────────────────────────────────────────

export type OrderKind = 'recharge' | 'cart' | 'printing' | 'manual' | 'other';

export const ORDER_KIND_LABELS: Record<OrderKind, string> = {
  recharge: 'Credit recharges',
  cart:     'Resource sales',
  printing: 'Printing orders',
  manual:   'Manual grants',
  other:    'Other',
};

export type OrderRow = {
  id: string;
  customer?: string;
  email?: string;
  product?: string;
  amount?: string;
  status?: string;
  date?: string;
  /** Present once supabase_migration_orders_meta.sql has been run. */
  kind?: string | null;
  amount_inr?: number | null;
  user_id?: string | null;
  created_at?: string | null;
};

/**
 * Prefers the `kind` column. Older rows predate it, so fall back to reading the
 * product description — recharges and printing orders are written with a
 * recognisable label by the verify-payment route.
 */
export function classifyOrder(order: OrderRow): OrderKind {
  const kind = String(order.kind || '').toLowerCase();
  if (kind === 'recharge' || kind === 'cart' || kind === 'printing' || kind === 'manual') return kind;

  const product = String(order.product || '').toLowerCase();
  if (product.includes('recharge')) return 'recharge';
  if (product.includes('printing')) return 'printing';
  if (product) return 'cart';
  return 'other';
}

/** Amount in rupees, preferring the numeric column over the display string. */
export function orderAmountInr(order: OrderRow): number {
  const numeric = Number(order.amount_inr);
  if (Number.isFinite(numeric) && numeric > 0) return numeric;
  return parsePriceInr(order.amount);
}

export function isRevenueOrder(order: OrderRow): boolean {
  return String(order.status || '').toLowerCase() === 'completed';
}

/** Best-effort timestamp for an order; falls back to the display date string. */
export function orderDate(order: OrderRow): Date | null {
  if (order.created_at) {
    const parsed = new Date(order.created_at);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  if (order.date) {
    const parsed = new Date(order.date);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return null;
}

export type RevenueTotals = {
  grossInr: number;
  refundedInr: number;
  pendingInr: number;
  orderCount: number;
  byKind: Record<OrderKind, { count: number; amountInr: number }>;
};

const emptyByKind = (): RevenueTotals['byKind'] => ({
  recharge: { count: 0, amountInr: 0 },
  cart:     { count: 0, amountInr: 0 },
  printing: { count: 0, amountInr: 0 },
  manual:   { count: 0, amountInr: 0 },
  other:    { count: 0, amountInr: 0 },
});

export function summariseOrders(orders: OrderRow[]): RevenueTotals {
  const totals: RevenueTotals = {
    grossInr: 0,
    refundedInr: 0,
    pendingInr: 0,
    orderCount: 0,
    byKind: emptyByKind(),
  };

  for (const order of orders) {
    const amount = orderAmountInr(order);
    const status = String(order.status || '').toLowerCase();

    if (status === 'refunded') { totals.refundedInr += amount; continue; }
    if (status === 'pending')  { totals.pendingInr += amount; continue; }
    if (status !== 'completed') continue;

    const kind = classifyOrder(order);
    totals.grossInr += amount;
    totals.orderCount += 1;
    totals.byKind[kind].count += 1;
    totals.byKind[kind].amountInr += amount;
  }

  return totals;
}
