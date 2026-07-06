-- =============================================================
-- Design Walla — Migration V4: Product Categories + Hero Cards Fix
-- Run this in Supabase SQL Editor
-- =============================================================

-- ─── 1. ENSURE hero_content HAS hero_cards AS JSONB ─────────────────────────
-- This fixes the save issue — hero_cards must be jsonb, not text
ALTER TABLE public.hero_content
  ADD COLUMN IF NOT EXISTS hero_cards JSONB DEFAULT '[]'::jsonb;

-- If column existed as TEXT, cast it to jsonb (run only if you get a type error):
-- ALTER TABLE public.hero_content ALTER COLUMN hero_cards TYPE JSONB USING hero_cards::jsonb;


-- ─── 2. PRODUCT CATEGORIES TABLE ────────────────────────────────────────────
-- Simpler structure: id + title only (no showcase cards)
CREATE TABLE IF NOT EXISTS public.categories (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT DEFAULT '',
  cards       JSONB DEFAULT '[]'::jsonb
);

ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;

-- ─── 3. SEED DEFAULT PRODUCT CATEGORIES ─────────────────────────────────────
-- These replace the old hardcoded list in the codebase
INSERT INTO public.categories (id, title) VALUES
  ('3d-models',        '3D Models'),
  ('interior-scenes',  'Interior Scenes'),
  ('pbr-materials',    'PBR Materials'),
  ('furniture',        'Furniture'),
  ('lighting',         'Lighting'),
  ('architecture',     'Architecture'),
  ('characters',       'Characters'),
  ('hdri',             'HDRI & Environment'),
  ('textures',         'Textures'),
  ('vfx-assets',       'VFX Assets')
ON CONFLICT (id) DO NOTHING;
