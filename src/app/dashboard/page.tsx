"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Settings, ShoppingBag, Heart, LogOut, Download, ArrowRight, User, Zap, Crown, Star, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getCurrentUser, getUserProfile, signOut, type PlanTier, PLAN_LIMITS } from '@/lib/auth';
import { getMonthlyDownloadCount, getUserPurchasedProductIds } from '@/lib/downloads';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const PLAN_ICONS: Record<PlanTier, React.ElementType> = { Free: Star, Plus: Zap, Pro: Crown };
const PLAN_COLORS: Record<PlanTier, string> = { Free: '#6B7280', Plus: '#24B86C', Pro: '#9333EA' };

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('purchases');
  const [authUser, setAuthUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [paidPurchasedIds, setPaidPurchasedIds] = useState<string[]>([]);
  const [downloadsUsed, setDownloadsUsed] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser().then(async (u) => {
      if (!u) { router.push('/login'); return; }
      setAuthUser(u);

      const [prof, used, paidIds] = await Promise.all([
        getUserProfile(u.uid),
        getMonthlyDownloadCount(u.uid),
        getUserPurchasedProductIds(u.uid),
      ]);
      setProfile(prof);
      setDownloadsUsed(used);
      setPaidPurchasedIds(paidIds);

      // Fetch purchase history from Supabase (Paid products)
      if (paidIds.length > 0) {
        const { data } = await supabase
          .from('products')
          .select('id, name, price, thumbnail_url, slug')
          .in('id', paidIds);
        if (data) {
          setPurchases(data.map(p => ({
            id: p.id,
            item: p.name,
            price: p.price,
            image: p.thumbnail_url,
            slug: p.slug || p.id,
          })));
        }
      }

      setLoading(false);
    });
  }, [router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const userPlan = (profile?.plan || 'Free') as PlanTier;
  const downloadLimit = PLAN_LIMITS[userPlan];
  const downloadPercent = Math.min((downloadsUsed / downloadLimit) * 100, 100);
  const PlanIcon = PLAN_ICONS[userPlan];
  const planColor = PLAN_COLORS[userPlan];

  const user = {
    name: profile?.name || authUser?.displayName || 'Creative User',
    email: authUser?.email || 'Loading...',
    joinDate: profile?.joinDate?.toDate
      ? profile.joinDate.toDate().toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
      : '...',
  };

  if (loading) return (
    <div className="min-h-screen bg-[#FAFCFB] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#24B86C] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFCFB] pt-28 pb-24">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-10">

        {/* Sidebar */}
        <aside className="w-full md:w-72 shrink-0 space-y-5">
          {/* User Profile Card */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-[#E2EDE8] flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#24B86C] to-[#11998E] p-1 mb-4 shadow-lg shadow-[#24B86C]/20">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-2xl font-black text-[#111111]">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
            <h3 className="font-black text-[#111111] text-lg mb-1">{user.name}</h3>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Member since {user.joinDate}</p>

            {/* Plan Badge */}
            <div className="mt-4 flex items-center gap-2 px-4 py-2 rounded-full border-2 font-bold text-sm" style={{ color: planColor, borderColor: `${planColor}30`, backgroundColor: `${planColor}08` }}>
              <PlanIcon className="w-4 h-4" />
              {userPlan === 'Pro' ? 'Plus + Pro' : userPlan} Plan
            </div>
          </div>

          {/* Download Quota Card */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-[#E2EDE8]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#24B86C]" />
                <span className="text-sm font-bold text-[#111111]">Monthly Downloads</span>
              </div>
              <span className="text-xs font-bold text-zinc-500">{downloadsUsed}/{downloadLimit}</span>
            </div>
            <div className="w-full h-2.5 bg-zinc-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${downloadPercent}%`,
                  backgroundColor: downloadPercent > 85 ? '#EF4444' : planColor,
                }}
              />
            </div>
            <p className="text-xs text-zinc-400 font-medium mt-2">
              {downloadLimit - downloadsUsed} downloads remaining this month
            </p>
            {userPlan !== 'Pro' && (
              <Link href="/pricing" className="block mt-3">
                <Button className="w-full h-9 rounded-xl text-xs font-bold bg-[#111111] hover:bg-[#24B86C] text-white transition-all">
                  Upgrade Plan →
                </Button>
              </Link>
            )}
          </div>

          {/* Navigation */}
          <nav className="bg-white rounded-3xl p-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-[#E2EDE8] flex flex-col gap-1.5">
            <button
              onClick={() => setActiveTab('purchases')}
              className={`flex items-center space-x-3 px-5 py-3.5 rounded-2xl text-[15px] font-bold transition-all duration-300 ${activeTab === 'purchases' ? 'bg-[#F0F7F3] text-[#24B86C]' : 'hover:bg-zinc-50 text-zinc-500 hover:text-[#111111]'}`}
            >
              <ShoppingBag className="w-5 h-5" />
              <span>My Purchases</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center space-x-3 px-5 py-3.5 rounded-2xl text-[15px] font-bold transition-all duration-300 ${activeTab === 'settings' ? 'bg-[#F0F7F3] text-[#24B86C]' : 'hover:bg-zinc-50 text-zinc-500 hover:text-[#111111]'}`}
            >
              <Settings className="w-5 h-5" />
              <span>Account Settings</span>
            </button>

            <div className="h-px bg-[#E2EDE8] mx-4 my-2" />

            <button
              onClick={handleSignOut}
              className="w-full flex items-center space-x-3 px-5 py-3.5 rounded-2xl text-[15px] font-bold hover:bg-red-50 text-red-500 transition-all duration-300"
            >
              <LogOut className="w-5 h-5" />
              <span>Log out</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {activeTab === 'purchases' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-black text-[#111111]">My Purchases</h2>
              <p className="text-zinc-500 font-medium text-sm -mt-4">Paid products you own with lifetime download access.</p>

              <div className="space-y-4">
                {purchases.length === 0 ? (
                  <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-[#E2EDE8] flex flex-col items-center justify-center">
                    <ShoppingBag className="w-12 h-12 mb-6 text-zinc-300" />
                    <h3 className="text-xl font-black text-[#111111] mb-2">No paid purchases yet</h3>
                    <p className="mb-8 text-zinc-500 font-medium">Browse premium paid assets in the marketplace.</p>
                    <Link href="/products">
                      <Button className="h-12 px-6 rounded-full bg-[#111111] hover:bg-[#24B86C] text-white font-bold text-sm shadow-md transition-all group">
                        Explore Marketplace
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                ) : (
                  purchases.map(purchase => (
                    <div key={purchase.id} className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E2EDE8] hover:border-[#24B86C]/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div>
                        <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Lifetime Access</div>
                        <Link href={`/products/${purchase.slug}`} className="hover:text-[#24B86C] transition-colors">
                          <h4 className="font-black text-xl text-[#111111] leading-tight">{purchase.item}</h4>
                        </Link>
                        <div className="text-[#24B86C] font-black mt-2">{purchase.price}</div>
                      </div>
                      <div className="flex items-center shrink-0">
                        <Link href={`/products/${purchase.slug}`}>
                          <Button className="h-12 px-6 rounded-full bg-[#F0F7F3] hover:bg-[#24B86C] text-[#24B86C] hover:text-white font-bold text-sm transition-all flex items-center gap-2">
                            <Download className="w-4 h-4" /> Download Files
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-2xl">
              <h2 className="text-3xl font-black text-[#111111]">Account Settings</h2>

              <div className="bg-white rounded-3xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E2EDE8] space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#111111] uppercase tracking-widest">Display Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <input
                      type="text"
                      value={user.name}
                      readOnly
                      className="w-full h-14 pl-12 pr-4 bg-zinc-50 border border-[#E2EDE8] rounded-2xl text-[15px] font-medium text-zinc-700 focus:outline-none opacity-80 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#111111] uppercase tracking-widest">Email Address</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-zinc-400 text-lg">@</div>
                    <input
                      type="email"
                      value={user.email}
                      readOnly
                      className="w-full h-14 pl-12 pr-4 bg-zinc-50 border border-[#E2EDE8] rounded-2xl text-[15px] font-medium text-zinc-700 focus:outline-none opacity-80 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#111111] uppercase tracking-widest">Current Plan</label>
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-[#E2EDE8] bg-zinc-50">
                    <div className="flex items-center gap-3">
                      <PlanIcon className="w-5 h-5" style={{ color: planColor }} />
                      <span className="font-bold text-[#111111]">{userPlan === 'Pro' ? 'Plus + Pro' : userPlan} Plan</span>
                    </div>
                    {userPlan !== 'Pro' && (
                      <Link href="/pricing">
                        <Button className="h-9 px-4 rounded-xl text-xs font-bold bg-[#111111] hover:bg-[#24B86C] text-white transition-all">
                          Upgrade
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E2EDE8]">
                  <p className="text-xs font-medium text-zinc-400">
                    Account managed via Firebase Authentication. To change your password, use{' '}
                    <Link href="/forgot-password" className="text-[#24B86C] hover:underline font-bold">forgot password</Link>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
