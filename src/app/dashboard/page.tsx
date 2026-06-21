"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Settings, ShoppingBag, Heart, LogOut, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('purchases');
  const [authUser, setAuthUser] = useState<any>(null);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser().then(async (u) => {
      setAuthUser(u);
      if (u) {
        const { data } = await supabase
          .from('purchases')
          .select('id, purchased_at, products(id, name, price)')
          .eq('user_id', u.id)
          .order('purchased_at', { ascending: false });
        
        if (data) {
          setPurchases(data.map(p => ({
            id: 'ORD-' + p.id.substring(0, 4).toUpperCase(),
            date: new Date(p.purchased_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
            item: p.products?.name || 'Unknown Product',
            price: p.products?.price || '—',
            product_id: p.products?.id,
            status: 'Completed',
          })));
        }
      }
      setLoading(false);
    });
  }, []);

  const user = {
    name: authUser?.user_metadata?.full_name || 'ArchViz User',
    email: authUser?.email?.includes('@archviz.com') 
      ? authUser.email.replace('@archviz.com', '') 
      : (authUser?.email || 'Loading...'),
    joinDate: authUser?.created_at 
      ? new Date(authUser.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) 
      : '...',
  };

  const wishlist = [
    { id: 1, item: 'Luxury Velvet Sofa Model', price: '₹1,299' },
  ];

  return (
    <div className="container mx-auto px-4 py-12 flex flex-col md:flex-row gap-8 min-h-[70vh]">
      {/* Sidebar */}
      <aside className="w-full md:w-64 shrink-0 space-y-6">
        <div className="flex items-center space-x-4 p-4 rounded-xl glass border-border">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
            {user.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold">{user.name}</h3>
            <p className="text-xs text-foreground/50">Member since {user.joinDate}</p>
          </div>
        </div>

        <nav className="flex flex-col space-y-1">
          <button 
            onClick={() => setActiveTab('purchases')}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm transition-colors ${activeTab === 'purchases' ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-secondary text-foreground/80'}`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>My Purchases</span>
          </button>
          <button 
            onClick={() => setActiveTab('wishlist')}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm transition-colors ${activeTab === 'wishlist' ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-secondary text-foreground/80'}`}
          >
            <Heart className="w-4 h-4" />
            <span>Wishlist</span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm transition-colors ${activeTab === 'settings' ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-secondary text-foreground/80'}`}
          >
            <Settings className="w-4 h-4" />
            <span>Account Settings</span>
          </button>
          <Link href="/">
            <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm hover:bg-red-500/10 text-red-500 transition-colors mt-8">
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </button>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {activeTab === 'purchases' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">My Purchases</h2>
            <div className="space-y-4">
              {loading ? (
                <div className="p-12 text-center text-foreground/50 border border-dashed border-border rounded-xl">
                  Loading your purchases...
                </div>
              ) : purchases.length === 0 ? (
                <div className="p-12 text-center text-foreground/50 border border-dashed border-border rounded-xl flex flex-col items-center justify-center">
                  <ShoppingBag className="w-8 h-8 mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold text-foreground mb-1">No purchases yet</h3>
                  <p className="mb-4">You haven't bought any 3D assets yet.</p>
                  <Link href="/products">
                    <Button>Explore Marketplace</Button>
                  </Link>
                </div>
              ) : (
                purchases.map(purchase => (
                  <Card key={purchase.id} className="bg-card hover:border-primary/30 transition-colors">
                    <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="text-xs text-foreground/50 mb-1">Order {purchase.id} • {purchase.date}</div>
                        <Link href={`/products/${purchase.product_id}`} className="hover:text-primary transition-colors">
                          <h4 className="font-semibold text-lg">{purchase.item}</h4>
                        </Link>
                        <div className="text-primary font-medium mt-1">{purchase.price}</div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Link href={`/products/${purchase.product_id}`}>
                          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                            <Download className="w-4 h-4 mr-2" /> Download
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'wishlist' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">My Wishlist</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.map(item => (
                <Card key={item.id} className="bg-card">
                  <div className="aspect-video bg-secondary" />
                  <CardContent className="p-4">
                    <h4 className="font-semibold line-clamp-1 mb-2">{item.item}</h4>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-primary">{item.price}</span>
                      <Button size="sm" variant="outline">Add to Cart</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-2xl">
            <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
            <Card className="bg-card">
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <input type="text" value={user.name} readOnly className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary opacity-80 cursor-not-allowed" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Account / Email</label>
                  <input type="text" value={user.email} readOnly className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary opacity-80 cursor-not-allowed" />
                </div>
                <div className="pt-4">
                  <Button disabled>Save Changes</Button>
                  <p className="text-xs text-foreground/50 mt-3">Account details are managed via your login provider.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
