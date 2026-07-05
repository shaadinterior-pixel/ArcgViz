// API route: GET /api/admin/data
// Returns all admin data (products, customers, orders, settings) via service role
// This bypasses RLS since it runs server-side with the service role key.

import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase-admin';

export async function GET() {
  try {
    const admin = getAdminClient();

    const [products, customers, orders, settings] = await Promise.all([
      admin.from('products').select('*').order('date', { ascending: false }),
      admin.from('customers').select('*').order('"joinDate"', { ascending: false }),
      admin.from('orders').select('*').order('date', { ascending: false }),
      admin.from('settings').select('*').eq('id', 1).single(),
    ]);

    return NextResponse.json({
      products: products.data || [],
      customers: customers.data || [],
      orders: orders.data || [],
      settings: settings.data || null,
      errors: {
        products: products.error?.message,
        customers: customers.error?.message,
        orders: orders.error?.message,
        settings: settings.error?.message,
      }
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
