// ─── Resource IDs (DW-40) ─────────────────────────────────────────────────────
// Every product carries a short human-readable code stored inside its
// `specifications` JSON array as { label: 'Resources Id', value: 'DW-40' }.
// It is what staff and customers quote to each other, so it must stay unique.

export const RESOURCE_ID_LABEL = 'Resources Id';
export const RESOURCE_ID_PREFIX = 'DW';

/** Matches 'Resources Id', 'Resource ID', 'resource  id', … */
const RESOURCE_LABEL_RE = /resource\s*s?\s*id/i;

export type Specification = { label: string; value: string };

export function formatResourceId(n: number): string {
  return `${RESOURCE_ID_PREFIX}-${n}`;
}

/** 'DW-40' → 40. Returns null for anything without a number. */
export function parseResourceIdNumber(value: unknown): number | null {
  const match = String(value ?? '').match(/(\d+)/);
  if (!match) return null;
  const n = Number.parseInt(match[1], 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function readResourceId(specifications: unknown): string | null {
  if (!Array.isArray(specifications)) return null;
  for (const spec of specifications) {
    const label = String((spec as Specification)?.label ?? '');
    if (RESOURCE_LABEL_RE.test(label)) {
      const value = String((spec as Specification)?.value ?? '').trim();
      if (value) return value;
    }
  }
  return null;
}

/** Replaces the existing resource id, or adds one at the top if there is none. */
export function withResourceId(specifications: unknown, resourceId: string): Specification[] {
  const specs: Specification[] = Array.isArray(specifications)
    ? specifications.map(s => ({
        label: String((s as Specification)?.label ?? ''),
        value: String((s as Specification)?.value ?? ''),
      }))
    : [];

  const index = specs.findIndex(s => RESOURCE_LABEL_RE.test(s.label));
  if (index >= 0) {
    specs[index] = { ...specs[index], value: resourceId };
    return specs;
  }
  return [{ label: RESOURCE_ID_LABEL, value: resourceId }, ...specs];
}

/**
 * The next free number, based on the highest one already in use.
 *
 * Deliberately NOT `products.length + 1` — deleting a product would make that
 * collide with an id that is still assigned.
 */
export function nextResourceNumber(products: { specifications?: unknown }[]): number {
  let highest = 0;
  for (const product of products) {
    const n = parseResourceIdNumber(readResourceId(product.specifications));
    if (n && n > highest) highest = n;
  }
  return highest + 1;
}

/**
 * Turns whatever the user typed into the canonical id.
 * Accepts '40', 'DW40', 'dw-40', 'DW 40', 'DW_40' → 'DW-40'. Otherwise null.
 */
export function normalizeResourceIdQuery(query: string): string | null {
  const trimmed = String(query ?? '').trim();
  if (!trimmed) return null;

  const match = trimmed.match(/^(?:dw)?[\s\-_]*(\d+)$/i);
  if (!match) return null;

  const n = Number.parseInt(match[1], 10);
  return Number.isFinite(n) && n > 0 ? formatResourceId(n) : null;
}

/**
 * Spelling variants worth checking in the database, since older rows may have
 * been typed by hand ('DW40', 'dw-40').
 */
export function resourceIdVariants(canonical: string): string[] {
  const n = parseResourceIdNumber(canonical);
  if (!n) return [canonical];
  return [
    `${RESOURCE_ID_PREFIX}-${n}`,
    `${RESOURCE_ID_PREFIX}${n}`,
    `${RESOURCE_ID_PREFIX.toLowerCase()}-${n}`,
    `${RESOURCE_ID_PREFIX.toLowerCase()}${n}`,
    String(n),
  ];
}

/** Does this product carry the given resource id (in any spelling)? */
export function matchesResourceId(specifications: unknown, canonical: string): boolean {
  const current = readResourceId(specifications);
  if (!current) return false;
  const wanted = parseResourceIdNumber(canonical);
  const have = parseResourceIdNumber(current);
  return wanted !== null && wanted === have;
}
