"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { Search, ShoppingCart, User, Menu, X, ChevronDown, Upload, Bookmark } from 'lucide-react';
import { Button } from '../ui/Button';
import { ThemeToggle } from '../theme/ThemeToggle';
import { LiveSearch } from '../ui/LiveSearch';
import { getCurrentUser, onAuthChange, type AuthUser } from '@/lib/auth';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    getCurrentUser().then(setUser);
    return onAuthChange((u) => setUser(u));
  }, []);



  return (
    <header suppressHydrationWarning className="fixed top-4 left-0 right-0 z-50 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="h-16 flex items-center justify-between bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70 border border-[#E2EDE8] rounded-full px-6 shadow-[0_4px_24px_rgba(36,184,108,0.08)]">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3 shrink-0">
          <Image src="/DESIGN WALLA LOGO .jpg" alt="Design Walla Logo" width={40} height={40} className="object-contain mix-blend-multiply contrast-125 brightness-110" style={{ mixBlendMode: 'multiply' }} />
          <div className="hidden sm:flex flex-col">
            <span className="font-bold text-xl tracking-tight leading-none flex gap-1">
              <span className="text-black font-black">DESIGN</span>
              <span className="bg-gradient-to-r from-[#24B86C] to-[#11998E] bg-clip-text text-transparent font-black">WALLA</span>
            </span>
            <span className="text-[10px] text-muted-foreground font-medium -mt-0.5">Smart Logon Ka Smart Solution</span>
          </div>
        </Link>

        {/* Desktop Right Side (Nav + Actions) */}
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/products" className="transition-colors hover:text-primary flex items-center gap-1">Marketplace <ChevronDown className="w-3 h-3" /></Link>
            <Link href="/#services" className="transition-colors hover:text-primary flex items-center gap-1 text-foreground/80">Services <ChevronDown className="w-3 h-3" /></Link>
            <Link href="/resources" className="transition-colors hover:text-primary flex items-center gap-1 text-foreground/80">Resources <ChevronDown className="w-3 h-3" /></Link>
            <Link href="/pricing" className="transition-colors hover:text-primary text-foreground/80">Pricing</Link>
          </nav>

          {/* Divider */}
          <div className="w-px h-5 bg-zinc-200" />

          {/* Desktop Actions */}
          <div className="flex items-center space-x-3">
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-zinc-100">
                <ShoppingCart className="h-5 w-5 text-zinc-700" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
              </Button>
            </Link>

            {user ? (
              <Link href="/profile" className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-100 hover:bg-zinc-200 transition-colors border border-zinc-200" title="View Profile">
                <User className="w-5 h-5 text-zinc-600" />
              </Link>
            ) : (
              <Link href="/login" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors text-foreground/90 pl-2">
                <User className="w-4 h-4" />
                Login
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Action Row */}
        <div className="flex md:hidden items-center space-x-1">
          {/* Search icon — toggles the search bar */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => {
              setIsMobileSearchOpen(v => !v);
              setIsMobileMenuOpen(false);
            }}
            aria-label="Search"
          >
            {isMobileSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </Button>

          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative rounded-full">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setIsMobileMenuOpen(v => !v);
              setIsMobileSearchOpen(false);
            }}
            aria-label="Menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* ── Mobile Search Bar (slide-down) ────────────────────────────────────────── */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out absolute top-20 left-4 right-4 rounded-3xl z-40 ${
          isMobileSearchOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="border border-[#E2EDE8] bg-white/95 backdrop-blur px-4 py-3 shadow-lg rounded-3xl">
          <LiveSearch
            autoFocus={isMobileSearchOpen}
            onClose={() => setIsMobileSearchOpen(false)}
          />
        </div>
      </div>

      {/* ── Mobile Menu ─────────────────────────────────────────────────────── */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out absolute top-20 left-4 right-4 rounded-3xl z-40 ${
          isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="border border-border/40 bg-background/95 backdrop-blur px-4 py-6 space-y-4 shadow-lg rounded-3xl">
          <div className="flex justify-between items-center px-1">
            <span className="text-sm font-medium">Theme</span>
            <ThemeToggle />
          </div>
          <nav className="flex flex-col space-y-3 pt-2">
            <Link href="/" className="text-sm font-medium py-1" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
            <Link href="/products" className="text-sm font-medium py-1" onClick={() => setIsMobileMenuOpen(false)}>Marketplace</Link>
            <Link href="/collections" className="text-sm font-medium text-muted-foreground py-1" onClick={() => setIsMobileMenuOpen(false)}>Collections</Link>
            <Link href="/about" className="text-sm font-medium text-muted-foreground py-1" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
            <Link href="/login" className="text-sm font-medium text-primary mt-2 py-1" onClick={() => setIsMobileMenuOpen(false)}>Login / Signup</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
