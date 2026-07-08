"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Tag, Save, Edit2, X, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { fetchCategories, saveCategories, deleteCategory, onStoreUpdate, type Category } from '@/lib/store';

function generateId(title: string) {
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-');
}

export default function AdminCategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // new category input
  const [newTitle, setNewTitle] = useState('');
  const [addingNew, setAddingNew] = useState(false);

  // subcategory management
  const [addingSubFor, setAddingSubFor] = useState<string | null>(null);
  const [newSubTitle, setNewSubTitle] = useState('');

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

  const handleAdd = async () => {
    const title = newTitle.trim();
    if (!title) { toast('Enter a category name', 'error'); return; }
    const id = generateId(title);
    if (categories.some(c => c.id === id)) { toast('Category already exists', 'error'); return; }
    setSaving(true);
    try {
      const cat: Category = { id, title, description: '', cards: [], subcategories: [] };
      await saveCategories([cat]);
      setCategories(prev => [...prev, cat]);
      setNewTitle('');
      setAddingNew(false);
      toast('Category added ✓');
    } catch { toast('Save failed', 'error'); }
    finally { setSaving(false); }
  };

  const handleEdit = async (cat: Category) => {
    const title = editTitle.trim();
    if (!title) { toast('Title cannot be empty', 'error'); return; }
    setSaving(true);
    try {
      const updated = { ...cat, title };
      await saveCategories([updated]);
      setCategories(prev => prev.map(c => c.id === cat.id ? updated : c));
      setEditingId(null);
      toast('Category updated ✓');
    } catch { toast('Update failed', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product category?')) return;
    try {
      await deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      toast('Category deleted');
    } catch { toast('Delete failed', 'error'); }
  };

  const handleAddSub = async (cat: Category) => {
    const title = newSubTitle.trim();
    if (!title) { toast('Enter a subcategory name', 'error'); return; }
    
    const subs = cat.subcategories || [];
    if (subs.includes(title)) { toast('Subcategory already exists', 'error'); return; }
    
    setSaving(true);
    try {
      const updated = { ...cat, subcategories: [...subs, title] };
      await saveCategories([updated]);
      setCategories(prev => prev.map(c => c.id === cat.id ? updated : c));
      setNewSubTitle('');
      setAddingSubFor(null);
      toast('Subcategory added ✓');
    } catch { toast('Update failed', 'error'); }
    finally { setSaving(false); }
  };

  const handleDeleteSub = async (cat: Category, subName: string) => {
    if (!confirm(`Delete subcategory "${subName}"?`)) return;
    setSaving(true);
    try {
      const updated = { ...cat, subcategories: (cat.subcategories || []).filter(s => s !== subName) };
      await saveCategories([updated]);
      setCategories(prev => prev.map(c => c.id === cat.id ? updated : c));
      toast('Subcategory deleted');
    } catch { toast('Update failed', 'error'); }
    finally { setSaving(false); }
  };

  const moveUp = async (idx: number) => {
    if (idx === 0) return;
    const a = [...categories];
    [a[idx - 1], a[idx]] = [a[idx], a[idx - 1]];
    try { await saveCategories(a); setCategories(a); }
    catch { toast('Reorder failed', 'error'); }
  };

  const moveDown = async (idx: number) => {
    if (idx >= categories.length - 1) return;
    const a = [...categories];
    [a[idx], a[idx + 1]] = [a[idx + 1], a[idx]];
    try { await saveCategories(a); setCategories(a); }
    catch { toast('Reorder failed', 'error'); }
  };

  if (loading) return (
    <div className="flex justify-center py-24">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Product Categories</h1>
          <p className="text-sm text-foreground/50 mt-1">
            Manage the categories used across the marketplace. These appear in product filters and the upload form.
          </p>
        </div>
        <Button
          onClick={() => { setAddingNew(true); setNewTitle(''); }}
          className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Category
        </Button>
      </div>

      {/* Add new category row */}
      {addingNew && (
        <Card className="glass-card border-primary/30">
          <CardContent className="p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-3">New Category</p>
            <div className="flex gap-3">
              <Input
                autoFocus
                placeholder="e.g. Interior Renders"
                className="bg-black/20 border-white/10 focus-visible:ring-primary flex-1"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setAddingNew(false); }}
              />
              <Button onClick={handleAdd} disabled={saving} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Save className="w-4 h-4 mr-1.5" /> Save
              </Button>
              <Button variant="outline" className="border-white/10" onClick={() => setAddingNew(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            {newTitle && (
              <p className="text-xs text-foreground/30 mt-2 font-mono">
                ID: {generateId(newTitle)}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Category list */}
      <div className="space-y-2">
        {categories.length === 0 && !addingNew && (
          <div className="text-center py-16 border-2 border-dashed border-white/10 rounded-2xl text-foreground/40">
            <Tag className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No product categories yet.</p>
            <button
              onClick={() => setAddingNew(true)}
              className="text-primary text-sm underline mt-2"
            >
              Add the first one
            </button>
          </div>
        )}

        {categories.map((cat, idx) => (
          <Card key={cat.id} className="glass-card overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3">
              {/* Drag handle (decorative) */}
              <GripVertical className="w-4 h-4 text-foreground/20 shrink-0" />

              {/* Icon */}
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                <Tag className="w-3.5 h-3.5 text-primary" />
              </div>

              {/* Content: edit or display */}
              {editingId === cat.id ? (
                <div className="flex-1 flex gap-2 items-center">
                  <Input
                    autoFocus
                    className="bg-black/20 border-white/10 focus-visible:ring-primary h-8 text-sm"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleEdit(cat); if (e.key === 'Escape') setEditingId(null); }}
                  />
                  <button
                    onClick={() => handleEdit(cat)}
                    disabled={saving}
                    className="p-1.5 rounded-lg text-foreground/40 hover:text-primary hover:bg-primary/10 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="p-1.5 rounded-lg text-foreground/40 hover:text-foreground hover:bg-white/10 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{cat.title}</p>
                  <p className="text-xs text-foreground/30 font-mono">{cat.id}</p>
                </div>
              )}

              {/* Actions */}
              {editingId !== cat.id && (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => moveUp(idx)}
                    disabled={idx === 0}
                    className="p-1 rounded text-foreground/30 hover:text-foreground hover:bg-white/10 disabled:opacity-20 transition-colors"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveDown(idx)}
                    disabled={idx === categories.length - 1}
                    className="p-1 rounded text-foreground/30 hover:text-foreground hover:bg-white/10 disabled:opacity-20 transition-colors"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { setEditingId(cat.id); setEditTitle(cat.title); }}
                    className="p-1.5 rounded-lg text-foreground/40 hover:text-primary hover:bg-primary/10 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-1.5 rounded-lg text-foreground/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Subcategories Section */}
            <div className="border-t border-white/5 bg-black/10 px-12 py-3">
              <div className="flex flex-wrap items-center gap-2">
                {(cat.subcategories || []).map(sub => (
                  <span key={sub} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-foreground/70">
                    {sub}
                    <button onClick={() => handleDeleteSub(cat, sub)} className="hover:text-red-400 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                
                {addingSubFor === cat.id ? (
                  <div className="flex items-center gap-1">
                    <Input
                      autoFocus
                      placeholder="New subcategory..."
                      className="bg-black/20 border-white/10 h-7 text-xs w-36 px-2"
                      value={newSubTitle}
                      onChange={e => setNewSubTitle(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleAddSub(cat); if (e.key === 'Escape') setAddingSubFor(null); }}
                    />
                    <button onClick={() => handleAddSub(cat)} className="p-1 rounded bg-primary text-primary-foreground hover:bg-primary/90">
                      <Save className="w-3 h-3" />
                    </button>
                    <button onClick={() => setAddingSubFor(null)} className="p-1 rounded bg-white/10 text-foreground/70 hover:bg-white/20">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => { setAddingSubFor(cat.id); setNewSubTitle(''); }} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-dashed border-white/20 text-xs text-foreground/40 hover:text-foreground/70 hover:border-white/40 transition-colors">
                    <Plus className="w-3 h-3" /> Add Subcategory
                  </button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Info box */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/15 text-sm">
        <Tag className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p className="text-foreground/60 text-xs leading-relaxed">
          These categories are used in the <strong className="text-foreground/80">Add/Edit Product</strong> form and in the <strong className="text-foreground/80">Marketplace</strong> sidebar filters. Add, rename, or remove them here — changes take effect immediately.
        </p>
      </div>
    </div>
  );
}
