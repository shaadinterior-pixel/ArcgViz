import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const metadata = {
  title: 'Shipping & Delivery Policy | Design Walla',
  description: 'Shipping and delivery policy for Design Walla digital products and services.',
};

export default function ShippingPage() {
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
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#0D1A12] mb-4">Shipping & Delivery Policy</h1>
          <p className="text-zinc-500 mb-10 pb-10 border-b border-[#E2EDE8]">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

          <div className="space-y-8 text-zinc-600 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-[#0D1A12] mb-4">1. Digital Products</h2>
              <p>Design Walla primarily sells digital, downloadable assets (3D models, textures, brand kits, website templates, and other digital files). There is no physical shipping involved for these products. Once your payment is successfully processed, your purchase is delivered instantly via a download link made available in your account dashboard and, in most cases, also sent to your registered email address.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0D1A12] mb-4">2. Delivery Timelines</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Digital Downloads & Subscriptions:</strong> Delivered instantly (within minutes) after successful payment confirmation.</li>
                <li><strong>Design & Development Services:</strong> Interior Design, Branding, Web Development, and Digital Marketing engagements are delivered digitally (files, project handover, or live deployment) according to the timeline agreed upon in your project scope or contract.</li>
                <li><strong>Printing Work:</strong> For services involving physical printed output, production and dispatch typically take 3–7 business days depending on order complexity and quantity, followed by courier delivery which may take an additional 2–7 business days depending on your location within India. Estimated timelines will be confirmed with you at the time of order.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0D1A12] mb-4">3. Delivery Method</h2>
              <p>Digital files are delivered through your Design Walla account and email. Physical items (such as printed materials) are shipped via a reputable third-party courier partner to the address you provide at checkout. You will receive tracking information, where applicable, once your order has been dispatched.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0D1A12] mb-4">4. Non-Delivery or Delays</h2>
              <p>If you do not receive your digital download link within 30 minutes of a successful payment, or if a physical shipment is delayed beyond the estimated timeline, please contact our support team with your order number so we can investigate and resolve the issue promptly.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0D1A12] mb-4">5. Shipping Charges</h2>
              <p>There are no shipping charges for digital products. Any applicable shipping or courier charges for physical printing orders will be clearly communicated and included in your order total before you complete payment.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0D1A12] mb-4">6. Contact Us</h2>
              <p className="mb-2">For any questions about delivery of your order, please contact us:</p>
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
