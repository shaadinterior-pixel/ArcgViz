"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Settings, ShoppingBag, Heart, LogOut, Download, ArrowRight, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
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
          setPurchases(data.map(p => {
            const product = Array.isArray(p.products) ? p.products[0] : p.products;
            return {
              id: 'ORD-' + p.id.substring(0, 4).toUpperCase(),
              date: new Date(p.purchased_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
              item: (product as any)?.name || 'Unknown Product',
              price: (product as any)?.price || '—',
              product_id: (product as any)?.id,
              status: 'Completed',
            };
          }));
        }
      }
      setLoading(false);
    });
  }, []);

  const user = {
    name: authUser?.user_metadata?.full_name || 'Creative User',
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
    <div className="min-h-screen bg-[#FAFCFB] pt-32 pb-24">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-10">
        
        {/* Sidebar */}
        <aside className="w-full md:w-72 shrink-0 space-y-8">
          {/* User Profile Card */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-[#E2EDE8] flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00E599] to-[#00A1FF] p-1 mb-4">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-2xl font-black text-[#111111]">
                {user.name.charAt(0)}
              </div>
            </div>
            <h3 className="font-black text-[#111111] text-lg mb-1">{user.name}</h3>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Member since {user.joinDate}</p>
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
              onClick={() => setActiveTab('wishlist')}
              className={`flex items-center space-x-3 px-5 py-3.5 rounded-2xl text-[15px] font-bold transition-all duration-300 ${activeTab === 'wishlist' ? 'bg-[#F0F7F3] text-[#24B86C]' : 'hover:bg-zinc-50 text-zinc-500 hover:text-[#111111]'}`}
            >
              <Heart className="w-5 h-5" />
              <span>Wishlist</span>
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`flex items-center space-x-3 px-5 py-3.5 rounded-2xl text-[15px] font-bold transition-all duration-300 ${activeTab === 'settings' ? 'bg-[#F0F7F3] text-[#24B86C]' : 'hover:bg-zinc-50 text-zinc-500 hover:text-[#111111]'}`}
            >
              <Settings className="w-5 h-5" />
              <span>Account Settings</span>
            </button>
            
            <div className="h-px bg-[#E2EDE8] mx-4 my-2" />
            
            <Link href="/" className="w-full">
              <button className="w-full flex items-center space-x-3 px-5 py-3.5 rounded-2xl text-[15px] font-bold hover:bg-red-50 text-red-500 transition-all duration-300">
                <LogOut className="w-5 h-5" />
                <span>Log out</span>
              </button>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {activeTab === 'purchases' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-black text-[#111111]">My Purchases</h2>
              
              <div className="space-y-4">
                {loading ? (
                  <div className="bg-white rounded-3xl p-16 text-center text-zinc-400 border border-dashed border-[#E2EDE8]">
                    Loading your purchases...
                  </div>
                ) : purchases.length === 0 ? (
                  <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-[#E2EDE8] flex flex-col items-center justify-center">
                    <ShoppingBag className="w-12 h-12 mb-6 text-zinc-300" />
                    <h3 className="text-xl font-black text-[#111111] mb-2">No purchases yet</h3>
                    <p className="mb-8 text-zinc-500 font-medium">You haven't bought any digital assets yet.</p>
                    <Link href="/products">
                      <Button className="h-12 px-6 rounded-full bg-[#111111] hover:bg-[#00E599] text-white font-bold text-sm shadow-md transition-all group">
                        Explore Marketplace
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                ) : (
                  purchases.map(purchase => (
                    <div key={purchase.id} className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E2EDE8] hover:border-[#24B86C]/30 hover:shadow-[0_8px_30px_rgba(36,184,108,0.1)] transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div>
                        <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                          Order {purchase.id} • {purchase.date}
                        </div>
                        <Link href={`/products/${purchase.product_id}`} className="hover:text-[#24B86C] transition-colors">
                          <h4 className="font-black text-xl text-[#111111] leading-tight">{purchase.item}</h4>
                        </Link>
                        <div className="text-[#24B86C] font-black mt-2">{purchase.price}</div>
                      </div>
                      <div className="flex items-center shrink-0">
                        <Link href={`/products/${purchase.product_id}`}>
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

          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-black text-[#111111]">My Wishlist</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlist.map(item => (
                  <div key={item.id} className="bg-white rounded-3xl p-3 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E2EDE8] flex flex-col">
                    <div className="aspect-[4/3] rounded-2xl bg-zinc-100 mb-4" />
                    <div className="px-2 pb-2 flex-1 flex flex-col">
                      <h4 className="font-bold text-[#111111] line-clamp-1 mb-4 flex-1">{item.item}</h4>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="font-black text-[#24B86C]">{item.price}</span>
                        <Button className="h-9 px-4 rounded-lg bg-[#111111] hover:bg-[#00E599] text-white text-xs font-bold transition-all">
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
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
                
                <div className="pt-6 border-t border-[#E2EDE8]">
                  <Button className="h-12 px-8 rounded-full bg-zinc-200 text-zinc-400 font-bold cursor-not-allowed">
                    Save Changes
                  </Button>
                  <p className="text-xs font-medium text-zinc-400 mt-4">
                    Account details are currently managed via your authentication provider (Firebase/Google).
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
