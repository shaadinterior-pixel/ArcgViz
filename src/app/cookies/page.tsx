import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Cookie } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const metadata = {
  title: 'Cookie Policy | Design Walla',
  description: 'How we use cookies to improve your experience.',
};

export default function CookiesPage() {
  return (
    <div className="container mx-auto px-4 py-24 min-h-[70vh] flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
        <Cookie className="w-8 h-8 text-primary" />
      </div>
      <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Cookie Policy</h1>
      <p className="text-xl text-foreground/60 max-w-2xl mb-8">
        We use cookies to ensure you get the best experience on our website. Read our full cookie policy here soon.
      </p>
      <Link href="/">
        <Button size="lg" className="rounded-full">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Button>
      </Link>
    </div>
  );
}
