// ─── Order Pricing (shared) ───────────────────────────────────────────────────
// Pure helpers imported by BOTH the browser and the server. The browser uses them
// to preview a total; the server uses them to compute the amount it actually
// charges. Sharing the maths is what stops the two from drifting apart.
//
// The browser's number is only ever a preview — the server re-prices every order
// from the database before creating it (see ./pricing-server).

/** GST applied to orders, matching the rate shown in the cart summary. */
export const GST_RATE = 0.18;

/**
 * Product prices are stored as free-text in Supabase ('₹3,499', '1299', 'Free').
 * Strips everything except digits and the decimal point.
 * Returns 0 for anything that isn't a sellable number.
 */
export function parsePriceInr(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) && value > 0 ? value : 0;
  const cleaned = String(value ?? '').replace(/[^0-9.]/g, '');
  if (!cleaned) return 0;
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export type OrderTotals = {
  subtotalInr: number;
  taxInr: number;
  totalInr: number;
  /** What Razorpay is actually charged, in paise. */
  totalPaise: number;
};

export function computeTotals(subtotalInr: number): OrderTotals {
  const subtotal = Math.max(0, Math.round(subtotalInr * 100) / 100);
  const tax = Math.round(subtotal * GST_RATE);
  const total = subtotal + tax;
  return {
    subtotalInr: subtotal,
    taxInr: tax,
    totalInr: total,
    totalPaise: Math.round(total * 100),
  };
}

export function formatInr(amount: number): string {
  return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
}
