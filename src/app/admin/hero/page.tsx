"use client";

import React, { useState, useEffect } from 'react';
import { Save, Type, Link as LinkIcon, BarChart2, Search, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import {
  fetchHeroContent,
  saveHeroContent,
  DEFAULT_HERO_CONTENT,
  type HeroContent,
} from '@/lib/store';

export default function AdminHeroPage() {
  const { toast } = useToast();
  const [hero, setHero] = useState<HeroContent>(DEFAULT_HERO_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchHeroContent()
      .then(data => setHero({ ...DEFAULT_HERO_CONTENT, ...data }))
      .catch(() => toast('Using default hero content', 'info'))
      .finally(() => setLoading(false));
  }, [toast]);

  const update = (key: keyof HeroContent, value: string) =>
    setHero(h => ({ ...h, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveHeroContent(hero);
      toast('Hero content saved ✓');
    } catch {
      toast('Failed to save hero content', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setHero(DEFAULT_HERO_CONTENT);
    toast('Reset to defaults — click Save to apply', 'info');
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const Field = ({
    label, value, onChange, placeholder, mono = false,
  }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; mono?: boolean }) => (
    <div className="space-y-1.5">
      <label className="text-xs font-bold uppercase tracking-widest text-foreground/50">{label}</label>
      <Input
        className={`bg-black/20 border-white/10 focus-visible:ring-primary ${mono ? 'font-mono text-xs' : ''}`}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hero Content</h1>
          <p className="text-sm text-foreground/50 mt-1">
            Edit the homepage hero headline, CTAs, stats, and search placeholder.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            className="border-border text-foreground/60 hover:text-foreground"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset Defaults
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Headline */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Type className="w-4 h-4 text-primary" /> Headline & Subtitle
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field
            label="Headline Line 1"
            value={hero.headline_line1}
            onChange={v => update('headline_line1', v)}
            placeholder="One Platform. Infinite"
          />
          <Field
            label="Headline Line 2"
            value={hero.headline_line2}
            onChange={v => update('headline_line2', v)}
            placeholder="Creative Possibilities."
          />
          <Field
            label="Subheadline / Description"
            value={hero.subheadline}
            onChange={v => update('subheadline', v)}
            placeholder="All-Business Digital Ecosystem..."
          />
          {/* Live preview */}
          <div className="mt-4 p-5 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-foreground/40 mb-2 font-bold uppercase tracking-widest">Preview</p>
            <h2 className="text-3xl font-black text-foreground leading-tight">
              {hero.headline_line1}<br />{hero.headline_line2}
            </h2>
            <p className="text-sm text-foreground/60 mt-2 max-w-md">{hero.subheadline}</p>
          </div>
        </CardContent>
      </Card>

      {/* CTAs */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-primary" /> Call-to-Action Buttons
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {([
            { num: 1, textKey: 'cta1_text', linkKey: 'cta1_link', style: 'Solid Green (Primary)' },
            { num: 2, textKey: 'cta2_text', linkKey: 'cta2_link', style: 'Outline (Secondary)' },
            { num: 3, textKey: 'cta3_text', linkKey: 'cta3_link', style: 'Outline (Tertiary)' },
          ] as const).map(({ num, textKey, linkKey, style }) => (
            <div key={num} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field
                label={`CTA ${num} Text — ${style}`}
                value={hero[textKey]}
                onChange={v => update(textKey, v)}
                placeholder="Button label"
              />
              <Field
                label={`CTA ${num} Link`}
                value={hero[linkKey]}
                onChange={v => update(linkKey, v)}
                placeholder="/products"
                mono
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Stats */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-primary" /> Stat Badges
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-foreground/40">
            These 4 badges appear below the headline on the hero section.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {([
              { num: 1, valKey: 'stat1_value', lblKey: 'stat1_label' },
              { num: 2, valKey: 'stat2_value', lblKey: 'stat2_label' },
              { num: 3, valKey: 'stat3_value', lblKey: 'stat3_label' },
              { num: 4, valKey: 'stat4_value', lblKey: 'stat4_label' },
            ] as const).map(({ num, valKey, lblKey }) => (
              <div key={num} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <p className="text-xs font-bold text-foreground/50 uppercase tracking-widest">Badge {num}</p>
                <div className="grid grid-cols-2 gap-2">
                  <Field
                    label="Value"
                    value={hero[valKey]}
                    onChange={v => update(valKey, v)}
                    placeholder="12K+"
                  />
                  <Field
                    label="Label"
                    value={hero[lblKey]}
                    onChange={v => update(lblKey, v)}
                    placeholder="Premium Assets"
                  />
                </div>
                {/* Mini preview */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/20 border border-white/10 w-fit">
                  <span className="text-sm font-black text-primary">{hero[valKey]}</span>
                  <span className="text-xs text-foreground/60">{hero[lblKey]}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Search className="w-4 h-4 text-primary" /> Search Bar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field
            label="Search Placeholder Text"
            value={hero.search_placeholder}
            onChange={v => update('search_placeholder', v)}
            placeholder="What are you looking for today?"
          />
          {/* Preview */}
          <div className="flex items-center gap-3 h-14 px-5 rounded-full bg-black/20 border border-white/10 shadow-sm">
            <Search className="w-5 h-5 text-foreground/30" />
            <span className="text-foreground/40 text-sm">{hero.search_placeholder}</span>
          </div>
        </CardContent>
      </Card>

      {/* Save footer */}
      <div className="flex justify-end pb-6">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving…' : 'Save All Changes'}
        </Button>
      </div>
    </div>
  );
}
