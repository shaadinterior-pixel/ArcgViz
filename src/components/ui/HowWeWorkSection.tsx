"use client";

import React from 'react';
import { Search, Palette, Code2, Rocket, CheckCircle2 } from 'lucide-react';

const steps = [
  {
    id: '01',
    title: 'Discovery',
    description: 'We deep-dive into your business, goals, audience, and competitors to build a clear roadmap.',
    icon: Search
  },
  {
    id: '02',
    title: 'Design',
    description: 'Our creative team crafts stunning concepts, wireframes, and visual prototypes for your approval.',
    icon: Palette
  },
  {
    id: '03',
    title: 'Development',
    description: 'Expert engineers and artisans bring the design to life with clean code and precision execution.',
    icon: Code2
  },
  {
    id: '04',
    title: 'Execution',
    description: 'We rigorously test, refine, and perfect every detail before the final handover.',
    icon: Rocket
  },
  {
    id: '05',
    title: 'Delivery',
    description: 'Your project goes live with ongoing support, maintenance, and growth strategy.',
    icon: CheckCircle2
  }
];

export function HowWeWorkSection() {
  return (
    <section className="py-24 bg-[#FAFAFA] dark:bg-[#0A0A0A] relative overflow-hidden">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-block px-4 py-1.5 rounded-full bg-[#24B86C]/10 mb-6">
            <span className="text-[#24B86C] font-semibold text-sm tracking-wide">Our Process</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black tracking-tight text-foreground">
            How We <span className="text-[#24B86C]">Work</span>
          </h2>
        </div>

        {/* Timeline */}
        <div className="relative w-full max-w-6xl mx-auto">
          {/* Horizontal Line (Desktop) */}
          <div className="hidden lg:block absolute top-[45px] left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-transparent via-[#24B86C]/50 to-transparent z-0" />

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-4 relative z-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="flex flex-col items-center text-center group">
                  {/* Icon Circle */}
                  <div className="w-24 h-24 rounded-full bg-white dark:bg-zinc-900 border-[6px] border-[#FAFAFA] dark:border-[#0A0A0A] shadow-[0_0_20px_rgba(36,184,108,0.15)] flex items-center justify-center mb-6 relative group-hover:scale-110 transition-transform duration-300">
                    <div className="w-16 h-16 rounded-full bg-[#24B86C] flex items-center justify-center shadow-inner">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  
                  {/* Step Number */}
                  <span className="text-[#24B86C] font-black text-sm mb-2">{step.id}</span>
                  
                  {/* Content */}
                  <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-[200px] mx-auto">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
