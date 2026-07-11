"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Loader2, Image as ImageIcon, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { fetchPortfolioItems, savePortfolioItem, deletePortfolioItem, type PortfolioItem, fetchPortfolioContent, savePortfolioContent, type PortfolioContent, DEFAULT_PORTFOLIO_CONTENT } from '@/lib/store';

type UploadResponse = {
  secure_url?: string;
  url?: string;
};

export default function AdminPortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [content, setContent] = useState<PortfolioContent>(DEFAULT_PORTFOLIO_CONTENT);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<Partial<PortfolioItem> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingContent, setIsSavingContent] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [bulkUploading, setBulkUploading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [itemsData, contentData] = await Promise.all([
      fetchPortfolioItems(),
      fetchPortfolioContent()
    ]);
    setItems(itemsData);
    setContent(contentData);
    setLoading(false);
  };

  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingContent(true);
    try {
      await savePortfolioContent(content);
      alert('Content saved successfully');
    } catch (err: any) {
      alert(err.message || 'Failed to save content');
    } finally {
      setIsSavingContent(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsSavingContent(true);
    try {
      const urls = await Promise.all(files.map(uploadImage));
      const newLogos = [...(content.partner_logos || []), ...urls];
      setContent({ ...content, partner_logos: newLogos });
      await savePortfolioContent({ ...content, partner_logos: newLogos });
    } catch (err: any) {
      alert(err.message || 'Failed to upload logos');
    } finally {
      setIsSavingContent(false);
      e.target.value = '';
    }
  };

  const handleRemoveLogo = async (indexToRemove: number) => {
    if (!confirm('Remove this logo?')) return;
    setIsSavingContent(true);
    try {
      const newLogos = (content.partner_logos || []).filter((_, idx) => idx !== indexToRemove);
      setContent({ ...content, partner_logos: newLogos });
      await savePortfolioContent({ ...content, partner_logos: newLogos });
    } catch (err: any) {
      alert(err.message || 'Failed to remove logo');
    } finally {
      setIsSavingContent(false);
    }
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
      await loadData();
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
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append('file', file);

    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    if (!res.ok) throw new Error('Upload failed');

    const data = await res.json() as UploadResponse;
    const url = data.secure_url || data.url;
    if (!url) throw new Error('Upload finished without an image URL');

    return url.replace(/^http:\/\/res\.cloudinary\.com/i, 'https://res.cloudinary.com');
  };

  const getNextSortOrder = () => {
    if (items.length === 0) return 1;
    return Math.max(...items.map(item => Number(item.sort_order || 0))) + 1;
  };

  const titleFromFileName = (name: string) => {
    const baseName = name.replace(/\.[^/.]+$/, '');
    return baseName
      .replace(/[-_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, char => char.toUpperCase()) || 'Portfolio Project';
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadImage(file);
      setIsEditing(prev => ({ ...prev, image_url: url }));
    } catch (err: any) {
      alert(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleBulkImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setBulkUploading(true);
    try {
      const firstOrder = getNextSortOrder();
      const urls = await Promise.all(files.map(uploadImage));

      await Promise.all(urls.map((url, index) => savePortfolioItem({
        id: crypto.randomUUID(),
        title: titleFromFileName(files[index].name),
        image_url: url,
        link: '',
        sort_order: firstOrder + index,
      })));

      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to upload images');
    } finally {
      setBulkUploading(false);
      e.target.value = '';
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
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Portfolio Showcase</h1>
        <p className="text-zinc-500 text-sm mt-1">Manage the content and 3D carousel images on the homepage. The first 12 images by order are used in the carousel.</p>
      </div>

      {/* ── Section Content Editor ── */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
        <h2 className="text-lg font-bold mb-4">Section Header Text</h2>
        <form onSubmit={handleSaveContent} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Badge Text</label>
              <input
                type="text"
                value={content.badge_text}
                onChange={e => setContent({ ...content, badge_text: e.target.value })}
                className="w-full px-4 py-2 border rounded-xl bg-zinc-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Headline Line 1</label>
              <input
                type="text"
                value={content.headline_line1}
                onChange={e => setContent({ ...content, headline_line1: e.target.value })}
                className="w-full px-4 py-2 border rounded-xl bg-zinc-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Headline Line 2 (Highlighted)</label>
              <input
                type="text"
                value={content.headline_line2}
                onChange={e => setContent({ ...content, headline_line2: e.target.value })}
                className="w-full px-4 py-2 border rounded-xl bg-zinc-50"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Subheadline</label>
              <textarea
                value={content.subheadline}
                onChange={e => setContent({ ...content, subheadline: e.target.value })}
                className="w-full px-4 py-2 border rounded-xl bg-zinc-50 h-24 resize-none"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2 border-t border-zinc-100">
            <Button type="submit" disabled={isSavingContent} className="bg-[#24B86C] text-white hover:bg-[#1E995A]">
              {isSavingContent ? 'Saving...' : 'Save Text Content'}
            </Button>
          </div>
        </form>

        <div className="mt-8 pt-8 border-t border-zinc-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold">Partner Logos</h3>
              <p className="text-sm text-zinc-500">Logos displayed moving behind the main image in the Portfolio Section.</p>
            </div>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleLogoUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isSavingContent}
              />
              <Button type="button" variant="outline" disabled={isSavingContent}>
                {isSavingContent ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                Add Logos
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {(content.partner_logos || []).map((logo, idx) => (
              <div key={idx} className="relative group bg-zinc-50 rounded-xl border border-zinc-200 overflow-hidden aspect-square flex items-center justify-center p-2">
                <img src={logo} alt={`Logo ${idx}`} className="max-w-full max-h-full object-contain" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                  <button 
                    onClick={() => handleRemoveLogo(idx)}
                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                    title="Remove Logo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {(content.partner_logos || []).length === 0 && (
              <div className="col-span-full py-6 text-center text-zinc-400 bg-zinc-50 rounded-xl border border-zinc-200 border-dashed">
                No logos added. Click "Add Logos" to upload.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold">Carousel Images</h2>
          <p className="text-sm text-zinc-500">Upload images in bulk, then adjust titles, links, and order below.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleBulkImageUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={bulkUploading}
            />
            <Button type="button" variant="outline" disabled={bulkUploading}>
              {bulkUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
              {bulkUploading ? 'Uploading...' : 'Bulk Upload'}
            </Button>
          </div>
          <Button onClick={() => setIsEditing({ sort_order: getNextSortOrder() })} className="bg-[#24B86C] hover:bg-[#1E995A] text-white">
            <Plus className="w-4 h-4 mr-2" /> Add Item
          </Button>
        </div>
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
