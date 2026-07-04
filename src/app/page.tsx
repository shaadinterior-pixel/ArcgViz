"use client";

import React, { useEffect, useRef, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { motion, useScroll, useTransform, AnimatePresence, useSpring } from 'framer-motion';
import { ArrowRight, Star, Download, Play, Search, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CategoryMarquee } from '@/components/ui/CategoryMarquee';
import { WhatWeDoSection } from '@/components/ui/WhatWeDoSection';
import { HowWeWorkSection } from '@/components/ui/HowWeWorkSection';

// ── Lazy-load the heaviest component (CategoryShowcase) ──────────────────────
// It contains 5 stacked scroll-driven sections with spring physics.
// Deferring it lets the hero paint in <1 s even on a 1 GB RAM phone.
const CategoryShowcase = dynamic(
  () => import('@/components/ui/CategoryShowcase').then(m => ({ default: m.CategoryShowcase })),
  { ssr: false }
);

import { fetchProducts, fetchSettings, onStoreUpdate, type Product } from '@/lib/store';

// ── 60-second in-memory cache so navigating back doesn't re-fetch ──────────────
let _productsCache: any[] | null = null;
let _cacheTime = 0;
async function fetchCached() {
  if (_productsCache && Date.now() - _cacheTime < 60_000) return _productsCache;
  const data = await fetchProducts();
  _productsCache = data;
  _cacheTime = Date.now();
  return data;
}

const DEFAULT_HERO = 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1920';

const STATS = [
  { value: '12K+', label: 'Premium Assets' },
  { value: '4.9', label: 'Avg Rating', icon: Star },
  { value: '850+', label: 'Artists' },
  { value: '50K+', label: 'Downloads' },
];

const FLOATING_WORDS = ['Materials', 'Models', 'Textures', 'Scenes', 'Renders'];

// ── Spring config (tuned for snappy, buttery feel) ───────────────────────────
const SPRING_CONFIG = { stiffness: 300, damping: 30, mass: 0.2 };

// ── Detect low-end device (runs once on mount) ──────────────────────────────
function useIsLowEnd(): boolean {
  const [lowEnd, setLowEnd] = useState(false);
  useEffect(() => {
    const nav = navigator as any;
    const mem = nav.deviceMemory;           // Chrome: RAM in GB
    const cores = nav.hardwareConcurrency;  // Logical CPUs
    // Low-end heuristic: ≤ 2 GB RAM *or* ≤ 2 cores
    if ((mem && mem <= 2) || (cores && cores <= 2)) setLowEnd(true);
  }, []);
  return lowEnd;
}

// ── Floating particles (skipped entirely on low-end) ─────────────────────────
function FloatingParticles({ skip }: { skip: boolean }) {
  const [mounted, setMounted] = useState(false);

  const particles = useMemo(
    () =>
      Array.from({ length: skip ? 0 : 10 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 5 + 4,
        delay: Math.random() * 2,
      })),
    [skip]
  );

  useEffect(() => { setMounted(true); }, []);
  if (!mounted || skip) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-primary/30 gpu-layer"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [0, -40, 0], opacity: [0, 0.8, 0], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// ── Main Home page ───────────────────────────────────────────────────────────
export default function Home() {
  const isLowEnd = useIsLowEnd();
  
  // ── True Data Fetching from Supabase ───────────────────────────────────────
  const [trendingProducts, setTrendingProducts] = useState<any[]>([]);
  const [heroImageUrl, setHeroImageUrl] = useState(DEFAULT_HERO);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [data, siteSettings] = await Promise.all([fetchCached(), fetchSettings()]);
        if (!mounted) return;
        if (siteSettings?.heroImageUrl) setHeroImageUrl(siteSettings.heroImageUrl);
        const sorted = data
          .sort((a, b) => (b.sales || 0) - (a.sales || 0))
          .slice(0, 3)
          .map(product => ({
            id: product.id,
            title: product.name,
            author: product.author,
            price: product.price,
            rating: parseFloat(product.rating as any) || 0,
            image: product.image,
          }));
        setTrendingProducts(sorted);
      } catch (e) {
        console.error('Failed to load trending products', e);
      }
    };
    load();
    const unsub = onStoreUpdate('products', load);
    return () => { mounted = false; unsub(); };
  }, []);

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });

  // Direct mapped values (no spring delay) for 1:1 buttery smooth scrolling without lag
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '10%']);
  const opacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
  const orbScale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);

  const [wordIndex, setWordIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setWordIndex(i => (i + 1) % FLOATING_WORDS.length), 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col">
      {/* ─── HERO SECTION ─── */}
      {/* ─── HERO SECTION ─── */}
      <section className="relative min-h-[90vh] flex flex-col justify-center overflow-hidden bg-background pt-24 pb-16">
        
        {/* Glowing Gradient Orbs */}
        <div className="absolute -bottom-32 -left-32 w-[600px] h-[600px] bg-gradient-to-tr from-[#24B86C]/30 to-transparent rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] opacity-80 pointer-events-none" />
        <div className="absolute top-1/4 -right-32 w-[500px] h-[500px] bg-gradient-to-bl from-[#11998E]/30 to-transparent rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-80 pointer-events-none" />

        {/* DW Watermark Text Background (Glowing Green) */}
        <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none flex items-center justify-center z-0 overflow-hidden opacity-20 dark:opacity-30 mix-blend-screen">
           <span className="text-[45vw] font-black leading-none text-transparent bg-gradient-to-br from-[#24B86C] via-[#11998E] to-transparent bg-clip-text select-none drop-shadow-[0_0_100px_rgba(36,184,108,0.8)] filter blur-[2px]">DW</span>
        </div>

        {/* Main grid */}
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Text & CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, staggerChildren: 0.2 }}
            className="flex flex-col gap-6"
          >
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight text-foreground leading-[1.1]"
            >
              One Platform. Infinite <br/> Creative Possibilities.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg text-muted-foreground max-w-xl font-medium leading-relaxed"
            >
              All-Business Digital Ecosystem, Website Templates, Motion Design,
              Imeononjessititos, Gommonnce, Motion Graphics, Digital sirectors,
              Tennniises, Brand Kits, Digital Products, and Exonowore
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap gap-4 mt-4"
            >
              <Button size="lg" className="relative overflow-hidden bg-gradient-to-r from-[#24B86C] to-[#11998E] text-white rounded-lg px-8 py-6 text-base font-bold shadow-lg shadow-[#24B86C]/30 border-0 group hover:shadow-xl hover:shadow-[#24B86C]/40 transition-all duration-300">
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-shine" />
                <span className="relative z-10 flex items-center gap-2">Explore Marketplace <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
              </Button>
              <Button size="lg" variant="outline" className="rounded-lg px-8 py-6 text-base font-bold border-2 border-[#24B86C] text-[#24B86C] hover:bg-[#24B86C]/5 bg-transparent transition-colors duration-300">
                Hire Our Team
              </Button>
              <Button size="lg" variant="outline" className="rounded-lg px-8 py-6 text-base font-bold border-2 border-[#11998E] text-[#11998E] hover:bg-[#11998E]/5 bg-transparent transition-colors duration-300">
                Download Free Assets
              </Button>
            </motion.div>
          </motion.div>

          {/* Right Column: Dynamic Floating Glass Cards - Exact Replica */}
          <div className="relative h-[500px] w-full hidden lg:block z-20">
            {/* Center Main Card - Website Templates */}
            <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 bg-white/20 dark:bg-white/10 backdrop-blur-xl border border-white/40 dark:border-white/20 p-2 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col items-center w-64 z-30 transform scale-110">
              <div className="w-full aspect-[16/10] rounded-xl relative overflow-hidden flex flex-col bg-zinc-900">
                <Image src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=400" alt="Website" fill className="object-cover opacity-90" />
                <div className="absolute top-2 right-2 w-6 h-6 bg-[#24B86C] rounded-full flex items-center justify-center text-white shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="w-full py-2 px-1 text-center bg-white/90 dark:bg-zinc-900/90 rounded-b-xl mt-1 backdrop-blur-sm">
                 <span className="text-sm font-bold text-foreground">Website Templates</span>
              </div>
            </div>

            {/* Top Right - Food Cart Design */}
            <div className="absolute top-[10%] right-[5%] bg-white/20 dark:bg-white/10 backdrop-blur-xl border border-white/40 dark:border-white/20 p-1.5 rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.1)] flex flex-col items-center w-48 z-20 hover:-translate-y-2 transition-transform duration-500">
              <div className="w-full aspect-video rounded-xl relative overflow-hidden bg-[#FCD34D]">
                <Image src="https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=300" alt="Food Cart" fill className="object-cover" />
                <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-[#24B86C] rounded-full flex items-center justify-center text-white shadow-sm">
                  <CheckCircle2 className="w-3 h-3" />
                </div>
              </div>
              <div className="w-full py-1.5 px-1 text-center bg-white/90 dark:bg-zinc-900/90 rounded-b-xl mt-1 backdrop-blur-sm">
                 <span className="text-xs font-bold text-foreground">Food Cart Design</span>
              </div>
            </div>
            
            {/* Top Left - Interior Design */}
            <div className="absolute top-[20%] left-[0%] bg-white/20 dark:bg-white/10 backdrop-blur-xl border border-white/40 dark:border-white/20 p-1.5 rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.1)] flex flex-col items-center w-44 z-20 hover:-translate-y-2 transition-transform duration-500">
              <div className="w-full aspect-video rounded-xl relative overflow-hidden bg-[#E7E5E4]">
                <Image src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=300" alt="Interior" fill className="object-cover" />
                <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-[#24B86C] rounded-full flex items-center justify-center text-white shadow-sm">
                  <CheckCircle2 className="w-3 h-3" />
                </div>
              </div>
              <div className="w-full py-1.5 px-1 text-center bg-white/90 dark:bg-zinc-900/90 rounded-b-xl mt-1 backdrop-blur-sm">
                 <span className="text-xs font-bold text-foreground">Interior Design</span>
              </div>
            </div>

            {/* Bottom Right - Motion Graphics */}
            <div className="absolute top-[65%] right-[0%] bg-white/20 dark:bg-white/10 backdrop-blur-xl border border-white/40 dark:border-white/20 p-1.5 rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.1)] flex flex-col items-center w-52 z-40 hover:-translate-y-2 transition-transform duration-500">
              <div className="w-full aspect-video rounded-xl relative overflow-hidden bg-indigo-950">
                <Image src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=300" alt="Motion" fill className="object-cover opacity-80 mix-blend-luminosity" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-10 h-10 rounded-xl bg-purple-600/80 backdrop-blur-sm flex items-center justify-center">
                     <Play className="w-5 h-5 text-white fill-white" />
                   </div>
                </div>
                <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-[#24B86C] rounded-full flex items-center justify-center text-white shadow-sm">
                  <CheckCircle2 className="w-3 h-3" />
                </div>
              </div>
              <div className="w-full py-1.5 px-1 text-center bg-white/90 dark:bg-zinc-900/90 rounded-b-xl mt-1 backdrop-blur-sm">
                 <span className="text-xs font-bold text-foreground">Motion Graphics</span>
              </div>
            </div>
            
            {/* Bottom Left - Brand Kits */}
            <div className="absolute bottom-[0%] left-[10%] bg-white/20 dark:bg-white/10 backdrop-blur-xl border border-white/40 dark:border-white/20 p-1.5 rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.1)] flex flex-col items-center w-40 z-20 hover:-translate-y-2 transition-transform duration-500">
              <div className="w-full aspect-video rounded-xl relative overflow-hidden bg-white">
                <Image src="https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=300" alt="Brand Kit" fill className="object-contain p-2" />
                <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-[#24B86C] rounded-full flex items-center justify-center text-white shadow-sm">
                  <CheckCircle2 className="w-3 h-3" />
                </div>
              </div>
              <div className="w-full py-1.5 px-1 text-center bg-white/90 dark:bg-zinc-900/90 rounded-b-xl mt-1 backdrop-blur-sm">
                 <span className="text-xs font-bold text-foreground">Brand Kits</span>
              </div>
            </div>

            {/* Bottom Center - 3D Models */}
            <div className="absolute bottom-[-15%] left-[45%] -translate-x-1/2 bg-white/20 dark:bg-white/10 backdrop-blur-xl border border-white/40 dark:border-white/20 p-1.5 rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.1)] flex flex-col items-center w-48 z-40 hover:-translate-y-2 transition-transform duration-500">
              <div className="w-full aspect-[4/3] rounded-xl relative overflow-hidden bg-[#E5E5E5]">
                <Image src="https://images.unsplash.com/photo-1618220179428-22790b46a0eb?auto=format&fit=crop&q=80&w=300" alt="3D Model" fill className="object-cover" />
                <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-[#24B86C] rounded-full flex items-center justify-center text-white shadow-sm">
                  <CheckCircle2 className="w-3 h-3" />
                </div>
              </div>
              <div className="w-full py-1.5 px-1 text-center bg-white/90 dark:bg-zinc-900/90 rounded-b-xl mt-1 backdrop-blur-sm">
                 <span className="text-xs font-bold text-foreground">3D Models</span>
              </div>
            </div>

            {/* Small Floating decorative icons */}
            <div className="absolute top-[35%] left-[25%] w-10 h-10 bg-white/30 dark:bg-white/10 backdrop-blur-md rounded-xl border border-white/40 flex items-center justify-center shadow-lg animate-pulse">
               <span className="text-[#24B86C] font-black text-xl">W</span>
            </div>
            <div className="absolute bottom-[20%] right-[25%] w-12 h-12 bg-white/30 dark:bg-white/10 backdrop-blur-md rounded-xl border border-white/40 flex items-center justify-center shadow-lg">
               <span className="text-[#11998E] font-black text-2xl">D</span>
            </div>
          </div>
        </div>

        {/* Hero Search (Bottom Center) */}
        <div className="relative z-20 w-full max-w-2xl mx-auto mt-20 px-4">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const query = formData.get('search');
              if (query) {
                window.location.href = `/products?search=${encodeURIComponent(query as string)}`;
              }
            }}
            className="relative flex items-center w-full group"
          >
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none z-10">
              <Search className="h-6 w-6 text-muted-foreground/50 group-focus-within:text-[#24B86C] transition-colors" />
            </div>
            <input
              type="text"
              name="search"
              className="w-full h-16 pl-14 pr-20 rounded-full border-2 border-transparent bg-white/50 dark:bg-zinc-900/50 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl text-base font-medium focus:outline-none focus:border-[#24B86C] transition-all text-foreground ring-0"
              placeholder="What are you looking for today?"
              autoComplete="off"
            />
            <div className="absolute inset-y-0 right-2 flex items-center z-10">
              <Button type="submit" size="icon" className="h-12 w-12 rounded-full bg-gradient-to-r from-[#24B86C] to-[#11998E] hover:opacity-90 flex items-center justify-center shadow-lg text-white border-0 transition-opacity">
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Software Marquee */}
      <SoftwareMarquee />

      {/* Category Marquee */}
      <CategoryMarquee />

      {/* What We Do Section */}
      <WhatWeDoSection />

      {/* Category Showcase — lazy loaded */}
      <CategoryShowcase />

      {/* How We Work Section */}
      <HowWeWorkSection />

      {/* Trending Products */}
      <section className="py-24 border-t border-border/40 bg-background">
        <div className="container mx-auto px-4 md:px-8">

          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.25 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-end mb-14 gpu-layer"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3">This Week</p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight">Trending Now</h2>
              <p className="text-muted-foreground mt-3 text-base max-w-md">
                Our most popular assets, handpicked by the community.
              </p>
            </div>
            <Link
              href="/products?sort=trending"
              className="hidden md:flex items-center gap-2 mt-4 md:mt-0 text-sm font-semibold text-primary hover:gap-3 transition-all duration-300 group"
            >
              View all trending
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingProducts.map((product, index) => (
              <div
                key={product.id}
                className="h-full"
              >
                <Link href={`/products/${product.id}`} className="block h-full group">
                  <div className="h-full flex flex-col rounded-2xl overflow-hidden border border-border bg-card">

                    {/* Image */}
                    <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/10' }}>
                      <Image
                        src={product.image || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800'}
                        alt={product.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                        quality={75}
                      />
                      <div className="absolute top-3 right-3 flex items-center justify-center gap-1 bg-background/80 backdrop-blur-sm text-foreground text-xs font-bold px-2.5 py-1 rounded-lg border border-border/60">
                        <Star className="w-3 h-3 text-primary fill-primary" />
                        {product.rating}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex flex-col flex-1 p-5 gap-3">
                      <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                        {product.author}
                      </span>
                      <h3 className="text-base font-bold text-foreground leading-snug line-clamp-2">
                        {product.title}
                      </h3>
                      <div className="flex-1" />
                      <div className="h-px bg-border/60" />
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-black text-foreground">{product.price}</span>
                        <button className="flex items-center justify-center gap-1.5 bg-primary/10 text-primary px-4 py-2 rounded-full">
                          <Download className="w-3.5 h-3.5" />
                          <span className="font-bold text-xs leading-none mt-px">Get</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Mobile CTA */}
          <div className="flex md:hidden justify-center mt-10">
            <Link href="/products?sort=trending" className="flex items-center gap-2 text-sm font-semibold text-primary">
              View all trending <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>
    </div>
  );
}
