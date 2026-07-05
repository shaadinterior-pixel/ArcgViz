"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight, Heart, Download, Play } from 'lucide-react';
import { fetchProducts, fetchCategories, type Category, type Product } from '@/lib/store';

export function LatestUploadsSection() {
  const [products, setProducts] = useState<Product[]>([]);
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
    <section className="py-24 bg-[#FAFCFB] relative overflow-hidden">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {loading ? (
          <div className="space-y-16">
            {[1, 2].map((i) => (
              <div key={i}>
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <div className="h-8 w-48 bg-zinc-200 rounded animate-pulse mb-2" />
                    <div className="h-4 w-64 bg-zinc-200 rounded animate-pulse" />
                  </div>
                </div>
                <div className="flex gap-4 overflow-hidden">
                  {[1, 2, 3, 4].map(j => (
                    <div key={j} className="w-[300px] h-[225px] shrink-0 bg-zinc-200 rounded-2xl animate-pulse" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className="space-y-20">
            {categories.map((category, catIndex) => {
              // Get products for this category
              const catProducts = products.filter(p => p.category?.toLowerCase() === category.title.toLowerCase());
              if (catProducts.length === 0) return null;

              return (
                <div key={category.id}>
                  {/* Category Header */}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: catIndex * 0.1 }}
                    className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4"
                  >
                    <div>
                      <h2 className="text-3xl font-black text-[#0D1A12] tracking-tight">{category.title}</h2>
                      {category.description && (
                        <p className="text-[#6B7280] text-sm mt-1">{category.description}</p>
                      )}
                    </div>
                    <Link href={`/products?category=${encodeURIComponent(category.title)}`} className="inline-flex items-center gap-1.5 text-sm font-bold text-[#24B86C] hover:text-[#1E995A] transition-colors group shrink-0">
                      View all <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </motion.div>

                  {/* Horizontal Scroll Area */}
                  <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
                    <div className="flex overflow-x-auto gap-5 pb-8 snap-x snap-mandatory hide-scrollbar">
                      {catProducts.slice(0, 8).map((product, index) => {
                        const plan = product.plan_tier || 'Free';
                        const hasVideo = String(product.category || '').toLowerCase().includes('motion') || String(product.category || '').toLowerCase().includes('animation');
                        
                        return (
                          <motion.div
                            key={product.id}
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: '-40px' }}
                            transition={{ delay: (index % 8) * 0.05, duration: 0.4 }}
                            className="w-[280px] sm:w-[320px] shrink-0 snap-start"
                          >
                            <Link href={`/products/${product.id}`} className="block group">
                              <div className="relative rounded-2xl overflow-hidden bg-white border border-[#E2EDE8] hover:shadow-[0_20px_40px_rgba(36,184,108,0.08)] hover:-translate-y-1 transition-all duration-400">
                                {/* Image */}
                                <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100 p-2 pb-0">
                                  <div className="relative w-full h-full rounded-t-xl overflow-hidden">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={product.thumbnail_url || product.image || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=600'}
                                      alt={product.name}
                                      loading="lazy"
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-[0.16,1,0.3,1]"
                                    />
                                    
                                    {/* Gradient overlay on hover */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    
                                    {/* Badge */}
                                    <div className={`absolute top-3 left-3 px-2.5 py-1.5 rounded-[8px] text-[10px] font-black uppercase tracking-wider text-white shadow-sm flex items-center justify-center ${
                                      plan === 'Free' ? 'bg-[#24B86C]' :
                                      plan === 'Plus' ? 'bg-[#9333EA]' :
                                      'bg-[#F59E0B]'
                                    }`}>
                                      {plan}
                                    </div>
                                    
                                    {/* Hover action icons */}
                                    <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                                      <button className="w-8 h-8 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center shadow-sm hover:scale-110 transition-all text-zinc-700 hover:text-[#24B86C]">
                                        <Heart className="w-4 h-4" />
                                      </button>
                                      {hasVideo && (
                                        <button className="w-8 h-8 rounded-full bg-[#24B86C] flex items-center justify-center shadow hover:scale-110 transition-all">
                                          <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                                        </button>
                                      )}
                                    </div>
                                    
                                    {/* Bottom info on hover */}
                                    <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                      <div className="flex items-center gap-3">
                                        <span className="text-white font-medium text-xs flex items-center gap-1.5">
                                          <Heart className="w-3.5 h-3.5" /> {product.sales || 0}
                                        </span>
                                        <span className="text-white font-medium text-xs flex items-center gap-1.5">
                                          <Download className="w-3.5 h-3.5" /> {Math.floor((product.sales || 0) * 1.5)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Info */}
                                <div className="p-4 bg-white">
                                  <h3 className="font-bold text-[#0D1A12] text-sm line-clamp-1 group-hover:text-[#24B86C] transition-colors">{product.name}</h3>
                                  <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs font-medium text-[#6B7280]">{product.author || 'Design Walla'}</span>
                                    <span className="text-sm font-black text-[#0D1A12]">{product.price}</span>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          </motion.div>
                        );
                      })}
                      
                      {/* View All Card */}
                      {catProducts.length > 8 && (
                        <div className="w-[200px] shrink-0 snap-start flex items-center justify-center">
                          <Link href={`/products?category=${encodeURIComponent(category.title)}`} className="flex flex-col items-center justify-center gap-3 w-full h-[60%] rounded-2xl border-2 border-dashed border-[#E2EDE8] bg-white hover:border-[#24B86C] hover:bg-[#24B86C]/5 transition-colors group">
                            <div className="w-12 h-12 rounded-full bg-[#F3F6F5] group-hover:bg-[#24B86C]/20 flex items-center justify-center transition-colors">
                              <ArrowRight className="w-5 h-5 text-[#24B86C] group-hover:translate-x-1 transition-transform" />
                            </div>
                            <span className="text-sm font-bold text-[#0D1A12]">View all</span>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-[#6B7280] mb-4">No categories found.</p>
            <Link href="/admin/showcase-categories" className="inline-flex items-center justify-center px-4 py-2 bg-[#0D1A12] text-white rounded-lg text-sm font-bold">
              Add Categories in Admin
            </Link>
          </div>
        )}
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </section>
  );
}
