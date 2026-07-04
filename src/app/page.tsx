"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Download, CheckCircle2, Play } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CategoryMarquee } from '@/components/ui/CategoryMarquee';
import { WhatWeDoSection } from '@/components/ui/WhatWeDoSection';
import { HowWeWorkSection } from '@/components/ui/HowWeWorkSection';
import { SoftwareMarquee } from '@/components/ui/SoftwareMarquee';
import { LatestUploadsSection } from '@/components/ui/LatestUploadsSection';
import { LiveSearch } from '@/components/ui/LiveSearch';
import { ContactSection } from '@/components/ui/ContactSection';
import { TestimonialSection } from '@/components/ui/TestimonialSection';
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

// ── Small icon-only decorative cards ─────────────────────────────────────────
const ICON_CARDS = [
  { id: 'ic1', emoji: '🖼️', floatClass: 'animate-float-2', style: { top: '35%', left: '8%' } },
  { id: 'ic2', emoji: '💎', floatClass: 'animate-float-4', style: { top: '5%', right: '35%' } },
  { id: 'ic3', emoji: '📦', floatClass: 'animate-float-6', style: { bottom: '28%', right: '12%' } },
  { id: 'ic4', emoji: '🎬', floatClass: 'animate-float-1', style: { bottom: '15%', left: '22%' } },
  { id: 'ic5', emoji: '✏️', floatClass: 'animate-float-3', style: { top: '65%', left: '15%' } },
];

// ── Main hero elegant constellation cards ─────────────────────────────────────────
const HERO_CARDS = [
  {
    id: 'interior', label: 'Interior Design', floatClass: 'animate-float-1',
    img: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=300',
    style: { top: '-5%', left: '0%' }, w: 180, aspect: 'aspect-[4/3]'
  },
  {
    id: 'food', label: 'Food Cart Design', floatClass: 'animate-float-2',
    img: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=300',
    style: { top: '-2%', right: '2%' }, w: 190, aspect: 'aspect-video'
  },
  {
    id: 'web', label: 'Website Templates', floatClass: 'animate-float-3',
    img: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=400',
    style: { top: '30%', left: '18%', zIndex: 30 }, w: 260, featured: true, aspect: 'aspect-[16/10]'
  },
  {
    id: 'motion', label: 'Motion Graphics', floatClass: 'animate-float-4',
    img: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=300',
    style: { top: '28%', right: '-4%' }, w: 200, dark: true, aspect: 'aspect-video'
  },
  {
    id: 'brand', label: 'Brand Kits', floatClass: 'animate-float-5',
    img: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=300',
    style: { bottom: '-2%', left: '-2%' }, w: 170, aspect: 'aspect-video'
  },
  {
    id: '3d', label: '3D Models', floatClass: 'animate-float-6',
    img: 'https://images.unsplash.com/photo-1618220179428-22790b46a0eb?auto=format&fit=crop&q=80&w=300',
    style: { bottom: '-6%', left: '38%' }, w: 180, aspect: 'aspect-square'
  },
  {
    id: 'digital', label: 'Digital Products', floatClass: 'animate-float-7',
    img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=300',
    style: { bottom: '2%', right: '4%' }, w: 190, aspect: 'aspect-video'
  },
];

function HeroCard({ card, delay }: { card: typeof HERO_CARDS[0]; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`absolute ${card.floatClass} cursor-pointer group`}
      style={{ ...card.style, width: card.w, zIndex: card.style.zIndex || 20 }}
    >
      <motion.div 
        animate={{ y: [0, -8, 0] }} 
        transition={{ duration: 4 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" }}
        className="bg-white/60 backdrop-blur-2xl rounded-3xl p-2.5 shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-white hover:bg-white/80 hover:shadow-[0_20px_80px_rgba(0,229,153,0.15)] transition-all duration-500"
      >
        <div className={`relative w-full ${card.aspect} rounded-2xl overflow-hidden shadow-inner`}>
          <Image src={card.img} alt={card.label} fill className="object-cover" quality={75} sizes="300px" />
          {card.dark && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="w-12 h-12 rounded-[14px] bg-[#9333EA] flex items-center justify-center shadow-lg">
                <Play className="w-5 h-5 text-white fill-white ml-1" />
              </div>
            </div>
          )}
        </div>
        <div className="px-3 pt-3 pb-2 text-center">
          <span className={`font-black text-transparent bg-clip-text bg-gradient-to-br from-zinc-800 to-zinc-500 tracking-tight ${card.featured ? 'text-[15px]' : 'text-[13px]'}`}>{card.label}</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

function IconCard({ card, delay }: { card: typeof ICON_CARDS[0]; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay, ease: 'backOut' }}
      className={`absolute ${card.floatClass} z-10`}
      style={card.style}
    >
      <motion.div 
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" }}
        className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.08)] text-2xl border border-white/80 bg-white/70 backdrop-blur-xl"
      >
        {card.emoji}
      </motion.div>
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
        const [data, , heroData] = await Promise.all([
          fetchCached(), fetchSettings(), fetchHeroContent(),
        ]);
        if (!mounted) return;
        setHeroContent({ ...DEFAULT_HERO_CONTENT, ...heroData });
        const sorted = (data || [])
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


  return (
    <div className="flex flex-col">

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[95vh] flex flex-col justify-center overflow-hidden bg-[#FAFCFB] pt-24 pb-32">

        {/* Ethereal Mesh Gradients */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />
        <div className="animate-orb-drift absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(0,229,153,0.12)_0,transparent_70%)] blur-3xl pointer-events-none" />
        <div className="animate-orb-drift-reverse absolute bottom-[-20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(0,161,255,0.08)_0,transparent_70%)] blur-3xl pointer-events-none" />

        {/* Refined DW Background Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0 select-none opacity-[0.03]">
          <span
            className="font-black leading-none text-zinc-900"
            style={{
              fontSize: 'clamp(300px, 60vw, 900px)',
              letterSpacing: '-0.08em',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              transform: 'translateY(-5%)'
            }}
          >
            DW
          </span>
        </div>

        {/* Main grid */}
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

          {/* LEFT */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex flex-col gap-6">

            {/* Platform badge */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#E2EDE8] text-zinc-600 text-xs font-bold tracking-widest uppercase shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#00E599] animate-pulse" /> All-in-One Creative Platform
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl sm:text-6xl lg:text-[5.5rem] font-black tracking-tighter text-[#111111] leading-[1.05]"
            >
              One Platform. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#24B86C] to-[#11998E]">
                Infinite Creative
              </span><br/>
              Possibilities.
            </motion.h1>

            {/* Sub */}
            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="text-[17px] font-medium text-zinc-600 max-w-[540px] leading-relaxed"
            >
              The ultimate digital ecosystem. Elevate your brand with premium Website Templates, Motion Design, Interior Renders, and high-end 3D Assets.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap gap-4 mt-4"
            >
              <Link href="/products">
                <Button className="h-12 px-6 rounded-lg bg-[#24B86C] hover:bg-[#1fa35f] text-white font-bold text-[15px] shadow-[0_8px_20px_rgba(36,184,108,0.25)] transition-all">
                  [Explore Marketplace]
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className="h-12 px-6 rounded-lg border-2 border-[#E2EDE8] hover:border-[#24B86C]/40 text-zinc-700 font-bold text-[15px] hover:bg-[#24B86C]/5 transition-all bg-transparent backdrop-blur-sm">
                  [Hire Our Team]
                </Button>
              </Link>
              <Link href="/resources">
                <Button variant="outline" className="h-12 px-6 rounded-lg border-2 border-[#E2EDE8] hover:border-[#24B86C]/40 text-zinc-700 font-bold text-[15px] hover:bg-[#24B86C]/5 transition-all bg-transparent backdrop-blur-sm">
                  [Download Free Assets]
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* RIGHT — Properly Organized Premium Scatter */}
          <div className="relative h-[540px] w-full hidden lg:block">
            {HERO_CARDS.map((card, i) => <HeroCard key={card.id} card={card} delay={0.2 + i * 0.08} />)}
          </div>

          {/* RIGHT — Mobile scrollable strip */}
          <div className="lg:hidden flex gap-3 overflow-x-auto hide-scrollbar pb-2 -mx-4 px-4">
            {HERO_CARDS.slice(0, 4).map((card, i) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="glass-card rounded-xl overflow-hidden shrink-0 w-36"
              >
                <div className="relative w-full aspect-video">
                  <Image src={card.img} alt={card.label} fill className="object-cover" quality={60} sizes="144px" />
                </div>
                <div className="px-2 py-1.5 bg-white/80">
                  <span className="text-xs font-bold text-[#0D1A12]">{card.label}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Search bar ── */}
        <div className="relative z-30 w-full max-w-2xl mx-auto mt-14 px-4">
          <LiveSearch placeholder={heroContent.search_placeholder} />
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

      {/* ── LATEST UPLOADS ─────────────────────────────────────────────────────── */}
      <LatestUploadsSection />

      {/* How We Work */}
      <HowWeWorkSection />

      {/* Trending Products */}
      <section className="py-24 bg-white border-t border-[#E2EDE8]">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.4 }}
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
                  <div className="h-full flex flex-col rounded-2xl overflow-hidden border border-[#E2EDE8] bg-white hover:shadow-xl hover:shadow-[#24B86C]/10 hover:-translate-y-1 transition-all duration-300">
                    <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/10' }}>
                      <Image
                        src={product.image || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800'}
                        alt={product.title} fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        quality={75}
                      />
                      <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-[#0D1A12] text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm">
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

      {/* ── Testimonial Section ── */}
      <TestimonialSection />

      {/* ── Contact Section ── */}
      <ContactSection />
    </div>
  );
}
