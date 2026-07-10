-- Fix RLS for portfolio_items to allow insertions/updates from the admin panel
-- If you are not using Supabase authentication in the admin panel, you must allow public access to manage these items.

DROP POLICY IF EXISTS "Allow authenticated users to manage portfolio items" ON portfolio_items;

CREATE POLICY "Allow all users to manage portfolio items" ON portfolio_items
    FOR ALL USING (true) WITH CHECK (true);
