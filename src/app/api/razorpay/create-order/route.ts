import { NextResponse } from 'next/server';
import {
  DEFAULT_CURRENCY,
  MIN_AMOUNT_PAISE,
  getRazorpayClient,
  getRazorpayKeyId,
  razorpayErrorMessage,
  razorpayErrorStatus,
} from '@/lib/razorpay';
import { getRechargePlan } from '@/lib/plans';
import { parseOrderItems, priceOrderItems, PricingError, type PricedOrder } from '@/lib/pricing-server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));

    const currency = String(body.currency || DEFAULT_CURRENCY).toUpperCase();
    const receipt = String(body.receipt || `dw_${Date.now()}`).slice(0, 40);

    // Recharge flow: the price comes from the server-side plan table, never from
    // the client, so a caller cannot buy 700 credits for ₹1.
    const plan = body.planId ? getRechargePlan(String(body.planId)) : null;
    if (body.planId && !plan) {
      return NextResponse.json({ error: 'Unknown plan.' }, { status: 400 });
    }

    // Cart / printing flow: the client sends product ids and quantities only.
    // Prices are read from Supabase here so the amount can never be tampered with.
    const items = plan ? [] : parseOrderItems(body.items);
    let priced: PricedOrder | null = null;
    if (items.length) {
      try {
        priced = await priceOrderItems(items);
      } catch (error) {
        if (error instanceof PricingError) {
          return NextResponse.json({ error: error.message }, { status: 400 });
        }
        throw error;
      }
    }

    if (!plan && !priced) {
      return NextResponse.json(
        { error: 'Nothing to check out. Send a planId or a list of items.' },
        { status: 400 },
      );
    }

    const amount = plan ? plan.priceInr * 100 : priced!.totalPaise;

    if (!Number.isFinite(amount) || amount < MIN_AMOUNT_PAISE) {
      return NextResponse.json(
        { error: `Amount must be at least ${MIN_AMOUNT_PAISE} paise (₹1).` },
        { status: 400 },
      );
    }

    const kind = plan ? 'recharge' : String(body.kind || 'cart');

    const order = await getRazorpayClient().orders.create({
      amount,
      currency,
      receipt,
      notes: {
        ...(body.notes && typeof body.notes === 'object' ? body.notes : {}),
        kind,
        ...(plan ? { planId: plan.id, credits: String(plan.credits) } : {}),
        // Recorded server-side so fulfilment can trust which products were bought.
        ...(priced ? { productIds: priced.productIds.join(',').slice(0, 480) } : {}),
      },
    });

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: getRazorpayKeyId(),
      ...(plan ? { plan_id: plan.id, credits: plan.credits } : {}),
      ...(priced ? {
        subtotal_inr: priced.subtotalInr,
        tax_inr: priced.taxInr,
        total_inr: priced.totalInr,
        lines: priced.lines,
      } : {}),
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
