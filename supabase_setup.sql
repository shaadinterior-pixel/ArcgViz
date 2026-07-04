-- database: /path/to/database.db

-- =============================================================
-- Design Walla – Supabase Setup Script
-- Run this in your Supabase project > SQL Editor
-- =============================================================

-- ─── 1. PRODUCTS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  price       TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT '3D Models',
  status      TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Draft')),
  sales       INTEGER NOT NULL DEFAULT 0,
  date        TEXT NOT NULL,
  image       TEXT DEFAULT '',
  author      TEXT DEFAULT 'Design Walla Studio',
  rating      TEXT DEFAULT '5.0',
  description TEXT DEFAULT ''
);

-- ─── 2. CUSTOMERS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.customers (
  id        TEXT PRIMARY KEY,
  name      TEXT NOT NULL,
  email     TEXT NOT NULL,
  spent     NUMERIC NOT NULL DEFAULT 0,
  orders    INTEGER NOT NULL DEFAULT 0,
  status    TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  "joinDate" TEXT NOT NULL
);

-- ─── 3. SETTINGS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.settings (
  id               INTEGER PRIMARY KEY DEFAULT 1,
  "storeName"      TEXT NOT NULL DEFAULT 'Design Walla',
  "supportEmail"   TEXT NOT NULL DEFAULT 'support@designwalla.com',
  currency         TEXT NOT NULL DEFAULT 'INR',
  "razorpayEnabled" BOOLEAN NOT NULL DEFAULT TRUE,
  "stripeEnabled"  BOOLEAN NOT NULL DEFAULT FALSE,
  "maintenanceMode" BOOLEAN NOT NULL DEFAULT FALSE
);

-- ─── 4. CATEGORIES ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.categories (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT DEFAULT '',
  cards       JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- ─── 5. ORDERS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id         TEXT PRIMARY KEY,
  customer   TEXT NOT NULL,
  email      TEXT NOT NULL,
  product    TEXT NOT NULL,
  amount     TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Completed', 'Pending', 'Refunded')),
  date       TEXT NOT NULL
);

-- =============================================================
-- RLS – disable for development (use permissive policies)
-- =============================================================
ALTER TABLE public.products   DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers  DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings   DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders     DISABLE ROW LEVEL SECURITY;

-- If you prefer to KEEP RLS enabled, comment the 5 lines above
-- and uncomment the policies below:
--
-- ALTER TABLE public.products   ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all" ON public.products FOR ALL USING (true) WITH CHECK (true);
-- ALTER TABLE public.customers  ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all" ON public.customers FOR ALL USING (true) WITH CHECK (true);
-- ALTER TABLE public.settings   ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all" ON public.settings FOR ALL USING (true) WITH CHECK (true);
-- ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all" ON public.categories FOR ALL USING (true) WITH CHECK (true);
-- ALTER TABLE public.orders     ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all" ON public.orders FOR ALL USING (true) WITH CHECK (true);

-- =============================================================
-- SEED DATA – sample records so the dashboard isn't empty
-- =============================================================

-- Default settings row
INSERT INTO public.settings (id, "storeName", "supportEmail", currency, "razorpayEnabled", "stripeEnabled", "maintenanceMode")
VALUES (1, 'Design Walla', 'support@designwalla.com', 'INR', TRUE, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;

-- Sample products
INSERT INTO public.products (id, name, price, category, status, sales, date, image, author, rating, description) VALUES
  ('modern-living-room-001', 'Modern Minimalist Living Room', '₹3,499', 'Interior Scenes', 'Active', 124, 'Jun 20, 2025', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400', 'Design Walla Studio', '4.9', 'A clean, modern living room scene with natural lighting and premium furniture models.'),
  ('velvet-sofa-002', 'Luxury Velvet Sofa Model', '₹1,299', 'Furniture', 'Active', 89, 'Jun 19, 2025', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400', 'Design Lab', '4.8', 'High-poly luxury velvet sofa with multiple fabric textures.'),
  ('concrete-pbr-003', 'Premium Concrete PBR Pack', '₹1,999', 'PBR Materials', 'Active', 203, 'Jun 18, 2025', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', 'TextureForge', '4.7', 'Professional concrete PBR texture set — 4K resolution, includes normal, roughness, and AO maps.'),
  ('scandinavian-bedroom-004', 'Scandinavian Bedroom Scene', '₹4,999', 'Interior Scenes', 'Active', 67, 'Jun 17, 2025', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400', 'Nordic3D', '5.0', 'Full bedroom scene with Scandinavian design aesthetic, ready for rendering.'),
  ('marble-texture-005', 'Photorealistic Marble Texture', '₹1,499', 'PBR Materials', 'Draft', 41, 'Jun 15, 2025', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', 'TextureForge', '4.6', 'Photorealistic white Carrara marble texture set at 8K.'),
  ('coffee-table-006', 'Wooden Coffee Table 3D', '₹999', '3D Models', 'Active', 156, 'Jun 13, 2025', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400', 'WoodWorks3D', '4.5', 'Mid-century modern wooden coffee table with real-wood grain textures.')
ON CONFLICT (id) DO NOTHING;

-- Sample customers
INSERT INTO public.customers (id, name, email, spent, orders, status, "joinDate") VALUES
  ('c001', 'Alex Johnson',  'alex.j@example.com',  8498, 2, 'Active',   'Jun 17, 2025'),
  ('c002', 'Sarah Miller',  'sarah.m@studio.co',   2498, 2, 'Active',   'Jun 19, 2025'),
  ('c003', 'Emma Wilson',   'emma@designs.com',    3498, 2, 'Active',   'Jun 15, 2025'),
  ('c004', 'Michael Brown', 'mbrown@3d.co',         999, 1, 'Active',   'Jun 13, 2025'),
  ('c005', 'Priya Sharma',  'priya@archworld.in',  6200, 3, 'Inactive', 'May 30, 2025')
ON CONFLICT (id) DO NOTHING;

-- Sample orders
INSERT INTO public.orders (id, customer, email, product, amount, status, date) VALUES
  ('ORD-001', 'Alex Johnson',  'alex.j@example.com',  'Modern Minimalist Living Room', '₹3,499', 'Completed', 'Jun 20, 2025'),
  ('ORD-002', 'Sarah Miller',  'sarah.m@studio.co',   'Luxury Velvet Sofa Model',      '₹1,299', 'Completed', 'Jun 19, 2025'),
  ('ORD-003', 'Emma Wilson',   'emma@designs.com',    'Premium Concrete PBR Pack',     '₹1,999', 'Pending',   'Jun 18, 2025'),
  ('ORD-004', 'Alex Johnson',  'alex.j@example.com',  'Scandinavian Bedroom Scene',    '₹4,999', 'Completed', 'Jun 17, 2025'),
  ('ORD-005', 'Emma Wilson',   'emma@designs.com',    'Photorealistic Marble Texture', '₹1,499', 'Refunded',  'Jun 15, 2025'),
  ('ORD-006', 'Sarah Miller',  'sarah.m@studio.co',   'Wooden Coffee Table 3D',        '₹1,199', 'Completed', 'Jun 14, 2025'),
  ('ORD-007', 'Michael Brown', 'mbrown@3d.co',         'Wooden Coffee Table 3D',        '₹999',   'Pending',   'Jun 13, 2025')
ON CONFLICT (id) DO NOTHING;

-- Sample categories
INSERT INTO public.categories (id, title, description, cards) VALUES
  ('cat-3d-models', '3D Models', 'Ready-to-render 3D assets', '[{"name":"Furniture","count":"240+","image":""},{"name":"Characters","count":"80+","image":""},{"name":"Architecture","count":"150+","image":""}]'),
  ('cat-pbr-materials', 'PBR Materials', 'Physically-based rendering textures', '[{"name":"Stone","count":"90+","image":""},{"name":"Wood","count":"120+","image":""},{"name":"Metal","count":"60+","image":""}]'),
  ('cat-interiors', 'Interior Scenes', 'Complete interior visualisation scenes', '[{"name":"Living Room","count":"55+","image":""},{"name":"Bedroom","count":"40+","image":""},{"name":"Kitchen","count":"30+","image":""}]')
ON CONFLICT (id) DO NOTHING;
