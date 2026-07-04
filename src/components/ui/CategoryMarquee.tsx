"use client";

import React from 'react';
import { Sparkles } from 'lucide-react';

const categories = [
  "Models", "Web & Apps", "Motion", "Printing", "Digital Products",
  "Marketing", "Animation", "Packaging", "Interior", "Branding", "3D"
];

// Duplicate the items enough times to create a seamless infinite loop
const marqueeItems = [...categories, ...categories, ...categories];

export function CategoryMarquee() {
  return (
    <div className="w-full py-6 overflow-hidden border-b border-[#E2EDE8] bg-[#F8FAF9] relative">
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#F8FAF9] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#F8FAF9] to-transparent z-10 pointer-events-none" />
      
      <div className="relative flex overflow-hidden">
        <div className="flex whitespace-nowrap items-center gap-8 md:gap-12 px-4 w-max animate-marquee-reverse">
          {marqueeItems.map((category, index) => (
            <div 
              key={`${category}-${index}`} 
              className="flex items-center justify-center group"
            >
              <div className="flex items-center gap-3 md:gap-4">
                <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-[#24B86C] opacity-70" />
                <span className="text-sm md:text-base font-bold text-[#4B5563] tracking-wide uppercase group-hover:text-[#24B86C] transition-colors duration-300">
                  {category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
