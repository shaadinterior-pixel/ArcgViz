"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { fetchPortfolioItems, type PortfolioItem } from '@/lib/store';
import { motion } from 'framer-motion';

export default function PortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadItems = async () => {
      const data = await fetchPortfolioItems();
      if (data.length === 0) {
        // Fallback demo data
        setItems([
          { id: '1', title: 'Luxury Villa Interior', image_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800', sort_order: 1 },
          { id: '2', title: 'Food Truck Design', image_url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=800', sort_order: 2 },
          { id: '3', title: 'Modern Studio Apartment', image_url: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=800', sort_order: 3 },
          { id: '4', title: 'Product Branding & Packaging', image_url: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=800', sort_order: 4 },
          { id: '5', title: 'App UI Design System', image_url: 'https://images.unsplash.com/photo-1618220179428-22790b46a0eb?auto=format&fit=crop&q=80&w=800', sort_order: 5 },
          { id: '6', title: 'Creative Agency Website', image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800', sort_order: 6 },
        ]);
      } else {
        setItems(data);
      }
      setLoading(false);
    };
    loadItems();
  }, []);

  return (
    <div className="bg-[#FAFCFB] min-h-screen pt-32 pb-24">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-12">
          <Link href="/">
            <Button variant="ghost" className="mb-6 -ml-4 text-zinc-500 hover:text-[#24B86C]">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl md:text-5xl font-black text-[#111111] tracking-tight">Our Portfolio</h1>
          <p className="text-zinc-600 mt-4 text-lg max-w-2xl">
            A showcase of our best work. From 3D visualizations and architectural renders to full-stack web applications and brand identities.
          </p>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#24B86C]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-zinc-100 aspect-[4/3] flex flex-col cursor-pointer"
              >
                <div className="absolute inset-0 z-0">
                  <Image
                    src={item.image_url}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300 z-10" />
                
                <div className="relative z-20 mt-auto p-6 flex items-end justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white leading-tight drop-shadow-md group-hover:-translate-y-1 transition-transform duration-300">{item.title}</h3>
                  </div>
                  {item.link && (
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-[#24B86C] transition-colors shrink-0">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
