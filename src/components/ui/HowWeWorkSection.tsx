"use client";

import React from 'react';
import { Search, Palette, Code2, Rocket, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
  { id: '01', title: 'Discovery',    description: 'We deep-dive into your business, goals, audience, and competitors to build a clear roadmap.', icon: Search },
  { id: '02', title: 'Design',       description: 'Our creative team crafts stunning concepts, wireframes, and visual prototypes for your approval.', icon: Palette },
  { id: '03', title: 'Development',  description: 'Expert engineers and artisans bring the design to life with clean code and precision execution.', icon: Code2 },
  { id: '04', title: 'Execution',    description: 'We rigorously test, refine, and perfect every detail before the final handover.', icon: Rocket },
  { id: '05', title: 'Delivery',     description: 'Your project goes live with ongoing support, maintenance, and growth strategy.', icon: CheckCircle2 },
];

export function HowWeWorkSection() {
  return (
    <section className="py-24 bg-[#F8FAF9] relative overflow-hidden">
      {/* Decorative orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(36,184,108,0.06)_0,transparent_60%)] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[radial-gradient(circle_at_center,rgba(17,153,142,0.06)_0,transparent_60%)] pointer-events-none" />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="glass-card rounded-[3rem] p-8 md:p-16 border border-[#E2EDE8]/50 shadow-[0_8px_40px_rgba(36,184,108,0.04)]">
          {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-20 gpu-layer"
        >
          <div className="inline-block px-4 py-1.5 rounded-full bg-[#24B86C]/10 mb-6">
            <span className="text-[#24B86C] font-semibold text-sm tracking-wide">Our Process</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black tracking-tight text-[#0D1A12]">
            How We <span className="text-[#24B86C]">Work</span>
          </h2>
        </motion.div>

        {/* Timeline */}
        <div className="relative w-full max-w-6xl mx-auto">
          {/* Connector line */}
          <div className="hidden lg:block absolute top-[45px] left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-transparent via-[#24B86C]/40 to-transparent z-0" />

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-4 relative z-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.8, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-center text-center group gpu-layer"
                >
                  <div className="w-24 h-24 rounded-full bg-white border-[6px] border-[#F8FAF9] shadow-[0_0_30px_rgba(36,184,108,0.15)] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-[0_0_40px_rgba(36,184,108,0.3)] transition-all duration-500 will-change-transform">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#24B86C] to-[#11998E] flex items-center justify-center shadow-inner">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <span className="text-[#24B86C] font-black text-sm mb-2">{step.id}</span>
                  <h3 className="text-xl font-bold text-[#0D1A12] mb-3">{step.title}</h3>
                  <p className="text-[#6B7280] text-sm leading-relaxed max-w-[200px] mx-auto">{step.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}
