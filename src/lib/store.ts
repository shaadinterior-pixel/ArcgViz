import { supabase } from './supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

export type Product = {
  id: string;
  name: string;
  slug: string;
  price: string;
  category: string;
  subcategory?: string;
  status: 'Active' | 'Draft';
  sales: number;
  date: string;
  image: string;
  author: string;
  rating: string;
  description?: string;
  thumbnail_url: string;
  gallery_images: string[];
  google_drive_share_link: string;
  google_drive_file_id: string;
  download_url: string;
  model_url?: string;
  software_support: string[];
  file_formats: string[];
  poly_count: string;
  texture_resolution: string;
  file_size: string;
  features: string[];
  updated_at?: string;
  created_at?: string;
  plan_tier: 'Free' | 'Plus' | 'Pro' | 'Paid';
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  spent: number;
  orders: number;
  status: 'Active' | 'Inactive';
  joinDate: string;
  plan: 'Free' | 'Pro';
};

export type Order = {
  id: string;
  customer: string;
  email: string;
  product: string;
  amount: string;
  status: 'Completed' | 'Pending' | 'Refunded';
  date: string;
};

export type StoreSettings = {
  storeName: string;
  supportEmail: string;
  currency: string;
  razorpayEnabled: boolean;
  stripeEnabled: boolean;
  maintenanceMode: boolean;
  heroImageUrl: string;
};

export type HeroContent = {
  headline_line1: string;
  headline_line2: string;
  subheadline: string;
  cta1_text: string;
  cta1_link: string;
  cta2_text: string;
  cta2_link: string;
  cta3_text: string;
  cta3_link: string;
  stat1_value: string;
  stat1_label: string;
  stat2_value: string;
  stat2_label: string;
  stat3_value: string;
  stat3_label: string;
  stat4_value: string;
  stat4_label: string;
  search_placeholder: string;
};

export type CardEntry = { name: string; count: string; image: string };
export type Category = { id: string; title: string; description: string; cards: CardEntry[]; subcategories?: string[] };

export type Purchase = {
  id: string;
  user_id: string;
  product_id: string;
  purchased_at: string;
};

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  image: string;
  text: string;
  rating: number;
  created_at?: string;
};

export type PortfolioItem = {
  id: string;
  title: string;
  image_url: string;
  link?: string;
  sort_order: number;
  created_at?: string;
};

// ─── Products ─────────────────────────────────────────────────────────────────

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  return (data || []).map(normalizeProduct);
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single();
  if (error) return null;
  return data ? normalizeProduct(data) : null;
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  return data ? normalizeProduct(data) : null;
}

export async function fetchAllSlugs(): Promise<string[]> {
  const { data, error } = await supabase
    .from('products')
    .select('slug')
    .eq('status', 'Active');
  if (error) return [];
  return (data || []).map((p: { slug: string }) => p.slug).filter(Boolean);
}

export async function saveProducts(products: Product[]): Promise<void> {
  const rows = products.map(p => {
    const { plan_tier, ...rest } = p;
    return {
      ...rest,
      slug: p.slug || generateSlug(p.name),
      thumbnail_url: p.thumbnail_url || p.image || '',
      image: p.image || p.thumbnail_url || '',
      plan: plan_tier,
      subcategory: p.subcategory || '',
    };
  });
  const { error } = await supabase.from('products').upsert(rows);
  if (error) throw error;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Normalise a raw Supabase row into a fully-typed Product */
function normalizeProduct(row: Record<string, unknown>): Product {
  // Normalize plan string to strict types regardless of DB casing
  let plan = String(row.plan || 'Free').trim();
  if (/^pro$/i.test(plan) || /^plus$/i.test(plan)) plan = 'Pro';
  else if (/^paid$/i.test(plan)) plan = 'Paid';
  else plan = 'Free';

  return {
    id:                      String(row.id ?? ''),
    name:                    String(row.name ?? ''),
    slug:                    String(row.slug ?? row.id ?? ''),
    price:                   String(row.price ?? ''),
    category:                String(row.category ?? ''),
    subcategory:             String(row.subcategory ?? ''),
    status:                  (row.status as 'Active' | 'Draft') ?? 'Draft',
    sales:                   Number(row.sales ?? 0),
    date:                    String(row.date ?? ''),
    image:                   String(row.image ?? ''),
    author:                  String(row.author ?? ''),
    rating:                  String(row.rating ?? '5.0'),
    description:             String(row.description ?? ''),
    thumbnail_url:           String(row.thumbnail_url ?? row.image ?? ''),
    gallery_images:          Array.isArray(row.gallery_images) ? row.gallery_images as string[] : [],
    google_drive_share_link: String(row.google_drive_share_link ?? ''),
    google_drive_file_id:    String(row.google_drive_file_id ?? ''),
    download_url:            String(row.download_url ?? ''),
    model_url:               row.model_url ? String(row.model_url) : undefined,
    software_support:        Array.isArray(row.software_support) ? row.software_support as string[] : [],
    file_formats:            Array.isArray(row.file_formats) ? row.file_formats as string[] : [],
    poly_count:              String(row.poly_count ?? ''),
    texture_resolution:      String(row.texture_resolution ?? ''),
    file_size:               String(row.file_size ?? ''),
    features:                Array.isArray(row.features) ? row.features as string[] : [],
    updated_at:              row.updated_at ? String(row.updated_at) : undefined,
    plan_tier:               plan as 'Free' | 'Pro' | 'Paid',
  };
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 80);
}

// ─── Customers ─────────────────────────────────────────────────────────────────

export async function fetchCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('joinDate', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function saveCustomers(customers: Customer[]): Promise<void> {
  const { error } = await supabase.from('customers').upsert(customers);
  if (error) throw error;
}

export async function deleteCustomer(id: string): Promise<void> {
  const { error } = await supabase.from('customers').delete().eq('id', id);
  if (error) throw error;
}

// ─── Orders ────────────────────────────────────────────────────────────────────

export async function fetchOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function saveOrder(order: Order): Promise<void> {
  const { error } = await supabase.from('orders').upsert([order]);
  if (error) throw error;
}

export async function deleteOrder(id: string): Promise<void> {
  const { error } = await supabase.from('orders').delete().eq('id', id);
  if (error) throw error;
}

export async function updateOrderStatus(id: string, status: Order['status']): Promise<void> {
  const { error } = await supabase.from('orders').update({ status }).eq('id', id);
  if (error) throw error;
}

// ─── Hero Content ─────────────────────────────────────────────────────────────

export const DEFAULT_HERO_CONTENT: HeroContent = {
  headline_line1: 'One Platform. Infinite',
  headline_line2: 'Creative Possibilities.',
  subheadline: 'All-Business Digital Ecosystem, Website Templates, Motion Design, Brand Kits, Digital Products, 3D Models, and more.',
  cta1_text: 'Explore Marketplace',
  cta1_link: '/products',
  cta2_text: 'Hire Our Team',
  cta2_link: '/services',
  cta3_text: 'Download Free Assets',
  cta3_link: '/products?filter=free',
  stat1_value: '12K+',
  stat1_label: 'Premium Assets',
  stat2_value: '4.9★',
  stat2_label: 'Avg Rating',
  stat3_value: '850+',
  stat3_label: 'Artists',
  stat4_value: '50K+',
  stat4_label: 'Downloads',
  search_placeholder: 'What are you looking for today?',
};

export async function fetchHeroContent(): Promise<HeroContent> {
  const { data, error } = await supabase
    .from('hero_content')
    .select('*')
    .eq('id', 1)
    .single();
  if (error && error.code !== 'PGRST116') return DEFAULT_HERO_CONTENT;
  return data ? { ...DEFAULT_HERO_CONTENT, ...data } : DEFAULT_HERO_CONTENT;
}

export async function saveHeroContent(content: HeroContent): Promise<void> {
  const { error } = await supabase.from('hero_content').upsert({ id: 1, ...content });
  if (error) throw error;
}

// ─── Settings ──────────────────────────────────────────────────────────────────

export async function fetchSettings(): Promise<StoreSettings> {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('id', 1)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data || {
    storeName: 'Design Walla',
    supportEmail: 'support@designwalla.com',
    currency: 'INR',
    razorpayEnabled: true,
    stripeEnabled: false,
    maintenanceMode: false,
    heroImageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1920',
  };
}

export async function saveSettings(settings: StoreSettings): Promise<void> {
  const { error } = await supabase.from('settings').upsert({ id: 1, ...settings });
  if (error) throw error;
}

// ─── Categories ────────────────────────────────────────────────────────────────

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from('categories').select('*');
  if (error) throw error;
  return data || [];
}

export async function saveCategories(categories: Category[]): Promise<void> {
  const { error } = await supabase.from('categories').upsert(categories);
  if (error) throw error;
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}

// ─── Services ──────────────────────────────────────────────────────────────────

export type ServiceDetail = {
  id: string;
  category: string;
  title: string;
  tagline: string;
  image: string;
  description: string;
  includes: string[];
};

export async function fetchServices(): Promise<ServiceDetail[]> {
  const { data, error } = await supabase.from('services').select('*');
  if (error) return [];
  // Parse JSON if needed
  return data?.map(d => ({
    ...d,
    includes: typeof d.includes === 'string' ? JSON.parse(d.includes) : d.includes
  })) || [];
}

export async function saveService(service: ServiceDetail): Promise<void> {
  const { error } = await supabase.from('services').upsert(service);
  if (error) throw error;
}

export async function deleteService(id: string): Promise<void> {
  const { error } = await supabase.from('services').delete().eq('id', id);
  if (error) throw error;
}

// ─── Purchases ─────────────────────────────────────────────────────────────────

export async function fetchPurchases(): Promise<Purchase[]> {
  const { data, error } = await supabase
    .from('purchases')
    .select('*')
    .order('purchased_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function grantPurchase(userId: string, productId: string): Promise<void> {
  const { error } = await supabase
    .from('purchases')
    .upsert({ user_id: userId, product_id: productId });
  if (error) throw error;
}

// ─── Testimonials ───────────────────────────────────────────────────────────────

export async function fetchTestimonials(): Promise<Testimonial[]> {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return [];
  return data || [];
}

export async function saveTestimonial(testimonial: Testimonial): Promise<void> {
  const { error } = await supabase.from('testimonials').upsert(testimonial);
  if (error) throw error;
}

export async function deleteTestimonial(id: string): Promise<void> {
  const { error } = await supabase.from('testimonials').delete().eq('id', id);
  if (error) throw error;
}

// ─── Portfolio ─────────────────────────────────────────────────────────────────

export async function fetchPortfolioItems(): Promise<PortfolioItem[]> {
  const { data, error } = await supabase
    .from('portfolio_items')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });
  if (error) return [];
  return data || [];
}

export async function savePortfolioItem(item: PortfolioItem): Promise<void> {
  const { error } = await supabase.from('portfolio_items').upsert(item);
  if (error) throw error;
}

export async function deletePortfolioItem(id: string): Promise<void> {
  const { error } = await supabase.from('portfolio_items').delete().eq('id', id);
  if (error) throw error;
}

// ─── Realtime ──────────────────────────────────────────────────────────────────

export function onStoreUpdate(table: string, callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const channel = supabase
    .channel(`${table}-changes`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, () => callback())
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}
