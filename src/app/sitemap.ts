import { MetadataRoute } from 'next';
import { fetchProducts } from '@/lib/store';
import { CORE_SERVICES, SITE_URL } from '@/lib/service-seo';

const toDate = (value?: string) => {
  if (!value) return new Date();
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? new Date() : new Date(timestamp);
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;

  let products: MetadataRoute.Sitemap = [];
  try {
    const productData = await fetchProducts();
    products = productData
      .filter((product) => product.status === 'Active' && (product.slug || product.id))
      .map((product) => ({
        url: `${baseUrl}/products/${product.slug || product.id}`,
        lastModified: toDate(product.updated_at || product.created_at || product.date),
        changeFrequency: 'weekly' as const,
        priority: 0.75,
      }));
  } catch {
    products = [];
  }

  const serviceRoutes = CORE_SERVICES.map((service) => ({
    url: `${baseUrl}/services/${service.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...serviceRoutes,
    {
      url: `${baseUrl}/portfolio`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/resources`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.65,
    },
    {
      url: `${baseUrl}/free-resources`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.65,
    },
    ...products,
  ];
}
