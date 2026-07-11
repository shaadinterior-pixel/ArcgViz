"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Twitter, Instagram, Linkedin, Youtube, ArrowRight } from 'lucide-react';

const FOOTER_LINKS = {
  Marketplace: [
    { label: 'All Products', href: '/products' },
    { label: 'Interior Design', href: '/products?category=interior' },
    { label: '3D Models', href: '/products?category=3d' },
    { label: 'Brand Kits', href: '/products?category=branding' },
    { label: 'Website Templates', href: '/products?category=web' },
    { label: 'Motion Graphics', href: '/products?category=motion' },
  ],
  Services: [
    { label: 'Interior Design', href: '/services' },
    { label: 'Digital Marketing', href: '/services' },
    { label: 'Branding & Identity', href: '/services' },
    { label: 'Web Development', href: '/services' },
    { label: 'Hire Our Team', href: '/services' },
  ],
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact', href: '/contact' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Refund Policy', href: '/refund' },
  ],
};

const SOCIALS = [
  { icon: Twitter,   href: '#', label: 'Twitter' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Linkedin,  href: '#', label: 'LinkedIn' },
  { icon: Youtube,   href: '#', label: 'YouTube' },
];

export function Footer() {
  return (
    <footer className="bg-white border-t border-[#E2EDE8] relative overflow-hidden">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#24B86C]/40 to-transparent" />
      {/* Subtle bg orb */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-[radial-gradient(circle_at_center,rgba(36,184,108,0.04)_0,transparent_60%)] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-8 lg:gap-12 py-12 lg:py-16 border-b border-[#E2EDE8]">

          {/* Brand column */}
          <div>
            <Link href="/" className="flex items-center gap-3 mb-6">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-[#E2EDE8]">
                <Image src="/DESIGN_WALLA_LOGO_-removebg-preview.png" alt="Design Walla" fill className="object-contain" />
              </div>
              <div>
                <p className="font-black text-lg leading-none text-[#0D1A12]">
                  DESIGN <span className="bg-gradient-to-r from-[#24B86C] to-[#11998E] bg-clip-text text-transparent">WALLA</span>
                </p>
                <p className="text-[10px] text-[#9CA3AF] mt-0.5">Smart Logon Ka Smart Solution</p>
              </div>
            </Link>

            <p className="text-sm text-[#6B7280] leading-relaxed max-w-xs mb-6">
              India's premium all-in-one design marketplace — Website Templates, Brand Kits, 3D Models, Interior Design, and Digital Products.
            </p>

            {/* Social links */}
            <div className="flex gap-3">
              {SOCIALS.map(({ icon: Icon, href, label }) => (
                <Link
                  key={label} href={href}
                  className="w-9 h-9 rounded-full bg-[#F0F7F3] border border-[#E2EDE8] flex items-center justify-center text-[#6B7280] hover:text-[#24B86C] hover:border-[#24B86C]/30 hover:bg-[#24B86C]/5 hover:scale-110 transition-all duration-200"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4" />
                </Link>
              ))}
            </div>

            {/* Newsletter mini */}
            <div className="mt-8">
              <p className="text-xs font-bold text-[#0D1A12] uppercase tracking-wider mb-3">Get free assets monthly</p>
              <form className="flex gap-2" onSubmit={(e: React.FormEvent<HTMLFormElement>) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 h-10 px-4 text-sm rounded-xl border border-[#E2EDE8] bg-[#F8FAF9] focus:outline-none focus:border-[#24B86C]/50 transition-colors text-[#0D1A12] placeholder:text-[#9CA3AF]"
                />
                <button
                  type="submit"
                  className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#24B86C] to-[#11998E] flex items-center justify-center text-white hover:opacity-90 transition-opacity shadow-sm"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-xs font-black uppercase tracking-[0.18em] text-[#0D1A12] mb-5">{title}</h4>
              <ul className="space-y-3">
                {links.map(link => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#6B7280] hover:text-[#24B86C] hover:translate-x-1 inline-block transition-all duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Bottom bar ── */}
        <div className="flex flex-col md:flex-row items-center justify-between py-6 gap-4 text-xs text-[#9CA3AF] text-center md:text-left">
          <p>&copy; {new Date().getFullYear()} Design Walla. All rights reserved. Made with ♥ in India.</p>
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-[#24B86C] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[#24B86C] transition-colors">Terms of Service</Link>
            <Link href="/refund" className="hover:text-[#24B86C] transition-colors">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
