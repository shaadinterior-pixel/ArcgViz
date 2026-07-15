import type { ServiceDetail } from '@/lib/store';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://designwalla.com';

export type ServiceSeo = {
  slug: string;
  category: string;
  title: string;
  tagline: string;
  metaTitle: string;
  metaDescription: string;
  description: string;
  image: string;
  keywords: string[];
  includes: string[];
  aliases: string[];
};

export const CORE_SERVICES: ServiceSeo[] = [
  {
    slug: 'interior-exterior-design',
    category: 'Interior / Exterior Design',
    title: 'Interior and Exterior Design Services',
    tagline: 'Photorealistic spaces, facades, shops, kiosks, and food cart concepts.',
    metaTitle: 'Interior / Exterior Design Services | Design Walla',
    metaDescription: 'Hire Design Walla for interior design, exterior design, 3D visualization, facade concepts, shop design, kiosk design, and food cart design services.',
    description: 'Design Walla creates residential, commercial, retail, and food cart design concepts with practical layouts, premium styling, and production-ready 3D visuals.',
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1200',
    keywords: ['interior design', 'exterior design', 'food cart design', 'shop design', '3d interior render', 'facade design'],
    includes: ['Residential and commercial interior concepts', 'Exterior elevation and facade design', 'Food cart, kiosk, and retail layout design', '3D views, renders, and presentation-ready visuals'],
    aliases: ['interior exterior design', 'interior exterior design and work', 'interior design', 'exterior design'],
  },
  {
    slug: '3d-model-product-design',
    category: '3D Model & Product Design',
    title: '3D Model and Product Design Services',
    tagline: 'Custom models, product mockups, OBJ files, FBX assets, and render-ready files.',
    metaTitle: '3D Model & Product Design Services | OBJ, FBX, GLB | Design Walla',
    metaDescription: 'Custom 3D model and product design services for OBJ, FBX, GLB, Blender, Unreal, Unity, ecommerce visuals, prototypes, and product renders.',
    description: 'Get custom 3D models, product visualizations, and clean downloadable assets built for presentation, ecommerce, animation, and realtime use.',
    image: 'https://images.unsplash.com/photo-1618220179428-22790b46a0eb?auto=format&fit=crop&q=80&w=1200',
    keywords: ['3d models', 'obj files', 'fbx files', 'glb model', 'product design', '3d product render'],
    includes: ['Custom 3D modeling and product visualization', 'OBJ, FBX, GLB, and Blender-ready deliverables', 'Texture, material, and render setup', 'Optimized models for web, games, ecommerce, and presentations'],
    aliases: ['3d model product design', '3d model and product design', '3d models', 'product design'],
  },
  {
    slug: 'digital-marketing',
    category: 'Digital Marketing',
    title: 'Digital Marketing Services',
    tagline: 'Campaigns, search visibility, social creatives, and growth-focused strategy.',
    metaTitle: 'Digital Marketing Services | SEO, Ads & Social | Design Walla',
    metaDescription: 'Digital marketing services for SEO, social media creatives, paid ads, campaign planning, local business growth, and brand visibility.',
    description: 'Design Walla plans and produces digital marketing campaigns that connect brand strategy, content, search visibility, and conversion-focused creative.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200',
    keywords: ['digital marketing', 'seo services', 'social media marketing', 'paid ads', 'brand growth', 'local marketing'],
    includes: ['SEO and search visibility planning', 'Social media creative and campaign design', 'Paid ad creatives and landing page direction', 'Content ideas, reporting, and growth recommendations'],
    aliases: ['digital marketing', 'seo', 'social media marketing'],
  },
  {
    slug: 'company-branding',
    category: 'Company Branding',
    title: 'Company Branding Services',
    tagline: 'Logo systems, brand identity, packaging direction, and launch-ready assets.',
    metaTitle: 'Company Branding Services | Logo & Brand Identity | Design Walla',
    metaDescription: 'Company branding services for logo design, brand identity, visual systems, packaging direction, social media kits, and business launch assets.',
    description: 'Build a sharper business identity with logo systems, typography, color palettes, brand guidelines, packaging direction, and digital launch assets.',
    image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=1200',
    keywords: ['company branding', 'brand identity', 'logo design', 'brand kit', 'packaging design', 'business branding'],
    includes: ['Logo and visual identity direction', 'Color, typography, and brand usage system', 'Packaging and social media brand assets', 'Launch-ready brand kit for print and digital use'],
    aliases: ['company branding', 'branding', 'brand identity'],
  },
  {
    slug: 'website-apps-software',
    category: 'Website / Apps / Software',
    title: 'Website, App, and Software Development Services',
    tagline: 'Modern websites, apps, dashboards, ecommerce, and business software.',
    metaTitle: 'Website / Apps / Software Development | Design Walla',
    metaDescription: 'Website, app, and software development services for business websites, ecommerce, dashboards, booking systems, portals, and custom web apps.',
    description: 'Design Walla builds responsive websites, landing pages, dashboards, ecommerce flows, portals, and custom business software with clean UI and practical workflows.',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1200',
    keywords: ['website development', 'app development', 'software development', 'web design', 'ecommerce website', 'business website'],
    includes: ['Business websites and landing pages', 'Web apps, dashboards, and admin panels', 'Ecommerce and booking flows', 'Responsive UI, SEO foundations, and deployment support'],
    aliases: ['website apps software', 'website app software', 'website templates', 'web development', 'app development', 'software development'],
  },
  {
    slug: 'animation-motion-graphics',
    category: 'Animation & Motion Graphic',
    title: 'Animation and Motion Graphics Services',
    tagline: 'Explainers, product motion, logo reveals, reels, and animated brand content.',
    metaTitle: 'Animation & Motion Graphics Services | Design Walla',
    metaDescription: 'Animation and motion graphics services for logo animation, product videos, explainers, reels, brand motion, and social media video creatives.',
    description: 'Create scroll-stopping animated content for products, brands, explainers, intros, social reels, and launch campaigns.',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200',
    keywords: ['animation services', 'motion graphics', 'logo animation', 'explainer video', 'product animation', 'animated reels'],
    includes: ['Logo animation and brand motion systems', 'Product animation and explainer videos', 'Reels, ads, intros, and social creatives', 'Storyboard, editing, sound sync, and export-ready files'],
    aliases: ['animation motion graphic', 'animation and motion graphic', 'motion graphics', 'animation'],
  },
  {
    slug: 'graphic-design',
    category: 'Graphic Design',
    title: 'Graphic Design Services',
    tagline: 'Posters, catalogs, social creatives, brochures, menus, and marketing collateral.',
    metaTitle: 'Graphic Design Services | Posters, Menus & Social Creatives | Design Walla',
    metaDescription: 'Graphic design services for posters, catalogs, menus, brochures, flyers, social posts, brand creatives, and marketing collateral.',
    description: 'Get polished graphic design for campaigns, social posts, print collateral, menus, catalogs, brochures, signage, and business promotions.',
    image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=1200',
    keywords: ['graphic design', 'poster design', 'flyer design', 'menu design', 'brochure design', 'social media design'],
    includes: ['Social media posts and ad creatives', 'Flyers, brochures, menus, and catalogs', 'Campaign graphics and brand collateral', 'Print-ready and digital-ready export formats'],
    aliases: ['graphic design', 'graphics design'],
  },
  {
    slug: 'video-editing',
    category: 'Video Editing',
    title: 'Video Editing Services',
    tagline: 'Reels, ads, brand videos, product edits, color, captions, and sound polish.',
    metaTitle: 'Video Editing Services | Reels, Ads & Brand Videos | Design Walla',
    metaDescription: 'Video editing services for reels, ads, product videos, YouTube edits, brand films, captions, sound cleanup, color grading, and social content.',
    description: 'Design Walla edits short-form and long-form videos for social media, products, ads, YouTube, brand stories, and business promotions.',
    image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&q=80&w=1200',
    keywords: ['video editing', 'reels editing', 'ad video editing', 'youtube editing', 'product video', 'brand video'],
    includes: ['Reels, shorts, ads, and product edits', 'Captions, transitions, sound, and pacing', 'Color grading and cleanup', 'Export-ready formats for social, web, and presentations'],
    aliases: ['video editing', 'video editor'],
  },
  {
    slug: 'printing-work',
    category: 'Printing Work',
    title: 'Printing Work and Print Design Services',
    tagline: 'Print-ready business cards, banners, packaging, menus, catalogs, and signage.',
    metaTitle: 'Printing Work Services | Print Design & Business Collateral | Design Walla',
    metaDescription: 'Printing work and print design services for business cards, banners, packaging, labels, menus, catalogs, posters, signage, and print-ready files.',
    description: 'Prepare professional print assets for businesses, events, stores, restaurants, launches, packaging, and promotional campaigns.',
    image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=1200',
    keywords: ['printing work', 'print design', 'business card design', 'banner design', 'packaging print', 'catalog design'],
    includes: ['Business cards, posters, banners, and signage', 'Menus, catalogs, labels, and packaging files', 'Print-ready artwork setup', 'Digital previews and vendor-friendly export formats'],
    aliases: ['printing work', 'print work', 'printing', 'print design'],
  },
];

const normalizeServiceKey = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/\+/g, ' plus ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');

const slugify = (value: string) =>
  normalizeServiceKey(value)
    .replace(/\bplus\b/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '');

const serviceBySlug = new Map(CORE_SERVICES.map((service) => [service.slug, service]));
const serviceByAlias = new Map(
  CORE_SERVICES.flatMap((service) => [
    [normalizeServiceKey(service.category), service] as const,
    [normalizeServiceKey(service.title), service] as const,
    ...service.aliases.map((alias) => [normalizeServiceKey(alias), service] as const),
  ])
);

export function getServiceSeoBySlug(slug: string): ServiceSeo | undefined {
  return serviceBySlug.get(slugify(slug)) || serviceByAlias.get(normalizeServiceKey(slug));
}

export function getServiceSeo(input: Pick<ServiceDetail, 'category' | 'title' | 'id'> | string): ServiceSeo | undefined {
  if (typeof input === 'string') return getServiceSeoBySlug(input);

  return (
    serviceBySlug.get(slugify(input.id || '')) ||
    serviceByAlias.get(normalizeServiceKey(input.category || '')) ||
    serviceByAlias.get(normalizeServiceKey(input.title || ''))
  );
}

export function getServiceSlug(input: Pick<ServiceDetail, 'category' | 'title' | 'id'> | string): string {
  const seo = getServiceSeo(input);
  if (seo) return seo.slug;

  if (typeof input === 'string') return slugify(input);
  return slugify(input.category || input.title || input.id || 'service');
}

export function getServicePath(input: Pick<ServiceDetail, 'category' | 'title' | 'id'> | string): string {
  return `/services/${getServiceSlug(input)}`;
}

export function getServiceUrl(input: Pick<ServiceDetail, 'category' | 'title' | 'id'> | string): string {
  return `${SITE_URL}${getServicePath(input)}`;
}

export function serviceSeoToDetail(service: ServiceSeo): ServiceDetail {
  return {
    id: service.slug,
    category: service.category,
    title: service.title,
    tagline: service.tagline,
    image: service.image,
    description: service.description,
    includes: [...service.includes],
  };
}

export function humanizeServiceSlug(slug: string): string {
  return slugify(slug)
    .split('-')
    .filter(Boolean)
    .map((part) => (part === '3d' ? '3D' : part.charAt(0).toUpperCase() + part.slice(1)))
    .join(' ');
}
