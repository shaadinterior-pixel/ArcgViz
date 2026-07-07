"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  IndianRupee, Users, ShoppingBag, ArrowUpRight,
  Package, Star, TrendingUp, ChevronRight,
} from 'lucide-react';
import { fetchProducts, fetchCustomers, type Product, type Customer } from '@/lib/store';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const REVENUE_BARS = [38, 52, 44, 71, 58, 83, 69, 77, 61, 90, 74, 95];

export default function AdminOverview() {
  const [products,  setProducts]  = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([fetchProducts(), fetchCustomers()])
      .then(([p, c]) => { setProducts(p); setCustomers(c); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue   = customers.reduce((s, c) => s + (c.spent || 0), 0);
  const totalSales     = customers.reduce((s, c) => s + (c.orders || 0), 0);
  const activeProducts = products.filter(p => p.status === 'Active').length;
  const topProducts    = [...products].sort((a, b) => b.sales - a.sales).slice(0, 5);

  const stats = [
    { title: 'Total Revenue',   value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: IndianRupee, trend: '+20.1%', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600', trendColor: 'text-emerald-600 bg-emerald-50' },
    { title: 'Customers',       value: customers.length.toString(),                  icon: Users,       trend: '+12.5%', iconBg: 'bg-blue-50',    iconColor: 'text-blue-600',    trendColor: 'text-blue-600 bg-blue-50'    },
    { title: 'Total Orders',    value: totalSales.toString(),                        icon: ShoppingBag, trend: '+19%',   iconBg: 'bg-violet-50',  iconColor: 'text-violet-600',  trendColor: 'text-violet-600 bg-violet-50'},
    { title: 'Active Products', value: activeProducts.toString(),                    icon: Package,     trend: `${products.length} total`, iconBg: 'bg-amber-50', iconColor: 'text-amber-600', trendColor: 'text-amber-600 bg-amber-50' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#24B86C] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#9CA3AF]">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] tracking-tight">Dashboard</h1>
          <p className="text-sm text-[#9CA3AF] mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Link href="/admin/products">
          <button className="flex items-center gap-1.5 text-sm font-semibold text-[#24B86C] hover:text-[#1fa35f] transition-colors">
            Manage Products <ChevronRight className="w-4 h-4" />
          </button>
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white rounded-2xl border border-[#E5E7EB] p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">{stat.title}</p>
              <div className={`w-9 h-9 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                <stat.icon className={`w-4.5 h-4.5 ${stat.iconColor}`} />
              </div>
            </div>
            <p className="text-3xl font-black text-[#111827] tracking-tight">{stat.value}</p>
            <p className={`text-xs font-semibold flex items-center gap-1 mt-2.5 w-max px-2 py-1 rounded-md ${stat.trendColor}`}>
              <ArrowUpRight className="w-3.5 h-3.5" /> {stat.trend}
            </p>
          </div>
        ))}
      </div>

      {/* Revenue chart + Recent Customers */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* Bar chart */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-[#E5E7EB] p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base font-bold text-[#111827]">Revenue Overview</h2>
            <TrendingUp className="w-4 h-4 text-[#24B86C]" />
          </div>
          <p className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wider mb-6">Monthly Revenue (INR)</p>
          <div className="relative h-48 flex items-end gap-1.5 overflow-x-auto hide-scrollbar">
            {REVENUE_BARS.map((h, i) => (
              <div key={i} className="flex-1 min-w-[28px] flex flex-col items-center gap-2 group">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-[#24B86C]/20 to-[#24B86C]/70 hover:to-[#24B86C] transition-all duration-200 relative cursor-pointer"
                  style={{ height: `${h}%` }}
                >
                  <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-[#111827] text-white text-[10px] font-bold py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    ₹{(h * 1234).toLocaleString('en-IN')}
                  </div>
                </div>
                <span className="text-[9px] font-semibold text-[#9CA3AF] uppercase">{MONTHS[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent customers */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-[#E5E7EB] p-6 flex flex-col">
          <h2 className="text-base font-bold text-[#111827] mb-5">Recent Customers</h2>
          <div className="flex-1 space-y-3">
            {customers.slice(0, 5).map((c) => (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F4F6F8] transition-colors">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#24B86C] to-[#11998E] text-white flex items-center justify-center text-sm font-bold shrink-0">
                  {c.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#111827] truncate">{c.name}</p>
                  <p className="text-xs text-[#9CA3AF] truncate">{c.email}</p>
                </div>
                <span className="text-sm font-bold text-[#24B86C] whitespace-nowrap">
                  ₹{c.spent.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
            {customers.length === 0 && (
              <div className="flex flex-col items-center justify-center h-32 text-[#9CA3AF]">
                <Users className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm">No customers yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-[#E5E7EB]">
          <h2 className="text-base font-bold text-[#111827]">Top Selling Products</h2>
          <Link href="/admin/products" className="text-xs font-bold text-[#24B86C] hover:text-[#1fa35f] uppercase tracking-wider transition-colors">View all</Link>
        </div>
        <div className="overflow-x-auto hide-scrollbar">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider bg-[#F9FAFB]">
                <th className="text-left px-6 py-3">Product</th>
                <th className="text-left px-6 py-3 hidden sm:table-cell">Category</th>
                <th className="text-left px-6 py-3">Price</th>
                <th className="text-left px-6 py-3">Sales</th>
                <th className="text-left px-6 py-3 hidden md:table-cell">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {topProducts.map(p => (
                <tr key={p.id} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {p.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image} alt={p.name} className="w-9 h-9 rounded-xl object-cover shrink-0 border border-[#E5E7EB]" loading="lazy" />
                      )}
                      <span className="font-semibold text-[#111827] line-clamp-1">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#9CA3AF] hidden sm:table-cell">{p.category}</td>
                  <td className="px-6 py-4 font-bold text-[#24B86C]">{p.price}</td>
                  <td className="px-6 py-4 font-semibold text-[#111827]">{p.sales}</td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="flex items-center gap-1.5 text-[#6B7280] font-semibold bg-amber-50 text-amber-600 w-max px-2.5 py-1 rounded-md text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> {p.rating}
                    </span>
                  </td>
                </tr>
              ))}
              {topProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#9CA3AF]">No products yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
