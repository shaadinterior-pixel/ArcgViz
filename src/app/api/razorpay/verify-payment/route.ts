import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAdminClient } from '@/lib/supabase-admin';
import { getRazorpayClient, verifyPaymentSignature } from '@/lib/razorpay';
import { SUPPORT_EMAIL } from '@/lib/constants';
import { getRechargePlan, type RechargePlan } from '@/lib/plans';

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

  // Amount and plan come from Razorpay's copy of the order, never from the client.
  // The planId was written into `notes` server-side when the order was created,
  // so a caller cannot claim a bigger pack than they paid for.
  let amountPaise = 0;
  let plan: RechargePlan | null = null;
  let purchasedProductIds: string[] = [];
  let orderKind = 'cart';
  try {
    const order = await getRazorpayClient().orders.fetch(orderId);
    amountPaise = Number(order.amount) || 0;
    plan = getRechargePlan(String(order.notes?.planId || ''));
    orderKind = String(order.notes?.kind || 'cart');
    purchasedProductIds = String(order.notes?.productIds || '')
      .split(',')
      .map(id => id.trim())
      .filter(Boolean);
  } catch (error) {
    warnings.push('Could not read the order details from Razorpay.');
    console.error('[razorpay] order fetch failed', error);
  }

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

  // Unlock every product in the order for the buyer. The id list comes from the
  // Razorpay order notes, which were written server-side at create time — the
  // request body cannot add products the buyer did not pay for.
  if (userId && purchasedProductIds.length) {
    try {
      const batch = adminDb.batch();
      for (const purchasedId of purchasedProductIds) {
        batch.set(
          adminDb.collection('users').doc(userId).collection('purchases').doc(purchasedId),
          {
            productId: purchasedId,
            razorpayOrderId: orderId,
            razorpayPaymentId: paymentId,
            purchasedAt: FieldValue.serverTimestamp(),
            lifetime: true,
          },
          { merge: true },
        );
      }
      await batch.commit();
    } catch (error) {
      warnings.push('Payment succeeded but unlocking the download failed. Please contact support.');
      console.error('[razorpay] failed to grant purchases', error);
    }
  } else if (purchasedProductIds.length && !userId) {
    warnings.push('Payment succeeded but no signed-in account was found to unlock the downloads. Please contact support.');
  }

  // Recharge: add download credits to the buyer's balance. Keyed on the order id
  // so replaying this request can never credit the same payment twice.
  let creditedNow = 0;
  if (userId && plan) {
    try {
      const userRef = adminDb.collection('users').doc(userId);
      const rechargeRef = userRef.collection('recharges').doc(orderId);

      await adminDb.runTransaction(async (tx) => {
        const existing = await tx.get(rechargeRef);
        if (existing.exists) return; // already credited — nothing to do

        tx.set(rechargeRef, {
          plan: plan.id,
          credits: plan.credits,
          amountInr: amountPaise / 100,
          razorpayOrderId: orderId,
          razorpayPaymentId: paymentId,
          purchasedAt: FieldValue.serverTimestamp(),
        });

        tx.set(userRef, {
          plan: plan.id,
          downloadCredits: FieldValue.increment(plan.credits),
          totalCreditsPurchased: FieldValue.increment(plan.credits),
          lastRechargeAt: FieldValue.serverTimestamp(),
        }, { merge: true });

        creditedNow = plan.credits;
      });
    } catch (error) {
      warnings.push('Payment succeeded but your download credits could not be added. Please contact support.');
      console.error('[razorpay] failed to grant credits', error);
    }
  } else if (plan && !userId) {
    warnings.push('Payment succeeded but no signed-in account was found to credit. Please contact support.');
  }

  // Record the sale so it shows up in the admin dashboard and revenue tracker.
  const orderRow: Record<string, unknown> = {
    id: orderId,
    customer: customer || 'Guest',
    email: email || SUPPORT_EMAIL,
    product: plan
      ? `${plan.name} recharge — ${plan.credits} downloads`
      : String(body.product || purchasedProductIds.join(', ') || `${orderKind} checkout`),
    amount: `₹${(amountPaise / 100).toLocaleString('en-IN')}`,
    status: 'Completed',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  };

  // Columns added by supabase_migration_orders_meta.sql. If that has not been run
  // yet the insert fails, so retry without them rather than losing the order.
  const orderMeta = {
    kind: plan ? 'recharge' : orderKind,
    amount_inr: amountPaise / 100,
    user_id: userId,
    payment_id: paymentId,
    created_at: new Date().toISOString(),
  };

  try {
    const supabaseAdmin = getAdminClient();
    const { error } = await supabaseAdmin.from('orders').upsert([{ ...orderRow, ...orderMeta }]);
    if (error) {
      console.warn('[razorpay] order meta columns missing, saving base row only:', error.message);
      const fallback = await supabaseAdmin.from('orders').upsert([orderRow]);
      if (fallback.error) throw fallback.error;
    }
  } catch (error) {
    warnings.push('Payment succeeded but the order could not be recorded.');
    console.error('[razorpay] failed to record order', error);
  }

  return NextResponse.json({
    verified: true,
    fulfilled: warnings.length === 0,
    order_id: orderId,
    payment_id: paymentId,
    ...(plan ? { plan: plan.id, credits_added: creditedNow } : {}),
    ...(purchasedProductIds.length ? { unlocked_product_ids: purchasedProductIds } : {}),
    kind: orderKind,
    amount_inr: amountPaise / 100,
    warning: warnings.length ? warnings.join(' ') : undefined,
  });
}
