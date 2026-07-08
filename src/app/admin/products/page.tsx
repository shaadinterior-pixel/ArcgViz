"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, X, Image as ImageIcon, Package, ChevronDown, ExternalLink, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { fetchProducts, saveProducts, deleteProduct, fetchCategories, onStoreUpdate, generateSlug, type Product } from '@/lib/store';
import { googleDriveProvider } from '@/lib/storage/google-drive';

const FALLBACK_CATEGORIES = ['3D Models', 'PBR Materials', 'Interior Scenes', 'Furniture', 'Lighting', 'Architecture', 'Characters'];

const makeEmpty = (firstCategory: string): Omit<Product,'id'> => ({
  name:'', slug:'', price:'₹', category: firstCategory || 'General', description:'',
  image:'', thumbnail_url:'', gallery_images:[], status:'Active',
  sales:0, rating:'5.0', author:'Design Walla Studio',
  date: new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}),
  google_drive_share_link:'', google_drive_file_id:'', download_url:'', model_url:'',
  software_support:[], file_formats:[], poly_count:'', texture_resolution:'', file_size:'', features:[],
  plan_tier: 'Free',
});

type DriveStatus = 'idle'|'valid'|'invalid'|'checking';

export default function AdminProductsPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [dbCategories, setDbCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Product|null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState<number|null>(null);
  const [driveStatus, setDriveStatus] = useState<DriveStatus>('idle');

  const load = useCallback(async () => {
    try {
      const [prods, cats] = await Promise.all([fetchProducts(), fetchCategories()]);
      setProducts(prods);
      const titles = cats.map(c => c.title);
      setDbCategories(titles.length > 0 ? titles : FALLBACK_CATEGORIES);
    } catch { toast('Failed to load products','error'); }
    finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { load(); const u = onStoreUpdate('products', load); return u; }, [load]);

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    return (p.name.toLowerCase().includes(q) || (p.author??'').toLowerCase().includes(q)) &&
      (statusFilter==='All' || p.status===statusFilter);
  });

  const openNew = () => { setEditing({id:`tmp-${Date.now()}`,...makeEmpty(dbCategories[0])}); setDriveStatus('idle'); setIsOpen(true); };
  const openEdit = (p: Product) => { setEditing({...p}); setDriveStatus(p.google_drive_file_id?'valid':'idle'); setIsOpen(true); };

  const handleDelete = async (id:string) => {
    if(!confirm('Delete this product?')) return;
    try { await deleteProduct(id); setProducts(prev=>prev.filter(p=>p.id!==id)); toast('Deleted'); }
    catch { toast('Delete failed','error'); }
  };

  const setField = (key: keyof Product, val: unknown) =>
    setEditing(prev => prev ? {...prev,[key]:val} : null);

  const validateDriveLink = () => {
    if(!editing) return;
    setDriveStatus('checking');
    const result = googleDriveProvider.validateLink(editing.google_drive_share_link);
    if(result.valid && result.fileId && result.downloadUrl) {
      setEditing(prev => prev ? {...prev, google_drive_file_id:result.fileId!, download_url:result.downloadUrl!} : null);
      setDriveStatus('valid');
      toast('Drive link valid ✓');
    } else {
      setDriveStatus('invalid');
      toast(result.error ?? 'Invalid link','error');
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fd = new FormData(); fd.append('file', file);
    const res = await fetch('/api/upload',{method:'POST',body:fd});
    if(!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return data.secure_url as string;
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if(!file) return;
    setUploadingIdx(-1);
    try {
      const url = await uploadImage(file);
      setEditing(prev => prev ? {...prev, thumbnail_url:url, image:url} : null);
      toast('Thumbnail uploaded ✓');
    } catch { toast('Upload failed','error'); }
    finally { setUploadingIdx(null); }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files??[]); if(!files.length) return;
    setUploadingIdx(-2);
    try {
      const urls = await Promise.all(files.map(uploadImage));
      setEditing(prev => prev ? {...prev, gallery_images:[...(prev.gallery_images??[]),...urls]} : null);
      toast(`${urls.length} image(s) uploaded ✓`);
    } catch { toast('Upload failed','error'); }
    finally { setUploadingIdx(null); }
  };

  const removeGalleryImg = (idx: number) =>
    setEditing(prev => prev ? {...prev, gallery_images:prev.gallery_images.filter((_,i)=>i!==idx)} : null);

  const handleSave = async () => {
    if(!editing) return;
    if(!editing.name.trim()) { toast('Name required','error'); return; }
    if(!editing.price.trim()) { toast('Price required','error'); return; }
    const isNew = editing.id.startsWith('tmp-');
    const product: Product = {
      ...editing,
      id: isNew ? (editing.slug || generateSlug(editing.name)+'-'+Date.now()) : editing.id,
      slug: editing.slug || generateSlug(editing.name),
      image: editing.thumbnail_url || editing.image || '',
    };
    setSaving(true);
    try {
      await saveProducts([product]);
      setProducts(prev => { const i=prev.findIndex(p=>p.id===product.id); if(i>=0){const a=[...prev];a[i]=product;return a;} return [product,...prev]; });
      toast(isNew?'Product added ✓':'Product updated ✓');
      setIsOpen(false);
    } catch { toast('Save failed','error'); }
    finally { setSaving(false); }
  };

  if(loading) return <div className="flex justify-center h-64 items-center"><Package className="w-8 h-8 text-primary animate-pulse"/></div>;

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-sm text-foreground/50 mt-1">{products.length} total — {products.filter(p=>p.status==='Active').length} active</p>
        </div>
        <Button onClick={openNew} className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0">
          <Plus className="w-4 h-4 mr-2"/>Add Product
        </Button>
      </div>

      <Card className="glass-card overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40"/>
              <Input placeholder="Search products…" className="pl-9 bg-black/20 border-white/10" value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            <div className="relative">
              <select className="appearance-none bg-black/20 border border-white/10 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
                <option>All</option><option>Active</option><option>Draft</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/40 pointer-events-none"/>
            </div>
          </div>

          <div className="overflow-x-auto hide-scrollbar">
            <table className="w-full text-sm">
              <thead className="text-xs text-foreground/40 uppercase tracking-widest border-b border-white/10 bg-white/5">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">Product</th>
                  <th className="text-left px-5 py-3 font-medium hidden sm:table-cell">Category</th>
                  <th className="text-left px-5 py-3 font-medium">Price</th>
                  <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Drive</th>
                  <th className="text-left px-5 py-3 font-medium">Plan</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-right px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.length>0 ? filtered.map(p=>(
                  <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {(p.thumbnail_url||p.image) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.thumbnail_url||p.image} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0 shadow-sm group-hover:shadow-md transition-shadow" loading="lazy"/>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                            <ImageIcon className="w-4 h-4 text-foreground/30"/>
                          </div>
                        )}
                        <div>
                          <p className="font-bold line-clamp-1">{p.name}</p>
                          <p className="text-xs font-medium text-foreground/50">{p.slug || p.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-foreground/50 font-medium hidden sm:table-cell">{p.category}</td>
                    <td className="px-5 py-4 font-bold text-primary">{p.price}</td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      {p.google_drive_file_id ? (
                        <span className="flex items-center gap-1 text-green-400 text-xs"><CheckCircle2 className="w-3.5 h-3.5"/>Linked</span>
                      ) : (
                        <span className="text-foreground/30 text-xs">No file</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border ${
                        p.plan_tier === 'Free' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        p.plan_tier === 'Plus' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {p.plan_tier || 'Free'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border ${p.status==='Active'?'bg-green-500/10 text-green-400 border-green-500/20':'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={()=>openEdit(p)} className="p-2 rounded-lg text-foreground/40 hover:text-primary hover:bg-primary/10 transition-colors" title="Edit"><Edit className="w-4 h-4"/></button>
                        <button onClick={()=>handleDelete(p.id)} className="p-2 rounded-lg text-foreground/40 hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Delete"><Trash2 className="w-4 h-4"/></button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={6} className="px-5 py-16 text-center text-foreground/40">No products found. <button className="text-primary underline" onClick={openNew}>Add one?</button></td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-white/10 text-xs font-medium text-foreground/40 bg-white/5">Showing {filtered.length} of {products.length}</div>
        </CardContent>
      </Card>

      {/* ── Modal ── */}
      {isOpen && editing && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-2xl flex flex-col max-h-[92vh] overflow-hidden bg-white border border-gray-200 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 shrink-0">
              <h2 className="text-lg font-bold text-gray-900">{editing.id.startsWith('tmp-')?'Add New Product':'Edit Product'}</h2>
              <button onClick={()=>setIsOpen(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700:text-gray-900 hover:bg-gray-100:bg-secondary transition-colors"><X className="w-5 h-5"/></button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

              {/* Basic Info */}
              <section className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Basic Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-600">Product Name *</label>
                    <Input placeholder="Modern Minimalist Living Room" className="bg-gray-50 border-gray-200 focus-visible:ring-primary" value={editing.name}
                      onChange={e=>{setField('name',e.target.value); if(!editing.id.startsWith('tmp-')) return; setField('slug',generateSlug(e.target.value));}}/>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-600">Slug</label>
                    <Input placeholder="modern-living-room" className="bg-gray-50 border-gray-200 font-mono text-sm focus-visible:ring-primary" value={editing.slug}
                      onChange={e=>setField('slug',e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,'-'))}/>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-600">Price *</label>
                    <Input placeholder="₹1,999" className="bg-gray-50 border-gray-200 focus-visible:ring-primary" value={editing.price} onChange={e=>setField('price',e.target.value)}/>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-600">Plan Tier *</label>
                    <div className="relative">
                      <select className="appearance-none w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
                        value={editing.plan_tier || 'Free'} onChange={e=>setField('plan_tier', e.target.value as 'Free' | 'Plus' | 'Pro')}>
                        <option value="Free">Free</option>
                        <option value="Plus">Plus</option>
                        <option value="Pro">Pro</option>
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"/>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-600">Category</label>
                    <select className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-900" value={editing.category} onChange={e=>setField('category',e.target.value)}>
                      {dbCategories.map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-600">Author</label>
                    <Input placeholder="Design Walla Studio" className="bg-gray-50 border-gray-200 focus-visible:ring-primary" value={editing.author} onChange={e=>setField('author',e.target.value)}/>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-600">Rating</label>
                    <Input placeholder="4.9" className="bg-gray-50 border-gray-200 focus-visible:ring-primary" value={editing.rating} onChange={e=>setField('rating',e.target.value)}/>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-600">Status</label>
                    <select className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-900" value={editing.status} onChange={e=>setField('status',e.target.value as Product['status'])}>
                      <option>Active</option><option>Draft</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-600">Description</label>
                    <textarea rows={3} placeholder="High-quality 3D asset…" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary text-gray-900" value={editing.description??''} onChange={e=>setField('description',e.target.value)}/>
                  </div>
                </div>
              </section>

              {/* Specifications */}
              <section className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Specifications</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {label:'File Formats',key:'file_formats',placeholder:'BLEND, FBX, OBJ',help:'comma-separated'},
                    {label:'Software Support',key:'software_support',placeholder:'Blender 3.0+, 3ds Max',help:'comma-separated'},
                    {label:'Poly Count',key:'poly_count',placeholder:'1.2M'},
                    {label:'Texture Resolution',key:'texture_resolution',placeholder:'4K PBR'},
                    {label:'File Size',key:'file_size',placeholder:'1.4 GB'},
                  ].map(f=>(
                    <div key={f.key} className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-600">{f.label} <span className="normal-case font-normal opacity-60">{f.help}</span></label>
                      <Input placeholder={f.placeholder} className="bg-gray-50 border-gray-200 focus-visible:ring-primary"
                        value={Array.isArray((editing as Record<string,unknown>)[f.key]) ? ((editing as Record<string,unknown>)[f.key] as string[]).join(', ') : String((editing as Record<string,unknown>)[f.key]??'')}
                        onChange={e=>{
                          const val = e.target.value;
                          if(f.key==='file_formats'||f.key==='software_support') setField(f.key as keyof Product, val.split(',').map(s=>s.trim()).filter(Boolean));
                          else setField(f.key as keyof Product, val);
                        }}/>
                    </div>
                  ))}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-600">Technical Properties</label>
                    <div className="flex flex-wrap gap-4 mt-1">
                      {['Rigged', 'Animated', 'Game-Ready', '3D Printable'].map(feat => (
                        <label key={feat} className="flex items-center gap-2 text-sm cursor-pointer">
                          <input type="checkbox" className="rounded border-border text-primary focus:ring-primary" 
                            checked={(editing.features??[]).includes(feat)}
                            onChange={(e) => {
                              const current = editing.features || [];
                              if (e.target.checked) setField('features', [...current, feat]);
                              else setField('features', current.filter(f => f !== feat));
                            }}
                          />
                          <span>{feat}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="sm:col-span-2 space-y-1.5 mt-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-600">Other Features <span className="normal-case font-normal opacity-60">one per line</span></label>
                    <textarea rows={3} placeholder={"Fully textured\nIncludes lighting"} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
                      value={(editing.features??[]).filter(f => !['Rigged', 'Animated', 'Game-Ready', '3D Printable'].includes(f)).join('\n')}
                      onChange={e=>{
                        const standard = ['Rigged', 'Animated', 'Game-Ready', '3D Printable'].filter(f => (editing.features??[]).includes(f));
                        const custom = e.target.value.split('\n').map(s=>s.trim()).filter(Boolean);
                        setField('features', [...standard, ...custom]);
                      }}/>
                  </div>
                </div>
              </section>

              {/* Media & 3D Viewer */}
              <section className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Media & 3D Viewer</h3>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-600">3D Model URL (.glb / .gltf)</label>
                    <Input placeholder="https://example.com/model.glb" className="bg-gray-50 border-gray-200 flex-1 focus-visible:ring-primary" value={editing.model_url ?? ''} onChange={e=>setField('model_url',e.target.value)}/>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-600">Main Thumbnail</label>
                    <div className="flex items-center gap-3">
                      <label className={`cursor-pointer flex items-center gap-2 text-sm px-4 py-2.5 rounded-lg border border-white/10 transition-colors ${uploadingIdx===-1?'opacity-50':'bg-white/5 hover:bg-white/10'}`}>
                        {uploadingIdx===-1?<Loader2 className="w-4 h-4 animate-spin"/>:<ImageIcon className="w-4 h-4"/>}
                        {uploadingIdx===-1?'Uploading…':'Upload Thumbnail'}
                        <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailUpload} disabled={uploadingIdx!=null}/>
                      </label>
                      <Input placeholder="Or paste URL…" className="bg-gray-50 border-gray-200 flex-1 focus-visible:ring-primary" value={editing.thumbnail_url} onChange={e=>{setField('thumbnail_url',e.target.value); setField('image',e.target.value);}}/>
                    </div>
                    {editing.thumbnail_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={editing.thumbnail_url} alt="thumbnail" className="w-full h-32 object-cover rounded-xl border border-border mt-2"/>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-600">Gallery Images</label>
                    <label className={`cursor-pointer flex items-center gap-2 text-sm px-4 py-2.5 rounded-lg border border-white/10 transition-colors w-fit ${uploadingIdx===-2?'opacity-50':'bg-white/5 hover:bg-white/10'}`}>
                      {uploadingIdx===-2?<Loader2 className="w-4 h-4 animate-spin"/>:<Plus className="w-4 h-4"/>}
                      {uploadingIdx===-2?'Uploading…':'Add Gallery Images'}
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} disabled={uploadingIdx!=null}/>
                    </label>
                    {(editing.gallery_images??[]).length>0 && (
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {editing.gallery_images.map((url,i)=>(
                          <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-white/10 shadow-sm">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={url} alt="" className="w-full h-full object-cover" loading="lazy"/>
                            <button onClick={()=>removeGalleryImg(i)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs">×</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-2">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" className="rounded border-border text-primary focus:ring-primary" 
                        checked={(editing.features??[]).includes('Disable Hover Zoom')}
                        onChange={(e) => {
                          const current = editing.features || [];
                          if (e.target.checked) setField('features', [...current, 'Disable Hover Zoom']);
                          else setField('features', current.filter(f => f !== 'Disable Hover Zoom'));
                        }}
                      />
                      <span className="font-semibold text-gray-800">Disable Hover Zoom for this product</span>
                    </label>
                    <p className="text-xs text-zinc-500 mt-1 pl-6">Check this if the images are low resolution to prevent pixelated zooming.</p>
                  </div>
                </div>
              </section>

              {/* Google Drive */}
              <section className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Google Drive Download</h3>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-600">Share Link</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                        className="bg-gray-50 border-gray-200 flex-1 focus-visible:ring-primary"
                        value={editing.google_drive_share_link}
                        onChange={e=>{setField('google_drive_share_link',e.target.value); setDriveStatus('idle');}}
                      />
                      <Button type="button" variant="outline" onClick={validateDriveLink} disabled={!editing.google_drive_share_link||driveStatus==='checking'} className="shrink-0">
                        {driveStatus==='checking'?<Loader2 className="w-4 h-4 animate-spin"/>:'Validate'}
                      </Button>
                    </div>
                  </div>

                  {driveStatus==='valid' && (
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-sm space-y-1">
                      <div className="flex items-center gap-2 text-green-400 font-semibold"><CheckCircle2 className="w-4 h-4"/>Link valid</div>
                      <p className="text-gray-500 text-xs font-mono break-all">File ID: {editing.google_drive_file_id}</p>
                      <a href={editing.download_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline">
                        <ExternalLink className="w-3 h-3"/>Preview download URL
                      </a>
                    </div>
                  )}
                  {driveStatus==='invalid' && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm">
                      <div className="flex items-center gap-2 text-red-400 font-semibold"><AlertCircle className="w-4 h-4"/>Invalid link — check the URL format</div>
                    </div>
                  )}

                  {editing.google_drive_file_id && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-600">File ID</label>
                        <Input className="bg-gray-50 border-gray-200 font-mono text-xs focus-visible:ring-primary" value={editing.google_drive_file_id} readOnly/>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-600">Download URL</label>
                        <Input className="bg-gray-50 border-gray-200 font-mono text-xs focus-visible:ring-primary" value={editing.download_url} readOnly/>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 shrink-0 bg-gray-50">
              <Button variant="outline" className="border-gray-300 hover:bg-gray-100:bg-white/10 text-gray-700" onClick={()=>setIsOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90 text-white min-w-[120px] font-semibold">
                {saving?<><Loader2 className="w-4 h-4 mr-2 animate-spin"/>Saving…</>:'Save Product'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
