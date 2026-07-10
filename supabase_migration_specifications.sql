-- =============================================================
-- Design Walla - Dynamic Specifications Migration
-- Run this in Supabase SQL Editor to add the specifications column
-- =============================================================

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS specifications JSONB DEFAULT '[]'::jsonb;
