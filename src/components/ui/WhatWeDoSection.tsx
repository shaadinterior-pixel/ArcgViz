"use client";

import React, { useState } from 'react';
import { CheckCircle2, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
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
    category: "Interior & Exterior",
    title: "Interior / Exterior Design",
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
    category: "3D & Product",
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
    title: "Performance & Brand Marketing",
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
    category: "Branding",
    title: "Corporate Identity & Branding",
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
    id: "s5",
    category: "Web / App / Software",
    title: "Digital Product Development",
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
    <section className="w-full bg-[#050505] text-white py-24 relative overflow-hidden">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Row */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-12">
          <div>
            <h4 className="text-[#FF4500] font-bold text-sm tracking-[0.2em] uppercase mb-4">WHAT WE DO</h4>
            <h2 className="text-6xl md:text-7xl font-black tracking-tight leading-[0.9]">
              <span className="text-white">Ten crafts.</span><br />
              <span className="text-zinc-600">One studio.</span>
            </h2>
          </div>
          <p className="max-w-sm text-zinc-400 text-sm md:text-base leading-relaxed">
            Tap any service below to reveal its full details — projects, deliverables and how we work.
          </p>
        </div>

        {/* Pills Navigation */}
        <div className="flex overflow-x-auto hide-scrollbar gap-3 pb-4 mb-10 w-full">
          {services.map((service) => {
            const isActive = activeTab === service.id;
            return (
              <button
                key={service.id}
                onClick={() => setActiveTab(service.id)}
                className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 border ${
                  isActive 
                    ? 'bg-[#FF4500] border-[#FF4500] text-white' 
                    : 'bg-transparent border-zinc-800 text-zinc-300 hover:border-zinc-500'
                }`}
              >
                {service.category}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8">
          
          {/* Left: Image Card */}
          <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden group">
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
                  <p className="text-[#FF4500] font-bold tracking-widest text-xs uppercase mb-2">
                    SERVICE {String(serviceIndex).padStart(2, '0')}
                  </p>
                  <h3 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
                    {activeService.title}
                  </h3>
                  <p className="text-zinc-300 text-sm md:text-base italic font-medium">
                    "{activeService.tagline}"
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: Details Card */}
          <div className="bg-[#111111] border border-[#222222] rounded-3xl p-8 flex flex-col justify-between">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeService.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col h-full"
              >
                <p className="text-zinc-300 text-lg leading-relaxed mb-10">
                  {activeService.description}
                </p>

                <h5 className="text-zinc-500 font-bold text-xs tracking-[0.2em] uppercase mb-6">
                  WHAT'S INCLUDED
                </h5>
                
                <ul className="space-y-4 mb-10 flex-1">
                  {activeService.includes.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#FF4500] shrink-0 mt-0.5" />
                      <span className="text-zinc-300 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>

                <button className="w-full bg-[#FF4500] hover:bg-[#E63E00] text-white font-bold py-4 rounded-xl flex items-center justify-between px-6 transition-colors duration-300">
                  <span>Start a {activeService.category} project</span>
                  <ArrowUpRight className="w-5 h-5" />
                </button>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
}
