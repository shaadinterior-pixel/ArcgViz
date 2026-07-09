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


      <Card className="glass-card">
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
            <div key={key} className="flex items-center justify-between py-3 border-b border-white/10 last:border-0">
              <div>
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-xs text-foreground/40">{desc}</p>
              </div>
              <button
                onClick={() => toggle(key)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${settings[key] ? 'bg-primary' : 'bg-white/10 border border-white/10'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${settings[key] ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Maintenance mode */}
      <Card className={`glass-card ${settings.maintenanceMode ? 'border-red-500/30 bg-red-500/5' : ''}`}>
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
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${settings.maintenanceMode ? 'bg-red-500' : 'bg-white/10 border border-white/10'}`}
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


    </div>
  );
}
