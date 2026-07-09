"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Layers } from 'lucide-react';
import { fetchCategories, type Category } from '@/lib/store';
import { Button } from '@/components/ui/Button';

export default function ServicesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories()
      .then(data => setCategories(data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#F3F6F5] pt-28 pb-32">
      
      {/* ── HEADER ── */}
      <div className="text-center mb-16 px-4">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#111111] uppercase tracking-wide max-w-4xl mx-auto leading-tight">
          OUR PREMIUM SERVICES DESIGNED TO GROW YOUR BUSINESS
        </h1>
        <p className="mt-4 text-[#6B7280] font-medium max-w-2xl mx-auto">
          Design Walla style browsing, curated by our design team.
        </p>
      </div>

      {/* ── CAROUSEL / GRID ── */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#24B86C]"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">
            <Layers className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No services/categories available yet.</p>
          </div>
        ) : (
          <div className="flex overflow-x-auto pb-12 pt-4 snap-x snap-mandatory gap-6 hide-scrollbar">
            {categories.map((category, index) => {
              const heroCard = (category.cards && category.cards.length > 0) 
                ? category.cards[0] 
                : { image: 'https://images.unsplash.com/photo-1618220179428-22790b46a0eb?auto=format&fit=crop&q=80&w=600' };
              const slug = category.id || category.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
              
              return (
                <motion.div 
                  key={category.id || index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="snap-start shrink-0 w-[280px] md:w-[320px] bg-white rounded-[24px] overflow-hidden shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-[#E2EDE8] flex flex-col group transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative h-[260px] w-full overflow-hidden">
                    <Image 
                      src={heroCard.image || 'https://images.unsplash.com/photo-1618220179428-22790b46a0eb?auto=format&fit=crop&q=80&w=600'} 
                      alt={category.title}
                      fill
                      className="object-cover transition-transform duration-700"
                      sizes="(max-width: 768px) 280px, 320px"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-300" />
                  </div>

                  {/* Content (White Bottom Section) */}
                  <div className="p-6 flex flex-col items-center text-center flex-1 justify-between bg-white z-10 border-t-2 border-[#F3F6F5]">
                    <h2 className="text-[13px] font-black text-[#111111] uppercase tracking-wide mb-6 leading-snug">
                      {category.title}
                    </h2>
                    
                    <Link href={`/services/${slug}`} className="w-full">
                      <Button className="w-full rounded-full bg-gradient-to-r from-[#24B86C] to-[#11998E] hover:from-[#1E995A] hover:to-[#0E7F76] text-white font-bold h-12 text-sm shadow-[0_8px_20px_rgba(36,184,108,0.25)] transition-all uppercase tracking-wide">
                        Know More
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* Global Style to hide scrollbar but allow scrolling */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
