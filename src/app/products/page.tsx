"use client";

import React, { useState, useDeferredValue, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, ChevronDown, Search, Download, Heart, Play, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

// ── Static fallback (bundled at build — always available) ───────────────────
import { fetchProducts, fetchCategories, onStoreUpdate, type Product, type Category } from '@/lib/store';

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [dbCategories, setDbCategories] = useState<Category[]>([]);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [activeSubcategories, setActiveSubcategories] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  

  useEffect(() => {
    const load = async () => {
      try {
        const [data, cats] = await Promise.all([fetchProducts(), fetchCategories()]);
        setProducts(data);
        setDbCategories(cats || []);
      } catch (e) {
        console.error('Failed to load products', e);
      }
    };
    load();
    const unsub = onStoreUpdate('products', load);
    return () => unsub();
  }, []);

  // useDeferredValue keeps the UI responsive while typing
  const deferredSearch = useDeferredValue(searchQuery);


  const filteredProducts = useMemo(() =>
    products
      .filter(p => p.status !== 'Draft')   // hide drafts from storefront
      .filter(product => {
        const q = deferredSearch.toLowerCase();
        const matchesSearch = !q ||
                              product.name?.toLowerCase().includes(q) ||
                              product.author?.toLowerCase().includes(q) ||
                              product.description?.toLowerCase().includes(q) ||
                              product.category?.toLowerCase().includes(q) ||
                              product.subcategory?.toLowerCase().includes(q);
        
        // If activeCategories is empty, it means "All"
        const matchesCategory = activeCategories.length === 0 || activeCategories.includes(product.category);
        
        // If activeSubcategories is empty, don't filter by subcategory
        const matchesSubcategory = activeSubcategories.length === 0 || (product.subcategory && activeSubcategories.includes(product.subcategory));

        const matchesProperties = selectedProperties.every(prop => (product.features || []).includes(prop));
        
        return matchesSearch && matchesCategory && matchesSubcategory && matchesProperties;
      })
      // Latest uploaded first
      .sort((a, b) => {
        const da = a.created_at ? new Date(a.created_at).getTime() : 0;
        const db2 = b.created_at ? new Date(b.created_at).getTime() : 0;
        return db2 - da;
      }),
    [products, deferredSearch, activeCategories, activeSubcategories, selectedProperties]
  );

  // Helper to toggle array elements
  const toggleArray = (arr: string[], val: string, setter: (val: string[]) => void) => {
    if (arr.includes(val)) {
      setter(arr.filter(x => x !== val));
    } else {
      setter([...arr, val]);
    }
  };

  // Extract available subcategories based on active categories
  const availableSubcategories = useMemo(() => {
    const subs = new Set<string>();
    // If no category selected, show all subcategories
    const relevantCats = activeCategories.length > 0 
      ? dbCategories.filter(c => activeCategories.includes(c.title))
      : dbCategories;
      
    relevantCats.forEach(c => {
      (c.subcategories || []).forEach(s => subs.add(s));
    });
    return Array.from(subs);
  }, [dbCategories, activeCategories]);

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
              className="w-full md:w-auto h-14 rounded-2xl border-[#E2EDE8] text-[#0D1A12] font-semibold relative px-6"
              onClick={() => setIsFilterOpen(true)}
            >
              <Filter className="w-4 h-4 mr-2 text-[#24B86C]" />
              Filters
              {(activeCategories.length + activeSubcategories.length + selectedProperties.length) > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#24B86C] text-white text-[11px] font-black flex items-center justify-center border-2 border-[#F8FAF9] shadow-sm">
                  {activeCategories.length + activeSubcategories.length + selectedProperties.length}
                </span>
              )}
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
        {/* Filter Drawer */}
        <AnimatePresence>
          {isFilterOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-[#0D1A12]/40 backdrop-blur-sm z-[100]"
                onClick={() => setIsFilterOpen(false)}
              />
              
              {/* Drawer Content */}
              <motion.div
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 w-full sm:w-[400px] h-full bg-white z-[110] shadow-2xl overflow-y-auto flex flex-col"
              >
                <div className="p-6 md:p-8 flex items-center justify-between border-b border-[#E2EDE8] sticky top-0 bg-white z-10">
                  <h2 className="text-2xl font-black text-[#0D1A12]">Filters</h2>
                  <button 
                    onClick={() => setIsFilterOpen(false)}
                    className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-colors text-zinc-600"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
                </div>
                
                <div className="p-6 md:p-8 space-y-8 flex-1">
                  {/* Categories */}
                  <div className="bg-[#DDF0E9] p-7 rounded-[1.5rem]">
                    <h3 className="font-bold text-[#0D1A12] text-xl mb-5">Categories</h3>
                    <div className="space-y-4">
                      <label className="flex items-center space-x-3.5 cursor-pointer group">
                        <div className={`w-5 h-5 rounded-[6px] flex items-center justify-center transition-all duration-200 ${activeCategories.length === 0 ? 'bg-[#24B86C]' : 'bg-white border border-[#B9D9CE] group-hover:border-[#24B86C]'}`}>
                          {activeCategories.length === 0 && <div className="w-2 h-2 bg-white rounded-[2px]" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={activeCategories.length === 0} onChange={() => { setActiveCategories([]); setActiveSubcategories([]); }} />
                        <span className={`text-[15px] transition-colors ${activeCategories.length === 0 ? 'text-[#0D1A12] font-bold' : 'text-[#4B5563] group-hover:text-[#0D1A12] font-medium'}`}>All</span>
                      </label>
                      {dbCategories.map((cat) => (
                        <label key={cat.id} className="flex items-center space-x-3.5 cursor-pointer group">
                          <div className={`w-5 h-5 rounded-[6px] flex items-center justify-center transition-all duration-200 ${activeCategories.includes(cat.title) ? 'bg-[#24B86C]' : 'bg-white border border-[#B9D9CE] group-hover:border-[#24B86C]'}`}>
                            {activeCategories.includes(cat.title) && <div className="w-2 h-2 bg-white rounded-[2px]" />}
                          </div>
                          <input type="checkbox" className="hidden" checked={activeCategories.includes(cat.title)} onChange={() => toggleArray(activeCategories, cat.title, setActiveCategories)} />
                          <span className={`text-[15px] transition-colors ${activeCategories.includes(cat.title) ? 'text-[#0D1A12] font-bold' : 'text-[#4B5563] group-hover:text-[#0D1A12] font-medium'}`}>{cat.title}</span>
                        </label>
                      ))}
                    </div>
                    {availableSubcategories.length > 0 && (
                      <>
                        <h3 className="font-bold text-[#0D1A12] text-xl mt-8 mb-5">Subcategories</h3>
                        <div className="space-y-4">
                          {availableSubcategories.map((sub) => (
                            <label key={sub} className="flex items-center space-x-3.5 cursor-pointer group">
                              <div className={`w-5 h-5 rounded-[6px] flex items-center justify-center transition-all duration-200 ${activeSubcategories.includes(sub) ? 'bg-[#24B86C]' : 'bg-white border border-[#B9D9CE] group-hover:border-[#24B86C]'}`}>
                                {activeSubcategories.includes(sub) && <div className="w-2 h-2 bg-white rounded-[2px]" />}
                              </div>
                              <input type="checkbox" className="hidden" checked={activeSubcategories.includes(sub)} onChange={() => toggleArray(activeSubcategories, sub, setActiveSubcategories)} />
                              <span className={`text-[15px] transition-colors ${activeSubcategories.includes(sub) ? 'text-[#0D1A12] font-bold' : 'text-[#4B5563] group-hover:text-[#0D1A12] font-medium'}`}>{sub}</span>
                            </label>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  {/* Properties */}
                  <div className="bg-[#DDF0E9] p-7 rounded-[1.5rem]">
                    <h3 className="font-bold text-[#0D1A12] text-xl mb-5">Properties</h3>
                    <div className="space-y-4">
                      {['Rigged', 'Animated', 'Game-Ready', '3D Printable'].map((prop) => (
                        <label key={prop} className="flex items-center space-x-3.5 cursor-pointer group">
                          <div className={`w-5 h-5 rounded-[6px] flex items-center justify-center transition-all duration-200 ${selectedProperties.includes(prop) ? 'bg-[#24B86C]' : 'bg-white border border-[#B9D9CE] group-hover:border-[#24B86C]'}`}>
                            {selectedProperties.includes(prop) && <div className="w-2 h-2 bg-white rounded-[2px]" />}
                          </div>
                          <input type="checkbox" className="hidden" checked={selectedProperties.includes(prop)} onChange={() => toggleArray(selectedProperties, prop, setSelectedProperties)} />
                          <span className={`text-[15px] transition-colors ${selectedProperties.includes(prop) ? 'text-[#0D1A12] font-bold' : 'text-[#4B5563] group-hover:text-[#0D1A12] font-medium'}`}>{prop}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Product Grid — CSS columns for masonry/natural ratio */}
        <div className="flex-1">
          {filteredProducts.length > 0 ? (
            <motion.div
              className="columns-1 sm:columns-2 lg:columns-2 xl:columns-3 gap-5 space-y-0"
            >
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
                    className="gpu-layer break-inside-avoid mb-5"
                  >
                    <Link href={`/products/${product.slug || product.id}`} className="block h-full outline-none">
                      <div className="group bg-white rounded-3xl overflow-hidden border border-[#E2EDE8] shadow-sm hover:shadow-[0_20px_40px_rgba(36,184,108,0.08)] hover:-translate-y-1 transition-all duration-400 h-full flex flex-col">
                        
                        {/* Image — natural aspect ratio, no cropping */}
                        <div className="relative w-full bg-[#F3F6F5] overflow-hidden shrink-0 rounded-t-3xl">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={product.image || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800'} 
                            alt={product.name}
                            loading="lazy"
                            className="w-full h-auto block group-hover:scale-105 transition-transform duration-700 ease-[0.16,1,0.3,1] gpu-layer"
                          />
                          {/* Gradient overlay on hover */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-t-3xl" />

                          {/* Badge */}
                          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-lg border border-white/30 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
                            <span className={`w-1.5 h-1.5 rounded-full shadow-sm ${
                              (product.plan_tier || 'Free') === 'Free' ? 'bg-[#24B86C]' :
                              (product.plan_tier || 'Free') === 'Pro' ? 'bg-[#9333EA]' :
                              'bg-[#F59E0B]'
                            }`} />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white drop-shadow-md">
                              {product.plan_tier === 'Pro' ? 'Plus + Pro' : (product.plan_tier || 'Free')}
                            </span>
                          </div>

                          {/* Hover action icons */}
                          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                            <button className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-lg border border-white/30 flex items-center justify-center shadow-lg hover:bg-white/40 hover:scale-110 transition-all text-white">
                              <Heart className="w-3.5 h-3.5 text-white drop-shadow-md" />
                            </button>
                            {(product.plan_tier || 'Free') === 'Free' ? (
                              <button className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-lg border border-white/30 flex items-center justify-center shadow-lg hover:bg-white/40 hover:scale-110 transition-all text-white">
                                <Download className="w-3.5 h-3.5 text-white drop-shadow-md" />
                              </button>
                            ) : (
                              <button className="w-8 h-8 rounded-full bg-[#24B86C]/80 backdrop-blur-lg border border-[#24B86C]/50 flex items-center justify-center shadow-lg hover:bg-[#24B86C] hover:scale-110 transition-all text-white">
                                <ShoppingCart className="w-3.5 h-3.5 text-white drop-shadow-md" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Card Footer — name + plan/price */}
                        <div className="px-4 py-3">
                          <h3 className="text-sm font-bold text-[#111111] leading-tight line-clamp-2 mb-2">{product.name}</h3>
                          <div className="flex items-center justify-between gap-2">
                            {product.plan_tier === 'Paid' ? (
                              <>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-black uppercase tracking-wide">
                                  ★ Paid
                                </span>
                                <span className="text-base font-black text-[#111111]">
                                  {product.price || 'Contact'}
                                </span>
                              </>
                            ) : (
                              <>
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wide border ${
                                  product.plan_tier === 'Pro'
                                    ? 'bg-purple-50 border-purple-200 text-purple-700'
                                    : product.plan_tier === 'Plus'
                                    ? 'bg-green-50 border-green-200 text-green-700'
                                    : 'bg-zinc-50 border-zinc-200 text-zinc-600'
                                }`}>
                                  {product.plan_tier === 'Pro' ? 'Plus + Pro' : (product.plan_tier || 'Free')}
                                </span>
                                <span className="text-[11px] font-medium text-zinc-400">Free download</span>
                              </>
                            )}
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
                onClick={() => { setSearchQuery(''); setActiveCategories([]); setActiveSubcategories([]); }}
                className="bg-[#0D1A12] hover:bg-[#24B86C] text-white rounded-xl h-12 px-8 font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                Clear all filters
              </Button>
            </motion.div>
          )}
          
          {filteredProducts.length > 0 && (
            <div className="mt-20 flex flex-col items-center gap-3">
              <button className="group relative inline-flex items-center gap-3 px-14 py-4 rounded-full text-[15px] font-black text-white overflow-hidden shadow-[0_8px_32px_rgba(36,184,108,0.35)] hover:shadow-[0_12px_40px_rgba(36,184,108,0.5)] transition-all duration-300 hover:-translate-y-0.5">
                {/* Gradient background */}
                <span className="absolute inset-0 bg-gradient-to-r from-[#0D1A12] via-[#24B86C] to-[#11998E] transition-all duration-500 group-hover:from-[#24B86C] group-hover:via-[#11998E] group-hover:to-[#0D1A12]" />
                {/* Shine effect */}
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <span className="relative flex items-center gap-2">
                  <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Load More Assets
                </span>
              </button>
              <p className="text-xs text-zinc-400 font-medium">Showing {filteredProducts.length} assets</p>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAF9] flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#24B86C] border-t-transparent rounded-full animate-spin" /></div>}>
      <ProductsContent />
    </Suspense>
  );
}
