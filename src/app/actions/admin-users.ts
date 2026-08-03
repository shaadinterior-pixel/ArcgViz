'use server';

// ─── Admin: user management ───────────────────────────────────────────────────
// Consumer data lives in Firebase, so all of this reads and writes Firestore.
//
// SECURITY: server actions are reachable by anyone who can reach the site — the
// /admin layout only hides the UI. Granting credits is the same as giving away
// money, so every action here verifies a Firebase ID token and checks the caller
// is on the admin allowlist before touching anything.

import { FieldValue } from 'firebase-admin/firestore';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { isAdminEmail } from '@/lib/constants';
import { resolveAllowance, effectiveTier, allTimeDownloads, ASSIGNABLE_TIERS, type PlanTier } from '@/lib/plans';

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  plan: PlanTier;
  effectiveTier: PlanTier;
  downloadCredits: number;
  totalCreditsPurchased: number;
  totalDownloads: number;
  dailyUsed: number;
  dailyLimit: number;
  rechargeCount: number;
  manualGrantCount: number;
  purchaseCount: number;
  spentInr: number;
  joinDate: string;
  status: string;
};

export type ActionResult<T = undefined> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; error: string };

/** Throws unless the token belongs to an allowlisted admin. */
async function requireAdmin(idToken: string): Promise<string> {
  if (!idToken) throw new Error('Not signed in.');
  let email: string | undefined;
  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    email = decoded.email;
  } catch {
    throw new Error('Your session expired. Sign in again.');
  }
  if (!isAdminEmail(email)) throw new Error('You are not authorised to perform this action.');
  return email as string;
}

function toDateString(value: unknown): string {
  const raw = value as { toDate?: () => Date; _seconds?: number } | string | undefined;
  try {
    if (raw && typeof (raw as { toDate?: () => Date }).toDate === 'function') {
      return (raw as { toDate: () => Date }).toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    if (raw && typeof raw === 'object' && typeof raw._seconds === 'number') {
      return new Date(raw._seconds * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    if (typeof raw === 'string') {
      const parsed = new Date(raw);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      }
    }
  } catch {
    // fall through
  }
  return 'Unknown';
}

// ── Read ──────────────────────────────────────────────────────────────────────

export async function fetchAdminUsers(idToken: string): Promise<ActionResult<AdminUser[]>> {
  try {
    await requireAdmin(idToken);

    const snap = await adminDb.collection('users').get();

    const users = await Promise.all(snap.docs.map(async (doc) => {
      const data = doc.data();
      const allowance = resolveAllowance(data);

      // Subcollection counts drive the tracker, so they have to be real reads.
      const [recharges, purchases] = await Promise.all([
        doc.ref.collection('recharges').get(),
        doc.ref.collection('purchases').count().get(),
      ]);

      let manualGrantCount = 0;
      let spentInr = 0;
      recharges.forEach(r => {
        const rec = r.data();
        if (rec.source === 'manual') manualGrantCount += 1;
        else spentInr += Number(rec.amountInr) || 0;
      });

      return {
        id: doc.id,
        name: String(data.name || 'Unknown'),
        email: String(data.email || '—'),
        phone: String(data.phoneNumber || '—'),
        plan: (ASSIGNABLE_TIERS.includes(data.plan) ? data.plan : 'Free') as PlanTier,
        effectiveTier: effectiveTier(data),
        downloadCredits: allowance.credits,
        totalCreditsPurchased: Number(data.totalCreditsPurchased) || 0,
        totalDownloads: allTimeDownloads(data),
        dailyUsed: allowance.dailyUsed,
        dailyLimit: allowance.dailyLimit,
        rechargeCount: recharges.size,
        manualGrantCount,
        purchaseCount: purchases.data().count,
        spentInr,
        joinDate: toDateString(data.joinDate),
        status: String(data.status || 'Active'),
      } satisfies AdminUser;
    }));

    users.sort((a, b) => b.totalDownloads - a.totalDownloads);
    return { ok: true, data: users };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Could not load users.' };
  }
}

// ── Write ─────────────────────────────────────────────────────────────────────

/**
 * Adds (or removes, with a negative number) download credits by hand — the
 * Enterprise flow, and the way to compensate a customer.
 *
 * Recorded in the same `recharges` subcollection a paid top-up uses, tagged
 * `source: 'manual'`, so it shows up in the customer's own profile history and
 * can be told apart from real revenue in the tracker.
 */
export async function grantCreditsToUser(
  idToken: string,
  userId: string,
  credits: number,
  note: string,
): Promise<ActionResult<{ newBalance: number }>> {
  try {
    const adminEmail = await requireAdmin(idToken);

    const amount = Math.trunc(Number(credits));
    if (!Number.isFinite(amount) || amount === 0) {
      return { ok: false, error: 'Enter a non-zero number of credits.' };
    }
    if (Math.abs(amount) > 100_000) {
      return { ok: false, error: 'That is more than 100,000 credits — please split it up.' };
    }

    const userRef = adminDb.collection('users').doc(userId);
    const grantRef = userRef.collection('recharges').doc();

    const newBalance = await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(userRef);
      if (!snap.exists) throw new Error('That user no longer exists.');

      const current = Math.max(0, Number(snap.data()?.downloadCredits) || 0);
      // Never let a deduction push the balance below zero.
      const applied = amount < 0 ? -Math.min(current, -amount) : amount;
      const balance = current + applied;

      tx.set(grantRef, {
        plan: snap.data()?.plan || 'Free',
        credits: applied,
        amountInr: 0,
        source: 'manual',
        note: String(note || '').slice(0, 300),
        grantedBy: adminEmail,
        purchasedAt: FieldValue.serverTimestamp(),
      });

      tx.set(userRef, {
        downloadCredits: balance,
        ...(applied > 0 ? { totalCreditsGranted: FieldValue.increment(applied) } : {}),
        lastManualGrantAt: FieldValue.serverTimestamp(),
      }, { merge: true });

      return balance;
    });

    return { ok: true, data: { newBalance }, message: `Balance is now ${newBalance} credits.` };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Could not update credits.' };
  }
}

/** Changes a user's tier by hand — used to put someone on Enterprise. */
export async function setUserPlan(
  idToken: string,
  userId: string,
  plan: PlanTier,
): Promise<ActionResult> {
  try {
    const adminEmail = await requireAdmin(idToken);

    if (!ASSIGNABLE_TIERS.includes(plan)) {
      return { ok: false, error: `"${plan}" is not a valid plan.` };
    }

    const userRef = adminDb.collection('users').doc(userId);
    const snap = await userRef.get();
    if (!snap.exists) return { ok: false, error: 'That user no longer exists.' };

    await userRef.set({
      plan,
      planSetBy: adminEmail,
      planSetAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    return { ok: true, message: `Plan changed to ${plan}.` };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Could not change the plan.' };
  }
}

/**
 * Orders for the revenue tracker.
 *
 * Fetched through a server action rather than from the page, because the admin
 * Supabase client holds the service-role key and must never reach the browser.
 */
export async function fetchAdminOrders(idToken: string): Promise<ActionResult<Record<string, unknown>[]>> {
  try {
    await requireAdmin(idToken);
    const { getAdminClient } = await import('@/lib/supabase-admin');
    const { data, error } = await getAdminClient().from('orders').select('*');
    if (error) return { ok: false, error: error.message };
    return { ok: true, data: (data ?? []) as Record<string, unknown>[] };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Could not load orders.' };
  }
}

/** Manual credit grants across all users — feeds the tracker. */
export type ManualGrant = {
  userId: string;
  userName: string;
  userEmail: string;
  credits: number;
  note: string;
  grantedBy: string;
  grantedAt: string;
};

export async function fetchManualGrants(idToken: string): Promise<ActionResult<ManualGrant[]>> {
  try {
    await requireAdmin(idToken);

    const users = await adminDb.collection('users').get();
    const grants: ManualGrant[] = [];

    await Promise.all(users.docs.map(async (doc) => {
      const snap = await doc.ref.collection('recharges').where('source', '==', 'manual').get();
      snap.forEach(g => {
        const data = g.data();
        grants.push({
          userId: doc.id,
          userName: String(doc.data().name || 'Unknown'),
          userEmail: String(doc.data().email || '—'),
          credits: Number(data.credits) || 0,
          note: String(data.note || ''),
          grantedBy: String(data.grantedBy || '—'),
          grantedAt: toDateString(data.purchasedAt),
        });
      });
    }));

    return { ok: true, data: grants };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Could not load manual grants.' };
  }
}
