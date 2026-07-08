"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { fetchTestimonials, type Testimonial } from '@/lib/store';

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: 'default-1',
    name: "Priya Sharma",
    role: "Founder, Bloom Decor",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    text: "Design Walla transformed our brand identity completely. The quality of the interior 3D renders was beyond our expectations. Absolute professionals!",
    rating: 5,
  },
  {
    id: 'default-2',
    name: "Rahul Verma",
    role: "CEO, TechLaunch",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
    text: "The website template we purchased was so easy to customize. It looks premium and runs incredibly fast. I highly recommend their digital products.",
    rating: 5,
  },
  {
    id: 'default-3',
    name: "Anita Desai",
    role: "Marketing Director",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
    text: "We used their motion graphics for our ad campaign and the engagement doubled! The attention to detail and aesthetic sense is top-notch.",
    rating: 5,
  },
  {
    id: 'default-4',
    name: "Vikram Singh",
    role: "Restaurateur",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    text: "The food cart design they created for us is a crowd magnet. It's functional, beautiful, and exactly what we envisioned. Brilliant team!",
    rating: 5,
  },
  {
    id: 'default-5',
    name: "Neha Gupta",
    role: "Creative Head",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
    text: "I regularly buy their 3D models and brand kits. It saves me hours of work, and the quality is consistently premium. A must-have resource.",
    rating: 5,
  }
];

export function TestimonialSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials()
      .then(data => setTestimonials(data && data.length > 0 ? data : DEFAULT_TESTIMONIALS))
      .catch(() => setTestimonials(DEFAULT_TESTIMONIALS))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-24 bg-[#F8FAF9] flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#24B86C]" />
      </section>
    );
  }

  const displayTestimonials = [...testimonials, ...testimonials, ...testimonials];

  return (
    <section className="py-24 bg-[#F8FAF9] relative overflow-hidden border-t border-[#E2EDE8]">
      {/* Decorative Gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(36,184,108,0.04)_0,transparent_60%)] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[radial-gradient(circle_at_center,rgba(17,153,142,0.04)_0,transparent_60%)] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="container mx-auto px-4 relative z-10 text-center mb-16 gpu-layer"
      >
        <span className="inline-block px-4 py-1.5 rounded-full bg-[#24B86C]/10 text-[#24B86C] text-xs font-bold tracking-widest uppercase mb-4">
          Wall of Love
        </span>
        <h2 className="text-4xl md:text-5xl font-black text-[#111111] tracking-tight mb-4">
          Loved by <span className="text-[#24B86C]">creatives & founders.</span>
        </h2>
        <p className="text-zinc-500 text-lg max-w-2xl mx-auto">
          Don't just take our word for it. Here is what our happy consumers have to say about their experience with Design Walla.
        </p>
      </motion.div>

      <div className="relative w-full overflow-hidden pb-12 flex">
        {/* Left/Right Fade masks for the slider */}
        <div className="absolute inset-y-0 left-0 w-12 md:w-32 bg-gradient-to-r from-[#F8FAF9] to-transparent z-20" />
        <div className="absolute inset-y-0 right-0 w-12 md:w-32 bg-gradient-to-l from-[#F8FAF9] to-transparent z-20" />

        {/* Scrolling Container */}
        <div className="flex animate-marquee md:hover:[animation-play-state:paused]">
          {displayTestimonials.map((testimonial, idx) => (
            <div 
              key={testimonial.id ? `${testimonial.id}-${idx}` : idx} 
              className="w-[340px] md:w-[400px] flex-shrink-0 mx-4 bg-white rounded-3xl p-8 shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-zinc-100 relative group transition-all duration-300 hover:shadow-[0_20px_60px_rgba(36,184,108,0.1)] hover:-translate-y-1"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-[#24B86C]/10 group-hover:text-[#24B86C]/20 transition-colors" />
              
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating || 5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#FFD700] text-[#FFD700]" />
                ))}
              </div>
              
              <p className="text-zinc-700 text-[15px] leading-relaxed mb-8 relative z-10 font-medium">
                "{testimonial.text}"
              </p>
              
              <div className="flex items-center gap-4 mt-auto">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-zinc-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div>
                  <h4 className="font-bold text-[#111111] text-sm">{testimonial.name}</h4>
                  <p className="text-xs text-zinc-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
