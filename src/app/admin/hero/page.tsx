"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Save, Type, Link as LinkIcon, Search, RefreshCw,
  Plus, Trash2, GripVertical, Image as ImageIcon,
  Layout, Layers, Eye, ChevronDown, ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import {
  fetchHeroContent, saveHeroContent, DEFAULT_HERO_CONTENT, type HeroContent,
} from '@/lib/store';

// ── Hero Card type (managed locally, stored in hero_content as JSON) ─────────
type HeroCard = {
  id: string;
  label: string;
  img: string;
  aspect: 'aspect-[4/3]' | 'aspect-video' | 'aspect-square' | 'aspect-[16/10]' | 'aspect-[2/3]';
  dark?: boolean;
  featured?: boolean;
};

const DEFAULT_CARDS: HeroCard[] = [
  { id: 'interior', label: 'Interior Design',   img: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=300', aspect: 'aspect-[4/3]' },
  { id: 'food',     label: 'Food Cart Design',   img: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=300', aspect: 'aspect-video' },
  { id: 'web',      label: 'Website Templates',  img: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=400', aspect: 'aspect-[16/10]', featured: true },
  { id: 'motion',   label: 'Motion Graphics',    img: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=300', aspect: 'aspect-video', dark: true },
  { id: 'brand',    label: 'Brand Kits',         img: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=300', aspect: 'aspect-video' },
  { id: '3d',       label: '3D Models',          img: 'https://images.unsplash.com/photo-1618220179428-22790b46a0eb?auto=format&fit=crop&q=80&w=300', aspect: 'aspect-square' },
  { id: 'digital',  label: 'Digital Products',   img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=300', aspect: 'aspect-video' },
];

const ASPECT_OPTIONS: HeroCard['aspect'][] = [
  'aspect-[4/3]', 'aspect-video', 'aspect-square', 'aspect-[16/10]', 'aspect-[2/3]',
];

const ASPECT_LABELS: Record<string, string> = {
  'aspect-[4/3]':   '4:3',
  'aspect-video':   '16:9',
  'aspect-square':  '1:1',
  'aspect-[16/10]': '16:10',
  'aspect-[2/3]':   '2:3 (Portrait)',
};

const TABS = [
  { id: 'headline', label: 'Headline & CTAs', icon: Type },
  { id: 'cards',    label: 'Hero Cards',      icon: Layers },
  { id: 'search',   label: 'Search Bar',      icon: Search },
];

// ── Small reusable field ──────────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, mono = false }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; mono?: boolean;
}) {
  return (
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
}

export default function AdminHeroPage() {
  const { toast } = useToast();
  const [hero, setHero] = useState<HeroContent>(DEFAULT_HERO_CONTENT);
  const [cards, setCards] = useState<HeroCard[]>(DEFAULT_CARDS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'headline' | 'cards' | 'search'>('headline');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  useEffect(() => {
    fetchHeroContent()
      .then(data => {
        const merged = { ...DEFAULT_HERO_CONTENT, ...data };
        setHero(merged);
        // Load saved cards if they exist (stored as JSON string in hero_content)
        if ((merged as any).hero_cards) {
          try { setCards(JSON.parse((merged as any).hero_cards)); } catch {}
        }
      })
      .catch(() => toast('Using default hero content', 'info'))
      .finally(() => setLoading(false));
  }, [toast]);

  const update = (key: keyof HeroContent, value: string) =>
    setHero(h => ({ ...h, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...hero, hero_cards: JSON.stringify(cards) } as any;
      await saveHeroContent(payload);
      toast('Hero content saved ✓');
    } catch {
      toast('Failed to save hero content', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Card helpers ────────────────────────────────────────────────────────────
  const addCard = () => {
    const id = `card_${Date.now()}`;
    setCards(c => [...c, { id, label: 'New Card', img: '', aspect: 'aspect-video' }]);
    setExpandedCard(id);
  };

  const updateCard = (id: string, patch: Partial<HeroCard>) =>
    setCards(cs => cs.map(c => c.id === id ? { ...c, ...patch } : c));

  const removeCard = (id: string) =>
    setCards(cs => cs.filter(c => c.id !== id));

  const moveCard = (id: string, dir: 'up' | 'down') => {
    const idx = cards.findIndex(c => c.id === id);
    if ((dir === 'up' && idx === 0) || (dir === 'down' && idx === cards.length - 1)) return;
    const next = [...cards];
    const swap = dir === 'up' ? idx - 1 : idx + 1;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    setCards(next);
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hero Section</h1>
          <p className="text-sm text-foreground/50 mt-1">
            Manage the homepage hero — text, CTAs, floating cards, and search bar.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => { setHero(DEFAULT_HERO_CONTENT); setCards(DEFAULT_CARDS); toast('Reset to defaults', 'info'); }}
            className="border-white/10 text-foreground/60 hover:text-foreground"
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving…' : 'Save All Changes'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-black/20 rounded-xl border border-white/10 w-fit">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground shadow'
                : 'text-foreground/50 hover:text-foreground'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB: Headline & CTAs ── */}
      {activeTab === 'headline' && (
        <div className="space-y-4">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Type className="w-4 h-4 text-primary" /> Headline & Subtitle
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Headline Line 1" value={hero.headline_line1} onChange={v => update('headline_line1', v)} placeholder="One Platform. Infinite" />
              <Field label="Headline Line 2 (gradient)" value={hero.headline_line2} onChange={v => update('headline_line2', v)} placeholder="Creative Possibilities." />
              <Field label="Subheadline / Description" value={hero.subheadline} onChange={v => update('subheadline', v)} placeholder="The ultimate digital ecosystem…" />
              {/* Live preview */}
              <div className="mt-2 p-5 rounded-xl bg-white/5 border border-white/10">
                <p className="text-[10px] text-foreground/40 mb-2 font-bold uppercase tracking-widest">Live Preview</p>
                <h2 className="text-3xl font-black text-foreground leading-tight">
                  {hero.headline_line1 || 'One Platform.'}<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#24B86C] to-[#11998E]">
                    {hero.headline_line2 || 'Infinite Creative'}
                  </span>
                </h2>
                <p className="text-sm text-foreground/60 mt-2 max-w-md">{hero.subheadline}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-primary" /> Call-to-Action Buttons
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {([
                { num: 1, textKey: 'cta1_text', linkKey: 'cta1_link', style: '🟢 Primary (Solid Green)' },
                { num: 2, textKey: 'cta2_text', linkKey: 'cta2_link', style: '⬜ Secondary (Outline)' },
                { num: 3, textKey: 'cta3_text', linkKey: 'cta3_link', style: '⬜ Tertiary (Outline)' },
              ] as const).map(({ num, textKey, linkKey, style }) => (
                <div key={num} className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="col-span-2">
                    <p className="text-xs font-bold text-foreground/50 mb-3 uppercase tracking-widest">Button {num} — {style}</p>
                  </div>
                  <Field label="Button Text" value={hero[textKey]} onChange={v => update(textKey, v)} placeholder="Button label" />
                  <Field label="Link / URL" value={hero[linkKey]} onChange={v => update(linkKey, v)} placeholder="/products" mono />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── TAB: Hero Cards ── */}
      {activeTab === 'cards' && (
        <div className="space-y-4">
          {/* Info banner */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20 text-sm">
            <Layout className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-primary">Floating Hero Cards</p>
              <p className="text-foreground/60 text-xs mt-0.5">
                These are the image cards that float on the right side of the hero section on desktop. You can add, remove, edit, and reorder them.
              </p>
            </div>
          </div>

          {/* Cards list */}
          <div className="space-y-3">
            {cards.map((card, idx) => (
              <Card key={card.id} className="glass-card overflow-hidden">
                {/* Card header row */}
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => setExpandedCard(expandedCard === card.id ? null : card.id)}
                >
                  {/* Drag handle */}
                  <GripVertical className="w-4 h-4 text-foreground/30 shrink-0" />

                  {/* Thumbnail */}
                  <div className="w-12 h-9 rounded-lg bg-black/30 overflow-hidden shrink-0 border border-white/10">
                    {card.img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={card.img} alt={card.label} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-4 h-4 text-foreground/30" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{card.label || 'Untitled Card'}</p>
                    <p className="text-xs text-foreground/40">{ASPECT_LABELS[card.aspect]} {card.featured ? '· Featured' : ''} {card.dark ? '· Dark Overlay' : ''}</p>
                  </div>

                  {/* Move up/down */}
                  <div className="flex gap-1 shrink-0">
                    <button onClick={e => { e.stopPropagation(); moveCard(card.id, 'up'); }} disabled={idx === 0} className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 transition-colors">
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={e => { e.stopPropagation(); moveCard(card.id, 'down'); }} disabled={idx === cards.length - 1} className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 transition-colors">
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={e => { e.stopPropagation(); removeCard(card.id); }}
                    className="p-1.5 rounded-lg hover:bg-red-500/20 text-foreground/40 hover:text-red-400 transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {/* Expand */}
                  <ChevronDown className={`w-4 h-4 text-foreground/40 transition-transform shrink-0 ${expandedCard === card.id ? 'rotate-180' : ''}`} />
                </div>

                {/* Expanded edit fields */}
                {expandedCard === card.id && (
                  <CardContent className="border-t border-white/10 pt-4 pb-5 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-widest text-foreground/50">Card Label</label>
                        <Input
                          className="bg-black/20 border-white/10 focus-visible:ring-primary"
                          value={card.label}
                          onChange={e => updateCard(card.id, { label: e.target.value })}
                          placeholder="Interior Design"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-widest text-foreground/50">Aspect Ratio</label>
                        <select
                          className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                          value={card.aspect}
                          onChange={e => updateCard(card.id, { aspect: e.target.value as HeroCard['aspect'] })}
                        >
                          {ASPECT_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{ASPECT_LABELS[opt]}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-widest text-foreground/50">Image URL</label>
                      <Input
                        className="bg-black/20 border-white/10 focus-visible:ring-primary font-mono text-xs"
                        value={card.img}
                        onChange={e => updateCard(card.id, { img: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                      />
                    </div>

                    {/* Image preview */}
                    {card.img && (
                      <div className={`relative w-full max-w-[240px] ${card.aspect} rounded-xl overflow-hidden border border-white/10`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={card.img} alt={card.label} className="absolute inset-0 w-full h-full object-cover" />
                      </div>
                    )}

                    <div className="flex flex-wrap gap-4 pt-1">
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <div
                          className={`w-5 h-5 rounded-[6px] flex items-center justify-center transition-all border ${card.featured ? 'bg-primary border-primary' : 'bg-black/20 border-white/20'}`}
                          onClick={() => updateCard(card.id, { featured: !card.featured })}
                        >
                          {card.featured && <div className="w-2 h-2 bg-white rounded-[2px]" />}
                        </div>
                        <span className="text-sm font-medium text-foreground/70">Featured (larger card)</span>
                      </label>
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <div
                          className={`w-5 h-5 rounded-[6px] flex items-center justify-center transition-all border ${card.dark ? 'bg-primary border-primary' : 'bg-black/20 border-white/20'}`}
                          onClick={() => updateCard(card.id, { dark: !card.dark })}
                        >
                          {card.dark && <div className="w-2 h-2 bg-white rounded-[2px]" />}
                        </div>
                        <span className="text-sm font-medium text-foreground/70">Dark overlay with play icon</span>
                      </label>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          {/* Add card button */}
          <button
            onClick={addCard}
            className="w-full h-14 rounded-2xl border-2 border-dashed border-white/20 hover:border-primary/50 hover:bg-primary/5 flex items-center justify-center gap-2 text-sm font-semibold text-foreground/40 hover:text-primary transition-all"
          >
            <Plus className="w-4 h-4" /> Add New Hero Card
          </button>

          {/* Mini preview grid */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" /> Cards Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {cards.map(card => (
                  <div key={card.id} className="flex flex-col items-center gap-1.5">
                    <div className="w-16 h-12 rounded-lg bg-black/30 overflow-hidden border border-white/10">
                      {card.img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={card.img} alt={card.label} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-4 h-4 text-foreground/30" />
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-foreground/50 max-w-[64px] text-center truncate">{card.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── TAB: Search Bar ── */}
      {activeTab === 'search' && (
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
              <span className="text-foreground/40 text-sm">{hero.search_placeholder || 'Search placeholder…'}</span>
            </div>
          </CardContent>
        </Card>
      )}

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
