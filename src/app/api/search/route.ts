import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Helper to call Groq API for semantic ranking
async function rankWithGroq(query: string, candidates: any[]): Promise<string[]> {
  const groqApiKey = process.env.GROQ_API_KEY;
  
  if (!groqApiKey || candidates.length === 0) {
    return candidates.slice(0, 8).map(c => c.id);
  }

  // OPTIMIZATION: Drastically reduce tokens by sending ONLY what the AI needs to understand the item.
  // We rename keys to 1-letter abbreviations (i=id, n=name, c=category) to save even more tokens!
  const optimizedCatalog = candidates.map(c => ({
    i: c.id,
    n: c.name || c.title,
    c: c.category
  }));

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant', // Ultra-fast and token-efficient model
        response_format: { type: "json_object" },
        messages: [
          {
            role: 'system',
            content: `You are an AI search ranker for a 3D assets marketplace.
You will receive a JSON array of catalog items (i=ID, n=Name, c=Category).
Task: Find the items that semantically match the user's search query.
Return ONLY a JSON object with a single key "ids" containing an array of the best matching string IDs, ordered by relevance (max 8).
Example Output: {"ids":["uuid-1","uuid-2"]}
Do not include any other text.`
          },
          {
            role: 'user',
            content: `Query: "${query}"\n\nCatalog: ${JSON.stringify(optimizedCatalog)}`
          }
        ],
        temperature: 0.1, // Low temp for strictly logical matching
        max_tokens: 150, // Limit output tokens since we only want IDs
      }),
      signal: AbortSignal.timeout(2000) // Strict 2-second timeout to keep UI fast
    });

    if (!response.ok) {
      console.warn('Groq API error (RAG):', await response.text());
      return candidates.slice(0, 8).map(c => c.id);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);
    
    if (parsed && Array.isArray(parsed.ids)) {
      return parsed.ids;
    }
    
    return candidates.slice(0, 8).map(c => c.id);
  } catch (err) {
    console.warn('Failed to rank with Groq API:', err);
    return candidates.slice(0, 8).map(c => c.id);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  try {
    // Stage 1: Broad Retrieval (Fetch potential candidates)
    const term = `%${q.trim()}%`;
    
    const [productsRes, servicesRes] = await Promise.all([
      supabase
        .from('products')
        .select('id, name, category, price, image, slug, thumbnail_url')
        .or(`name.ilike.${term},category.ilike.${term},description.ilike.${term}`)
        .eq('status', 'Active')
        .limit(30), // Increased limit for broader pool
      supabase
        .from('services')
        .select('id, title, category, image')
        .or(`title.ilike.${term},category.ilike.${term},description.ilike.${term}`)
        .limit(10)
    ]);

    const products = productsRes.data || [];
    const services = servicesRes.data || [];
    const allCandidates = [...products, ...services];

    if (allCandidates.length === 0) {
      return NextResponse.json([]);
    }

    // Stage 2: AI RAG Ranking (Semantically select best matches)
    const rankedIds = await rankWithGroq(q, allCandidates);

    // Stage 3: Hydrate and Format Results for Client
    const finalResults = [];
    
    for (const id of rankedIds) {
      const pMatch = products.find(p => p.id === id);
      if (pMatch) {
        finalResults.push({
          id: pMatch.id,
          name: pMatch.name,
          category: pMatch.category,
          price: pMatch.price,
          image: pMatch.thumbnail_url || pMatch.image || '',
          slug: pMatch.slug || pMatch.id,
          type: 'product',
        });
        continue;
      }

      const sMatch = services.find(s => s.id === id);
      if (sMatch) {
        finalResults.push({
          id: sMatch.id,
          name: sMatch.title,
          category: sMatch.category,
          price: 'Service',
          image: sMatch.image || '',
          slug: '',
          type: 'service',
        });
      }
    }

    // Fallback: If AI returned nothing or crashed, just return standard top results
    if (finalResults.length === 0) {
      const fallback = allCandidates.slice(0, 8).map(c => {
        if ('title' in c) {
          return { id: c.id, name: c.title, category: c.category, price: 'Service', image: c.image || '', slug: '', type: 'service' };
        }
        return { id: c.id, name: c.name, category: c.category, price: c.price, image: c.thumbnail_url || c.image || '', slug: c.slug || c.id, type: 'product' };
      });
      return NextResponse.json(fallback);
    }

    return NextResponse.json(finalResults);
  } catch (error) {
    console.error('API Search Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
