"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useInView,
} from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { fetchCategories, onStoreUpdate, type Category, type CardEntry } from '@/lib/store';

// ─── Device capability detection ──────────────────────────────────────────────

function useIsLowEnd(): boolean {
  const [lowEnd, setLowEnd] = useState(false);
  useEffect(() => {
    const nav = navigator as any;
    const mem = nav.deviceMemory;
    const cores = nav.hardwareConcurrency;
    if ((mem && mem <= 2) || (cores && cores <= 2)) setLowEnd(true);
  }, []);
  return lowEnd;
}

// ─── Easing configs ───────────────────────────────────────────────────────────

const SMOOTH_SPRING = { stiffness: 200, damping: 24, mass: 0.3 };
const FAST_SPRING   = { stiffness: 400, damping: 30 };
const NAV_SPRING    = { type: 'spring' as const, stiffness: 600, damping: 30 };

// ─── CategoryShowcase (root) ──────────────────────────────────────────────────

export function CategoryShowcase() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = () => {
      fetchCategories().then(data => {
        if (!mounted) return;
        setCategories(data);
        if (data.length > 0 && !activeId) setActiveId(data[0].id);
      }).catch(console.error);
    };
    load();
    const unsub = onStoreUpdate('categories', load);
    return () => { mounted = false; unsub(); };
  }, [activeId]);

  useEffect(() => {
    if (categories.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: '-30% 0px -60% 0px' }
    );

    const tid = setTimeout(() => {
      document
        .querySelectorAll('.category-parent')
        .forEach((el) => observer.observe(el));
    }, 100);

    return () => {
      clearTimeout(tid);
      observer.disconnect();
    };
  }, [categories]);

  const scrollToCategory = (id: string) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 128, behavior: 'smooth' });
  };

  if (categories.length === 0) return null;

  return (
    <div className="relative w-full bg-background">
      {/* ── Sticky category navbar ── */}
      <div className="sticky top-16 z-40 w-full bg-background/90 backdrop-blur-xl border-b border-border/60 overflow-x-auto hide-scrollbar">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center gap-6 md:gap-10 min-w-max h-16">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => scrollToCategory(cat.id)}
                className={`text-sm md:text-base font-semibold transition-colors duration-200 relative h-full flex items-center ${
                  activeId === cat.id
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {cat.title}
                {activeId === cat.id && (
                  <motion.div
                    layoutId="activeCategory"
                    className="absolute bottom-0 left-0 w-full h-[2px] bg-primary rounded-full"
                    transition={NAV_SPRING}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stacked sections ── */}
      <div className="pb-[10vh]">
        {categories.map((cat, i) => (
          <StackedSection
            key={cat.id}
            category={cat}
            index={i}
            isLast={i === categories.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

// ─── StackedSection ───────────────────────────────────────────────────────────

function StackedSection({
  category,
  index,
  isLast,
}: {
  category: Category;
  index: number;
  isLast: boolean;
}) {
  const isLowEnd = useIsLowEnd();
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [scrollRange, setScrollRange] = useState(0);

  // ── Recompute scroll range on resize ──────────────────────────────────────
  const computeRange = useCallback(() => {
    if (!sliderRef.current) return;
    const stripWidth = sliderRef.current.scrollWidth;
    const vw = window.innerWidth;
    setScrollRange(Math.max(0, stripWidth - vw + 64));
  }, []);

  useEffect(() => {
    computeRange();
    const ro = new ResizeObserver(computeRange);
    if (sliderRef.current) ro.observe(sliderRef.current);
    window.addEventListener('resize', computeRange, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', computeRange);
    };
  }, [computeRange]);

  // ── Scroll-driven values ──────────────────────────────────────────────────
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const springCfg = isLowEnd ? FAST_SPRING : SMOOTH_SPRING;
  const scaleCfg  = isLowEnd ? FAST_SPRING : { stiffness: 140, damping: 22 };

  const rawX       = useTransform(scrollYProgress, [0, 0.82], [0, -scrollRange]);
  const rawScale   = useTransform(scrollYProgress, [0.78, 1], [1, 0.93]);
  const rawOpacity = useTransform(scrollYProgress, [0.78, 1], [1, 0.35]);
  const rawOverlay = useTransform(scrollYProgress, [0.78, 1], [0, 0.65]);

  const x              = useSpring(rawX, springCfg);
  const scale          = useSpring(rawScale, scaleCfg);
  const opacity        = useSpring(rawOpacity, scaleCfg);
  const overlayOpacity = useSpring(rawOverlay, scaleCfg);

  return (
    <div
      id={category.id}
      ref={containerRef}
      className={`category-parent relative w-full ${isLast ? 'h-[150vh]' : 'h-[260vh]'}`}
      style={{ zIndex: index }}
    >
      <motion.div
        className="sticky top-32 w-full flex flex-col bg-card overflow-hidden shadow-2xl origin-top border-t border-border/60"
        style={{
          scale,
          opacity,
          height: 'calc(100vh - 8rem)',
        }}
      >
        {/* Dark overlay */}
        <motion.div
          className="absolute inset-0 bg-background z-50 pointer-events-none rounded-b-2xl"
          style={{ opacity: overlayOpacity }}
        />

        {/* Top vignette */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-background/50 to-transparent z-10 pointer-events-none" />

        {/* Header */}
        <SectionHeader category={category} />

        {/* Horizontal card strip */}
        <div className="w-full flex-1 relative flex items-center overflow-hidden">
          <motion.div
            ref={sliderRef}
            className="flex gap-4 md:gap-6 flex-nowrap pb-6 md:pb-10 pt-4 px-6 md:px-10 w-max gpu-layer"
            style={{ x }}
          >
            {category.cards.map((card, idx) => (
              <CardItem
                key={idx}
                card={card}
                idx={idx}
                categoryId={category.id}
              />
            ))}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────

function SectionHeader({ category }: { category: Category }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-10% 0px' });

  return (
    <div
      ref={ref}
      className="container mx-auto px-6 md:px-12 pt-8 md:pt-14 pb-4 md:pb-6 flex flex-col md:flex-row justify-between items-start md:items-end relative z-20"
    >
      <div className="max-w-2xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-3 text-foreground leading-[1.05] gpu-layer"
        >
          {category.title}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.25, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="text-base md:text-lg text-muted-foreground gpu-layer"
        >
          {category.description}
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.25, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="gpu-layer"
      >
        <Link
          href={`/categories/${category.id}`}
          className="hidden md:flex items-center gap-2 text-primary font-semibold hover:text-primary/75 transition-colors group mt-6 md:mt-0"
        >
          Explore All
          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </motion.div>
    </div>
  );
}

// ─── CardItem ─────────────────────────────────────────────────────────────────

function CardItem({
  card,
  idx,
  categoryId,
}: {
  card: CardEntry;
  idx: number;
  categoryId: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '0px -15%' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{
        duration: 0.2,
        delay: idx * 0.03,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="gpu-layer"
    >
      <Link
        href={`/products?category=${categoryId}&type=${card.name.toLowerCase().replace(/\s+/g, '-')}`}
        className="group relative flex-shrink-0 block w-[220px] sm:w-[280px] md:w-[340px] lg:w-[400px] aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer border border-border/50 bg-secondary"
      >
        {/* Subtle dark wash */}
        <div className="absolute inset-0 bg-background/15 group-hover:bg-transparent transition-colors duration-300 z-10" />

        {/* Image — lazy, async decode, GPU-composited hover scale */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={card.image}
          alt={card.name}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-400 ease-out group-hover:scale-[1.07] gpu-layer"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent z-20" />

        {/* Text */}
        <div className="absolute bottom-0 left-0 w-full p-5 md:p-7 z-30 translate-y-1 group-hover:translate-y-0 transition-transform duration-300 ease-out">
          <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-foreground mb-1.5 leading-tight">
            {card.name}
          </h3>
          <p className="text-primary font-semibold text-sm">{card.count}</p>
        </div>
      </Link>
    </motion.div>
  );
}
