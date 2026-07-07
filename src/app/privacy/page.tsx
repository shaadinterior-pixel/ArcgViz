import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const metadata = {
  title: 'Privacy Policy | Design Walla',
  description: 'Privacy policy for Design Walla.',
};

export default function PrivacyPage() {
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
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#0D1A12] mb-4">Privacy Policy</h1>
          <p className="text-zinc-500 mb-10 pb-10 border-b border-[#E2EDE8]">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

          <div className="space-y-8 text-zinc-600 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-[#0D1A12] mb-4">1. Introduction</h2>
              <p>At Design Walla, accessible from designwalla.com, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Design Walla and how we use it.</p>
              <p className="mt-3">If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0D1A12] mb-4">2. Information We Collect</h2>
              <p className="mb-3">The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information.</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Account Information:</strong> When you register for an Account, we may ask for your contact information, including items such as name, company name, address, email address, and telephone number.</li>
                <li><strong>Payment Information:</strong> We collect necessary payment details to process transactions securely via our payment partners. We do not store full credit card details on our servers.</li>
                <li><strong>Usage Data:</strong> We automatically collect information on how you interact with our Services, such as IP addresses, browser type, pages visited, and time spent on the site.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0D1A12] mb-4">3. How We Use Your Information</h2>
              <p className="mb-2">We use the information we collect in various ways, including to:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Provide, operate, and maintain our website</li>
                <li>Improve, personalize, and expand our website</li>
                <li>Understand and analyze how you use our website</li>
                <li>Develop new products, services, features, and functionality</li>
                <li>Communicate with you, either directly or through one of our partners, for customer service, to provide you with updates, and for marketing purposes</li>
                <li>Process your transactions and manage your subscriptions</li>
                <li>Find and prevent fraud</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0D1A12] mb-4">4. Cookies and Web Beacons</h2>
              <p>Like any other website, Design Walla uses "cookies". These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0D1A12] mb-4">5. Third-Party Privacy Policies</h2>
              <p>Design Walla's Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their practices and instructions about how to opt-out of certain options.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0D1A12] mb-4">6. Data Security</h2>
              <p>We value your trust in providing us your Personal Information, thus we are striving to use commercially acceptable means of protecting it. But remember that no method of transmission over the internet, or method of electronic storage is 100% secure and reliable, and we cannot guarantee its absolute security.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0D1A12] mb-4">7. Contact Us</h2>
              <p className="mb-2">If you have any questions or suggestions about our Privacy Policy, please contact us:</p>
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
