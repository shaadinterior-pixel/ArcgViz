import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const metadata = {
  title: 'Privacy Policy | ArchViz Market',
  description: 'Our privacy policy and data practices.',
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-24 min-h-[70vh] flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
        <Shield className="w-8 h-8 text-primary" />
      </div>
      <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Privacy Policy</h1>
      <p className="text-xl text-foreground/60 max-w-2xl mb-8">
        Your privacy is important to us. This page will be updated with our full privacy policy soon.
      </p>
      <Link href="/">
        <Button size="lg" className="rounded-full">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Button>
      </Link>
    </div>
  );
}
