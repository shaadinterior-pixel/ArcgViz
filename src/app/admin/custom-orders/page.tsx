"use client";

import React, { useState, useEffect } from 'react';
import { Package, Download, Search, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';

type CustomOrder = {
  id: string;
  productName: string;
  productId: string;
  quantity: string;
  corners: string;
  customerName?: string;
  address?: string;
  deliverySpeed?: string;
  designUrl: string;
  type: string;
  createdAt: any;
};

export default function CustomOrdersPage() {
  const [orders, setOrders] = useState<CustomOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadOrders() {
      try {
        const q = query(collection(db, 'printing_orders'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CustomOrder[];
        setOrders(data);
      } catch (error) {
        console.error("Error loading custom orders", error);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  const filteredOrders = orders.filter(o => o.productName.toLowerCase().includes(search.toLowerCase()));

  if (loading) {
    return <div className="flex justify-center py-20"><Package className="w-8 h-8 text-primary animate-pulse" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Custom Printing Orders</h1>
          <p className="text-sm text-foreground/50 mt-1">{orders.length} orders tracked</p>
        </div>
      </div>

      <Card className="glass-card overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
              <Input placeholder="Search orders…" className="pl-9 bg-black/20 border-white/10" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          <div className="overflow-x-auto hide-scrollbar">
            <table className="w-full text-sm">
              <thead className="text-xs text-foreground/40 uppercase tracking-widest border-b border-white/10 bg-white/5">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">Product</th>
                  <th className="text-left px-5 py-3 font-medium">Date</th>
                  <th className="text-left px-5 py-3 font-medium">Specs</th>
                  <th className="text-left px-5 py-3 font-medium">Source</th>
                  <th className="text-right px-5 py-3 font-medium">Design</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredOrders.length > 0 ? filteredOrders.map(o => (
                  <tr key={o.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-5 py-4 font-bold">{o.productName}</td>
                    <td className="px-5 py-4 text-foreground/50">
                      {o.createdAt?.toDate ? o.createdAt.toDate().toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-xs text-foreground/60 space-y-0.5">
                        <p><span className="font-bold text-foreground">Name:</span> {o.customerName || 'N/A'}</p>
                        <p><span className="font-bold text-foreground">Address:</span> {o.address ? <span className="line-clamp-1" title={o.address}>{o.address}</span> : 'N/A'}</p>
                        <p><span className="font-bold text-foreground">Qty:</span> {o.quantity}</p>
                        <p><span className="font-bold text-foreground">Corners:</span> {o.corners}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border ${
                        o.type === 'whatsapp' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        {o.type}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {o.designUrl ? (
                        <a href={o.designUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-colors">
                          <ImageIcon className="w-3.5 h-3.5" /> View Design <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      ) : (
                        <span className="text-foreground/30 text-xs italic">No upload</span>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="px-5 py-16 text-center text-foreground/40">No orders found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
