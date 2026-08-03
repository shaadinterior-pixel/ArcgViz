-- =============================================================
-- Design Walla — Order metadata for the revenue tracker
-- Run this in the Supabase SQL Editor.
--
-- The orders table stores amount and date as free text ('₹249',
-- 'Jul 31, 2026'), which is fine for display but unreliable to add up.
-- These columns give the admin revenue tracker something it can trust.
--
-- Safe to run more than once. Existing rows keep working — the tracker
-- falls back to parsing the text columns when these are NULL.
-- =============================================================

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS kind        TEXT,           -- 'recharge' | 'cart' | 'printing' | 'manual'
  ADD COLUMN IF NOT EXISTS amount_inr  NUMERIC,        -- amount in rupees, as a number
  ADD COLUMN IF NOT EXISTS user_id     TEXT,           -- Firebase uid of the buyer, when known
  ADD COLUMN IF NOT EXISTS payment_id  TEXT,           -- Razorpay payment id
  ADD COLUMN IF NOT EXISTS created_at  TIMESTAMPTZ DEFAULT NOW();

-- Speeds up the tracker's date-range queries once there are a lot of orders.
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON public.orders (created_at DESC);
CREATE INDEX IF NOT EXISTS orders_kind_idx       ON public.orders (kind);

-- Backfill the numeric amount for rows written before this migration.
-- Strips the currency symbol and thousands separators from e.g. '₹3,499'.
UPDATE public.orders
SET amount_inr = NULLIF(regexp_replace(amount, '[^0-9.]', '', 'g'), '')::NUMERIC
WHERE amount_inr IS NULL
  AND amount IS NOT NULL
  AND regexp_replace(amount, '[^0-9.]', '', 'g') <> '';

-- Classify older rows from their product description.
UPDATE public.orders
SET kind = CASE
             WHEN product ILIKE '%recharge%' THEN 'recharge'
             WHEN product ILIKE '%printing%' THEN 'printing'
             ELSE 'cart'
           END
WHERE kind IS NULL;
