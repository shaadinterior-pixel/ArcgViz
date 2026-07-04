"use client";

import React from 'react';

const softwareLogos = [
  { name: 'Blender', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/blender/blender-original.svg' },
  { name: 'Unreal Engine', icon: 'https://cdn.simpleicons.org/unrealengine/FFFFFF' },
  { name: 'Unity', icon: 'https://cdn.simpleicons.org/unity/FFFFFF' },
  { name: 'Maya', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/maya/maya-original.svg' },
  { name: 'Cinema 4D', icon: 'https://cdn.simpleicons.org/cinema4d/00A8FF' },
  { name: 'Houdini', icon: 'https://cdn.simpleicons.org/houdini/FF7A00' },
  { name: 'SketchUp', icon: 'https://cdn.simpleicons.org/sketchup/00A8FF' },
  { name: 'Figma', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/figma/figma-original.svg' },
  { name: 'Photoshop', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/photoshop/photoshop-original.svg' },
  { name: 'Illustrator', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/illustrator/illustrator-plain.svg' },
  { name: 'Premiere Pro', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/premierepro/premierepro-original.svg' },
  { name: 'After Effects', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/aftereffects/aftereffects-original.svg' },
];

// Duplicate 4x is enough for seamless loop on ultra-wide screens
const marqueeItems = [...softwareLogos, ...softwareLogos, ...softwareLogos, ...softwareLogos];

export function SoftwareMarquee() {
  return (
    <div className="w-full py-12 overflow-hidden border-y border-border/10 bg-secondary/10 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background z-10 pointer-events-none" />
      
      <div className="container mx-auto px-4 mb-6 text-center">
        <p className="text-sm font-medium text-foreground/50 uppercase tracking-widest">Compatible with industry standards</p>
      </div>

      <div className="relative flex overflow-hidden">
        <div className="flex whitespace-nowrap items-center gap-16 md:gap-24 px-8 w-max animate-marquee">
          {marqueeItems.map((logo, index) => (
            <div 
              key={`${logo.name}-${index}`} 
              className="flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity duration-300 group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={logo.icon} 
                alt={`${logo.name} logo`}
                width={56}
                height={56}
                loading="lazy"
                decoding="async"
                className="h-10 md:h-14 object-contain max-w-[120px] grayscale transition-[filter] duration-300 group-hover:grayscale-0"
                title={logo.name}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
