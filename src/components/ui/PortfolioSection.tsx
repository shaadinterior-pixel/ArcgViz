"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { fetchPortfolioItems, type PortfolioItem, fetchPortfolioContent, type PortfolioContent, DEFAULT_PORTFOLIO_CONTENT } from '@/lib/store';

// ... (keep DEFAULT_ITEMS)
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
  const [content, setContent] = useState<PortfolioContent>(DEFAULT_PORTFOLIO_CONTENT);

  useEffect(() => {
    const loadData = async () => {
      const [itemsData, contentData] = await Promise.all([
        fetchPortfolioItems(),
        fetchPortfolioContent()
      ]);
      
      let finalItems = itemsData;
      
      // Fallback to defaults only if absolutely empty
      if (!itemsData || itemsData.length === 0) {
        finalItems = DEFAULT_ITEMS;
      } 
      // If the user uploaded images, but fewer than 6, the 3D cylinder math (tan(PI/n)) 
      // will break or look bad (e.g. n=2 means dividing by infinity). 
      // We duplicate the items to create a full cylinder.
      else if (itemsData.length < 6) {
        finalItems = [];
        let counter = 0;
        while (finalItems.length < 6) {
          // Add a unique suffix to the ID so React keys don't clash during duplication
          finalItems.push(...itemsData.map(item => ({ ...item, id: `${item.id}-dup-${counter}` })));
          counter++;
        }
      }
      
      setItems(finalItems);
      setContent(contentData);
    };
    loadData();
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
          <Star className="w-4 h-4 fill-current" /> {content.badge_text}
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl lg:text-[54px] font-black tracking-tighter text-[#111111] leading-tight mb-6"
        >
          {content.headline_line1} <br />
          <span className="text-[#24B86C]">{content.headline_line2}</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-zinc-600 max-w-2xl mx-auto font-medium text-[17px] mb-12"
        >
          {content.subheadline}
        </motion.p>

      </div>

      {/* ── 3D Rotating Carousel ── */}
      {items.length > 0 && (
        <div className="w-full mt-12 mb-16 flex justify-center">
          <div className="scene">
            <div className="a3d" style={{ '--n': items.length } as React.CSSProperties}>
              {items.map((item, i) => (
                <div 
                  key={item.id} 
                  className="card group" 
                  style={{ '--i': i } as React.CSSProperties}
                >
                  <img
                    src={item.image_url.replace(/^http:\/\//i, 'https://')}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                  {/* Title overlay (optional, adapting to our site's design) */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />
                  <div className="absolute bottom-4 left-4 right-4 text-left pointer-events-none">
                    <p className="text-white font-bold text-sm leading-tight drop-shadow-md line-clamp-2">
                      {item.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Exact CSS from the source code, adapted slightly for scoping */}
      <style>{`
        .scene, .a3d { display: grid; }
        
        .scene {
          overflow: hidden;
          perspective: 35em;
          /* The original mask */
          mask: linear-gradient(90deg, #0000, red 20% 80%, #0000);
          -webkit-mask: linear-gradient(90deg, #0000, red 20% 80%, #0000);
          width: 100%;
          padding: 2em 0; /* Add some vertical padding to avoid clipping shadows */
        }
        
        .a3d {
          place-self: center;
          transform-style: preserve-3d;
          animation: ry 32s linear infinite;
        }
        
        @keyframes ry {
          to { transform: rotateY(1turn); }
        }
        
        .card {
          /* Using the exact math from the source code */
          --w: 17.5em;
          --ba: calc(1turn / var(--n));
          grid-area: 1 / 1;
          width: var(--w);
          aspect-ratio: 7 / 10;
          border-radius: 1.5em;
          backface-visibility: hidden;
          transform:
            rotateY(calc(var(--i) * var(--ba)))
            translateZ(calc(-1 * (.5 * var(--w) + .5em) / tan(.5 * var(--ba))));
          /* Additional site-specific styles */
          position: relative;
          overflow: hidden;
          box-shadow: 0 12px 30px rgba(0,0,0,0.15);
        }
        
        /* Adjust base font size for the em units if needed based on screen size */
        @media (max-width: 768px) {
          .scene { font-size: 12px; }
        }
        @media (min-width: 769px) {
          .scene { font-size: 16px; }
        }
      `}</style>

      {/* CTA */}
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
