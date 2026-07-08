"use client";

import React, { useState, useEffect } from 'react';
import { fetchServices, saveService, deleteService, fetchCategories, type ServiceDetail } from '@/lib/store';
import { defaultServices } from '@/components/ui/WhatWeDoSection';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CheckCircle2, Trash, Plus, Save, ChevronDown, Upload, Loader2 } from 'lucide-react';

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceDetail[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
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
      const [data, cats] = await Promise.all([fetchServices(), fetchCategories()]);
      
      const catTitles = cats.map(c => c.title);
      setCategories(catTitles.length > 0 ? catTitles : ['General']);

      if (data && data.length > 0) {
        setServices(data);
      } else {
        setServices(defaultServices);
      }
    } catch (e) {
      console.error(e);
      setServices(defaultServices);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (service: ServiceDetail) => {
    try {
      await saveService(service);
      alert("Service saved successfully to Supabase!");
      loadData();
    } catch (e: any) {
      alert("Failed to save. Have you created the 'services' table in Supabase? Error: " + e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    try {
      await deleteService(id);
      loadData();
    } catch (e: any) {
      alert("Failed to delete. " + e.message);
    }
  };

  const handleUpdateField = (id: string, field: keyof ServiceDetail, value: any) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Manage Services</h1>
          <p className="text-muted-foreground mt-1">Update the 'What We Do' section on the homepage.</p>
        </div>
        <Button onClick={() => setServices([{
          id: `s${Date.now()}`,
          category: categories[0] || "General",
          title: "",
          tagline: "",
          image: "",
          description: "",
          includes: [""]
        }, ...services])}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Service
        </Button>
      </div>

      <div className="space-y-8">
        {services.map((service, index) => (
          <div key={service.id} className="bg-card border border-border p-6 rounded-2xl shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-lg font-bold">Service {index + 1}</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleSave(service)}>
                  <Save className="w-4 h-4 mr-2" /> Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-500 text-red-500 hover:bg-red-500/10"
                  onClick={() => handleDelete(service.id)}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">

                {/* Category dropdown */}
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
                    Service Category
                  </label>
                  <div className="relative">
                    <select
                      className="w-full appearance-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring pr-8"
                      value={service.category}
                      onChange={e => handleUpdateField(service.id, 'category', e.target.value)}
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Title</label>
                  <Input value={service.title} onChange={e => handleUpdateField(service.id, 'title', e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Tagline</label>
                  <Input value={service.tagline} onChange={e => handleUpdateField(service.id, 'tagline', e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Image</label>
                  <div className="flex gap-2">
                    <Input className="flex-1" value={service.image} onChange={e => handleUpdateField(service.id, 'image', e.target.value)} placeholder="URL or upload ->" />
                    <Button type="button" variant="outline" disabled={uploadingId === service.id} className="relative overflow-hidden w-28 shrink-0">
                      {uploadingId === service.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Upload className="w-4 h-4 mr-2" /> Upload</>}
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        disabled={uploadingId === service.id}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            setUploadingId(service.id);
                            const url = await uploadImage(file);
                            handleUpdateField(service.id, 'image', url);
                          } catch (error) {
                            alert("Failed to upload image");
                          } finally {
                            setUploadingId(null);
                            // reset file input
                            e.target.value = '';
                          }
                        }}
                      />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Description</label>
                  <textarea
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]"
                    value={service.description}
                    onChange={e => handleUpdateField(service.id, 'description', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">What's Included (Checklist)</label>
                {service.includes.map((item, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    <Input
                      value={item}
                      onChange={e => {
                        const newIncludes = [...service.includes];
                        newIncludes[i] = e.target.value;
                        handleUpdateField(service.id, 'includes', newIncludes);
                      }}
                    />
                    <Button variant="ghost" size="sm" onClick={() => {
                      const newIncludes = service.includes.filter((_, index) => index !== i);
                      handleUpdateField(service.id, 'includes', newIncludes);
                    }}>X</Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleUpdateField(service.id, 'includes', [...service.includes, "New Item"])}
                >
                  + Add Checklist Item
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
