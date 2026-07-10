"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CategoryMarquee } from '@/components/ui/CategoryMarquee';
import { WhatWeDoSection } from '@/components/ui/WhatWeDoSection';
import { HowWeWorkSection } from '@/components/ui/HowWeWorkSection';
import { SoftwareMarquee } from '@/components/ui/SoftwareMarquee';
import { LatestUploadsSection } from '@/components/ui/LatestUploadsSection';
import { LiveSearch } from '@/components/ui/LiveSearch';
import { ContactSection } from '@/components/ui/ContactSection';
import { TestimonialSection } from '@/components/ui/TestimonialSection';
import HireOurTeamSection from '@/components/ui/HireOurTeamSection';
import { PortfolioSection } from '@/components/ui/PortfolioSection';
import {
  fetchHeroContent,
  onStoreUpdate, DEFAULT_HERO_CONTENT, type HeroContent,
} from '@/lib/store';

// ── Main hero elegant constellation cards ─────────────────────────────────────────
export const HERO_CARDS = [
  {
    id: 'interior', label: 'Interior Design',
    img: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=300',
    aspect: 'aspect-[4/3]'
  },
  {
    id: 'food', label: 'Food Cart Design',
    img: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=300',
    aspect: 'aspect-video'
  },
  {
    id: 'web', label: 'Website Templates', featured: true,
    img: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=400',
    aspect: 'aspect-[16/10]'
  },
  {
    id: 'motion', label: 'Motion Graphics', dark: true,
    img: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=300',
    aspect: 'aspect-video'
  },
  {
    id: 'brand', label: 'Brand Kits',
    img: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=300',
    aspect: 'aspect-video'
  },
  {
    id: '3d', label: '3D Models',
    img: 'https://images.unsplash.com/photo-1618220179428-22790b46a0eb?auto=format&fit=crop&q=80&w=300',
    aspect: 'aspect-square'
  },
  {
    id: 'digital', label: 'Digital Products',
    img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=300',
    aspect: 'aspect-video'
  },
];

const CARD_SLOTS = [
  { floatClass: 'animate-float-1', style: { top: '0%', left: '0%' }, w: 160 },
  { floatClass: 'animate-float-2', style: { top: '8%', right: '4%' }, w: 160 },
  { floatClass: 'animate-float-3', style: { top: '36%', left: '4%', zIndex: 20 }, w: 170 },
  { floatClass: 'animate-float-4', style: { top: '28%', left: '36%', zIndex: 30 }, w: 220 }, // Center Large (Featured)
  { floatClass: 'animate-float-5', style: { top: '44%', right: '-2%', zIndex: 20 }, w: 150 },
  { floatClass: 'animate-float-6', style: { bottom: '2%', left: '16%' }, w: 160 },
  { floatClass: 'animate-float-7', style: { bottom: '5%', right: '24%' }, w: 170 },
];

function HeroCard({ card, slot, delay }: { card: any; slot: typeof CARD_SLOTS[0]; delay: number }) {
  if (!slot) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`absolute ${slot.floatClass} cursor-pointer group`}
      style={{ ...slot.style, width: slot.w, zIndex: (slot.style as any).zIndex || 20 }}
    >
      <motion.div
        drag
        dragSnapToOrigin={true}
        dragElastic={0.3}
        whileDrag={{ scale: 1.05, cursor: 'grabbing' }}
        className="relative cursor-grab active:cursor-grabbing w-full h-full"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 6 + Math.random() * 3, repeat: Infinity, ease: "easeInOut" }}
          className="bg-[#24B86C]/10 backdrop-blur-xl rounded-2xl p-2.5 border border-[#24B86C]/20 shadow-[0_8px_32px_rgba(36,184,108,0.15)] hover:bg-[#24B86C]/20 hover:border-[#24B86C]/40 transition-all duration-500 relative w-full h-full"
        >
          <div className={`relative w-full ${card.aspect || 'aspect-video'} rounded-xl overflow-hidden shadow-inner bg-black/5`}>
            {card.img && <Image src={card.img} alt={card.label} fill className="object-cover pointer-events-none" quality={75} sizes="300px" priority />}
            {card.dark && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                <div className="w-12 h-12 rounded-[14px] bg-[#9333EA] flex items-center justify-center shadow-lg">
                  <Play className="w-5 h-5 text-white fill-white ml-1" />
                </div>
              </div>
            )}
            
            {/* Top-right green badge/icon */}
            <div className="absolute top-2 right-2 bg-[#24B86C] text-white w-6 h-6 rounded-full flex items-center justify-center shadow-md pointer-events-none">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            </div>
          </div>
          <div className="px-1 pt-3 pb-1 text-left flex items-center gap-2 pointer-events-none">
            {/* Optional small icon next to text if wanted, but image 2 just has text */}
            <span className={`font-bold text-zinc-800 tracking-tight leading-tight ${card.featured ? 'text-[14px]' : 'text-[12px]'}`}>{card.label}</span>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default function Home() {
  const [heroContent, setHeroContent] = useState<HeroContent>(DEFAULT_HERO_CONTENT);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const heroData = await fetchHeroContent();
        if (!mounted) return;
        setHeroContent({ ...DEFAULT_HERO_CONTENT, ...heroData });
      } catch (e) { console.error(e); }
    };
    load();
    const unsub = onStoreUpdate('settings', load);
    return () => { mounted = false; unsub(); };
  }, []);

  return (
    <div className="flex flex-col">

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-32 pb-20 bg-white z-30">

        {/* Ethereal Mesh Gradients & Backgrounds (Clipped) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="animate-orb-drift absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(36,184,108,0.12)_0,transparent_70%)] blur-3xl" />
          <div className="animate-orb-drift-reverse absolute bottom-[-20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(17,153,142,0.08)_0,transparent_70%)] blur-3xl" />

          {/* Diagonal Logo Watermarks with Gradient Mask */}
          <div 
            className="absolute top-[-5%] right-[-30%] w-[120vw] h-[120vw] sm:w-[500px] sm:h-[500px] lg:top-[-25%] lg:right-[-15%] lg:w-[800px] lg:h-[800px] select-none pointer-events-none z-0 opacity-15 lg:opacity-50 mix-blend-multiply"
            style={{ WebkitMaskImage: 'radial-gradient(circle at center, black 30%, transparent 70%)', maskImage: 'radial-gradient(circle at center, black 30%, transparent 70%)' }}
          >
            <Image
              src="/DESIGN WALLA LOGO .jpg"
              alt="Design Walla Logo Watermark"
              fill
              className="object-contain"
              priority
            />
            {/* The diagonal gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#24B86C] via-[#11998E] to-[#000000] mix-blend-lighten" />
          </div>
          
          <div 
            className="hidden sm:block absolute bottom-[-25%] left-[-15%] lg:w-[900px] lg:h-[900px] sm:w-[600px] sm:h-[600px] select-none pointer-events-none z-0 opacity-40 mix-blend-multiply"
            style={{ WebkitMaskImage: 'radial-gradient(circle at center, black 30%, transparent 70%)', maskImage: 'radial-gradient(circle at center, black 30%, transparent 70%)' }}
          >
            <Image
              src="/DESIGN WALLA LOGO .jpg"
              alt="Design Walla Logo Watermark"
              fill
              className="object-contain"
              priority
            />
            {/* The diagonal gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#24B86C] via-[#11998E] to-[#000000] mix-blend-lighten" />
          </div>
        </div>

        {/* Main grid */}
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

          {/* LEFT */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex flex-col gap-6">

            {/* Platform badge */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }} className="gpu-layer">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#E2EDE8] text-zinc-600 text-xs font-bold tracking-widest uppercase shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#24B86C] animate-pulse" /> All-in-One Creative Platform
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl sm:text-6xl lg:text-[5.5rem] font-black tracking-tighter text-[#111111] leading-[1.05] gpu-layer"
            >
              One Platform <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#24B86C] to-[#11998E] pr-1.5 pb-2">
                Infinite
              </span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#24B86C] to-[#11998E] pr-2 pb-2">
                Creative
              </span><br/>
              Possibilities
            </motion.h1>

            {/* Sub */}
            <motion.p
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="text-[17px] font-medium text-zinc-600 max-w-[540px] leading-relaxed gpu-layer"
            >
              The ultimate digital ecosystem. Elevate your brand with premium Website Templates, Motion Design, Interior Renders, and high-end 3D Assets.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row flex-wrap xl:flex-nowrap items-start sm:items-center gap-3 mt-4 gpu-layer"
            >
              <Link href="/products">
                <Button className="h-12 px-6 rounded-xl bg-gradient-to-r from-[#24B86C] to-[#11998E] hover:from-[#20a661] hover:to-[#0f877d] text-white font-bold text-[14px] shadow-[0_8px_25px_rgba(36,184,108,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(17,153,142,0.4)] border border-white/20 whitespace-nowrap">
                  Explore Marketplace
                </Button>
              </Link>
              <Link href="/#services">
                <Button variant="outline" className="h-12 px-6 rounded-xl border border-[#E2EDE8] bg-white/60 backdrop-blur-md hover:bg-white hover:border-[#24B86C]/30 text-zinc-700 font-bold text-[14px] hover:shadow-[0_8px_20px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-0.5 whitespace-nowrap">
                  Hire Our Team
                </Button>
              </Link>
              <Link href="/resources">
                <Button variant="outline" className="h-12 px-6 rounded-xl border border-[#E2EDE8] bg-white/60 backdrop-blur-md hover:bg-white hover:border-[#24B86C]/30 text-zinc-700 font-bold text-[14px] hover:shadow-[0_8px_20px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-0.5 whitespace-nowrap">
                  Download Free Assets
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* RIGHT — Desktop floating card scatter */}
          <div className="relative h-[540px] w-full hidden lg:block">
            {(() => {
              let cards = HERO_CARDS;
              try {
                const raw = (heroContent as any).hero_cards;
                if (raw) {
                  const parsed = Array.isArray(raw) ? raw : JSON.parse(raw);
                  if (parsed && parsed.length > 0) cards = parsed;
                }
              } catch {}
              return cards.slice(0, 7).map((card: any, i: number) => {
                // Ensure featured card (index 2) gets the center slot (index 3) and vice versa
                let slotIndex = i;
                if (i === 2) slotIndex = 3;
                else if (i === 3) slotIndex = 2;
                return <HeroCard key={card.id || i} card={card} slot={CARD_SLOTS[slotIndex]} delay={0.2 + i * 0.08} />;
              });
            })()}
          </div>

            {/* RIGHT — Mobile scrollable strip */}
          <div className="lg:hidden flex gap-3 overflow-x-auto hide-scrollbar pb-2 -mx-4 px-4">
            {(() => {
              let cards = HERO_CARDS;
              try {
                const raw = (heroContent as any).hero_cards;
                if (raw) {
                  const parsed = Array.isArray(raw) ? raw : JSON.parse(raw);
                  if (parsed && parsed.length > 0) cards = parsed;
                }
              } catch {}
              return cards.slice(0, 4).map((card: any, i: number) => (
                <motion.div
                  key={card.id || i}
                  initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="glass-card rounded-xl overflow-hidden shrink-0 w-36 gpu-layer flex-shrink-0"
                  style={{ minWidth: 144 }}
                >
                  <div className={`relative w-full ${card.aspect || 'aspect-video'}`}>
                    {card.img && <Image src={card.img} alt={card.label} fill className="object-cover" quality={60} sizes="144px" />}
                  </div>
                  <div className="px-2 py-1.5 bg-white/60 backdrop-blur-md border-t border-white/30">
                    <span className="text-xs font-bold text-[#0D1A12] line-clamp-1">{card.label}</span>
                  </div>
                </motion.div>
              ));
            })()}
          </div>
        </div>

        {/* ── Search bar ── */}
        <div className="relative z-[100] w-full max-w-2xl mx-auto mt-14 px-4">
          <LiveSearch placeholder={heroContent.search_placeholder} />
        </div>
      </section>

      {/* Software Marquee */}
      <SoftwareMarquee />

      {/* Category Marquee */}
      <CategoryMarquee />

      {/* What We Do */}
      <WhatWeDoSection />

      {/* ── LATEST UPLOADS ─────────────────────────────────────────────────────── */}
      <LatestUploadsSection />

      {/* How We Work */}
      <HowWeWorkSection />

      {/* ── Testimonial Section ── */}
      <TestimonialSection />

      {/* ── Portfolio & Partners Section ── */}
      <PortfolioSection />

      {/* ── Hire Our Team Section ── */}
      <HireOurTeamSection />

      {/* ── Contact Section ── */}
      <ContactSection />
    </div>
  );
}
