"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Trash2, ArrowRight, ShieldCheck, CreditCard, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Mock data for UI presentation
const MOCK_CART = [
  {
    id: '1',
    name: 'Modern Minimalist Living Room',
    author: 'ArchViz Studio',
    price: 3499,
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=600&h=400',
    category: 'Interior Scenes'
  },
  {
    id: '3',
    name: 'Premium Concrete PBR',
    author: 'TextureMaster',
    price: 1999,
    image: 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&q=80&w=600&h=400',
    category: 'PBR Materials'
  }
];

export default function CartPage() {
  const [cartItems, setCartItems] = useState(MOCK_CART);

  const removeItem = (id: string) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price, 0);
  const tax = Math.round(subtotal * 0.18); // 18% GST mock
  const total = subtotal + tax;

  return (
    <div className="container mx-auto px-4 py-12 min-h-[80vh]">
      <div className="flex items-center text-sm text-foreground/50 mb-8">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-foreground">Shopping Cart</span>
      </div>

      <h1 className="text-4xl font-bold tracking-tight mb-8">Your Cart</h1>

      {cartItems.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border/50 rounded-3xl bg-secondary/10"
        >
          <div className="w-24 h-24 bg-secondary/50 rounded-full flex items-center justify-center mb-6">
            <ShoppingCartIcon className="w-10 h-10 text-foreground/40" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Your cart is empty</h2>
          <p className="text-foreground/60 max-w-md mb-8">Looks like you haven't added any 3D assets to your cart yet. Explore our marketplace to find premium models and textures.</p>
          <Link href="/products">
            <Button size="lg" className="rounded-full px-8">
              Explore Marketplace
            </Button>
          </Link>
        </motion.div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Cart Items */}
          <div className="flex-1 space-y-6">
            <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-border/50 text-sm font-medium text-foreground/60">
              <div className="col-span-8">Product</div>
              <div className="col-span-3 text-right">Price</div>
              <div className="col-span-1"></div>
            </div>

            <div className="space-y-6">
              {cartItems.map((item, index) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-4 md:p-0 bg-secondary/20 md:bg-transparent rounded-2xl md:rounded-none border border-border/50 md:border-none pb-0 md:pb-6 md:border-b md:border-border/20"
                >
                  <div className="col-span-1 md:col-span-8 flex items-center gap-6">
                    <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden shrink-0 border border-border/50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-primary mb-1 uppercase tracking-wider">{item.category}</div>
                      <h3 className="text-lg md:text-xl font-semibold mb-1 line-clamp-2">{item.name}</h3>
                      <p className="text-sm text-foreground/60">by {item.author}</p>
                    </div>
                  </div>
                  
                  <div className="col-span-1 md:col-span-3 flex justify-between md:justify-end items-center mt-4 md:mt-0 border-t border-border/50 md:border-none pt-4 md:pt-0">
                    <span className="md:hidden text-foreground/60 text-sm font-medium">Price:</span>
                    <span className="text-xl font-bold">₹{item.price.toLocaleString('en-IN')}</span>
                  </div>
                  
                  <div className="col-span-1 flex justify-end absolute md:relative top-4 right-4 md:top-auto md:right-auto">
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-foreground/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-[400px] shrink-0">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-secondary/20 border border-border/50 rounded-3xl p-8 sticky top-24"
            >
              <h3 className="text-xl font-bold mb-6 border-b border-border/50 pb-4">Order Summary</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-foreground/80">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span className="font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-foreground/80">
                  <span>Estimated Tax (18%)</span>
                  <span className="font-medium">₹{tax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-foreground/80">
                  <span>Discount</span>
                  <span className="font-medium text-green-500">- ₹0</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-2xl font-bold border-t border-border/50 pt-6 mb-8">
                <span>Total</span>
                <span className="text-primary">₹{total.toLocaleString('en-IN')}</span>
              </div>
              
              <Button className="w-full h-14 text-lg rounded-2xl mb-6 bg-primary hover:bg-primary/90 text-primary-foreground group">
                Checkout Now
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>

              <div className="space-y-4">
                <div className="flex items-center text-sm text-foreground/60 justify-center">
                  <ShieldCheck className="w-4 h-4 mr-2 text-green-500" />
                  <span>Secure checkout via Razorpay</span>
                </div>
                <div className="flex items-center justify-center gap-2 pt-4 border-t border-border/30">
                  <CreditCard className="w-6 h-6 text-foreground/40" />
                  <div className="w-8 h-5 bg-foreground/20 rounded"></div>
                  <div className="w-8 h-5 bg-foreground/20 rounded"></div>
                  <div className="w-8 h-5 bg-foreground/20 rounded"></div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}

function ShoppingCartIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}
