"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Check, Zap, Crown, Star, Download, ArrowRight, Infinity } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getCurrentUser, getUserPlan, type PlanTier } from '@/lib/auth';

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
    downloads: 10,
    features: [
      '10 downloads per month',
      'Access to all Free tier assets',
      'Standard image quality',
      'Community support',
    ],
    cta: 'Get Started Free',
    ctaHref: '/signup',
  },
  {
    id: 'Plus' as PlanTier,
    name: 'Plus',
    price: '₹199',
    period: 'per month',
    tagline: 'For growing design teams',
    icon: Zap,
    color: '#24B86C',
    gradient: 'from-[#24B86C]/10 to-[#11998E]/5',
    border: 'border-[#24B86C]/30',
    badge: 'Most Popular',
    downloads: 50,
    features: [
      '50 downloads per month',
      'Access to Free + Plus tier assets',
      'High resolution files',
      'Priority email support',
      'Early access to new uploads',
    ],
    cta: 'Upgrade to Plus',
    ctaHref: '/signup',
  },
  {
    id: 'Pro' as PlanTier,
    name: 'Pro',
    price: '₹399',
    period: 'per month',
    tagline: 'For professional studios',
    icon: Crown,
    color: '#9333EA',
    gradient: 'from-purple-100/60 to-purple-50/30',
    border: 'border-purple-300',
    badge: 'Best Value',
    downloads: 100,
    features: [
      '100 downloads per month',
      'Access to ALL asset tiers',
      'Maximum resolution files',
      'Dedicated support',
      'Commercial license included',
      'Bulk download tool',
    ],
    cta: 'Upgrade to Pro',
    ctaHref: '/signup',
  },
];

export default function PricingPage() {
  const [userPlan, setUserPlan] = useState<PlanTier | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser().then(async (u) => {
      if (u) {
        const plan = await getUserPlan(u.uid);
        setUserPlan(plan);
      }
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAF9] pt-28 pb-24">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#24B86C]/10 border border-[#24B86C]/20 text-[#24B86C] text-sm font-bold mb-6">
            <Zap className="w-4 h-4" /> Simple, transparent pricing
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-[#111111] mb-4 leading-tight">
            Choose Your Plan
          </h1>
          <p className="text-xl text-zinc-500 font-medium max-w-xl mx-auto">
            Download premium design assets every month. Upgrade or cancel anytime.
          </p>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = userPlan === plan.id;
            const isPro = plan.id === 'Pro';

            return (
              <div
                key={plan.id}
                className={`relative bg-gradient-to-br ${plan.gradient} border-2 ${plan.border} rounded-3xl p-8 flex flex-col ${isPro ? 'shadow-[0_20px_60px_rgba(147,51,234,0.15)]' : 'shadow-[0_8px_30px_rgba(0,0,0,0.05)]'} transition-transform hover:-translate-y-1 duration-300`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-black text-white shadow-lg ${plan.id === 'Pro' ? 'bg-purple-600' : 'bg-[#24B86C]'}`}>
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
                <div className={`flex items-center gap-3 p-4 rounded-2xl mb-6 border`} style={{ backgroundColor: `${plan.color}10`, borderColor: `${plan.color}20` }}>
                  <Download className="w-5 h-5 shrink-0" style={{ color: plan.color }} />
                  <div>
                    <div className="font-black text-[#111111]">{plan.downloads} downloads/month</div>
                    <div className="text-xs text-zinc-500 font-medium">Resets on the 1st of every month</div>
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

                {/* CTA Button */}
                {isCurrentPlan ? (
                  <div className="w-full h-12 rounded-xl border-2 flex items-center justify-center font-bold text-sm text-zinc-500 bg-zinc-100 border-zinc-200">
                    ✓ Your Current Plan
                  </div>
                ) : loading ? (
                  <div className="w-full h-12 rounded-xl bg-zinc-100 animate-pulse" />
                ) : (
                  userPlan ? (
                    <a 
                      href={`https://wa.me/918969688709?text=${encodeURIComponent(`Hi Design Walla! 👋\n\nI want to upgrade my account to the ${plan.name} Plan.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full"
                    >
                      <Button
                        className="w-full h-12 rounded-xl font-bold text-sm transition-all"
                        style={{
                          backgroundColor: plan.color,
                          color: 'white',
                        }}
                      >
                        Upgrade via WhatsApp <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </a>
                  ) : (
                    <Link href={plan.ctaHref} className="w-full">
                      <Button
                        className="w-full h-12 rounded-xl font-bold text-sm transition-all"
                        style={{
                          backgroundColor: plan.color,
                          color: 'white',
                        }}
                      >
                        {plan.cta} <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  )
                )}
              </div>
            );
          })}
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
                <p className="text-zinc-400 text-sm font-medium">Lifetime access, no subscription needed</p>
              </div>
            </div>
            <p className="text-zinc-400 font-medium leading-relaxed max-w-lg">
              Some premium assets are available as one-time purchases. Pay once, download forever —
              no monthly limit applies. Your purchase is saved to your account permanently.
            </p>
            <ul className="mt-6 space-y-2">
              {['One-time payment', 'Lifetime download access', 'No monthly quota consumed', 'Transferable to any project'].map(f => (
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
