"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Download, Play, ArrowRight } from 'lucide-react';
import { fetchProducts, fetchCategories, type Category } from '@/lib/store';

export function LatestUploadsSection() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchProducts(),
      fetchCategories()
    ])
      .then(([productsData, categoriesData]) => {
        const sorted = [...productsData].sort((a, b) =>
          new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
        );
        setProducts(sorted);
        setCategories(categoriesData || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const dynamicTabs = ['All', ...categories.map(c => c.title)];

  const filtered = React.useMemo(() => {
    if (activeFilter === 'All') return products;
    return products.filter(p => p.category?.toLowerCase() === activeFilter.toLowerCase());
  }, [products, activeFilter]);

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Gradient orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-[radial-gradient(circle_at_center,rgba(36,184,108,0.04)_0,transparent_60%)] pointer-events-none" />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-10 gpu-layer"
        >
          <span className="inline-block text-[#24B86C] text-xs font-bold tracking-[0.25em] uppercase mb-4">TRENDING</span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#0D1A12] tracking-tight leading-tight">
            Freshly dropped<br className="hidden sm:block" /> Endlessly scrollable
          </h2>
          <p className="text-zinc-500 font-medium max-w-2xl mx-auto text-lg">
            Design Walla style browsing, curated by our design team.
          </p>
        </motion.div>

        {/* Filter tabs + View All */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2 w-full">
            {dynamicTabs.map((cat, i) => (
              <Link 
                key={cat} 
                href={cat === 'All' ? '/products' : `/products?category=${encodeURIComponent(cat)}`}
                className="block shrink-0"
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border ${
                    activeFilter === cat
                      ? 'bg-[#0D1A12] text-white border-[#0D1A12] shadow-md'
                      : 'bg-white text-[#4B5563] border-[#E2EDE8] hover:border-[#24B86C] hover:text-[#24B86C]'
                  }`}
                >
                  {cat}
                </motion.div>
              </Link>
            ))}
          </div>
          <div className="flex justify-end">
            <Link href={activeFilter === 'All' ? '/products' : `/products?category=${encodeURIComponent(activeFilter)}`} className="flex items-center gap-1.5 text-sm font-semibold text-[#0D1A12] hover:text-[#24B86C] transition-colors group shrink-0">
              View all <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-white/60 border border-[#E2EDE8] animate-pulse" style={{ aspectRatio: i % 2 === 0 ? '3/4' : '4/3' }} />
            ))}
          </div>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-0">
            {filtered.slice(0, 30).map((product, index) => {
              const plan = product.plan_tier || 'Free';
              const hasVideo = String(product.category || '').toLowerCase().includes('motion') || String(product.category || '').toLowerCase().includes('animation');
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ delay: (index % 8) * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="break-inside-avoid mb-4 gpu-layer"
                >
                  <Link href={`/products/${product.id}`} className="block group">
                    <div className="relative rounded-2xl overflow-hidden hover:-translate-y-1 transition-all duration-300 shadow-sm border border-[#E2EDE8]/50">
                      {/* Image */}
                      <div className="relative w-full overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={product.image || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=600'}
                          alt={product.name}
                          loading="lazy"
                          className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500 bg-zinc-100"
                        />
                        {/* Gradient overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Badge */}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md border border-white/50 shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            plan === 'Free' ? 'bg-[#24B86C]' :
                            plan === 'Plus' ? 'bg-[#9333EA]' :
                            'bg-[#F59E0B]'
                          }`} />
                          <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-800">
                            {plan}
                          </span>
                        </div>

                        {/* Hover action icons */}
                        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                          <button className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow hover:bg-white hover:scale-110 transition-all">
                            <Heart className="w-3.5 h-3.5 text-[#0D1A12]" />
                          </button>
                          <button className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow hover:bg-white hover:scale-110 transition-all">
                            <Download className="w-3.5 h-3.5 text-[#0D1A12]" />
                          </button>
                          {hasVideo && (
                            <button className="w-8 h-8 rounded-full bg-[#9333EA] flex items-center justify-center shadow hover:scale-110 transition-all">
                              <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
                            </button>
                          )}
                        </div>

                        {/* Bottom info on hover */}
                        <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <p className="text-white text-xs font-bold line-clamp-1 drop-shadow">{product.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-white/80 text-[10px]">♡ {product.sales || 0}</span>
                            <span className="text-white/80 text-[10px]">↓ {product.sales || 0}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card footer */}
                      <div className="px-3 py-2.5 bg-white">
                        <p className="text-xs font-bold text-[#0D1A12] line-clamp-1">{product.name}</p>
                        <p className="text-[10px] text-[#9CA3AF] mt-0.5 capitalize">{product.category}</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* View all CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mt-12 gpu-layer"
        >
          <Link
            href={activeFilter === 'All' ? '/products' : `/products?category=${encodeURIComponent(activeFilter)}`}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#0D1A12] text-white font-bold text-sm hover:bg-[#24B86C] transition-all duration-300 shadow-lg group"
          >
            {activeFilter === 'All' ? 'Browse All Products' : `Browse All ${activeFilter}`}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
