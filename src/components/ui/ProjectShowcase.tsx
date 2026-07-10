"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { type PortfolioItem } from '@/lib/store';

interface ProjectShowcaseProps {
  projects: PortfolioItem[];
  activeProject?: number;
  onProjectChange?: (index: number) => void;
}

export function ProjectShowcase({ projects, activeProject, onProjectChange }: ProjectShowcaseProps) {
  // Use controlled state if provided, otherwise internal state
  const [internalActive, setInternalActive] = useState(projects.length > 0 ? Math.floor(projects.length / 2) : 0);
  const activeIndex = activeProject !== undefined ? activeProject : internalActive;

  const handleActiveChange = (index: number) => {
    if (onProjectChange) {
      onProjectChange(index);
    } else {
      setInternalActive(index);
    }
  };

  if (!projects || projects.length === 0) return null;

  return (
    <div className="relative w-full py-12 flex flex-col items-center">
      
      {/* ── Mobile: Horizontal Swipe Carousel ── */}
      <div className="flex md:hidden w-full overflow-x-auto snap-x snap-mandatory hide-scrollbar space-x-4 px-6 pb-8">
        {projects.map((project, idx) => (
          <div 
            key={project.id} 
            className="snap-center shrink-0 w-[85vw] h-[450px] rounded-[32px] relative overflow-hidden shadow-xl"
          >
            <Image 
              src={project.image_url} 
              alt={project.title} 
              fill 
              className="object-cover" 
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80" />
            <div className="absolute bottom-8 left-8 right-8">
              <h3 className="text-white font-bold text-2xl drop-shadow-md leading-tight">{project.title}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* ── Desktop/Tablet: Stacked Interactive Layout ── */}
      <div className="hidden md:flex relative w-full max-w-6xl h-[500px] lg:h-[600px] items-center justify-center perspective-[2000px]">
        <AnimatePresence initial={false}>
          {projects.map((project, index) => {
            const isActive = index === activeIndex;
            const offset = index - activeIndex; 
            const absOffset = Math.abs(offset);
            
            // Determine stacking logic
            const isLeft = offset < 0;
            const isRight = offset > 0;
            
            // Base width for calculating offsets
            const cardWidth = 360; 
            const overlap = 220; // How much they overlap

            // Calculate exact position
            let x = 0;
            if (isLeft) x = offset * overlap;
            if (isRight) x = offset * overlap;

            // Scale down based on distance from center
            const scale = isActive ? 1 : Math.max(0.65, 1 - (absOffset * 0.15));
            
            // Add subtle rotation and Y-offset for a more "framer/apple" dynamic feel
            const rotate = isActive ? 0 : (isLeft ? -3 * absOffset : 3 * absOffset);
            const y = isActive ? 0 : absOffset * 10;
            
            // Z-index: Active is top (highest). Others decrease outwards.
            const zIndex = 100 - absOffset;
            
            // Opacity: Fade out if they are too far away
            const opacity = absOffset > 3 ? 0 : 1;

            return (
              <motion.div
                key={project.id}
                className="absolute w-[320px] h-[460px] lg:w-[380px] lg:h-[540px] rounded-[32px] overflow-hidden cursor-pointer transform-gpu will-change-transform shadow-[0_30px_60px_rgba(0,0,0,0.12)] border border-white/10"
                style={{ zIndex }}
                initial={false}
                animate={{
                  x,
                  y,
                  scale,
                  rotateZ: rotate,
                  opacity,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  mass: 0.8,
                }}
                onHoverStart={() => handleActiveChange(index)}
                onClick={() => handleActiveChange(index)}
                role="button"
                tabIndex={0}
                aria-label={`View project ${project.title}`}
                onKeyDown={(e: React.KeyboardEvent) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleActiveChange(index);
                  }
                }}
              >
                <div className="w-full h-full relative group">
                  <Image 
                    src={project.image_url} 
                    alt={project.title} 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  
                  {/* Overlay for non-active cards to push them into background */}
                  <div 
                    className="absolute inset-0 bg-black/60 transition-opacity duration-500 pointer-events-none" 
                    style={{ opacity: isActive ? 0 : 0.5 }}
                  />
                  
                  {/* Title Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 pointer-events-none" />
                  
                  <motion.div 
                    className="absolute bottom-8 left-8 right-8"
                    animate={{ y: isActive ? 0 : 10, opacity: isActive ? 1 : 0.7 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-white font-bold text-2xl drop-shadow-md leading-tight">{project.title}</h3>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
