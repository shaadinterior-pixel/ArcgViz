-- ==============================================================================
-- MIGRATION V4: SUBSCRIPTION MODEL (FREE, PLUS, PRO)
-- ==============================================================================

-- ─── 1. PRODUCTS TABLE ────────────────────────────────────────────────────────
-- Add the plan_tier column to specify if a product is Free, Plus, or Pro
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS plan_tier TEXT DEFAULT 'Free';

-- Validate the column only has valid tiers
ALTER TABLE public.products
ADD CONSTRAINT check_plan_tier
CHECK (plan_tier IN ('Free', 'Plus', 'Pro'));

-- ─── 2. CUSTOMERS TABLE ───────────────────────────────────────────────────────
-- Add the plan column to specify the user's subscription tier
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'Free';

-- Validate the column only has valid tiers
ALTER TABLE public.customers
ADD CONSTRAINT check_customer_plan
CHECK (plan IN ('Free', 'Plus', 'Pro'));
