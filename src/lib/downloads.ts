// ─── Firestore Download Tracking ─────────────────────────────────────────────
// Consumer data lives in Firebase. Tracks the download credit balance, the free
// daily allowance, recharge history and lifetime purchases for 'Paid' products.
//
// Recharge model: paid credits are spent first and never expire. Once the balance
// is empty the user falls back to FREE_DAILY_DOWNLOADS per day.

import {
  doc, getDoc, setDoc, updateDoc, collection,
  addDoc, getDocs, query, orderBy, serverTimestamp, increment,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  dayKey, resolveAllowance, effectiveTier,
  type DownloadAllowance, type PlanTier,
} from './plans';

export type RechargeRecord = {
  id: string;
  plan: PlanTier;
  credits: number;
  amountInr: number;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  purchasedAt?: { toDate: () => Date };
};

// ── Current download allowance (credits, else free daily) ─────────────────────
export async function getDownloadAllowance(userId: string): Promise<DownloadAllowance> {
  const snap = await getDoc(doc(db, 'users', userId));
  return resolveAllowance(snap.exists() ? snap.data() : null);
}

// ── How many downloads the user has taken today (free allowance only) ─────────
export async function getDailyDownloadCount(userId: string): Promise<number> {
  const snap = await getDoc(doc(db, 'users', userId));
  if (!snap.exists()) return 0;
  return (snap.data().dailyDownloads?.[dayKey()] || 0) as number;
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
  }, { merge: true });
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

  // PAID products: must have purchased individually. These never consume credits.
  if (productPlan === 'Paid') {
    const purchased = await hasPurchasedProduct(userId, productId);
    if (!purchased) return { allowed: false, reason: 'Purchase required for this product' };
    return { allowed: true };
  }

  // PRO tier assets: need an active recharge (credits remaining) or a free-pro bypass.
  if (productPlan === 'Pro' && effectiveTier(userData) === 'Free') {
    const freeProRem = userData.freeProDownloadsRemaining || 0;
    if (freeProRem > 0) return { allowed: true, reason: 'FREE_PRO_BYPASS' };
    return { allowed: false, reason: 'Recharge a Plus or Pro pack to download this asset.' };
  }

  const allowance = resolveAllowance(userData);
  if (!allowance.allowed) {
    return {
      allowed: false,
      reason: `Daily free limit reached (${allowance.dailyUsed}/${allowance.dailyLimit}). Recharge for more downloads or try again tomorrow.`,
    };
  }

  return { allowed: true };
}

// ── Record a download (spend a credit or a daily slot + log it) ───────────────
export async function recordDownload(userId: string, productId: string, bypassReason?: string): Promise<void> {
  const userRef = doc(db, 'users', userId);
  const today = dayKey();

  let source: DownloadAllowance['source'] | 'free-pro' = 'daily';

  if (bypassReason === 'FREE_PRO_BYPASS') {
    source = 'free-pro';
    await updateDoc(userRef, { freeProDownloadsRemaining: increment(-1) }).catch(() => {});
  } else {
    const snap = await getDoc(userRef);
    const allowance = resolveAllowance(snap.exists() ? snap.data() : null, today);
    source = allowance.source;

    const delta = allowance.source === 'credits'
      ? { downloadCredits: increment(-1) }
      : { [`dailyDownloads.${today}`]: increment(1) };

    await updateDoc(userRef, { ...delta, totalDownloads: increment(1) }).catch(async () => {
      await setDoc(userRef, {
        ...(allowance.source === 'credits' ? {} : { dailyDownloads: { [today]: 1 } }),
        totalDownloads: 1,
      }, { merge: true });
    });
  }

  await addDoc(collection(db, 'users', userId, 'downloadLogs'), {
    productId,
    downloadedAt: serverTimestamp(),
    day: today,
    source,
  });
}

// ── Get user's list of purchased product IDs ──────────────────────────────────
export async function getUserPurchasedProductIds(userId: string): Promise<string[]> {
  const snaps = await getDocs(collection(db, 'users', userId, 'purchases'));
  return snaps.docs.map(d => d.id);
}

// ── Recharge history (newest first) ───────────────────────────────────────────
export async function getRechargeHistory(userId: string): Promise<RechargeRecord[]> {
  try {
    const q = query(collection(db, 'users', userId, 'recharges'), orderBy('purchasedAt', 'desc'));
    const snaps = await getDocs(q);
    return snaps.docs.map(d => ({ id: d.id, ...d.data() })) as RechargeRecord[];
  } catch {
    // Index may not exist yet on a fresh project — fall back to an unordered read.
    const snaps = await getDocs(collection(db, 'users', userId, 'recharges'));
    return snaps.docs.map(d => ({ id: d.id, ...d.data() })) as RechargeRecord[];
  }
}
