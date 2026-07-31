import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAdminClient } from '@/lib/supabase-admin';
import { getRazorpayClient, verifyPaymentSignature } from '@/lib/razorpay';
import { SUPPORT_EMAIL } from '@/lib/constants';

export const runtime = 'nodejs';

// ── Firebase Admin (server-side) ────────────────────────────────────────────
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

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  const orderId   = String(body.razorpay_order_id   || '').trim();
  const paymentId = String(body.razorpay_payment_id || '').trim();
  const signature = String(body.razorpay_signature  || '').trim();

  const missing = [
    !orderId   && 'razorpay_order_id',
    !paymentId && 'razorpay_payment_id',
    !signature && 'razorpay_signature',
  ].filter(Boolean);

  if (missing.length) {
    return NextResponse.json(
      { verified: false, error: `Missing required fields: ${missing.join(', ')}` },
      { status: 400 },
    );
  }

  // ── 1. Signature check — the only thing that proves the payment is genuine ──
  let verified: boolean;
  try {
    verified = verifyPaymentSignature({ orderId, paymentId, signature });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Verification failed.';
    return NextResponse.json({ verified: false, error: message }, { status: 500 });
  }

  if (!verified) {
    // Do NOT mark anything as paid.
    console.warn(`[razorpay] signature mismatch for order ${orderId} / payment ${paymentId}`);
    return NextResponse.json(
      { verified: false, error: 'Payment signature verification failed.' },
      { status: 400 },
    );
  }

  // ── 2. Fulfilment — best effort, never invalidates a verified payment ──────
  const warnings: string[] = [];

  // Amount comes from Razorpay, never from the client.
  let amountPaise = 0;
  try {
    const order = await getRazorpayClient().orders.fetch(orderId);
    amountPaise = Number(order.amount) || 0;
  } catch (error) {
    warnings.push('Could not read the order amount from Razorpay.');
    console.error('[razorpay] order fetch failed', error);
  }

  // Optional: unlock the product for the signed-in buyer (mirrors /api/download).
  const productId = String(body.productId || '').trim();
  const idToken = request.headers.get('authorization')?.replace('Bearer ', '').trim();

  let userId: string | null = null;
  let email = String(body.email || '').trim();
  let customer = String(body.customer || '').trim();

  if (idToken) {
    try {
      const decoded = await adminAuth.verifyIdToken(idToken);
      userId = decoded.uid;
      email = email || decoded.email || '';
      customer = customer || decoded.name || email.split('@')[0] || 'Customer';
    } catch {
      warnings.push('Your session expired, so the purchase was not linked to your account.');
    }
  }

  if (userId && productId) {
    try {
      await adminDb
        .collection('users').doc(userId)
        .collection('purchases').doc(productId)
        .set({
          productId,
          razorpayOrderId: orderId,
          razorpayPaymentId: paymentId,
          amount: amountPaise,
          purchasedAt: FieldValue.serverTimestamp(),
        }, { merge: true });
    } catch (error) {
      warnings.push('Payment succeeded but unlocking the download failed. Please contact support.');
      console.error('[razorpay] failed to grant purchase', error);
    }
  }

  // Record the sale so it shows up in the admin dashboard.
  try {
    await getAdminClient().from('orders').upsert([{
      id: orderId,
      customer: customer || 'Guest',
      email: email || SUPPORT_EMAIL,
      product: String(body.product || productId || 'Cart checkout'),
      amount: `₹${(amountPaise / 100).toLocaleString('en-IN')}`,
      status: 'Completed',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    }]);
  } catch (error) {
    warnings.push('Payment succeeded but the order could not be recorded.');
    console.error('[razorpay] failed to record order', error);
  }

  return NextResponse.json({
    verified: true,
    fulfilled: warnings.length === 0,
    order_id: orderId,
    payment_id: paymentId,
    warning: warnings.length ? warnings.join(' ') : undefined,
  });
}
