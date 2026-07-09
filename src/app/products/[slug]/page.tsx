import { Metadata } from 'next';
import { fetchProductBySlug, fetchAllSlugs, fetchProducts } from '@/lib/store';
import ProductClient from './ProductClient';
import { notFound } from 'next/navigation';

type Props = { params: Promise<{ slug: string }> };

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await fetchProductBySlug(slug);
  if (!product) return { title: 'Product Not Found | Design Walla' };
  return {
    title: `${product.name} | Design Walla`,
    description: product.description ?? `High-quality 3D asset by ${product.author}`,
    openGraph: {
      images: [product.thumbnail_url || product.image].filter(Boolean),
    },
  };
}

export default async function ProductDetailsPage(props: Props) {
  const { slug } = await props.params;
  const product = await fetchProductBySlug(slug);
  if (!product) notFound();

  // Fetch all products to find recommendations
  const allProducts = await fetchProducts();
  
  const productWords = (product.name || '').toLowerCase().split(/\s+/).filter(w => w.length > 3);

  // Filter out the current product and prioritize same category, author, or similar name
  const similarProducts = allProducts
    .filter(p => {
      if (p.id === product.id || p.status === 'Draft') return false;
      const isSameCategory = p.category === product.category;
      const isSameAuthor = p.author === product.author;
      const pName = (p.name || '').toLowerCase();
      const hasSimilarName = productWords.some(w => pName.includes(w));
      return isSameCategory || isSameAuthor || hasSimilarName;
    })
    .sort((a, b) => {
      // Prioritize same category, then fallback to sorting by sales
      if (a.category === product.category && b.category !== product.category) return -1;
      if (a.category !== product.category && b.category === product.category) return 1;
      return (b.sales || 0) - (a.sales || 0);
    });

  return <ProductClient product={product} similarProducts={similarProducts} />;
}
