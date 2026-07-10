"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
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
const FALLBACK_IMAGE_BASE = '/Carousel effect/crousal effect/png';

const DEFAULT_ITEMS: PortfolioItem[] = [
  { id: '1', title: 'Luxury Villa', image_url: `${FALLBACK_IMAGE_BASE}/1.jpg`, sort_order: 1 },
  { id: '2', title: 'Food Truck', image_url: `${FALLBACK_IMAGE_BASE}/2.jpg`, sort_order: 2 },
  { id: '3', title: 'Modern Studio', image_url: `${FALLBACK_IMAGE_BASE}/3.jpg`, sort_order: 3 },
  { id: '4', title: 'Product Branding', image_url: `${FALLBACK_IMAGE_BASE}/4.jpg`, sort_order: 4 },
  { id: '5', title: 'App UI Design', image_url: `${FALLBACK_IMAGE_BASE}/5.jpg`, sort_order: 5 },
  { id: '6', title: 'Creative Website', image_url: `${FALLBACK_IMAGE_BASE}/6.jpg`, sort_order: 6 },
  { id: '7', title: 'Interior Design', image_url: `${FALLBACK_IMAGE_BASE}/7.jpg`, sort_order: 7 },
  { id: '8', title: '3D Model', image_url: `${FALLBACK_IMAGE_BASE}/8.jpg`, sort_order: 8 },
  { id: '9', title: 'Architecture', image_url: `${FALLBACK_IMAGE_BASE}/9.jpg`, sort_order: 9 },
  { id: '10', title: 'Brand Identity', image_url: `${FALLBACK_IMAGE_BASE}/10.jpg`, sort_order: 10 },
  { id: '11', title: 'Motion Graphics', image_url: `${FALLBACK_IMAGE_BASE}/11.jpg`, sort_order: 11 },
  { id: '12', title: 'Social Media Kit', image_url: `${FALLBACK_IMAGE_BASE}/12.jpg`, sort_order: 12 },
];

type CarouselStyle = React.CSSProperties & {
  '--count'?: number;
  '--index'?: number;
};

function normalizeImageUrl(url?: string, index = 0): string {
  const fallback = `${FALLBACK_IMAGE_BASE}/${(index % CAROUSEL_ITEM_COUNT) + 1}.jpg`;
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
    <section className="relative w-full overflow-hidden bg-[#FAFCFB] py-20 sm:py-24">
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
                        target.src = `${FALLBACK_IMAGE_BASE}/${(index % CAROUSEL_ITEM_COUNT) + 1}.jpg`;
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
          mask: linear-gradient(90deg, transparent, #000 2%, #000 98%, transparent);
          -webkit-mask: linear-gradient(90deg, transparent, #000 2%, #000 98%, transparent);
          isolation: isolate;
        }

        .portfolio-carousel-ring {
          --angle: calc(1turn / var(--count));
          place-self: center;
          transform-style: preserve-3d;
          animation: portfolio-carousel-spin 32s linear infinite;
          will-change: transform;
        }

        .portfolio-carousel-scene:hover .portfolio-carousel-ring {
          animation-play-state: paused;
        }

        @keyframes portfolio-carousel-spin {
          to { transform: rotateY(1turn); }
        }

        .portfolio-carousel-card {
          grid-area: 1 / 1;
          width: var(--card-width);
          aspect-ratio: 7 / 10;
          position: relative;
          display: block;
          overflow: hidden;
          border-radius: clamp(1rem, 1.8vw, 1.5rem);
          background: #e8efe9;
          border: 1px solid rgba(255, 255, 255, 0.72);
          box-shadow: 0 24px 55px rgba(12, 24, 16, 0.18);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          transform:
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
            linear-gradient(180deg, rgba(255,255,255,0.1), transparent 34%),
            linear-gradient(0deg, rgba(0,0,0,0.82), rgba(0,0,0,0.04) 54%, transparent 72%);
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
            mask: linear-gradient(90deg, transparent, #000 8% 92%, transparent);
            -webkit-mask: linear-gradient(90deg, transparent, #000 8% 92%, transparent);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .portfolio-carousel-ring {
            animation-duration: 90s;
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
    </section>
  );
}
