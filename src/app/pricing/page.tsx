"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, Zap, Crown, Star, Download, ArrowRight, Infinity, Loader2, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getCurrentUser, getUserProfile, type AuthUser } from '@/lib/auth';
import { FREE_DAILY_DOWNLOADS, RECHARGE_PLANS, resolveAllowance, type PlanTier } from '@/lib/plans';
import { startRazorpayCheckout } from '@/lib/razorpay-checkout';

const plans = [
  {
    id: 'Free' as PlanTier,
    name: 'Free',
    price: '₹0',
    period: 'forever',
    tagline: 'Perfect for getting started',
    icon: Star,
    color: '#6B7280',
    gradient: 'from-zinc-100 to-zinc-50',
    border: 'border-zinc-200',
    badge: null,
    quota: `${FREE_DAILY_DOWNLOADS} downloads/day`,
    quotaSub: 'Resets every day at midnight',
    features: [
      `${FREE_DAILY_DOWNLOADS} downloads every day`,
      'Access to all Free tier assets',
      'Standard image quality',
      'Community support',
    ],
  },
  {
    id: 'Plus' as PlanTier,
    name: 'Plus',
    price: `₹${RECHARGE_PLANS.Plus.priceInr}`,
    period: 'per recharge',
    tagline: 'For growing design teams',
    icon: Zap,
    color: '#24B86C',
    gradient: 'from-[#24B86C]/10 to-[#11998E]/5',
    border: 'border-[#24B86C]/30',
    badge: 'Most Popular',
    quota: `${RECHARGE_PLANS.Plus.credits} downloads`,
    quotaSub: 'Credits never expire — use them anytime',
    features: [
      `${RECHARGE_PLANS.Plus.credits} downloads per recharge`,
      'Access to Free + Plus tier assets',
      'High resolution files',
      'Priority email support',
      'Early access to new uploads',
    ],
  },
  {
    id: 'Pro' as PlanTier,
    name: 'Pro',
    price: `₹${RECHARGE_PLANS.Pro.priceInr}`,
    period: 'per recharge',
    tagline: 'For professional studios',
    icon: Crown,
    color: '#9333EA',
    gradient: 'from-purple-100/60 to-purple-50/30',
    border: 'border-purple-300',
    badge: 'Best Value',
    quota: `${RECHARGE_PLANS.Pro.credits} downloads`,
    quotaSub: 'Double the Plus pack — credits never expire',
    features: [
      `${RECHARGE_PLANS.Pro.credits} downloads per recharge`,
      'Access to ALL asset tiers',
      'Maximum resolution files',
      'Dedicated support',
      'Commercial license included',
      'Bulk download tool',
    ],
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [payingPlan, setPayingPlan] = useState<PlanTier | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser().then(async (u) => {
      setUser(u);
      if (u) setProfile(await getUserProfile(u.uid));
      setLoading(false);
    });
  }, []);

  // Re-read the balance after a recharge so the header reflects the new credits.
  const refreshBalance = useCallback(async (u: AuthUser) => {
    setProfile(await getUserProfile(u.uid));
  }, []);

  const allowance = resolveAllowance(profile as { downloadCredits?: number; dailyDownloads?: Record<string, number> } | null);

  const handleRecharge = async (planId: 'Plus' | 'Pro') => {
    if (!user) { router.push('/login'); return; }

    setPayingPlan(planId);
    setError(null);
    setSuccess(null);

    try {
      const plan = RECHARGE_PLANS[planId];
      const idToken = await user.getIdToken();

      const result = await startRazorpayCheckout({
        planId,
        description: `${plan.name} recharge — ${plan.credits} downloads`,
        prefill: { name: user.displayName || undefined, email: user.email || undefined },
        idToken,
      });

      if (result.status === 'success') {
        const added = result.creditsAdded ?? plan.credits;
        setSuccess(result.warning || `Recharge successful! ${added} downloads added to your account.`);
        await refreshBalance(user);
      } else if (result.status === 'failed') {
        setError(result.message);
      }
      // 'dismissed' → user closed the modal, stay quiet.
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start the recharge.');
    } finally {
      setPayingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] pt-28 pb-24">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#24B86C]/10 border border-[#24B86C]/20 text-[#24B86C] text-sm font-bold mb-6">
            <Zap className="w-4 h-4" /> Pay as you go — no subscription
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-[#111111] mb-4 leading-tight">
            Recharge &amp; Download
          </h1>
          <p className="text-xl text-zinc-500 font-medium max-w-2xl mx-auto">
            Buy a download pack once. Credits never expire — when they run out, just recharge again.
            No monthly billing, no auto-renewal.
          </p>
        </div>

        {/* Current balance */}
        {user && !loading && (
          <div className="max-w-md mx-auto mb-10 bg-white border border-[#E2EDE8] rounded-2xl p-5 flex items-center gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
            <div className="w-11 h-11 rounded-2xl bg-[#24B86C]/10 flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5 text-[#24B86C]" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold uppercase tracking-widest text-zinc-400">Your balance</div>
              {allowance.credits > 0 ? (
                <div className="text-lg font-black text-[#111111]">{allowance.credits} download credits</div>
              ) : (
                <div className="text-lg font-black text-[#111111]">
                  {allowance.remaining} of {allowance.dailyLimit} free downloads left today
                </div>
              )}
            </div>
            <Link href="/profile" className="text-xs font-bold text-[#24B86C] hover:underline shrink-0">
              View details
            </Link>
          </div>
        )}

        {success && (
          <div className="max-w-2xl mx-auto mb-8 rounded-2xl border border-green-500/30 bg-green-50 px-6 py-4 text-sm font-medium text-green-700">
            {success}
          </div>
        )}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 rounded-2xl border border-red-500/30 bg-red-50 px-6 py-4 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 mt-8">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isFree = plan.id === 'Free';
            const isPro = plan.id === 'Pro';
            const isPaying = payingPlan === plan.id;

            return (
              <div
                key={plan.id}
                className={`relative bg-gradient-to-br ${plan.gradient} border-2 ${plan.border} rounded-3xl p-8 flex flex-col ${isPro ? 'shadow-[0_20px_60px_rgba(147,51,234,0.15)]' : 'shadow-[0_8px_30px_rgba(0,0,0,0.05)]'} transition-transform hover:-translate-y-1 duration-300`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-black text-white shadow-lg ${isPro ? 'bg-purple-600' : 'bg-[#24B86C]'}`}>
                    {plan.badge}
                  </div>
                )}

                {/* Icon + Name */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${plan.color}18` }}>
                    <Icon className="w-5 h-5" style={{ color: plan.color }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[#111111]">{plan.name}</h3>
                    <p className="text-xs text-zinc-500 font-medium">{plan.tagline}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-end gap-1">
                    <span className="text-5xl font-black text-[#111111]">{plan.price}</span>
                    <span className="text-zinc-500 font-semibold mb-1.5">/{plan.period}</span>
                  </div>
                </div>

                {/* Downloads highlight */}
                <div className="flex items-center gap-3 p-4 rounded-2xl mb-6 border" style={{ backgroundColor: `${plan.color}10`, borderColor: `${plan.color}20` }}>
                  <Download className="w-5 h-5 shrink-0" style={{ color: plan.color }} />
                  <div>
                    <div className="font-black text-[#111111]">{plan.quota}</div>
                    <div className="text-xs text-zinc-500 font-medium">{plan.quotaSub}</div>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${plan.color}15` }}>
                        <Check className="w-3 h-3" style={{ color: plan.color }} />
                      </div>
                      <span className="text-sm font-medium text-zinc-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {loading ? (
                  <div className="w-full h-12 rounded-xl bg-zinc-100 animate-pulse" />
                ) : isFree ? (
                  user ? (
                    <div className="w-full h-12 rounded-xl border-2 flex items-center justify-center font-bold text-sm text-zinc-500 bg-zinc-100 border-zinc-200">
                      ✓ Always included
                    </div>
                  ) : (
                    <Link href="/signup" className="w-full">
                      <Button className="w-full h-12 rounded-xl font-bold text-sm" style={{ backgroundColor: plan.color, color: 'white' }}>
                        Get Started Free <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  )
                ) : (
                  <Button
                    onClick={() => handleRecharge(plan.id as 'Plus' | 'Pro')}
                    disabled={payingPlan !== null}
                    className="w-full h-12 rounded-xl font-bold text-sm transition-all"
                    style={{ backgroundColor: plan.color, color: 'white' }}
                  >
                    {isPaying ? (
                      <><Loader2 className="mr-2 w-4 h-4 animate-spin" /> Opening checkout…</>
                    ) : user ? (
                      <>Recharge {plan.price} <ArrowRight className="ml-2 w-4 h-4" /></>
                    ) : (
                      <>Sign in to recharge <ArrowRight className="ml-2 w-4 h-4" /></>
                    )}
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {/* How recharging works */}
        <div className="bg-white border border-[#E2EDE8] rounded-3xl p-8 mb-16 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <h2 className="text-2xl font-black text-[#111111] mb-6 text-center">How recharging works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '1', title: 'Pick a pack', body: `Plus gives you ${RECHARGE_PLANS.Plus.credits} downloads for ₹${RECHARGE_PLANS.Plus.priceInr}. Pro doubles it to ${RECHARGE_PLANS.Pro.credits} for ₹${RECHARGE_PLANS.Pro.priceInr}.` },
              { step: '2', title: 'Pay securely', body: 'Pay with UPI, card or netbanking through Razorpay. Credits land in your account instantly.' },
              { step: '3', title: 'Recharge again', body: 'Credits never expire. When the balance hits zero you drop back to the free daily allowance — top up whenever you like.' },
            ].map(s => (
              <div key={s.step} className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-2xl bg-[#24B86C] text-white font-black flex items-center justify-center mb-3">{s.step}</div>
                <h3 className="font-black text-[#111111] mb-2">{s.title}</h3>
                <p className="text-sm text-zinc-500 font-medium leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Paid Products Section */}
        <div className="bg-gradient-to-r from-[#111111] to-[#1A2A1F] rounded-3xl p-10 text-white flex flex-col md:flex-row items-center gap-8 shadow-2xl">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                <Infinity className="w-6 h-6 text-[#24B86C]" />
              </div>
              <div>
                <h2 className="text-2xl font-black">Paid Products</h2>
                <p className="text-zinc-400 text-sm font-medium">Lifetime access, bought individually</p>
              </div>
            </div>
            <p className="text-zinc-400 font-medium leading-relaxed max-w-lg">
              Some premium assets are sold on their own. Pay once, download forever —
              they never consume your download credits.
            </p>
            <ul className="mt-6 space-y-2">
              {['One-time payment', 'Lifetime download access', 'No credits consumed', 'Transferable to any project'].map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-zinc-300 font-medium">
                  <Check className="w-4 h-4 text-[#24B86C] shrink-0" /> {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="shrink-0">
            <Link href="/products">
              <Button className="h-14 px-8 bg-[#24B86C] hover:bg-[#1DA05D] text-white font-bold rounded-2xl text-base shadow-lg shadow-[#24B86C]/30 transition-all hover:-translate-y-0.5">
                Browse Paid Assets <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 text-center">
          <p className="text-zinc-500 font-medium">
            Questions?{' '}
            <a
              href="https://wa.me/918969688709?text=Hi+Design+Walla!+I+have+a+question+about+pricing."
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#24B86C] font-bold hover:underline"
            >
              Chat with us on WhatsApp
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
