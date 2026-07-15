"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import {
  Star, Check, Box, FileText, Download, ShieldCheck,
  Heart, Share2, Image as ImageIcon, X, ChevronLeft,
  ChevronRight, ZoomIn, LogIn, Loader2, Monitor, MessageCircle, ArrowRight,
  ChevronDown, Bookmark, Info, Wand2, ShoppingCart, Play, Crown, Briefcase, Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { type Product } from '@/lib/store';
import { getCurrentUser, hasPurchased, getWishlist, toggleWishlist } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

type Props = { 
  product: Product;
  similarProducts?: Product[];
};

export default function ProductClient({ product, similarProducts = [] }: Props) {
  const [visibleSimilar, setVisibleSimilar] = useState(8);

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
  const [isZoomActive, setIsZoomActive] = useState(false);

  // ── Auth & purchase state ─────────────────────────────────────────────────
  const [user, setUser] = useState<{ id: string, plan?: string } | null>(null);
  const [purchased, setPurchased] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const u = await getCurrentUser();
      if (u) {
        // Get plan from Firestore instead of Supabase customers table
        const { getUserPlan } = await import('@/lib/firebase-auth');
        const plan = await getUserPlan(u.uid);
        setUser({ id: u.uid, plan });
        // Check purchase in Firestore for Paid products
        const { hasPurchasedProduct } = await import('@/lib/downloads');
        const has = await hasPurchasedProduct(u.uid, product.id);
        setPurchased(has);
        const wishlist = await getWishlist(u.uid);
        setIsWishlisted(wishlist.includes(product.id));
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    })();
  }, [product.id]);

  const productPlan = product.plan_tier || 'Free';
  const productPlanDisplay = productPlan === 'Pro' ? 'Plus + Pro' : productPlan;
  const userPlan = user?.plan || 'Free';
  
  const canDownload = !!user && (
    purchased || 
    (productPlan !== 'Paid' && (
      productPlan === 'Free' || 
      userPlan === 'Pro'
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
      // Get Firebase ID token for server-side verification
      const { auth } = await import('@/lib/firebase');
      const currentUser = auth.currentUser;
      if (!currentUser) {
        alert('Please sign in to download.');
        return;
      }
      const token = await currentUser.getIdToken();
      const res = await fetch(`/api/download/${product.id}`, {
        headers: { Authorization: `Bearer ${token}` },
        redirect: 'follow',
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert(j.error ?? 'Download failed. Please try again.');
        return;
      }
      window.open(res.url, '_blank');
    } catch {
      alert('Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      alert('Please sign in to save products.');
      return;
    }
    setWishlistLoading(true);
    try {
      await toggleWishlist(user.id, product.id, !isWishlisted);
      setIsWishlisted(!isWishlisted);
    } catch (e) {
      console.error('Error toggling wishlist', e);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = product.name;
    const text = `Check out ${title} on Design Walla!`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (e) {
        console.error('Error sharing:', e);
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
      } catch (e) {
        console.error('Error copying link:', e);
      }
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
            
            {/* Title & Breadcrumbs (Above Image) */}
            <div className="mb-6">
              <h1 className="text-xl font-bold leading-tight text-[#111111]">{product.name}</h1>
              <div className="text-[11px] font-bold text-[#11998E] mt-3 flex items-center gap-1.5 flex-wrap">
                <Link href={`/products?search=${encodeURIComponent(product.category || '')}`} className="hover:underline">{product.category || 'General'}</Link> 
                {product.subcategory && (
                  <>
                    <ChevronRight className="w-3 h-3 text-zinc-400" /> 
                    <Link href={`/products?search=${encodeURIComponent(product.subcategory)}`} className="hover:underline">{product.subcategory}</Link>
                  </>
                )}
              </div>
            </div>

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
                  className={`w-full h-full relative overflow-hidden ${isZoomActive ? 'cursor-zoom-in' : 'cursor-pointer'}`}
                  onTouchStart={onTouchStart}
                  onTouchEnd={onTouchEnd}
                  onClick={() => openLightbox(activeIdx)}
                  onMouseMove={(e) => {
                    if (!isZoomActive || product.features?.includes('Disable Hover Zoom')) return;
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
                    className="w-full h-full object-contain p-4 bg-[#F3F6F5] transition-opacity duration-300"
                  />
                  
                  {/* Zoom Hover Layer */}
                  {!product.features?.includes('Disable Hover Zoom') && (
                    <>
                      {isZoomActive && (
                        <div 
                          id="zoom-layer"
                          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          style={{
                            backgroundImage: `url(${allImages[activeIdx]})`,
                            backgroundSize: '250%',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: '50% 50%',
                            backgroundColor: '#f4f4f5'
                          }}
                        />
                      )}
                      
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setIsZoomActive(prev => !prev);
                        }}
                        className={`absolute top-4 right-4 backdrop-blur-md rounded-full p-2.5 text-white z-20 transition-colors shadow-lg ${isZoomActive ? 'bg-[#24B86C] hover:bg-[#1E995A]' : 'bg-black/50 hover:bg-black/80'}`}
                        title="Toggle Zoom"
                      >
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

            {/* Mobile Buy Box (Below Image) */}
            <div className="block lg:hidden mt-6">
              <div className="bg-white border border-[#E2EDE8] rounded-[24px] p-6 shadow-sm flex flex-col gap-6">
                {/* License Box */}
                <div>
                  <span className="text-xs font-bold text-[#111111] block mb-2">Access Level</span>
                  <div className="border border-zinc-300 rounded-xl p-3 flex justify-between items-center bg-white cursor-pointer hover:border-[#24B86C] transition-colors group">
                    <div>
                      <div className="text-sm font-bold text-[#111111] mb-0.5">
                        {productPlan === 'Paid' ? `Price: ${product.price || 'N/A'}` : `${productPlan} Tier Resources`}
                      </div>
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
                    <Link href={`/login?redirect=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : '')}`}>
                      <Button className="w-full h-12 bg-[#0D1A12] hover:bg-[#24B86C] text-white font-bold rounded-xl text-sm transition-all">
                        Log in to Download
                      </Button>
                    </Link>
                  ) : canDownload ? (
                    product.download_url || product.google_drive_file_id ? (
                      <Button onClick={handleDownload} disabled={downloading} className="w-full h-12 bg-[#24B86C] hover:bg-[#1DA05D] text-white font-bold rounded-xl text-sm shadow-[0_8px_20px_rgba(36,184,108,0.25)] hover:-translate-y-0.5 transition-all">
                        {downloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                        {downloading ? 'Preparing...' : 'Download Asset'}
                      </Button>
                    ) : (
                      <Button disabled className="w-full h-12 bg-zinc-100 text-zinc-400 font-bold rounded-xl text-sm">
                        File unavailable
                      </Button>
                    )
                  ) : (
                    <Button disabled className="w-full h-12 bg-[#8bd1b5] text-[#dcaebb] font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 opacity-100">
                      Locked (Purchase Required)
                    </Button>
                  )}
                  <a 
                    href={`https://wa.me/918969688709?text=${encodeURIComponent(`Hi Design Walla! 👋\n\nI would like to hire your team to customize a product.\n\n*Product Name:* ${product.name}\n*Product Link:* https://designwalla.com/products/${product.slug || product.id}\n\nPlease let me know how we can proceed!`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full block"
                  >
                    <Button variant="outline" className="w-full h-12 border-[#E2EDE8] bg-[#FAFCFB] hover:border-[#11998E] hover:text-[#11998E] rounded-xl font-bold transition-colors text-sm text-zinc-700">
                      <Wand2 className="w-4 h-4 mr-2" /> Hire team to customize
                    </Button>
                  </a>
                  <div className="flex gap-2">
                    <Button onClick={handleToggleWishlist} disabled={wishlistLoading} variant="outline" className={`flex-1 h-12 border-[#E2EDE8] hover:border-[#24B86C] rounded-xl font-bold transition-colors text-sm ${isWishlisted ? 'bg-[#24B86C]/10 text-[#24B86C] border-[#24B86C]/30' : 'hover:text-[#24B86C] hover:bg-[#24B86C]/5 text-zinc-700'}`}>
                      <Bookmark className={`w-4 h-4 mr-2 ${isWishlisted ? 'fill-current' : ''}`} /> {isWishlisted ? 'Saved' : 'Save'}
                    </Button>
                    <Button onClick={handleShare} variant="outline" className="flex-1 h-12 border-[#E2EDE8] rounded-xl font-bold hover:bg-zinc-50 transition-colors text-sm text-zinc-700">
                      <Share2 className="w-4 h-4 mr-2" /> Share
                    </Button>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ── Right Column (Sidebar) ── */}
          <div className="hidden lg:block w-[360px] shrink-0">
            <div className="bg-white border border-[#E2EDE8] rounded-[24px] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.04)] flex flex-col gap-6">
              
              {/* Author badge removed */}
              {/* Rating removed */}
              
              {/* Access Level / Price Box */}
              <div>
                <span className="text-xs font-bold text-[#111111] block mb-2">Access Level</span>
                {productPlan === 'Paid' ? (
                  <div className="border-2 border-[#E2EDE8] rounded-xl p-4 bg-[#F3F6F5]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-[#E2EDE8] text-[#111111] text-[11px] font-black uppercase tracking-wider shadow-sm">
                        <Star className="w-3 h-3 text-[#24B86C] fill-[#24B86C]" /> Paid Product
                      </span>
                      <span className="text-2xl font-black text-[#111111]">
                        {product.price || 'Contact us'}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 font-medium">One-time purchase · Lifetime download access</p>
                    {user && (
                      <div className="text-xs text-zinc-500 flex items-center gap-1.5 mt-2 pt-2 border-t border-[#E2EDE8]">
                        <span>Your Plan: <span className="font-bold text-[#111111]">{userPlan}</span></span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="border border-zinc-200 rounded-xl p-3 flex justify-between items-center bg-white hover:border-[#24B86C] transition-colors group cursor-pointer">
                    <div>
                      <div className="text-sm font-bold text-[#111111] mb-0.5">
                        {productPlan === 'Pro' ? 'Plus + Pro' : productPlan} Tier Resources
                      </div>
                    {user && (
                      <div className="text-xs text-zinc-500 flex items-center gap-1.5 mt-0.5">
                        <span>Your Plan: <span className="font-bold text-[#111111]">{userPlan}</span></span>
                      </div>
                    )}
                  </div>
                </div>
                )}
              </div>
              
              {/* Purchase/Download Buttons */}
              <div className="flex flex-col gap-2 mt-2">
                {authLoading ? (
                  <Button disabled className="w-full h-12 bg-zinc-100 rounded-xl">
                    <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
                  </Button>
                ) : !user ? (
                  <Link href={`/login?redirect=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : '')}`}>
                    <Button className="w-full h-12 bg-[#24B86C] hover:bg-[#1E995A] text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg text-sm mb-3">
                      {productPlan === 'Paid' 
                        ? 'Login Required Before Downloading' 
                        : `Upgrade to ${productPlan === 'Pro' ? 'Plus + Pro' : productPlan} to Download`}
                    </Button>
                  </Link>
                ) : canDownload ? (
                  <Button onClick={handleDownload} disabled={downloading} className="w-full h-12 bg-[#24B86C] hover:bg-[#1E995A] text-white font-bold rounded-xl text-sm shadow-[0_4px_14px_rgba(36,184,108,0.3)] transition-all">
                    {downloading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Downloading...</> : <><Download className="w-4 h-4 mr-2"/> Download Now</>}
                  </Button>
                ) : (
                  <Button disabled className="w-full h-12 bg-[#8bd1b5] text-[#dcaebb] font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 opacity-100">
                    Locked (Purchase Required)
                  </Button>
                )}
                
                <a 
                  href={`https://wa.me/918969688709?text=${encodeURIComponent(`Hi Design Walla! 👋\n\nI would like to hire your team to customize a product.\n\n*Product Name:* ${product.name}\n*Product Link:* https://designwalla.com/products/${product.slug || product.id}\n\nPlease let me know how we can proceed!`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full block"
                >
                  <Button variant="outline" className="w-full h-12 border border-[#E2EDE8] bg-[#FAFCFB] hover:border-[#11998E] hover:text-[#11998E] rounded-xl font-bold transition-colors text-sm text-[#111111]">
                    <Wand2 className="w-4 h-4 mr-2" /> Hire team to customize
                  </Button>
                </a>
                <div className="flex gap-2">
                  <Button onClick={handleToggleWishlist} disabled={wishlistLoading} variant="outline" className={`flex-1 h-12 border border-[#E2EDE8] font-bold bg-white hover:border-[#24B86C] rounded-xl text-sm transition-colors ${isWishlisted ? 'text-[#24B86C] bg-[#24B86C]/5 border-[#24B86C]/30' : 'hover:text-[#24B86C] text-[#111111]'}`}>
                    <Bookmark className={`w-4 h-4 mr-2 ${isWishlisted ? 'fill-current' : ''}`}/> {isWishlisted ? 'Saved' : 'Save'}
                  </Button>
                  <Button onClick={handleShare} variant="outline" className="flex-1 h-12 border border-[#E2EDE8] font-bold bg-white hover:bg-zinc-50 rounded-xl text-sm text-[#111111] transition-colors">
                    <Share2 className="w-4 h-4 mr-2"/> Share
                  </Button>
                </div>
              </div>
            </div>

            {/* Why choose DESIGNWALLA? */}
            <div className="mt-6 bg-white border border-[#E2EDE8] rounded-[24px] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
              <h3 className="font-medium text-[#111111] mb-6 text-center text-[17px]">Why choose DESIGNWALLA?</h3>
              <div className="flex justify-between items-start gap-2 px-2">
                <div className="flex flex-col items-center gap-3 text-center w-1/3">
                  <Crown className="w-7 h-7 text-[#111111]" strokeWidth={1.5} />
                  <span className="text-[13px] font-medium text-zinc-800 leading-tight">Exclusive<br/>content</span>
                </div>
                <div className="flex flex-col items-center gap-3 text-center w-1/3">
                  <ShieldCheck className="w-7 h-7 text-[#111111]" strokeWidth={1.5} />
                  <span className="text-[13px] font-medium text-zinc-800 leading-tight">Commercial<br/>Uses</span>
                </div>
                <div className="flex flex-col items-center gap-3 text-center w-1/3">
                  <FileText className="w-7 h-7 text-[#111111]" strokeWidth={1.5} />
                  <span className="text-[13px] font-medium text-zinc-800 leading-tight">Budget<br/>Friendly</span>
                </div>
              </div>

              {/* Important Note */}
              <div className="mt-6 bg-[#FFFCF5] border border-[#F5E6C8] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full bg-[#F59E0B] flex items-center justify-center">
                    <ShieldCheck className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                  <span className="font-bold text-[#111111] text-sm">Important Note</span>
                </div>
                <p className="text-[12px] text-zinc-700 leading-relaxed">
                  You are not allowed to sell, resell, or redistribute any resource without our prior written permission.<br/>
                  If you need resale or distribution rights, please contact us first
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Full width sections */}
        <div className='w-full mt-4 lg:mt-8'>
            {/* Description */}
            <div className="mt-8 bg-white rounded-[24px] p-8 md:p-10 border border-[#E2EDE8] shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <h3 className="font-bold text-xl mb-6 text-[#111111] border-b border-[#E2EDE8] pb-4">Description</h3>
              {product.description ? (
                <p className="text-[14px] text-zinc-600 leading-relaxed whitespace-pre-line">{product.description}</p>
              ) : (
                <p className="text-zinc-500 italic text-[14px]">No description provided for this product.</p>
              )}
            </div>

            {/* Technical Details Box (Included formats) */}
            {(product.specifications && product.specifications.length > 0) ? (
              <div className="mt-12 bg-white rounded-[24px] p-8 md:p-10 border border-[#E2EDE8] shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                <h3 className="font-bold text-xl mb-6 text-[#111111] border-b border-[#E2EDE8] pb-4">Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12">
                  {product.specifications.map((spec, i) => (
                    <div key={i} className="flex items-start gap-2 border-b border-zinc-100 pb-3">
                      <strong className="text-zinc-800 font-bold text-[14px] shrink-0">{spec.label}</strong>
                      <span className="text-[14px] text-zinc-600">{spec.value}</span>
                    </div>
                  ))}
                  {(product.features?.filter(f => f !== 'Disable Hover Zoom').length || 0) > 0 && (
                    <div className="flex flex-col border-b border-zinc-100 pb-3 md:col-span-2 mt-2">
                      <strong className="text-zinc-800 font-bold text-[14px] mb-2">Other Features</strong>
                      <ul className="list-disc pl-5 text-[14px] text-zinc-600 space-y-1">
                        {product.features?.filter(f => f !== 'Disable Hover Zoom').map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-12 bg-white rounded-[24px] p-8 md:p-10 border border-[#E2EDE8] shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                <div className="flex items-center gap-2 mb-8 pb-6 border-b border-[#E2EDE8]">
                  <div className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center text-white font-bold text-[10px]">U</div>
                  <span className="bg-zinc-100 text-zinc-800 rounded-full px-4 py-1 text-xs font-bold border border-zinc-200">Unreal Engine</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div>
                    <h3 className="font-bold text-xl mb-6 text-[#111111] border-b border-[#E2EDE8] pb-4">Technical details</h3>
                    <ul className="text-[14px] text-zinc-600 space-y-2.5">
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
            )}

            {/* Tags */}
            {(product.tags && product.tags.length > 0) && (
              <div className="mt-12">
                <h3 className="font-bold mb-4 text-[#111111] text-lg">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map(tag => (
                    <span key={tag} className="bg-white border border-[#E2EDE8] text-zinc-600 px-4 py-1.5 rounded-full text-[13px] font-bold shadow-sm cursor-pointer hover:border-[#24B86C] hover:text-[#24B86C] transition-colors">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations ("More from") */}
            {similarProducts.length > 0 && (
              <div className="mt-16 pt-10 border-t border-[#E2EDE8]">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-bold text-xl text-[#111111]">Similar Assets <ChevronRight className="inline w-5 h-5 -mt-0.5" /></h2>
                </div>
                
                <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-0 pb-6">
                  {similarProducts.slice(0, visibleSimilar).map((p) => {
                    const plan = p.plan_tier || 'Free';
                    const hasVideo = String(p.category || '').toLowerCase().includes('motion') || String(p.category || '').toLowerCase().includes('animation');
                    return (
                      <Link href={`/products/${p.slug || p.id}`} key={p.id} className="block group mb-4 break-inside-avoid">
                        <div className="relative rounded-2xl overflow-hidden hover:-translate-y-1 transition-all duration-300 shadow-sm border border-[#E2EDE8]/50">
                          <div className="relative w-full overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={p.image || p.thumbnail_url}
                              alt={p.name}
                              loading="lazy"
                              className="block w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500 bg-zinc-100"
                            />
                            
                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-lg border border-white/30 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
                              <span className={`w-1.5 h-1.5 rounded-full shadow-sm ${
                                plan === 'Free' ? 'bg-[#24B86C]' :
                                plan === 'Pro' ? 'bg-[#9333EA]' :
                                'bg-[#F59E0B]'
                              }`} />
                              <span className="text-[10px] font-bold uppercase tracking-widest text-white drop-shadow-md">
                                {plan === 'Pro' ? 'Plus + Pro' : plan}
                              </span>
                            </div>

                            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                              <button className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-lg border border-white/30 flex items-center justify-center shadow-lg hover:bg-white/40 hover:scale-110 transition-all text-white">
                                <Heart className="w-3.5 h-3.5 text-white drop-shadow-md" />
                              </button>
                              {plan === 'Free' ? (
                                <button className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-lg border border-white/30 flex items-center justify-center shadow-lg hover:bg-white/40 hover:scale-110 transition-all text-white">
                                  <Download className="w-3.5 h-3.5 text-white drop-shadow-md" />
                                </button>
                              ) : (
                                <button className="w-8 h-8 rounded-full bg-[#24B86C]/80 backdrop-blur-lg border border-[#24B86C]/50 flex items-center justify-center shadow-lg hover:bg-[#24B86C] hover:scale-110 transition-all text-white">
                                  <ShoppingCart className="w-3.5 h-3.5 text-white drop-shadow-md" />
                                </button>
                              )}
                              {hasVideo && (
                                <button className="w-8 h-8 rounded-full bg-[#9333EA]/80 backdrop-blur-lg border border-[#9333EA]/50 flex items-center justify-center shadow-lg hover:bg-[#9333EA] hover:scale-110 transition-all text-white">
                                  <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5 drop-shadow-md" />
                                </button>
                              )}
                            </div>


                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
                {visibleSimilar < similarProducts.length && (
                  <div className="flex justify-center mt-6">
                    <Button onClick={() => setVisibleSimilar(s => s + 8)} variant="outline" className="px-8 h-12 rounded-xl font-bold border-[#E2EDE8] hover:bg-[#F3F6F5] text-zinc-700 transition-colors">
                      Load More
                    </Button>
                  </div>
                )}
              </div>
            )}

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
