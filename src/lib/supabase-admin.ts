// ─── Admin Supabase Client ────────────────────────────────────────────────────
// This client uses the SERVICE ROLE key which bypasses Row Level Security (RLS).
// ONLY use this in server-side code (API routes, Server Actions, server components).
// NEVER expose this client to the browser / client components.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Inferred from the call rather than `ReturnType<typeof createClient>` — the bare
// generic collapses table row types to `never`, which breaks insert/upsert calls.
function createAdminClient() {
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Singleton — reuse across module imports
let _adminClient: ReturnType<typeof createAdminClient> | null = null;

export function getAdminClient() {
  if (!_adminClient) {
    _adminClient = createAdminClient();
  }
  return _adminClient;
}
