"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Users, Wallet, Crown, Zap, Star, Building2, Loader2,
  Plus, Minus, X, ShieldCheck, Download,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { getCurrentUser } from '@/lib/auth';
import { ASSIGNABLE_TIERS, type PlanTier } from '@/lib/plans';
import { formatInr } from '@/lib/pricing';
import { fetchAdminUsers, grantCreditsToUser, setUserPlan, type AdminUser } from '@/app/actions/admin-users';

const TIER_STYLE: Record<PlanTier, { icon: React.ElementType; color: string; bg: string }> = {
  Free:       { icon: Star,      color: '#6B7280', bg: 'bg-zinc-100 text-zinc-600' },
  Plus:       { icon: Zap,       color: '#24B86C', bg: 'bg-green-100 text-green-700' },
  Pro:        { icon: Crown,     color: '#9333EA', bg: 'bg-purple-100 text-purple-700' },
  Enterprise: { icon: Building2, color: '#D97706', bg: 'bg-amber-100 text-amber-700' },
};

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState<'All' | PlanTier>('All');

  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [creditInput, setCreditInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [busy, setBusy] = useState(false);

  const getToken = useCallback(async () => {
    const user = await getCurrentUser();
    if (!user) throw new Error('Please sign in again.');
    return user.getIdToken();
  }, []);

  const load = useCallback(async () => {
    try {
      const result = await fetchAdminUsers(await getToken());
      if (!result.ok) { setError(result.error); return; }
      setUsers(result.data ?? []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load users.');
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    // Kicked off via a promise chain so the effect body itself never setStates.
    getCurrentUser()
      .then(user => (user ? user.getIdToken() : null))
      .then(async (idToken) => {
        if (!idToken) { setError('Please sign in again.'); setLoading(false); return; }
        const result = await fetchAdminUsers(idToken);
        if (result.ok) setUsers(result.data ?? []);
        else setError(result.error);
        setLoading(false);
      })
      .catch(() => { setError('Could not load users.'); setLoading(false); });
  }, []);

  const filtered = users.filter(u => {
    const q = search.trim().toLowerCase();
    const matchesText = !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.phone.toLowerCase().includes(q);
    return matchesText && (planFilter === 'All' || u.plan === planFilter);
  });

  const totals = users.reduce((acc, u) => ({
    credits: acc.credits + u.downloadCredits,
    downloads: acc.downloads + u.totalDownloads,
    spent: acc.spent + u.spentInr,
    enterprise: acc.enterprise + (u.plan === 'Enterprise' ? 1 : 0),
  }), { credits: 0, downloads: 0, spent: 0, enterprise: 0 });

  const applyCredits = async (delta: number) => {
    if (!editing) return;
    const amount = Math.trunc(Number(creditInput));
    if (!Number.isFinite(amount) || amount <= 0) { toast('Enter how many credits', 'error'); return; }

    setBusy(true);
    try {
      const result = await grantCreditsToUser(await getToken(), editing.id, delta * amount, noteInput);
      if (!result.ok) { toast(result.error, 'error'); return; }
      toast(result.message || 'Credits updated');
      setCreditInput(''); setNoteInput('');
      setEditing(null);
      await load();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed', 'error');
    } finally {
      setBusy(false);
    }
  };

  const changePlan = async (user: AdminUser, plan: PlanTier) => {
    if (plan === user.plan) return;
    setBusy(true);
    try {
      const result = await setUserPlan(await getToken(), user.id, plan);
      if (!result.ok) { toast(result.error, 'error'); return; }
      toast(result.message || 'Plan updated');
      await load();
      setEditing(prev => (prev && prev.id === user.id ? { ...prev, plan } : prev));
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed', 'error');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-[#24B86C]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-[#111827]">Manage Users</h1>
          <p className="text-sm text-[#6B7280] mt-1">
            {users.length} users — change plans and grant credits by hand for Enterprise deals.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Wallet,    label: 'Credits in circulation', value: totals.credits.toLocaleString('en-IN'), color: '#24B86C' },
          { icon: Download,  label: 'Downloads all time',     value: totals.downloads.toLocaleString('en-IN'), color: '#0EA5E9' },
          { icon: Building2, label: 'Enterprise users',       value: String(totals.enterprise), color: '#D97706' },
          { icon: Users,     label: 'Customer spend',         value: formatInr(totals.spent), color: '#9333EA' },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border border-[#E5E7EB]">
              <CardContent className="p-5">
                <div className="w-9 h-9 rounded-xl mb-3 flex items-center justify-center" style={{ backgroundColor: `${stat.color}15` }}>
                  <Icon className="w-4 h-4" style={{ color: stat.color }} />
                </div>
                <div className="text-2xl font-black text-[#111827] leading-none mb-1">{stat.value}</div>
                <div className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest">{stat.label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card className="border border-[#E5E7EB]">
        <CardContent className="p-5">
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, email or phone..."
                className="pl-9 h-10"
              />
            </div>
            <select
              value={planFilter}
              onChange={e => setPlanFilter(e.target.value as 'All' | PlanTier)}
              className="h-10 px-3 rounded-xl border border-[#E5E7EB] bg-white text-sm font-medium"
            >
              <option value="All">All plans</option>
              {ASSIGNABLE_TIERS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest border-b border-[#E5E7EB]">
                  <th className="text-left py-3 px-2">User</th>
                  <th className="text-left py-3 px-2">Plan</th>
                  <th className="text-right py-3 px-2">Credits</th>
                  <th className="text-right py-3 px-2">Downloads</th>
                  <th className="text-right py-3 px-2">Recharges</th>
                  <th className="text-right py-3 px-2">Spent</th>
                  <th className="text-right py-3 px-2">Manage</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="py-12 text-center text-[#9CA3AF] font-medium">No users match that search.</td></tr>
                ) : filtered.map(u => {
                  const style = TIER_STYLE[u.plan] ?? TIER_STYLE.Free;
                  const TierIcon = style.icon;
                  return (
                    <tr key={u.id} className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB]">
                      <td className="py-3 px-2">
                        <div className="font-bold text-[#111827]">{u.name}</div>
                        <div className="text-xs text-[#6B7280]">{u.email}</div>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${style.bg}`}>
                          <TierIcon className="w-3 h-3" /> {u.plan}
                        </span>
                        {u.plan !== 'Free' && u.downloadCredits === 0 && (
                          <div className="text-[10px] text-amber-600 font-bold mt-1">no credits left</div>
                        )}
                      </td>
                      <td className="py-3 px-2 text-right font-black text-[#111827]">
                        {u.downloadCredits > 0
                          ? u.downloadCredits.toLocaleString('en-IN')
                          : <span className="text-[#9CA3AF] font-medium">{u.dailyUsed}/{u.dailyLimit} today</span>}
                      </td>
                      <td className="py-3 px-2 text-right font-medium text-[#374151]">{u.totalDownloads}</td>
                      <td className="py-3 px-2 text-right font-medium text-[#374151]">
                        {u.rechargeCount}
                        {u.manualGrantCount > 0 && (
                          <span className="text-[10px] text-amber-600 font-bold ml-1">({u.manualGrantCount} manual)</span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-right font-medium text-[#374151]">{formatInr(u.spentInr)}</td>
                      <td className="py-3 px-2 text-right">
                        <Button
                          onClick={() => { setEditing(u); setCreditInput(''); setNoteInput(''); }}
                          variant="outline"
                          className="h-8 px-3 text-xs font-bold rounded-lg border-[#E5E7EB]"
                        >
                          Manage
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Manage modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => !busy && setEditing(null)}>
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between p-6 border-b border-[#E5E7EB]">
              <div>
                <h2 className="text-lg font-black text-[#111827]">{editing.name}</h2>
                <p className="text-sm text-[#6B7280]">{editing.email}</p>
                <p className="text-xs text-[#9CA3AF] mt-1">Joined {editing.joinDate} · {editing.purchaseCount} paid assets</p>
              </div>
              <button onClick={() => !busy && setEditing(null)} className="p-2 rounded-lg hover:bg-[#F3F4F6]">
                <X className="w-4 h-4 text-[#6B7280]" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Balance */}
              <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest">Current balance</div>
                  <div className="text-2xl font-black text-[#111827]">{editing.downloadCredits.toLocaleString('en-IN')} credits</div>
                </div>
                <div className="text-right text-xs text-[#6B7280]">
                  <div>{editing.totalDownloads} downloads</div>
                  <div>{editing.dailyUsed}/{editing.dailyLimit} free today</div>
                </div>
              </div>

              {/* Plan */}
              <div>
                <label className="block text-xs font-bold text-[#374151] uppercase tracking-widest mb-2">Plan</label>
                <div className="flex flex-wrap gap-2">
                  {ASSIGNABLE_TIERS.map(tier => {
                    const style = TIER_STYLE[tier];
                    const TierIcon = style.icon;
                    const active = editing.plan === tier;
                    return (
                      <button
                        key={tier}
                        disabled={busy}
                        onClick={() => changePlan(editing, tier)}
                        className={`inline-flex items-center gap-1.5 px-3 h-9 rounded-xl text-xs font-bold border-2 transition-all disabled:opacity-50 ${
                          active ? 'border-current ' + style.bg : 'border-[#E5E7EB] text-[#6B7280] hover:border-[#D1D5DB]'
                        }`}
                      >
                        <TierIcon className="w-3.5 h-3.5" /> {tier}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-[#9CA3AF] mt-2">
                  A tier only takes effect while the user has credits — an empty balance falls back to the free daily allowance.
                </p>
              </div>

              {/* Credits */}
              <div>
                <label className="block text-xs font-bold text-[#374151] uppercase tracking-widest mb-2">Grant or remove credits</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={creditInput}
                    onChange={e => setCreditInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 5000"
                    inputMode="numeric"
                    className="h-10 flex-1"
                  />
                  <Button
                    onClick={() => applyCredits(1)}
                    disabled={busy || !creditInput}
                    className="h-10 px-4 rounded-xl bg-[#24B86C] hover:bg-[#1DA05D] text-white text-xs font-bold"
                  >
                    {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4 mr-1" /> Add</>}
                  </Button>
                  <Button
                    onClick={() => applyCredits(-1)}
                    disabled={busy || !creditInput}
                    variant="outline"
                    className="h-10 px-4 rounded-xl border-red-200 text-red-500 hover:bg-red-50 text-xs font-bold"
                  >
                    <Minus className="w-4 h-4 mr-1" /> Remove
                  </Button>
                </div>
                <Input
                  value={noteInput}
                  onChange={e => setNoteInput(e.target.value)}
                  placeholder="Reason (e.g. Enterprise deal — 6 month contract)"
                  className="h-10"
                />
                <p className="text-[11px] text-[#9CA3AF] mt-2 flex items-start gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-px text-[#24B86C]" />
                  Logged against your admin account and shown in the customer&apos;s own recharge history.
                  Manual grants are kept out of revenue totals.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-[#E5E7EB] flex justify-end">
              <Button onClick={() => setEditing(null)} disabled={busy} variant="outline" className="h-10 px-5 rounded-xl border-[#E5E7EB] text-sm font-bold">
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
