"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Download, Play, ArrowRight } from 'lucide-react';
import { fetchProducts } from '@/lib/store';

const CATEGORIES = ['All', 'Interior', '3D Models', 'Branding', 'Graphics', 'Web & Apps'];

const CAT_MAP: Record<string, string[]> = {
  'Interior':   ['interior', 'exterior', 'architecture', 'room', 'home'],
  '3D Models':  ['3d', 'model', 'render', 'blender'],
  'Branding':   ['brand', 'logo', 'identity'],
  'Graphics':   ['graphic', 'poster', 'print', 'motion', 'animation'],
  'Web & Apps': ['web', 'app', 'ui', 'ux', 'template', 'website'],
};

function matchCat(product: any, cat: string) {
  if (cat === 'All') return true;
  const haystack = `${product.name} ${product.category} ${product.description || ''}`.toLowerCase();
  return (CAT_MAP[cat] || []).some(kw => haystack.includes(kw));
}

// Heights for masonry-like feel — cycles through 4 sizes
const HEIGHTS = ['aspect-[3/4]', 'aspect-[4/3]', 'aspect-square', 'aspect-[2/3]', 'aspect-[4/3]', 'aspect-[3/4]', 'aspect-square', 'aspect-[5/4]'];

export function LatestUploadsSection() {
  const [products, setProducts] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts()
      .then(data => {
        const sorted = [...data].sort((a, b) =>
          new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
        ).slice(0, 30);
        setProducts(sorted);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() =>
    products.filter(p => matchCat(p, activeFilter)),
    [products, activeFilter]
  );

  return (
    <section className="py-24 bg-[#F8FAF9] relative overflow-hidden">
      {/* Gradient orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-[radial-gradient(circle_at_center,rgba(36,184,108,0.06)_0,transparent_60%)] pointer-events-none" />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <span className="inline-block text-[#24B86C] text-xs font-bold tracking-[0.25em] uppercase mb-4">TRENDING</span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#0D1A12] tracking-tight leading-tight">
            Freshly dropped.<br className="hidden sm:block" /> Endlessly scrollable.
          </h2>
          <p className="text-[#6B7280] mt-4 text-base max-w-md mx-auto">
            Freepik-style browsing, curated by our design team.
          </p>
        </motion.div>

        {/* Filter tabs + View All */}
        <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat, i) => (
              <motion.button
                key={cat}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setActiveFilter(cat)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border ${
                  activeFilter === cat
                    ? 'bg-[#0D1A12] text-white border-[#0D1A12] shadow-md'
                    : 'bg-white text-[#4B5563] border-[#E2EDE8] hover:border-[#24B86C] hover:text-[#24B86C]'
                }`}
              >
                {cat}
              </motion.button>
            ))}
          </div>
          <Link href="/products" className="flex items-center gap-1.5 text-sm font-semibold text-[#0D1A12] hover:text-[#24B86C] transition-colors group shrink-0">
            View all <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
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
              const isPremium = product.price && product.price !== '₹0' && product.price !== '$0' && product.price !== 'Free' && !String(product.price).toLowerCase().includes('free');
              const hasVideo = String(product.category || '').toLowerCase().includes('motion') || String(product.category || '').toLowerCase().includes('animation');
              const heightClass = HEIGHTS[index % HEIGHTS.length];

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ delay: (index % 8) * 0.06, duration: 0.4 }}
                  className="break-inside-avoid mb-4"
                >
                  <Link href={`/products/${product.id}`} className="block group">
                    <div className="relative rounded-2xl overflow-hidden bg-white border border-[#E2EDE8] hover:shadow-xl hover:shadow-[#24B86C]/10 hover:-translate-y-1 transition-all duration-300">
                      {/* Image */}
                      <div className={`relative w-full ${heightClass}`}>
                        <Image
                          src={product.image || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=600'}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          quality={70}
                        />
                        {/* Gradient overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Badge */}
                        <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white ${isPremium ? 'bg-[#24B86C]' : 'bg-white/90 !text-[#0D1A12]'}`}>
                          {isPremium ? 'PREMIUM' : 'FREE'}
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
                            <button className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow hover:bg-white hover:scale-110 transition-all">
                              <Play className="w-3.5 h-3.5 text-[#0D1A12]" />
                            </button>
                          )}
                        </div>

                        {/* Bottom info on hover */}
                        <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <p className="text-white text-xs font-bold line-clamp-1 drop-shadow">{product.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-white/70 text-[10px]">♡ {product.sales || 0}</span>
                            <span className="text-white/70 text-[10px]">↓ {product.sales || 0}</span>
                            <span className="text-white/70 text-[10px] capitalize">{product.category}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card footer */}
                      <div className="px-3 py-2.5">
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
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          viewport={{ once: true }} transition={{ delay: 0.3 }}
          className="text-center mt-12"
        >
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#0D1A12] text-white font-bold text-sm hover:bg-[#24B86C] transition-all duration-300 shadow-lg group"
          >
            Browse All Products
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
