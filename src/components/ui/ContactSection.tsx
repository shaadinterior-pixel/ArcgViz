"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    service: 'Interior Design',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const getWhatsAppLink = () => {
    const waNumber = '918969688709'; 
    const text = `Hi Design Walla! 👋\n\n*Name:* ${formData.name}\n*Phone:* ${formData.phone}\n*Service Required:* ${formData.service}\n\n*Message:*\n${formData.message}`;
    return `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;
  };

  const getMailtoLink = () => {
    const email = 'hello@designwalla.com';
    const subject = `New Inquiry: ${formData.service} from ${formData.name}`;
    const body = `Name: ${formData.name}\nPhone: ${formData.phone}\nService Required: ${formData.service}\n\nMessage:\n${formData.message}`;
    return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <section className="bg-[#F8FAF9] py-24 relative overflow-hidden border-t border-[#E2EDE8]">
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(36,184,108,0.04)_0,transparent_60%)] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(17,153,142,0.04)_0,transparent_60%)] pointer-events-none" />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-20 items-center">
          
          {/* Left Column - Info */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }} 
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }} 
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col space-y-8 gpu-layer"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-zinc-200 bg-white shadow-sm mb-6">
                <MessageCircle className="w-3.5 h-3.5 text-[#24B86C]" />
                <span className="text-[13px] font-medium text-zinc-600">We reply within 30 minutes</span>
              </div>
              <h2 className="text-[3.5rem] md:text-[4.5rem] lg:text-[5rem] font-bold text-[#111111] tracking-tight leading-[1] mb-6">
                Let's build<br />
                something<br />
                <span className="text-brand-gradient">amazing together</span>
              </h2>
              <p className="text-[17px] text-zinc-500 leading-relaxed max-w-[420px]">
                Tell us what you need — interior, branding, a website, a printing run, or a full launch. We'll come back with a tailored plan.
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-4 max-w-md">
              <div className="flex items-center gap-4 p-4 rounded-3xl bg-white border border-zinc-100 shadow-sm transition-all hover:shadow-md">
                <div className="w-10 h-10 rounded-full bg-[#24B86C]/10 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-[#24B86C]" />
                </div>
                <span className="font-bold text-[15px] text-zinc-800">+91 8969688709</span>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-3xl bg-white border border-zinc-100 shadow-sm transition-all hover:shadow-md">
                <div className="w-10 h-10 rounded-full bg-[#24B86C]/10 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-[#24B86C]" />
                </div>
                <span className="font-bold text-[15px] text-zinc-800">designwalla.co@gmail.com</span>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-3xl bg-white border border-zinc-100 shadow-sm transition-all hover:shadow-md">
                <div className="w-10 h-10 rounded-full bg-[#24B86C]/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-[#24B86C]" />
                </div>
                <span className="font-bold text-[15px] text-zinc-800">Mahendru Post Office, Patna — 6</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Form */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }} 
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }} 
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="gpu-layer"
          >
            <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_20px_80px_rgba(0,0,0,0.06)] border border-black/[0.02]">
              <h3 className="text-[26px] font-bold text-[#111111] mb-1">Quick quote</h3>
              <p className="text-[15px] text-zinc-500 mb-8">Fill this in — you'll hear back today.</p>
              
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">FULL NAME</label>
                  <input 
                    type="text" name="name" 
                    value={formData.name} onChange={handleChange}
                    className="w-full h-12 px-5 rounded-full border border-zinc-200 focus:outline-none focus:border-[#24B86C] transition-all text-sm"
                    placeholder="Ada Lovelace"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">EMAIL</label>
                    <input 
                      type="email" name="email" 
                      className="w-full h-12 px-5 rounded-full border border-zinc-200 focus:outline-none focus:border-[#24B86C] transition-all text-sm"
                      placeholder="you@brand.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">PHONE</label>
                    <input 
                      type="tel" name="phone" 
                      value={formData.phone} onChange={handleChange}
                      className="w-full h-12 px-5 rounded-full border border-zinc-200 focus:outline-none focus:border-[#24B86C] transition-all text-sm"
                      placeholder="+91 ..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">SERVICE</label>
                  <select 
                    name="service" 
                    value={formData.service} onChange={handleChange}
                    className="w-full h-12 px-5 rounded-full border border-zinc-200 focus:outline-none focus:border-[#24B86C] transition-all appearance-none text-sm bg-white"
                  >
                    <option>Interior Design</option>
                    <option>Food Cart Design</option>
                    <option>Website Templates</option>
                    <option>Brand Kits</option>
                    <option>3D Models</option>
                    <option>Motion Graphics</option>
                    <option>Digital Marketing</option>
                    <option>Other / General Inquiry</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">TELL US ABOUT YOUR PROJECT</label>
                  <textarea 
                    name="message" 
                    rows={4}
                    value={formData.message} onChange={handleChange}
                    className="w-full p-5 rounded-[1.5rem] border border-zinc-200 focus:outline-none focus:border-[#24B86C] transition-all resize-none text-sm"
                    placeholder="Timeline, budget, references..."
                  />
                </div>

                <div className="pt-2">
                  <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer" className="w-full block">
                    <Button className="w-full h-12 rounded-full bg-[#24B86C] hover:bg-[#1fa35f] text-white font-bold transition-all active:scale-[0.98] border-0 text-sm">
                      Request a quote
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
