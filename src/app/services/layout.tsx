import type { Metadata } from 'next';
import { CORE_SERVICES, SITE_URL } from '@/lib/service-seo';

const servicesUrl = `${SITE_URL}/services`;
const logoUrl = `${SITE_URL}/DESIGN%20WALLA%20LOGO%20.jpg`;

export const metadata: Metadata = {
  title: 'Creative Services | 3D, Interior, Branding, Web & Print | Design Walla',
  description: 'Explore Design Walla services for interior and exterior design, 3D models, product design, digital marketing, branding, websites, apps, animation, video editing, graphic design, and printing work.',
  keywords: CORE_SERVICES.flatMap((service) => service.keywords),
  alternates: {
    canonical: servicesUrl,
  },
  openGraph: {
    title: 'Design Walla Creative Services',
    description: 'Hire Design Walla for 3D modeling, interior design, branding, websites, digital marketing, animation, video editing, graphic design, and printing work.',
    url: servicesUrl,
    siteName: 'Design Walla',
    images: [{ url: logoUrl, width: 1200, height: 630, alt: 'Design Walla creative services' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Design Walla Creative Services',
    description: '3D, interior, branding, website, marketing, animation, video, graphic design, and printing services.',
    images: [logoUrl],
  },
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  const serviceCatalogJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: 'Design Walla',
        url: SITE_URL,
        logo: logoUrl,
      },
      {
        '@type': 'WebPage',
        '@id': `${servicesUrl}#webpage`,
        url: servicesUrl,
        name: 'Design Walla Creative Services',
        description: metadata.description,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: { '@id': `${SITE_URL}/#organization` },
      },
      {
        '@type': 'OfferCatalog',
        '@id': `${servicesUrl}#service-catalog`,
        name: 'Design Walla Services',
        url: servicesUrl,
        itemListElement: CORE_SERVICES.map((service, index) => ({
          '@type': 'Offer',
          position: index + 1,
          itemOffered: {
            '@type': 'Service',
            name: service.category,
            serviceType: service.category,
            description: service.metaDescription,
            provider: { '@id': `${SITE_URL}/#organization` },
            url: `${SITE_URL}/services/${service.slug}`,
          },
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceCatalogJsonLd) }}
      />
      {children}
    </>
  );
}
