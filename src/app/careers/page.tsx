import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const metadata = {
  title: 'Careers | Design Walla',
  description: 'Join our team at Design Walla.',
};

export default function CareersPage() {
  return (
    <div className="container mx-auto px-4 py-24 min-h-[70vh] flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
        <Briefcase className="w-8 h-8 text-primary" />
      </div>
      <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Careers</h1>
      <p className="text-xl text-foreground/60 max-w-2xl mb-8">
        We're always looking for talented 3D artists and developers. Check back soon for open positions.
      </p>
      <Link href="/">
        <Button size="lg" className="rounded-full">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Button>
      </Link>
    </div>
  );
}
