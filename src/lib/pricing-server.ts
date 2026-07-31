// ─── Authoritative Order Pricing (server only) ────────────────────────────────
// Never trust a price sent by the browser. The client sends product ids and
// quantities; this module looks the real prices up in Supabase and computes the
// amount to charge. Import only from API routes / server code.

import { getAdminClient } from './supabase-admin';
import { computeTotals, parsePriceInr, type OrderTotals } from './pricing';

/** Hard cap so a typo (or a hostile caller) can't create a huge order. */
const MAX_QUANTITY_PER_LINE = 10_000;
const MAX_LINES = 50;

export type OrderItemInput = { productId: string; quantity: number };

export type PricedLine = {
  productId: string;
  name: string;
  unitPriceInr: number;
  quantity: number;
  lineTotalInr: number;
};

export type PricedOrder = OrderTotals & {
  lines: PricedLine[];
  productIds: string[];
};

export class PricingError extends Error {}

/** Normalise whatever the client posted into a clean list of items. */
export function parseOrderItems(raw: unknown): OrderItemInput[] {
  if (!Array.isArray(raw)) return [];

  return raw.slice(0, MAX_LINES).map((entry) => {
    const item = (entry ?? {}) as Record<string, unknown>;
    const productId = String(item.productId ?? item.id ?? '').trim();
    const quantity = Math.floor(Number(item.quantity ?? 1));
    return { productId, quantity: Number.isFinite(quantity) ? quantity : 0 };
  }).filter(item => item.productId.length > 0);
}

/**
 * Prices an order from the database. Throws PricingError with a user-safe
 * message when an item can't be sold — the caller turns that into a 400.
 */
export async function priceOrderItems(items: OrderItemInput[]): Promise<PricedOrder> {
  if (!items.length) throw new PricingError('No items to check out.');

  for (const item of items) {
    if (item.quantity < 1 || item.quantity > MAX_QUANTITY_PER_LINE) {
      throw new PricingError(`Invalid quantity for item ${item.productId}.`);
    }
  }

  // Collapse duplicate lines so the same product can't be double-counted oddly.
  const wanted = new Map<string, number>();
  for (const item of items) {
    wanted.set(item.productId, (wanted.get(item.productId) ?? 0) + item.quantity);
  }
  const ids = [...wanted.keys()];

  const { data, error } = await getAdminClient()
    .from('products')
    .select('id, name, price, status')
    .in('id', ids);

  if (error) throw new PricingError('Could not load product prices.');

  const rows = (data ?? []) as { id: string; name: string; price: string; status: string }[];
  const byId = new Map(rows.map(row => [String(row.id), row]));

  const lines: PricedLine[] = [];
  let subtotalInr = 0;

  for (const [productId, quantity] of wanted) {
    const product = byId.get(productId);
    if (!product) throw new PricingError(`Product ${productId} is no longer available.`);
    if (product.status !== 'Active') throw new PricingError(`"${product.name}" is currently unavailable.`);

    const unitPriceInr = parsePriceInr(product.price);
    if (unitPriceInr <= 0) throw new PricingError(`"${product.name}" is not available for purchase.`);

    const lineTotalInr = unitPriceInr * quantity;
    subtotalInr += lineTotalInr;
    lines.push({ productId, name: product.name, unitPriceInr, quantity, lineTotalInr });
  }

  return {
    ...computeTotals(subtotalInr),
    lines,
    productIds: lines.map(line => line.productId),
  };
}
