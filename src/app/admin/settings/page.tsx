"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Save, Store, Mail, CreditCard, AlertTriangle, RefreshCw, Settings, ImageIcon, Upload, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { fetchSettings, saveSettings, onStoreUpdate, type StoreSettings } from '@/lib/store';

const DEFAULT: StoreSettings = {
  storeName: 'Design Walla',
  supportEmail: 'support@designwalla.com',
  currency: 'INR',
  razorpayEnabled: true,
  stripeEnabled: false,
  maintenanceMode: false,
  heroImageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1920',
};

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);

  useEffect(() => {
    const load = () => {
      fetchSettings()
        .then(s => setSettings({ ...DEFAULT, ...s }))
        .catch(() => toast('Using default settings', 'info'))
        .finally(() => setLoading(false));
    };
    load();
    const unsub = onStoreUpdate('settings', load);
    return () => unsub();
  }, [toast]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSettings(settings);
      toast('Settings saved ✓');
    } catch {
      toast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggle = (key: keyof StoreSettings) =>
    setSettings(s => ({ ...s, [key]: !s[key] }));

  if (loading) return (
    <div className="flex justify-center py-20">
      <Settings className="w-8 h-8 text-primary animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-foreground/50 mt-1">Manage your store configuration</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving…' : 'Save Changes'}
        </Button>
      </div>

      {/* Store info */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Store className="w-4 h-4 text-primary" /> Store Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-foreground/50">Store Name</label>
            <Input
              className="bg-secondary/40 border-border"
              value={settings.storeName}
              onChange={e => setSettings(s => ({ ...s, storeName: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-foreground/50">Support Email</label>
            <Input
              type="email"
              className="bg-secondary/40 border-border"
              value={settings.supportEmail}
              onChange={e => setSettings(s => ({ ...s, supportEmail: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-foreground/50">Currency</label>
            <select
              className="w-full bg-secondary/40 border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={settings.currency}
              onChange={e => setSettings(s => ({ ...s, currency: e.target.value }))}
            >
              <option value="INR">INR — Indian Rupee (₹)</option>
              <option value="USD">USD — US Dollar ($)</option>
              <option value="EUR">EUR — Euro (€)</option>
              <option value="GBP">GBP — British Pound (£)</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Hero Image */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-primary" /> Hero Image
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Live Preview */}
          <div className="relative w-full h-48 rounded-xl overflow-hidden bg-secondary/50 border border-border">
            {settings.heroImageUrl ? (
              <Image
                src={settings.heroImageUrl}
                alt="Hero preview"
                fill
                className="object-cover"
                unoptimized={settings.heroImageUrl.startsWith('blob:')}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-foreground/30 gap-2">
                <ImageIcon className="w-10 h-10" />
                <span className="text-sm">No image set</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <span className="absolute bottom-3 left-3 text-white text-xs font-medium bg-black/50 px-2 py-1 rounded-md">Homepage Hero Preview</span>
          </div>

          {/* URL input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-foreground/50 flex items-center gap-1.5">
              <LinkIcon className="w-3 h-3" /> Image URL
            </label>
            <Input
              className="bg-secondary/40 border-border font-mono text-xs"
              placeholder="https://images.unsplash.com/..."
              value={settings.heroImageUrl || ''}
              onChange={e => setSettings(s => ({ ...s, heroImageUrl: e.target.value }))}
            />
            <p className="text-xs text-foreground/40">Paste any public image URL (Unsplash, Cloudinary, etc.) — the preview updates live.</p>
          </div>

          {/* Quick presets */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-foreground/50">Quick Presets</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Interior 1', url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1920' },
                { label: 'Interior 2', url: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?auto=format&fit=crop&q=80&w=1920' },
                { label: 'Interior 3', url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=1920' },
              ].map(preset => (
                <button
                  key={preset.label}
                  onClick={() => setSettings(s => ({ ...s, heroImageUrl: preset.url }))}
                  className={`relative h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    settings.heroImageUrl === preset.url ? 'border-primary shadow-[0_0_10px_rgba(212,175,55,0.4)]' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Image src={preset.url} alt={preset.label} fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/30 flex items-end p-1">
                    <span className="text-white text-[10px] font-medium">{preset.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" /> Payment Gateways
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {([
            { key: 'razorpayEnabled', label: 'Razorpay', desc: 'Accept UPI, cards, netbanking via Razorpay' },
            { key: 'stripeEnabled',   label: 'Stripe',   desc: 'Accept international cards via Stripe' },
          ] as { key: keyof StoreSettings; label: string; desc: string }[]).map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div>
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-xs text-foreground/40">{desc}</p>
              </div>
              <button
                onClick={() => toggle(key)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${settings[key] ? 'bg-primary' : 'bg-secondary'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${settings[key] ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Maintenance mode */}
      <Card className={`border ${settings.maintenanceMode ? 'border-red-500/30 bg-red-500/5' : 'bg-card border-border'}`}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-500/15 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <p className="text-sm font-semibold">Maintenance Mode</p>
                <p className="text-xs text-foreground/40">Displays a maintenance page to all visitors</p>
              </div>
            </div>
            <button
              onClick={() => toggle('maintenanceMode')}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${settings.maintenanceMode ? 'bg-red-500' : 'bg-secondary'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${settings.maintenanceMode ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
          {settings.maintenanceMode && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-300">
              ⚠ Maintenance mode is <strong>ON</strong>. Your storefront is currently inaccessible to visitors.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-4 h-4" /> Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-3 border border-border rounded-xl px-4">
            <div>
              <p className="text-sm font-semibold">Reset to Default Data</p>
              <p className="text-xs text-foreground/40">Clear localStorage cache and reload from JSON files</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500"
              onClick={() => {
                ['designwalla_products','designwalla_customers','designwalla_settings'].forEach(k => localStorage.removeItem(k));
                toast('Cache cleared — reload to reset', 'info');
              }}
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Reset Cache
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
