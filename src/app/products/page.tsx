"use client";

import React, { useState, useDeferredValue, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, ChevronDown, Star, Search, ShoppingCart, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

// ── Static fallback (bundled at build — always available) ───────────────────
import { fetchProducts, fetchCategories, onStoreUpdate, type Product } from '@/lib/store';

const FALLBACK_CATEGORIES = ['All', '3D Models', 'PBR Materials', 'Interior Scenes', 'Furniture', 'Lighting'];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>(FALLBACK_CATEGORIES);

  useEffect(() => {
    const load = async () => {
      try {
        const [data, cats] = await Promise.all([fetchProducts(), fetchCategories()]);
        setProducts(data);
        if (cats && cats.length > 0) {
          setAllCategories(['All', ...cats.map(c => c.title)]);
        }
      } catch (e) {
        console.error('Failed to load products', e);
      }
    };
    load();
    const unsub = onStoreUpdate('products', load);
    return () => unsub();
  }, []);



  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);

  // useDeferredValue keeps the UI responsive while typing
  const deferredSearch = useDeferredValue(searchQuery);
  const deferredCategory = useDeferredValue(activeCategory);

  const filteredProducts = useMemo(() =>
    products
      .filter(p => p.status !== 'Draft')   // hide drafts from storefront
      .filter(product => {
        const matchesSearch = product.name?.toLowerCase().includes(deferredSearch.toLowerCase()) ||
                              product.author?.toLowerCase().includes(deferredSearch.toLowerCase());
        const matchesCategory = deferredCategory === 'All' || product.category === deferredCategory;
        const matchesProperties = selectedProperties.every(prop => (product.features || []).includes(prop));
        return matchesSearch && matchesCategory && matchesProperties;
      }),
    [products, deferredSearch, deferredCategory, selectedProperties]
  );

  return (
    <div className="min-h-screen bg-[#F8FAF9]">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header & Search */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 border-b border-[#E2EDE8] pb-10"
        >
          <div className="w-full md:w-auto flex-1">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 tracking-tight text-[#0D1A12]">All Products</h1>
            <p className="text-[#6B7280] max-w-2xl mb-8 text-lg">Browse our premium collection of high-quality 3D models, materials, and templates.</p>
            
            <div className="relative max-w-xl w-full group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9CA3AF] w-5 h-5 group-focus-within:text-[#24B86C] transition-colors" />
              <Input 
                type="text" 
                placeholder="Search assets, categories, or authors..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-14 h-14 bg-white border-[#E2EDE8] focus:border-[#24B86C] focus:ring-4 focus:ring-[#24B86C]/10 transition-all text-base rounded-2xl w-full shadow-sm text-[#0D1A12] font-medium placeholder:text-[#9CA3AF]"
              />
            </div>
          </div>
        
          <div className="flex items-center space-x-3 w-full md:w-auto mt-4 md:mt-0">
            <Button 
              variant="outline" 
              className="md:hidden w-full h-14 rounded-2xl border-[#E2EDE8] text-[#0D1A12] font-semibold"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <Filter className="w-4 h-4 mr-2 text-[#24B86C]" />
              Filters
            </Button>
            <div className="hidden md:flex relative">
              <select className="appearance-none bg-white border border-[#E2EDE8] rounded-2xl px-6 py-4 pr-12 text-sm focus:outline-none focus:border-[#24B86C] focus:ring-4 focus:ring-[#24B86C]/10 w-56 cursor-pointer font-bold text-[#0D1A12] shadow-sm transition-all">
                <option>Latest Arrivals</option>
                <option>Most Popular</option>
                <option>Best Selling</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF] pointer-events-none" />
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Sidebar */}
        <aside className={`${isFilterOpen ? 'block' : 'hidden'} lg:block w-full lg:w-[280px] space-y-8 flex-shrink-0`}>
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-[#DDF0E9] p-7 rounded-[1.5rem]"
          >
            <h3 className="font-bold text-[#0D1A12] text-xl mb-5">Categories</h3>
            <div className="space-y-4">
              {allCategories.map((cat) => (
                <label key={cat} className="flex items-center space-x-3.5 cursor-pointer group">
                  <div className={`w-5 h-5 rounded-[6px] flex items-center justify-center transition-all duration-200 ${activeCategory === cat ? 'bg-[#24B86C]' : 'bg-white border border-[#B9D9CE] group-hover:border-[#24B86C]'}`}>
                    {activeCategory === cat && <div className="w-2 h-2 bg-white rounded-[2px]" />}
                  </div>
                  <input 
                    type="radio" 
                    name="category"
                    className="hidden" 
                    checked={activeCategory === cat}
                    onChange={() => setActiveCategory(cat)}
                  />
                  <span className={`text-[15px] transition-colors ${activeCategory === cat ? 'text-[#0D1A12] font-bold' : 'text-[#4B5563] group-hover:text-[#0D1A12] font-medium'}`}>
                    {cat}
                  </span>
                </label>
              ))}
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-[#DDF0E9] p-7 rounded-[1.5rem]"
          >
            <h3 className="font-bold text-[#0D1A12] text-xl mb-5">Properties</h3>
            <div className="space-y-4">
              {['Rigged', 'Animated', 'Game-Ready', '3D Printable'].map((prop) => (
                <label key={prop} className="flex items-center space-x-3.5 cursor-pointer group">
                  <div className={`w-5 h-5 rounded-[6px] flex items-center justify-center transition-all duration-200 ${selectedProperties.includes(prop) ? 'bg-[#24B86C]' : 'bg-white border border-[#B9D9CE] group-hover:border-[#24B86C]'}`}>
                    {selectedProperties.includes(prop) && <div className="w-2 h-2 bg-white rounded-[2px]" />}
                  </div>
                  <input type="checkbox" className="hidden" 
                    checked={selectedProperties.includes(prop)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedProperties([...selectedProperties, prop]);
                      else setSelectedProperties(selectedProperties.filter(p => p !== prop));
                    }}
                  />
                  <span className={`text-[15px] transition-colors ${selectedProperties.includes(prop) ? 'text-[#0D1A12] font-bold' : 'text-[#4B5563] group-hover:text-[#0D1A12] font-medium'}`}>{prop}</span>
                </label>
              ))}
            </div>
          </motion.div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {filteredProducts.length > 0 ? (
            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                    className="gpu-layer h-full"
                  >
                    <Link href={`/products/${product.slug || product.id}`} className="block h-full outline-none">
                      <div className="group bg-white rounded-3xl overflow-hidden border border-[#E2EDE8] shadow-sm hover:shadow-[0_20px_40px_rgba(36,184,108,0.08)] hover:-translate-y-1 transition-all duration-400 h-full flex flex-col">
                        
                        {/* Image Container */}
                        <div className="relative aspect-[4/3] w-full bg-[#F3F6F5] overflow-hidden p-2 pb-0 shrink-0 rounded-t-3xl">
                          <div className="relative w-full h-full rounded-t-xl overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={product.image || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800'} 
                              alt={product.name}
                              loading="lazy"
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-[0.16,1,0.3,1] gpu-layer"
                            />
                            
                            {/* Badges */}
                            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md border border-white/50 shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                (product.plan_tier || 'Free') === 'Free' ? 'bg-[#24B86C]' :
                                (product.plan_tier || 'Free') === 'Plus' ? 'bg-[#9333EA]' :
                                'bg-[#F59E0B]'
                              }`} />
                              <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-800">
                                {product.plan_tier || 'Free'}
                              </span>
                            </div>
                            
                            {/* Rating removed */}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 flex-1 flex flex-col justify-between bg-white">
                          <div>
                            <div className="text-[10px] font-bold text-[#9CA3AF] mb-2 tracking-[0.2em] uppercase">{product.author || 'DESIGN WALLA'}</div>
                            <h3 className="font-bold text-lg text-[#0D1A12] leading-[1.3] mb-4 line-clamp-2 group-hover:text-[#24B86C] transition-colors">{product.name}</h3>
                          </div>
                          
                          <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#E2EDE8]/60">
                            <span className="text-[22px] font-black text-[#0D1A12] tracking-tight">{product.price}</span>
                            <button className="h-10 rounded-xl bg-[#E6F4F1] text-[#24B86C] hover:bg-[#24B86C] hover:text-white transition-all duration-300 flex items-center gap-2 px-4 shadow-sm">
                              <Download className="w-4 h-4" />
                              <span className="font-bold text-[13px]">Buy Now</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center h-80 text-center border-2 border-dashed border-[#E2EDE8] rounded-[2rem] bg-white"
            >
              <div className="bg-[#E6F4F1] w-20 h-20 rounded-full flex items-center justify-center mb-5">
                <Search className="w-10 h-10 text-[#24B86C]" />
              </div>
              <h3 className="text-2xl font-bold text-[#0D1A12] mb-3">No products found</h3>
              <p className="text-[#6B7280] max-w-sm mb-6 text-lg">Try adjusting your search or filters to find what you&apos;re looking for.</p>
              <Button 
                onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
                className="bg-[#0D1A12] hover:bg-[#24B86C] text-white rounded-xl h-12 px-8 font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                Clear all filters
              </Button>
            </motion.div>
          )}
          
          {filteredProducts.length > 0 && (
            <div className="mt-20 flex justify-center">
              <Button variant="outline" size="lg" className="px-12 h-14 rounded-full text-[15px] font-bold border-[#E2EDE8] text-[#0D1A12] hover:bg-[#0D1A12] hover:text-white hover:border-[#0D1A12] transition-all shadow-sm">
                Load More Assets
              </Button>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
