"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { Search, User, Menu, X, ChevronDown, ShoppingBag, Briefcase, Grid3X3, Palette, Monitor, Film, Printer, Megaphone, Box, Layers, PenTool, Video } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Button } from '../ui/Button';
import { LiveSearch } from '../ui/LiveSearch';
import { getCurrentUser, onAuthChange, type AuthUser } from '@/lib/auth';
import { fetchCategories, type Category } from '@/lib/store';

// Static service categories matching the platform
const SERVICE_CATEGORIES = [
  { label: 'Interior / Exterior Design', icon: Layers, href: '/services#interior' },
  { label: '3D Model & Product Design', icon: Box, href: '/services#3d-model' },
  { label: 'Digital Marketing', icon: Megaphone, href: '/services#digital-marketing' },
  { label: 'Company Branding', icon: Palette, href: '/services#branding' },
  { label: 'Website / Apps / Software', icon: Monitor, href: '/services#web' },
  { label: 'Animation & Motion Graphic', icon: Film, href: '/services#animation' },
  { label: 'Graphic Design', icon: PenTool, href: '/services#graphic' },
  { label: 'Video Editing', icon: Video, href: '/services#video' },
  { label: 'Printing Work', icon: Printer, href: '/services#printing' },
];

// Dropdown component with hover logic
function NavDropdown({ label, href, children }: { label: string; href: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setOpen(true);
  };
  const handleMouseLeave = () => {
    timerRef.current = setTimeout(() => setOpen(false), 120);
  };

  return (
    <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <Link
        href={href}
        className="transition-colors hover:text-[#24B86C] flex items-center gap-1 text-sm font-medium text-foreground/80 py-5"
      >
        {label}
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </Link>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-[200]"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [hidden, setHidden] = useState(false);
  const [marketplaceCategories, setMarketplaceCategories] = useState<Category[]>([]);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (latest: number) => {
    const previous = scrollY.getPrevious() || 0;
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

  useEffect(() => {
    fetchCategories().then(setMarketplaceCategories).catch(() => {});
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

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex items-center space-x-2 text-sm font-medium">

            {/* Marketplace Dropdown */}
            <NavDropdown label="Marketplace" href="/products">
              <div className="bg-white border border-[#E2EDE8] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] p-4 w-[320px]">
                <div className="flex items-center gap-2 mb-3 px-2">
                  <ShoppingBag className="w-4 h-4 text-[#24B86C]" />
                  <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Browse Categories</span>
                </div>
                <div className="grid grid-cols-1 gap-0.5">
                  <Link
                    href="/products"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#DDF0E9] group transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#24B86C]/10 flex items-center justify-center shrink-0 group-hover:bg-[#24B86C]/20 transition-colors">
                      <Grid3X3 className="w-3.5 h-3.5 text-[#24B86C]" />
                    </div>
                    <span className="text-[13px] font-bold text-[#0D1A12]">All Products</span>
                  </Link>
                  {marketplaceCategories.slice(0, 9).map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/products?search=${encodeURIComponent(cat.title)}`}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#DDF0E9] group transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0 group-hover:bg-[#24B86C]/20 transition-colors">
                        <Box className="w-3.5 h-3.5 text-zinc-500 group-hover:text-[#24B86C] transition-colors" />
                      </div>
                      <span className="text-[13px] font-medium text-zinc-700 group-hover:text-[#0D1A12] transition-colors">{cat.title}</span>
                    </Link>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-[#E2EDE8]">
                  <Link href="/products" className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-[#0D1A12] hover:bg-[#24B86C] text-white text-[12px] font-bold transition-colors">
                    View All Products →
                  </Link>
                </div>
              </div>
            </NavDropdown>

            {/* Services Dropdown */}
            <NavDropdown label="Services" href="/services">
              <div className="bg-white border border-[#E2EDE8] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] p-4 w-[320px]">
                <div className="flex items-center gap-2 mb-3 px-2">
                  <Briefcase className="w-4 h-4 text-[#24B86C]" />
                  <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Our Services</span>
                </div>
                <div className="grid grid-cols-1 gap-0.5">
                  {SERVICE_CATEGORIES.map((svc) => (
                    <Link
                      key={svc.label}
                      href={svc.href}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#DDF0E9] group transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0 group-hover:bg-[#24B86C]/20 transition-colors">
                        <svc.icon className="w-3.5 h-3.5 text-zinc-500 group-hover:text-[#24B86C] transition-colors" />
                      </div>
                      <span className="text-[13px] font-medium text-zinc-700 group-hover:text-[#0D1A12] transition-colors">{svc.label}</span>
                    </Link>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-[#E2EDE8]">
                  <Link href="/services" className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-[#0D1A12] hover:bg-[#24B86C] text-white text-[12px] font-bold transition-colors">
                    Hire Our Team →
                  </Link>
                </div>
              </div>
            </NavDropdown>

            <Link href="/resources" className="transition-colors hover:text-[#24B86C] flex items-center gap-1 text-sm font-medium text-foreground/80 px-2">Resources</Link>
            <Link href="/pricing" className="transition-colors hover:text-[#24B86C] text-sm font-medium text-foreground/80 px-2">Pricing</Link>
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
              <Link href="/login" className="flex items-center gap-2 text-sm font-medium hover:text-[#24B86C] transition-colors text-foreground/90 pl-2">
                <User className="w-4 h-4" />
                Login
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Action Row */}
        <div className="flex md:hidden items-center space-x-1">
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

      {/* ── Mobile Search Bar ──────────────────────────────────── */}
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

      {/* ── Mobile Menu (Slide-over Drawer) ──────────────────────── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-[#0D1A12]/40 backdrop-blur-sm z-[100] md:hidden"
              style={{ top: '-1rem', left: '-1rem', right: '-1rem', height: '110vh' }}
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

              <div className="p-6 flex-1 bg-white overflow-y-auto">
                <nav className="flex flex-col space-y-1">
                  <Link href="/" className="text-base font-bold text-[#0D1A12] py-3 border-b border-zinc-100" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
                  <Link href="/products" className="text-base font-bold text-[#0D1A12] py-3 border-b border-zinc-100" onClick={() => setIsMobileMenuOpen(false)}>Marketplace</Link>

                  {/* Mobile Categories */}
                  {marketplaceCategories.slice(0, 6).map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/products?search=${encodeURIComponent(cat.title)}`}
                      className="text-sm font-medium text-zinc-500 py-2 pl-4 border-b border-zinc-50 hover:text-[#24B86C]"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      → {cat.title}
                    </Link>
                  ))}

                  <Link href="/services" className="text-base font-bold text-[#0D1A12] py-3 border-b border-zinc-100 mt-2" onClick={() => setIsMobileMenuOpen(false)}>Services</Link>
                  <Link href="/resources" className="text-base font-bold text-zinc-600 py-3 border-b border-zinc-100" onClick={() => setIsMobileMenuOpen(false)}>Resources</Link>
                  <Link href="/pricing" className="text-base font-bold text-zinc-600 py-3 border-b border-zinc-100" onClick={() => setIsMobileMenuOpen(false)}>Pricing</Link>

                  {user ? (
                    <Link href="/profile" className="text-base font-bold text-[#24B86C] mt-4 py-3" onClick={() => setIsMobileMenuOpen(false)}>My Profile</Link>
                  ) : (
                    <Link href="/login" className="text-base font-bold text-[#24B86C] mt-4 py-3" onClick={() => setIsMobileMenuOpen(false)}>Login / Signup</Link>
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
