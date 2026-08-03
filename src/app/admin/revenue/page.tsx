"use client";

import React, { useState, useEffect } from 'react';
import {
  TrendingUp, Wallet, Package, Printer, RefreshCw, Loader2,
  AlertTriangle, Users, PieChart, Gift,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { getCurrentUser } from '@/lib/auth';
import { formatInr } from '@/lib/pricing';
import {
  REVENUE_SHARES, splitRevenue, summariseOrders, sharesAreValid,
  classifyOrder, orderAmountInr, orderDate, ORDER_KIND_LABELS,
  type OrderRow, type OrderKind,
} from '@/lib/revenue';
import { fetchAdminOrders, fetchManualGrants, type ManualGrant } from '@/app/actions/admin-users';

type Range = 'all' | '30d' | '7d';

const KIND_ICON: Record<OrderKind, React.ElementType> = {
  recharge: RefreshCw,
  cart: Package,
  printing: Printer,
  manual: Gift,
  other: Wallet,
};

export default function AdminRevenuePage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [grants, setGrants] = useState<ManualGrant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<Range>('all');

  // Captured when the data loads so the date filter stays pure across renders.
  const [loadedAt, setLoadedAt] = useState<number>(0);

  useEffect(() => {
    // Kicked off via a promise chain so the effect body itself never setStates.
    getCurrentUser()
      .then(user => (user ? user.getIdToken() : null))
      .then(async (idToken) => {
        if (!idToken) { setError('Please sign in again.'); setLoading(false); return; }

        const [orderResult, grantResult] = await Promise.all([
          fetchAdminOrders(idToken),
          fetchManualGrants(idToken),
        ]);

        if (orderResult.ok) setOrders((orderResult.data ?? []) as OrderRow[]);
        else setError(orderResult.error);
        if (grantResult.ok) setGrants(grantResult.data ?? []);

        setLoadedAt(Date.now());
        setLoading(false);
      })
      .catch(() => { setError('Could not load revenue data.'); setLoading(false); });
  }, []);

  const cutoff = range === 'all' || !loadedAt
    ? null
    : new Date(loadedAt - (range === '7d' ? 7 : 30) * 86_400_000);
  const inRange = orders.filter(o => {
    if (!cutoff) return true;
    const date = orderDate(o);
    return date ? date >= cutoff : false;
  });

  const totals = summariseOrders(inRange);
  const payouts = splitRevenue(totals.grossInr);
  const grantedCredits = grants.reduce((sum, g) => sum + Math.max(0, g.credits), 0);

  const recent = [...inRange]
    .filter(o => String(o.status).toLowerCase() === 'completed')
    .sort((a, b) => (orderDate(b)?.getTime() ?? 0) - (orderDate(a)?.getTime() ?? 0))
    .slice(0, 12);

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
          <h1 className="text-2xl font-black text-[#111827]">Revenue Tracker</h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Everything sold, and how it splits between partners.
          </p>
        </div>
        <div className="flex gap-1 bg-[#F3F4F6] p-1 rounded-xl">
          {([['all', 'All time'], ['30d', 'Last 30 days'], ['7d', 'Last 7 days']] as [Range, string][]).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setRange(value)}
              className={`px-3 h-8 rounded-lg text-xs font-bold transition-colors ${
                range === value ? 'bg-white text-[#111827] shadow-sm' : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {!sharesAreValid() && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-700 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          Partner percentages in src/lib/revenue.ts do not add up to 100% — the payout figures below are wrong until that is fixed.
        </div>
      )}

      {/* Headline */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: TrendingUp, label: 'Net revenue',    value: formatInr(totals.grossInr), sub: `${totals.orderCount} paid orders`, color: '#24B86C' },
          { icon: Package,    label: 'Resources sold', value: String(totals.byKind.cart.count), sub: formatInr(totals.byKind.cart.amountInr), color: '#0EA5E9' },
          { icon: RefreshCw,  label: 'Recharges',      value: String(totals.byKind.recharge.count), sub: formatInr(totals.byKind.recharge.amountInr), color: '#9333EA' },
          { icon: Gift,       label: 'Manual credits', value: grantedCredits.toLocaleString('en-IN'), sub: `${grants.length} grants`, color: '#D97706' },
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
                <div className="text-xs text-[#9CA3AF] mt-0.5">{stat.sub}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Partner split */}
        <Card className="border border-[#E5E7EB] lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-1">
              <PieChart className="w-4 h-4 text-[#24B86C]" />
              <h2 className="font-black text-[#111827]">Partner Share</h2>
            </div>
            <p className="text-xs text-[#9CA3AF] mb-5">Of {formatInr(totals.grossInr)} net revenue</p>

            <div className="space-y-4">
              {payouts.map(p => (
                <div key={p.id}>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="font-bold text-[#111827] text-sm">{p.name}</span>
                    <span className="text-xs font-bold text-[#6B7280]">{p.percent}%</span>
                  </div>
                  <div className="text-2xl font-black text-[#111827] mb-2">{formatInr(p.amountInr)}</div>
                  <div className="h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#24B86C] to-[#11998E]"
                      style={{ width: `${p.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-[#9CA3AF] mt-5 leading-relaxed">
              Split is {REVENUE_SHARES.map(s => `${s.name} ${s.percent}%`).join(' / ')}, set in
              <code className="mx-1 px-1 py-0.5 bg-[#F3F4F6] rounded text-[10px]">src/lib/revenue.ts</code>.
              Refunds and pending orders are excluded, and manually granted credits earn nothing so they never inflate a payout.
            </p>
          </CardContent>
        </Card>

        {/* Breakdown by source */}
        <Card className="border border-[#E5E7EB] lg:col-span-2">
          <CardContent className="p-6">
            <h2 className="font-black text-[#111827] mb-1">Where the money came from</h2>
            <p className="text-xs text-[#9CA3AF] mb-5">Completed orders only</p>

            <div className="space-y-3">
              {(Object.keys(ORDER_KIND_LABELS) as OrderKind[])
                .filter(kind => kind !== 'manual' && totals.byKind[kind].count > 0)
                .map(kind => {
                  const Icon = KIND_ICON[kind];
                  const row = totals.byKind[kind];
                  const percent = totals.grossInr > 0 ? (row.amountInr / totals.grossInr) * 100 : 0;
                  return (
                    <div key={kind} className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-xl bg-[#F3F4F6] flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-[#6B7280]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between mb-1">
                          <span className="text-sm font-bold text-[#111827]">{ORDER_KIND_LABELS[kind]}</span>
                          <span className="text-sm font-black text-[#111827]">{formatInr(row.amountInr)}</span>
                        </div>
                        <div className="h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-[#24B86C]" style={{ width: `${percent}%` }} />
                        </div>
                        <div className="text-[11px] text-[#9CA3AF] mt-1">{row.count} orders · {percent.toFixed(0)}%</div>
                      </div>
                    </div>
                  );
                })}

              {totals.orderCount === 0 && (
                <p className="text-sm text-[#9CA3AF] py-8 text-center font-medium">
                  No completed orders in this period yet.
                </p>
              )}
            </div>

            {(totals.pendingInr > 0 || totals.refundedInr > 0) && (
              <div className="mt-5 pt-5 border-t border-[#E5E7EB] flex gap-6 text-xs">
                {totals.pendingInr > 0 && (
                  <div><span className="text-[#9CA3AF] font-bold uppercase tracking-widest">Pending</span> <span className="font-black text-[#111827] ml-1">{formatInr(totals.pendingInr)}</span></div>
                )}
                {totals.refundedInr > 0 && (
                  <div><span className="text-[#9CA3AF] font-bold uppercase tracking-widest">Refunded</span> <span className="font-black text-red-500 ml-1">{formatInr(totals.refundedInr)}</span></div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent orders */}
      <Card className="border border-[#E5E7EB]">
        <CardContent className="p-6">
          <h2 className="font-black text-[#111827] mb-5">Recent paid orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest border-b border-[#E5E7EB]">
                  <th className="text-left py-3 px-2">Customer</th>
                  <th className="text-left py-3 px-2">Item</th>
                  <th className="text-left py-3 px-2">Type</th>
                  <th className="text-left py-3 px-2">Date</th>
                  <th className="text-right py-3 px-2">Amount</th>
                  {REVENUE_SHARES.map(s => (
                    <th key={s.id} className="text-right py-3 px-2">{s.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.length === 0 ? (
                  <tr><td colSpan={5 + REVENUE_SHARES.length} className="py-12 text-center text-[#9CA3AF] font-medium">Nothing yet.</td></tr>
                ) : recent.map(o => {
                  const amount = orderAmountInr(o);
                  const rowSplit = splitRevenue(amount);
                  return (
                    <tr key={o.id} className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB]">
                      <td className="py-3 px-2">
                        <div className="font-bold text-[#111827]">{o.customer || 'Guest'}</div>
                        <div className="text-xs text-[#6B7280]">{o.email}</div>
                      </td>
                      <td className="py-3 px-2 text-[#374151] max-w-[240px] truncate">{o.product}</td>
                      <td className="py-3 px-2">
                        <span className="text-xs font-bold px-2 py-1 rounded-full bg-[#F3F4F6] text-[#6B7280]">
                          {ORDER_KIND_LABELS[classifyOrder(o)]}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-xs text-[#6B7280]">{o.date || '—'}</td>
                      <td className="py-3 px-2 text-right font-black text-[#111827]">{formatInr(amount)}</td>
                      {rowSplit.map(s => (
                        <td key={s.id} className="py-3 px-2 text-right text-xs font-medium text-[#6B7280]">{formatInr(s.amountInr)}</td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Manual grants log */}
      <Card className="border border-[#E5E7EB]">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-[#D97706]" />
            <h2 className="font-black text-[#111827]">Manually granted credits</h2>
          </div>
          <p className="text-xs text-[#9CA3AF] mb-5">
            Enterprise deals and goodwill credits. These carry no revenue, so they are tracked separately.
          </p>

          {grants.length === 0 ? (
            <p className="text-sm text-[#9CA3AF] py-8 text-center font-medium">No manual grants yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest border-b border-[#E5E7EB]">
                    <th className="text-left py-3 px-2">User</th>
                    <th className="text-right py-3 px-2">Credits</th>
                    <th className="text-left py-3 px-2">Reason</th>
                    <th className="text-left py-3 px-2">By</th>
                    <th className="text-left py-3 px-2">When</th>
                  </tr>
                </thead>
                <tbody>
                  {grants.map((g, i) => (
                    <tr key={`${g.userId}-${i}`} className="border-b border-[#F3F4F6]">
                      <td className="py-3 px-2">
                        <div className="font-bold text-[#111827]">{g.userName}</div>
                        <div className="text-xs text-[#6B7280]">{g.userEmail}</div>
                      </td>
                      <td className={`py-3 px-2 text-right font-black ${g.credits < 0 ? 'text-red-500' : 'text-[#24B86C]'}`}>
                        {g.credits > 0 ? '+' : ''}{g.credits.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-2 text-[#374151] max-w-[280px] truncate">{g.note || '—'}</td>
                      <td className="py-3 px-2 text-xs text-[#6B7280]">{g.grantedBy}</td>
                      <td className="py-3 px-2 text-xs text-[#6B7280]">{g.grantedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
