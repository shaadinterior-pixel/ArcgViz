"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, User, Menu, X, Box } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ThemeToggle } from '../theme/ThemeToggle';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header suppressHydrationWarning className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
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

        {/* Mobile Menu Toggle */}
        <div className="flex md:hidden items-center space-x-2">
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative rounded-full">
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur px-4 py-6 space-y-4">
          <form onSubmit={handleSearch} className="relative w-full flex items-center">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-secondary/50 border-border/50 pl-9 pr-12 focus-visible:ring-1 focus-visible:ring-primary rounded-full h-10 transition-colors focus:bg-background"
            />
            <button 
              type="submit" 
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-3 text-xs font-medium bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
            >
              Search
            </button>
          </form>
          <div className="flex justify-between items-center px-1">
            <span className="text-sm font-medium">Theme</span>
            <ThemeToggle />
          </div>
          <nav className="flex flex-col space-y-3 pt-2">
            <Link href="/" className="text-sm font-medium" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
            <Link href="/products" className="text-sm font-medium" onClick={() => setIsMobileMenuOpen(false)}>Marketplace</Link>
            <Link href="/collections" className="text-sm font-medium text-muted-foreground" onClick={() => setIsMobileMenuOpen(false)}>Collections</Link>
            <Link href="/about" className="text-sm font-medium text-muted-foreground" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
            <Link href="/login" className="text-sm font-medium text-primary mt-2" onClick={() => setIsMobileMenuOpen(false)}>Login / Signup</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
