"use client";

import React, { useState } from 'react';
import { Truck, UploadCloud, Image as ImageIcon, MessageCircle, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { type Product } from '@/lib/store';

type Props = {
  product: Product;
};

export default function PrintingOrderForm({ product }: Props) {
  const [deliverySpeed, setDeliverySpeed] = useState<'standard' | 'sameday'>('standard');
  const [corners, setCorners] = useState('');
  const [quantity, setQuantity] = useState('100');

  const basePrice = parseInt((product.price || '0').replace(/[^0-9]/g, ''), 10) || 200;
  // Mock pricing logic based on quantity
  const pricingOptions = [
    { qty: '50', unitPrice: (basePrice / 50) * 1.5 },
    { qty: '100', unitPrice: (basePrice / 100) * 1.0 },
    { qty: '250', unitPrice: (basePrice / 250) * 0.9 },
    { qty: '500', unitPrice: (basePrice / 500) * 0.75 },
  ].map(opt => ({
    qty: opt.qty,
    unitPrice: opt.unitPrice < 1 ? 1 : Math.round(opt.unitPrice)
  }));

  const handleWhatsApp = () => {
    const text = `Hi Design Walla! 👋\n\nI need customization for this printing service.\n\n*Product:* ${product.name}\n*Quantity:* ${quantity}\n*Corners:* ${corners || 'Standard'}\n*Delivery:* ${deliverySpeed === 'standard' ? 'Standard' : 'Same Day'}\n*Link:* https://designwalla.com/products/${product.slug || product.id}`;
    window.open(`https://wa.me/918969688709?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleCheckout = () => {
    // Add to cart or direct checkout logic here
    alert(`Proceeding to checkout for ${quantity} units of ${product.name}.`);
  };

  return (
    <div className="flex flex-col gap-5 bg-white border border-[#E2EDE8] rounded-[24px] p-6 shadow-sm w-full">
      
      {/* Delivery Info */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-[14px]">
          <span className="text-zinc-700">Delivery to 110001</span>
          <button className="text-zinc-500 underline text-[13px] hover:text-zinc-800">More information</button>
        </div>
        <div className="flex items-center gap-1.5 text-[#1E995A] font-medium text-[14px]">
          <Truck className="w-4 h-4" />
          <span>21 July</span>
          <span className="text-[#1E995A] font-bold ml-1">FREE</span>
        </div>
      </div>

      {/* Delivery Speed */}
      <div>
        <label className="block text-[14px] font-bold text-[#111111] mb-2">Delivery Speed</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setDeliverySpeed('standard')}
            className={`p-3 rounded-xl border flex items-center justify-center text-center transition-colors text-[13px] font-medium min-h-[60px] ${
              deliverySpeed === 'standard' 
                ? 'bg-[#E0F2FE] border-[#0284C7] text-[#0369A1]' 
                : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300'
            }`}
          >
            Standard
          </button>
          <button
            onClick={() => setDeliverySpeed('sameday')}
            className={`p-3 rounded-xl border flex items-center justify-center text-center transition-colors text-[13px] font-medium min-h-[60px] ${
              deliverySpeed === 'sameday' 
                ? 'bg-[#E0F2FE] border-[#0284C7] text-[#0369A1]' 
                : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300'
            }`}
          >
            Same Day Delivery - Mumbai, Bengaluru, Hyderabad & Kolkata
          </button>
        </div>
      </div>

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

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 mt-2">
        <Button 
          className="w-full h-12 bg-[#7DD3FC] hover:bg-[#38BDF8] text-black font-bold rounded-xl text-[14px] transition-colors flex items-center justify-center shadow-none"
        >
          Browse designs <ImageIcon className="w-4 h-4 ml-2" />
        </Button>
        <Button 
          variant="outline"
          className="w-full h-12 bg-white border-zinc-300 hover:bg-zinc-50 text-[#111111] font-bold rounded-xl text-[14px] transition-colors flex items-center justify-center shadow-none"
        >
          Upload design <UploadCloud className="w-4 h-4 ml-2" />
        </Button>
      </div>

      <div className="w-full h-[1px] bg-zinc-200 my-1"></div>

      {/* Checkout and WhatsApp */}
      <div className="flex flex-col gap-3">
        <Button 
          onClick={handleCheckout}
          className="w-full h-12 bg-[#24B86C] hover:bg-[#1DA05D] text-white font-bold rounded-xl text-[14px] transition-colors flex items-center justify-center shadow-md"
        >
          <ShoppingCart className="w-4 h-4 mr-2" /> Direct Checkout
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
