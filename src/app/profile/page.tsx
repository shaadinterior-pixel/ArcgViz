"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User, Mail, Calendar, Shield, Download, ShoppingBag,
  LogOut, Settings, TrendingUp, Star, Zap, Crown,
  Edit3, Check, X, Camera, ArrowRight, Infinity, Package
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getCurrentUser, getUserProfile, signOut, type PlanTier, PLAN_LIMITS } from '@/lib/auth';
import { getMonthlyDownloadCount, getUserPurchasedProductIds } from '@/lib/downloads';
import { supabase } from '@/lib/supabase';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

const PLAN_CONFIG = {
  Free:  { icon: Star,  color: '#6B7280', bg: 'bg-zinc-100',    label: 'Free',        gradient: 'from-zinc-400 to-zinc-600' },
  Plus:  { icon: Zap,   color: '#24B86C', bg: 'bg-green-50',   label: 'Plus',         gradient: 'from-[#24B86C] to-[#11998E]' },
  Pro:   { icon: Crown, color: '#9333EA', bg: 'bg-purple-50',  label: 'Plus + Pro',   gradient: 'from-purple-500 to-purple-700' },
};

export default function ProfilePage() {
  const router = useRouter();
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloadsUsed, setDownloadsUsed] = useState(0);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getCurrentUser().then(async (u) => {
      if (!u) { router.push('/login'); return; }
      setFirebaseUser(u);

      const [prof, used, paidIds] = await Promise.all([
        getUserProfile(u.uid),
        getMonthlyDownloadCount(u.uid),
        getUserPurchasedProductIds(u.uid),
      ]);
      setProfile(prof);
      setDownloadsUsed(used);
      setNewName(prof?.name || u.displayName || '');

      if (paidIds.length > 0) {
        const { data } = await supabase
          .from('products')
          .select('id, name, price, thumbnail_url, slug, category')
          .in('id', paidIds);
        if (data) setPurchases(data);
      }
      setLoading(false);
    });
  }, [router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleSaveName = async () => {
    if (!newName.trim() || !firebaseUser) return;
    setSavingName(true);
    try {
      await updateProfile(auth.currentUser!, { displayName: newName.trim() });
      await updateDoc(doc(db, 'users', firebaseUser.uid), { name: newName.trim() });
      setProfile((p: any) => ({ ...p, name: newName.trim() }));
      setEditingName(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingName(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F8FAF9] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#24B86C] border-t-transparent rounded-full animate-spin" />
        <p className="text-zinc-500 font-medium text-sm">Loading your profile...</p>
      </div>
    </div>
  );

  const userPlan = (profile?.plan || 'Free') as PlanTier;
  const planCfg = PLAN_CONFIG[userPlan];
  const PlanIcon = planCfg.icon;
  const downloadLimit = PLAN_LIMITS[userPlan];
  const downloadPercent = Math.min((downloadsUsed / downloadLimit) * 100, 100);
  const displayName = profile?.name || firebaseUser?.displayName || 'Creative User';
  const email = firebaseUser?.email || '';
  const initials = displayName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
  const joinDate = profile?.joinDate?.toDate
    ? profile.joinDate.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Member';

  return (
    <div className="min-h-screen bg-[#F8FAF9] pb-24">

      {/* Hero Banner */}
      <div className={`w-full h-52 bg-gradient-to-br ${planCfg.gradient} relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Profile Card — overlapping the banner */}
        <div className="relative -mt-20 mb-8">
          <div className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-[#E2EDE8] p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">

              {/* Avatar */}
              <div className="relative shrink-0">
                <div className={`w-28 h-28 rounded-2xl bg-gradient-to-br ${planCfg.gradient} flex items-center justify-center text-white text-4xl font-black shadow-xl border-4 border-white`}>
                  {initials}
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl flex items-center justify-center shadow-md border-2 border-white" style={{ backgroundColor: planCfg.color }}>
                  <PlanIcon className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* Name + Email */}
              <div className="flex-1 pb-1">
                <div className="flex items-center gap-3 mb-1">
                  {editingName ? (
                    <div className="flex items-center gap-2">
                      <input
                        ref={nameInputRef}
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false); }}
                        className="text-2xl font-black text-[#111111] bg-zinc-50 border-2 border-[#24B86C] rounded-xl px-3 py-1 outline-none w-56"
                        autoFocus
                      />
                      <button onClick={handleSaveName} disabled={savingName} className="w-8 h-8 bg-[#24B86C] rounded-lg flex items-center justify-center text-white hover:bg-[#1DA05D] transition-colors">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => { setEditingName(false); setNewName(profile?.name || ''); }} className="w-8 h-8 bg-zinc-200 rounded-lg flex items-center justify-center text-zinc-600 hover:bg-zinc-300 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-2xl sm:text-3xl font-black text-[#111111]">{displayName}</h1>
                      <button onClick={() => { setEditingName(true); setTimeout(() => nameInputRef.current?.focus(), 50); }} className="w-7 h-7 rounded-lg bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors group">
                        <Edit3 className="w-3.5 h-3.5 text-zinc-500 group-hover:text-[#111111]" />
                      </button>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2 text-zinc-500 text-sm font-medium mb-3">
                  <Mail className="w-4 h-4" />
                  {email}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black border-2" style={{ color: planCfg.color, borderColor: `${planCfg.color}30`, backgroundColor: `${planCfg.color}08` }}>
                    <PlanIcon className="w-3.5 h-3.5" />
                    {planCfg.label} Plan
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-500 border border-zinc-200">
                    <Calendar className="w-3.5 h-3.5" />
                    Joined {joinDate}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 shrink-0">

                <Button onClick={handleSignOut} variant="outline" className="h-10 px-4 rounded-xl border-red-200 text-sm font-bold text-red-500 hover:bg-red-50 hover:border-red-300 transition-all">
                  <LogOut className="w-4 h-4 mr-2" /> Sign out
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Download, label: 'Downloads Used', value: `${downloadsUsed}`, sub: `of ${downloadLimit} this month`, color: planCfg.color },
            { icon: Package, label: 'Paid Purchases', value: `${purchases.length}`, sub: 'lifetime assets', color: '#F59E0B' },
            { icon: Shield, label: 'Account Status', value: 'Active', sub: 'verified account', color: '#10B981' },
            { icon: Star, label: 'Member Plan', value: planCfg.label, sub: 'current subscription', color: planCfg.color },
          ].map(stat => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-2xl p-5 border border-[#E2EDE8] shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                <div className="w-9 h-9 rounded-xl mb-3 flex items-center justify-center" style={{ backgroundColor: `${stat.color}15` }}>
                  <Icon className="w-4.5 h-4.5" style={{ color: stat.color }} />
                </div>
                <div className="text-2xl font-black text-[#111111] leading-none mb-1">{stat.value}</div>
                <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{stat.label}</div>
                <div className="text-xs text-zinc-400 mt-0.5">{stat.sub}</div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left — Download Quota + Plan */}
          <div className="space-y-5">

            {/* Monthly Download Quota */}
            <div className="bg-white rounded-3xl p-6 border border-[#E2EDE8] shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-[#111111]">Monthly Downloads</h3>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ color: planCfg.color, backgroundColor: `${planCfg.color}12` }}>
                  {downloadsUsed}/{downloadLimit}
                </span>
              </div>
              <div className="relative w-full h-3 bg-zinc-100 rounded-full overflow-hidden mb-3">
                <div
                  className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${downloadPercent}%`,
                    background: downloadPercent > 85
                      ? 'linear-gradient(90deg, #EF4444, #DC2626)'
                      : `linear-gradient(90deg, ${planCfg.color}, ${planCfg.color}cc)`,
                  }}
                />
              </div>
              <p className="text-xs text-zinc-400 font-medium">
                {downloadLimit - downloadsUsed} downloads remaining · Resets 1st of next month
              </p>
              {userPlan !== 'Pro' && (
                <Link href="/pricing" className="block mt-4">
                  <Button className="w-full h-10 rounded-xl text-xs font-bold bg-[#111111] hover:bg-[#24B86C] text-white transition-all">
                    Upgrade for more downloads →
                  </Button>
                </Link>
              )}
            </div>

            {/* Plan Card */}
            <div className={`bg-gradient-to-br ${planCfg.gradient} rounded-3xl p-6 text-white shadow-lg`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <PlanIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-black text-lg leading-tight">{planCfg.label}</div>
                  <div className="text-white/70 text-xs font-medium">Current subscription</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Check className="w-4 h-4 text-white/80" />
                  {downloadLimit} downloads/month
                </div>
                {userPlan !== 'Free' && (
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Check className="w-4 h-4 text-white/80" />
                    Priority support
                  </div>
                )}
                {userPlan === 'Pro' && (
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Check className="w-4 h-4 text-white/80" />
                    Commercial license
                  </div>
                )}
              </div>
              {userPlan !== 'Pro' && (
                <Link href="/pricing" className="block mt-5">
                  <div className="flex items-center justify-between w-full bg-white/20 hover:bg-white/30 transition-colors rounded-xl px-4 py-2.5 text-sm font-bold cursor-pointer">
                    Upgrade plan <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              )}
            </div>

            {/* Account Details */}
            <div className="bg-white rounded-3xl p-6 border border-[#E2EDE8] shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
              <h3 className="font-black text-[#111111] mb-4">Account Details</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 py-2.5 border-b border-[#F0F7F3]">
                  <User className="w-4 h-4 text-zinc-400 shrink-0" />
                  <div>
                    <div className="text-xs text-zinc-400 font-medium">Display Name</div>
                    <div className="text-sm font-bold text-[#111111]">{displayName}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 py-2.5 border-b border-[#F0F7F3]">
                  <Mail className="w-4 h-4 text-zinc-400 shrink-0" />
                  <div>
                    <div className="text-xs text-zinc-400 font-medium">Email</div>
                    <div className="text-sm font-bold text-[#111111] break-all">{email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 py-2.5">
                  <Shield className="w-4 h-4 text-zinc-400 shrink-0" />
                  <div>
                    <div className="text-xs text-zinc-400 font-medium">Auth Provider</div>
                    <div className="text-sm font-bold text-[#111111]">Firebase Authentication</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Purchased Products */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-6 border border-[#E2EDE8] shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-black text-[#111111] text-lg">My Purchases</h3>
                  <p className="text-xs text-zinc-400 font-medium mt-0.5">Paid products with lifetime download access</p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200">
                  <Infinity className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-xs font-black text-amber-600">{purchases.length} owned</span>
                </div>
              </div>

              {purchases.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
                    <ShoppingBag className="w-8 h-8 text-zinc-300" />
                  </div>
                  <h4 className="font-black text-[#111111] mb-2">No purchases yet</h4>
                  <p className="text-sm text-zinc-500 font-medium mb-6 max-w-xs">
                    Browse our paid premium assets — buy once, download forever.
                  </p>
                  <Link href="/products">
                    <Button className="h-11 px-6 rounded-xl bg-[#111111] hover:bg-[#24B86C] text-white font-bold text-sm transition-all">
                      Browse Marketplace <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {purchases.map(p => (
                    <Link key={p.id} href={`/products/${p.slug || p.id}`}>
                      <div className="flex items-center gap-4 p-4 rounded-2xl border border-[#E2EDE8] hover:border-[#24B86C]/40 hover:bg-[#F8FAF9] transition-all group cursor-pointer">
                        {/* Thumbnail */}
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-100 shrink-0 border border-[#E2EDE8]">
                          {p.thumbnail_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.thumbnail_url} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-6 h-6 text-zinc-300" />
                            </div>
                          )}
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-black text-[#111111] text-sm leading-tight truncate group-hover:text-[#24B86C] transition-colors">{p.name}</h4>
                          <p className="text-xs text-zinc-400 font-medium mt-0.5">{p.category}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[#24B86C] font-black text-sm">{p.price}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-600 font-bold flex items-center gap-1">
                              <Infinity className="w-2.5 h-2.5" /> Lifetime
                            </span>
                          </div>
                        </div>
                        {/* Arrow */}
                        <div className="w-9 h-9 rounded-xl bg-zinc-100 group-hover:bg-[#24B86C] flex items-center justify-center transition-all shrink-0">
                          <Download className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
