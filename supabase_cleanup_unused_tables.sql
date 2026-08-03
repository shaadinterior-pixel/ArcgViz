-- =============================================================
-- Design Walla — drop unused Supabase tables  (OPTIONAL)
--
-- These two tables have no code touching them any more and were both
-- empty (0 rows) when this file was written. They are the Supabase
-- half of data that actually lives in Firebase:
--
--   purchases → users/{uid}/purchases in Firestore
--   customers → users/{uid}          in Firestore
--
-- The `purchases` table was the risky one: the download gate checks
-- Firestore, so anything written here would have granted a customer
-- nothing while looking like it had worked.
--
-- ⚠️ DROP cannot be undone. Confirm they are still empty first:
--
--     SELECT 'purchases' AS t, count(*) FROM public.purchases
--     UNION ALL
--     SELECT 'customers',       count(*) FROM public.customers;
--
-- Only run the drops below if both counts are 0.
-- Nothing breaks if you skip this file entirely — the tables just sit
-- there unused.
-- =============================================================

DROP TABLE IF EXISTS public.purchases;
DROP TABLE IF EXISTS public.customers;
