import { redirect } from 'next/navigation';

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  // Redirect to products page and search for the collection slug
  const searchQuery = resolvedParams.slug.replace(/-/g, ' ');
  redirect(`/products?search=${encodeURIComponent(searchQuery)}`);
}
