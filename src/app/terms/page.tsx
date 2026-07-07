import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const metadata = {
  title: 'Terms and Conditions | Design Walla',
  description: 'Terms and conditions for using Design Walla.',
};

export default function TermsPage() {
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
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#0D1A12] mb-4">Terms & Conditions</h1>
          <p className="text-zinc-500 mb-10 pb-10 border-b border-[#E2EDE8]">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

          <div className="space-y-8 text-zinc-600 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-[#0D1A12] mb-4">1. Introduction</h2>
              <p>Welcome to Design Walla ("we," "our," or "us"). These Terms and Conditions govern your use of our website (designwalla.com), products, and services (collectively, the "Services"). By accessing or using our Services, you agree to be bound by these Terms.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0D1A12] mb-4">2. Intellectual Property Rights</h2>
              <p className="mb-3">Unless otherwise stated, Design Walla and/or its licensors own the intellectual property rights for all material on Design Walla. All intellectual property rights are reserved. You may access this from Design Walla for your own personal use subjected to restrictions set in these terms and conditions.</p>
              <p className="font-semibold text-[#0D1A12] mb-2">You must not:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Republish material from Design Walla without proper licensing</li>
                <li>Sell, rent, or sub-license material from Design Walla</li>
                <li>Reproduce, duplicate or copy material from Design Walla</li>
                <li>Redistribute content from Design Walla (unless content is specifically made for redistribution)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0D1A12] mb-4">3. User Accounts</h2>
              <p>To access certain features of the platform, you may be required to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. We reserve the right to terminate accounts, remove or edit content, or cancel orders at our sole discretion.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0D1A12] mb-4">4. Payments and Subscriptions</h2>
              <p>If you purchase a subscription or any digital assets, you agree to pay the fees specified at the time of purchase. All payments are processed securely through our authorized payment gateways. Subscription fees are billed in advance and are non-refundable except as expressly stated in our Refund Policy.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0D1A12] mb-4">5. Service Modifications</h2>
              <p>We reserve the right to modify or discontinue, temporarily or permanently, the Services (or any part thereof) with or without notice. We shall not be liable to you or to any third party for any modification, price change, suspension, or discontinuance of the Services.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0D1A12] mb-4">6. Limitation of Liability</h2>
              <p>In no event shall Design Walla, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Services.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0D1A12] mb-4">7. Governing Law</h2>
              <p>These Terms shall be governed and construed in accordance with the laws of India. Any disputes arising out of or relating to these Terms will be subject to the exclusive jurisdiction of the courts located in Patna, Bihar, India.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0D1A12] mb-4">8. Contact Us</h2>
              <p className="mb-2">If you have any questions about these Terms, please contact us at:</p>
              <ul className="space-y-1">
                <li><strong>Phone:</strong> +91 8969688709</li>
                <li><strong>Email:</strong> designwalla.co@gmail.com</li>
                <li><strong>Address:</strong> Mahendru Post Office, Patna — 6, India</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
