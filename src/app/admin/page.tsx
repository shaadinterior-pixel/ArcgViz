"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  IndianRupee, Users, ShoppingBag, ArrowUpRight,
  Package, Star, Activity, ChevronRight,
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
    { title: 'Total Revenue',   value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: IndianRupee, trend: '+20.1%', color: 'text-green-400',  bg: 'bg-green-400/10' },
    { title: 'Customers',       value: customers.length.toString(),                  icon: Users,       trend: '+12.5%', color: 'text-blue-400',   bg: 'bg-blue-400/10'  },
    { title: 'Total Orders',    value: totalSales.toString(),                        icon: ShoppingBag, trend: '+19%',   color: 'text-purple-400', bg: 'bg-purple-400/10'},
    { title: 'Active Products', value: activeProducts.toString(),                    icon: Package,     trend: `${products.length} total`, color: 'text-primary', bg: 'bg-primary/10' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <Activity className="w-8 h-8 text-primary animate-pulse" />
          <p className="text-sm text-foreground/50">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-foreground/50 mt-1">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Link href="/admin/products">
          <button className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
            Manage Products <ChevronRight className="w-4 h-4" />
          </button>
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <p className="text-xs font-bold text-foreground/60 uppercase tracking-widest">{stat.title}</p>
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-3xl font-black tracking-tight">{stat.value}</p>
              <p className="text-sm text-primary font-medium flex items-center gap-1 mt-2 bg-primary/10 w-max px-2 py-1 rounded-md">
                <ArrowUpRight className="w-4 h-4" /> {stat.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue chart + Recent Customers */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Bar chart */}
        <Card className="lg:col-span-4 glass-card">
          <CardHeader className="pb-0 pt-6 px-6">
            <CardTitle className="text-lg font-bold">Revenue Overview</CardTitle>
            <p className="text-xs font-medium text-foreground/50 uppercase tracking-widest mt-1">Monthly revenue (INR)</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="relative h-56 flex items-end gap-2 overflow-x-auto hide-scrollbar pb-2">
              {REVENUE_BARS.map((h, i) => (
                <div key={i} className="flex-1 min-w-[32px] flex flex-col items-center gap-2 group">
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-primary/20 to-primary/60 hover:from-primary/40 hover:to-primary transition-all relative cursor-pointer shadow-sm"
                    style={{ height: `${h}%` }}
                  >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 glass text-foreground text-xs font-bold py-1.5 px-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl pointer-events-none z-10">
                      ₹{(h * 1234).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-foreground/40 uppercase tracking-wider">{MONTHS[i]}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent customers */}
        <Card className="lg:col-span-3 glass-card flex flex-col">
          <CardHeader className="pb-4 pt-6 px-6">
            <CardTitle className="text-lg font-bold">Recent Customers</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 pt-0 px-6 pb-6 space-y-4">
            {customers.slice(0, 5).map((c) => (
              <div key={c.id} className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-md">
                  {c.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{c.name}</p>
                  <p className="text-xs font-medium text-foreground/50 truncate">{c.email}</p>
                </div>
                <span className="text-sm font-black text-primary whitespace-nowrap">
                  ₹{c.spent.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
            {customers.length === 0 && (
              <p className="text-sm text-foreground/40 text-center py-6">No customers yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Products Table */}
      <Card className="glass-card overflow-hidden">
        <CardHeader className="p-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold">Top Selling Products</CardTitle>
            <Link href="/admin/products" className="text-xs font-bold text-primary hover:underline uppercase tracking-widest">View all</Link>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto hide-scrollbar">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t border-white/10 text-xs font-bold text-foreground/40 uppercase tracking-widest bg-white/5">
                <th className="text-left px-6 py-4">Product</th>
                <th className="text-left px-6 py-4 hidden sm:table-cell">Category</th>
                <th className="text-left px-6 py-4">Price</th>
                <th className="text-left px-6 py-4">Sales</th>
                <th className="text-left px-6 py-4 hidden md:table-cell">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {topProducts.map(p => (
                <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {p.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image} alt={p.name} className="w-10 h-10 rounded-xl object-cover shrink-0 shadow-sm group-hover:shadow-md transition-shadow" loading="lazy" />
                      )}
                      <span className="font-bold line-clamp-1">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-foreground/50 font-medium hidden sm:table-cell">{p.category}</td>
                  <td className="px-6 py-4 font-bold text-primary">{p.price}</td>
                  <td className="px-6 py-4 font-semibold">{p.sales}</td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="flex items-center gap-1.5 text-foreground/70 font-semibold bg-white/5 w-max px-2.5 py-1 rounded-md">
                      <Star className="w-3.5 h-3.5 fill-primary text-primary" /> {p.rating}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
