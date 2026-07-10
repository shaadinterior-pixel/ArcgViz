"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { fetchPortfolioItems, type PortfolioItem } from '@/lib/store';

// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/autoplay';

// import required modules
import { EffectCoverflow, Autoplay } from 'swiper/modules';

export function PortfolioSection() {
  const [items, setItems] = useState<PortfolioItem[]>([]);

  useEffect(() => {
    const loadItems = async () => {
      const data = await fetchPortfolioItems();
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

  return (
    <section className="relative w-full overflow-hidden bg-white">
      
      {/* ── Top Half (Green Section) ── */}
      <div className="relative w-full bg-[#24B86C] pt-20 pb-40 overflow-hidden">
        {/* Glassmorphic Grid Background Pattern (Rounded Squares) */}
        <div 
          className="absolute inset-0 opacity-40 mix-blend-overlay" 
          style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='10' y='10' width='80' height='80' rx='16' fill='rgba(255,255,255,0.2)' stroke='rgba(255,255,255,0.4)' stroke-width='1.5' /%3E%3C/svg%3E")`, 
            backgroundSize: '100px 100px',
            backgroundPosition: 'center center'
          }} 
        />
        
        <div className="container relative z-10 mx-auto px-4 h-[340px] flex items-center justify-center">
          <div className="relative w-full max-w-6xl mx-auto h-full flex items-center justify-center">
            
            {/* Typography - Placed further out so characters don't block them */}
            <motion.div 
              initial={{ opacity: 0, rotate: -3, x: -50 }}
              whileInView={{ opacity: 1, rotate: -3, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute top-12 left-0 md:left-10 lg:left-0 text-[32px] sm:text-4xl md:text-5xl lg:text-[64px] font-black text-white uppercase tracking-wider drop-shadow-lg z-10 whitespace-nowrap"
            >
              OUR VALUABLE PARTNERS
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, rotate: 3, x: 50 }}
              whileInView={{ opacity: 1, rotate: 3, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
              className="absolute bottom-12 right-0 md:right-10 lg:right-0 text-[32px] sm:text-4xl md:text-5xl lg:text-[64px] font-black text-white uppercase tracking-wider drop-shadow-lg z-10 whitespace-nowrap"
            >
              WHO WORK WITH US
            </motion.div>

            {/* Central Characters (C1.png) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, type: "spring" }}
              className="absolute left-1/2 -translate-x-1/2 bottom-[-130px] md:bottom-[-200px] w-[350px] h-[350px] md:w-[550px] md:h-[550px] z-20 pointer-events-none"
            >
              <Image src="/C1.png" alt="Partners" fill className="object-contain drop-shadow-2xl" priority />
            </motion.div>
          </div>
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
            className="text-zinc-600 max-w-2xl mx-auto font-medium text-[17px] mb-12"
          >
            From stunning interiors and exteriors to branding, websites, and digital marketing – every project reflects our passion for creativity, quality, and real business results.
          </motion.p>

          {/* ── 3D Convex Mirror Infinite Auto-Scroll Slider ── */}
          {items.length > 0 && (
            <div className="relative w-full max-w-[1400px] mx-auto mb-16 mt-8">
              {/* Force hardware acceleration for smooth 90fps animations */}
              <div className="transform-gpu will-change-transform cursor-grab active:cursor-grabbing">
                <Swiper
                  effect={'coverflow'}
                  grabCursor={true}
                  centeredSlides={true}
                  slidesPerView={'auto'}
                  initialSlide={Math.floor(items.length / 2)}
                  coverflowEffect={{
                    rotate: 15,        // Curve effect rotation
                    stretch: -10,      // Pull items slightly closer together
                    depth: 250,        // Push background items further back for convex feel
                    modifier: 1,
                    slideShadows: true,
                  }}
                  loop={true}
                  autoplay={{
                    delay: 0,
                    disableOnInteraction: false,
                  }}
                  speed={3500} // Continuous seamless scroll speed
                  modules={[EffectCoverflow, Autoplay]}
                  className="w-full py-12 !px-4"
                  style={{
                    // Use a linear transition for seamless continuous scrolling
                    // @ts-ignore
                    '--swiper-wrapper-transition-timing-function': 'linear',
                  }}
                >
                  {items.map((item) => (
                    <SwiperSlide 
                      key={item.id} 
                      className="!w-[280px] !h-[400px] md:!w-[340px] md:!h-[480px] rounded-[28px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] group"
                    >
                      <div className="w-full h-full relative">
                        <Image 
                          src={item.image_url.replace(/^http:\/\//i, 'https://')} 
                          alt={item.title} 
                          fill 
                          className="object-cover transition-transform duration-700 group-hover:scale-105" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80" />
                        <div className="absolute bottom-8 left-8 right-8 text-left">
                          <h3 className="text-white font-bold text-2xl drop-shadow-md leading-tight">{item.title}</h3>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>
          )}

          {/* ── Call to Action ── */}
          <div className="relative flex flex-col items-center justify-center mt-12 mb-8">
            <Link href="/portfolio">
              <Button className="h-14 px-8 rounded-full bg-[#24B86C] hover:bg-[#1E995A] text-white font-bold text-[16px] shadow-[0_8px_30px_rgba(36,184,108,0.4)] transition-all hover:-translate-y-1 group">
                View Our Portfolio
                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <p className="text-zinc-500 text-sm mt-4 font-medium">Let's create something extraordinary together.</p>
          </div>

        </div>
      </div>
    </section>
  );
}
