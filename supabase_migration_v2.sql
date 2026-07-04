-- =============================================================
-- ArchViz Market — Migration: 3D Viewer support
-- Run this in Supabase SQL Editor
-- =============================================================

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS model_url TEXT DEFAULT '';
