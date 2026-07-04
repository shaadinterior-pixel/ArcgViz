import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gzip / Brotli all responses
  compress: true,

  // Tree-shake unused exports in production
  reactStrictMode: true,

  // Allow next/image to optimize from these external domains
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'cdn.jsdelivr.net' },
      { protocol: 'https', hostname: 'cdn.simpleicons.org' },
      { protocol: 'https', hostname: 'source.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    // Serve the smallest matching width — saves bandwidth on low-end devices
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    // Minimise origin requests: keep optimised images for 30 days
    minimumCacheTTL: 2592000,
  },

  // Custom response headers
  async headers() {
    return [
      {
        // Security headers on all routes
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        // Immutable cache for static assets — they never change once hashed
        source: '/(.*)\\.(ico|png|jpg|jpeg|svg|webp|avif|woff|woff2|js|css)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Cache API responses for 60 s on CDN, serve stale while revalidating
        source: '/api/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=60, stale-while-revalidate=120' },
        ],
      },
    ];
  },
};

export default nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
