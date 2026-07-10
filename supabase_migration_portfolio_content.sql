-- Create portfolio_content table to manage the text in the portfolio section
CREATE TABLE IF NOT EXISTS portfolio_content (
    id INTEGER PRIMARY KEY,
    badge_text TEXT,
    headline_line1 TEXT,
    headline_line2 TEXT,
    subheadline TEXT
);

-- Insert default row
INSERT INTO portfolio_content (id, badge_text, headline_line1, headline_line2, subheadline)
VALUES (
    1,
    'Trusted by 100+ Amazing Clients',
    'Projects That Build Brands',
    '& Transform Spaces',
    'From stunning interiors and exteriors to branding, websites, and digital marketing – every project reflects our passion for creativity, quality, and real business results.'
) ON CONFLICT (id) DO NOTHING;

-- Setup RLS
ALTER TABLE portfolio_content ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access for portfolio content" ON portfolio_content
    FOR SELECT USING (true);

-- Allow all users to manage portfolio content (for simplicity based on previous setup)
CREATE POLICY "Allow all users to manage portfolio content" ON portfolio_content
    FOR ALL USING (true) WITH CHECK (true);
