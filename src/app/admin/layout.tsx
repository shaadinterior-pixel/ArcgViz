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
  { group: 'Store',    items: [
    { name: 'Dashboard',          href: '/admin',                    icon: LayoutDashboard },
    { name: 'Products',           href: '/admin/products',            icon: Package },
    { name: 'Product Categories', href: '/admin/showcase-categories', icon: Layers },
    { name: 'Orders',             href: '/admin/orders',              icon: ShoppingCart },
    { name: 'Customers',          href: '/admin/customers',           icon: Users },
  ]},
  { group: 'Homepage', items: [
    { name: 'Hero Section', href: '/admin/hero',     icon: ImageIcon },
    { name: 'Portfolio',    href: '/admin/portfolio', icon: ImageIcon },
    { name: 'Services',     href: '/admin/services', icon: Briefcase },
    { name: 'Reviews',      href: '/admin/testimonials', icon: ImageIcon },
  ]},
  { group: 'System',   items: [
    { name: 'Settings',     href: '/admin/settings', icon: Settings },
  ]},
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [connected, setConnected] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { error } = await supabase.from('products').select('id', { count: 'exact', head: true });
        setConnected(!error || error.code === 'PGRST116');
      } catch {
        setConnected(false);
      }
    })();
  }, []);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#F4F6F8] text-[#111827] grid grid-cols-1 md:grid-cols-[240px_1fr] relative">

        {/* ── Mobile top bar ── */}
        <div className="md:hidden flex items-center justify-between px-4 h-14 border-b border-[#E5E7EB] bg-white sticky top-0 z-40 shadow-sm">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#24B86C] to-[#11998E] flex items-center justify-center shadow">
              <Box className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm text-[#111827]">Design Walla</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="p-2 rounded-lg hover:bg-[#F4F6F8] transition-colors text-[#6B7280]"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Sidebar ── */}
        <aside
          className={`
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
            fixed md:sticky top-0 left-0 h-screen w-[240px] md:w-full
            flex flex-col bg-white border-r border-[#E5E7EB]
            transition-transform duration-300 ease-in-out z-50
          `}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 px-5 py-5 border-b border-[#E5E7EB] shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#24B86C] to-[#11998E] shadow flex items-center justify-center">
              <Box className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm leading-none text-[#111827]">Design Walla</p>
              <p className="text-[10px] text-[#9CA3AF] mt-1 uppercase tracking-widest font-semibold">Admin Panel</p>
            </div>
            <div
              className="shrink-0"
              title={
                connected === null ? 'Checking connection…'
                  : connected ? 'Database connected'
                  : 'Database disconnected'
              }
            >
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  connected === null ? 'bg-yellow-400 animate-pulse'
                    : connected ? 'bg-[#24B86C]'
                    : 'bg-red-500'
                }`}
              />
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-5 overflow-y-auto space-y-5 hide-scrollbar">
            {ADMIN_NAV.map(group => (
              <div key={group.group}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF] px-3 mb-1.5">
                  {group.group}
                </p>
                <div className="space-y-0.5">
                  {group.items.map(item => {
                    const isActive = item.href === '/admin'
                      ? pathname === '/admin'
                      : pathname?.startsWith(item.href);
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`
                          flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                          ${isActive
                            ? 'bg-[#F0FDF4] text-[#24B86C] font-semibold'
                            : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#F4F6F8]'
                          }
                        `}
                      >
                        <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#24B86C]' : 'text-[#9CA3AF]'}`} />
                        <span className="truncate">{item.name}</span>
                        {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-[#24B86C] opacity-60" />}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Bottom actions */}
          <div className="p-3 border-t border-[#E5E7EB] space-y-0.5 shrink-0">
            <div className="flex items-center gap-2 px-3 py-2 text-xs text-[#9CA3AF]">
              <span className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${
                connected === null ? 'bg-yellow-400 animate-pulse'
                  : connected ? 'bg-[#24B86C]'
                  : 'bg-red-500'
              }`} />
              <span className="font-medium truncate">
                {connected === null ? 'Connecting…'
                  : connected ? 'Database Online'
                  : 'Database Offline'}
              </span>
            </div>
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-[#6B7280] hover:text-[#24B86C] hover:bg-[#F0FDF4] transition-all duration-150"
            >
              <ExternalLink className="w-4 h-4 shrink-0" />
              <span>View Storefront</span>
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-[#6B7280] hover:text-red-500 hover:bg-red-50 transition-all duration-150"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Sign Out</span>
            </Link>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="min-w-0 p-5 md:p-8 overflow-x-hidden overflow-y-auto w-full min-h-screen">
          <div className="max-w-6xl mx-auto w-full">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}
