"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from './Button';

const BENEFITS = [
  "Top 1% vetted 3D artists and interior designers.",
  "Dedicated project manager for seamless communication.",
  "Flexible milestones and transparent pricing.",
  "Source files included upon project completion."
];

export default function HireOurTeamSection() {
  return (
    <section className="py-24 bg-white border-y border-border/50 relative overflow-hidden" id="hire-us">
      <div className="absolute inset-0 bg-[#24B86C]/5 pattern-grid-lg opacity-50"></div>
      
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 bg-[#24B86C]/10 text-[#24B86C] px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-[#24B86C]/20">
              <span className="w-2 h-2 rounded-full bg-[#24B86C] animate-pulse"></span>
              Available for Projects
            </div>
            
            <h2 className="text-4xl md:text-5xl font-black text-[#111111] leading-tight">
              Bring Your Vision to Life with <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#24B86C] to-[#11998E]">Design Walla Studio</span>.
            </h2>
            
            <p className="text-lg text-zinc-600 leading-relaxed max-w-lg">
              Whether you need bespoke 3D assets, full-scale interior visualization, or a complete brand identity, our in-house team of elite artists is ready to deliver.
            </p>

            <ul className="space-y-3 pt-4">
              {BENEFITS.map((benefit, i) => (
                <motion.li 
                  key={i} 
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3 text-zinc-700"
                >
                  <CheckCircle2 className="w-5 h-5 text-[#24B86C] shrink-0 mt-0.5" />
                  <span className="font-medium text-sm md:text-base">{benefit}</span>
                </motion.li>
              ))}
            </ul>

            <div className="pt-6 flex flex-wrap gap-4">
              <Link href="/hire-us">
                <Button className="h-14 px-8 rounded-xl bg-gradient-to-r from-[#24B86C] to-[#11998E] hover:from-[#20a661] hover:to-[#0f877d] text-white font-bold text-base shadow-[0_8px_25px_rgba(36,184,108,0.3)] transition-all duration-300 hover:-translate-y-0.5">
                  Start a Project
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/products">
                <Button variant="outline" className="h-14 px-8 rounded-xl border-2 border-zinc-200 bg-transparent hover:bg-zinc-50 text-zinc-700 font-bold text-base transition-all">
                  Browse Marketplace
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex-1 w-full">
            <div className="relative aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-white/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1200" 
                alt="Our Design Studio"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-transparent"></div>
              
              <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-white/50 shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop" alt="Lead Designer" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#111111]">"The attention to detail was incredible. They delivered exactly what we envisioned."</p>
                    <p className="text-xs font-semibold text-zinc-500 mt-1">— Sarah J., Creative Director</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
