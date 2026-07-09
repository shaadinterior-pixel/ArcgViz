"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Download, Heart, Play, ShoppingCart, PackageSearch } from 'lucide-react';
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
          const categoryProducts = allProducts
            .filter(p => p.status !== 'Draft' && p.category?.toLowerCase() === matched.title.toLowerCase())
            .sort((a, b) => {
              const da = a.created_at ? new Date(a.created_at).getTime() : 0;
              const db2 = b.created_at ? new Date(b.created_at).getTime() : 0;
              return db2 - da;
            });
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
      <div className="min-h-screen bg-[#F3F6F5] pt-32 pb-20 flex items-center justify-center">
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

  // Generate generic "What we do" features based on the category title if none exist
  const features = [
    `Comprehensive ${category.title} strategy and planning`,
    'High-quality, production-ready deliverables',
    'Custom tailored solutions for your brand',
    'Expert consultation and ongoing support',
    'Fast turnaround times with premium quality'
  ];

  return (
    <div className="min-h-screen bg-[#F3F6F5] pt-24 pb-32">
      <div className="container max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/services" className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-[#24B86C] transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Services
        </Link>
      </div>

      {/* ── HERO SECTION ── */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto mb-20">
        <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-[#E2EDE8] flex flex-col lg:flex-row">
          {/* Text Content */}
          <div className="w-full lg:w-1/2 p-10 lg:p-16 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#24B86C]/10 border border-[#24B86C]/20 mb-6 w-max">
              <span className="w-2 h-2 rounded-full bg-[#24B86C]" />
              <span className="text-[#24B86C] font-bold text-xs tracking-widest uppercase">Service Details</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#111111] tracking-tighter mb-6 leading-tight">
              {category.title}
            </h1>
            
            <p className="text-lg text-zinc-600 leading-relaxed mb-10">
              {category.description || 'Elevate your projects with our premium services tailored to your specific needs. From initial concept to final delivery, our expert team ensures top-tier quality every step of the way.'}
            </p>

            <Link href={`/contact?service=${encodeURIComponent(category.title)}`}>
              <Button className="h-14 px-10 rounded-full bg-gradient-to-r from-[#0D1A12] via-[#24B86C] to-[#11998E] hover:from-[#24B86C] hover:to-[#0D1A12] text-white font-bold text-[15px] shadow-[0_8px_32px_rgba(36,184,108,0.35)] transition-all">
                Hire Our Team
              </Button>
            </Link>
          </div>

          {/* Hero Image */}
          <div className="w-full lg:w-1/2 relative min-h-[400px] lg:min-h-full">
            <Image 
              src={heroCard.image || 'https://images.unsplash.com/photo-1618220179428-22790b46a0eb?auto=format&fit=crop&q=80&w=1200'} 
              alt={category.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* ── WHAT WE DO ── */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center bg-white rounded-[2rem] p-10 lg:p-16 border border-[#E2EDE8] shadow-sm">
          <div>
            <h2 className="text-3xl lg:text-4xl font-black text-[#111111] mb-6">What we do inside this service</h2>
            <p className="text-zinc-600 leading-relaxed mb-8 text-lg">
              When you hire us for {category.title}, you get a complete end-to-end solution. We handle everything from the groundwork to the final polished deliverables, ensuring your vision is realized perfectly.
            </p>
            <ul className="space-y-4">
              {features.map((feature, i) => (
                <motion.li 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-[#24B86C]/10 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-[#24B86C]" />
                  </div>
                  <span className="text-[#111111] font-bold text-lg">{feature}</span>
                </motion.li>
              ))}
            </ul>
          </div>
          <div className="bg-[#F3F6F5] rounded-3xl p-8 flex items-center justify-center min-h-[300px]">
             {/* Decorative Element representing workflow */}
             <div className="relative w-full max-w-sm aspect-square bg-white rounded-full shadow-[0_20px_60px_rgba(36,184,108,0.1)] flex items-center justify-center">
                <div className="absolute inset-4 border-2 border-dashed border-[#E2EDE8] rounded-full animate-[spin_60s_linear_infinite]" />
                <div className="absolute inset-12 border-2 border-dashed border-[#24B86C]/30 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
                <div className="w-24 h-24 bg-gradient-to-br from-[#24B86C] to-[#11998E] rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-black text-2xl">DW</span>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* ── PRODUCTS IN THIS CATEGORY (MASONRY GRID) ── */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-black text-[#111111]">Products we provide in this service</h2>
          <Link href={`/products?category=${encodeURIComponent(category.title)}`}>
            <Button variant="outline" className="hidden md:flex rounded-full border-[#E2EDE8] font-bold">
              View All Products
            </Button>
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5 space-y-0">
            <AnimatePresence mode="popLayout">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.04 }}
                  className="break-inside-avoid mb-5 transform-gpu"
                >
                  <Link href={`/products/${product.slug || product.id}`} className="block h-full outline-none">
                    <div className="group bg-white rounded-3xl overflow-hidden border border-[#E2EDE8] shadow-sm hover:shadow-[0_20px_40px_rgba(36,184,108,0.08)] hover:-translate-y-1 transition-all duration-400 flex flex-col">
                      
                      {/* Image — natural aspect ratio */}
                      <div className="relative w-full bg-[#F3F6F5] overflow-hidden shrink-0 rounded-t-3xl">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={product.image || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800'} 
                          alt={product.name}
                          loading="lazy"
                          className="w-full h-auto block group-hover:scale-105 transition-transform duration-700 ease-[0.16,1,0.3,1]"
                        />
                        
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
                          {(String(product.category || '').toLowerCase().includes('motion') || String(product.category || '').toLowerCase().includes('animation')) && (
                            <button className="w-8 h-8 rounded-full bg-[#9333EA]/80 backdrop-blur-lg border border-[#9333EA]/50 flex items-center justify-center shadow-lg hover:bg-[#9333EA] hover:scale-110 transition-all text-white">
                              <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5 drop-shadow-md" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Card Footer */}
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
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-[#E2EDE8] py-20 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-[#F3F6F5] rounded-full flex items-center justify-center mb-4">
              <PackageSearch className="w-8 h-8 text-zinc-400" />
            </div>
            <h3 className="text-xl font-bold text-[#111111] mb-2">No products found</h3>
            <p className="text-zinc-500">We are currently updating our catalog for {category.title}.</p>
          </div>
        )}
      </section>
    </div>
  );
}
