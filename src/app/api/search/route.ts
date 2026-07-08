import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const term = `%${q.trim()}%`;
    
    const [productsRes, servicesRes] = await Promise.all([
      supabase
        .from('products')
        .select('id, name, category, price, plan, image, slug, thumbnail_url')
        .or(`name.ilike.${term},category.ilike.${term},description.ilike.${term}`)
        .eq('status', 'Active')
        .limit(8),
      supabase
        .from('services')
        .select('id, title, category, image')
        .or(`title.ilike.${term},category.ilike.${term},description.ilike.${term}`)
        .limit(4)
    ]);

    const products = productsRes.data || [];
    const services = servicesRes.data || [];
    
    const finalResults = [];

    for (const p of products) {
      finalResults.push({
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        plan: p.plan || 'Free',
        image: p.thumbnail_url || p.image || '',
        slug: p.slug || p.id,
        type: 'product',
      });
    }

    for (const s of services) {
      finalResults.push({
        id: s.id,
        name: s.title,
        category: s.category,
        price: 'Service',
        plan: 'Service',
        image: s.image || '',
        slug: '',
        type: 'service',
      });
    }

    return NextResponse.json(finalResults.slice(0, 10));
  } catch (error) {
    console.error('API Search Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
