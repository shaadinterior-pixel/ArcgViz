'use server';

import { adminDb } from '@/lib/firebase-admin';
import type { Customer, WishlistItem } from '@/lib/store';
import {
  resolveAllowance, allTimeDownloads, isCreditBalanceExpired, lastCreditEventAt,
  creditExpiresAt, effectiveTier, ASSIGNABLE_TIERS, type PlanTier,
} from '@/lib/plans';
import { orderAmountInr, isRevenueOrder, type OrderRow } from '@/lib/revenue';

export async function fetchAdminCustomers(): Promise<Customer[]> {
  try {
    const [usersSnap, orderRows] = await Promise.all([
      adminDb.collection('users').get(),
      (async () => {
        try {
          const { getAdminClient } = await import('@/lib/supabase-admin');
          const { data } = await getAdminClient().from('orders').select('*');
          return (data ?? []) as OrderRow[];
        } catch {
          return [] as OrderRow[];
        }
      })(),
    ]);

    // Real per-customer revenue: every completed order linked to this Firestore
    // user id — recharge packs AND individually purchased Paid products both
    // land in the same `orders` table, so both count here (Paid products have
    // their own price, separate from the recharge packs).
    const spentByUser = new Map<string, number>();
    const orderCountByUser = new Map<string, number>();
    for (const order of orderRows) {
      if (!order.user_id || !isRevenueOrder(order)) continue;
      spentByUser.set(order.user_id, (spentByUser.get(order.user_id) || 0) + orderAmountInr(order));
      orderCountByUser.set(order.user_id, (orderCountByUser.get(order.user_id) || 0) + 1);
    }

    // Wishlists only store product ids — resolve every id used by any
    // customer in one Supabase query rather than one round trip per customer.
    const wishlistIds = new Set<string>();
    usersSnap.docs.forEach(doc => {
      const raw = doc.data().wishlist;
      if (Array.isArray(raw)) raw.forEach(id => typeof id === 'string' && wishlistIds.add(id));
    });
    const productById = new Map<string, WishlistItem>();
    if (wishlistIds.size > 0) {
      try {
        const { getAdminClient } = await import('@/lib/supabase-admin');
        const { data: products } = await getAdminClient()
          .from('products')
          .select('id, name, thumbnail_url, slug, price')
          .in('id', Array.from(wishlistIds));
        (products ?? []).forEach(p => productById.set(p.id, {
          id: p.id,
          name: String(p.name || 'Untitled'),
          thumbnailUrl: String(p.thumbnail_url || ''),
          slug: String(p.slug || p.id),
          price: String(p.price || ''),
        }));
      } catch {
        // Wishlist stays as a count-only fallback below if this fails.
      }
    }

    const customers = usersSnap.docs.map((doc) => {
      const data = doc.data();
      let joinDate = 'Unknown';
      if (data.joinDate && typeof data.joinDate.toDate === 'function') {
        joinDate = data.joinDate.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      } else if (data.joinDate && data.joinDate._seconds) {
        joinDate = new Date(data.joinDate._seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      } else if (data.joinDate) {
        joinDate = new Date(data.joinDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }

      const plan = (ASSIGNABLE_TIERS.includes(data.plan) ? data.plan : 'Free') as PlanTier;
      // Same allowance math the download gate itself enforces — never a
      // separately-hardcoded limit that can drift from the real one.
      const allowance = resolveAllowance(data);
      const hasActiveBalance = effectiveTier(data) !== 'Free' && !isCreditBalanceExpired(data);
      const fmtDate = (d: Date | null) => d
        ? d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        : '—';

      return {
        id: doc.id,
        name: data.name || 'Unknown',
        email: data.email || 'N/A',
        phone: data.phoneNumber || 'N/A',
        spent: spentByUser.get(doc.id) || 0,
        orders: orderCountByUser.get(doc.id) || 0,
        status: data.status || 'Active',
        joinDate,
        plan,
        downloadsUsed: allTimeDownloads(data),
        downloadsRemaining: allowance.remaining,
        wishlistCount: Array.isArray(data.wishlist) ? data.wishlist.length : 0,
        wishlist: Array.isArray(data.wishlist)
          ? data.wishlist.map((id: unknown) => productById.get(String(id))).filter((p): p is WishlistItem => !!p)
          : [],
        freeProDownloadsRemaining: data.freeProDownloadsRemaining || 0,
        planTakenOn: hasActiveBalance ? fmtDate(lastCreditEventAt(data)) : '—',
        creditsExpireOn: hasActiveBalance ? fmtDate(creditExpiresAt(data)) : '—',
      } as Customer;
    });

    return customers.sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime());
  } catch (error) {
    console.error('Error fetching admin customers:', error);
    return [];
  }
}

export async function saveAdminCustomer(customer: Customer, isNew: boolean): Promise<void> {
  try {
    // `spent` and `orders` are derived from the `orders` table on every fetch —
    // they are never written here, so a save can never leave a stale number
    // behind for fetchAdminCustomers to read back.
    const userRef = adminDb.collection('users').doc(customer.id);
    if (isNew) {
      await userRef.set({
        name: customer.name,
        email: customer.email,
        plan: customer.plan,
        status: customer.status,
        joinDate: new Date()
      });
    } else {
      await userRef.update({
        name: customer.name,
        email: customer.email,
        plan: customer.plan,
        status: customer.status,
      });
    }
  } catch (error) {
    console.error('Error saving admin customer:', error);
    throw new Error('Failed to save customer');
  }
}

export async function deleteAdminCustomer(id: string): Promise<void> {
  try {
    await adminDb.collection('users').doc(id).delete();
  } catch (error) {
    console.error('Error deleting admin customer:', error);
    throw new Error('Failed to delete customer');
  }
}
