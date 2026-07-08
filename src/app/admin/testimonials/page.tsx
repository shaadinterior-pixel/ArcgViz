"use client";

import React, { useState, useEffect } from 'react';
import { fetchTestimonials, saveTestimonial, deleteTestimonial, type Testimonial } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Trash, Plus, Save, Upload, Loader2, Star } from 'lucide-react';

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const uploadImage = async (file: File): Promise<string> => {
    const fd = new FormData(); fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return data.secure_url as string;
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await fetchTestimonials();
      setTestimonials(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (testimonial: Testimonial) => {
    try {
      await saveTestimonial(testimonial);
      alert("Testimonial saved successfully to Supabase!");
      loadData();
    } catch (e: any) {
      alert("Failed to save. Have you created the 'testimonials' table in Supabase? Error: " + e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    try {
      await deleteTestimonial(id);
      loadData();
    } catch (e: any) {
      alert("Failed to delete. " + e.message);
    }
  };

  const handleUpdateField = (id: string, field: keyof Testimonial, value: any) => {
    setTestimonials(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Manage Reviews</h1>
          <p className="text-muted-foreground mt-1">Update the 'Wall of Love' section on the homepage.</p>
        </div>
        <Button onClick={() => setTestimonials([{
          id: crypto.randomUUID(),
          name: "",
          role: "",
          image: "",
          text: "",
          rating: 5
        }, ...testimonials])}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Review
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {testimonials.map((testimonial, index) => (
          <div key={testimonial.id} className="bg-card border border-border p-6 rounded-2xl shadow-sm flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-lg font-bold">Review {index + 1}</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleSave(testimonial)}>
                  <Save className="w-4 h-4 mr-2" /> Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-500 text-red-500 hover:bg-red-500/10"
                  onClick={() => handleDelete(testimonial.id)}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-4 flex-1">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Name</label>
                <Input value={testimonial.name} onChange={e => handleUpdateField(testimonial.id, 'name', e.target.value)} placeholder="e.g. Priya Sharma" />
              </div>
              
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Role / Company</label>
                <Input value={testimonial.role} onChange={e => handleUpdateField(testimonial.id, 'role', e.target.value)} placeholder="e.g. Founder, Bloom Decor" />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Rating (1-5)</label>
                <div className="flex gap-2 items-center">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => handleUpdateField(testimonial.id, 'rating', star)}
                      className={`p-1 rounded-md transition-colors ${testimonial.rating >= star ? 'text-yellow-400' : 'text-zinc-200'}`}
                    >
                      <Star className="w-6 h-6 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Avatar Image</label>
                <div className="flex gap-2">
                  <Input className="flex-1" value={testimonial.image} onChange={e => handleUpdateField(testimonial.id, 'image', e.target.value)} placeholder="URL or upload ->" />
                  <Button type="button" variant="outline" disabled={uploadingId === testimonial.id} className="relative overflow-hidden w-28 shrink-0">
                    {uploadingId === testimonial.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Upload className="w-4 h-4 mr-2" /> Upload</>}
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      disabled={uploadingId === testimonial.id}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          setUploadingId(testimonial.id);
                          const url = await uploadImage(file);
                          handleUpdateField(testimonial.id, 'image', url);
                        } catch (error) {
                          alert("Failed to upload image");
                        } finally {
                          setUploadingId(null);
                          e.target.value = '';
                        }
                      }}
                    />
                  </Button>
                </div>
                {testimonial.image && (
                  <div className="mt-2 w-12 h-12 rounded-full overflow-hidden border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={testimonial.image} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Review Text</label>
                <textarea
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]"
                  value={testimonial.text}
                  onChange={e => handleUpdateField(testimonial.id, 'text', e.target.value)}
                  placeholder="The text of their review..."
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
