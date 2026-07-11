-- Migration to add 'tags' array to the 'products' table
ALTER TABLE products ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'::TEXT[];
