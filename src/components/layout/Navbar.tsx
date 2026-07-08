"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { Search, ShoppingCart, User, Menu, X, ChevronDown, Upload, Bookmark } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Button } from '../ui/Button';
import { LiveSearch } from '../ui/LiveSearch';
import { getCurrentUser, onAuthChange, type AuthUser } from '@/lib/auth';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (latest: number) => {
    const previous = scrollY.getPrevious() || 0;
    // Hide navbar if scrolled down past 150px
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  useEffect(() => {
    getCurrentUser().then(setUser);
    return onAuthChange((u) => setUser(u));
  }, []);

  return (
    <motion.header 
      suppressHydrationWarning 
      variants={{ visible: { y: 0 }, hidden: { y: "-150%" } }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="fixed top-4 left-0 right-0 z-50 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 gpu-layer"
    >
      <div className="h-16 flex items-center justify-between bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70 border border-[#E2EDE8] rounded-full px-6 shadow-[0_4px_24px_rgba(36,184,108,0.08)]">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3 shrink-0">
          <Image src="/DESIGN_WALLA_LOGO_-removebg-preview.png" alt="Design Walla Logo" width={40} height={40} className="object-contain" />
          <div className="flex flex-col">
            <span className="font-bold text-lg sm:text-xl tracking-tight leading-none flex gap-1">
              <span className="text-black font-black">DESIGN</span>
              <span className="bg-gradient-to-r from-[#24B86C] to-[#11998E] bg-clip-text text-transparent font-black">WALLA</span>
            </span>
            <span className="hidden sm:block text-[10px] text-muted-foreground font-medium -mt-0.5">Smart Logon Ka Smart Solution</span>
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

      {/* ── Mobile Menu (Slide-over Drawer) ─────────────────────────────────── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-[#0D1A12]/40 backdrop-blur-sm z-[100] md:hidden"
              style={{ top: '-1rem', left: '-1rem', right: '-1rem', height: '110vh' }} // to cover the whole screen despite navbar margins
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 w-full max-w-[300px] h-screen bg-white z-[110] shadow-2xl overflow-y-auto flex flex-col md:hidden"
              style={{ top: '-1rem', right: '-1rem', height: '110vh' }}
            >
              <div className="p-6 pt-10 flex items-center justify-between border-b border-[#E2EDE8] bg-white">
                <span className="font-black text-xl text-[#0D1A12]">Menu</span>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-colors text-zinc-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 flex-1 bg-white">
                <nav className="flex flex-col space-y-4">
                  <Link href="/" className="text-lg font-bold text-[#0D1A12] py-2 border-b border-zinc-100" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
                  <Link href="/products" className="text-lg font-bold text-[#0D1A12] py-2 border-b border-zinc-100" onClick={() => setIsMobileMenuOpen(false)}>Marketplace</Link>
                  <Link href="/#services" className="text-lg font-bold text-zinc-600 py-2 border-b border-zinc-100" onClick={() => setIsMobileMenuOpen(false)}>Services</Link>
                  <Link href="/resources" className="text-lg font-bold text-zinc-600 py-2 border-b border-zinc-100" onClick={() => setIsMobileMenuOpen(false)}>Resources</Link>
                  <Link href="/pricing" className="text-lg font-bold text-zinc-600 py-2 border-b border-zinc-100" onClick={() => setIsMobileMenuOpen(false)}>Pricing</Link>
                  
                  {user ? (
                    <Link href="/profile" className="text-lg font-bold text-[#24B86C] mt-4 py-2" onClick={() => setIsMobileMenuOpen(false)}>My Profile</Link>
                  ) : (
                    <Link href="/login" className="text-lg font-bold text-[#24B86C] mt-4 py-2" onClick={() => setIsMobileMenuOpen(false)}>Login / Signup</Link>
                  )}
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
