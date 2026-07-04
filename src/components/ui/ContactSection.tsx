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
    const waNumber = '919999999999'; 
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
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-[#24B86C]/10 to-transparent rounded-full filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-[#11998E]/10 to-transparent rounded-full filter blur-[100px] pointer-events-none" />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column - Info */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} 
            transition={{ duration: 0.6 }}
            className="flex flex-col space-y-8"
          >
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full bg-[#24B86C]/10 text-[#24B86C] text-xs font-bold tracking-widest uppercase mb-4">
                Let's Talk
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#0D1A12] tracking-tight leading-[1.1] mb-6">
                Ready to bring your <br />
                <span className="bg-gradient-to-r from-[#24B86C] to-[#11998E] bg-clip-text text-transparent">vision to life?</span>
              </h2>
              <p className="text-lg text-[#6B7280] leading-relaxed max-w-md">
                Whether you need a complete branding kit, stunning interior visualizations, or a high-performance website, our experts are here to help. Drop us a line!
              </p>
            </div>

            <div className="space-y-6 pt-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white border border-[#E2EDE8] shadow-sm flex items-center justify-center shrink-0 text-[#24B86C]">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0D1A12]">Email Us</p>
                  <p className="text-[#6B7280] mt-1">hello@designwalla.com</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white border border-[#E2EDE8] shadow-sm flex items-center justify-center shrink-0 text-[#24B86C]">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0D1A12]">Call or WhatsApp</p>
                  <p className="text-[#6B7280] mt-1">+91 999 999 9999</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white border border-[#E2EDE8] shadow-sm flex items-center justify-center shrink-0 text-[#24B86C]">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0D1A12]">Our Studio</p>
                  <p className="text-[#6B7280] mt-1 max-w-[200px]">Design Walla HQ, Mumbai, Maharashtra, India</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Form */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} 
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-white/80 backdrop-blur-xl border border-[#E2EDE8] rounded-3xl p-8 md:p-10 shadow-[0_20px_60px_rgba(36,184,108,0.1)]">
              <h3 className="text-2xl font-black text-[#0D1A12] mb-6">Send a Message</h3>
              
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wide text-[#6B7280]">Your Name</label>
                    <input 
                      type="text" name="name" 
                      value={formData.name} onChange={handleChange}
                      className="w-full h-12 px-4 rounded-xl border border-[#E2EDE8] bg-[#F8FAF9] focus:outline-none focus:border-[#24B86C] focus:ring-1 focus:ring-[#24B86C] transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wide text-[#6B7280]">Phone Number</label>
                    <input 
                      type="tel" name="phone" 
                      value={formData.phone} onChange={handleChange}
                      className="w-full h-12 px-4 rounded-xl border border-[#E2EDE8] bg-[#F8FAF9] focus:outline-none focus:border-[#24B86C] focus:ring-1 focus:ring-[#24B86C] transition-all"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-[#6B7280]">Service Needed</label>
                  <select 
                    name="service" 
                    value={formData.service} onChange={handleChange}
                    className="w-full h-12 px-4 rounded-xl border border-[#E2EDE8] bg-[#F8FAF9] focus:outline-none focus:border-[#24B86C] focus:ring-1 focus:ring-[#24B86C] transition-all appearance-none"
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

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-[#6B7280]">Project Details</label>
                  <textarea 
                    name="message" 
                    rows={4}
                    value={formData.message} onChange={handleChange}
                    className="w-full p-4 rounded-xl border border-[#E2EDE8] bg-[#F8FAF9] focus:outline-none focus:border-[#24B86C] focus:ring-1 focus:ring-[#24B86C] transition-all resize-none"
                    placeholder="Tell us a bit about what you're looking to achieve..."
                  />
                </div>

                <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer" className="w-full">
                    <Button className="w-full h-14 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:opacity-90 text-white font-bold shadow-lg shadow-[#25D366]/30 border-0 flex items-center justify-center gap-2 transition-transform active:scale-95">
                      <MessageCircle className="w-5 h-5" />
                      Send via WhatsApp
                    </Button>
                  </a>
                  
                  <a href={getMailtoLink()} className="w-full">
                    <Button variant="outline" className="w-full h-14 rounded-xl border-2 border-[#E2EDE8] hover:border-[#24B86C] hover:bg-[#24B86C]/5 text-[#0D1A12] font-bold flex items-center justify-center gap-2 transition-all active:scale-95">
                      <Send className="w-5 h-5 text-[#24B86C]" />
                      Send via Email
                    </Button>
                  </a>
                </div>
                
                <p className="text-center text-xs text-[#9CA3AF] mt-4">
                  By submitting, you agree to our privacy policy. We typically respond within 24 hours.
                </p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
