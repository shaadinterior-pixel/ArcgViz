// ─── Shopping Cart (browser) ──────────────────────────────────────────────────
// The cart lives in localStorage — it is a draft, not a record, so it does not
// belong in either database until the user actually pays.
//
// The name/price/image stored here are only for rendering the cart. The server
// re-prices every order from Supabase before charging, so editing localStorage
// changes what you see, never what you pay.

'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { computeTotals, parsePriceInr } from './pricing';

const STORAGE_KEY = 'dw_cart_v1';
/** Fired on this tab; the native `storage` event covers the others. */
const CART_EVENT = 'dw:cart-changed';

export type CartItem = {
  productId: string;
  name: string;
  /** Display price as stored in Supabase, e.g. '₹3,499'. */
  price: string;
  image?: string;
  slug?: string;
  category?: string;
  author?: string;
  quantity: number;
};

function read(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((entry): CartItem => ({
        productId: String(entry?.productId ?? ''),
        name: String(entry?.name ?? 'Item'),
        price: String(entry?.price ?? ''),
        image: entry?.image ? String(entry.image) : undefined,
        slug: entry?.slug ? String(entry.slug) : undefined,
        category: entry?.category ? String(entry.category) : undefined,
        author: entry?.author ? String(entry.author) : undefined,
        quantity: Math.max(1, Math.floor(Number(entry?.quantity ?? 1)) || 1),
      }))
      .filter(item => item.productId);
  } catch {
    return [];
  }
}

function write(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event(CART_EVENT));
  } catch {
    // Quota or private-mode failures shouldn't break the page.
  }
}

export function getCartItems(): CartItem[] {
  return read();
}

export function addToCart(item: Omit<CartItem, 'quantity'>, quantity = 1): CartItem[] {
  const items = read();
  const existing = items.find(i => i.productId === item.productId);
  if (existing) {
    existing.quantity += Math.max(1, quantity);
  } else {
    items.push({ ...item, quantity: Math.max(1, quantity) });
  }
  write(items);
  return items;
}

export function removeFromCart(productId: string): CartItem[] {
  const items = read().filter(i => i.productId !== productId);
  write(items);
  return items;
}

export function setCartQuantity(productId: string, quantity: number): CartItem[] {
  const next = Math.max(1, Math.floor(quantity) || 1);
  const items = read().map(i => (i.productId === productId ? { ...i, quantity: next } : i));
  write(items);
  return items;
}

export function clearCart(): void {
  write([]);
}

/** Preview totals only — the server recalculates before charging. */
export function cartTotals(items: CartItem[]) {
  const subtotal = items.reduce((sum, item) => sum + parsePriceInr(item.price) * item.quantity, 0);
  return computeTotals(subtotal);
}

/** The minimal shape the checkout API accepts. */
export function toOrderItems(items: CartItem[]) {
  return items.map(item => ({ productId: item.productId, quantity: item.quantity }));
}

// ── React binding ─────────────────────────────────────────────────────────────
// localStorage is an external store, so useSyncExternalStore is the right tool:
// it avoids a setState-in-effect and keeps server and client render consistent.
// `ready` is false during SSR/first paint so the cart doesn't flash "empty".

type CartSnapshot = { items: CartItem[]; ready: boolean };

const SERVER_SNAPSHOT: CartSnapshot = { items: [], ready: false };

// getSnapshot must return a stable reference while nothing has changed, so the
// parsed value is memoised against the raw string it came from.
let cachedRaw: string | null | undefined;
let cachedSnapshot: CartSnapshot = SERVER_SNAPSHOT;

function getSnapshot(): CartSnapshot {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    raw = null;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedSnapshot = { items: read(), ready: true };
  }
  return cachedSnapshot;
}

function getServerSnapshot(): CartSnapshot {
  return SERVER_SNAPSHOT;
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener(CART_EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(CART_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

export function useCart() {
  const { items, ready } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const add = useCallback((item: Omit<CartItem, 'quantity'>, quantity = 1) => { addToCart(item, quantity); }, []);
  const remove = useCallback((productId: string) => { removeFromCart(productId); }, []);
  const setQuantity = useCallback((productId: string, quantity: number) => { setCartQuantity(productId, quantity); }, []);
  const clear = useCallback(() => { clearCart(); }, []);

  return {
    items,
    ready,
    add,
    remove,
    setQuantity,
    clear,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    totals: cartTotals(items),
  };
}
