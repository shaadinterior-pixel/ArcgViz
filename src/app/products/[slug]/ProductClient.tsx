"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  Star, Check, Box, FileText, Download, ShieldCheck,
  Heart, Share2, Image as ImageIcon, X, ChevronLeft,
  ChevronRight, ZoomIn, LogIn, Loader2, Monitor, MessageCircle, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { type Product } from '@/lib/store';
import { getCurrentUser, hasPurchased } from '@/lib/auth';

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

  // ── Auth & purchase state ─────────────────────────────────────────────────
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [purchased, setPurchased] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    (async () => {
      const u = await getCurrentUser();
      setUser(u ? { id: u.id } : null);
      if (u) {
        const has = await hasPurchased(product.id);
        setPurchased(has);
      }
      setAuthLoading(false);
    })();
  }, [product.id]);

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
    <div className="container mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <div className="text-sm text-foreground/50 mb-8 flex items-center gap-2 flex-wrap">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-primary">Products</Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* ── Left: Image Gallery ── */}
        <div className="w-full lg:w-2/3">
          {/* Main image */}
          <div
            className="relative aspect-[16/9] md:aspect-[4/3] lg:aspect-[16/10] overflow-hidden rounded-xl bg-secondary mb-4 border border-border cursor-zoom-in group"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            onClick={() => openLightbox(activeIdx)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={allImages[activeIdx]}
              alt={product.name}
              className="w-full h-full object-cover transition-opacity duration-300"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
              <ZoomIn className="w-8 h-8 text-white drop-shadow" />
            </div>
            {/* Nav arrows */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={e => { e.stopPropagation(); setActiveIdx(i => (i - 1 + allImages.length) % allImages.length); }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5"/>
                </button>
                <button
                  onClick={e => { e.stopPropagation(); setActiveIdx(i => (i + 1) % allImages.length); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="w-5 h-5"/>
                </button>
              </>
            )}
            {/* Dot indicators */}
            {allImages.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {allImages.map((_, i) => (
                  <span key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === activeIdx ? 'bg-white w-4' : 'bg-white/50'}`}/>
                ))}
              </div>
            )}
          </div>

          {/* Thumbnail strip */}
          {allImages.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mb-10">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all ${activeIdx === i ? 'border-primary' : 'border-transparent hover:border-primary/50'}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`Preview ${i + 1}`} loading="lazy" className="w-full h-full object-cover"/>
                </button>
              ))}
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-6 pb-4 border-b border-border">Description</h2>
              <p className="text-foreground/80 leading-relaxed whitespace-pre-line mb-8">{product.description}</p>
            </div>
          )}

          {/* Features */}
          {(product.features ?? []).length > 0 && (
            <div className="mb-10">
              <h3 className="text-xl font-bold mb-4">Features</h3>
              <ul className="space-y-3">
                {product.features.map((f, i) => (
                  <li key={i} className="flex items-start text-foreground/80">
                    <Check className="w-5 h-5 text-primary mr-3 shrink-0 mt-0.5"/>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* ── Right: Details & Purchase ── */}
        <div className="w-full lg:w-1/3">
          <div className="sticky top-24 bg-card border border-border rounded-xl p-6 md:p-8 shadow-lg space-y-6">
            <div>
              <div className="text-sm text-foreground/60 mb-1">{product.author}</div>
              <h1 className="text-2xl font-bold leading-tight">{product.name}</h1>
            </div>

            <div className="flex items-center gap-4 pb-4 border-b border-border">
              <div className="flex items-center bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                <Star className="w-4 h-4 mr-1 fill-primary"/>{product.rating}
              </div>
              <span className="text-sm text-foreground/60">{product.sales} sales</span>
            </div>

            <div className="text-4xl font-bold">{product.price}</div>

            {/* Purchase / Download CTA */}
            <div className="space-y-3">
              {authLoading ? (
                <Button disabled className="w-full h-12">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin"/>Checking…
                </Button>
              ) : purchased ? (
                <Button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="w-full h-12 text-base font-semibold bg-green-600 hover:bg-green-500 text-white shadow-lg"
                >
                  {downloading
                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/>Preparing…</>
                    : <><Download className="w-4 h-4 mr-2"/>Download File</>
                  }
                </Button>
              ) : (
                <>
                  <Button className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25">
                    Buy Now
                  </Button>
                  {!user && (
                    <Link href="/login" className="block">
                      <Button variant="outline" className="w-full h-10 text-sm">
                        <LogIn className="w-4 h-4 mr-2"/>Sign in to purchase
                      </Button>
                    </Link>
                  )}
                </>
              )}
              
              {/* WhatsApp Customization Button */}
              <a 
                href={`https://wa.me/919065347011?text=${encodeURIComponent(`Hi, I am interested in customizing the model: ${product.name}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full"
              >
                <Button variant="outline" className="w-full h-12 text-base font-semibold border-green-500/30 text-green-500 hover:bg-green-500/10 hover:border-green-500 transition-colors">
                  <MessageCircle className="w-5 h-5 mr-2"/>
                  Customize Model
                </Button>
              </a>
            </div>

            {purchased && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-sm text-green-400 flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0"/>You own this product
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1 text-foreground/70 hover:text-foreground">
                <Heart className="w-4 h-4 mr-2"/>Wishlist
              </Button>
              <Button variant="ghost" className="flex-1 text-foreground/70 hover:text-foreground">
                <Share2 className="w-4 h-4 mr-2"/>Share
              </Button>
            </div>

            {/* Specifications */}
            {specs.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold pb-2 border-b border-border">Specifications</h3>
                <div className="space-y-2 text-sm">
                  {specs.map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex justify-between items-start gap-4">
                      <div className="flex items-center text-foreground/60 shrink-0">
                        <Icon className="w-4 h-4 mr-2"/>{label}
                      </div>
                      <div className="font-medium text-right">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-start text-sm text-foreground/60 pt-2 border-t border-border">
              <ShieldCheck className="w-5 h-5 mr-3 text-green-500 shrink-0"/>
              <p>Secure transaction guaranteed. Download immediately after purchase.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Recommendations (Similar Products) ── */}
      {similarProducts.length > 0 && (
        <div className="mt-24 pt-12 border-t border-border/50">
          <h2 className="text-3xl font-bold mb-8">You Might Also Like</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {similarProducts.map((p) => (
              <Link href={`/products/${p.slug || p.id}`} key={p.id} className="block group">
                <div className="h-full flex flex-col rounded-2xl overflow-hidden border border-border bg-card hover:border-primary/40 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5">
                  <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/10' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.thumbnail_url || p.image}
                      alt={p.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-background/0 group-hover:bg-background/30 transition-colors duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <span className="flex items-center justify-center gap-2 bg-background/90 backdrop-blur-sm text-foreground text-sm font-semibold px-5 py-2.5 rounded-full border border-border shadow-lg translate-y-3 group-hover:translate-y-0 transition-transform duration-500">
                        View Details <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col flex-1 p-5 gap-3">
                    <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                      {p.author}
                    </span>
                    <h3 className="text-base font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-300">
                      {p.name}
                    </h3>
                    <div className="flex-1" />
                    <div className="h-px bg-border/60" />
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-black text-foreground">{p.price}</span>
                      <div className="flex items-center text-sm font-bold text-primary">
                        View
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

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
