"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { fetchPortfolioItems, type PortfolioItem } from '@/lib/store';

const DEFAULT_ITEMS: PortfolioItem[] = [
  { id: '1', title: 'Luxury Villa', image_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800', sort_order: 1 },
  { id: '2', title: 'Food Truck', image_url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=800', sort_order: 2 },
  { id: '3', title: 'Modern Studio', image_url: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=800', sort_order: 3 },
  { id: '4', title: 'Product Branding', image_url: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=800', sort_order: 4 },
  { id: '5', title: 'App UI Design', image_url: 'https://images.unsplash.com/photo-1618220179428-22790b46a0eb?auto=format&fit=crop&q=80&w=800', sort_order: 5 },
  { id: '6', title: 'Creative Website', image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800', sort_order: 6 },
];

// Rotation angles for the fan spread — negative left, zero center, positive right
const ROTATIONS = [-14, -8, -3, 3, 8, 14];
// Vertical offsets so side cards dip slightly lower than center
const Y_OFFSETS = [20, 8, 0, 0, 8, 20];

export function PortfolioSection() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    const loadItems = async () => {
      const data = await fetchPortfolioItems();
      setItems(data.length === 0 ? DEFAULT_ITEMS : data);
    };
    loadItems();
  }, []);

  const displayItems = items.slice(0, 6);

  return (
    <section className="relative w-full overflow-hidden bg-[#FAFCFB] py-24">
      {/* ── Soft background tint ── */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#f0faf5] via-[#FAFCFB] to-[#FAFCFB] pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 text-center">

        {/* ── Badge ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E8F5F1] text-[#24B86C] text-sm font-bold tracking-wide uppercase mb-6 shadow-sm border border-[#24B86C]/10"
        >
          <Star className="w-4 h-4 fill-current" /> Trusted by 100+ Amazing Clients
        </motion.div>

        {/* ── Heading ── */}
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
          className="text-zinc-600 max-w-2xl mx-auto font-medium text-[17px] mb-16"
        >
          From stunning interiors and exteriors to branding, websites, and digital marketing – every project reflects our passion for creativity, quality, and real business results.
        </motion.p>

        {/* ── Fan Card Spread ── */}
        {displayItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex items-end justify-center gap-3 md:gap-4 lg:gap-5 mb-20 px-4"
            style={{ minHeight: 400 }}
          >
            {displayItems.map((item, i) => {
              const rotate = ROTATIONS[i] ?? 0;
              const yOffset = Y_OFFSETS[i] ?? 0;
              const isHovered = hovered === item.id;
              const isCenter = i === 2 || i === 3;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 60, rotate: rotate * 0.5 }}
                  whileInView={{ opacity: 1, y: yOffset, rotate }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{
                    y: yOffset - 24,
                    rotate: 0,
                    scale: 1.05,
                    zIndex: 50,
                    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
                  }}
                  onHoverStart={() => setHovered(item.id)}
                  onHoverEnd={() => setHovered(null)}
                  className="relative shrink-0 cursor-pointer"
                  style={{
                    width: isCenter ? 'clamp(140px, 16vw, 220px)' : 'clamp(120px, 13vw, 190px)',
                    height: isCenter ? 'clamp(220px, 26vw, 360px)' : 'clamp(190px, 22vw, 310px)',
                    zIndex: isHovered ? 50 : (isCenter ? 20 : 10),
                    originY: 1,
                    originX: 0.5,
                  }}
                >
                  {/* Card */}
                  <div
                    className="w-full h-full rounded-[20px] md:rounded-[28px] overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.18)] border border-white/60 relative group"
                  >
                    <Image
                      src={item.image_url.replace(/^http:\/\//i, 'https://')}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 768px) 33vw, 20vw"
                    />
                    {/* Bottom gradient + title */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5">
                      <p className="text-white font-bold text-[11px] md:text-sm leading-tight drop-shadow-md line-clamp-2">
                        {item.title}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* ── Call to Action ── */}
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
