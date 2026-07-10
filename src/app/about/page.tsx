import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const metadata = {
  title: 'About Design Walla | Premium 3D Assets',
  description: 'Learn more about Design Walla and our mission to provide world-class 3D assets.',
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-32 max-w-7xl min-h-[80vh] flex flex-col justify-center">
      <Link href="/">
        <Button variant="ghost" className="mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Button>
      </Link>
      
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-8">About Design Walla</h1>
      
      <div className="prose prose-invert prose-lg max-w-none text-foreground/80 space-y-6">
        <p>
          Design Walla was created with a single mission: to provide architects, 3D artists, and interior designers with the highest quality, most production-ready assets available on the market today.
        </p>
        <p>
          We know that in architectural visualization, the details matter. That's why every model, every PBR texture, and every complete scene in our marketplace goes through a rigorous quality assurance process. We ensure that our assets are optimized for rendering engines like V-Ray, Corona, and Cycles, saving you hours of setup time.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12 not-prose">
          <div className="glass p-8 rounded-2xl border border-white/5 bg-secondary/50">
            <h3 className="text-2xl font-bold mb-4 text-white">Quality First</h3>
            <p className="text-foreground/70">No shortcuts. We accept only photorealistic, high-resolution textures and perfectly topologized models.</p>
          </div>
          <div className="glass p-8 rounded-2xl border border-white/5 bg-secondary/50">
            <h3 className="text-2xl font-bold mb-4 text-white">Artist Centric</h3>
            <p className="text-foreground/70">Built by artists, for artists. We provide fair compensation to our top creators.</p>
          </div>
        </div>
        <p>
          Whether you are rendering a small living room or a massive commercial complex, our library is designed to elevate your final renders from good to breathtaking. Welcome to the future of 3D interior design.
        </p>
      </div>
    </div>
  );
}
