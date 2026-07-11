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
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-8 py-12 lg:py-16 border-b border-[#E2EDE8]">

          {/* Brand column */}
          <div className="lg:w-[35%] xl:w-[40%] flex flex-col items-center text-center lg:items-start lg:text-left">
            <Link href="/" className="flex flex-col lg:flex-row items-center lg:items-start gap-4 mb-6">
              <div className="relative w-20 h-20 lg:w-12 lg:h-12 rounded-2xl lg:rounded-xl overflow-hidden shadow-sm border border-[#E2EDE8] bg-white">
                <Image src="/DESIGN_WALLA_LOGO_-removebg-preview.png" alt="Design Walla" fill className="object-contain p-1 lg:p-0" />
              </div>
              <div>
                <p className="font-black text-2xl lg:text-xl leading-none text-[#0D1A12]">
                  DESIGN <span className="bg-gradient-to-r from-[#24B86C] to-[#11998E] bg-clip-text text-transparent">WALLA</span>
                </p>
                <p className="text-xs lg:text-[11px] text-[#9CA3AF] mt-1.5 lg:mt-1 font-medium">Smart Logon Ka Smart Solution</p>
              </div>
            </Link>

            <p className="text-sm text-[#6B7280] leading-relaxed max-w-sm lg:max-w-xs mb-8">
              India's premium all-in-one design marketplace — Website Templates, Brand Kits, 3D Models, Interior Design, and Digital Products.
            </p>

            {/* Social links */}
            <div className="flex gap-4 mb-8">
              {SOCIALS.map(({ icon: Icon, href, label }) => (
                <Link
                  key={label} href={href}
                  className="w-11 h-11 lg:w-9 lg:h-9 rounded-full bg-[#F0F7F3] border border-[#E2EDE8] flex items-center justify-center text-[#6B7280] hover:text-[#24B86C] hover:border-[#24B86C]/30 hover:bg-[#24B86C]/5 hover:scale-110 transition-all duration-200"
                  aria-label={label}
                >
                  <Icon className="w-5 h-5 lg:w-4 lg:h-4" />
                </Link>
              ))}
            </div>

            {/* Newsletter mini */}
            <div className="w-full max-w-sm lg:max-w-none lg:w-full">
              <p className="text-xs font-bold text-[#0D1A12] uppercase tracking-wider mb-3">Get free assets monthly</p>
              <form className="flex gap-2" onSubmit={(e: React.FormEvent<HTMLFormElement>) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 h-12 lg:h-10 px-4 text-sm rounded-xl border border-[#E2EDE8] bg-[#F8FAF9] focus:outline-none focus:border-[#24B86C]/50 transition-colors text-[#0D1A12] placeholder:text-[#9CA3AF]"
                />
                <button
                  type="submit"
                  className="h-12 w-12 lg:h-10 lg:w-10 shrink-0 rounded-xl bg-gradient-to-br from-[#24B86C] to-[#11998E] flex items-center justify-center text-white hover:opacity-90 transition-opacity shadow-sm"
                >
                  <ArrowRight className="w-5 h-5 lg:w-4 lg:h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Link columns */}
          <div className="lg:w-[65%] xl:w-[60%] grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-10 text-left">
            {Object.entries(FOOTER_LINKS).map(([title, links]) => (
              <div key={title}>
                <h4 className="text-xs font-black uppercase tracking-[0.18em] text-[#0D1A12] mb-5">{title}</h4>
                <ul className="space-y-3">
                  {links.map(link => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-[15px] lg:text-sm text-[#6B7280] hover:text-[#24B86C] hover:translate-x-1 inline-block transition-all duration-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="flex flex-col md:flex-row items-center justify-between py-6 gap-4 text-xs text-[#9CA3AF] text-center md:text-left">
          <p>
            &copy; {new Date().getFullYear()} Design Walla. All rights reserved.
            <span className="hidden sm:inline"> Made with ♥ in India.</span>
          </p>
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
