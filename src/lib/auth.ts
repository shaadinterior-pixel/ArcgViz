// ─── Auth helpers ─────────────────────────────────────────────────────────────
// Thin wrapper around Supabase Auth so components don't depend directly on
// the Supabase SDK's auth API surface.

import { supabase } from './supabase';
import type { User, Session } from '@supabase/supabase-js';

export type AuthUser = User;
export type AuthSession = Session;

// ── Sign Up ───────────────────────────────────────────────────────────────────
export async function signUp(email: string, password: string, fullName?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName ?? '' },
    },
  });
  if (error) throw error;
  
  if (data?.user) {
    // Automatically create a customer record with 'Free' plan
    await supabase.from('customers').insert({
      id: data.user.id,
      name: fullName || email.split('@')[0],
      email: email,
      spent: 0,
      orders: 0,
      status: 'Active',
      joinDate: new Date().toISOString(),
      plan: 'Free'
    });
  }
  
  return data;
}

// ── Sign In ───────────────────────────────────────────────────────────────────
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

// ── Sign In with Google ───────────────────────────────────────────────────────
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`
    }
  });
  if (error) throw error;
  return data;
}

// ── Sign Out ──────────────────────────────────────────────────────────────────
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// ── Get Current Session ───────────────────────────────────────────────────────
export async function getSession(): Promise<AuthSession | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// ── Get Current User ──────────────────────────────────────────────────────────
export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

// ── Check if user has purchased a product ─────────────────────────────────────
export async function hasPurchased(productId: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('purchases')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .maybeSingle();

  return !error && !!data;
}

// ── Auth state change listener ────────────────────────────────────────────────
export function onAuthChange(callback: (user: AuthUser | null) => void) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
  return () => data.subscription.unsubscribe();
}
