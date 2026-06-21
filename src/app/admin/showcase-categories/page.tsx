"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, X, Layers, ChevronDown, ChevronUp, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';

import { fetchCategories, saveCategories, deleteCategory, onStoreUpdate, type Category, type CardEntry } from '@/lib/store';

const EMPTY_CAT: Omit<Category, 'id'> = { title: '', description: '', cards: [] };
const EMPTY_CARD: CardEntry = { name: '', count: '', image: '' };

export default function AdminCategoriesPage() {
  const { toast } = useToast();
  const [categories,  setCategories]  = useState<Category[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [isOpen,      setIsOpen]      = useState(false);
  const [editing,     setEditing]     = useState<Category | null>(null);
  const [expandedId,  setExpandedId]  = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState<number | null>(null);

  const load = useCallback(async () => {
    try { setCategories(await fetchCategories()); }
    catch { toast('Failed to load categories', 'error'); }
    finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { 
    load();
    const unsub = onStoreUpdate('categories', load);
    return () => unsub();
  }, [load]);

  const persist = async (categoryToSave: Category, isNew: boolean) => {
    setSaving(true);
    try { 
      await saveCategories([categoryToSave]); 
      setCategories(prev => {
        const idx = prev.findIndex(c => c.id === categoryToSave.id);
        if (idx >= 0) { const a = [...prev]; a[idx] = categoryToSave; return a; }
        return [...prev, categoryToSave];
      });
    }
    catch { toast('Save failed', 'error'); }
    finally { setSaving(false); }
  };

  const openNew  = () => { setEditing({ id: `tmp-${Date.now()}`, ...EMPTY_CAT }); setIsOpen(true); };
  const openEdit = (c: Category) => { setEditing({ ...c, cards: (c.cards || []).map(card => ({ ...card })) }); setIsOpen(true); };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this showcase category?')) return;
    try {
      await deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      toast('Category deleted');
    } catch {
      toast('Failed to delete category', 'error');
    }
  };

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.title.trim()) { toast('Title is required', 'error'); return; }
    let cat = { ...editing, cards: (editing.cards || []).filter(c => c.name.trim()) };
    
    const isNew = cat.id.startsWith('tmp-');
    if (isNew) {
      cat.id = cat.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    
    await persist(cat, isNew);
    toast(isNew ? 'Category added ✓' : 'Category updated ✓');
    setIsOpen(false);
  };

  const addCard    = () => setEditing(e => e ? { ...e, cards: [...e.cards, { ...EMPTY_CARD }] } : null);
  const removeCard = (i: number) => setEditing(e => e ? { ...e, cards: e.cards.filter((_, idx) => idx !== i) } : null);
  const updateCard = (i: number, field: keyof CardEntry, val: string) =>
    setEditing(e => {
      if (!e) return null;
      const cards = [...e.cards];
      cards[i] = { ...cards[i], [field]: val };
      return { ...e, cards };
    });

  const handleImageUpload = async (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(i);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      
      updateCard(i, 'image', data.secure_url);
      toast('Image uploaded successfully');
    } catch (error) {
      toast('Failed to upload image', 'error');
    } finally {
      setUploadingImage(null);
    }
  };

  const moveUp   = async (idx: number) => { 
    if (idx === 0) return; 
    const a = [...categories]; 
    [a[idx-1], a[idx]] = [a[idx], a[idx-1]]; 
    try {
      await saveCategories(a);
      setCategories(a);
      toast('Moved up'); 
    } catch { toast('Move failed', 'error'); }
  };
  
  const moveDown = async (idx: number) => { 
    if (idx >= categories.length-1) return; 
    const a = [...categories]; 
    [a[idx], a[idx+1]] = [a[idx+1], a[idx]]; 
    try {
      await saveCategories(a);
      setCategories(a);
      toast('Moved down'); 
    } catch { toast('Move failed', 'error'); }
  };

  if (loading) return <div className="flex justify-center py-20"><Layers className="w-8 h-8 text-primary animate-pulse" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Showcase Categories</h1>
          <p className="text-sm text-foreground/50 mt-1">Control the horizontal scroll sections on the homepage</p>
        </div>
        <Button onClick={openNew} className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0">
          <Plus className="w-4 h-4 mr-2" /> Add Category
        </Button>
      </div>

      <div className="space-y-3">
        {categories.map((cat, idx) => (
          <Card key={cat.id} className="bg-card border-border">
            <div
              className="flex items-center gap-4 px-5 py-4 cursor-pointer select-none hover:bg-secondary/20 transition-colors rounded-xl"
              onClick={() => setExpandedId(expandedId === cat.id ? null : cat.id)}
            >
              <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{cat.title}</p>
                <p className="text-xs text-foreground/40 truncate">{cat.description}</p>
              </div>
              <span className="text-xs text-foreground/30 shrink-0">{(cat.cards || []).length} cards</span>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={e => { e.stopPropagation(); moveUp(idx); }} className="p-1 rounded-lg text-foreground/30 hover:text-foreground hover:bg-secondary transition-colors" disabled={idx === 0}>
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button onClick={e => { e.stopPropagation(); moveDown(idx); }} className="p-1 rounded-lg text-foreground/30 hover:text-foreground hover:bg-secondary transition-colors" disabled={idx === categories.length - 1}>
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button onClick={e => { e.stopPropagation(); openEdit(cat); }} className="p-1.5 rounded-lg text-foreground/40 hover:text-primary hover:bg-primary/10 transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={e => { e.stopPropagation(); handleDelete(cat.id); }} className="p-1.5 rounded-lg text-foreground/40 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Expanded cards preview */}
            {expandedId === cat.id && (
              <div className="px-5 pb-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 border-t border-border pt-4">
                {(cat.cards || []).map((card, ci) => (
                  <div key={ci} className="rounded-xl overflow-hidden border border-border bg-secondary/30 aspect-[3/4] relative">
                    {card.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={card.image} alt={card.name} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                    )}
                    <div className="absolute bottom-0 left-0 w-full p-2 bg-gradient-to-t from-black/80 to-transparent">
                      <p className="text-xs font-semibold text-white truncate">{card.name}</p>
                      <p className="text-[10px] text-white/60">{card.count}</p>
                    </div>
                  </div>
                ))}
                {(cat.cards || []).length === 0 && (
                  <p className="col-span-full text-sm text-foreground/40 py-4">No cards yet. Click Edit to add some.</p>
                )}
              </div>
            )}
          </Card>
        ))}
        {categories.length === 0 && (
          <div className="text-center py-16 text-foreground/40">
            <Layers className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No showcase categories yet.</p>
            <button onClick={openNew} className="text-primary text-sm underline mt-2">Add the first one</button>
          </div>
        )}
      </div>

      {/* Modal */}
      {isOpen && editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-card w-full max-w-2xl rounded-2xl border border-border shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-bold">{editing.id.startsWith('tmp-') ? 'Add Category' : 'Edit Category'}</h2>
              <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg text-foreground/40 hover:text-foreground hover:bg-secondary transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-foreground/50">Title *</label>
                <Input className="bg-secondary/40 border-border" placeholder="PBR Materials" value={editing.title}
                  onChange={e => setEditing({ ...editing, title: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-foreground/50">Description</label>
                <Input className="bg-secondary/40 border-border" placeholder="Ultra-realistic textures…" value={editing.description}
                  onChange={e => setEditing({ ...editing, description: e.target.value })} />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-foreground/50">Cards</label>
                  <button onClick={addCard} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors">
                    <Plus className="w-3.5 h-3.5" /> Add Card
                  </button>
                </div>
                {editing.cards.map((card, ci) => (
                  <div key={ci} className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 bg-secondary/30 rounded-xl border border-border relative">
                    <Input className="bg-background/50 border-border text-sm" placeholder="Name (e.g. Wood Materials)"
                      value={card.name} onChange={e => updateCard(ci, 'name', e.target.value)} />
                    <Input className="bg-background/50 border-border text-sm" placeholder="Count (e.g. 1,204 Assets)"
                      value={card.count} onChange={e => updateCard(ci, 'count', e.target.value)} />
                      <div className="flex gap-2">
                        <label className={`cursor-pointer bg-secondary hover:bg-secondary/80 text-foreground text-sm px-3 rounded-lg border border-border transition-colors flex items-center justify-center whitespace-nowrap ${uploadingImage === ci ? 'opacity-50' : ''}`}>
                          {uploadingImage === ci ? '...' : <Plus className="w-4 h-4" />}
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleImageUpload(ci, e)}
                            disabled={uploadingImage === ci}
                          />
                        </label>
                        <Input className="bg-background/50 border-border text-sm flex-1" placeholder="Or paste Image URL"
                          value={card.image} onChange={e => updateCard(ci, 'image', e.target.value)} />
                        <button onClick={() => removeCard(ci)} className="p-2 rounded-lg text-foreground/30 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                  </div>
                ))}
                {editing.cards.length === 0 && (
                  <div className="text-center py-6 border border-dashed border-border rounded-xl text-foreground/30 text-sm">
                    Click "+ Add Card" to add showcase cards
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[110px]">
                <Save className="w-4 h-4 mr-1.5" />
                {saving ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
