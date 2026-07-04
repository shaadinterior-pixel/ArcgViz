import React from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Star, Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import HireOurTeamSection from '@/components/ui/HireOurTeamSection';
import { ContactSection } from '@/components/ui/ContactSection';

export const metadata = {
  title: 'Hire Design Walla Studio | 3D & ArchViz Services',
  description: 'Hire our top 1% 3D artists and interior designers for your next big project.',
};

export default function HireUsPage() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-foreground/60 hover:text-primary transition-colors mb-12">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
      </div>

      <HireOurTeamSection />

      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">Why Partner With Us?</h2>
          <p className="text-lg text-foreground/70 mb-12">Our studio doesn't just deliver files; we deliver production-ready, highly optimized assets that slide right into your pipeline.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            {[
              { title: "Industry Experts", desc: "Our leads have 10+ years experience in AAA gaming and high-end ArchViz." },
              { title: "Quality Assurance", desc: "Every asset passes a strict 12-point QA process before delivery." },
              { title: "Pipeline Integration", desc: "We provide assets specifically tuned for Unreal Engine, Unity, Blender, or 3ds Max." },
              { title: "Dedicated Support", desc: "You get a dedicated project manager ensuring smooth communication across timezones." }
            ].map((item, i) => (
              <div key={i} className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                <CheckCircle2 className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-foreground/70">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ContactSection />
    </div>
  );
}
