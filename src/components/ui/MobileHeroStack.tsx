"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface MobileHeroStackProps {
  cards: any[];
}

export function MobileHeroStack({ cards }: MobileHeroStackProps) {
  const [cardsState, setCardsState] = useState(cards.slice(0, 5));
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setCardsState(cards.slice(0, 5));
  }, [cards]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => prev + 1);
    }, 3000); // cycle every 3s
    return () => clearInterval(timer);
  }, []);

  if (!cardsState || cardsState.length === 0) return null;

  const total = cardsState.length;

  return (
    <div className="relative w-full h-[240px] sm:h-[280px] flex items-center justify-center mt-6 mb-2 lg:hidden overflow-visible">
      {cardsState.map((card, index) => {
        // Calculate relative distance from current active index
        const d = (index - (activeIndex % total) + total) % total;
        
        let style = { x: "0%", scale: 1, zIndex: 10, opacity: 0 };
        
        if (d === 0) {
          // Front
          style = { x: "0%", scale: 1, zIndex: 30, opacity: 1 };
        } else if (d === 1) {
          // Right
          style = { x: "55%", scale: 0.85, zIndex: 20, opacity: 0.8 };
        } else if (d === total - 1) {
          // Left
          style = { x: "-55%", scale: 0.85, zIndex: 20, opacity: 0.8 };
        } else if (d === 2) {
          // Hidden Right (fading out/in)
          style = { x: "80%", scale: 0.7, zIndex: 10, opacity: 0 };
        } else if (d === total - 2) {
          // Hidden Left
          style = { x: "-80%", scale: 0.7, zIndex: 10, opacity: 0 };
        }

        return (
          <motion.div
            key={card.id || card.label}
            initial={false}
            animate={style}
            transition={{ type: "tween", ease: [0.16, 1, 0.3, 1], duration: 0.8 }}
            className="absolute w-[220px] sm:w-[260px] rounded-[1.25rem] overflow-hidden shadow-[0_8px_30px_rgba(36,184,108,0.12)] border border-[#24B86C]/15 bg-white backdrop-blur-xl"
            style={{ transformOrigin: 'center center' }}
          >
            <div className={`relative w-full ${card.aspect || 'aspect-[4/3]'} p-1.5`}>
              <div className="relative w-full h-full rounded-xl overflow-hidden shadow-inner bg-black/5">
                {card.img?.match(/\.(mp4|webm|mov)(\?.*)?$/i) ? (
                  <video src={card.img} autoPlay loop muted playsInline className="object-cover pointer-events-none absolute inset-0 w-full h-full" />
                ) : (
                  card.img && <Image src={card.img} alt={card.label} fill className="object-cover" quality={60} sizes="(max-width: 640px) 220px, 260px" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              </div>
            </div>
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-[13px] font-black tracking-tight text-[#0D1A12] line-clamp-1">{card.label}</span>
              <div className="w-5 h-5 rounded-full bg-[#24B86C]/10 flex items-center justify-center shrink-0 ml-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#24B86C]" />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
