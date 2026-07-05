"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
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
      <section className="relative min-h-[80vh] flex flex-col justify-center overflow-hidden bg-[#FAFCFB] pt-24 pb-24">

        {/* Ethereal Mesh Gradients */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />
        <div className="animate-orb-drift absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(0,229,153,0.12)_0,transparent_70%)] blur-3xl pointer-events-none" />
        <div className="animate-orb-drift-reverse absolute bottom-[-20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(0,161,255,0.08)_0,transparent_70%)] blur-3xl pointer-events-none" />

        {/* Refined DW Background Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0 select-none opacity-[0.04]">
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

        {/* Content — centered full width */}
        <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center gap-6">

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
            className="text-[17px] font-medium text-zinc-600 max-w-[600px] leading-relaxed"
          >
            The ultimate digital ecosystem. Elevate your brand with premium Website Templates, Motion Design, Interior Renders, and high-end 3D Assets.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap justify-center gap-4 mt-2"
          >
            <Link href="/products">
              <Button className="h-12 px-8 rounded-xl bg-gradient-to-r from-[#24B86C] to-[#11998E] hover:from-[#20a661] hover:to-[#0f877d] text-white font-bold text-[15px] shadow-[0_8px_25px_rgba(36,184,108,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(17,153,142,0.4)] border border-white/20">
                Explore Marketplace
              </Button>
            </Link>
            <Link href="/#services">
              <Button variant="outline" className="h-12 px-8 rounded-xl border border-[#E2EDE8] bg-white/60 backdrop-blur-md hover:bg-white hover:border-[#24B86C]/30 text-zinc-700 font-bold text-[15px] hover:shadow-[0_8px_20px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-0.5">
                Hire Our Team
              </Button>
            </Link>
            <Link href="/resources">
              <Button variant="outline" className="h-12 px-8 rounded-xl border border-[#E2EDE8] bg-white/60 backdrop-blur-md hover:bg-white hover:border-[#24B86C]/30 text-zinc-700 font-bold text-[15px] hover:shadow-[0_8px_20px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-0.5">
                Download Free Assets
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* ── Search bar ── */}
        <div className="relative z-30 w-full max-w-2xl mx-auto mt-10 px-4">
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
