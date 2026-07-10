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
      let data = await fetchPortfolioItems();
      
      // Use defaults if completely empty
      if (data.length === 0) {
        data = DEFAULT_ITEMS;
      }
      
      // For a 3D carousel to look like a cylinder, we need a minimum number of cards (e.g., 6)
      // If the admin only uploaded a few, we loop/duplicate them so the carousel isn't broken
      let displayData = [...data];
      while (displayData.length < 6) {
        displayData = [...displayData, ...data].map((item, idx) => ({ ...item, id: `${item.id}-${idx}` }));
      }
      
      setItems(displayData);
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
        <div className="w-full mt-12 mb-16 flex justify-center max-w-[100vw] overflow-hidden">
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
                    onError={(e) => {
                      // Fallback if image fails to load
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618220179428-22790b46a0eb?auto=format&fit=crop&q=80&w=600';
                    }}
                  />
                  {/* Title overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none opacity-90" />
                  <div className="absolute bottom-6 left-5 right-5 text-left pointer-events-none">
                    <p className="text-white font-bold text-base leading-tight drop-shadow-md line-clamp-2">
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
          perspective: 1200px; /* Increased perspective to flatten the curve slightly */
          /* The original mask */
          mask: linear-gradient(90deg, #0000, #000 15% 85%, #0000);
          -webkit-mask: linear-gradient(90deg, #0000, #000 15% 85%, #0000);
          width: 100%;
          max-width: 1200px; /* Constrain maximum width of the scene */
          padding: 2em 0; 
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
          --w: 16em; /* Slightly narrower cards */
          --ba: calc(1turn / var(--n));
          grid-area: 1 / 1;
          width: var(--w);
          aspect-ratio: 7 / 10;
          border-radius: 1.5em;
          backface-visibility: hidden;
          
          /* POSITIVE TRANSLATE Z: This makes it a convex cylinder (front cards are closer to user) 
             instead of concave (front cards far away, edge cards clipping user's face) */
          transform:
            rotateY(calc(var(--i) * var(--ba)))
            translateZ(calc((.5 * var(--w) + .5em) / tan(.5 * var(--ba))));
            
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
