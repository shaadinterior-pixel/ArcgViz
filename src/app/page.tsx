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
  { floatClass: 'animate-float-1', style: { top: '0%', left: '5%' }, w: 180 },
  { floatClass: 'animate-float-2', style: { top: '2%', right: '5%' }, w: 190 },
  { floatClass: 'animate-float-3', style: { top: '38%', left: '12%', zIndex: 30 }, w: 260 },
  { floatClass: 'animate-float-4', style: { top: '32%', right: '-2%' }, w: 200 },
  { floatClass: 'animate-float-5', style: { bottom: '5%', left: '0%' }, w: 170 },
  { floatClass: 'animate-float-6', style: { bottom: '-2%', left: '42%' }, w: 180 },
  { floatClass: 'animate-float-7', style: { bottom: '8%', right: '12%' }, w: 190 },
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
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" }}
        className="bg-white/20 backdrop-blur-3xl rounded-3xl p-2.5 shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-white/40 hover:bg-white/40 hover:shadow-[0_20px_80px_rgba(36,184,108,0.2)] transition-all duration-500"
      >
        <div className={`relative w-full ${card.aspect || 'aspect-video'} rounded-2xl overflow-hidden shadow-inner`}>
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
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />
          <div className="animate-orb-drift absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(36,184,108,0.12)_0,transparent_70%)] blur-3xl" />
          <div className="animate-orb-drift-reverse absolute bottom-[-20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(17,153,142,0.08)_0,transparent_70%)] blur-3xl" />

          {/* Refined DW Background Watermark */}
          <div className="absolute inset-0 flex items-center justify-center select-none opacity-[0.04]">
            <Image
              src="/DESIGN WALLA LOGO .jpg"
              alt="Design Walla Logo Watermark"
              width={800}
              height={800}
              className="object-contain rounded-[4rem] grayscale mix-blend-multiply"
              style={{ transform: 'translateY(-5%) scale(1.2)' }}
              priority
            />
          </div>
        </div>

        {/* Main grid */}
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

          {/* LEFT */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex flex-col gap-6">

            {/* Platform badge */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#E2EDE8] text-zinc-600 text-xs font-bold tracking-widest uppercase shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#24B86C] animate-pulse" /> All-in-One Creative Platform
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
              className="flex flex-col sm:flex-row flex-wrap xl:flex-nowrap items-start sm:items-center gap-3 mt-4"
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
                if ((heroContent as any).hero_cards) {
                  const p = JSON.parse((heroContent as any).hero_cards);
                  if (p && p.length > 0) cards = p;
                }
              } catch {}
              return cards.slice(0, 7).map((card: any, i: number) => (
                <HeroCard key={card.id || i} card={card} slot={CARD_SLOTS[i]} delay={0.2 + i * 0.08} />
              ));
            })()}
          </div>

          {/* RIGHT — Mobile scrollable strip */}
          <div className="lg:hidden flex gap-3 overflow-x-auto hide-scrollbar pb-2 -mx-4 px-4">
            {(() => {
              let cards = HERO_CARDS;
              try {
                if ((heroContent as any).hero_cards) {
                  const p = JSON.parse((heroContent as any).hero_cards);
                  if (p && p.length > 0) cards = p;
                }
              } catch {}
              return cards.slice(0, 4).map((card: any, i: number) => (
                <motion.div
                  key={card.id || i}
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="glass-card rounded-xl overflow-hidden shrink-0 w-36"
                >
                  <div className={`relative w-full ${card.aspect || 'aspect-video'}`}>
                    <Image src={card.img} alt={card.label} fill className="object-cover" quality={60} sizes="144px" />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 px-2 py-1.5 bg-white/30 backdrop-blur-md border-t border-white/20">
                    <span className="text-xs font-bold text-[#0D1A12] drop-shadow-sm">{card.label}</span>
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

      {/* ── Hire Our Team Section ── */}
      <HireOurTeamSection />

      {/* ── Contact Section ── */}
      <ContactSection />
    </div>
  );
}
