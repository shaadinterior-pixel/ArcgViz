-- =============================================================
-- Design Walla — Migration V3: Homepage Content Tables
-- Run this in Supabase SQL Editor
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

ALTER TABLE public.hero_content DISABLE ROW LEVEL SECURITY;

-- Insert default row
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

ALTER TABLE public.services DISABLE ROW LEVEL SECURITY;

-- Insert default sample services
INSERT INTO public.services (id, category, title, tagline, image, description, includes) VALUES 
('s1', 'Custom Websites', 'High-Performance Web Platforms', 'Turn visitors into clients.', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80', 'We build lightning-fast, SEO-optimized web applications tailored for modern businesses.', '["Custom UI/UX Design", "Next.js / React Development", "SEO & Performance Optimization", "CMS Integration"]'),
('s2', '3D & ArchViz', 'Immersive 3D Visualizations', 'Bring your ideas to life.', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80', 'Stunning 3D renders, architectural visualizations, and product models.', '["Photorealistic Rendering", "Product 3D Modeling", "Architectural Visualization", "3D Animation"]'),
('s3', 'Brand Identity', 'Premium Brand Kits', 'Stand out from the crowd.', 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80', 'Comprehensive branding packages that capture your unique market identity.', '["Logo Design & Typography", "Color Palette & Guidelines", "Social Media Kits", "Business Cards & Stationery"]')
ON CONFLICT (id) DO NOTHING;
