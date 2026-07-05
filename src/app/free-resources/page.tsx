"use client";

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { fetchProducts } from '@/lib/store';
import { Product } from '@/lib/store';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Heart, Download, Star, ArrowRight, Loader2 } from 'lucide-react';

export default function FreeResourcesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProducts().then(data => {
      // Filter ONLY Free plan_tier products
      const freeProducts = data.filter(p => (p.plan_tier || 'Free') === 'Free');
      setProducts(freeProducts);
      setLoading(false);
    }).catch(console.error);
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    (p.category && p.category.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="bg-white min-h-screen text-[#111111] selection:bg-[#24B86C]/20 flex flex-col">
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-[#0D1A12]">
              Free Resources
            </h1>
            <p className="text-[#6B7280] text-lg">
              High-quality 3D models, textures, and assets. Completely free to download and use in your projects.
            </p>
          </div>

          {/* Search */}
          <div className="max-w-xl mx-auto mb-16 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input 
              type="text"
              placeholder="Search free resources..."
              className="w-full bg-zinc-50 border border-zinc-200 rounded-full py-4 pl-12 pr-6 focus:outline-none focus:border-[#24B86C] focus:ring-1 focus:ring-[#24B86C] transition-all text-[#111111]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-32">
              <Loader2 className="w-8 h-8 text-[#24B86C] animate-spin" />
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <Link href={`/products/${product.slug || product.id}`} className="block group">
                      <div className="relative bg-white rounded-2xl overflow-hidden border border-[#E2EDE8] hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100 p-2 pb-0">
                          <div className="relative w-full h-full rounded-t-xl overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={product.image || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=600'} 
                              alt={product.name}
                              loading="lazy"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            
                            <div className="absolute top-3 left-3 bg-[#24B86C] px-2.5 py-1 rounded-[8px] text-[10px] font-black uppercase tracking-wider text-white shadow-sm">
                              FREE
                            </div>
                            
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="bg-white/95 text-[#0D1A12] px-4 py-2 rounded-full font-bold text-sm shadow flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all">
                                <Download className="w-4 h-4" /> Download
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-white">
                          <h3 className="font-bold text-[#0D1A12] text-sm line-clamp-1 mb-1">{product.name}</h3>
                          <div className="flex items-center justify-between text-xs text-[#6B7280]">
                            <span className="capitalize">{product.category}</span>
                            <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-[#00E599] text-[#00E599]" /> {product.rating || '4.9'}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-24">
              <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-zinc-400" />
              </div>
              <h3 className="text-lg font-bold text-[#111111] mb-2">No free resources found</h3>
              <p className="text-zinc-500">Try adjusting your search terms.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
