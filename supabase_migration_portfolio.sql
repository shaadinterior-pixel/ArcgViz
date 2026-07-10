-- Create portfolio_items table
CREATE TABLE IF NOT EXISTS portfolio_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    link TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Setup RLS
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access for portfolio items" ON portfolio_items
    FOR SELECT USING (true);

-- Allow authenticated users to manage portfolio items
CREATE POLICY "Allow authenticated users to manage portfolio items" ON portfolio_items
    FOR ALL USING (auth.role() = 'authenticated');
