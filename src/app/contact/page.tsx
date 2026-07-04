import React from 'react';
import { ContactSection } from '@/components/ui/ContactSection';

export const metadata = {
  title: 'Contact Us | Design Walla',
  description: 'Get in touch with the Design Walla team.',
};

export default function ContactPage() {
  return (
    <div className="pt-20">
      <ContactSection />
    </div>
  );
}
