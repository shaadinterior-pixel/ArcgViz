"use client";

import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';

import { Search, User, Menu, X, ChevronDown, ShoppingBag, Briefcase, Grid3X3, Palette, Monitor, Film, Printer, Megaphone, Box, Layers, PenTool, Video, QrCode, Sparkles, Wand2, FileImage, LayoutTemplate } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Button } from '../ui/Button';
import { LiveSearch } from '../ui/LiveSearch';
import { getCurrentUser, onAuthChange, type AuthUser } from '@/lib/auth';
import { fetchCategories, fetchServices, fetchProducts, type Category, type ServiceDetail, type Product } from '@/lib/store';

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

// Mega menu dropdown - uses React Portal to escape CSS transform stacking context
function MegaMenuDropdown({ label, href, children, width = 'full' }: { label: string; href: string; children: React.ReactNode; width?: 'full' | 'auto' | 'sm' | 'md' }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0, centerX: 0 });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  const calcPos = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    
    // Max width for full menus
    const dropW = Math.min(960, window.innerWidth * 0.95);
    const centerX = rect.left + rect.width / 2;
    
    let left = centerX - dropW / 2;
    left = Math.max(12, Math.min(left, window.innerWidth - dropW - 12));
    
    setPos({ top: rect.bottom + 8, left, width: dropW, centerX });
  };

  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    calcPos();
    setOpen(true);
  };
  const handleMouseLeave = () => {
    timerRef.current = setTimeout(() => setOpen(false), 150);
  };

  // Determine wrapper styles based on width prop
  const getPortalStyles = (): React.CSSProperties => {
    if (width === 'full') {
      return { position: 'fixed', top: pos.top, left: pos.left, width: pos.width, zIndex: 99999 };
    }
    // For smaller menus, center them exactly under the trigger
    return { position: 'fixed', top: pos.top, left: pos.centerX, transform: 'translateX(-50%)', zIndex: 99999 };
  };

  return (
    <>
      <div ref={triggerRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <Link
          href={href}
          className="transition-colors hover:text-[#24B86C] flex items-center gap-1 text-sm font-medium text-foreground/80 py-5"
        >
          {label}
          <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </Link>
      </div>
      {mounted && open && ReactDOM.createPortal(
        <div
          style={getPortalStyles()}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </div>,
        document.body
      )}
    </>
  );
}

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [hidden, setHidden] = useState(false);
  const [marketplaceCategories, setMarketplaceCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<ServiceDetail[]>([]);
  const [latestProduct, setLatestProduct] = useState<Product | null>(null);
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);
  const [printProducts, setPrintProducts] = useState<Product[]>([]);
  const [mobileExpandedMenu, setMobileExpandedMenu] = useState<string | null>(null);

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

  useEffect(() => {
    fetchServices().then(setServices).catch(() => {});
  }, []);

  useEffect(() => {
    fetchProducts().then(products => {
      if (products && products.length > 0) {
        setLatestProduct(products[0]);
        setLatestProducts(products.slice(0, 5));
        setPrintProducts(products.filter(p => p.category?.toLowerCase().includes('print') || p.subcategory?.toLowerCase().includes('print')));
      }
    }).catch(() => {});
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

            {/* Marketplace Mega Menu */}
            <MegaMenuDropdown label="Marketplace" href="/products" width="full">
              <div className="bg-white border border-[#E2EDE8] rounded-[24px] shadow-[0_40px_100px_rgba(0,0,0,0.12)] p-6 flex gap-6 w-full">
                
                {/* Left: Quick Categories / Latest Uploads */}
                <div className="flex-1 border-r border-[#E2EDE8] pr-6">
                  <div className="flex items-center gap-2 mb-4">
                    <ShoppingBag className="w-4 h-4 text-[#24B86C]" />
                    <span className="text-[11px] font-black uppercase tracking-widest text-zinc-500">Latest Uploads</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Link href="/products" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F3F6F5] group transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-[#24B86C]/10 flex items-center justify-center shrink-0 group-hover:bg-[#24B86C]/20 transition-colors">
                        <Grid3X3 className="w-4 h-4 text-[#24B86C]" />
                      </div>
                      <span className="text-[13px] font-bold text-[#0D1A12]">All Products</span>
                    </Link>
                    
                    {latestProducts.map((prod) => (
                      <Link
                        key={prod.id}
                        href={`/products/${prod.slug}`}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F3F6F5] group transition-colors"
                        title={prod.name}
                      >
                        <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center shrink-0 border border-transparent group-hover:border-[#E2EDE8] group-hover:bg-white transition-all overflow-hidden relative">
                          {prod.thumbnail_url || prod.image ? (
                            <img src={prod.thumbnail_url || prod.image} alt={prod.name} className="w-full h-full object-cover" />
                          ) : (
                            <Box className="w-4 h-4 text-zinc-400 group-hover:text-[#24B86C] transition-colors" />
                          )}
                        </div>
                        <span className="text-[13px] font-medium text-zinc-600 group-hover:text-[#0D1A12] transition-colors line-clamp-1">{prod.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Right: Featured Marketplace Promo */}
                <div className="w-[300px] shrink-0 bg-[#F8FAF9] rounded-[20px] p-2 border border-[#E2EDE8]">
                  <Link href={latestProduct ? `/products/${latestProduct.slug}` : "/products"} className="group block relative w-full h-[162px] rounded-2xl overflow-hidden shadow-sm border border-transparent hover:border-[#24B86C]/30 transition-all">
                    <Image 
                      src={latestProduct?.thumbnail_url || latestProduct?.image || "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=600"} 
                      alt={latestProduct?.name || "Featured Assets"} 
                      fill 
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    
                    {latestProduct && (
                      <div className="absolute top-3 right-3 bg-[#24B86C] text-white text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full shadow-lg">
                        New Release
                      </div>
                    )}

                    <div className="absolute bottom-4 left-4 right-4">
                      <h4 className="text-white font-black text-sm tracking-wide mb-1 line-clamp-1">{latestProduct?.name || "Premium 3D Assets"}</h4>
                      <p className="text-white/80 text-[11px] font-medium line-clamp-1">
                        {latestProduct ? `In ${latestProduct.category}` : "Explore high-quality models."}
                      </p>
                    </div>
                  </Link>
                </div>
                
              </div>
            </MegaMenuDropdown>

            {/* Services Dropdown */}
            <MegaMenuDropdown label="Services" href="/services">
              <div className="bg-white border border-[#E2EDE8] rounded-[24px] shadow-[0_40px_100px_rgba(0,0,0,0.12)] p-6 md:p-8 flex flex-col md:flex-row gap-8 w-full">
                
                {/* Left Side: Categories List (Amazon style) */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[#E2EDE8]">
                    <Briefcase className="w-5 h-5 text-[#24B86C]" />
                    <h2 className="text-base font-black text-[#111111] uppercase tracking-wide">
                      Our Services
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                    {SERVICE_CATEGORIES.map((svc) => (
                      <Link
                        key={svc.label}
                        href={svc.href}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#F3F6F5] group transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:shadow-sm border border-transparent group-hover:border-[#E2EDE8] transition-all">
                          <svc.icon className="w-4 h-4 text-zinc-400 group-hover:text-[#24B86C] transition-colors" />
                        </div>
                        <span className="text-[13px] font-bold text-zinc-600 group-hover:text-[#111111] transition-colors">{svc.label}</span>
                      </Link>
                    ))}
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-[#E2EDE8]">
                    <Link href="/services" className="inline-flex items-center gap-2 text-[13px] font-bold text-[#24B86C] hover:text-[#1E995A] transition-colors">
                      View All Services →
                    </Link>
                  </div>
                </div>

                {/* Right Side: Featured Services (Promo Cards) */}
                <div className="w-[320px] shrink-0 bg-[#F8FAF9] rounded-[20px] p-5 border border-[#E2EDE8]">
                  <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-4">Featured Services</h3>
                  
                  {services.length === 0 ? (
                    <div className="flex justify-center items-center py-10">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#24B86C]"></div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {services.slice(0, 2).map((service, index) => {
                        const slug = service.id || service.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || index.toString();
                        return (
                          <Link href={`/services/${slug}`} key={service.id || index} className="group flex gap-4 items-center bg-white p-3 rounded-2xl shadow-sm border border-[#E2EDE8] hover:border-[#24B86C] transition-colors">
                            <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
                              <Image 
                                src={service.image || 'https://images.unsplash.com/photo-1618220179428-22790b46a0eb?auto=format&fit=crop&q=80&w=600'} 
                                alt={service.category || 'Service'}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                sizes="80px"
                              />
                            </div>
                            <div className="flex flex-col flex-1">
                              <h4 className="text-[11px] font-black text-[#111111] uppercase tracking-wide leading-tight line-clamp-2 mb-1">
                                {service.category}
                              </h4>
                              <span className="text-[10px] font-bold text-[#24B86C] mt-auto">Know More →</span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                  
                  <div className="mt-5">
                    <Link href="/contact">
                      <Button className="w-full bg-[#111111] hover:bg-[#24B86C] text-white rounded-xl text-xs font-bold h-10 transition-colors">
                        Hire Our Team
                      </Button>
                    </Link>
                  </div>
                </div>

              </div>
            </MegaMenuDropdown>

            {/* Print Mega Menu */}
            <MegaMenuDropdown label="Print" href="/products?category=Print" width="full">
              <div className="bg-white border border-[#E2EDE8] rounded-[24px] shadow-[0_40px_100px_rgba(0,0,0,0.12)] p-6 w-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Printer className="w-5 h-5 text-[#24B86C]" />
                    <h2 className="text-base font-black text-[#111111] uppercase tracking-wide">
                      Print Templates
                    </h2>
                  </div>
                  <Link href="/products?category=Print" className="text-[13px] font-bold text-[#24B86C] hover:text-[#1E995A] transition-colors">
                    View All →
                  </Link>
                </div>

                <div className="grid grid-cols-5 gap-4">
                  {printProducts.length > 0 ? (
                    printProducts.slice(0, 5).map(product => (
                      <Link key={product.id} href={`/products/${product.slug}`} className="group bg-white rounded-[20px] overflow-hidden shadow-sm border border-[#E2EDE8] hover:border-[#24B86C]/50 hover:shadow-md transition-all flex flex-col">
                        <div className="relative aspect-[4/3] w-full bg-zinc-100 overflow-hidden p-2">
                          <div className="relative w-full h-full rounded-[14px] overflow-hidden">
                            <Image 
                              src={product.thumbnail_url || product.image || "https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&q=80&w=600"} 
                              alt={product.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        </div>
                        <div className="p-4 flex flex-col flex-1 items-center justify-between">
                          <h4 className="text-[11px] font-black text-[#111111] uppercase tracking-wide text-center line-clamp-2 mb-3">
                            {product.name}
                          </h4>
                          <span className="w-full text-center bg-[#24B86C] hover:bg-[#1E995A] text-white text-[11px] font-bold uppercase tracking-wider py-2.5 rounded-xl transition-colors">
                            KNOW MORE
                          </span>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="col-span-5 py-12 flex flex-col items-center justify-center text-zinc-400">
                      <Printer className="w-8 h-8 mb-2 opacity-30" />
                      <p className="text-sm font-medium">No print products found.</p>
                    </div>
                  )}
                </div>
              </div>
            </MegaMenuDropdown>

            {/* Digital Product Mega Menu */}
            <MegaMenuDropdown label="Digital Product" href="/products?category=Digital" width="md">
              <div className="bg-white border border-[#E2EDE8] rounded-[24px] shadow-[0_40px_100px_rgba(0,0,0,0.12)] p-4 w-[400px]">
                <div className="flex items-center gap-2 mb-3 px-3 pt-2">
                  <Monitor className="w-4 h-4 text-[#24B86C]" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-zinc-500">Digital Assets</span>
                </div>
                <div className="grid grid-cols-1 gap-1">
                  <Link href="/products?category=Templates" className="flex items-center gap-4 p-3 rounded-2xl hover:bg-[#F3F6F5] group transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-[#E2EDE8]">
                      <LayoutTemplate className="w-5 h-5 text-zinc-400 group-hover:text-[#24B86C]" />
                    </div>
                    <div>
                      <h4 className="text-[13px] font-bold text-[#111111] leading-tight">Website Templates</h4>
                      <p className="text-[11px] text-zinc-500 mt-0.5">Responsive UI kits and landing pages.</p>
                    </div>
                  </Link>
                  <Link href="/products?category=Icons" className="flex items-center gap-4 p-3 rounded-2xl hover:bg-[#F3F6F5] group transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-[#E2EDE8]">
                      <Sparkles className="w-5 h-5 text-zinc-400 group-hover:text-[#24B86C]" />
                    </div>
                    <div>
                      <h4 className="text-[13px] font-bold text-[#111111] leading-tight">Icons & Graphics</h4>
                      <p className="text-[11px] text-zinc-500 mt-0.5">Premium vector packs and illustrations.</p>
                    </div>
                  </Link>
                  <Link href="/products?category=3D+Assets" className="flex items-center gap-4 p-3 rounded-2xl hover:bg-[#F3F6F5] group transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-[#E2EDE8]">
                      <Box className="w-5 h-5 text-zinc-400 group-hover:text-[#24B86C]" />
                    </div>
                    <div>
                      <h4 className="text-[13px] font-bold text-[#111111] leading-tight">3D Assets</h4>
                      <p className="text-[11px] text-zinc-500 mt-0.5">High-poly models and textures.</p>
                    </div>
                  </Link>
                </div>
              </div>
            </MegaMenuDropdown>

            {/* DW Tools Mega Menu */}
            <MegaMenuDropdown label="DW Tools" href="/tools" width="md">
              <div className="bg-white border border-[#E2EDE8] rounded-[24px] shadow-[0_40px_100px_rgba(0,0,0,0.12)] p-4 w-[400px]">
                <div className="flex items-center gap-2 mb-3 px-3 pt-2">
                  <Wand2 className="w-4 h-4 text-[#24B86C]" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-zinc-500">Creative Utilities</span>
                </div>
                <div className="grid grid-cols-1 gap-1">
                  <Link href="/studio" className="flex items-center gap-4 p-3 rounded-2xl bg-[#E8F5F1] hover:bg-[#DDF0E9] group transition-colors border border-[#24B86C]/10">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#24B86C] to-[#11998E] flex items-center justify-center shadow-md">
                      <QrCode className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[13px] font-bold text-[#111111] leading-tight">QR Code Studio</h4>
                        <span className="text-[9px] font-black uppercase text-[#24B86C] bg-white px-2 py-0.5 rounded-full shadow-sm">Live</span>
                      </div>
                      <p className="text-[11px] text-zinc-600 mt-1">Generate branded, high-quality QR codes.</p>
                    </div>
                  </Link>
                  
                  <Link href="/tools" className="flex items-center gap-4 p-3 rounded-2xl hover:bg-[#F3F6F5] group transition-colors mt-1">
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-[#E2EDE8]">
                      <Sparkles className="w-5 h-5 text-zinc-400 group-hover:text-[#24B86C]" />
                    </div>
                    <div>
                      <h4 className="text-[13px] font-bold text-[#111111] leading-tight">More Tools</h4>
                      <p className="text-[11px] text-zinc-500 mt-0.5">Explore our full suite of creative tools.</p>
                    </div>
                  </Link>
                </div>
              </div>
            </MegaMenuDropdown>

            <Link href="/pricing" className="transition-colors hover:text-[#24B86C] text-sm font-medium text-foreground/80 px-2">Pricing</Link>
          </nav>

          {/* Divider */}
          <div className="w-px h-5 bg-zinc-200" />

          {/* Desktop Actions */}
          <div className="flex items-center space-x-3">
            {user ? (
              <Link href="/profile" className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[#24B86C] to-[#11998E] shadow-md hover:shadow-lg transition-all border-2 border-white overflow-hidden" title="View Profile">
                {(user as any).photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={(user as any).photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-black text-sm">
                    {(user as any).displayName?.charAt(0)?.toUpperCase() || (user as any).email?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                )}
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
                {user ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#24B86C] to-[#11998E] shadow-sm flex items-center justify-center overflow-hidden border-2 border-white">
                      {(user as any).photoURL ? (
                        <img src={(user as any).photoURL} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white font-black text-sm">
                          {(user as any).displayName?.charAt(0)?.toUpperCase() || (user as any).email?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-lg text-[#0D1A12]">{(user as any).displayName?.split(' ')[0] || 'My Profile'}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-zinc-400" />
                    </div>
                    <span className="font-bold text-lg text-[#0D1A12]">Guest</span>
                  </div>
                )}
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
                  
                  {/* Marketplace Accordion */}
                  <div className="border-b border-zinc-100">
                    <button 
                      className="w-full text-left flex justify-between items-center text-base font-bold text-[#0D1A12] py-3 outline-none"
                      onClick={() => setMobileExpandedMenu(mobileExpandedMenu === 'marketplace' ? null : 'marketplace')}
                    >
                      Marketplace
                      <ChevronDown className={`w-4 h-4 transition-transform text-zinc-400 ${mobileExpandedMenu === 'marketplace' ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {mobileExpandedMenu === 'marketplace' && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                          <div className="flex flex-col space-y-1 pb-3">
                            <Link href="/products" className="text-[13px] font-bold text-zinc-600 py-2 pl-4 border-l-2 border-transparent hover:border-[#24B86C] hover:text-[#24B86C] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                              View All Products
                            </Link>
                            {marketplaceCategories.map((cat) => (
                              <Link
                                key={cat.id}
                                href={`/products?search=${encodeURIComponent(cat.title)}`}
                                className="text-[13px] font-medium text-zinc-500 py-2 pl-4 border-l-2 border-zinc-100 hover:border-[#24B86C] hover:text-[#24B86C] transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                {cat.title}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Services Accordion */}
                  <div className="border-b border-zinc-100">
                    <button 
                      className="w-full text-left flex justify-between items-center text-base font-bold text-[#0D1A12] py-3 outline-none"
                      onClick={() => setMobileExpandedMenu(mobileExpandedMenu === 'services' ? null : 'services')}
                    >
                      Services
                      <ChevronDown className={`w-4 h-4 transition-transform text-zinc-400 ${mobileExpandedMenu === 'services' ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {mobileExpandedMenu === 'services' && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                          <div className="flex flex-col space-y-1 pb-3">
                            <Link href="/services" className="text-[13px] font-bold text-zinc-600 py-2 pl-4 border-l-2 border-transparent hover:border-[#24B86C] hover:text-[#24B86C] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                              View All Services
                            </Link>
                            {SERVICE_CATEGORIES.map((svc) => (
                              <Link
                                key={svc.label}
                                href={svc.href}
                                className="text-[13px] font-medium text-zinc-500 py-2 pl-4 border-l-2 border-zinc-100 hover:border-[#24B86C] hover:text-[#24B86C] transition-colors line-clamp-1"
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                {svc.label}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <Link href="/products?category=Print" className="text-base font-bold text-[#0D1A12] py-3 border-b border-zinc-100" onClick={() => setIsMobileMenuOpen(false)}>Print</Link>
                  <Link href="/products?category=Digital" className="text-base font-bold text-[#0D1A12] py-3 border-b border-zinc-100" onClick={() => setIsMobileMenuOpen(false)}>Digital Product</Link>
                  <Link href="/tools" className="text-base font-bold text-[#0D1A12] py-3 border-b border-zinc-100" onClick={() => setIsMobileMenuOpen(false)}>DW Tools</Link>
                  <Link href="/pricing" className="text-base font-bold text-zinc-600 py-3 border-b border-zinc-100" onClick={() => setIsMobileMenuOpen(false)}>Pricing</Link>

                  {user ? (
                    <Link href="/profile" className="text-base font-bold text-[#24B86C] mt-4 py-3" onClick={() => setIsMobileMenuOpen(false)}>My Profile Dashboard</Link>
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
