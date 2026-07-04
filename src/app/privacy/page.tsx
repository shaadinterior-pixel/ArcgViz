import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | Design Walla',
  description: 'Our privacy policy and data practices.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-[#F8FAF9] min-h-screen pt-12 pb-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-[13px] font-bold text-zinc-500 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#111111]">Privacy Policy</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-black text-[#111111] mb-4 tracking-tight">Privacy Policy</h1>
        <p className="text-zinc-500 mb-12">Last updated: July 5, 2026</p>

        <div className="bg-white rounded-3xl p-8 md:p-12 border border-border/50 shadow-sm space-y-8 text-zinc-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-[#111111] mb-4">1. Introduction</h2>
            <p>
              Welcome to Design Walla ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. 
              This privacy policy will inform you as to how we look after your personal data when you visit our marketplace (regardless of where you visit it from) 
              and tell you about your privacy rights and how the law protects you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#111111] mb-4">2. The Data We Collect About You</h2>
            <p className="mb-4">We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
              <li><strong>Contact Data</strong> includes billing address, delivery address, email address and telephone numbers.</li>
              <li><strong>Financial Data</strong> includes bank account and payment card details (processed securely via our payment gateways, Razorpay/Stripe).</li>
              <li><strong>Transaction Data</strong> includes details about payments to and from you and other details of products or services you have purchased from us.</li>
              <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this website.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#111111] mb-4">3. How We Use Your Personal Data</h2>
            <p className="mb-4">We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Where we need to perform the contract we are about to enter into or have entered into with you (e.g., fulfilling an order).</li>
              <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
              <li>Where we need to comply with a legal obligation.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#111111] mb-4">4. Data Security</h2>
            <p>
              We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, 
              altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know. 
              They will only process your personal data on our instructions and they are subject to a duty of confidentiality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#111111] mb-4">5. Your Legal Rights</h2>
            <p className="mb-4">Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Request access to your personal data.</li>
              <li>Request correction of your personal data.</li>
              <li>Request erasure of your personal data.</li>
              <li>Object to processing of your personal data.</li>
              <li>Request restriction of processing your personal data.</li>
              <li>Request transfer of your personal data.</li>
              <li>Right to withdraw consent.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#111111] mb-4">6. Contact Us</h2>
            <p>
              If you have any questions about this privacy policy or our privacy practices, please contact us at:
              <br/><br/>
              <strong>Email:</strong> support@designwalla.com<br/>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
