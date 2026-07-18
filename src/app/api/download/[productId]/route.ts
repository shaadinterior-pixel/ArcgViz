import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { createR2SignedDownloadUrl, extractR2ObjectKey } from '@/lib/storage/r2';

export const runtime = 'nodejs';

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

// Monthly key helper
function monthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

const PLAN_LIMITS: Record<string, number> = { Free: 10, Plus: 50, Pro: 100 };

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

  let userData = userSnap.data();
  if (!userSnap.exists) {
    try {
      const authUser = await adminAuth.getUser(userId);
      userData = {
        name: authUser.displayName || authUser.email?.split('@')[0] || 'User',
        email: authUser.email,
        plan: 'Free',
        joinDate: FieldValue.serverTimestamp(),
        monthlyDownloads: {}
      };
      await userRef.set(userData);
    } catch (e) {
      return NextResponse.json({ error: 'Failed to create missing user profile.' }, { status: 500 });
    }
  }

  const userPlan = String(userData?.plan || 'Free');
  const key = monthKey();

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
    // Paid products don't consume monthly quota → go straight to download
  } else {
    let bypassMonthlyQuota = false;
    // PRO/PLUS product: check user plan tier
    if (/^pro$/i.test(productPlan) && userPlan === 'Free') {
      const freeProRem = (userData?.freeProDownloadsRemaining || 0) as number;
      if (freeProRem > 0) {
        // User has free pro downloads remaining, allow and decrement
        await userRef.update({
          freeProDownloadsRemaining: FieldValue.increment(-1),
        });
        bypassMonthlyQuota = true;
      } else {
        return NextResponse.json(
          { error: 'This asset requires a Plus + Pro plan. Upgrade to download.' },
          { status: 403 }
        );
      }
    }

    if (!bypassMonthlyQuota) {
      // Check monthly download quota
      const used = (userData?.monthlyDownloads?.[key] || 0) as number;
      const limit = PLAN_LIMITS[userPlan] ?? 10;

      if (used >= limit) {
        return NextResponse.json(
          { error: `Monthly download limit reached (${used}/${limit}). Upgrade your plan for more downloads.` },
          { status: 403 }
        );
      }

      // Increment monthly counter
      await userRef.update({
        [`monthlyDownloads.${key}`]: FieldValue.increment(1),
      });
    }
  }

  // Log download event
  await adminDb.collection('users').doc(userId).collection('downloadLogs').add({
    productId,
    productName: product.name,
    downloadedAt: FieldValue.serverTimestamp(),
    month: key,
  });

  // ── 4. Redirect to download URL ───────────────────────────────────────────
  const r2ObjectKey = extractR2ObjectKey(product.download_url);
  const finalDownloadUrl = r2ObjectKey
    ? await createR2SignedDownloadUrl(r2ObjectKey)
    : product.download_url;

  return NextResponse.redirect(finalDownloadUrl, { status: 302 });
}
