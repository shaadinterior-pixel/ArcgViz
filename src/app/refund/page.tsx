import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const metadata = {
  title: 'Refund Policy | Design Walla',
  description: 'Refund policy for Design Walla.',
};

export default function RefundPage() {
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
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#0D1A12] mb-4">Refund Policy</h1>
          <p className="text-zinc-500 mb-10 pb-10 border-b border-[#E2EDE8]">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

          <div className="space-y-8 text-zinc-600 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-[#0D1A12] mb-4">1. Digital Products and Assets</h2>
              <p>Due to the nature of our products as non-tangible, irrevocable digital goods, we generally do not offer refunds once an order is completed and the product download link is provided. As a customer, you are responsible for understanding this upon purchasing any item at our site.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0D1A12] mb-4">2. Exceptions</h2>
              <p className="mb-3">However, we realize that exceptional circumstances can take place. We may honor requests for a refund under the following reasons:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Non-delivery of the product:</strong> Due to some mailing issues or server errors, you might not receive a delivery e-mail from us. In this case, we recommend contacting us for assistance.</li>
                <li><strong>Major defects:</strong> Although all the products are thoroughly tested before release, unexpected errors may occur. You must contact us with a report of the error within 3 days from the date of purchase.</li>
                <li><strong>Product not-as-described:</strong> Such issues must be reported to our technical support within 3 days from the date of purchase. Clear evidence must be provided proving that the purchased product is not as it is described on the website.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0D1A12] mb-4">3. Services and Projects</h2>
              <p>For custom services such as Interior Design, Graphic Design, Web Development, or Branding, a non-refundable upfront deposit is typically required to commence work as outlined in your specific project contract. If a project is cancelled before completion, refunds for the remaining balance will be assessed on a pro-rata basis depending on the amount of work already completed.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0D1A12] mb-4">4. Subscriptions</h2>
              <p>Subscription fees (e.g., Plus or Pro plans) are billed in advance on a monthly or annual basis and are non-refundable for the current billing cycle. You may cancel your subscription at any time, and you will continue to have access to the service through the end of your billing period.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0D1A12] mb-4">5. How to Request a Refund</h2>
              <p className="mb-2">To request a refund under the exceptions listed above, please contact our support team with your order number and detailed reasons for the request. We will review your request within 5-7 business days.</p>
              <ul className="space-y-1">
                <li><strong>Phone:</strong> +91 8969688709</li>
                <li><strong>Email:</strong> designwalla.co@gmail.com</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
