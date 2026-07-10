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
            
            // Determine stacking logic for the "Curved Gallery" Arch effect
            const isLeft = offset < 0;
            
            // Base width for calculating offsets
            const overlap = 140; // Less overlap for the arch effect compared to the stack

            // Calculate exact position
            const x = offset * overlap;

            // Scale down based on distance from center
            const scale = isActive ? 1.05 : Math.max(0.7, 0.97 - (absOffset * 0.05));
            
            // Arch effect: push down and rotate based on distance
            // Active: y=0, rotate=0
            // Distance 1: y=10px, rotate=5deg
            // Distance 2: y=25px, rotate=10deg
            const y = isActive ? 0 : (absOffset === 1 ? 15 : absOffset === 2 ? 30 : absOffset * 20);
            
            // Rotation: negative for left side, positive for right side
            const rotate = isActive ? 0 : (isLeft ? -4 * absOffset : 4 * absOffset);
            
            // Z-index: Active is top (highest). Others decrease outwards.
            const zIndex = 100 - absOffset;
            
            // Opacity: Fade out if they are too far away
            const opacity = absOffset > 3 ? 0 : 1;

            return (
              <motion.div
                key={project.id}
                className="absolute w-[180px] h-[360px] lg:w-[240px] lg:h-[480px] rounded-[24px] overflow-hidden cursor-pointer transform-gpu will-change-transform shadow-[0_15px_35px_rgba(0,0,0,0.1)] border border-white/20"
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
