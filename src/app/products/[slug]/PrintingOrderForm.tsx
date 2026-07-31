"use client";

import React, { useState } from 'react';
import { Truck, UploadCloud, Image as ImageIcon, MessageCircle, ShoppingCart, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { type Product } from '@/lib/store';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { computeTotals, parsePriceInr, formatInr } from '@/lib/pricing';
import { startRazorpayCheckout } from '@/lib/razorpay-checkout';

type Props = {
  product: Product;
};

export default function PrintingOrderForm({ product }: Props) {
  const [corners, setCorners] = useState('');
  const [quantity, setQuantity] = useState('100');
  const [uploading, setUploading] = useState(false);
  const [designUrl, setDesignUrl] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [paySuccess, setPaySuccess] = useState<string | null>(null);

  const basePrice = parsePriceInr(product.price);
  const pricingOptions = ['50', '100', '250', '500'].map(qty => ({ qty, unitPrice: basePrice }));

  // Preview only — the server re-prices from Supabase before charging.
  const totals = computeTotals(basePrice * (parseInt(quantity, 10) || 0));

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData(); 
      fd.append('file', file);
      const res = await fetch('/api/upload', {method:'POST', body:fd});
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      if (data.secure_url) {
        setDesignUrl(data.secure_url);
      } else {
        throw new Error('No URL returned');
      }
    } catch {
      setPayError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const submitOrderToDB = async (type: 'checkout' | 'whatsapp') => {
    try {
      const ref = await addDoc(collection(db, 'printing_orders'), {
        productName: product.name,
        productId: product.id,
        slug: product.slug,
        quantity,
        corners: corners || 'Standard',
        customerName,
        address,
        designUrl,
        type,
        // 'checkout' orders start unpaid and are marked paid once Razorpay confirms.
        paymentStatus: type === 'checkout' ? 'pending' : 'not_required',
        createdAt: serverTimestamp(),
      });
      return ref.id;
    } catch (e) {
      console.error('Error saving printing order:', e);
      return null;
    }
  };

  const handleWhatsApp = async () => {
    if (!customerName.trim() || !address.trim()) {
      setPayError('Please fill in your Name/Company Name and Address before proceeding.');
      return;
    }
    setPayError(null);
    await submitOrderToDB('whatsapp');
    let text = `Hi Design Walla! 👋\n\nI need customization for this printing service.\n\n*Product:* ${product.name}\n*Quantity:* ${quantity}\n*Corners:* ${corners || 'Standard'}\n*Name/Company:* ${customerName}\n*Address:* ${address}\n*Link:* https://designwalla.com/products/${product.slug || product.id}`;
    if (designUrl) {
      text += `\n\n*My Uploaded Logo/Photo:* ${designUrl}`;
    }
    window.open(`https://wa.me/918969688709?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleCheckout = async () => {
    if (!customerName.trim() || !address.trim()) {
      setPayError('Please fill in your Name/Company Name and Address before proceeding.');
      return;
    }
    if (basePrice <= 0) {
      setPayError('This product has no price set. Please use "Discuss Customization" instead.');
      return;
    }

    setPaying(true);
    setPayError(null);
    setPaySuccess(null);

    let orderDocId: string | null = null;
    try {
      const { getCurrentUser } = await import('@/lib/auth');
      const user = await getCurrentUser();

      orderDocId = await submitOrderToDB('checkout');

      const result = await startRazorpayCheckout({
        // Only the id and quantity are sent — the server prices it from Supabase.
        items: [{ productId: product.id, quantity: parseInt(quantity, 10) || 1 }],
        kind: 'printing',
        description: `${quantity} × ${product.name}`,
        prefill: {
          name: customerName || user?.displayName || undefined,
          email: user?.email || undefined,
        },
        idToken: user ? await user.getIdToken() : undefined,
      });

      if (result.status === 'success') {
        if (orderDocId) {
          await updateDoc(doc(db, 'printing_orders', orderDocId), {
            paymentStatus: 'paid',
            razorpayOrderId: result.orderId,
            razorpayPaymentId: result.paymentId,
            amountInr: result.amountInr ?? null,
            paidAt: serverTimestamp(),
          }).catch(e => console.error('Could not mark printing order paid:', e));
        }
        setPaySuccess(result.warning || `Payment received! We will start printing ${quantity} × ${product.name} and ship it to your address.`);
      } else if (result.status === 'failed') {
        setPayError(result.message);
      }
      // 'dismissed' → user closed the modal; the pending order stays for follow-up.
    } catch (e) {
      setPayError(e instanceof Error ? e.message : 'Checkout could not be started.');
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 bg-white border border-[#E2EDE8] rounded-[24px] p-6 shadow-sm w-full">
      


      {/* Corners */}
      <div>
        <label className="block text-[14px] font-bold text-[#111111] mb-2">Corners</label>
        <select 
          value={corners}
          onChange={(e) => setCorners(e.target.value)}
          className="w-full p-3 rounded-xl border border-zinc-300 bg-white text-[14px] text-zinc-800 focus:outline-none focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7]"
        >
          <option value="" disabled>Select...</option>
          <option value="standard">Standard (Square)</option>
          <option value="rounded">Rounded</option>
        </select>
      </div>

      {/* Quantity */}
      <div>
        <label className="block text-[14px] font-bold text-[#111111] mb-2">Quantity</label>
        <select 
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-full p-3 rounded-xl border border-zinc-300 bg-white text-[14px] text-zinc-800 focus:outline-none focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7]"
        >
          {pricingOptions.map(opt => (
            <option key={opt.qty} value={opt.qty}>
              {opt.qty} (₹{opt.unitPrice.toFixed(2)} / unit)
            </option>
          ))}
        </select>
      </div>

      {/* Name and File Upload */}
      <div className="flex flex-col gap-3 mt-2">
        <label className="block text-[14px] font-bold text-[#111111]">Name / Company Name <span className="text-red-500">*</span></label>
        <p className="text-[12px] text-zinc-500 -mt-2">Enter the name exactly as it should be printed on the card.</p>
        <input 
          type="text" 
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="e.g. Design Walla or John Doe" 
          className="w-full p-3 rounded-xl border border-zinc-300 bg-white text-[14px] text-zinc-800 focus:outline-none focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7]"
        />


        <label 
          className={`w-full h-12 border border-zinc-300 font-bold rounded-xl text-[14px] transition-colors flex items-center justify-center cursor-pointer shadow-none ${
            designUrl ? 'bg-[#E2EDE8] text-[#1E995A] border-[#24B86C]' : 'bg-white hover:bg-zinc-50 text-[#111111]'
          } ${uploading ? 'opacity-70 pointer-events-none' : ''}`}
        >
          {uploading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Uploading...</>
          ) : designUrl ? (
            <><CheckCircle2 className="w-4 h-4 mr-2" /> Logo / Photo Uploaded</>
          ) : (
            <>Upload Company Logo / Personal Photo <UploadCloud className="w-4 h-4 ml-2" /></>
          )}
          <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      {/* Address */}
      <div className="flex flex-col gap-2 mt-2">
        <label className="block text-[14px] font-bold text-[#111111]">Delivery Address <span className="text-red-500">*</span></label>
        <textarea 
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter full delivery address..."
          className="w-full p-3 rounded-xl border border-zinc-300 bg-white text-[14px] text-zinc-800 focus:outline-none focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7] resize-none h-24"
        ></textarea>
      </div>

      <div className="w-full h-[1px] bg-zinc-200 my-1"></div>

      {/* Price breakdown */}
      {basePrice > 0 && (
        <div className="bg-[#F8FAF9] border border-[#E2EDE8] rounded-xl p-4 text-[13px]">
          <div className="flex justify-between text-zinc-600 mb-1.5">
            <span>{quantity} × {formatInr(basePrice)}</span>
            <span className="font-medium">{formatInr(totals.subtotalInr)}</span>
          </div>
          <div className="flex justify-between text-zinc-600 mb-2.5">
            <span>GST (18%)</span>
            <span className="font-medium">{formatInr(totals.taxInr)}</span>
          </div>
          <div className="flex justify-between font-black text-[#111111] text-[15px] pt-2.5 border-t border-[#E2EDE8]">
            <span>Total</span>
            <span>{formatInr(totals.totalInr)}</span>
          </div>
        </div>
      )}

      {paySuccess && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-[13px] font-medium text-green-700">
          {paySuccess}
        </div>
      )}
      {payError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-600">
          {payError}
        </div>
      )}

      {/* Checkout and WhatsApp */}
      <div className="flex flex-col gap-3">
        <Button
          onClick={handleCheckout}
          disabled={paying}
          className="w-full h-12 bg-[#24B86C] hover:bg-[#1DA05D] text-white font-bold rounded-xl text-[14px] transition-colors flex items-center justify-center shadow-md"
        >
          {paying ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Opening checkout…</>
          ) : (
            <><ShoppingCart className="w-4 h-4 mr-2" /> Pay {basePrice > 0 ? formatInr(totals.totalInr) : 'Now'}</>
          )}
        </Button>
        <Button 
          onClick={handleWhatsApp}
          variant="outline"
          className="w-full h-12 border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10 font-bold rounded-xl text-[14px] transition-colors flex items-center justify-center"
        >
          <MessageCircle className="w-4 h-4 mr-2" /> Discuss Customization
        </Button>
      </div>

    </div>
  );
}
