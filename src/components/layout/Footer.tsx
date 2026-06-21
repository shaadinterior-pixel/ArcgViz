import React from 'react';
import Link from 'next/link';
import { Box, Twitter, Instagram, Linkedin, Github } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-secondary/20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
      
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-4 lg:col-span-5">
            <Link href="/" className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Box className="w-6 h-6 text-primary" />
              </div>
              <span className="font-bold text-2xl tracking-tight">ArchViz Market</span>
            </Link>
            <p className="text-foreground/60 mb-8 leading-relaxed max-w-sm">
              The world&apos;s most premium digital marketplace for Interior Architecture, ArchViz assets, and PBR materials.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-foreground/60 hover:text-primary hover:scale-110 transition-all duration-300 border border-border/50"><Twitter className="w-4 h-4" /></Link>
              <Link href="#" className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-foreground/60 hover:text-primary hover:scale-110 transition-all duration-300 border border-border/50"><Instagram className="w-4 h-4" /></Link>
              <Link href="#" className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-foreground/60 hover:text-primary hover:scale-110 transition-all duration-300 border border-border/50"><Linkedin className="w-4 h-4" /></Link>
              <Link href="#" className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-foreground/60 hover:text-primary hover:scale-110 transition-all duration-300 border border-border/50"><Github className="w-4 h-4" /></Link>
            </div>
          </div>
          
          <div className="md:col-span-2 lg:col-span-2">
            <h4 className="font-semibold text-lg mb-6">Marketplace</h4>
            <ul className="space-y-4 text-foreground/60">
              <li><Link href="/products" className="hover:text-primary hover:translate-x-1 inline-block transition-transform duration-300">All Products</Link></li>
              <li><Link href="/collections/3d-models" className="hover:text-primary hover:translate-x-1 inline-block transition-transform duration-300">3D Models</Link></li>
              <li><Link href="/collections/textures" className="hover:text-primary hover:translate-x-1 inline-block transition-transform duration-300">PBR Textures</Link></li>
              <li><Link href="/collections/scenes" className="hover:text-primary hover:translate-x-1 inline-block transition-transform duration-300">Interior Scenes</Link></li>
            </ul>
          </div>
          
          <div className="md:col-span-2 lg:col-span-2">
            <h4 className="font-semibold text-lg mb-6">Company</h4>
            <ul className="space-y-4 text-foreground/60">
              <li><Link href="/about" className="hover:text-primary hover:translate-x-1 inline-block transition-transform duration-300">About Us</Link></li>
              <li><Link href="/blog" className="hover:text-primary hover:translate-x-1 inline-block transition-transform duration-300">Blog</Link></li>
              <li><Link href="/careers" className="hover:text-primary hover:translate-x-1 inline-block transition-transform duration-300">Careers</Link></li>
              <li><Link href="/contact" className="hover:text-primary hover:translate-x-1 inline-block transition-transform duration-300">Contact</Link></li>
            </ul>
          </div>
          
          <div className="md:col-span-4 lg:col-span-3">
            <h4 className="font-semibold text-lg mb-6">Newsletter</h4>
            <p className="text-foreground/60 mb-4 text-sm leading-relaxed">
              Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
            </p>
            <div className="flex flex-col space-y-3">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-background border border-border/50 rounded-xl px-4 py-3 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
              />
              <button className="bg-primary text-primary-foreground font-medium rounded-xl px-4 py-3 hover:bg-primary/90 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border/30 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-foreground/50">
          <p>&copy; {new Date().getFullYear()} ArchViz Market. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="/cookies" className="hover:text-primary transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
