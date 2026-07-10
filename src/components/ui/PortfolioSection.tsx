"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { fetchPortfolioItems, type PortfolioItem } from '@/lib/store';

const DEFAULT_ITEMS: PortfolioItem[] = [
  { id: '1',  title: 'Luxury Villa',      image_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=600', sort_order: 1 },
  { id: '2',  title: 'Food Truck',        image_url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=600', sort_order: 2 },
  { id: '3',  title: 'Modern Studio',     image_url: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=600', sort_order: 3 },
  { id: '4',  title: 'Product Branding',  image_url: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=600', sort_order: 4 },
  { id: '5',  title: 'App UI Design',     image_url: 'https://images.unsplash.com/photo-1618220179428-22790b46a0eb?auto=format&fit=crop&q=80&w=600', sort_order: 5 },
  { id: '6',  title: 'Creative Website',  image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600', sort_order: 6 },
  { id: '7',  title: 'Interior Design',   image_url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=600', sort_order: 7 },
  { id: '8',  title: '3D Model',          image_url: 'https://images.unsplash.com/photo-1618220179428-22790b46a0eb?auto=format&fit=crop&q=80&w=600', sort_order: 8 },
  { id: '9',  title: 'Architecture',      image_url: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&q=80&w=600', sort_order: 9 },
  { id: '10', title: 'Brand Identity',    image_url: 'https://images.unsplash.com/photo-1634942537034-2531766767d1?auto=format&fit=crop&q=80&w=600', sort_order: 10 },
  { id: '11', title: 'Motion Graphics',   image_url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=600', sort_order: 11 },
  { id: '12', title: 'Social Media Kit',  image_url: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?auto=format&fit=crop&q=80&w=600', sort_order: 12 },
];

export function PortfolioSection() {
  const [items, setItems] = useState<PortfolioItem[]>([]);

  useEffect(() => {
    const loadItems = async () => {
      const data = await fetchPortfolioItems();
      setItems(data.length >= 6 ? data : DEFAULT_ITEMS);
    };
    loadItems();
  }, []);

  const n = items.length || 12;

  return (
    <section className="relative w-full overflow-hidden bg-[#FAFCFB] py-24">

      {/* Soft background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#f0faf5] via-[#FAFCFB] to-[#FAFCFB] pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 text-center">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E8F5F1] text-[#24B86C] text-sm font-bold tracking-wide uppercase mb-6 shadow-sm border border-[#24B86C]/10"
        >
          <Star className="w-4 h-4 fill-current" /> Trusted by 100+ Amazing Clients
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl lg:text-[54px] font-black tracking-tighter text-[#111111] leading-tight mb-6"
        >
          Projects That <span className="text-[#24B86C]">Build Brands</span><br />
          &amp; <span className="text-[#24B86C]">Transform</span> Spaces
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-zinc-600 max-w-2xl mx-auto font-medium text-[17px] mb-12"
        >
          From stunning interiors and exteriors to branding, websites, and digital marketing – every
          project reflects our passion for creativity, quality, and real business results.
        </motion.p>

      </div>

      {/* ── 3D Rotating Carousel ── */}
      {items.length > 0 && (
        <div
          className="carousel-scene"
          style={{
            overflow: 'hidden',
            perspective: '900px',
            WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, black 18%, black 82%, transparent 100%)',
            maskImage: 'linear-gradient(90deg, transparent 0%, black 18%, black 82%, transparent 100%)',
            height: '380px',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <div
            style={{
              display: 'grid',
              transformStyle: 'preserve-3d',
              animation: 'carousel3d 32s linear infinite',
            }}
          >
            {items.map((item, i) => {
              const angle = (i * (360 / n));
              // radius = (cardWidth/2 + gap) / tan(PI/n)
              const cardW = 224; // px
              const radius = Math.round((cardW / 2 + 8) / Math.tan(Math.PI / n));
              return (
                <div
                  key={item.id}
                  style={{
                    gridArea: '1 / 1',
                    width: cardW,
                    aspectRatio: '7 / 10',
                    borderRadius: 24,
                    overflow: 'hidden',
                    backfaceVisibility: 'hidden',
                    transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                    position: 'relative',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image_url.replace(/^http:\/\//i, 'https://')}
                    alt={item.title}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  {/* Title overlay */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.80) 0%, transparent 55%)',
                  }} />
                  <div style={{
                    position: 'absolute', bottom: 20, left: 16, right: 16, textAlign: 'left',
                  }}>
                    <p style={{ color: '#fff', fontWeight: 700, fontSize: 15, lineHeight: 1.3, textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}>
                      {item.title}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CSS animation injected globally via <style> */}
      <style>{`
        @keyframes carousel3d {
          to { transform: rotateY(1turn); }
        }
      `}</style>

      {/* CTA */}
      <div className="relative z-10 flex flex-col items-center gap-3 mt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center gap-3"
        >
          <Link href="/portfolio">
            <Button className="h-14 px-10 rounded-full bg-[#24B86C] hover:bg-[#1E995A] text-white font-bold text-[16px] shadow-[0_8px_30px_rgba(36,184,108,0.4)] transition-all hover:-translate-y-1 group">
              View Our Portfolio
              <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <p className="text-zinc-500 text-sm font-medium">Let&apos;s create something extraordinary together.</p>
        </motion.div>
      </div>

    </section>
  );
}
