"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Save, Type, Link as LinkIcon, Search, RefreshCw,
  Plus, Trash2, GripVertical, Image as ImageIcon,
  Layout, Layers, Eye, ChevronDown, ChevronUp, Loader2, Upload,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import {
  fetchHeroContent, saveHeroContent, DEFAULT_HERO_CONTENT, type HeroContent,
} from '@/lib/store';

// ── Types ─────────────────────────────────────────────────────────────────────
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

// ── Field component ────────────────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, mono = false }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; mono?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">{label}</label>
      <input
        className={`w-full h-10 px-3.5 text-sm border border-[#E5E7EB] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#24B86C]/30 focus:border-[#24B86C] transition-all text-[#111827] placeholder:text-[#D1D5DB] ${mono ? 'font-mono text-xs' : ''}`}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminHeroPage() {
  const { toast } = useToast();
  const [hero, setHero] = useState<HeroContent>(DEFAULT_HERO_CONTENT);
  const [cards, setCards] = useState<HeroCard[]>(DEFAULT_CARDS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'headline' | 'cards' | 'search'>('headline');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const uploadImage = async (file: File): Promise<string> => {
    const fd = new FormData(); fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return data.secure_url as string;
  };

  useEffect(() => {
    fetchHeroContent()
      .then(data => {
        const merged = { ...DEFAULT_HERO_CONTENT, ...data };
        setHero(merged);
        // Load saved cards — fall back to DEFAULT_CARDS if none saved
        if ((merged as any).hero_cards) {
          try {
            const raw = (merged as any).hero_cards;
            const parsed = Array.isArray(raw) ? raw : JSON.parse(raw);
            if (parsed && parsed.length > 0) setCards(parsed);
          } catch { /* keep DEFAULT_CARDS */ }
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
    <div className="flex justify-center items-center py-24">
      <div className="w-7 h-7 border-2 border-[#24B86C] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] tracking-tight">Hero Section</h1>
          <p className="text-sm text-[#9CA3AF] mt-0.5">
            Manage the homepage hero — text, CTAs, floating cards, and search bar.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setHero(DEFAULT_HERO_CONTENT); setCards(DEFAULT_CARDS); toast('Reset to defaults', 'info'); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-white text-sm font-medium text-[#6B7280] hover:text-[#111827] hover:border-[#D1D5DB] transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#24B86C] text-white text-sm font-semibold hover:bg-[#1fa35f] disabled:opacity-60 transition-all shadow-sm"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving…' : 'Save All Changes'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[#F4F6F8] rounded-xl border border-[#E5E7EB] w-fit">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-white text-[#111827] shadow-sm border border-[#E5E7EB]'
                : 'text-[#9CA3AF] hover:text-[#6B7280]'
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
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Type className="w-4 h-4 text-[#24B86C]" />
              <h2 className="text-base font-semibold text-[#111827]">Headline & Subtitle</h2>
            </div>
            <div className="space-y-4">
              <Field label="Headline Line 1" value={hero.headline_line1} onChange={v => update('headline_line1', v)} placeholder="One Platform. Infinite" />
              <Field label="Headline Line 2 (gradient)" value={hero.headline_line2} onChange={v => update('headline_line2', v)} placeholder="Creative Possibilities." />
              <Field label="Subheadline / Description" value={hero.subheadline} onChange={v => update('subheadline', v)} placeholder="The ultimate digital ecosystem…" />
              {/* Live preview */}
              <div className="mt-3 p-5 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
                <p className="text-[10px] text-[#9CA3AF] mb-3 font-bold uppercase tracking-widest">Live Preview</p>
                <h2 className="text-3xl font-black text-[#111827] leading-tight">
                  {hero.headline_line1 || 'One Platform.'}<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#24B86C] to-[#11998E]">
                    {hero.headline_line2 || 'Infinite Creative'}
                  </span>
                </h2>
                <p className="text-sm text-[#6B7280] mt-2 max-w-md">{hero.subheadline}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
            <div className="flex items-center gap-2 mb-5">
              <LinkIcon className="w-4 h-4 text-[#24B86C]" />
              <h2 className="text-base font-semibold text-[#111827]">Call-to-Action Buttons</h2>
            </div>
            <div className="space-y-4">
              {([
                { num: 1, textKey: 'cta1_text', linkKey: 'cta1_link', style: 'Primary (Solid Green)' },
                { num: 2, textKey: 'cta2_text', linkKey: 'cta2_link', style: 'Secondary (Outline)' },
                { num: 3, textKey: 'cta3_text', linkKey: 'cta3_link', style: 'Tertiary (Outline)' },
              ] as const).map(({ num, textKey, linkKey, style }) => (
                <div key={num} className="p-4 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] space-y-3">
                  <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Button {num} — {style}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Button Text" value={hero[textKey]} onChange={v => update(textKey, v)} placeholder="Button label" />
                    <Field label="Link / URL" value={hero[linkKey]} onChange={v => update(linkKey, v)} placeholder="/products" mono />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: Hero Cards ── */}
      {activeTab === 'cards' && (
        <div className="space-y-4">
          {/* Info banner */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-sm">
            <Layout className="w-5 h-5 text-[#24B86C] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[#166534]">Floating Hero Cards</p>
              <p className="text-[#4ADE80] text-xs mt-0.5 text-[#15803D]">
                These are the image cards that float on the right side of the hero section on desktop. Add, remove, edit, and reorder them.
              </p>
            </div>
          </div>

          {/* Cards list */}
          <div className="space-y-2">
            {cards.map((card, idx) => (
              <div key={card.id} className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
                {/* Card header row */}
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-[#F9FAFB] transition-colors"
                  onClick={() => setExpandedCard(expandedCard === card.id ? null : card.id)}
                >
                  <GripVertical className="w-4 h-4 text-[#D1D5DB] shrink-0" />

                  {/* Thumbnail */}
                  <div className="w-12 h-9 rounded-lg bg-[#F4F6F8] overflow-hidden shrink-0 border border-[#E5E7EB]">
                    {card.img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={card.img} alt={card.label} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-4 h-4 text-[#D1D5DB]" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-[#111827] truncate">{card.label || 'Untitled Card'}</p>
                    <p className="text-xs text-[#9CA3AF]">{ASPECT_LABELS[card.aspect]} {card.featured ? '· Featured' : ''}{card.dark ? '· Dark Overlay' : ''}</p>
                  </div>

                  {/* Move up/down */}
                  <div className="flex gap-1 shrink-0">
                    <button onClick={e => { e.stopPropagation(); moveCard(card.id, 'up'); }} disabled={idx === 0} className="p-1.5 rounded-lg hover:bg-[#F4F6F8] disabled:opacity-30 transition-colors">
                      <ChevronUp className="w-3.5 h-3.5 text-[#6B7280]" />
                    </button>
                    <button onClick={e => { e.stopPropagation(); moveCard(card.id, 'down'); }} disabled={idx === cards.length - 1} className="p-1.5 rounded-lg hover:bg-[#F4F6F8] disabled:opacity-30 transition-colors">
                      <ChevronDown className="w-3.5 h-3.5 text-[#6B7280]" />
                    </button>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={e => { e.stopPropagation(); removeCard(card.id); }}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-[#D1D5DB] hover:text-red-500 transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <ChevronDown className={`w-4 h-4 text-[#9CA3AF] transition-transform shrink-0 ${expandedCard === card.id ? 'rotate-180' : ''}`} />
                </div>

                {/* Expanded edit fields */}
                {expandedCard === card.id && (
                  <div className="border-t border-[#E5E7EB] p-4 space-y-4 bg-[#F9FAFB]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">Card Label</label>
                        <input
                          className="w-full h-10 px-3.5 text-sm border border-[#E5E7EB] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#24B86C]/30 focus:border-[#24B86C] transition-all text-[#111827]"
                          value={card.label}
                          onChange={e => updateCard(card.id, { label: e.target.value })}
                          placeholder="Interior Design"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">Aspect Ratio</label>
                        <select
                          className="w-full h-10 px-3.5 border border-[#E5E7EB] rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#24B86C]/30 focus:border-[#24B86C] transition-all text-[#111827]"
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
                      <label className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">Image URL</label>
                      <div className="flex items-center gap-2">
                        <label className={`cursor-pointer flex items-center gap-2 text-sm px-4 py-2 rounded-xl border border-[#E5E7EB] bg-white hover:bg-[#F4F6F8] text-[#6B7280] hover:text-[#111827] transition-colors shrink-0 ${uploadingId === card.id ? 'opacity-50' : ''}`}>
                          {uploadingId === card.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                          {uploadingId === card.id ? 'Uploading…' : 'Upload'}
                          <input type="file" accept="image/*" className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0]; if (!file) return;
                              setUploadingId(card.id);
                              try {
                                const url = await uploadImage(file);
                                updateCard(card.id, { img: url });
                                toast('Image uploaded ✓');
                              } catch {
                                toast('Upload failed', 'error');
                              } finally {
                                setUploadingId(null);
                              }
                            }}
                            disabled={uploadingId != null}
                          />
                        </label>
                        <input
                          className="flex-1 h-10 px-3.5 text-xs font-mono border border-[#E5E7EB] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#24B86C]/30 focus:border-[#24B86C] transition-all text-[#111827]"
                          value={card.img}
                          onChange={e => updateCard(card.id, { img: e.target.value })}
                          placeholder="https://images.unsplash.com/…"
                        />
                      </div>
                    </div>

                    {/* Image preview */}
                    {card.img && (
                      <div className={`relative w-full max-w-[200px] ${card.aspect} rounded-xl overflow-hidden border border-[#E5E7EB]`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={card.img} alt={card.label} className="absolute inset-0 w-full h-full object-cover" />
                      </div>
                    )}

                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center gap-2.5 cursor-pointer select-none" onClick={() => updateCard(card.id, { featured: !card.featured })}>
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border-2 transition-all ${card.featured ? 'bg-[#24B86C] border-[#24B86C]' : 'bg-white border-[#D1D5DB]'}`}>
                          {card.featured && <div className="w-2 h-2 bg-white rounded-sm" />}
                        </div>
                        <span className="text-sm font-medium text-[#374151]">Featured (larger card)</span>
                      </label>
                      <label className="flex items-center gap-2.5 cursor-pointer select-none" onClick={() => updateCard(card.id, { dark: !card.dark })}>
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border-2 transition-all ${card.dark ? 'bg-[#24B86C] border-[#24B86C]' : 'bg-white border-[#D1D5DB]'}`}>
                          {card.dark && <div className="w-2 h-2 bg-white rounded-sm" />}
                        </div>
                        <span className="text-sm font-medium text-[#374151]">Dark overlay with play icon</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add card button */}
          <button
            onClick={addCard}
            className="w-full h-14 rounded-2xl border-2 border-dashed border-[#D1D5DB] hover:border-[#24B86C] hover:bg-[#F0FDF4] flex items-center justify-center gap-2 text-sm font-semibold text-[#9CA3AF] hover:text-[#24B86C] transition-all"
          >
            <Plus className="w-4 h-4" /> Add New Hero Card
          </button>

          {/* Mini preview grid */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-4 h-4 text-[#24B86C]" />
              <h3 className="text-sm font-semibold text-[#111827]">Cards Preview</h3>
              <span className="text-xs text-[#9CA3AF] ml-auto">{cards.length} cards</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {cards.map(card => (
                <div key={card.id} className="flex flex-col items-center gap-1.5">
                  <div className="w-16 h-12 rounded-lg bg-[#F4F6F8] overflow-hidden border border-[#E5E7EB]">
                    {card.img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={card.img} alt={card.label} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-4 h-4 text-[#D1D5DB]" />
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-[#9CA3AF] max-w-[64px] text-center truncate">{card.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: Search Bar ── */}
      {activeTab === 'search' && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
          <div className="flex items-center gap-2 mb-5">
            <Search className="w-4 h-4 text-[#24B86C]" />
            <h2 className="text-base font-semibold text-[#111827]">Search Bar</h2>
          </div>
          <Field
            label="Search Placeholder Text"
            value={hero.search_placeholder}
            onChange={v => update('search_placeholder', v)}
            placeholder="What are you looking for today?"
          />
          {/* Preview */}
          <div className="mt-4 flex items-center gap-3 h-12 px-5 rounded-full bg-[#F4F6F8] border border-[#E5E7EB]">
            <Search className="w-4 h-4 text-[#9CA3AF]" />
            <span className="text-[#9CA3AF] text-sm">{hero.search_placeholder || 'Search placeholder…'}</span>
          </div>
        </div>
      )}

      {/* Save footer */}
      <div className="flex justify-end pb-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#24B86C] text-white text-sm font-semibold hover:bg-[#1fa35f] disabled:opacity-60 transition-all shadow-sm"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving…' : 'Save All Changes'}
        </button>
      </div>
    </div>
  );
}
