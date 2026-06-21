"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShoppingCart, Search, ChevronDown, Package, Plus, X,
  Trash2, RefreshCw, CheckCircle2, Clock, AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import {
  fetchOrders, saveOrder, deleteOrder, updateOrderStatus,
  onStoreUpdate, type Order,
} from '@/lib/store';

const STATUS_STYLES: Record<Order['status'], string> = {
  Completed: 'bg-green-500/10 text-green-400 border-green-500/20',
  Pending:   'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  Refunded:  'bg-red-500/10 text-red-400 border-red-500/20',
};

const STATUS_CYCLE: Record<Order['status'], Order['status']> = {
  Pending:   'Completed',
  Completed: 'Refunded',
  Refunded:  'Pending',
};

const EMPTY_ORDER: Omit<Order, 'id'> = {
  customer: '', email: '', product: '', amount: '₹',
  status: 'Pending',
  date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
};

export default function AdminOrdersPage() {
  const { toast } = useToast();
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState<'All' | Order['status']>('All');
  const [isOpen,  setIsOpen]  = useState(false);
  const [editing, setEditing] = useState<Order | null>(null);
  const [saving,  setSaving]  = useState(false);

  const load = useCallback(async () => {
    try {
      setOrders(await fetchOrders());
    } catch {
      toast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
    const unsub = onStoreUpdate('orders', load);
    return () => unsub();
  }, [load]);

  const filtered = orders.filter(o =>
    (o.customer.toLowerCase().includes(search.toLowerCase()) ||
     o.product.toLowerCase().includes(search.toLowerCase()) ||
     o.id.toLowerCase().includes(search.toLowerCase())) &&
    (filter === 'All' || o.status === filter)
  );

  const totals = {
    completed: orders.filter(o => o.status === 'Completed').length,
    pending:   orders.filter(o => o.status === 'Pending').length,
    refunded:  orders.filter(o => o.status === 'Refunded').length,
  };

  const openNew = () => {
    setEditing({ id: `ORD-${Date.now()}`, ...EMPTY_ORDER });
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this order?')) return;
    try {
      await deleteOrder(id);
      setOrders(prev => prev.filter(o => o.id !== id));
      toast('Order deleted');
    } catch {
      toast('Failed to delete order', 'error');
    }
  };

  const handleStatusCycle = async (order: Order) => {
    const newStatus = STATUS_CYCLE[order.status];
    try {
      await updateOrderStatus(order.id, newStatus);
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: newStatus } : o));
      toast(`Status → ${newStatus}`);
    } catch {
      toast('Failed to update status', 'error');
    }
  };

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.customer.trim()) { toast('Customer name required', 'error'); return; }
    if (!editing.product.trim())  { toast('Product name required', 'error'); return; }
    if (!editing.amount.trim())   { toast('Amount required', 'error'); return; }

    setSaving(true);
    try {
      await saveOrder(editing);
      setOrders(prev => {
        const idx = prev.findIndex(o => o.id === editing.id);
        if (idx >= 0) { const a = [...prev]; a[idx] = editing; return a; }
        return [editing, ...prev];
      });
      toast('Order saved ✓');
      setIsOpen(false);
    } catch {
      toast('Failed to save order', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Package className="w-8 h-8 text-primary animate-pulse" />
    </div>
  );

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-sm text-foreground/50 mt-1">{orders.length} total orders</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={load}
            className="border-border text-foreground/60 hover:text-foreground"
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          <Button onClick={openNew} className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0">
            <Plus className="w-4 h-4 mr-2" /> Add Order
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Completed', count: totals.completed, color: 'text-green-400', bg: 'bg-green-400/10', Icon: CheckCircle2 },
          { label: 'Pending',   count: totals.pending,   color: 'text-yellow-400', bg: 'bg-yellow-400/10', Icon: Clock },
          { label: 'Refunded',  count: totals.refunded,  color: 'text-red-400',    bg: 'bg-red-400/10',    Icon: AlertCircle },
        ].map(s => (
          <Card key={s.label} className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                <s.Icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div>
                <p className="text-xl font-bold">{s.count}</p>
                <p className="text-xs text-foreground/40">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          {/* Toolbar */}
          <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
              <Input
                placeholder="Search orders…"
                className="pl-9 bg-secondary/50 border-border"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="relative">
              <select
                className="appearance-none bg-secondary/50 border border-border rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={filter}
                onChange={e => setFilter(e.target.value as typeof filter)}
              >
                <option value="All">All Status</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Refunded">Refunded</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/40 pointer-events-none" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-foreground/40 uppercase tracking-wider border-b border-border">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">Order ID</th>
                  <th className="text-left px-5 py-3 font-medium">Customer</th>
                  <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Product</th>
                  <th className="text-left px-5 py-3 font-medium">Amount</th>
                  <th className="text-left px-5 py-3 font-medium hidden sm:table-cell">Date</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-right px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(o => (
                  <tr key={o.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs text-foreground/60">{o.id}</td>
                    <td className="px-5 py-4">
                      <p className="font-medium">{o.customer}</p>
                      <p className="text-xs text-foreground/40">{o.email}</p>
                    </td>
                    <td className="px-5 py-4 text-foreground/60 hidden md:table-cell max-w-[180px]">
                      <span className="line-clamp-1">{o.product}</span>
                    </td>
                    <td className="px-5 py-4 font-semibold">{o.amount}</td>
                    <td className="px-5 py-4 text-foreground/50 hidden sm:table-cell">{o.date}</td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleStatusCycle(o)}
                        className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border transition-colors cursor-pointer hover:opacity-80 ${STATUS_STYLES[o.status]}`}
                        title="Click to cycle status"
                      >
                        {o.status}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleDelete(o.id)}
                        className="p-1.5 rounded-lg text-foreground/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center text-foreground/40">
                      No orders found.{' '}
                      <button className="text-primary underline" onClick={openNew}>
                        Add one?
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 border-t border-border text-xs text-foreground/40">
            Showing {filtered.length} of {orders.length} orders
          </div>
        </CardContent>
      </Card>

      {/* ── Add Order Modal ── */}
      {isOpen && editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-bold">Add New Order</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-foreground/40 hover:text-foreground hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {[
                { label: 'Order ID', key: 'id', placeholder: 'ORD-001', type: 'text', readOnly: true },
                { label: 'Customer Name *', key: 'customer', placeholder: 'Alex Johnson', type: 'text' },
                { label: 'Customer Email', key: 'email', placeholder: 'alex@example.com', type: 'email' },
                { label: 'Product Name *', key: 'product', placeholder: 'Modern Living Room Scene', type: 'text' },
                { label: 'Amount *', key: 'amount', placeholder: '₹1,999', type: 'text' },
              ].map(f => (
                <div key={f.key} className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-foreground/50">{f.label}</label>
                  <Input
                    type={f.type}
                    placeholder={f.placeholder}
                    className="bg-secondary/40 border-border"
                    value={(editing as Record<string, string>)[f.key] ?? ''}
                    readOnly={f.readOnly}
                    onChange={f.readOnly ? undefined : e => setEditing({ ...editing, [f.key]: e.target.value })}
                  />
                </div>
              ))}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-foreground/50">Status</label>
                <select
                  className="w-full bg-secondary/40 border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={editing.status}
                  onChange={e => setEditing({ ...editing, status: e.target.value as Order['status'] })}
                >
                  <option>Pending</option>
                  <option>Completed</option>
                  <option>Refunded</option>
                </select>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[100px]"
              >
                {saving ? 'Saving…' : 'Save Order'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
