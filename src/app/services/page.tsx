"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Layers, LayoutTemplate } from 'lucide-react';
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
    <div className="min-h-screen bg-[#FAFCFB] pt-24 pb-32">
      
      {/* ── HERO ── */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16 md:py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#E2EDE8] shadow-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-[#24B86C] animate-pulse" />
            <span className="text-zinc-600 font-bold text-xs tracking-widest uppercase">Our Expertise</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-[#111111] tracking-tighter mb-6">
            World-class <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#24B86C] to-[#11998E]">services</span> <br/>
            for modern brands.
          </h1>
          
          <p className="text-lg text-zinc-500 max-w-2xl mx-auto leading-relaxed">
            From intricate 3D models to comprehensive brand strategies, our studio delivers end-to-end creative solutions tailored for the digital age.
          </p>
        </motion.div>
      </section>

      {/* ── SERVICES LIST ── */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-24">
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
          categories.map((category, index) => {
            const isEven = index % 2 === 0;
            const heroCard = (category.cards && category.cards.length > 0) 
              ? category.cards[0] 
              : { image: 'https://images.unsplash.com/photo-1618220179428-22790b46a0eb?auto=format&fit=crop&q=80&w=1200' };
            const slug = category.id || category.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            
            return (
              <motion.div 
                key={category.id || index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`flex flex-col lg:flex-row gap-12 lg:gap-20 items-center ${isEven ? '' : 'lg:flex-row-reverse'}`}
              >
                {/* Image */}
                <div className="w-full lg:w-1/2 relative aspect-[4/3] rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.06)] group">
                  <Image 
                    src={heroCard.image || 'https://images.unsplash.com/photo-1618220179428-22790b46a0eb?auto=format&fit=crop&q=80&w=1200'} 
                    alt={category.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Content */}
                <div className="w-full lg:w-1/2 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#24B86C]/10 text-[#24B86C] text-xs font-bold uppercase tracking-wider">
                    Service
                  </div>
                  
                  <h2 className="text-4xl md:text-5xl font-black text-[#111111] tracking-tight">
                    {category.title}
                  </h2>
                  
                  <p className="text-zinc-600 leading-relaxed text-lg">
                    {category.description || 'Explore our exclusive range of creative assets and services tailored to elevate your projects.'}
                  </p>

                  <div className="pt-8 flex flex-wrap gap-4">
                    <Link href={`/services/${slug}`}>
                      <Button className="h-14 px-8 rounded-full bg-[#111111] hover:bg-[#24B86C] text-white font-bold text-[15px] shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 group flex items-center gap-2">
                        View Details
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    <Link href={`/products?category=${encodeURIComponent(category.title)}`}>
                      <Button variant="outline" className="h-14 px-8 rounded-full border border-[#E2EDE8] bg-white/60 hover:bg-white hover:border-[#24B86C]/30 text-zinc-700 font-bold text-[15px] hover:shadow-[0_8px_20px_rgba(0,0,0,0.04)] transition-all duration-300">
                        View Products
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </section>

      {/* ── CTA ── */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto mt-32 text-center">
        <div className="bg-white rounded-3xl p-12 shadow-[0_20px_60px_rgba(0,0,0,0.04)] border border-[#E2EDE8] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_center,rgba(36,184,108,0.1)_0,transparent_70%)] blur-2xl" />
          <h2 className="text-3xl md:text-4xl font-black text-[#111111] mb-4">Ready to elevate your brand?</h2>
          <p className="text-zinc-500 mb-8 max-w-xl mx-auto text-lg">Our team is ready to bring your vision to life. Let's discuss your next big project.</p>
          <Link href="/contact">
            <Button className="h-14 px-8 rounded-full bg-[#24B86C] hover:bg-[#1fa35f] text-white font-bold text-[15px] shadow-[0_8px_20px_rgba(36,184,108,0.25)] transition-all">
              Contact Our Studio
            </Button>
          </Link>
        </div>
      </section>

    </div>
  );
}
