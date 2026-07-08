"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import {
  Star, Check, Box, FileText, Download, ShieldCheck,
  Heart, Share2, Image as ImageIcon, X, ChevronLeft,
  ChevronRight, ZoomIn, LogIn, Loader2, Monitor, MessageCircle, ArrowRight,
  ChevronDown, Bookmark, Info
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { type Product } from '@/lib/store';
import { getCurrentUser, hasPurchased } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

type Props = { 
  product: Product;
  similarProducts?: Product[];
};

export default function ProductClient({ product, similarProducts = [] }: Props) {
  // ── All product images (thumbnail + gallery deduped) ─────────────────────
  const allImages = React.useMemo(() => {
    const thumb = product.thumbnail_url || product.image;
    const gallery = product.gallery_images ?? [];
    const merged = thumb ? [thumb, ...gallery.filter(u => u !== thumb)] : gallery;
    return merged.length > 0 ? merged : [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&h=800&fit=crop',
    ];
  }, [product]);

  const [activeIdx, setActiveIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>(product.model_url ? '3d' : '2d');

  // ── Auth & purchase state ─────────────────────────────────────────────────
  const [user, setUser] = useState<{ id: string, plan?: string } | null>(null);
  const [purchased, setPurchased] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    (async () => {
      const u = await getCurrentUser();
      if (u) {
        const { data: customer } = await supabase.from('customers').select('plan').eq('id', u.id).single();
        setUser({ id: u.id, plan: customer?.plan || 'Free' });
        const has = await hasPurchased(product.id);
        setPurchased(has);
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    })();
  }, [product.id]);

  const productPlan = product.plan_tier || 'Free';
  const userPlan = user?.plan || 'Free';
  
  const canDownload = !!user && (
    purchased || 
    (productPlan !== 'Paid' && (
      productPlan === 'Free' || 
      userPlan === 'Pro' || 
      (userPlan === 'Plus' && productPlan === 'Plus')
    ))
  );

  // ── Keyboard navigation for lightbox ─────────────────────────────────────
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (!lightbox) return;
    if (e.key === 'ArrowRight') setLightboxIdx(i => (i + 1) % allImages.length);
    if (e.key === 'ArrowLeft')  setLightboxIdx(i => (i - 1 + allImages.length) % allImages.length);
    if (e.key === 'Escape')     setLightbox(false);
  }, [lightbox, allImages.length]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  // ── Touch swipe for mobile ────────────────────────────────────────────────
  const touchStart = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => { touchStart.current = e.touches[0].clientX; };
  const onTouchEnd   = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(dx) > 50) {
      if (dx < 0) setActiveIdx(i => (i + 1) % allImages.length);
      else        setActiveIdx(i => (i - 1 + allImages.length) % allImages.length);
    }
    touchStart.current = null;
  };

  const openLightbox = (idx: number) => { setLightboxIdx(idx); setLightbox(true); };

  // ── Download handler ──────────────────────────────────────────────────────
  const handleDownload = async () => {
    setDownloading(true);
    try {
      const { data } = await import('@/lib/supabase').then(m => m.supabase.auth.getSession());
      const token = data.session?.access_token;
      const res = await fetch(`/api/download/${product.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        redirect: 'follow',
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert(j.error ?? 'Download failed. Please try again.');
        return;
      }
      // If redirect followed to Drive URL, open it
      window.open(res.url, '_blank');
    } catch {
      alert('Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const specs = [
    { icon: FileText, label: 'Formats',    value: (product.file_formats ?? []).join(', ') || '—' },
    { icon: Box,      label: 'Polygons',   value: product.poly_count || '—' },
    { icon: ImageIcon,label: 'Textures',   value: product.texture_resolution || '—' },
    { icon: Download, label: 'File Size',  value: product.file_size || '—' },
    { icon: Monitor,  label: 'Software',   value: (product.software_support ?? []).join(', ') || '—' },
  ].filter(s => s.value !== '—');

  return (
    <div className="bg-[#F8FAF9] min-h-screen pt-8 pb-24">
      <div className="container mx-auto px-4 max-w-[1400px]">
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Left Column (Content) ── */}
          <div className="w-full lg:flex-1 min-w-0 flex flex-col">
            
            {/* Main Image Gallery / 3D Viewer */}
            <div
              className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-[#E2EDE8] border border-[#E2EDE8] shadow-sm group"
            >
              {viewMode === '3d' && product.model_url ? (
                <>
                  <Script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js" />
                  {/* @ts-ignore */}
                  <model-viewer
                    src={product.model_url}
                    auto-rotate
                    camera-controls
                    shadow-intensity="1"
                    environment-image="neutral"
                    style={{ width: '100%', height: '100%', backgroundColor: '#111' }}
                  />
                  <div className="absolute top-4 left-4 z-10 flex gap-2">
                    <button onClick={() => setViewMode('2d')} className="px-4 py-2 bg-black/60 backdrop-blur-md text-white text-xs font-bold rounded-lg border border-white/20 hover:bg-black/80 transition-colors">
                      View 2D Gallery
                    </button>
                    <button className="px-4 py-2 bg-[#24B86C]/20 text-[#24B86C] text-xs font-bold rounded-lg border border-[#24B86C]/50 backdrop-blur-md cursor-help" title="Wireframe mode coming soon">
                      Wireframe
                    </button>
                  </div>
                </>
              ) : (
                <div
                  className={`w-full h-full relative overflow-hidden ${product.features?.includes('Disable Hover Zoom') ? 'cursor-pointer' : 'cursor-zoom-in'}`}
                  onTouchStart={onTouchStart}
                  onTouchEnd={onTouchEnd}
                  onClick={() => openLightbox(activeIdx)}
                  onMouseEnter={() => {
                    if (product.features?.includes('Disable Hover Zoom')) return;
                    const el = document.getElementById('zoom-layer');
                    if(el) el.style.opacity = '1';
                  }}
                  onMouseLeave={() => {
                    if (product.features?.includes('Disable Hover Zoom')) return;
                    const el = document.getElementById('zoom-layer');
                    if(el) el.style.opacity = '0';
                  }}
                  onMouseMove={(e) => {
                    if (product.features?.includes('Disable Hover Zoom')) return;
                    const el = document.getElementById('zoom-layer');
                    if(!el) return;
                    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
                    const x = ((e.clientX - left) / width) * 100;
                    const y = ((e.clientY - top) / height) * 100;
                    el.style.backgroundPosition = `${x}% ${y}%`;
                  }}
                >
                  {/* Base Image */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={allImages[activeIdx]}
                    alt={product.name}
                    className="w-full h-full object-cover bg-zinc-100 transition-opacity duration-300"
                  />
                  
                  {/* Zoom Hover Layer */}
                  {!product.features?.includes('Disable Hover Zoom') && (
                    <>
                      <div 
                        id="zoom-layer"
                        className="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-200"
                        style={{
                          backgroundImage: `url(${allImages[activeIdx]})`,
                          backgroundSize: '250%',
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: '50% 50%',
                          backgroundColor: '#f4f4f5'
                        }}
                      />
                      
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        <ZoomIn className="w-12 h-12 text-white/30 drop-shadow-lg" />
                      </div>
                      
                      <button className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 backdrop-blur-md rounded-full p-2.5 text-white z-20 transition-colors shadow-lg">
                        <ZoomIn className="w-5 h-5" />
                      </button>
                    </>
                  )}
                  
                  {product.model_url && (
                    <div className="absolute top-4 left-4 z-20">
                      <button onClick={(e) => { e.stopPropagation(); setViewMode('3d'); }} className="px-4 py-2 bg-[#11998E]/80 hover:bg-[#11998E] text-white text-xs font-bold rounded-lg backdrop-blur-md transition-colors shadow-lg">
                        Interactive 3D View
                      </button>
                    </div>
                  )}

                  {/* Nav arrows */}
                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={e => { e.stopPropagation(); setActiveIdx(i => (i - 1 + allImages.length) % allImages.length); }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors border border-white/10 z-20"
                      >
                        <ChevronLeft className="w-6 h-6"/>
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); setActiveIdx(i => (i + 1) % allImages.length); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors border border-white/10 z-20"
                      >
                        <ChevronRight className="w-6 h-6"/>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {allImages.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto hide-scrollbar pb-2">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIdx(i)}
                    className={`relative w-28 h-20 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                      activeIdx === i ? 'border-[#24B86C]' : 'border-transparent hover:border-[#E2EDE8] opacity-70 hover:opacity-100'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`Preview ${i + 1}`} loading="lazy" className="w-full h-full object-cover bg-zinc-100"/>
                  </button>
                ))}
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-4 mt-8 pb-4 border-b border-[#E2EDE8]">
              <button className="px-6 py-2 rounded-full bg-white border border-[#E2EDE8] shadow-[0_2px_10px_rgba(0,0,0,0.02)] font-bold text-sm text-[#111111]">Overview</button>
            </div>

            {/* Description */}
            <div className="mt-8">
              <h2 className="text-xl font-black mb-4 text-[#111111]">Description</h2>
              {product.description ? (
                <p className="text-zinc-700 leading-relaxed whitespace-pre-line text-[15px]">{product.description}</p>
              ) : (
                <p className="text-zinc-500 italic text-sm">No description provided for this product.</p>
              )}
            </div>

            {/* Technical Details Box (Included formats) */}
            <div className="mt-12 bg-white rounded-[24px] p-8 md:p-10 border border-[#E2EDE8] shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-2 mb-8 pb-6 border-b border-[#E2EDE8]">
                <div className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center text-white font-bold text-[10px]">U</div>
                <span className="bg-zinc-100 text-zinc-800 rounded-full px-4 py-1 text-xs font-bold border border-zinc-200">Unreal Engine</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <h3 className="font-bold text-lg mb-6 text-[#111111]">Technical details</h3>
                  <ul className="text-[13px] text-zinc-600 space-y-2.5">
                    <li><strong className="text-zinc-800 font-semibold">Rigged:</strong> {product.features?.includes('Rigged') ? 'Yes' : 'No'}</li>
                    <li><strong className="text-zinc-800 font-semibold">Animated:</strong> {product.features?.includes('Animated') ? 'Yes' : 'No'}</li>
                    <li><strong className="text-zinc-800 font-semibold">Game-Ready:</strong> {product.features?.includes('Game-Ready') ? 'Yes' : 'No'}</li>
                    <li><strong className="text-zinc-800 font-semibold">3D Printable:</strong> {product.features?.includes('3D Printable') ? 'Yes' : 'No'}</li>
                    <li><strong className="text-zinc-800 font-semibold">Vertex / Poly count:</strong> {product.poly_count || '14,434'}</li>
                    <li><strong className="text-zinc-800 font-semibold">Texture Resolutions:</strong> {product.texture_resolution || '(512x512, 1024x1024, 2048x2048)'}</li>
                    <li><strong className="text-zinc-800 font-semibold">Supported Platforms:</strong> Windows, Mac</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-6 text-[#111111]">Compatibility</h3>
                  <div className="text-[13px] text-zinc-600 mb-8">
                    <p className="mb-1"><strong className="text-zinc-800 font-semibold">Supported Unreal Engine Versions</strong></p>
                    <p>4.19 - 4.27 and 5.0 - 5.7</p>
                  </div>
                  <div className="text-[13px] text-zinc-600 mb-8">
                    <p className="mb-2"><strong className="text-zinc-800 font-semibold">Supported Target Platforms</strong></p>
                    <div className="flex gap-2">
                       <span className="px-3 py-1 bg-zinc-100 border border-zinc-200 rounded text-xs font-bold text-zinc-700">Windows</span>
                       <span className="px-3 py-1 bg-zinc-100 border border-zinc-200 rounded text-xs font-bold text-zinc-700">Mac</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-4 text-[#111111]">Other information</h3>
                  <div className="text-[13px] text-zinc-600">
                    <p className="mb-1"><strong className="text-zinc-800 font-semibold">Distribution Method</strong></p>
                    <p>Asset Package</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="mt-12">
              <h3 className="font-bold mb-4 text-[#111111] text-lg">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {['Modular', 'Lowpoly', 'Fantasy', 'Medieval', 'Character', '3D Model', 'Rigged', 'Human'].map(tag => (
                  <span key={tag} className="bg-white border border-[#E2EDE8] text-zinc-600 px-4 py-1.5 rounded-full text-[13px] font-bold shadow-sm cursor-pointer hover:border-[#24B86C] hover:text-[#24B86C] transition-colors">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Recommendations ("More from") */}
            {similarProducts.length > 0 && (
              <div className="mt-16 pt-10 border-t border-[#E2EDE8]">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-bold text-xl text-[#111111]">More from {product.author} <ChevronRight className="inline w-5 h-5 -mt-0.5" /></h2>
                  <div className="flex gap-2">
                    <button className="w-8 h-8 rounded-full bg-white border border-[#E2EDE8] flex items-center justify-center text-zinc-400 hover:text-zinc-800 shadow-sm"><ChevronLeft className="w-4 h-4"/></button>
                    <button className="w-8 h-8 rounded-full bg-white border border-[#E2EDE8] flex items-center justify-center text-zinc-400 hover:text-zinc-800 shadow-sm"><ChevronRight className="w-4 h-4"/></button>
                  </div>
                </div>
                
                <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-6">
                  {similarProducts.map((p) => (
                    <Link href={`/products/${p.slug || p.id}`} key={p.id} className="block group shrink-0 w-[280px]">
                      <div className="flex flex-col rounded-2xl overflow-hidden bg-white border border-[#E2EDE8] hover:border-[#24B86C] hover:shadow-[0_8px_30px_rgba(36,184,108,0.12)] transition-all duration-300">
                        <div className="relative w-full aspect-video overflow-hidden bg-zinc-900">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={p.thumbnail_url || p.image}
                            alt={p.name}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <div className="p-4 flex flex-col gap-1">
                          <h3 className="text-[13px] font-bold text-[#111111] line-clamp-1 group-hover:text-[#24B86C] transition-colors">{p.name}</h3>
                          <div className="h-px bg-[#E2EDE8] my-1" />
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-[10px] text-zinc-500">From</span>
                            <span className="text-[13px] font-black text-[#111111]">{p.price}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* ── Right Column (Sidebar) ── */}
          <div className="w-full lg:w-[360px] shrink-0">
            <div className="sticky top-24 bg-white border border-[#E2EDE8] rounded-[24px] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.04)] flex flex-col gap-6">
              
              {/* Author badge removed */}
              {/* Title & Breadcrumbs */}
              <div>
                <h1 className="text-3xl font-black leading-tight text-[#111111]">{product.name}</h1>
                <div className="text-[11px] font-bold text-[#11998E] mt-3 flex items-center gap-1.5">
                  <Link href="/products" className="hover:underline">3D</Link> 
                  <ChevronRight className="w-3 h-3 text-zinc-400" /> 
                  <Link href="/products" className="hover:underline">Characters & Creatures</Link>
                </div>
              </div>
              
              {/* Rating removed */}
              
              <div className="h-px bg-[#E2EDE8] w-full" />
              
              {/* License Box */}
              <div>
                <span className="text-xs font-bold text-[#111111] block mb-2">Access Level</span>
                <div className="border border-zinc-300 rounded-xl p-3 flex justify-between items-center bg-white cursor-pointer hover:border-[#24B86C] transition-colors group">
                  <div>
                    <div className="text-sm font-bold text-[#111111] mb-0.5">{productPlan} Tier Product</div>
                    {user && (
                      <div className="text-xs text-zinc-500 flex items-center gap-1.5 mt-0.5">
                        <span>Your Plan: <span className="font-bold text-[#111111]">{userPlan}</span></span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Purchase/Download Buttons */}
              <div className="flex flex-col gap-2 mt-2">
                {authLoading ? (
                  <Button disabled className="w-full h-12 bg-zinc-100 rounded-xl">
                    <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
                  </Button>
                ) : !user ? (
                  <Link href="/auth">
                    <Button className="w-full h-12 bg-[#0D1A12] hover:bg-[#24B86C] text-white font-bold rounded-xl text-sm transition-all">
                      Log in to Download
                    </Button>
                  </Link>
                ) : canDownload ? (
                  <Button onClick={handleDownload} disabled={downloading} className="w-full h-12 bg-[#24B86C] hover:bg-[#1E995A] text-white font-bold rounded-xl text-sm shadow-[0_4px_14px_rgba(36,184,108,0.3)] transition-all">
                    {downloading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Downloading...</> : <><Download className="w-4 h-4 mr-2"/> Download Now</>}
                  </Button>
                ) : (
                  <Button disabled className="w-full h-12 bg-zinc-200 text-zinc-500 font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2">
                    Locked (Requires {productPlan} Plan)
                  </Button>
                )}
                
                <div className="flex gap-2">
                  <Button variant="outline" className="w-full h-12 border-2 border-zinc-200 font-bold bg-white hover:bg-zinc-50 rounded-xl text-sm text-[#111111]">
                    <Bookmark className="w-4 h-4 mr-2"/> Save for later
                  </Button>
                </div>
              </div>
              

              {/* Footer Actions */}
              <div className="flex gap-2 mt-2">
                <Button variant="outline" className="w-full h-10 border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-bold text-zinc-600 rounded-lg">
                  <Share2 className="w-3.5 h-3.5 mr-2"/> Share
                </Button>
              </div>

            </div>
          </div>
        </div>
        
      </div>

      {/* ── Lightbox ── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={() => setLightbox(false)}
        >
          <button onClick={() => setLightbox(false)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10">
            <X className="w-5 h-5"/>
          </button>
          <button
            onClick={e => { e.stopPropagation(); setLightboxIdx(i => (i - 1 + allImages.length) % allImages.length); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
          >
            <ChevronLeft className="w-6 h-6"/>
          </button>
          <button
            onClick={e => { e.stopPropagation(); setLightboxIdx(i => (i + 1) % allImages.length); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
          >
            <ChevronRight className="w-6 h-6"/>
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={allImages[lightboxIdx]}
            alt={product.name}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
            onClick={e => e.stopPropagation()}
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            {lightboxIdx + 1} / {allImages.length}
          </div>
        </div>
      )}
    </div>
  );
}
