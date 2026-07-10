"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { QrCode, Image as ImageIcon, Sparkles, Scissors, PenTool, LayoutTemplate, ArrowRight } from 'lucide-react';

const tools = [
  {
    id: 'qr-code-studio',
    title: 'QR Code Studio',
    description: 'Generate stunning, customized QR codes with your branding in seconds. Fully responsive and vector-ready.',
    icon: QrCode,
    href: '/studio',
    status: 'Live',
    color: 'from-[#24B86C] to-[#11998E]'
  },
  {
    id: 'background-remover',
    title: 'AI Background Remover',
    description: 'Instantly isolate subjects from their backgrounds with pixel-perfect precision using our advanced AI.',
    icon: Scissors,
    href: '#',
    status: 'Coming Soon',
    color: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'image-upscaler',
    title: 'Image Upscaler',
    description: 'Enhance and upscale low-resolution images up to 4x without losing quality or details.',
    icon: ImageIcon,
    href: '#',
    status: 'Coming Soon',
    color: 'from-orange-400 to-red-500'
  },
  {
    id: 'vector-converter',
    title: 'Vector Converter',
    description: 'Convert raster images (JPG, PNG) into infinitely scalable SVG vectors automatically.',
    icon: PenTool,
    href: '#',
    status: 'Coming Soon',
    color: 'from-purple-500 to-pink-600'
  }
];

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-[#FAFCFB] selection:bg-[#24B86C]/20 pt-32 pb-32">
      
      {/* ── PREMIUM LIGHT HERO ── */}
      <section className="relative px-4 text-center max-w-4xl mx-auto mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E8F5F1] text-[#24B86C] text-sm font-bold tracking-wide uppercase mb-8 shadow-sm border border-[#24B86C]/10"
        >
          <Sparkles className="w-4 h-4 fill-current" />
          Design Walla Tools
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl md:text-5xl lg:text-7xl font-black text-[#0D1A12] tracking-tighter leading-[1.1] mb-6"
        >
          Creative Tools for <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#24B86C] to-[#11998E]">Modern Workflows.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-6 text-zinc-500 font-medium text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
        >
          Supercharge your design process with our suite of powerful, intuitive, and AI-driven utilities.
        </motion.p>
      </section>

      {/* ── TOOLS GRID ── */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {tools.map((tool, index) => {
            const isLive = tool.status === 'Live';
            
            return (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + (index * 0.1) }}
              >
                <Link
                  href={tool.href}
                  className={`group relative flex flex-col h-full bg-white rounded-[2rem] p-8 border ${isLive ? 'border-[#E2EDE8] hover:border-[#24B86C]/50 shadow-sm hover:shadow-[0_20px_40px_rgba(36,184,108,0.12)]' : 'border-zinc-100 shadow-sm opacity-80 cursor-default'} overflow-hidden transition-all duration-500 hover:-translate-y-2`}
                  onClick={(e) => { if (!isLive) e.preventDefault(); }}
                >
                  
                  <div className="flex items-start justify-between mb-8 relative z-10">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br ${tool.color} shadow-lg text-white`}>
                      <tool.icon className="w-8 h-8" />
                    </div>
                    
                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isLive ? 'bg-[#24B86C]/10 text-[#24B86C]' : 'bg-zinc-100 text-zinc-400'}`}>
                      {tool.status}
                    </div>
                  </div>

                  <div className="relative z-10 flex flex-col flex-1">
                    <h2 className="text-2xl font-black text-[#111111] mb-3">{tool.title}</h2>
                    <p className="text-zinc-500 font-medium leading-relaxed mb-8 flex-1">
                      {tool.description}
                    </p>
                    
                    {isLive && (
                      <div className="flex items-center gap-2 text-[13px] font-bold text-[#111111] uppercase tracking-widest group-hover:text-[#24B86C] transition-colors mt-auto">
                        Launch Studio <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    )}
                  </div>

                  {/* Subtle Background Glow for Live tools */}
                  {isLive && (
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#24B86C]/5 to-transparent rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-opacity opacity-0 group-hover:opacity-100 duration-500" />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
