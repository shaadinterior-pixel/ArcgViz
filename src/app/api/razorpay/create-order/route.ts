import { NextResponse } from 'next/server';
import {
  DEFAULT_CURRENCY,
  MIN_AMOUNT_PAISE,
  getRazorpayClient,
  getRazorpayKeyId,
  razorpayErrorMessage,
  razorpayErrorStatus,
} from '@/lib/razorpay';

export const runtime = 'nodejs';

// NOTE: the amount is taken from the request body, which means a caller can ask
// for any price. That is fine for the current mock cart, but before taking real
// money the amount must be recomputed server-side from the `products` table
// (see fetchProductById in @/lib/store) rather than trusted from the client.
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));

    const amount = Math.round(Number(body.amount ?? 0));
    const currency = String(body.currency || DEFAULT_CURRENCY).toUpperCase();
    const receipt = String(body.receipt || `dw_${Date.now()}`).slice(0, 40);

    if (!Number.isFinite(amount) || amount < MIN_AMOUNT_PAISE) {
      return NextResponse.json(
        { error: `Amount must be at least ${MIN_AMOUNT_PAISE} paise (₹1).` },
        { status: 400 },
      );
    }

    const order = await getRazorpayClient().orders.create({
      amount,
      currency,
      receipt,
      notes: body.notes && typeof body.notes === 'object' ? body.notes : undefined,
    });

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: getRazorpayKeyId(),
    });
  } catch (error) {
    const message = razorpayErrorMessage(error);
    const isConfigError = message.includes('not configured');
    return NextResponse.json(
      { error: isConfigError ? message : `Could not start checkout. ${message}` },
      { status: isConfigError ? 500 : razorpayErrorStatus(error) },
    );
  }
}
