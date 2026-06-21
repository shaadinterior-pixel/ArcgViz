"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, User, Menu, X, Box } from 'lucide-react';
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
    <header suppressHydrationWarning className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 shrink-0">
          <Box className="w-8 h-8 text-primary" />
          <span className="font-bold text-xl tracking-tight">ArchViz Market</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link href="/" className="transition-colors hover:text-primary">Home</Link>
          <Link href="/products" className="transition-colors hover:text-primary">Marketplace</Link>
          <Link href="/collections" className="transition-colors hover:text-primary text-foreground/60">Collections</Link>
          <Link href="/about" className="transition-colors hover:text-primary text-foreground/60">About</Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <form onSubmit={handleSearch} className="relative w-64 flex items-center">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-secondary/50 border-border/50 pl-9 pr-12 focus-visible:ring-1 focus-visible:ring-primary rounded-full h-9 transition-colors hover:bg-secondary/80 focus:bg-background"
            />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-3 text-xs font-medium bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
            >
              Search
            </button>
          </form>
          <ThemeToggle />
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative rounded-full">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
            </Button>
          </Link>
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
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileSearchOpen ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="border-t border-border/40 bg-background/95 backdrop-blur px-4 py-3">
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
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="border-t border-border/40 bg-background/95 backdrop-blur px-4 py-6 space-y-4">
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
