"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Loader2, GripVertical, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { fetchPortfolioItems, savePortfolioItem, deletePortfolioItem, type PortfolioItem } from '@/lib/store';
import { supabase } from '@/lib/supabase';

export default function AdminPortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<Partial<PortfolioItem> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    const data = await fetchPortfolioItems();
    setItems(data);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing?.title || !isEditing?.image_url) {
      alert('Title and Image URL are required');
      return;
    }
    
    setIsSaving(true);
    try {
      const itemToSave: PortfolioItem = {
        id: isEditing.id || crypto.randomUUID(),
        title: isEditing.title,
        image_url: isEditing.image_url,
        link: isEditing.link || '',
        sort_order: isEditing.sort_order || items.length,
      };
      
      await savePortfolioItem(itemToSave);
      await loadItems();
      setIsEditing(null);
    } catch (err: any) {
      alert(err.message || 'Failed to save item');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this portfolio item?')) return;
    try {
      await deletePortfolioItem(id);
      await loadItems();
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `portfolio/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      setIsEditing(prev => ({ ...prev, image_url: data.publicUrl }));
    } catch (err: any) {
      alert(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Portfolio Showcase</h1>
          <p className="text-zinc-500 text-sm mt-1">Manage the 3D slider images on the homepage.</p>
        </div>
        <Button onClick={() => setIsEditing({})} className="bg-[#24B86C] hover:bg-[#1E995A] text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Item
        </Button>
      </div>

      {isEditing && (
        <div className="mb-8 p-6 bg-white rounded-2xl border border-zinc-200 shadow-sm">
          <h2 className="text-lg font-bold mb-4">{isEditing.id ? 'Edit Item' : 'New Portfolio Item'}</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={isEditing.title || ''}
                onChange={e => setIsEditing({ ...isEditing, title: e.target.value })}
                className="w-full px-4 py-2 border rounded-xl"
                placeholder="Project Title"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Image URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={isEditing.image_url || ''}
                  onChange={e => setIsEditing({ ...isEditing, image_url: e.target.value })}
                  className="flex-1 px-4 py-2 border rounded-xl"
                  placeholder="https://..."
                  required
                />
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploading}
                  />
                  <Button type="button" variant="outline" disabled={uploading}>
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4 mr-2" />}
                    {uploading ? 'Uploading...' : 'Upload'}
                  </Button>
                </div>
              </div>
              {isEditing.image_url && (
                <div className="mt-2">
                  <img src={isEditing.image_url} alt="Preview" className="h-32 rounded-lg object-cover" />
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Project Link (Optional)</label>
                <input
                  type="url"
                  value={isEditing.link || ''}
                  onChange={e => setIsEditing({ ...isEditing, link: e.target.value })}
                  className="w-full px-4 py-2 border rounded-xl"
                  placeholder="https://..."
                />
              </div>
              <div className="w-32">
                <label className="block text-sm font-medium mb-1">Order</label>
                <input
                  type="number"
                  value={isEditing.sort_order || 0}
                  onChange={e => setIsEditing({ ...isEditing, sort_order: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-xl"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditing(null)}>Cancel</Button>
              <Button type="submit" disabled={isSaving} className="bg-[#24B86C] text-white">
                {isSaving ? 'Saving...' : 'Save Item'}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase">Image</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase">Title</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase">Order</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-zinc-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-zinc-50/50">
                <td className="px-6 py-4">
                  <img src={item.image_url} alt={item.title} className="w-16 h-12 object-cover rounded shadow-sm" />
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold">{item.title}</div>
                  {item.link && <a href={item.link} target="_blank" className="text-xs text-blue-500 hover:underline">{item.link}</a>}
                </td>
                <td className="px-6 py-4 text-zinc-500">{item.sort_order}</td>
                <td className="px-6 py-4 text-right">
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(item)} className="mr-2">
                    <Pencil className="w-4 h-4 text-zinc-500" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">
                  No portfolio items found. Add some to display on the homepage!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
