"use client";

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Star, Download, Search, CheckCircle2, Play } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CategoryMarquee } from '@/components/ui/CategoryMarquee';
import { WhatWeDoSection } from '@/components/ui/WhatWeDoSection';
import { HowWeWorkSection } from '@/components/ui/HowWeWorkSection';
import { SoftwareMarquee } from '@/components/ui/SoftwareMarquee';
import {
  fetchProducts, fetchSettings, fetchHeroContent,
  onStoreUpdate, DEFAULT_HERO_CONTENT, type HeroContent,
} from '@/lib/store';

const CategoryShowcase = dynamic(
  () => import('@/components/ui/CategoryShowcase').then(m => ({ default: m.CategoryShowcase })),
  { ssr: false }
);

let _productsCache: any[] | null = null;
let _cacheTime = 0;
async function fetchCached() {
  if (_productsCache && Date.now() - _cacheTime < 60_000) return _productsCache;
  const data = await fetchProducts();
  _productsCache = data; _cacheTime = Date.now();
  return data;
}

// ── Floating hero cards config ────────────────────────────────────────────────
const HERO_CARDS = [
  {
    id: 'interior', label: 'Interior Design', floatClass: 'animate-float-1',
    img: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=300',
    style: { top: '12%', left: '0%' }, size: 'w-40',
  },
  {
    id: 'food', label: 'Food Cart Design', floatClass: 'animate-float-2',
    img: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=300',
    style: { top: '4%', right: '4%' }, size: 'w-48',
  },
  {
    id: 'web', label: 'Website Templates', floatClass: 'animate-float-3',
    img: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=400',
    style: { top: '36%', left: '22%' }, size: 'w-60', featured: true,
  },
  {
    id: 'motion', label: 'Motion Graphics', floatClass: 'animate-float-4',
    img: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=300',
    style: { top: '38%', right: '0%' }, size: 'w-52', dark: true,
  },
  {
    id: 'brand', label: 'Brand Kits', floatClass: 'animate-float-5',
    img: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=300',
    style: { bottom: '14%', left: '2%' }, size: 'w-40',
  },
  {
    id: '3d', label: '3D Models', floatClass: 'animate-float-6',
    img: 'https://images.unsplash.com/photo-1618220179428-22790b46a0eb?auto=format&fit=crop&q=80&w=300',
    style: { bottom: '4%', left: '35%' }, size: 'w-48',
  },
  {
    id: 'digital', label: 'Digital Products', floatClass: 'animate-float-7',
    img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=300',
    style: { bottom: '8%', right: '2%' }, size: 'w-44',
  },
];

function HeroCard({ card, delay }: { card: typeof HERO_CARDS[0]; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className={`absolute ${card.size} ${card.floatClass} z-20 cursor-pointer group`}
      style={card.style}
    >
      <div className="glass-card rounded-2xl overflow-hidden hover:shadow-[0_20px_60px_rgba(36,184,108,0.2)] transition-shadow duration-300">
        <div className={`relative w-full ${card.featured ? 'aspect-[16/10]' : 'aspect-video'} ${card.dark ? 'bg-indigo-950' : 'bg-white/50'}`}>
          <Image src={card.img} alt={card.label} fill className="object-cover" quality={75} />
          {card.dark && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 rounded-xl bg-purple-600/80 backdrop-blur-sm flex items-center justify-center">
                <Play className="w-5 h-5 text-white fill-white" />
              </div>
            </div>
          )}
          <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-[#24B86C] rounded-full flex items-center justify-center shadow">
            <CheckCircle2 className="w-3 h-3 text-white" />
          </div>
        </div>
        <div className="px-3 py-2 bg-white/80 backdrop-blur-sm">
          <span className={`font-bold text-[#0D1A12] ${card.featured ? 'text-sm' : 'text-xs'}`}>{card.label}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const [heroContent, setHeroContent] = useState<HeroContent>(DEFAULT_HERO_CONTENT);
  const [trendingProducts, setTrendingProducts] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [data, siteSettings, heroData] = await Promise.all([
          fetchCached(), fetchSettings(), fetchHeroContent(),
        ]);
        if (!mounted) return;
        setHeroContent({ ...DEFAULT_HERO_CONTENT, ...heroData });
        const sorted = data
          .sort((a: any, b: any) => (b.sales || 0) - (a.sales || 0))
          .slice(0, 3)
          .map((p: any) => ({ id: p.id, title: p.name, author: p.author, price: p.price, rating: parseFloat(p.rating) || 0, image: p.image }));
        setTrendingProducts(sorted);
      } catch (e) { console.error(e); }
    };
    load();
    const unsub = onStoreUpdate('products', load);
    return () => { mounted = false; unsub(); };
  }, []);

  const stats = [
    { value: heroContent.stat1_value, label: heroContent.stat1_label },
    { value: heroContent.stat2_value, label: heroContent.stat2_label },
    { value: heroContent.stat3_value, label: heroContent.stat3_label },
    { value: heroContent.stat4_value, label: heroContent.stat4_label },
  ];

  return (
    <div className="flex flex-col">

      {/* ── HERO SECTION ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex flex-col justify-center overflow-hidden bg-[#F8FAF9] pt-28 pb-10">

        {/* Animated gradient orbs */}
        <div className="animate-orb-drift absolute -bottom-40 -left-40 w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-[#24B86C]/25 to-[#11998E]/10 filter blur-[120px] pointer-events-none" />
        <div className="animate-orb-drift-reverse absolute -top-20 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-[#11998E]/20 to-transparent filter blur-[100px] pointer-events-none" />

        {/* DW Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0">
          <span className="text-[40vw] font-black leading-none select-none text-transparent bg-gradient-to-br from-[#24B86C] via-[#11998E] to-transparent bg-clip-text opacity-[0.07] filter blur-[1px]">DW</span>
        </div>

        {/* Main grid */}
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

          {/* LEFT: Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-6"
          >
            {/* Badge */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#24B86C]/10 border border-[#24B86C]/20 text-[#24B86C] text-xs font-semibold tracking-widest uppercase">
                ✦ All-in-One Creative Platform
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#0D1A12] leading-[1.05]"
            >
              {heroContent.headline_line1}
              <br />
              <span className="bg-gradient-to-r from-[#24B86C] to-[#11998E] bg-clip-text text-transparent">
                {heroContent.headline_line2}
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="text-base text-[#4B5563] max-w-lg leading-relaxed"
            >
              {heroContent.subheadline}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="flex flex-wrap gap-3"
            >
              <Link href={heroContent.cta1_link}>
                <Button className="relative overflow-hidden bg-gradient-to-r from-[#24B86C] to-[#11998E] text-white rounded-lg px-7 py-5 text-sm font-bold shadow-lg shadow-[#24B86C]/25 border-0 group hover:shadow-xl hover:shadow-[#24B86C]/40 transition-all duration-300">
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-shine" />
                  <span className="relative flex items-center gap-2">{heroContent.cta1_text} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
                </Button>
              </Link>
              <Link href={heroContent.cta2_link}>
                <Button variant="outline" className="rounded-lg px-7 py-5 text-sm font-bold border-2 border-[#24B86C] text-[#24B86C] hover:bg-[#24B86C]/5 bg-white/60 backdrop-blur-sm transition-colors duration-300">
                  {heroContent.cta2_text}
                </Button>
              </Link>
              <Link href={heroContent.cta3_link}>
                <Button variant="outline" className="rounded-lg px-7 py-5 text-sm font-bold border-2 border-[#11998E]/60 text-[#11998E] hover:bg-[#11998E]/5 bg-white/60 backdrop-blur-sm transition-colors duration-300">
                  {heroContent.cta3_text}
                </Button>
              </Link>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="flex flex-wrap gap-3 mt-2"
            >
              {stats.map((s, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#E2EDE8] shadow-sm">
                  <span className="text-sm font-black text-[#24B86C]">{s.value}</span>
                  <span className="text-xs text-[#6B7280] font-medium">{s.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* RIGHT: Floating card mosaic — desktop only */}
          <div className="relative h-[520px] w-full hidden lg:block">
            {HERO_CARDS.map((card, i) => (
              <HeroCard key={card.id} card={card} delay={0.2 + i * 0.08} />
            ))}
          </div>

          {/* RIGHT: Mobile scrollable strip */}
          <div className="lg:hidden flex gap-3 overflow-x-auto hide-scrollbar pb-2 -mx-4 px-4">
            {HERO_CARDS.slice(0, 4).map((card, i) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="glass-card rounded-xl overflow-hidden shrink-0 w-36"
              >
                <div className="relative w-full aspect-video">
                  <Image src={card.img} alt={card.label} fill className="object-cover" quality={60} />
                </div>
                <div className="px-2 py-1.5 bg-white/80">
                  <span className="text-xs font-bold text-[#0D1A12]">{card.label}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Search bar */}
        <div className="relative z-20 w-full max-w-2xl mx-auto mt-14 px-4">
          <motion.form
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
              e.preventDefault();
              const q = (new FormData(e.currentTarget)).get('search');
              if (q) window.location.href = `/products?search=${encodeURIComponent(q as string)}`;
            }}
            className="relative flex items-center w-full group"
          >
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
              <Search className="h-5 w-5 text-[#9CA3AF] group-focus-within:text-[#24B86C] transition-colors" />
            </div>
            <input
              type="text" name="search"
              className="w-full h-16 pl-14 pr-20 rounded-full border-2 border-white bg-white/70 shadow-[0_8px_40px_rgba(36,184,108,0.12)] backdrop-blur-xl text-base text-[#0D1A12] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#24B86C] transition-all"
              placeholder={heroContent.search_placeholder}
              autoComplete="off"
            />
            <div className="absolute inset-y-0 right-2 flex items-center z-10">
              <Button type="submit" size="icon" className="h-12 w-12 rounded-full bg-gradient-to-r from-[#24B86C] to-[#11998E] hover:opacity-90 shadow-lg text-white border-0">
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </motion.form>
        </div>
      </section>

      {/* Software Marquee */}
      <SoftwareMarquee />

      {/* Category Marquee */}
      <CategoryMarquee />

      {/* What We Do */}
      <WhatWeDoSection />

      {/* Category Showcase */}
      <CategoryShowcase />

      {/* How We Work */}
      <HowWeWorkSection />

      {/* Trending Products */}
      <section className="py-24 border-t border-[#E2EDE8] bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.4 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-end mb-14"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#24B86C] mb-3">This Week</p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-[#0D1A12]">Trending Now</h2>
              <p className="text-[#6B7280] mt-3 max-w-md">Our most popular assets, handpicked by the community.</p>
            </div>
            <Link href="/products?sort=trending" className="hidden md:flex items-center gap-2 text-sm font-semibold text-[#24B86C] hover:gap-3 transition-all group">
              View all trending <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: index * 0.1 }}
              >
                <Link href={`/products/${product.id}`} className="block h-full group">
                  <div className="h-full flex flex-col rounded-2xl overflow-hidden border border-[#E2EDE8] bg-white hover:shadow-xl hover:shadow-[#24B86C]/10 transition-all duration-300 hover:-translate-y-1">
                    <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/10' }}>
                      <Image
                        src={product.image || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800'}
                        alt={product.title} fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        quality={75}
                      />
                      <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-[#0D1A12] text-xs font-bold px-2.5 py-1 rounded-lg">
                        <Star className="w-3 h-3 text-[#24B86C] fill-[#24B86C]" />{product.rating}
                      </div>
                    </div>
                    <div className="flex flex-col flex-1 p-5 gap-3">
                      <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#9CA3AF]">{product.author}</span>
                      <h3 className="text-base font-bold text-[#0D1A12] leading-snug line-clamp-2">{product.title}</h3>
                      <div className="flex-1" />
                      <div className="h-px bg-[#E2EDE8]" />
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-black text-[#0D1A12]">{product.price}</span>
                        <button className="flex items-center gap-1.5 bg-[#24B86C]/10 text-[#24B86C] px-4 py-2 rounded-full hover:bg-[#24B86C]/20 transition-colors">
                          <Download className="w-3.5 h-3.5" />
                          <span className="font-bold text-xs">Get</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="flex md:hidden justify-center mt-10">
            <Link href="/products?sort=trending" className="flex items-center gap-2 text-sm font-semibold text-[#24B86C]">
              View all trending <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
