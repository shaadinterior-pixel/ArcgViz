import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { createR2SignedDownloadUrl, extractR2ObjectKey } from '@/lib/storage/r2';
import { dayKey, resolveAllowance, effectiveTier } from '@/lib/plans';

export const runtime = 'nodejs';

/** Thrown inside the quota transaction to reject a download with a 403. */
class QuotaError extends Error {}

// ── Firebase Admin (server-side) ────────────────────────────────────────────
// Initialize Firebase Admin only once
if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId:   process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey:  process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}
const adminAuth = getAuth();
const adminDb   = getFirestore();

// ── Supabase Admin (server-side for product data) ───────────────────────────
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;

  // ── 1. Verify Firebase ID token ───────────────────────────────────────────
  const authHeader = request.headers.get('authorization');
  const idToken = authHeader?.replace('Bearer ', '').trim();

  if (!idToken) {
    return NextResponse.json(
      { error: 'Authentication required. Please sign in to download.' },
      { status: 401 }
    );
  }

  let userId: string;
  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    userId = decoded.uid;
  } catch {
    return NextResponse.json(
      { error: 'Invalid or expired session. Please sign in again.' },
      { status: 401 }
    );
  }

  // ── 2. Fetch product from Supabase ────────────────────────────────────────
  const { data: product, error: productError } = await supabaseAdmin
    .from('products')
    .select('download_url, name, status, plan')
    .eq('id', productId)
    .single();

  if (productError || !product) {
    return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
  }
  if (product.status !== 'Active') {
    return NextResponse.json({ error: 'This product is currently unavailable.' }, { status: 410 });
  }
  if (!product.download_url) {
    return NextResponse.json({ error: 'Download file not attached. Contact support.' }, { status: 404 });
  }

  const productPlan = String(product.plan || 'Free');

  // ── 3. Check access in Firestore ──────────────────────────────────────────
  const userRef = adminDb.collection('users').doc(userId);
  const userSnap = await userRef.get();

  if (!userSnap.exists) {
    try {
      const authUser = await adminAuth.getUser(userId);
      await userRef.set({
        name: authUser.displayName || authUser.email?.split('@')[0] || 'User',
        email: authUser.email,
        plan: 'Free',
        joinDate: FieldValue.serverTimestamp(),
        downloadCredits: 0,
        totalCreditsPurchased: 0,
        totalDownloads: 0,
        dailyDownloads: {},
      });
    } catch {
      return NextResponse.json({ error: 'Failed to create missing user profile.' }, { status: 500 });
    }
  }

  const today = dayKey();
  let spentFrom: 'credits' | 'daily' | 'free-pro' = 'daily';

  // PAID product: check individual purchase in Firestore
  if (/^paid$/i.test(productPlan)) {
    const purchaseSnap = await adminDb
      .collection('users').doc(userId)
      .collection('purchases').doc(productId)
      .get();

    if (!purchaseSnap.exists) {
      return NextResponse.json(
        { error: 'Purchase required. You have not purchased this product.' },
        { status: 403 }
      );
    }
    // Paid products are owned outright — they never consume credits.
  } else {
    // Check the balance and spend from it in one transaction, so parallel
    // download requests can't push the user past their allowance.
    try {
      await adminDb.runTransaction(async (tx) => {
        const snap = await tx.get(userRef);
        const data = snap.data() || {};

        // PRO tier assets need an active recharge, or a free-pro bypass.
        if (/^pro$/i.test(productPlan) && effectiveTier(data) === 'Free') {
          const freeProRem = Number(data.freeProDownloadsRemaining || 0);
          if (freeProRem <= 0) {
            throw new QuotaError('This asset requires an active Plus or Pro recharge.');
          }
          spentFrom = 'free-pro';
          tx.update(userRef, {
            freeProDownloadsRemaining: FieldValue.increment(-1),
            totalDownloads: FieldValue.increment(1),
          });
          return;
        }

        const allowance = resolveAllowance(data, today);
        if (!allowance.allowed) {
          throw new QuotaError(
            `Daily free limit reached (${allowance.dailyUsed}/${allowance.dailyLimit}). Recharge for more downloads or try again tomorrow.`,
          );
        }

        spentFrom = allowance.source;
        tx.update(userRef, {
          ...(allowance.source === 'credits'
            ? { downloadCredits: FieldValue.increment(-1) }
            : { [`dailyDownloads.${today}`]: FieldValue.increment(1) }),
          totalDownloads: FieldValue.increment(1),
        });
      });
    } catch (error) {
      if (error instanceof QuotaError) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
      console.error('[download] quota transaction failed', error);
      return NextResponse.json({ error: 'Could not verify your download allowance.' }, { status: 500 });
    }
  }

  // Log download event
  await adminDb.collection('users').doc(userId).collection('downloadLogs').add({
    productId,
    productName: product.name,
    downloadedAt: FieldValue.serverTimestamp(),
    day: today,
    source: spentFrom,
  });

  // ── 4. Redirect to download URL ───────────────────────────────────────────
  const r2ObjectKey = extractR2ObjectKey(product.download_url);
  const finalDownloadUrl = r2ObjectKey
    ? await createR2SignedDownloadUrl(r2ObjectKey)
    : product.download_url;

  return NextResponse.redirect(finalDownloadUrl, { status: 302 });
}
