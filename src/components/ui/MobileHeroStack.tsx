"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface MobileHeroStackProps {
  cards: any[];
}

export function MobileHeroStack({ cards }: MobileHeroStackProps) {
  const [cardsState, setCardsState] = useState(cards.slice(0, 5));

  useEffect(() => {
    // Sync state if props change
    setCardsState(cards.slice(0, 5));
  }, [cards]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCardsState((prev) => {
        if (prev.length === 0) return prev;
        const newCards = [...prev];
        const first = newCards.shift();
        if (first) newCards.push(first);
        return newCards;
      });
    }, 2500); // cycle every 2.5s
    return () => clearInterval(timer);
  }, []);

  if (!cardsState || cardsState.length === 0) return null;

  return (
    <div className="relative w-full h-[320px] sm:h-[380px] flex items-center justify-center mt-10 mb-6 lg:hidden">
      {cardsState.map((card, index) => {
        const isFront = index === 0;
        return (
          <motion.div
            key={card.id || card.label}
            layout
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ 
              scale: 1 - index * 0.06, 
              y: index * 18,
              zIndex: cardsState.length - index,
              opacity: 1 - index * 0.15
            }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute w-[220px] sm:w-[260px] rounded-[1.25rem] overflow-hidden shadow-[0_8px_30px_rgba(36,184,108,0.12)] border border-[#24B86C]/15 bg-white/90 backdrop-blur-xl"
            style={{ transformOrigin: 'top center' }}
          >
            <div className={`relative w-full ${card.aspect || 'aspect-[4/3]'} p-1.5`}>
              <div className="relative w-full h-full rounded-xl overflow-hidden shadow-inner bg-black/5">
                {card.img && <Image src={card.img} alt={card.label} fill className="object-cover" quality={60} sizes="(max-width: 640px) 220px, 260px" />}
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
