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
import { fetchProducts, onStoreUpdate, type Product } from '@/lib/store';

const CATEGORIES = ['All', '3D Models', 'PBR Materials', 'Interior Scenes', 'Furniture', 'Lighting'];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
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
    <div className="container mx-auto px-4 py-12 min-h-screen">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6 border-b border-border/50 pb-8">
        <div className="w-full md:w-auto flex-1">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">All Products</h1>
          <p className="text-foreground/60 max-w-2xl mb-6">Browse our entire collection of high-quality 3D models, textures, and scenes.</p>
          
          <div className="relative max-w-xl w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40 w-5 h-5" />
            <Input 
              type="text" 
              placeholder="Search assets, categories, or authors..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 bg-secondary/50 border-border focus:bg-background transition-colors text-base rounded-2xl w-full"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-3 w-full md:w-auto mt-4 md:mt-0">
          <Button 
            variant="outline" 
            className="md:hidden w-full h-14 rounded-2xl"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <div className="hidden md:flex relative">
            <select className="appearance-none bg-secondary/50 border border-border rounded-2xl px-5 py-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-56 cursor-pointer font-medium hover:bg-secondary transition-colors">
              <option>Latest Arrivals</option>
              <option>Most Popular</option>
              <option>Best Selling</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Sidebar */}
        <aside className={`${isFilterOpen ? 'block' : 'hidden'} lg:block w-full lg:w-64 space-y-8 flex-shrink-0`}>
          <div className="bg-secondary/20 p-6 rounded-2xl border border-border/50">
            <h3 className="font-semibold mb-4 pb-3 border-b border-border/50 text-lg">Categories</h3>
            <div className="space-y-3">
              {CATEGORIES.map((cat) => (
                <label key={cat} className="flex items-center space-x-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${activeCategory === cat ? 'bg-primary' : 'bg-transparent border border-border group-hover:border-primary/50'}`}>
                    {activeCategory === cat && <div className="w-2 h-2 bg-background rounded-sm" />}
                  </div>
                  <input 
                    type="radio" 
                    name="category"
                    className="hidden" 
                    checked={activeCategory === cat}
                    onChange={() => setActiveCategory(cat)}
                  />
                  <span className={`text-sm transition-colors ${activeCategory === cat ? 'text-foreground font-medium' : 'text-foreground/70 group-hover:text-foreground'}`}>
                    {cat}
                  </span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="bg-secondary/20 p-6 rounded-2xl border border-border/50">
            <h3 className="font-semibold mb-4 pb-3 border-b border-border/50 text-lg">Properties</h3>
            <div className="space-y-3">
              {['Rigged', 'Animated', 'Game-Ready', '3D Printable'].map((prop) => (
                <label key={prop} className="flex items-center space-x-3 cursor-pointer group">
                  <input type="checkbox" className="form-checkbox h-5 w-5 rounded border-border bg-transparent text-primary focus:ring-primary/50" 
                    checked={selectedProperties.includes(prop)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedProperties([...selectedProperties, prop]);
                      else setSelectedProperties(selectedProperties.filter(p => p !== prop));
                    }}
                  />
                  <span className="text-sm text-foreground/70 group-hover:text-foreground transition-colors">{prop}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {filteredProducts.length > 0 ? (
            <motion.div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.98 }}
                    transition={{ duration: 0.15, delay: Math.min(index * 0.02, 0.15) }}
                    className="gpu-layer"
                  >
                    <Link href={`/products/${product.slug || product.id}`}>
                      <Card className="group overflow-hidden bg-card border-border/50 hover:border-primary/50 hover:shadow-[0_0_30px_rgba(212,175,55,0.1)] transition-all duration-200 rounded-2xl h-full flex flex-col">
                        <div className="relative aspect-[4/3] overflow-hidden bg-secondary/50 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <Image 
                            src={product.image || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800'} 
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-300 ease-out gpu-layer"
                            quality={75}
                          />
                          <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-medium border border-white/10 flex items-center justify-center">
                            {product.category}
                          </div>
                          {product.rating && (
                            <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1.5 rounded-lg flex items-center justify-center text-xs font-bold border border-white/10">
                              <Star className="w-3.5 h-3.5 text-primary mr-1 fill-primary" />
                              {product.rating}
                            </div>
                          )}
                        </div>
                        <CardContent className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="text-[11px] font-bold text-muted-foreground mb-2 tracking-[0.15em] uppercase">{product.author || 'ArchViz Studio'}</div>
                            <h3 className="font-bold text-lg leading-snug mb-4 line-clamp-2 group-hover:text-primary transition-colors">{product.name}</h3>
                          </div>
                          
                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/40">
                            <span className="text-xl font-black">{product.price}</span>
                            <Button variant="ghost" size="sm" className="h-9 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all flex items-center gap-1.5 px-4">
                              <Download className="w-3.5 h-3.5" />
                              <span className="font-bold text-xs leading-none mt-px">Buy Now</span>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="flex flex-col items-center justify-center h-64 text-center border border-dashed border-border/50 rounded-3xl bg-secondary/10"
            >
              <div className="bg-secondary/50 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-foreground/40" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
              <p className="text-foreground/50 max-w-sm">Try adjusting your search or filters to find what you&apos;re looking for.</p>
              <Button 
                variant="ghost" 
                onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
                className="mt-4 text-primary"
              >
                Clear all filters
              </Button>
            </motion.div>
          )}
          
          {filteredProducts.length > 0 && (
            <div className="mt-16 flex justify-center">
              <Button variant="outline" size="lg" className="px-10 h-14 rounded-full text-base font-medium hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
                Load More Assets
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
