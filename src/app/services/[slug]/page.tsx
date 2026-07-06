"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Layers, CheckCircle2, PackageSearch } from 'lucide-react';
import { fetchCategories, fetchProducts, type Category, type Product } from '@/lib/store';
import { Button } from '@/components/ui/Button';

export default function ServiceDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [allCategories, allProducts] = await Promise.all([
          fetchCategories(),
          fetchProducts()
        ]);
        
        // Find matching category by id or title slugified
        const matched = allCategories.find(c => 
          c.id === slug || 
          c.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug
        );
        
        if (matched) {
          setCategory(matched);
          const categoryProducts = allProducts.filter(p => p.category?.toLowerCase() === matched.title.toLowerCase());
          setProducts(categoryProducts);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFCFB] pt-32 pb-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#24B86C]"></div>
      </div>
    );
  }

  if (!category) {
    return notFound();
  }

  const heroCard = (category.cards && category.cards.length > 0) 
    ? category.cards[0] 
    : { image: 'https://images.unsplash.com/photo-1618220179428-22790b46a0eb?auto=format&fit=crop&q=80&w=1200' };

  return (
    <div className="min-h-screen bg-[#FAFCFB] pt-24 pb-32">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/services" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-[#24B86C] transition-colors mb-10 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to all services
        </Link>
      </div>

      {/* ── HERO ── */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center"
        >
          <div className="w-full lg:w-1/2 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#E2EDE8] shadow-sm mb-4">
              <span className="w-2 h-2 rounded-full bg-[#24B86C] animate-pulse" />
              <span className="text-zinc-600 font-bold text-xs tracking-widest uppercase">Service Overview</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-black text-[#111111] tracking-tighter">
              {category.title}
            </h1>
            
            <p className="text-lg text-zinc-500 leading-relaxed max-w-xl">
              {category.description || 'Explore our exclusive range of creative assets and services tailored to elevate your projects.'}
            </p>

            <div className="pt-4 flex gap-4">
              <Link href={`/contact?service=${encodeURIComponent(category.title)}`}>
                <Button className="h-14 px-8 rounded-full bg-[#24B86C] hover:bg-[#1fa35f] text-white font-bold text-[15px] shadow-[0_8px_20px_rgba(36,184,108,0.25)] transition-all">
                  Start a Project
                </Button>
              </Link>
            </div>
          </div>

          <div className="w-full lg:w-1/2 relative aspect-[4/3] rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.06)] group">
            <Image 
              src={heroCard.image || 'https://images.unsplash.com/photo-1618220179428-22790b46a0eb?auto=format&fit=crop&q=80&w=1200'} 
              alt={category.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
        </motion.div>
      </section>

      {/* ── SHOWCASE CARDS ── */}
      {category.cards && category.cards.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-32">
          <div className="mb-10 flex items-center justify-between">
            <h2 className="text-3xl font-black text-[#111111] tracking-tight">Showcase</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {category.cards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group relative aspect-[4/5] rounded-2xl overflow-hidden shadow-sm"
              >
                {card.image ? (
                  <Image src={card.image} alt={card.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full bg-zinc-100 flex items-center justify-center">
                    <Layers className="w-8 h-8 text-zinc-300" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-0 left-0 w-full p-6">
                  <h3 className="text-white font-bold text-lg mb-1">{card.name}</h3>
                  <p className="text-white/70 text-sm">{card.count}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ── RELATED PRODUCTS ── */}
      {products.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-20 bg-white rounded-3xl p-8 shadow-sm border border-[#E2EDE8]">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-[#111111] flex items-center gap-2">
              <PackageSearch className="w-6 h-6 text-[#24B86C]" />
              Marketplace Products
            </h2>
            <Link href={`/products?category=${encodeURIComponent(category.title)}`} className="text-[#24B86C] font-bold text-sm hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 4).map((product, i) => (
              <Link href={`/products/${product.id}`} key={product.id} className="group">
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-zinc-100 mb-3 border border-[#E2EDE8]">
                  <Image 
                    src={product.image || product.thumbnail_url || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=600'} 
                    alt={product.name} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-md border border-white/50 shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      (product.plan_tier || 'Free') === 'Free' ? 'bg-[#24B86C]' :
                      (product.plan_tier || 'Free') === 'Plus' ? 'bg-[#9333EA]' :
                      'bg-[#F59E0B]'
                    }`} />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-800">
                      {product.plan_tier || 'Free'}
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-[#111111] text-sm group-hover:text-[#24B86C] transition-colors line-clamp-1">{product.name}</h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs font-medium text-zinc-500">{product.author}</span>
                    <span className="text-xs font-black text-[#111111]">{product.price}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
