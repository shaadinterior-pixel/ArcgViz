"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, User, Menu, X, ChevronDown, Upload, Bookmark } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ThemeToggle } from '../theme/ThemeToggle';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Auto-focus the search input when the mobile search bar opens
  useEffect(() => {
    if (isMobileSearchOpen) {
      setTimeout(() => mobileSearchRef.current?.focus(), 50);
    }
  }, [isMobileSearchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
      setIsMobileSearchOpen(false);
      setSearchQuery('');
    }
  };

  const closeMobileSearch = () => {
    setIsMobileSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <header suppressHydrationWarning className="sticky top-4 z-50 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="h-16 flex items-center justify-between bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 border border-border/40 rounded-full px-6 shadow-sm">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3 shrink-0">
          <Image src="/DESIGN WALLA LOGO .jpg" alt="Design Walla Logo" width={40} height={40} className="rounded-md object-cover shadow-sm" />
          <div className="hidden sm:flex flex-col">
            <span className="font-bold text-xl tracking-tight leading-none flex gap-1">
              <span className="text-black font-black">DESIGN</span>
              <span className="bg-gradient-to-r from-[#24B86C] to-[#11998E] bg-clip-text text-transparent font-black">WALLA</span>
            </span>
            <span className="text-[10px] text-muted-foreground font-medium mt-0.5">Smart Logon Ka Smart Solution</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link href="/products" className="transition-colors hover:text-primary flex items-center gap-1">Marketplace <ChevronDown className="w-3 h-3" /></Link>
          <Link href="/services" className="transition-colors hover:text-primary flex items-center gap-1 text-foreground/80">Services <ChevronDown className="w-3 h-3" /></Link>
          <Link href="/resources" className="transition-colors hover:text-primary flex items-center gap-1 text-foreground/80">Resources <ChevronDown className="w-3 h-3" /></Link>
          <Link href="/pricing" className="transition-colors hover:text-primary text-foreground/80">Pricing</Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <Link href="/login" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors text-foreground/90">
            <User className="w-4 h-4" />
            Login
          </Link>
          <Button className="bg-black text-white hover:bg-black/90 rounded-full h-10 px-5 flex items-center gap-2 font-semibold">
            <Upload className="w-4 h-4" />
            Upload
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bookmark className="w-5 h-5 text-foreground/80" />
          </Button>
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

      {/* ── Mobile Search Bar (slide-down) ─────────────────────────────────── */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out absolute top-20 left-4 right-4 rounded-3xl z-40 ${
          isMobileSearchOpen ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="border border-border/40 bg-background/95 backdrop-blur px-4 py-3 shadow-lg rounded-3xl">
          <form onSubmit={handleSearch} className="relative flex items-center">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              ref={mobileSearchRef}
              type="search"
              placeholder="Search 3D assets, models, textures..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Escape' && closeMobileSearch()}
              className="w-full bg-secondary/50 border-border/50 pl-10 pr-20 focus-visible:ring-1 focus-visible:ring-primary rounded-full h-11 transition-colors focus:bg-background text-sm"
            />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-9 px-4 text-xs font-bold bg-primary text-primary-foreground rounded-full hover:bg-primary/90 active:scale-95 transition-all"
            >
              Search
            </button>
          </form>
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
