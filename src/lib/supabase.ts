import { createClient } from '@supabase/supabase-js';

// Cloudflare Workers exposes env vars differently — they come through
// wrangler.toml [vars] which Next.js on CF makes available via process.env.
// For NEXT_PUBLIC_ vars, they're inlined at build time.
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  (typeof globalThis !== 'undefined' && (globalThis as any).NEXT_PUBLIC_SUPABASE_URL) ||
  'https://bmtqeiwqokpieehdcycb.supabase.co';

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  (typeof globalThis !== 'undefined' && (globalThis as any).NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtdHFlaXdxb2twaWVlaGRjeWNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5NTc4NTEsImV4cCI6MjA5NzUzMzg1MX0.nkSFqbtAzf6CHfrCf_8ddxMHOHi52pD2nI5jJAH8Ik0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    fetch: (url, options = {}) =>
      fetch(url, { ...options, keepalive: true }),
  },
});
