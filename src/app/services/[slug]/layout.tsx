import type { Metadata } from 'next';
import {
  getServiceSeoBySlug,
  humanizeServiceSlug,
  SITE_URL,
} from '@/lib/service-seo';

type ServiceLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

const logoUrl = `${SITE_URL}/DESIGN%20WALLA%20LOGO%20.jpg`;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceSeoBySlug(slug);
  const name = service?.category || humanizeServiceSlug(slug);
  const url = `${SITE_URL}/services/${service?.slug || slug}`;
  const title = service?.metaTitle || `${name} Services | Design Walla`;
  const description = service?.metaDescription || `Hire Design Walla for ${name.toLowerCase()} services, creative production, design assets, and business-ready deliverables.`;
  const image = service?.image || logoUrl;

  return {
    title,
    description,
    keywords: service?.keywords || [name, 'Design Walla services'],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Design Walla',
      images: [{ url: image, width: 1200, height: 630, alt: `${name} by Design Walla` }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export default async function ServiceDetailLayout({ children, params }: ServiceLayoutProps) {
  const { slug } = await params;
  const service = getServiceSeoBySlug(slug);
  const name = service?.category || humanizeServiceSlug(slug);
  const url = `${SITE_URL}/services/${service?.slug || slug}`;
  const description = service?.metaDescription || `Design Walla ${name} services.`;
  const image = service?.image || logoUrl;

  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': `${url}#service`,
        name,
        serviceType: name,
        description,
        url,
        image,
        areaServed: ['India', 'Worldwide'],
        provider: {
          '@type': 'Organization',
          '@id': `${SITE_URL}/#organization`,
          name: 'Design Walla',
          url: SITE_URL,
          logo: logoUrl,
        },
        hasOfferCatalog: service
          ? {
              '@type': 'OfferCatalog',
              name: `${name} deliverables`,
              itemListElement: service.includes.map((item, index) => ({
                '@type': 'Offer',
                position: index + 1,
                itemOffered: {
                  '@type': 'Service',
                  name: item,
                },
              })),
            }
          : undefined,
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: SITE_URL,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Services',
            item: `${SITE_URL}/services`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name,
            item: url,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      {children}
    </>
  );
}
