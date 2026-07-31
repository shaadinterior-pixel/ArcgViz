// ─── Razorpay Standard Checkout (browser side) ────────────────────────────────
// Loads checkout.js on demand, creates the order server-side, opens the modal and
// hands the result back to the verification endpoint. Only the publishable key id
// ever touches this file.

const CHECKOUT_SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

/**
 * Desktop browsers cannot use the UPI "intent" flow (there is no app to hand off
 * to), so Razorpay falls back to showing only a QR code — which the user cannot
 * scan from the same screen they are paying on. Asking for the `collect` flow as
 * well surfaces the "enter your UPI ID" input next to the QR.
 *
 * `show_default_blocks` keeps cards, netbanking, wallets and the rest visible.
 * Pass your own `config` to override this entirely.
 */
const DEFAULT_CHECKOUT_CONFIG = {
  display: {
    blocks: {
      upi: {
        name: 'Pay using UPI',
        instruments: [{ method: 'upi', flows: ['collect', 'qr'] }],
      },
    },
    sequence: ['block.upi'],
    preferences: { show_default_blocks: true },
  },
};

type RazorpayHandlerResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayInstance = {
  open: () => void;
  on: (event: string, handler: (response: { error?: { description?: string; reason?: string } }) => void) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

export type CheckoutResult =
  | {
      status: 'success';
      orderId: string;
      paymentId: string;
      creditsAdded?: number;
      unlockedProductIds?: string[];
      amountInr?: number;
      warning?: string;
    }
  | { status: 'dismissed' }
  | { status: 'failed'; message: string };

export type CheckoutParams = {
  /**
   * Amount in paise. Minimum 100 (₹1). Ignored when `planId` is set — recharge
   * prices are resolved server-side so they cannot be tampered with.
   */
  amount?: number;
  /** Recharge pack to buy. The server owns the price and the credits granted. */
  planId?: 'Plus' | 'Pro';
  /**
   * Products to buy. Only ids and quantities are sent — the server looks up the
   * real prices in Supabase, so the amount cannot be tampered with here.
   */
  items?: { productId: string; quantity: number }[];
  /** Labels the order in Razorpay notes and in the admin dashboard. */
  kind?: 'cart' | 'printing';
  currency?: string;
  receipt?: string;
  /** Shown as the merchant name in the modal. */
  name?: string;
  description?: string;
  prefill?: { name?: string; email?: string; contact?: string; method?: 'upi' | 'card' | 'netbanking' | 'wallet' | 'emi' };
  notes?: Record<string, string>;
  /** Razorpay `config` object. Overrides the default UPI-collect display config. */
  config?: Record<string, unknown>;
  /** Unlocks this product for the buyer once the signature is verified. */
  productId?: string;
  /** Human-readable label recorded against the order. */
  product?: string;
  /** Firebase ID token, so the purchase can be linked to the signed-in user. */
  idToken?: string;
};

let scriptPromise: Promise<void> | null = null;

export function loadRazorpayScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Razorpay checkout can only run in the browser.'));
  }
  if (window.Razorpay) return Promise.resolve();

  if (!scriptPromise) {
    scriptPromise = new Promise<void>((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(`script[src="${CHECKOUT_SCRIPT_SRC}"]`);
      const script = existing || document.createElement('script');

      script.addEventListener('load', () => resolve());
      script.addEventListener('error', () => {
        scriptPromise = null;
        reject(new Error('Could not load Razorpay checkout. Check your connection and try again.'));
      });

      if (!existing) {
        script.src = CHECKOUT_SCRIPT_SRC;
        script.async = true;
        document.body.appendChild(script);
      }
    });
  }

  return scriptPromise;
}

async function postJson(url: string, body: unknown, idToken?: string) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status}).`);
  }
  return data;
}

/**
 * Runs the full flow: create order → open modal → verify signature.
 * Never rejects on a user-facing outcome — cancels and failed payments come back
 * as a `dismissed` / `failed` result. It only throws if the order could not be created.
 */
export async function startRazorpayCheckout(params: CheckoutParams): Promise<CheckoutResult> {
  await loadRazorpayScript();

  const order = await postJson('/api/razorpay/create-order', {
    planId: params.planId,
    items: params.items,
    kind: params.kind,
    amount: params.amount,
    currency: params.currency,
    receipt: params.receipt,
    notes: params.notes,
  });

  const keyId = order.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  if (!keyId) {
    throw new Error('Razorpay key is not configured.');
  }

  return new Promise<CheckoutResult>((resolve) => {
    let settled = false;
    const settle = (result: CheckoutResult) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    const checkout = new window.Razorpay!({
      key: keyId,
      order_id: order.order_id,
      amount: order.amount,
      currency: order.currency,
      name: params.name || 'Design Walla',
      description: params.description,
      prefill: params.prefill,
      notes: params.notes,
      config: params.config ?? DEFAULT_CHECKOUT_CONFIG,
      theme: { color: '#24B86C' },
      handler: async (response: RazorpayHandlerResponse) => {
        try {
          const verification = await postJson(
            '/api/razorpay/verify-payment',
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              productId: params.productId,
              product: params.product,
            },
            params.idToken,
          );

          settle({
            status: 'success',
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            creditsAdded: verification.credits_added,
            unlockedProductIds: verification.unlocked_product_ids,
            amountInr: verification.amount_inr,
            warning: verification.warning,
          });
        } catch (error) {
          settle({
            status: 'failed',
            message: error instanceof Error ? error.message : 'We could not verify your payment.',
          });
        }
      },
      modal: {
        ondismiss: () => settle({ status: 'dismissed' }),
      },
    });

    checkout.on('payment.failed', (response) => {
      settle({
        status: 'failed',
        message: response.error?.description || 'Your payment could not be completed. Please try again.',
      });
    });

    checkout.open();
  });
}
