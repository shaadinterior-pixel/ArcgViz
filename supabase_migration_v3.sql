-- =============================================================
-- Design Walla — Migration V4: Fix RLS + Ensure Tables Exist
-- Run this in Supabase SQL Editor to fix save errors
-- =============================================================

-- ─── 1. HERO CONTENT ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.hero_content (
  id                  INTEGER PRIMARY KEY DEFAULT 1,
  headline_line1      TEXT,
  headline_line2      TEXT,
  subheadline         TEXT,
  cta1_text           TEXT,
  cta1_link           TEXT,
  cta2_text           TEXT,
  cta2_link           TEXT,
  cta3_text           TEXT,
  cta3_link           TEXT,
  stat1_value         TEXT,
  stat1_label         TEXT,
  stat2_value         TEXT,
  stat2_label         TEXT,
  stat3_value         TEXT,
  stat3_label         TEXT,
  stat4_value         TEXT,
  stat4_label         TEXT,
  search_placeholder  TEXT,
  hero_cards          JSONB DEFAULT '[]'::jsonb
);

-- Disable RLS completely for admin tables (no public auth needed)
ALTER TABLE public.hero_content DISABLE ROW LEVEL SECURITY;

-- Insert default row if missing
INSERT INTO public.hero_content (id) VALUES (1) ON CONFLICT (id) DO NOTHING;


-- ─── 2. SERVICES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.services (
  id          TEXT PRIMARY KEY,
  category    TEXT NOT NULL,
  title       TEXT NOT NULL,
  tagline     TEXT,
  image       TEXT,
  description TEXT,
  includes    JSONB DEFAULT '[]'::jsonb
);

-- Disable RLS for services
ALTER TABLE public.services DISABLE ROW LEVEL SECURITY;

-- Drop any existing restrictive policies that may block writes
DROP POLICY IF EXISTS "Enable all for anon" ON public.services;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.services;
DROP POLICY IF EXISTS "Allow anon insert" ON public.services;

-- Insert default services if table is empty
INSERT INTO public.services (id, category, title, tagline, image, description, includes) VALUES 
('s1', 'Interior / Exterior Design and Work', 'Interior / Exterior Design', 'Spaces that speak. Structures that stay.', 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80', 'End-to-end interior and exterior design & execution for homes, offices, retail, and hospitality.', '["Residential & Commercial Interiors", "Exterior Facade & Landscape", "3D Walkthroughs & Renders", "Turnkey Execution & Site Handover", "Modular Furniture & Fit-outs", "Vastu / Feng-shui Aligned Planning"]'),
('s2', '3D Model & Product Design', '3D Modeling & Product Design', 'Render reality before it exists.', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80', 'Photorealistic 3D models and product visualizations for architecture, retail, and manufacturing.', '["Photorealistic Product Rendering", "Low-poly & High-poly Modeling", "Architectural Visualization", "3D Animation & Walkthrough", "AR/VR Ready Assets", "File Formats: BLEND, FBX, OBJ"]'),
('s3', 'Company Branding', 'Brand Identity & Strategy', 'Your brand, unforgettable.', 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80', 'Complete brand identity systems that make you stand out in a crowded market.', '["Logo Design & Typography", "Color Palette & Brand Guide", "Social Media Kit", "Business Cards & Stationery", "Brand Strategy & Positioning", "Packaging Design"]')
ON CONFLICT (id) DO NOTHING;


-- ─── 3. SETTINGS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.settings (
  id                INTEGER PRIMARY KEY DEFAULT 1,
  store_name        TEXT DEFAULT 'Design Walla',
  support_email     TEXT DEFAULT 'support@designwalla.com',
  currency          TEXT DEFAULT 'INR',
  razorpay_enabled  BOOLEAN DEFAULT true,
  stripe_enabled    BOOLEAN DEFAULT false,
  maintenance_mode  BOOLEAN DEFAULT false,
  hero_image_url    TEXT
);

ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;
INSERT INTO public.settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;


-- ─── 4. PRODUCTS — Ensure RLS is off ────────────────────────────
-- (This table should already exist from earlier migrations)
ALTER TABLE IF EXISTS public.products DISABLE ROW LEVEL SECURITY;


-- ─── 5. CATEGORIES ──────────────────────────────────────────────
ALTER TABLE IF EXISTS public.categories DISABLE ROW LEVEL SECURITY;


-- ─── Done ───────────────────────────────────────────────────────
-- After running this, verify by checking:
-- Authentication > Policies — all admin tables should show "RLS disabled"
