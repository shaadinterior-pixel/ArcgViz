import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const metadata = {
  title: 'Cookie Policy | Design Walla',
  description: 'How Design Walla uses cookies to improve your experience.',
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-[#F8FAF9] pt-32 pb-24 relative overflow-hidden">
      {/* Decorative Gradients */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(36,184,108,0.03)_0,transparent_60%)] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(17,153,142,0.03)_0,transparent_60%)] pointer-events-none" />

      <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <Link href="/">
          <Button variant="ghost" className="mb-8 hover:bg-white/60">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </Link>

        <div className="bg-white rounded-[2rem] p-8 md:p-14 shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-[#E2EDE8]">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#0D1A12] mb-4">Cookie Policy</h1>
          <p className="text-zinc-500 mb-10 pb-10 border-b border-[#E2EDE8]">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

          <div className="space-y-8 text-zinc-600 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-[#0D1A12] mb-4">1. What Are Cookies</h2>
              <p>Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work, or work more efficiently, as well as to provide information to the owners of the site.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0D1A12] mb-4">2. How We Use Cookies</h2>
              <p className="mb-3">Design Walla uses cookies for a few different purposes:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Essential Cookies:</strong> Required for core site functionality such as keeping you logged in, remembering items in your cart, and maintaining a secure checkout session.</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and choices (such as display theme) to personalize your experience on future visits.</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website so we can improve performance and content.</li>
                <li><strong>Payment Cookies:</strong> Our payment partners may set cookies necessary to process transactions securely and prevent fraud.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0D1A12] mb-4">3. Third-Party Cookies</h2>
              <p>In some special cases, we also use cookies provided by trusted third parties, such as analytics providers and our payment gateway partner, to help us understand site usage and process payments securely. These third parties have their own privacy and cookie policies governing the use of such cookies.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0D1A12] mb-4">4. Managing Cookies</h2>
              <p>You can control and/or delete cookies as you wish through your browser settings. You can delete all cookies already on your device and set most browsers to prevent them from being placed. If you do this, you may have to manually adjust some preferences every time you visit the site, and some features may not work as intended.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0D1A12] mb-4">5. Changes to This Policy</h2>
              <p>We may update this Cookie Policy from time to time to reflect changes to the cookies we use or for operational, legal, or regulatory reasons. Please revisit this page periodically to stay informed.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0D1A12] mb-4">6. Contact Us</h2>
              <p className="mb-2">If you have any questions about our use of cookies, please contact us:</p>
              <ul className="space-y-1">
                <li><strong>Phone:</strong> +91 8969688709</li>
                <li><strong>Email:</strong> info.designwalla.ss@gmail.com</li>
                <li><strong>Address:</strong> Mahendru Post Office, Patna — 6, India</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
