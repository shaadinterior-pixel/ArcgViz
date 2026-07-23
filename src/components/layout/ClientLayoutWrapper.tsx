"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

/**
 * Conditionally renders the public Navbar + Footer.
 * Admin routes (/admin/*) have their own full-screen layout so we
 * skip the public navigation there entirely.
 */
export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    // Admin pages manage their own layout (sidebar + main)
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen w-full max-w-[100vw] overflow-x-hidden relative">
      <Navbar />
      <div className="h-24 shrink-0" /> {/* Global spacer to offset fixed Navbar */}
      <main className="flex-1 w-full flex flex-col">
        {children}
      </main>
      <Footer />
    </div>
  );
}
