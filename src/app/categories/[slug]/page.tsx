import { redirect } from 'next/navigation';

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  redirect(`/products?category=${resolvedParams.slug}`);
}
