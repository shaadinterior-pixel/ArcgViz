// ─── Firestore Download Tracking ─────────────────────────────────────────────
// Tracks monthly download counts and lifetime purchases for 'Paid' products.

import {
  doc, getDoc, setDoc, updateDoc, collection,
  addDoc, serverTimestamp, increment,
} from 'firebase/firestore';
import { db } from './firebase';
import { PLAN_LIMITS, type PlanTier } from './firebase-auth';

// Current YYYY-MM key for grouping monthly downloads
function monthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// ── Get how many downloads user has used this month ───────────────────────────
export async function getMonthlyDownloadCount(userId: string): Promise<number> {
  const snap = await getDoc(doc(db, 'users', userId));
  if (!snap.exists()) return 0;
  const data = snap.data();
  return (data.monthlyDownloads?.[monthKey()] || 0) as number;
}

// ── Check if user has purchased a specific 'Paid' product ────────────────────
export async function hasPurchasedProduct(userId: string, productId: string): Promise<boolean> {
  const snap = await getDoc(doc(db, 'users', userId, 'purchases', productId));
  return snap.exists();
}

// ── Grant lifetime purchase access (admin action or payment) ─────────────────
export async function grantLifetimePurchase(userId: string, productId: string): Promise<void> {
  await setDoc(doc(db, 'users', userId, 'purchases', productId), {
    productId,
    purchasedAt: serverTimestamp(),
    lifetime: true,
  });
}

// ── Main check: can this user download this product? ─────────────────────────
export async function canUserDownload(
  userId: string,
  productId: string,
  productPlan: string  // 'Free' | 'Pro' | 'Paid'
): Promise<{ allowed: boolean; reason?: string }> {
  const userSnap = await getDoc(doc(db, 'users', userId));
  if (!userSnap.exists()) return { allowed: false, reason: 'User not found' };

  const userData = userSnap.data();
  const userPlan = (userData.plan || 'Free') as PlanTier;

  // PAID products: must have purchased individually
  if (productPlan === 'Paid') {
    const purchased = await hasPurchasedProduct(userId, productId);
    if (!purchased) return { allowed: false, reason: 'Purchase required for this product' };
    return { allowed: true };
  }

  // PRO product: user needs Plus or Pro plan
  if (productPlan === 'Pro') {
    if (userPlan === 'Free') {
      const freeProRem = userData.freeProDownloadsRemaining || 0;
      if (freeProRem > 0) {
        // They have free pro downloads from phone verification
        return { allowed: true, reason: 'FREE_PRO_BYPASS' };
      }
      return { allowed: false, reason: 'Plus + Pro plan required' };
    }
  }

  // FREE product: available to everyone with a download quota

  // Check monthly quota
  const used = userData.monthlyDownloads?.[monthKey()] || 0;
  const limit = PLAN_LIMITS[userPlan];
  if (used >= limit) {
    return {
      allowed: false,
      reason: `Monthly download limit reached (${used}/${limit}). Upgrade your plan for more downloads.`,
    };
  }

  return { allowed: true };
}

// ── Record a download (increment counter + log) ───────────────────────────────
export async function recordDownload(userId: string, productId: string, bypassReason?: string): Promise<void> {
  const key = monthKey();
  const userRef = doc(db, 'users', userId);

  if (bypassReason === 'FREE_PRO_BYPASS') {
    // If they used a free pro download, decrement that counter INSTEAD of monthly quota
    await updateDoc(userRef, {
      freeProDownloadsRemaining: increment(-1)
    }).catch(() => {});
  } else {
    // Increment the standard monthly counter
    await updateDoc(userRef, {
      [`monthlyDownloads.${key}`]: increment(1),
    }).catch(async () => {
      // If doc doesn't exist yet, create it
      await setDoc(userRef, { monthlyDownloads: { [key]: 1 } }, { merge: true });
    });
  }

  // Log the download event
  await addDoc(collection(db, 'users', userId, 'downloadLogs'), {
    productId,
    downloadedAt: serverTimestamp(),
    month: key,
  });
}

// ── Get user's list of purchased product IDs ──────────────────────────────────
export async function getUserPurchasedProductIds(userId: string): Promise<string[]> {
  const { getDocs } = await import('firebase/firestore');
  const snaps = await getDocs(collection(db, 'users', userId, 'purchases'));
  return snaps.docs.map(d => d.id);
}
