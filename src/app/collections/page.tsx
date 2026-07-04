import React from 'react';
import Link from 'next/link';
import { ArrowRight, Box } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const metadata = {
  title: 'Curated Collections | Design Walla',
  description: 'Browse our exclusive curated collections of premium 3D assets and interior scenes.',
};

const COLLECTIONS = [
  {
    title: 'Modern Japandi Living',
    items: 45,
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800&h=600',
    slug: 'modern-japandi-living'
  },
  {
    title: 'Brutalist Concrete Textures',
    items: 120,
    image: 'https://images.unsplash.com/photo-1550604169-21b924976c6c?auto=format&fit=crop&q=80&w=800&h=600',
    slug: 'brutalist-concrete'
  },
  {
    title: 'Scandinavian Office Packs',
    items: 85,
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=800&h=600',
    slug: 'scandinavian-office'
  },
  {
    title: 'Luxury Velvet Seating',
    items: 34,
    image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=800&h=600',
    slug: 'luxury-velvet'
  }
];

export default function CollectionsPage() {
  return (
    <div className="container mx-auto px-4 py-24 min-h-screen">
      <div className="flex flex-col items-center text-center mb-16">
        <div className="inline-flex items-center justify-center p-3 glass rounded-2xl mb-6">
          <Box className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">Curated Collections</h1>
        <p className="text-lg text-foreground/70 max-w-2xl">
          Hand-picked assortments of perfectly matched 3D models and materials, designed to work together seamlessly in your next big render.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {COLLECTIONS.map((collection, index) => (
          <Link href={`/collections/${collection.slug}`} key={index}>
            <div className="group relative aspect-[4/3] rounded-3xl overflow-hidden cursor-pointer border border-white/10">
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500 z-10" />
              
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={collection.image} 
                alt={collection.title}
                className="absolute inset-0 w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-20" />
              
              <div className="absolute bottom-0 left-0 w-full p-8 z-30">
                <p className="text-primary font-medium mb-2">{collection.items} Items</p>
                <h2 className="text-3xl font-bold text-white mb-4">{collection.title}</h2>
                <Button variant="outline" className="glass text-white border-white/20 group-hover:bg-primary group-hover:text-black group-hover:border-primary transition-all">
                  View Collection <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
