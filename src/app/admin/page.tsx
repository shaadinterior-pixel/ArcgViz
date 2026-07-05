import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  IndianRupee, Users, ShoppingBag, ArrowUpRight,
  Package, Star, ChevronRight,
} from 'lucide-react';
import { getAdminClient } from '@/lib/supabase-admin';
import type { Product, Customer } from '@/lib/store';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
// Mock monthly revenue distribution
const REVENUE_BARS = [38, 52, 44, 71, 58, 83, 69, 77, 61, 90, 74, 95];

export default async function AdminOverview() {
  const admin = getAdminClient();

  const [{ data: productsRaw }, { data: customersRaw }] = await Promise.all([
    admin.from('products').select('*').order('date', { ascending: false }),
    admin.from('customers').select('*').order('"joinDate"', { ascending: false }),
  ]);

  const products: Product[] = (productsRaw || []).map((row: Record<string, unknown>) => ({
    id: String(row.id ?? ''),
    name: String(row.name ?? ''),
    slug: String(row.slug ?? row.id ?? ''),
    price: String(row.price ?? ''),
    category: String(row.category ?? ''),
    status: (row.status as 'Active' | 'Draft') ?? 'Draft',
    sales: Number(row.sales ?? 0),
    date: String(row.date ?? ''),
    image: String(row.image ?? ''),
    author: String(row.author ?? ''),
    rating: String(row.rating ?? '5.0'),
    description: String(row.description ?? ''),
    thumbnail_url: String(row.thumbnail_url ?? row.image ?? ''),
    gallery_images: Array.isArray(row.gallery_images) ? row.gallery_images as string[] : [],
    google_drive_share_link: String(row.google_drive_share_link ?? ''),
    google_drive_file_id: String(row.google_drive_file_id ?? ''),
    download_url: String(row.download_url ?? ''),
    model_url: row.model_url ? String(row.model_url) : undefined,
    software_support: Array.isArray(row.software_support) ? row.software_support as string[] : [],
    file_formats: Array.isArray(row.file_formats) ? row.file_formats as string[] : [],
    poly_count: String(row.poly_count ?? ''),
    texture_resolution: String(row.texture_resolution ?? ''),
    file_size: String(row.file_size ?? ''),
    features: Array.isArray(row.features) ? row.features as string[] : [],
    updated_at: row.updated_at ? String(row.updated_at) : undefined,
  }));

  const customers: Customer[] = (customersRaw || []).map((row: Record<string, unknown>) => ({
    id: String(row.id ?? ''),
    name: String(row.name ?? ''),
    email: String(row.email ?? ''),
    spent: Number(row.spent ?? 0),
    orders: Number(row.orders ?? 0),
    status: (row.status as 'Active' | 'Inactive') ?? 'Active',
    joinDate: String(row.joinDate ?? row['joinDate'] ?? ''),
  }));

  const totalRevenue  = customers.reduce((s, c) => s + (c.spent || 0), 0);
  const totalSales    = customers.reduce((s, c) => s + (c.orders || 0), 0);
  const activeProducts = products.filter(p => p.status === 'Active').length;
  const topProducts   = [...products].sort((a, b) => b.sales - a.sales).slice(0, 5);

  const stats = [
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString('en-IN')}`,
      icon: IndianRupee,
      trend: '+20.1%',
      color: 'text-green-400',
      bg: 'bg-green-400/10',
    },
    {
      title: 'Customers',
      value: customers.length.toString(),
      icon: Users,
      trend: '+12.5%',
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
    },
    {
      title: 'Total Orders',
      value: totalSales.toString(),
      icon: ShoppingBag,
      trend: '+19%',
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
    },
    {
      title: 'Active Products',
      value: activeProducts.toString(),
      icon: Package,
      trend: `${products.length} total`,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
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
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-card border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-medium text-foreground/50 uppercase tracking-wider">{stat.title}</p>
                <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
              <p className="text-xs text-green-400 flex items-center gap-1 mt-1">
                <ArrowUpRight className="w-3 h-3" /> {stat.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue chart + Recent Customers */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Bar chart */}
        <Card className="lg:col-span-4 bg-card border-border">
          <CardHeader className="pb-0">
            <CardTitle className="text-base font-semibold">Revenue Overview</CardTitle>
            <p className="text-xs text-foreground/40">Monthly revenue (INR) — current year</p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="relative h-48 flex items-end gap-1.5">
              {REVENUE_BARS.map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                  <div
                    className="w-full rounded-t-sm bg-primary/20 hover:bg-primary/50 transition-colors relative cursor-pointer"
                    style={{ height: `${h}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-card border border-border text-foreground text-[10px] py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                      ₹{(h * 1234).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <span className="text-[9px] text-foreground/30">{MONTHS[i]}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent customers */}
        <Card className="lg:col-span-3 bg-card border-border flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Recent Customers</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 pt-0 space-y-4">
            {customers.slice(0, 5).map((c) => (
              <div key={c.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                  {c.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{c.name}</p>
                  <p className="text-xs text-foreground/40 truncate">{c.email}</p>
                </div>
                <span className="text-xs font-semibold text-primary whitespace-nowrap">
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
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Top Selling Products</CardTitle>
            <Link href="/admin/products" className="text-xs text-primary hover:underline">View all</Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t border-border text-xs text-foreground/40 uppercase tracking-wider">
                <th className="text-left px-6 py-3 font-medium">Product</th>
                <th className="text-left px-6 py-3 font-medium hidden sm:table-cell">Category</th>
                <th className="text-left px-6 py-3 font-medium">Price</th>
                <th className="text-left px-6 py-3 font-medium">Sales</th>
                <th className="text-left px-6 py-3 font-medium hidden md:table-cell">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {topProducts.map(p => (
                <tr key={p.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {p.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image} alt={p.name} className="w-9 h-9 rounded-lg object-cover shrink-0" loading="lazy" />
                      )}
                      <span className="font-medium line-clamp-1">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-foreground/50 hidden sm:table-cell">{p.category}</td>
                  <td className="px-6 py-4 font-semibold">{p.price}</td>
                  <td className="px-6 py-4">{p.sales}</td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="flex items-center gap-1 text-primary">
                      <Star className="w-3.5 h-3.5 fill-primary" /> {p.rating}
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
