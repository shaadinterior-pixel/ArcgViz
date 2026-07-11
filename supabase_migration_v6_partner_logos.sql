ALTER TABLE public.portfolio_content ADD COLUMN IF NOT EXISTS partner_logos JSONB DEFAULT '[]'::jsonb;
