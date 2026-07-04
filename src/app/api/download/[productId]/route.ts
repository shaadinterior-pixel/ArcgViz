import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service-role client on server — never exposed to browser
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder',
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;

  // ── 1. Get user session from Authorization header or cookie ────────────────
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  let userId: string | null = null;

  if (token) {
    const { data } = await supabaseAdmin.auth.getUser(token);
    userId = data.user?.id ?? null;
  } else {
    // Try cookie-based session (browser navigation)
    const cookieHeader = request.headers.get('cookie') ?? '';
    // Supabase stores session in sb-*-auth-token cookies
    const sessionMatch = cookieHeader.match(/sb-[^=]+-auth-token=([^;]+)/);
    if (sessionMatch) {
      try {
        const sessionData = JSON.parse(decodeURIComponent(sessionMatch[1]));
        const accessToken = sessionData?.access_token ?? sessionData?.[0]?.access_token;
        if (accessToken) {
          const { data } = await supabaseAdmin.auth.getUser(accessToken);
          userId = data.user?.id ?? null;
        }
      } catch {
        // ignore parse errors
      }
    }
  }

  // ── 2. Require authentication ──────────────────────────────────────────────
  if (!userId) {
    return NextResponse.json(
      { error: 'Authentication required. Please sign in to download.' },
      { status: 401 }
    );
  }

  // ── 3. Verify purchase ─────────────────────────────────────────────────────
  const { data: purchase, error: purchaseError } = await supabaseAdmin
    .from('purchases')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .maybeSingle();

  if (purchaseError || !purchase) {
    return NextResponse.json(
      { error: 'Purchase not found. You must purchase this product before downloading.' },
      { status: 403 }
    );
  }

  // ── 4. Fetch product download URL ─────────────────────────────────────────
  const { data: product, error: productError } = await supabaseAdmin
    .from('products')
    .select('download_url, name, status')
    .eq('id', productId)
    .single();

  if (productError || !product) {
    return NextResponse.json(
      { error: 'Product not found.' },
      { status: 404 }
    );
  }

  if (product.status !== 'Active') {
    return NextResponse.json(
      { error: 'This product is currently unavailable.' },
      { status: 410 }
    );
  }

  if (!product.download_url) {
    return NextResponse.json(
      { error: 'Download file not yet attached to this product. Please contact support.' },
      { status: 404 }
    );
  }

  // ── 5. Redirect to download URL ────────────────────────────────────────────
  // The URL is never exposed to the client — we redirect server-side.
  // Google Drive uc?export=download triggers a file download.
  return NextResponse.redirect(product.download_url, { status: 302 });
}
