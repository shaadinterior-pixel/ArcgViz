"use client";

import React, { useState, useEffect } from 'react';
import { CheckCircle2, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchServices } from '@/lib/store';

export type ServiceDetail = {
  id: string;
  title: string;
  category: string;
  image: string;
  tagline: string;
  description: string;
  includes: string[];
};

export const defaultServices: ServiceDetail[] = [
  {
    id: "s1",
    category: "Interior / Exterior Design and Work",
    title: "Interior / Exterior Design and Work",
    tagline: "Spaces that speak. Structures that stay.",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1200",
    description: "End-to-end interior and exterior design & execution for homes, offices, retail, and hospitality. From concept mood-boards to on-site turnkey delivery — we craft spaces that carry your brand's soul.",
    includes: [
      "Residential & Commercial Interiors",
      "Exterior Facade & Landscape",
      "3D Walkthroughs & Renders",
      "Turnkey Execution & Site Handover",
      "Modular Furniture & Fit-outs",
      "Vastu / Feng-shui Aligned Planning"
    ]
  },
  {
    id: "s2",
    category: "3D Model & Product Design",
    title: "3D Modeling & Product Design",
    tagline: "Bringing concepts to life in 3D.",
    image: "https://images.unsplash.com/photo-1618220179428-22790b46a0eb?auto=format&fit=crop&q=80&w=1200",
    description: "High-fidelity 3D modeling for products, architectural visualization, and gaming assets. We deliver photorealistic renders and optimized geometries ready for production.",
    includes: [
      "Photorealistic Product Rendering",
      "Low-poly & High-poly Modeling",
      "Texturing & Material Creation",
      "3D Animation & Rigging",
      "AR/VR Ready Assets"
    ]
  },
  {
    id: "s3",
    category: "Digital Marketing",
    title: "Digital Marketing",
    tagline: "Data-driven growth strategies.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200",
    description: "Comprehensive digital marketing campaigns designed to scale your business. We combine creative storytelling with rigorous data analysis to maximize your ROI.",
    includes: [
      "SEO & Content Marketing",
      "Social Media Management",
      "PPC & Paid Social Campaigns",
      "Email & Retention Strategies",
      "Conversion Rate Optimization"
    ]
  },
  {
    id: "s4",
    category: "Advertisement",
    title: "Strategic Advertisement",
    tagline: "Maximize your reach and impact.",
    image: "https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&q=80&w=1200",
    description: "Targeted advertising campaigns across digital and traditional platforms to maximize your brand's visibility and conversion.",
    includes: [
      "Media Planning & Buying",
      "Print & Outdoor Advertising",
      "Display & Programmatic Ads",
      "Campaign Management",
      "Ad Copy & Creatives"
    ]
  },
  {
    id: "s5",
    category: "Company Branding",
    title: "Company Branding",
    tagline: "Crafting memorable brand stories.",
    image: "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=1200",
    description: "Strategic brand development from the ground up. We create cohesive visual identities, brand guidelines, and positioning strategies that resonate with your target audience.",
    includes: [
      "Logo Design & Visual Identity",
      "Brand Guidelines & Typography",
      "Packaging Design",
      "Brand Voice & Messaging",
      "Stationery & Corporate Assets"
    ]
  },
  {
    id: "s6",
    category: "Website / Apps / Software",
    title: "Website / Apps / Software",
    tagline: "Building scalable digital experiences.",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1200",
    description: "End-to-end development of high-performance websites, web applications, and mobile apps. We focus on intuitive UX, modern tech stacks, and scalable architectures.",
    includes: [
      "UI/UX Design & Prototyping",
      "Full-stack Web Development",
      "iOS & Android Apps",
      "E-commerce Solutions",
      "Custom Software & SaaS"
    ]
  },
  {
    id: "s7",
    category: "Animation",
    title: "2D & 3D Animation",
    tagline: "Bringing stories to life.",
    image: "https://images.unsplash.com/photo-1551269901-5c5e14c25df7?auto=format&fit=crop&q=80&w=1200",
    description: "Captivating animations that explain, entertain, and engage. We produce high-quality 2D and 3D animated content for various industries.",
    includes: [
      "Explainer Videos",
      "Character Animation",
      "Product Animation",
      "Whiteboard Animation",
      "Storyboarding"
    ]
  },
  {
    id: "s8",
    category: "Motion Graphic",
    title: "Motion Graphics",
    tagline: "Movement that captures attention.",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1200",
    description: "Sleek and modern motion graphics to enhance your digital presence. Perfect for social media, presentations, and broadcast.",
    includes: [
      "Title Sequences",
      "Logo Animation",
      "UI/UX Animation",
      "Promotional Videos",
      "Lottie Animations"
    ]
  },
  {
    id: "s9",
    category: "Graphic Design",
    title: "Graphic Design",
    tagline: "Visuals that communicate powerfully.",
    image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=1200",
    description: "Custom graphic design solutions that elevate your brand's aesthetics across all touchpoints, from digital to print.",
    includes: [
      "Social Media Creatives",
      "Brochure & Flyer Design",
      "Infographics",
      "Poster Design",
      "Illustration"
    ]
  },
  {
    id: "s10",
    category: "Video Editing",
    title: "Video Editing",
    tagline: "Crafting cinematic experiences.",
    image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&q=80&w=1200",
    description: "High-end post-production services. We seamlessly cut, color, and polish your raw footage into compelling video content.",
    includes: [
      "Color Grading",
      "Audio Mixing & Mastering",
      "VFX & Compositing",
      "Corporate Video Editing",
      "Social Media Reels"
    ]
  },
  {
    id: "s11",
    category: "Printing Work",
    title: "Printing Work",
    tagline: "Tangible quality you can feel.",
    image: "https://images.unsplash.com/photo-1563968743333-044cef800120?auto=format&fit=crop&q=80&w=1200",
    description: "High-quality offset and digital printing services for all your marketing and corporate needs. We ensure vibrant colors and premium finishes.",
    includes: [
      "Business Cards & Stationery",
      "Brochures & Catalogs",
      "Large Format Printing",
      "Packaging Printing",
      "Merchandise Printing"
    ]
  }
];

export function WhatWeDoSection() {
  const [services, setServices] = useState<ServiceDetail[]>(defaultServices);
  const [activeTab, setActiveTab] = useState(defaultServices[0].id);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const data = await fetchServices();
        if (data && data.length > 0) {
          setServices(data);
          setActiveTab(data[0].id);
        }
      } catch (e) {
        console.error("Failed to load services from Supabase, using defaults", e);
      }
    };
    loadServices();
  }, []);

  const activeService = services.find(s => s.id === activeTab) || services[0];
  const serviceIndex = services.findIndex(s => s.id === activeTab) + 1;

  return (
    <section id="services" className="w-full bg-white/70 backdrop-blur-3xl py-24 relative overflow-hidden border-y border-[#E2EDE8]">
      {/* Decorative Gradients for Translucent effect */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,rgba(36,184,108,0.08)_0,transparent_60%)] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(17,153,142,0.06)_0,transparent_60%)] pointer-events-none" />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Row */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-6 mb-12 gpu-layer"
        >
          <div>
            <div className="inline-block px-4 py-1.5 rounded-full bg-white border border-[#E2EDE8] shadow-sm mb-4">
               <span className="text-[#24B86C] font-semibold text-xs tracking-[0.2em] uppercase">WHAT WE DO</span>
            </div>
            <h2 className="text-6xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-4">
              <span className="text-[#111111]">Eleven crafts</span><br />
              <span className="text-zinc-400">One studio</span>
            </h2>
            <p className="max-w-md text-zinc-500 text-sm font-medium leading-relaxed">
              Tap any service below to reveal its full details — projects, deliverables and how we work.
            </p>
          </div>
        </motion.div>

        {/* Pills Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="flex overflow-x-auto hide-scrollbar gap-3 pb-4 mb-10 w-full"
        >
          {services.map((service) => {
            const isActive = activeTab === service.id;
            return (
              <button
                key={service.id}
                onClick={() => setActiveTab(service.id)}
                className={`shrink-0 whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 border ${
                  isActive 
                    ? 'bg-[#24B86C] border-transparent text-white shadow-[0_8px_20px_rgba(36,184,108,0.25)]' 
                    : 'bg-white backdrop-blur-md border-[#E2EDE8] text-zinc-500 hover:border-[#24B86C]/40 hover:text-[#24B86C]'
                }`}
              >
                {service.category}
              </button>
            );
          })}
        </motion.div>

        {/* Content Area */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 gpu-layer"
        >
          
          {/* Left: Image Card */}
          <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden group shadow-[0_20px_40px_rgba(0,0,0,0.06)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeService.id}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="absolute inset-0"
              >
                <Image
                  src={activeService.image}
                  alt={activeService.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  quality={90}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Image Overlay Text */}
                <div className="absolute bottom-0 left-0 p-8 w-full">
                  <p className="bg-gradient-to-r from-[#24B86C] to-[#11998E] bg-clip-text text-transparent font-bold tracking-widest text-xs uppercase mb-2">
                    SERVICE {String(serviceIndex).padStart(2, '0')}
                  </p>
                  <h3 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2 drop-shadow-md">
                    {activeService.title}
                  </h3>
                  <p className="text-zinc-200 text-sm md:text-base italic font-medium drop-shadow-md">
                    "{activeService.tagline}"
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: Details Card */}
          <div className="bg-white/80 backdrop-blur-2xl border border-[#E2EDE8] rounded-3xl p-8 flex flex-col justify-between shadow-[0_20px_60px_rgba(0,0,0,0.04)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeService.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col h-full"
              >
                <p className="text-zinc-700 text-lg leading-relaxed mb-10">
                  {activeService.description}
                </p>

                <h5 className="text-zinc-500 font-bold text-xs tracking-[0.2em] uppercase mb-6">
                  WHAT'S INCLUDED
                </h5>
                
                <ul className="space-y-4 mb-10 flex-1">
                  {activeService.includes.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#24B86C] shrink-0 mt-0.5" />
                      <span className="text-zinc-800 font-medium text-sm">{item}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={`https://wa.me/918969688709?text=${encodeURIComponent(`Hi Design Walla! 👋\n\nI am interested in your *${activeService.category}* services.\nSpecifically looking to start a *${activeService.title}* project.\n\nWebsite Link: https://designwalla.com\n\nPlease let me know how we can proceed!`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full block"
                >
                  <button className="relative overflow-hidden w-full bg-gradient-to-r from-[#24B86C] to-[#11998E] text-white font-bold py-4 rounded-xl flex items-center justify-between px-6 transition-all duration-300 shadow-[0_8px_30px_rgba(36,184,108,0.25)] group hover:opacity-90 border-0">
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shine" />
                    <span className="relative z-10">Start a {activeService.category} project</span>
                    <ArrowUpRight className="relative z-10 w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
                  </button>
                </a>
              </motion.div>
            </AnimatePresence>
          </div>

        </motion.div>
      </div>
    </section>
  );
}
