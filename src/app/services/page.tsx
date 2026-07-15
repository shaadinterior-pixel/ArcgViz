"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, ArrowRight, Zap, Trophy, Target, Sparkles, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { fetchServices, type ServiceDetail } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { CORE_SERVICES, getServicePath, serviceSeoToDetail } from '@/lib/service-seo';

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices()
      .then(data => setServices(data && data.length > 0 ? data : CORE_SERVICES.map(serviceSeoToDetail)))
      .catch((error) => {
        console.error(error);
        setServices(CORE_SERVICES.map(serviceSeoToDetail));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFCFB] selection:bg-[#24B86C]/20">
      
      {/* ── PREMIUM LIGHT HERO ── */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden flex flex-col items-center justify-center text-center px-4">
        {/* Subtle background ambient gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(36,184,108,0.06)_0,transparent_70%)] pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E8F5F1] text-[#24B86C] text-sm font-bold tracking-wide uppercase mb-8 shadow-sm border border-[#24B86C]/10"
        >
          <Sparkles className="w-4 h-4 fill-current" />
          Premium Agency Services
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-black text-[#0D1A12] tracking-tighter max-w-5xl mx-auto leading-[1.1] mb-6"
        >
          Elevate Your Brand.<br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#24B86C] to-[#11998E]">Transform Your Vision.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-6 text-zinc-500 font-medium text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
        >
          From immersive 3D architectures to cutting-edge digital marketing, our world-class team delivers bespoke solutions tailored to grow your business.
        </motion.p>
      </section>

      {/* ── STAGGERED SERVICES GRID ── */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-16 h-16 border-4 border-[#E2EDE8] border-t-[#24B86C] rounded-full animate-spin mb-4" />
            <p className="text-zinc-400 font-bold tracking-widest uppercase text-xs">Loading Services...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[3rem] border border-[#E2EDE8] shadow-sm">
            <Layers className="w-16 h-16 mx-auto mb-6 text-zinc-200" />
            <h3 className="text-2xl font-black text-[#111111] mb-2">No Services Found</h3>
            <p className="text-zinc-500 font-medium max-w-md mx-auto">We are currently updating our premium service catalog. Please check back later.</p>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {services.map((service, index) => {
              // Alternating heights for masonry look
              const isTall = index % 3 === 0 || index % 5 === 0;
              
              return (
                <motion.div 
                  key={service.id || index}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, delay: (index % 4) * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="break-inside-avoid"
                >
                  <Link href={getServicePath(service)} className="group block w-full bg-white rounded-[2rem] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_30px_60px_rgba(36,184,108,0.12)] border border-[#E2EDE8] hover:border-[#24B86C]/40 transition-all duration-500 hover:-translate-y-2 relative flex flex-col">
                    
                    {/* Image Section */}
                    <div className={`relative w-full overflow-hidden bg-zinc-100 ${isTall ? 'h-[360px]' : 'h-[240px]'}`}>
                      <Image 
                        src={service.image || 'https://images.unsplash.com/photo-1618220179428-22790b46a0eb?auto=format&fit=crop&q=80&w=800'} 
                        alt={service.category}
                        fill
                        className="object-cover transition-transform duration-1000 group-hover:scale-110 ease-[0.16,1,0.3,1]"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                      
                      {/* Floating Category Badge */}
                      <div className="absolute top-5 left-5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-white/40 shadow-sm">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#111111]">
                          {service.category}
                        </span>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-7 md:p-8 flex flex-col flex-1 bg-white relative z-10">
                      <h2 className="text-xl md:text-2xl font-black text-[#111111] leading-tight mb-3 group-hover:text-[#24B86C] transition-colors">
                        {service.title || service.category}
                      </h2>
                      <p className="text-zinc-500 font-medium text-sm leading-relaxed mb-8 line-clamp-2">
                        {service.description || "Premium bespoke solutions tailored to elevate your business presence."}
                      </p>
                      
                      {/* Elegant Arrow CTA */}
                      <div className="mt-auto flex items-center justify-between">
                        <span className="text-[13px] font-bold text-[#111111] uppercase tracking-widest group-hover:text-[#24B86C] transition-colors">
                          Explore Service
                        </span>
                        <div className="w-12 h-12 rounded-full bg-[#F3F6F5] flex items-center justify-center group-hover:bg-[#24B86C] transition-colors duration-300 shadow-sm group-hover:shadow-md">
                          <ArrowUpRight className="w-5 h-5 text-[#111111] group-hover:text-white transition-colors" />
                        </div>
                      </div>
                    </div>

                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section className="bg-white py-24 md:py-32 border-y border-[#E2EDE8] overflow-hidden relative">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-black text-[#0D1A12] tracking-tight mb-6">The Design Walla Advantage</h2>
            <p className="text-zinc-500 text-lg font-medium">We don't just deliver files; we deliver scalable business growth through exceptional design and engineering.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">
            {[
              { icon: Trophy, title: "Award-Winning Quality", desc: "Every project is crafted by vetted industry experts ensuring pixel-perfect, premium results." },
              { icon: Zap, title: "Lightning Fast Delivery", desc: "Streamlined processes and modern tech stacks mean we deliver your vision faster than traditional agencies." },
              { icon: Target, title: "Tailored Solutions", desc: "No cookie-cutter templates. We engineer bespoke strategies that perfectly align with your brand identity." }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-20 h-20 rounded-[1.5rem] bg-[#E8F5F1] border border-[#24B86C]/20 flex items-center justify-center mb-6 shadow-sm rotate-3 hover:rotate-0 transition-transform duration-300">
                  <feature.icon className="w-8 h-8 text-[#24B86C]" />
                </div>
                <h3 className="text-xl font-black text-[#111111] mb-3">{feature.title}</h3>
                <p className="text-zinc-500 font-medium leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PREMIUM CTA ── */}
      <section className="py-24 md:py-32 bg-[#FAFCFB] relative">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[#0D1A12] rounded-[3rem] p-10 md:p-20 relative overflow-hidden shadow-2xl"
          >
            {/* Dark Mode subtle gradients inside CTA */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(36,184,108,0.15)_0,transparent_60%)] pointer-events-none translate-x-1/3 -translate-y-1/3" />
            
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight relative z-10">
              Ready to Build <br className="hidden sm:block" />
              <span className="text-[#24B86C]">Something Extraordinary?</span>
            </h2>
            <p className="text-zinc-400 font-medium text-lg max-w-2xl mx-auto mb-10 relative z-10">
              Join hundreds of innovative companies that trust Design Walla to bring their creative visions to life.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
              <Link href="/contact">
                <Button className="w-full sm:w-auto h-14 px-10 rounded-full bg-[#24B86C] hover:bg-[#1E995A] text-white font-bold text-[15px] shadow-[0_8px_30px_rgba(36,184,108,0.4)] transition-all hover:-translate-y-1">
                  Start Your Project
                </Button>
              </Link>
              <Link href="/portfolio">
                <Button variant="outline" className="w-full sm:w-auto h-14 px-10 rounded-full bg-white/5 hover:bg-white/10 border-white/10 text-white font-bold text-[15px] backdrop-blur-md transition-all">
                  View Our Work
                </Button>
              </Link>
            </div>
            
            <div className="mt-12 flex items-center justify-center gap-6 relative z-10 flex-wrap">
              {['100% Satisfaction', 'Expert Team', 'Fast Turnaround'].map((perk, i) => (
                <div key={i} className="flex items-center gap-2 text-zinc-300 text-sm font-semibold tracking-wide">
                  <CheckCircle2 className="w-4 h-4 text-[#24B86C]" /> {perk}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
