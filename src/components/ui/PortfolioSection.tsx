"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChevronRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  DEFAULT_PORTFOLIO_CONTENT,
  fetchPortfolioContent,
  fetchPortfolioItems,
  type PortfolioContent,
  type PortfolioItem,
} from '@/lib/store';

const CAROUSEL_ITEM_COUNT = 12;

const PREMIUM_FALLBACKS = [
  '/portfolio-carousel/1.jpg',
  '/portfolio-carousel/2.jpg',
  '/portfolio-carousel/3.jpg',
  '/portfolio-carousel/4.jpg',
  '/portfolio-carousel/5.jpg',
  '/portfolio-carousel/6.jpg',
  '/portfolio-carousel/7.jpg',
  '/portfolio-carousel/8.jpg',
  '/portfolio-carousel/9.jpg',
  '/portfolio-carousel/10.jpg',
  '/portfolio-carousel/11.jpg',
  '/portfolio-carousel/12.jpg',
];

const DEFAULT_ITEMS: PortfolioItem[] = [
  { id: '1', title: 'Luxury Villa', image_url: PREMIUM_FALLBACKS[0], sort_order: 1 },
  { id: '2', title: 'Food Truck', image_url: PREMIUM_FALLBACKS[1], sort_order: 2 },
  { id: '3', title: 'Modern Studio', image_url: PREMIUM_FALLBACKS[2], sort_order: 3 },
  { id: '4', title: 'Product Branding', image_url: PREMIUM_FALLBACKS[3], sort_order: 4 },
  { id: '5', title: 'App UI Design', image_url: PREMIUM_FALLBACKS[4], sort_order: 5 },
  { id: '6', title: 'Creative Website', image_url: PREMIUM_FALLBACKS[5], sort_order: 6 },
  { id: '7', title: 'Interior Design', image_url: PREMIUM_FALLBACKS[6], sort_order: 7 },
  { id: '8', title: '3D Model', image_url: PREMIUM_FALLBACKS[7], sort_order: 8 },
  { id: '9', title: 'Architecture', image_url: PREMIUM_FALLBACKS[8], sort_order: 9 },
  { id: '10', title: 'Brand Identity', image_url: PREMIUM_FALLBACKS[9], sort_order: 10 },
  { id: '11', title: 'Motion Graphics', image_url: PREMIUM_FALLBACKS[10], sort_order: 11 },
  { id: '12', title: 'Social Media Kit', image_url: PREMIUM_FALLBACKS[11], sort_order: 12 },
];

type CarouselStyle = React.CSSProperties & {
  '--count'?: number;
  '--index'?: number;
};

function normalizeImageUrl(url?: string, index = 0): string {
  const fallback = PREMIUM_FALLBACKS[index % 12];
  if (!url || !url.trim()) return fallback;

  return url
    .trim()
    .replace(/^http:\/\/res\.cloudinary\.com/i, 'https://res.cloudinary.com');
}

function buildCarouselItems(sourceItems: PortfolioItem[]): PortfolioItem[] {
  const usableItems = sourceItems.length > 0 ? sourceItems : DEFAULT_ITEMS;
  const normalizedItems = usableItems.map((item, index) => ({
    ...item,
    image_url: normalizeImageUrl(item.image_url, index),
  }));

  const carouselItems: PortfolioItem[] = [];
  let pass = 0;

  while (carouselItems.length < CAROUSEL_ITEM_COUNT) {
    for (const item of normalizedItems) {
      if (carouselItems.length >= CAROUSEL_ITEM_COUNT) break;

      carouselItems.push({
        ...item,
        id: `${item.id}-carousel-${pass}-${carouselItems.length}`,
      });
    }
    pass += 1;
  }

  return carouselItems.slice(0, CAROUSEL_ITEM_COUNT);
}

export function PortfolioSection() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [content, setContent] = useState<PortfolioContent>(DEFAULT_PORTFOLIO_CONTENT);

  useEffect(() => {
    const loadData = async () => {
      const [itemsData, contentData] = await Promise.all([
        fetchPortfolioItems(),
        fetchPortfolioContent(),
      ]);

      setItems(buildCarouselItems(itemsData || []));
      setContent(contentData);
    };

    loadData();
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-[#FAFCFB]">
      
      {/* ── Top Half (Green Partners Section) ── */}
      <div className="relative w-full bg-[#24B86C] pt-16 sm:pt-24 overflow-hidden min-h-[400px] md:min-h-[500px] flex items-end justify-center">
        {/* Grid Background Pattern */}
        <div 
          className="absolute inset-0" 
          style={{ 
            backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.15) 1px, transparent 1px)', 
            backgroundSize: '100px 100px',
            backgroundPosition: 'center bottom'
          }} 
        />

        {/* Animated Background Logos */}
        {content.partner_logos && content.partner_logos.length > 0 && (
          <div className="absolute inset-0 z-0 opacity-[0.15] overflow-hidden flex flex-col justify-evenly py-10 pointer-events-none mix-blend-overlay" style={{ WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)', maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)' }}>
            {[...Array(4)].map((_, rowIndex) => {
              const logos = [...content.partner_logos!, ...content.partner_logos!, ...content.partner_logos!, ...content.partner_logos!, ...content.partner_logos!];
              const isReverse = rowIndex % 2 !== 0;
              const duration = 40 + (rowIndex * 10);
              
              return (
                <div key={rowIndex} className="flex whitespace-nowrap overflow-hidden">
                  <motion.div
                    className="flex gap-16 sm:gap-24 items-center shrink-0 min-w-max pr-16 sm:pr-24"
                    animate={{ x: isReverse ? ['-50%', '0%'] : ['0%', '-50%'] }}
                    transition={{ duration, repeat: Infinity, ease: 'linear' }}
                  >
                    {logos.map((logo, i) => (
                      <div key={i} className="relative w-28 h-12 sm:w-36 sm:h-16 grayscale brightness-[3] contrast-200">
                        <img src={logo} alt="Partner Logo" className="w-full h-full object-contain" />
                      </div>
                    ))}
                  </motion.div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Floating Text Container (Perfectly Centered) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 overflow-visible mt-[-50px]">
          {/* Top Line */}
          <motion.div 
            initial={{ opacity: 0, rotate: -8, x: -120, y: -40 }}
            whileInView={{ opacity: 1, rotate: -5, x: -80, y: -40 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-[32px] sm:text-[48px] md:text-[64px] lg:text-[76px] font-black text-white uppercase tracking-wider drop-shadow-[0_8px_16px_rgba(0,0,0,0.15)] whitespace-nowrap"
          >
            OUR VALUABLE PARTNERS
          </motion.div>

          {/* Bottom Line */}
          <motion.div 
            initial={{ opacity: 0, rotate: 8, x: 120, y: 40 }}
            whileInView={{ opacity: 1, rotate: 5, x: 80, y: 40 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            className="text-[32px] sm:text-[48px] md:text-[64px] lg:text-[76px] font-black text-white uppercase tracking-wider drop-shadow-[0_8px_16px_rgba(0,0,0,0.15)] whitespace-nowrap"
          >
            WHO WORK WITH US
          </motion.div>
        </div>

        {/* Central Characters (C1.png) - Flush to Bottom */}
        <div className="container relative z-20 mx-auto px-4 flex justify-center">
          <motion.div 
            initial={{ opacity: 0, y: 150 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, type: "spring", bounce: 0.3 }}
            className="relative w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px] pointer-events-none"
            style={{ marginBottom: '-2px' }} // Ensures the cut-off image touches the edge perfectly
          >
            <Image 
              src="/C1.png" 
              alt="Partners" 
              fill 
              className="object-contain object-bottom drop-shadow-[0_20px_40px_rgba(0,0,0,0.25)]" 
              priority 
            />
          </motion.div>
        </div>
      </div>

      {/* ── Bottom Half (Portfolio Slider Section) ── */}
      <div className="relative w-full pt-20 sm:pt-24 border-t-4 border-white">
        <div className="absolute inset-0 bg-gradient-to-b from-[#f0faf5] via-[#FAFCFB] to-[#FAFCFB] pointer-events-none" />

        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E8F5F1] text-[#24B86C] text-sm font-bold tracking-wide uppercase mb-6 shadow-sm border border-[#24B86C]/10"
          >
            <Star className="w-4 h-4 fill-current" />
            {content.badge_text}
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-[54px] font-black tracking-tighter text-[#111111] leading-tight mb-6"
          >
            {content.headline_line1}
            <br />
            <span className="text-brand-gradient inline-block pb-1">{content.headline_line2}</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-zinc-600 max-w-2xl mx-auto font-medium text-[16px] sm:text-[17px] leading-relaxed"
          >
            {content.subheadline}
          </motion.p>
        </div>

      {items.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="relative z-10 mt-12 sm:mt-14 mb-14 sm:mb-16"
        >
          <div className="portfolio-carousel-scene">
            <div className="portfolio-carousel-ring" style={{ '--count': items.length } as CarouselStyle}>
              {items.map((item, index) => (
                <Link
                  key={item.id}
                  href={item.link || '/portfolio'}
                  className="portfolio-carousel-card group"
                  style={{ '--index': index } as CarouselStyle}
                  aria-label={`View ${item.title}`}
                >
                  <img
                    src={item.image_url}
                    alt={item.title}
                    loading="eager"
                    decoding="sync"
                    className="portfolio-carousel-image"
                    onError={(event) => {
                      const target = event.currentTarget as HTMLImageElement;
                      if (!target.dataset.failed) {
                        target.dataset.failed = 'true';
                        target.src = PREMIUM_FALLBACKS[index % 12];
                      }
                    }}
                  />
                  <span className="portfolio-carousel-shade" aria-hidden="true" />
                  <span className="portfolio-carousel-title">
                    <span>{item.title}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      <style>{`
        .portfolio-carousel-scene,
        .portfolio-carousel-ring {
          display: grid;
        }

        .portfolio-carousel-scene {
          --card-width: clamp(8.5rem, 14vw, 17.5rem);
          --scene-height: clamp(25rem, 45vw, 35rem);
          width: 100%;
          min-height: var(--scene-height);
          padding: clamp(2rem, 5vw, 3.5rem) 0;
          overflow: hidden;
          perspective: clamp(36rem, 62vw, 58rem);
          -webkit-perspective: clamp(36rem, 62vw, 58rem);
          mask: linear-gradient(90deg, transparent, #000 2%, #000 98%, transparent);
          -webkit-mask: linear-gradient(90deg, transparent, #000 2%, #000 98%, transparent);
          isolation: isolate;
        }

        .portfolio-carousel-ring {
          --angle: calc(360deg / var(--count));
          place-self: center;
          transform-style: preserve-3d;
          -webkit-transform-style: preserve-3d;
          animation: portfolio-carousel-spin 32s linear infinite;
          -webkit-animation: portfolio-carousel-spin 32s linear infinite;
          will-change: transform;
        }

        .portfolio-carousel-scene:hover .portfolio-carousel-ring {
          animation-play-state: paused;
          -webkit-animation-play-state: paused;
        }

        @keyframes portfolio-carousel-spin {
          to { transform: rotateY(360deg); }
        }

        @-webkit-keyframes portfolio-carousel-spin {
          to { -webkit-transform: rotateY(360deg); }
        }

        .portfolio-carousel-card {
          grid-area: 1 / 1;
          width: var(--card-width);
          aspect-ratio: 7 / 10;
          position: relative;
          display: block;
          overflow: hidden;
          border-radius: clamp(1rem, 1.8vw, 1.5rem);
          background: #1a2a1f;
          border: 1px solid rgba(255, 255, 255, 0.72);
          box-shadow: 0 24px 55px rgba(12, 24, 16, 0.18);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          transform:
            rotateY(calc(var(--index) * var(--angle)))
            translateZ(calc(-1 * (.5 * var(--card-width) + 2.5rem) / tan(.5 * var(--angle))));
          -webkit-transform:
            rotateY(calc(var(--index) * var(--angle)))
            translateZ(calc(-1 * (.5 * var(--card-width) + 2.5rem) / tan(.5 * var(--angle))));
          transition: box-shadow 250ms ease, filter 250ms ease;
        }

        .portfolio-carousel-card:hover {
          box-shadow: 0 30px 75px rgba(12, 24, 16, 0.24);
          filter: saturate(1.06);
        }

        .portfolio-carousel-image {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          object-position: center;
        }

        .portfolio-carousel-shade {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            linear-gradient(180deg, rgba(255,255,255,0.06), transparent 30%),
            linear-gradient(0deg, rgba(0,0,0,0.55), rgba(0,0,0,0.02) 45%, transparent 65%);
        }

        .portfolio-carousel-title {
          position: absolute;
          left: clamp(0.8rem, 1.5vw, 1.15rem);
          right: clamp(0.8rem, 1.5vw, 1.15rem);
          bottom: clamp(0.75rem, 1.5vw, 1.1rem);
          color: white;
          font-size: clamp(0.72rem, 1vw, 0.92rem);
          font-weight: 800;
          line-height: 1.2;
          text-align: left;
          text-shadow: 0 2px 14px rgba(0, 0, 0, 0.55);
        }

        .portfolio-carousel-title span {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @media (max-width: 768px) {
          .portfolio-carousel-scene {
            --card-width: clamp(7rem, 34vw, 9rem);
            --scene-height: 22rem;
            perspective: 34rem;
            -webkit-perspective: 34rem;
            mask: linear-gradient(90deg, transparent, #000 8% 92%, transparent);
            -webkit-mask: linear-gradient(90deg, transparent, #000 8% 92%, transparent);
          }
        }
      `}</style>

      <div className="relative z-10 flex flex-col items-center gap-3 mt-8">
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
      </div>
    </section>
  );
}
