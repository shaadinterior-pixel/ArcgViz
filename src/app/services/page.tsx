"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, LayoutTemplate } from 'lucide-react';
import { defaultServices } from '@/components/ui/WhatWeDoSection';
import { Button } from '@/components/ui/Button';

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-[#FAFCFB] pt-24 pb-32">
      
      {/* ── HERO ── */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16 md:py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#E2EDE8] shadow-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-[#00E599] animate-pulse" />
            <span className="text-zinc-600 font-bold text-xs tracking-widest uppercase">Our Expertise</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-[#111111] tracking-tighter mb-6">
            World-class <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E599] to-[#00A1FF]">services</span> <br/>
            for modern brands.
          </h1>
          
          <p className="text-lg text-zinc-500 max-w-2xl mx-auto leading-relaxed">
            From intricate 3D models to comprehensive brand strategies, our studio delivers end-to-end creative solutions tailored for the digital age.
          </p>
        </motion.div>
      </section>

      {/* ── SERVICES LIST ── */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-24">
        {defaultServices.map((service, index) => {
          const isEven = index % 2 === 0;
          
          return (
            <motion.div 
              key={service.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`flex flex-col lg:flex-row gap-12 lg:gap-20 items-center ${isEven ? '' : 'lg:flex-row-reverse'}`}
            >
              {/* Image */}
              <div className="w-full lg:w-1/2 relative aspect-[4/3] rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.06)] group">
                <Image 
                  src={service.image} 
                  alt={service.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              {/* Content */}
              <div className="w-full lg:w-1/2 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#24B86C]/10 text-[#24B86C] text-xs font-bold uppercase tracking-wider">
                  {service.category}
                </div>
                
                <h2 className="text-4xl md:text-5xl font-black text-[#111111] tracking-tight">
                  {service.title}
                </h2>
                
                <p className="text-xl font-medium text-zinc-400 italic">
                  "{service.tagline}"
                </p>
                
                <p className="text-zinc-600 leading-relaxed text-lg">
                  {service.description}
                </p>

                <div className="pt-6">
                  <h4 className="text-sm font-bold text-zinc-800 uppercase tracking-widest mb-4">What's Included</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {service.includes.map((inc, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-[#24B86C] shrink-0 mt-0.5" />
                        <span className="text-zinc-600 font-medium text-sm leading-snug">{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-8">
                  <Link href={`/contact?service=${encodeURIComponent(service.title)}`}>
                    <Button className="h-14 px-8 rounded-full bg-[#111111] hover:bg-[#00E599] text-white font-bold text-[15px] shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 group flex items-center gap-2">
                      Start a Project
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          );
        })}
      </section>

      {/* ── CTA ── */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto mt-32 text-center">
        <div className="bg-white rounded-3xl p-12 shadow-[0_20px_60px_rgba(0,0,0,0.04)] border border-[#E2EDE8] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_center,rgba(0,229,153,0.1)_0,transparent_70%)] blur-2xl" />
          <h2 className="text-3xl md:text-4xl font-black text-[#111111] mb-4">Ready to elevate your brand?</h2>
          <p className="text-zinc-500 mb-8 max-w-xl mx-auto text-lg">Our team is ready to bring your vision to life. Let's discuss your next big project.</p>
          <Link href="/contact">
            <Button className="h-14 px-8 rounded-full bg-[#24B86C] hover:bg-[#1fa35f] text-white font-bold text-[15px] shadow-[0_8px_20px_rgba(36,184,108,0.25)] transition-all">
              Contact Our Studio
            </Button>
          </Link>
        </div>
      </section>

    </div>
  );
}
