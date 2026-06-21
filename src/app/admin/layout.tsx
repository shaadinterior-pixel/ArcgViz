"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Package, Users, ShoppingCart,
  Settings, LogOut, Menu, X, Box, Layers, ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { ToastProvider } from '@/components/ui/Toast';
import ErrorBoundary from '@/components/ErrorBoundary';
import { supabase } from '@/lib/supabase';

const ADMIN_NAV = [
  { name: 'Overview',    href: '/admin',                    icon: LayoutDashboard },
  { name: 'Products',   href: '/admin/products',            icon: Package },
  { name: 'Orders',     href: '/admin/orders',              icon: ShoppingCart },
  { name: 'Customers',  href: '/admin/customers',           icon: Users },
  { name: 'Categories', href: '/admin/showcase-categories', icon: Layers },
  { name: 'Settings',   href: '/admin/settings',            icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [connected, setConnected] = useState<boolean | null>(null);

  useEffect(() => {
    // Ping Supabase to check connectivity
    (async () => {
      const { error } = await supabase.from('products').select('id').limit(1);
      setConnected(!error);
    })();
  }, []);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#0a0a0a] text-foreground grid grid-cols-1 md:grid-cols-[240px_1fr]">

        {/* ── Mobile top bar ── */}
        <div className="md:hidden flex items-center justify-between px-4 h-14 border-b border-border bg-card sticky top-0 z-40">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Box className="w-4 h-4 text-primary" />
            </div>
            <span className="font-bold text-sm tracking-tight">Admin Panel</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* ── Sidebar ── */}
        <aside
          className={`
            ${sidebarOpen ? 'flex' : 'hidden'} md:flex
            w-full flex-col bg-card border-r border-border
            md:sticky md:top-0 md:h-screen overflow-y-auto z-30
          `}
        >
          {/* Logo */}
          <div className="hidden md:flex items-center gap-2.5 px-5 py-5 border-b border-border">
            <div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Box className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm leading-none">Admin Panel</p>
              <p className="text-[10px] text-foreground/40 mt-0.5">ArchViz Market</p>
            </div>
            {/* Connection indicator */}
            <div
              className="shrink-0"
              title={
                connected === null ? 'Checking connection…'
                  : connected ? 'Supabase connected'
                  : 'Supabase disconnected'
              }
            >
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  connected === null ? 'bg-yellow-400 animate-pulse'
                    : connected ? 'bg-green-400'
                    : 'bg-red-500'
                }`}
              />
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-3 space-y-0.5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-foreground/30 px-3 py-2">
              Navigation
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
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all
                    ${isActive
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-foreground/60 hover:text-foreground hover:bg-secondary/60'
                    }
                  `}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-60" />}
                </Link>
              );
            })}
          </nav>

          {/* Bottom actions */}
          <div className="p-3 border-t border-border space-y-1">
            {/* DB status row */}
            <div className="flex items-center gap-2 px-3 py-2 text-xs text-foreground/40">
              <span
                className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${
                  connected === null ? 'bg-yellow-400 animate-pulse'
                    : connected ? 'bg-green-400'
                    : 'bg-red-500'
                }`}
              />
              <span>
                {connected === null ? 'Connecting to Supabase…'
                  : connected ? 'Supabase connected'
                  : 'Supabase disconnected'}
              </span>
            </div>
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground/60 hover:text-foreground hover:bg-secondary/60 transition-all"
            >
              <ExternalLink className="w-4 h-4 shrink-0" />
              <span>View Storefront</span>
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground/60 hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Sign Out</span>
            </Link>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="min-w-0 p-4 md:p-8 overflow-x-hidden overflow-y-auto w-full h-full">
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
