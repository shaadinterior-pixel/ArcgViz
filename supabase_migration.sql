-- =============================================================
-- ArchViz Market — Migration: Google Drive Asset System
-- Run this in Supabase SQL Editor AFTER supabase_setup.sql
-- =============================================================

-- ─── 1. EXTEND products table ────────────────────────────────
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS slug           TEXT,
  ADD COLUMN IF NOT EXISTS thumbnail_url  TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS gallery_images JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS google_drive_share_link TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS google_drive_file_id   TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS download_url           TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS software_support       TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS file_formats           TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS poly_count             TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS texture_resolution     TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS file_size              TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS features               TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS updated_at             TIMESTAMPTZ DEFAULT now();

-- Auto-generate slug from id if not set
UPDATE public.products SET slug = id WHERE slug IS NULL OR slug = '';

-- Make slug unique (after backfill)
ALTER TABLE public.products
  ADD CONSTRAINT IF NOT EXISTS products_slug_unique UNIQUE (slug);

-- Backfill thumbnail_url from existing image column
UPDATE public.products SET thumbnail_url = image WHERE thumbnail_url = '' OR thumbnail_url IS NULL;

-- ─── 2. PURCHASES table ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.purchases (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL,
  product_id   TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- ─── 3. USER PROFILES (mirrors auth.users) ───────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT,
  full_name  TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  is_admin   BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger: auto-create profile on sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── 4. RLS POLICIES ─────────────────────────────────────────

-- Purchases: users can only see their own purchases
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users see own purchases" ON public.purchases;
CREATE POLICY "Users see own purchases" ON public.purchases
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can insert purchases" ON public.purchases;
CREATE POLICY "Service role can insert purchases" ON public.purchases
  FOR INSERT WITH CHECK (true);

-- Profiles: users can see all profiles, update own
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles are viewable" ON public.profiles;
CREATE POLICY "Public profiles are viewable" ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Products: public read, anon write (dev mode)
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;

-- ─── 5. GRANT PURCHASE (Admin Helper Function) ───────────────
-- Call this from admin to manually grant a user download access
CREATE OR REPLACE FUNCTION public.grant_purchase(p_user_email TEXT, p_product_id TEXT)
RETURNS TEXT AS $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_user_email;
  IF v_user_id IS NULL THEN
    RETURN 'User not found: ' || p_user_email;
  END IF;
  INSERT INTO public.purchases (user_id, product_id)
  VALUES (v_user_id, p_product_id)
  ON CONFLICT DO NOTHING;
  RETURN 'Purchase granted for ' || p_user_email || ' → ' || p_product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
