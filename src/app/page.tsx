"use client";

import React, { useEffect, useRef, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { motion, useScroll, useTransform, AnimatePresence, useSpring } from 'framer-motion';
import { ArrowRight, Star, Download, Play } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SoftwareMarquee } from '@/components/ui/SoftwareMarquee';

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
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ contain: 'paint layout' }}>

        {/* Parallax background — GPU composited, direct scroll mapping */}
        <motion.div className="absolute inset-0 z-0 gpu-layer pointer-events-none" style={{ y: bgY }}>
          <div className="relative w-full h-[115%]">
            <Image
              src={heroImageUrl}
              alt="Hero background"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
              quality={80}
            />
          </div>
        </motion.div>

        {/* Gradient overlays - optimized for compositing */}
        <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-r from-background/80 via-transparent to-background/80" />

        {/* Orbs — skip on low-end (pure decoration, GPU-heavy) */}
        {!isLowEnd && (
          <>
            <motion.div
              className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full pointer-events-none gpu-layer"
              style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 60%)', scale: orbScale }}
              animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none gpu-layer"
              style={{ background: 'radial-gradient(circle, rgba(139,115,85,0.1) 0%, transparent 60%)' }}
              animate={{ scale: [1.2, 1, 1.2], x: [0, -20, 0], y: [0, 30, 0] }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            />
          </>
        )}

        {/* Floating particles — reduced count, skipped on low-end */}
        <FloatingParticles skip={isLowEnd} />

        {/* Main content */}
        <motion.div
          className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center"
          style={{ y: contentY, opacity }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flex items-center gap-2 py-1.5 px-4 rounded-full mb-8 border border-primary/30 bg-primary/10 backdrop-blur-sm gpu-layer"
          >
            <motion.span
              className="w-2 h-2 rounded-full bg-primary"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-sm font-medium text-primary">World&apos;s #1 ArchViz Marketplace</span>
          </motion.div>

          {/* Headline */}
          <div className="overflow-hidden mb-4">
            <motion.h1
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] max-w-5xl gpu-layer"
            >
              Elevate Your
            </motion.h1>
          </div>
          <div className="overflow-hidden mb-2">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] max-w-5xl flex items-center gap-4 justify-center gpu-layer"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-yellow-300 to-accent">
                3D
              </span>
              <span className="relative overflow-hidden inline-flex h-[1.1em] items-center">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={wordIndex}
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -30, opacity: 0 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="block text-foreground"
                  >
                    {FLOATING_WORDS[wordIndex]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </motion.div>
          </div>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="text-base sm:text-lg md:text-xl text-muted-foreground mt-8 mb-10 max-w-2xl leading-relaxed gpu-layer"
          >
            Discover world-class 3D models, PBR materials, and complete interior scenes crafted by elite industry professionals.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 mb-16 gpu-layer"
          >
            <Link href="/products">
              <Button size="lg" className="group relative h-14 px-8 text-base overflow-hidden">
                {!isLowEnd && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0"
                    initial={{ x: '-100%' }}
                    animate={{ x: '200%' }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
                  />
                )}
                Explore Marketplace
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/collections">
              <Button size="lg" variant="glass" className="h-14 px-8 text-base border border-border/60 hover:border-primary/40 backdrop-blur-sm gap-2">
                <Play className="w-4 h-4 fill-current" />
                View Collections
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
            className="flex flex-wrap gap-8 sm:gap-12 justify-center items-center gpu-layer"
          >
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.04, type: "spring", stiffness: 300, damping: 20 }}
                className="flex flex-col items-center gap-1 group"
              >
                <span className="text-2xl sm:text-3xl font-black text-foreground group-hover:text-primary transition-colors duration-300">
                  {stat.icon ? (
                    <span className="flex items-center gap-1">
                      {stat.value}
                      <stat.icon className="w-5 h-5 text-primary fill-primary" />
                    </span>
                  ) : stat.value}
                </span>
                <span className="text-xs text-muted-foreground uppercase tracking-widest">{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <span className="text-xs text-muted-foreground uppercase tracking-widest">Scroll to explore</span>
          <motion.div
            className="w-px h-10 bg-gradient-to-b from-primary to-transparent"
            animate={{ scaleY: [0, 1, 0], originY: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </section>

      {/* Software Marquee */}
      <SoftwareMarquee />

      {/* Category Showcase — lazy loaded, only rendered when scrolled near */}
      <CategoryShowcase />

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
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.25, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
                className="h-full gpu-layer"
              >
                <Link href={`/products/${product.id}`} className="block h-full group">
                  <div className="h-full flex flex-col rounded-2xl overflow-hidden border border-border bg-card hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">

                    {/* Image */}
                    <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/10' }}>
                      <Image
                        src={product.image || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800'}
                        alt={product.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-400 group-hover:scale-105"
                        quality={75}
                      />
                      <div className="absolute inset-0 bg-background/0 group-hover:bg-background/30 transition-colors duration-300" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <span className="flex items-center justify-center gap-2 bg-background/90 backdrop-blur-sm text-foreground text-sm font-semibold px-5 py-2.5 rounded-full border border-border shadow-lg translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
                          View Details <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
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
                      <h3 className="text-base font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-200">
                        {product.title}
                      </h3>
                      <div className="flex-1" />
                      <div className="h-px bg-border/60" />
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-black text-foreground">{product.price}</span>
                        <button className="flex items-center justify-center gap-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground px-4 py-2 rounded-full transition-all duration-200">
                          <Download className="w-3.5 h-3.5" />
                          <span className="font-bold text-xs leading-none mt-px">Get</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
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
