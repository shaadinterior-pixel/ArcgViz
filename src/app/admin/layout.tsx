"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Package, Users, ShoppingCart,
  Settings, LogOut, Menu, X, Box, Layers, ChevronRight,
  ExternalLink, Image as ImageIcon, Briefcase,
} from 'lucide-react';
import { ToastProvider } from '@/components/ui/Toast';
import ErrorBoundary from '@/components/ErrorBoundary';
import { supabase } from '@/lib/supabase';

const ADMIN_NAV = [
  { name: 'Overview',      href: '/admin',                    icon: LayoutDashboard },
  { name: 'Products',      href: '/admin/products',            icon: Package },
  { name: 'Orders',        href: '/admin/orders',              icon: ShoppingCart },
  { name: 'Customers',     href: '/admin/customers',           icon: Users },
  { name: 'Categories',    href: '/admin/showcase-categories', icon: Layers },
  { name: 'Services',      href: '/admin/services',            icon: Briefcase },
  { name: 'Hero Content',  href: '/admin/hero',                icon: ImageIcon },
  { name: 'Settings',      href: '/admin/settings',            icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [connected, setConnected] = useState<boolean | null>(null);

  useEffect(() => {
    // Ping Supabase — use a simple RPC that doesn't need RLS clearance
    (async () => {
      try {
        const { error } = await supabase.from('products').select('id', { count: 'exact', head: true });
        // PGRST116 = no rows, but that still means connected
        setConnected(!error || error.code === 'PGRST116');
      } catch {
        setConnected(false);
      }
    })();
  }, []);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-background text-foreground grid grid-cols-1 md:grid-cols-[240px_1fr] relative">

        {/* ── Mobile top bar ── */}
        <div className="md:hidden flex items-center justify-between px-4 h-16 border-b border-white/10 glass sticky top-0 z-40">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Box className="w-4 h-4 text-primary" />
            </div>
            <span className="font-bold text-sm tracking-tight text-foreground">Admin Panel</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="p-2 rounded-lg hover:bg-secondary/20 transition-colors text-foreground"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Backdrop */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Sidebar ── */}
        <aside
          className={`
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
            fixed md:sticky top-0 left-0 h-screen w-[260px] md:w-full
            flex flex-col glass border-r border-white/10
            transition-transform duration-300 ease-in-out z-50
          `}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg flex items-center justify-center">
              <Box className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm leading-none text-foreground">Design Walla</p>
              <p className="text-[10px] text-foreground/50 mt-1 uppercase tracking-widest font-semibold">Admin Panel</p>
            </div>
            {/* Connection indicator */}
            <div
              className="shrink-0 ml-2"
              title={
                connected === null ? 'Checking connection…'
                  : connected ? 'Supabase connected'
                  : 'Supabase disconnected'
              }
            >
              <span
                className={`inline-block w-2.5 h-2.5 rounded-full ${
                  connected === null ? 'bg-yellow-400 animate-pulse'
                    : connected ? 'bg-primary shadow-[0_0_8px_rgba(36,184,108,0.5)]'
                    : 'bg-red-500'
                }`}
              />
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1 hide-scrollbar">
            <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 px-3 py-2 mb-2">
              Management
            </p>
            {ADMIN_NAV.map(item => {
              const isActive = item.href === '/admin'
                ? pathname === '/admin'
                : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive
                      ? 'bg-gradient-to-r from-primary/15 to-transparent text-primary shadow-[inset_2px_0_0_0_rgba(36,184,108,1)]'
                      : 'text-foreground/70 hover:text-foreground hover:bg-secondary/10'
                    }
                  `}
                >
                  <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary' : 'text-foreground/50'}`} />
                  <span>{item.name}</span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-60" />}
                </Link>
              );
            })}
          </nav>

          {/* Bottom actions */}
          <div className="p-4 border-t border-white/10 space-y-1 shrink-0 glass rounded-t-2xl">
            {/* DB status row */}
            <div className="flex items-center gap-2 px-3 py-2.5 text-xs text-foreground/50">
              <span
                className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${
                  connected === null ? 'bg-yellow-400 animate-pulse'
                    : connected ? 'bg-primary'
                    : 'bg-red-500'
                }`}
              />
              <span className="font-medium truncate">
                {connected === null ? 'Connecting DB…'
                  : connected ? 'Database Online'
                  : 'Database Offline'}
              </span>
            </div>
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground/70 hover:text-primary hover:bg-primary/10 transition-all duration-200"
            >
              <ExternalLink className="w-4 h-4 shrink-0" />
              <span>View Storefront</span>
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground/70 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Sign Out</span>
            </Link>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="min-w-0 p-4 md:p-8 overflow-x-hidden overflow-y-auto w-full h-screen relative">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
          
          <div className="max-w-7xl mx-auto w-full">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}
