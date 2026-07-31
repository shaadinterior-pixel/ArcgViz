"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Trash2, ArrowRight, ShieldCheck, CreditCard, ChevronRight, Loader2, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCart, toOrderItems } from '@/lib/cart';
import { formatInr } from '@/lib/pricing';
import { startRazorpayCheckout } from '@/lib/razorpay-checkout';

export default function CartPage() {
  const { items, ready, remove, setQuantity, clear, totals } = useCart();
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [paySuccess, setPaySuccess] = useState<string | null>(null);

  const handleCheckout = async () => {
    setPaying(true);
    setPayError(null);
    setPaySuccess(null);

    try {
      // A purchase has to be attached to an account, otherwise there is nowhere
      // to unlock the downloads.
      const { getCurrentUser } = await import('@/lib/auth');
      const user = await getCurrentUser();
      if (!user) {
        setPayError('Please sign in before checking out, so we can attach these downloads to your account.');
        return;
      }

      const result = await startRazorpayCheckout({
        items: toOrderItems(items),
        kind: 'cart',
        description: `${items.length} item${items.length === 1 ? '' : 's'} from Design Walla`,
        prefill: { name: user.displayName || undefined, email: user.email || undefined },
        idToken: await user.getIdToken(),
      });

      if (result.status === 'success') {
        setPaySuccess(result.warning || 'Payment successful! Your downloads are unlocked — find them in your profile.');
        clear();
      } else if (result.status === 'failed') {
        setPayError(result.message);
      }
      // 'dismissed' → the user closed the modal, nothing to report.
    } catch (error) {
      setPayError(error instanceof Error ? error.message : 'Checkout could not be started.');
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 min-h-[80vh]">
      <div className="flex items-center text-sm text-foreground/50 mb-8">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-foreground">Shopping Cart</span>
      </div>

      <h1 className="text-4xl font-bold tracking-tight mb-8">Your Cart</h1>

      {paySuccess && (
        <div className="mb-8 rounded-2xl border border-green-500/30 bg-green-500/10 px-6 py-4 text-sm text-green-600 dark:text-green-400">
          {paySuccess}{' '}
          <Link href="/profile" className="font-bold underline">View your purchases</Link>
        </div>
      )}
      {payError && (
        <div className="mb-8 rounded-2xl border border-red-500/30 bg-red-500/10 px-6 py-4 text-sm text-red-500">
          {payError}
        </div>
      )}

      {!ready ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border/50 rounded-3xl bg-secondary/10"
        >
          <div className="w-24 h-24 bg-secondary/50 rounded-full flex items-center justify-center mb-6">
            <ShoppingCartIcon className="w-10 h-10 text-foreground/40" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Your cart is empty</h2>
          <p className="text-foreground/60 max-w-md mb-8">
            Looks like you haven&apos;t added any 3D assets to your cart yet. Explore our marketplace to find premium models and textures.
          </p>
          <Link href="/products">
            <Button size="lg" className="rounded-full px-8">
              Explore Marketplace
            </Button>
          </Link>
        </motion.div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Cart Items */}
          <div className="flex-1 space-y-6">
            <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-border/50 text-sm font-medium text-foreground/60">
              <div className="col-span-6">Product</div>
              <div className="col-span-3 text-center">Quantity</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-1"></div>
            </div>

            <div className="space-y-6">
              {items.map((item, index) => (
                <motion.div
                  key={item.productId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-4 md:p-0 bg-secondary/20 md:bg-transparent rounded-2xl md:rounded-none border border-border/50 md:border-none pb-0 md:pb-6 md:border-b md:border-border/20"
                >
                  <div className="col-span-1 md:col-span-6 flex items-center gap-6">
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 border border-border/50 bg-secondary/30">
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      {item.category && (
                        <div className="text-xs font-medium text-primary mb-1 uppercase tracking-wider">{item.category}</div>
                      )}
                      <Link href={`/products/${item.slug || item.productId}`}>
                        <h3 className="text-lg font-semibold mb-1 line-clamp-2 hover:text-primary transition-colors">{item.name}</h3>
                      </Link>
                      {item.author && <p className="text-sm text-foreground/60">by {item.author}</p>}
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="col-span-1 md:col-span-3 flex items-center justify-between md:justify-center gap-3 mt-4 md:mt-0">
                    <span className="md:hidden text-foreground/60 text-sm font-medium">Quantity:</span>
                    <div className="flex items-center gap-1 border border-border/50 rounded-xl p-1">
                      <button
                        onClick={() => setQuantity(item.productId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                      <button
                        onClick={() => setQuantity(item.productId, item.quantity + 1)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary/50 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="col-span-1 md:col-span-2 flex justify-between md:justify-end items-center mt-4 md:mt-0 border-t border-border/50 md:border-none pt-4 md:pt-0">
                    <span className="md:hidden text-foreground/60 text-sm font-medium">Price:</span>
                    <span className="text-xl font-bold">{item.price || '—'}</span>
                  </div>

                  <div className="col-span-1 flex justify-end absolute md:relative top-4 right-4 md:top-auto md:right-auto">
                    <button
                      onClick={() => remove(item.productId)}
                      className="p-2 text-foreground/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-[400px] shrink-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-secondary/20 border border-border/50 rounded-3xl p-8 sticky top-24"
            >
              <h3 className="text-xl font-bold mb-6 border-b border-border/50 pb-4">Order Summary</h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-foreground/80">
                  <span>Subtotal ({items.length} item{items.length === 1 ? '' : 's'})</span>
                  <span className="font-medium">{formatInr(totals.subtotalInr)}</span>
                </div>
                <div className="flex justify-between text-foreground/80">
                  <span>GST (18%)</span>
                  <span className="font-medium">{formatInr(totals.taxInr)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-2xl font-bold border-t border-border/50 pt-6 mb-2">
                <span>Total</span>
                <span className="text-primary">{formatInr(totals.totalInr)}</span>
              </div>
              <p className="text-xs text-foreground/50 mb-6">
                Final amount is confirmed by our server from live product prices before payment.
              </p>

              <Button
                onClick={handleCheckout}
                disabled={paying || totals.totalPaise < 100}
                className="w-full h-14 text-lg rounded-2xl mb-6 bg-primary hover:bg-primary/90 text-primary-foreground group"
              >
                {paying ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Opening checkout…
                  </>
                ) : (
                  <>
                    Checkout Now
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>

              <div className="space-y-4">
                <div className="flex items-center text-sm text-foreground/60 justify-center">
                  <ShieldCheck className="w-4 h-4 mr-2 text-green-500" />
                  <span>Secure checkout via Razorpay</span>
                </div>
                <div className="flex items-center justify-center gap-2 pt-4 border-t border-border/30">
                  <CreditCard className="w-6 h-6 text-foreground/40" />
                  <div className="w-8 h-5 bg-foreground/20 rounded"></div>
                  <div className="w-8 h-5 bg-foreground/20 rounded"></div>
                  <div className="w-8 h-5 bg-foreground/20 rounded"></div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}

function ShoppingCartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}
