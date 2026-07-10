"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { fetchPortfolioItems, type PortfolioItem } from '@/lib/store';

export function PortfolioSection() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const loadItems = async () => {
      const data = await fetchPortfolioItems();
      // If no data, use some nice placeholders
      if (data.length === 0) {
        setItems([
          { id: '1', title: 'Luxury Villa', image_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800', sort_order: 1 },
          { id: '2', title: 'Food Truck', image_url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=800', sort_order: 2 },
          { id: '3', title: 'Modern Studio', image_url: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=800', sort_order: 3 },
          { id: '4', title: 'Product Branding', image_url: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=800', sort_order: 4 },
          { id: '5', title: 'App UI Design', image_url: 'https://images.unsplash.com/photo-1618220179428-22790b46a0eb?auto=format&fit=crop&q=80&w=800', sort_order: 5 },
          { id: '6', title: 'Creative Website', image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800', sort_order: 6 },
        ]);
      } else {
        setItems(data);
      }
    };
    loadItems();
  }, []);

  // Auto slide
  useEffect(() => {
    if (items.length === 0) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [items.length]);

  return (
    <section className="relative w-full overflow-hidden bg-white">
      
      {/* ── Top Half (Green Section) ── */}
      <div className="relative w-full bg-[#24B86C] pt-20 pb-40 overflow-hidden">
        {/* Grid Background Pattern */}
        <div 
          className="absolute inset-0 opacity-10" 
          style={{ 
            backgroundImage: 'linear-gradient(to right, #ffffff 2px, transparent 2px), linear-gradient(to bottom, #ffffff 2px, transparent 2px)', 
            backgroundSize: '120px 120px' 
          }} 
        />
        
        <div className="container relative z-10 mx-auto px-4 text-center h-[300px]">
          {/* Angled Typography */}
          <motion.div 
            initial={{ opacity: 0, rotate: -5, y: 50 }}
            whileInView={{ opacity: 1, rotate: -3, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute top-10 left-10 md:left-32 text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-wider drop-shadow-lg"
          >
            OUR VALUABLE PARTNERS
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, rotate: 5, y: 50 }}
            whileInView={{ opacity: 1, rotate: 3, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="absolute bottom-10 right-10 md:right-32 text-4xl md:text-5xl lg:text-6xl font-black text-white/90 uppercase tracking-wider drop-shadow-lg"
          >
            WHO WORK WITH US
          </motion.div>

          {/* Central Characters (C1.png) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, type: "spring" }}
            className="absolute left-1/2 -translate-x-1/2 bottom-[-100px] md:bottom-[-160px] w-[300px] h-[300px] md:w-[450px] md:h-[450px] z-20 pointer-events-none"
          >
            <Image src="/C1.png" alt="Partners" fill className="object-contain drop-shadow-2xl" />
          </motion.div>
        </div>
      </div>

      {/* ── Bottom Half (White Section) ── */}
      <div className="relative w-full bg-[#FAFCFB] pt-32 pb-24 border-t-4 border-white">
        <div className="container mx-auto px-4 text-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E8F5F1] text-[#24B86C] text-sm font-bold tracking-wide uppercase mb-6 shadow-sm border border-[#24B86C]/10"
          >
            <Star className="w-4 h-4 fill-current" /> Trusted by 100+ Amazing Clients
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-[54px] font-black tracking-tighter text-[#111111] leading-tight mb-6"
          >
            Projects That <span className="text-[#24B86C]">Build Brands</span><br/>
            & <span className="text-[#24B86C]">Transform</span> Spaces
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-600 max-w-2xl mx-auto font-medium text-[17px] mb-16"
          >
            From stunning interiors and exteriors to branding, websites, and digital marketing – every project reflects our passion for creativity, quality, and real business results.
          </motion.p>

          {/* ── 3D Coverflow Slider ── */}
          <div className="relative w-full h-[400px] md:h-[450px] flex items-center justify-center overflow-hidden perspective-[1200px] mb-16 mt-10">
            <div className="relative w-full max-w-5xl h-full flex items-center justify-center transform-style-preserve-3d">
              <AnimatePresence initial={false}>
                {items.map((item, index) => {
                  // Calculate distance from active index
                  let offset = index - activeIndex;
                  if (offset < -Math.floor(items.length / 2)) offset += items.length;
                  if (offset > Math.floor(items.length / 2)) offset -= items.length;

                  // Define 3D transform properties based on offset
                  const absOffset = Math.abs(offset);
                  const isCenter = offset === 0;
                  
                  // Limit the number of visible items for performance and look
                  if (absOffset > 3) return null;

                  return (
                    <motion.div
                      key={item.id}
                      animate={{
                        x: offset * 240, // Horizontal spread
                        scale: isCenter ? 1 : Math.max(0.7, 1 - absOffset * 0.15),
                        rotateY: offset * -25, // Turn inwards
                        zIndex: 100 - absOffset,
                        opacity: absOffset > 2 ? 0 : 1,
                      }}
                      transition={{ type: "spring", stiffness: 200, damping: 25 }}
                      className="absolute w-[280px] h-[360px] md:w-[320px] md:h-[420px] rounded-[24px] overflow-hidden shadow-2xl cursor-pointer"
                      onClick={() => setActiveIndex(index)}
                      style={{ transformOrigin: 'center center' }}
                    >
                      <Image 
                        src={item.image_url} 
                        alt={item.title} 
                        fill 
                        className="object-cover"
                      />
                      {/* Gradient Overlay & Title */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                      <div className="absolute bottom-6 left-6 right-6">
                        <h3 className="text-white font-bold text-xl drop-shadow-md">{item.title}</h3>
                      </div>
                      
                      {/* Click overlay for non-active items */}
                      {!isCenter && (
                        <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] transition-all hover:bg-transparent" />
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Call to Action with scribbles ── */}
          <div className="relative flex flex-col items-center justify-center mt-12 mb-8">
            <Link href="/portfolio">
              <Button className="h-14 px-8 rounded-full bg-[#24B86C] hover:bg-[#1E995A] text-white font-bold text-[16px] shadow-[0_8px_30px_rgba(36,184,108,0.4)] transition-all hover:-translate-y-1 group">
                View Our Portfolio
                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <p className="text-zinc-500 text-sm mt-4">Let's create something extraordinary together.</p>
          </div>

        </div>
      </div>
    </section>
  );
}
