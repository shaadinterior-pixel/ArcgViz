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

  return (
    <div className="flex flex-col gap-16 py-24 bg-[#F8FAF9] relative overflow-hidden">
      {/* Gradient orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-[radial-gradient(circle_at_center,rgba(36,184,108,0.06)_0,transparent_60%)] pointer-events-none" />

      {loading ? (
        <div className="container max-w-7xl mx-auto px-4">
          <div className="h-8 bg-zinc-200 rounded w-48 mb-6 animate-pulse" />
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="min-w-[280px] h-[360px] rounded-2xl bg-white/60 border border-[#E2EDE8] animate-pulse" />
            ))}
          </div>
        </div>
      ) : (
        <>
          {categories.length > 0 ? categories.map((cat, catIndex) => {
            const catProducts = products.filter(p => p.category?.toLowerCase() === cat.title.toLowerCase());
            if (catProducts.length === 0) return null;

            return (
              <section key={cat.id} className="w-full">
                <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex items-end justify-between mb-8">
                    <div>
                      <h2 className="text-3xl font-black text-[#0D1A12] tracking-tight">{cat.title}</h2>
                      {cat.description && <p className="text-[#6B7280] mt-2 text-sm">{cat.description}</p>}
                    </div>
                    <Link href={`/products?category=${encodeURIComponent(cat.title)}`} className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-[#24B86C] hover:text-[#0D1A12] transition-colors group shrink-0">
                      View all <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                  {/* Horizontal Scroll Area */}
                  <div className="flex overflow-x-auto hide-scrollbar gap-5 pb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
                    {catProducts.map((product, i) => {
                      const isPremium = product.price && product.price !== '₹0' && product.price !== '$0' && product.price !== 'Free' && !String(product.price).toLowerCase().includes('free');
                      const hasVideo = String(product.category || '').toLowerCase().includes('motion') || String(product.category || '').toLowerCase().includes('animation');
                      
                      return (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, x: 20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true, margin: '-40px' }}
                          transition={{ delay: (i % 5) * 0.1, duration: 0.5 }}
                          className="shrink-0 w-[260px] sm:w-[280px] group"
                        >
                          <Link href={`/products/${product.id}`} className="block">
                            <div className="relative rounded-2xl overflow-hidden mb-3 aspect-[4/3] bg-zinc-100">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={product.image || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=600'}
                                alt={product.name}
                                loading="lazy"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                              <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-sm ${isPremium ? 'bg-[#24B86C]' : 'bg-white/95 !text-[#0D1A12]'}`}>
                                {isPremium ? 'PREMIUM' : 'FREE'}
                              </div>

                              <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                                <button className="w-8 h-8 rounded-full bg-white/95 flex items-center justify-center shadow-md hover:scale-110 transition-all">
                                  <Heart className="w-3.5 h-3.5 text-[#0D1A12]" />
                                </button>
                                <button className="w-8 h-8 rounded-full bg-white/95 flex items-center justify-center shadow-md hover:scale-110 transition-all">
                                  <Download className="w-3.5 h-3.5 text-[#0D1A12]" />
                                </button>
                                {hasVideo && (
                                  <button className="w-8 h-8 rounded-full bg-[#9333EA] flex items-center justify-center shadow-md hover:scale-110 transition-all">
                                    <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                            
                            <div className="px-1">
                              <h3 className="font-bold text-[#0D1A12] text-[15px] line-clamp-1 group-hover:text-[#24B86C] transition-colors">{product.name}</h3>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-sm font-medium text-zinc-500">{product.author}</span>
                                <span className="text-sm font-black text-[#0D1A12]">{product.price}</span>
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </section>
            );
          }) : (
            <div className="text-center py-20 text-zinc-500">No categories found. Add some from the Admin Panel.</div>
          )}
        </>
      )}
    </div>
  );
}
