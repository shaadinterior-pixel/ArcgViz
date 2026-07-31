import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getServiceSlug } from '@/lib/service-seo';
import { normalizeResourceIdQuery, resourceIdVariants, readResourceId } from '@/lib/resource-id';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  const query = (q ?? '').trim();
  // '40' is a valid resource-id search even though it is shorter than the
  // two-character minimum we apply to free-text queries.
  const canonicalResourceId = normalizeResourceIdQuery(query);

  if (!query || (query.length < 2 && !canonicalResourceId)) {
    return NextResponse.json([]);
  }

  try {
    const term = `%${query}%`;

    // Older rows may spell the id by hand, so check the common variants.
    //
    // NOTE: the JSON string form of .contains() is required. Passing an array
    // makes supabase-js serialise it as a Postgres array literal (`cs.{...}`)
    // instead of JSONB containment, which silently matches nothing.
    const resourceLookups = canonicalResourceId
      ? resourceIdVariants(canonicalResourceId).map(variant =>
          supabase
            .from('products')
            .select('id, name, category, price, plan, image, slug, thumbnail_url, specifications')
            .contains('specifications', JSON.stringify([{ value: variant }]))
            .eq('status', 'Active')
            .limit(4),
        )
      : [];

    const [productsRes, servicesRes, ...resourceResults] = await Promise.all([
      supabase
        .from('products')
        .select('id, name, category, price, plan, image, slug, thumbnail_url, specifications')
        .or(`name.ilike.${term},category.ilike.${term},description.ilike.${term}`)
        .eq('status', 'Active')
        .limit(8),
      supabase
        .from('services')
        .select('id, title, category, image')
        .or(`title.ilike.${term},category.ilike.${term},description.ilike.${term}`)
        .limit(4),
      ...resourceLookups,
    ]);

    const resourceRes = {
      data: resourceResults.flatMap(result => result.data ?? []),
    };

    const baseProducts = productsRes.data || [];
    const resourceProducts = resourceRes.data || [];
    
    // Merge and deduplicate products
    const productMap = new Map();
    [...resourceProducts, ...baseProducts].forEach(p => {
      if (!productMap.has(p.id)) productMap.set(p.id, p);
    });
    const products = Array.from(productMap.values()).slice(0, 8);

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
        resourceId: readResourceId(p.specifications),
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
        slug: getServiceSlug(s),
        type: 'service',
      });
    }

    return NextResponse.json(finalResults.slice(0, 10));
  } catch (error) {
    console.error('API Search Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
