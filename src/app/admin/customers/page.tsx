"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, X, Users, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { type Customer } from '@/lib/store';
import { fetchAdminCustomers, saveAdminCustomer, deleteAdminCustomer } from '@/app/actions/admin';

const EMPTY: Omit<Customer, 'id'> = {
  name: '', email: '', spent: 0, orders: 0,
  status: 'Active', joinDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  plan: 'Free'
};

export default function AdminCustomersPage() {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [filter,    setFilter]    = useState('All');
  const [isOpen,    setIsOpen]    = useState(false);
  const [editing,   setEditing]   = useState<Customer | null>(null);
  const [saving,    setSaving]    = useState(false);

  const load = useCallback(async () => {
    try { 
      const usersData = await fetchAdminCustomers();
      setCustomers(usersData);
    }
    catch (e) { console.error(e); toast('Failed to load customers', 'error'); }
    finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { 
    load();
  }, [load]);

  const persist = async (customerToSave: Customer, isNew: boolean) => {
    setSaving(true);
    try { 
      await saveAdminCustomer(customerToSave, isNew);
      
      setCustomers(prev => {
        const idx = prev.findIndex(c => c.id === customerToSave.id);
        if (idx >= 0) { const a = [...prev]; a[idx] = customerToSave; return a; }
        return [customerToSave, ...prev];
      });
    }
    catch (e) { console.error(e); toast('Save failed', 'error'); }
    finally { setSaving(false); }
  };

  const filtered = customers.filter(c =>
    (c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())) &&
    (filter === 'All' || c.status === filter)
  );

  const openNew  = () => { setEditing({ id: `tmp-${Date.now()}`, ...EMPTY }); setIsOpen(true); };
  const openEdit = (c: Customer) => { setEditing({ ...c }); setIsOpen(true); };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this customer?')) return;
    try {
      await deleteAdminCustomer(id);
      setCustomers(prev => prev.filter(c => c.id !== id));
      toast('Customer deleted');
    } catch {
      toast('Failed to delete customer', 'error');
    }
  };

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.name.trim()) { toast('Name required', 'error'); return; }
    if (!editing.email.trim()) { toast('Email required', 'error'); return; }

    let customer = { ...editing };
    const isNew = customer.id.startsWith('tmp-');
    if (isNew) {
      customer.id = `c${Date.now()}`;
    }

    await persist(customer, isNew);
    toast(isNew ? 'Customer added ✓' : 'Customer updated ✓');
    setIsOpen(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Users className="w-8 h-8 text-primary animate-pulse" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-sm text-foreground/50 mt-1">{customers.length} registered — {customers.filter(c => c.status === 'Active').length} active</p>
        </div>
        <Button onClick={openNew} className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0 hidden">
          <Plus className="w-4 h-4 mr-2" /> Add Customer
        </Button>
      </div>

      <Card className="glass-card overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
              <Input placeholder="Search customers…" className="pl-9 bg-black/20 border-white/10" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="relative">
              <select
                className="appearance-none bg-black/20 border border-white/10 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                value={filter} onChange={e => setFilter(e.target.value)}
              >
                <option>All</option><option>Active</option><option>Inactive</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/40 pointer-events-none" />
            </div>
          </div>

          <div className="overflow-x-auto hide-scrollbar">
            <table className="w-full text-sm">
              <thead className="text-xs text-foreground/40 uppercase tracking-widest border-b border-white/10 bg-white/5">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">Customer</th>
                  <th className="text-left px-5 py-3 font-medium hidden sm:table-cell">Joined</th>
                  <th className="text-left px-5 py-3 font-medium">Spent</th>
                  <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Orders</th>
                  <th className="text-left px-5 py-3 font-medium">Plan</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-right px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.length > 0 ? filtered.map(c => (
                  <tr key={c.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-sm">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold">{c.name}</p>
                          <p className="text-xs font-medium text-foreground/50">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-foreground/50 font-medium hidden sm:table-cell">{c.joinDate}</td>
                    <td className="px-5 py-4 font-bold text-primary">₹{c.spent.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-4 hidden md:table-cell">{c.orders}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border ${
                        c.plan === 'Free' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        c.plan === 'Pro' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                      }`}>
                        {c.plan === 'Pro' ? 'Plus + Pro' : (c.plan || 'Free')}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider
                        ${c.status === 'Active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(c)} className="p-2 rounded-lg text-foreground/40 hover:text-primary hover:bg-primary/10 transition-colors"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(c.id)} className="p-2 rounded-lg text-foreground/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={6} className="px-5 py-16 text-center text-foreground/40">No customers found.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 border-t border-white/10 text-xs font-medium text-foreground/40 bg-white/5">
            Showing {filtered.length} of {customers.length}
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      {isOpen && editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0D1A12]/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E2EDE8] bg-[#F8FAF9]">
              <h2 className="text-xl font-black text-[#111111]">{editing.id.startsWith('tmp-') ? 'Add Customer' : 'Edit Customer'}</h2>
              <button onClick={() => setIsOpen(false)} className="p-2 rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-6 py-6 space-y-5">
              {[
                { label: 'Full Name *', key: 'name', placeholder: 'Alex Johnson', type: 'text' },
                { label: 'Email *',     key: 'email', placeholder: 'alex@example.com', type: 'email' },
                { label: 'Total Spent (₹)', key: 'spent', placeholder: '0', type: 'number' },
                { label: 'Orders',     key: 'orders', placeholder: '0', type: 'number' },
              ].map(f => (
                <div key={f.key} className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">{f.label}</label>
                  <Input
                    type={f.type}
                    placeholder={f.placeholder}
                    className="bg-[#F8FAF9] border-[#E2EDE8] focus:border-[#24B86C] focus:ring-[#24B86C]/20 text-[#111111] font-medium h-12 rounded-xl"
                    value={(editing as any)[f.key]}
                    onChange={e => setEditing({ ...editing, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value })}
                  />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Plan Tier</label>
                  <select className="w-full bg-[#F8FAF9] border border-[#E2EDE8] rounded-xl px-4 py-3 h-12 text-sm font-medium text-[#111111] focus:outline-none focus:border-[#24B86C] focus:ring-2 focus:ring-[#24B86C]/20"
                    value={editing.plan} onChange={e=>setEditing({...editing, plan:e.target.value as 'Free'|'Pro'})}>
                    <option value="Free">Free</option>
                    <option value="Pro">Plus + Pro</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Status</label>
                  <select
                    className="w-full bg-[#F8FAF9] border border-[#E2EDE8] rounded-xl px-4 py-3 h-12 text-sm font-medium text-[#111111] focus:outline-none focus:border-[#24B86C] focus:ring-2 focus:ring-[#24B86C]/20"
                    value={editing.status}
                    onChange={e => setEditing({ ...editing, status: e.target.value as Customer['status'] })}
                  >
                    <option>Active</option><option>Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="px-6 py-5 border-t border-[#E2EDE8] flex justify-end gap-3 bg-[#F8FAF9]">
              <Button variant="outline" className="border-[#E2EDE8] hover:bg-zinc-100 text-[#111111] font-bold rounded-xl" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-[#24B86C] hover:bg-[#1E995A] text-white min-w-[100px] font-bold rounded-xl">
                {saving ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
