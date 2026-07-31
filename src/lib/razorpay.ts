// ─── Razorpay (server-side only) ──────────────────────────────────────────────
// RAZORPAY_KEY_SECRET must never reach the browser. Only import this module from
// API routes, Server Actions or server components — never from a client component.

import crypto from 'crypto';
import Razorpay from 'razorpay';

/** Razorpay rejects orders below ₹1. */
export const MIN_AMOUNT_PAISE = 100;

export const DEFAULT_CURRENCY = 'INR';

type RazorpayConfig = {
  keyId: string;
  keySecret: string;
};

function cleanEnv(value: string | undefined): string {
  return (value || '').trim().replace(/^"|"$/g, '');
}

function getRazorpayConfig(): RazorpayConfig {
  const keyId = cleanEnv(process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID);
  const keySecret = cleanEnv(process.env.RAZORPAY_KEY_SECRET);

  const missing = [
    !keyId && 'RAZORPAY_KEY_ID',
    !keySecret && 'RAZORPAY_KEY_SECRET',
  ].filter(Boolean);

  if (missing.length) {
    throw new Error(`Razorpay is not configured. Missing: ${missing.join(', ')}`);
  }

  return { keyId, keySecret };
}

/** The publishable key id — safe to hand back to the browser. */
export function getRazorpayKeyId(): string {
  return getRazorpayConfig().keyId;
}

let _client: Razorpay | null = null;

export function getRazorpayClient(): Razorpay {
  if (!_client) {
    const { keyId, keySecret } = getRazorpayConfig();
    _client = new Razorpay({ key_id: keyId, key_secret: keySecret });
  }
  return _client;
}

/**
 * HMAC-SHA256(order_id + "|" + payment_id) keyed with RAZORPAY_KEY_SECRET,
 * compared against the signature Razorpay handed to the browser.
 * Uses a constant-time comparison so a mismatch leaks no timing information.
 */
export function verifyPaymentSignature(input: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const { keySecret } = getRazorpayConfig();

  const expected = crypto
    .createHmac('sha256', keySecret)
    .update(`${input.orderId}|${input.paymentId}`)
    .digest('hex');

  const received = input.signature.trim().toLowerCase();
  if (received.length !== expected.length) return false;

  return crypto.timingSafeEqual(Buffer.from(expected, 'utf8'), Buffer.from(received, 'utf8'));
}

/** Razorpay SDK errors carry an HTTP statusCode — surface auth failures as 401. */
export function razorpayErrorStatus(error: unknown): number {
  const statusCode = (error as { statusCode?: number })?.statusCode;
  if (statusCode === 401 || statusCode === 403) return 401;
  return 500;
}

export function razorpayErrorMessage(error: unknown): string {
  const description = (error as { error?: { description?: string } })?.error?.description;
  if (description) return description;
  if (error instanceof Error) return error.message;
  return 'Razorpay request failed.';
}
