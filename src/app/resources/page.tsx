"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Download, Figma, Box, Video, FileArchive } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const FREE_RESOURCES = [
  {
    id: 1,
    title: "Premium ArchViz Moodboard",
    category: "Figma Template",
    icon: <Figma className="w-5 h-5 text-[#F24E1E]" />,
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=600",
    downloads: "2.4k",
  },
  {
    id: 2,
    title: "Minimalist Furniture Pack",
    category: "3D Models (.blend, .obj)",
    icon: <Box className="w-5 h-5 text-blue-500" />,
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=600",
    downloads: "5.1k",
  },
  {
    id: 3,
    title: "Cinematic LUTs Collection",
    category: "Video Presets",
    icon: <Video className="w-5 h-5 text-purple-500" />,
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=600",
    downloads: "1.2k",
  },
  {
    id: 4,
    title: "Modern UI Kit 2024",
    category: "Figma UI Kit",
    icon: <Figma className="w-5 h-5 text-[#F24E1E]" />,
    image: "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=600",
    downloads: "8.9k",
  },
  {
    id: 5,
    title: "Corporate Brand Guidelines",
    category: "InDesign / PDF",
    icon: <FileArchive className="w-5 h-5 text-emerald-600" />,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600",
    downloads: "3.7k",
  },
  {
    id: 6,
    title: "Sci-Fi Hard Surface Kitbash",
    category: "3D Models (.fbx)",
    icon: <Box className="w-5 h-5 text-blue-500" />,
    image: "https://images.unsplash.com/photo-1618220179428-22790b46a0eb?auto=format&fit=crop&q=80&w=600",
    downloads: "12k",
  }
];

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-[#FAFCFB] pt-24 pb-32">
      
      {/* ── HERO ── */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16 md:py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#E2EDE8] shadow-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-[#00E599] animate-pulse" />
            <span className="text-zinc-600 font-bold text-xs tracking-widest uppercase">Open Source</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-[#111111] tracking-tighter mb-6">
            Free <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E599] to-[#00A1FF]">resources</span> <br/>
            for creators.
          </h1>
          
          <p className="text-lg text-zinc-500 max-w-2xl mx-auto leading-relaxed">
            Download our curated collection of free UI kits, 3D assets, templates, and guides. Built by our studio, free for your next project.
          </p>
        </motion.div>
      </section>

      {/* ── GRID ── */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FREE_RESOURCES.map((resource, index) => (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-3xl p-3 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-[#E2EDE8] group hover:shadow-[0_20px_60px_rgba(36,184,108,0.12)] hover:border-[#24B86C]/40 transition-all duration-500 flex flex-col"
            >
              {/* Thumbnail */}
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-4">
                <Image 
                  src={resource.image} 
                  alt={resource.title} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-700" 
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm flex items-center gap-2">
                  {resource.icon}
                  <span className="text-xs font-bold text-zinc-700">{resource.category}</span>
                </div>
              </div>

              {/* Info */}
              <div className="px-3 pb-3 flex flex-col flex-1">
                <h3 className="text-lg font-black text-[#111111] mb-1 leading-tight line-clamp-1">{resource.title}</h3>
                <p className="text-sm font-medium text-zinc-500 mb-6 flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5" />
                  {resource.downloads} downloads
                </p>

                <div className="mt-auto">
                  <Button className="w-full h-11 rounded-xl bg-[#F0F7F3] hover:bg-[#24B86C] text-[#24B86C] hover:text-white font-bold text-sm transition-all duration-300">
                    Download File
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
