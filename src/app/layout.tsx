import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import ClientLayoutWrapper from "@/components/layout/ClientLayoutWrapper";
import SmoothScrollProvider from "@/components/layout/SmoothScrollProvider";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
  preload: true,
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#050505' },
    { media: '(prefers-color-scheme: light)', color: '#F9FAFB' },
  ],
};

export const metadata: Metadata = {
  title: "Design Walla | Premium 3D Models, Interior Design & Web Templates",
  description: "World-class digital marketplace for Interior/Exterior Design, 3D Models, Website & App Development, Digital Marketing, Company Branding, Animation, Video Editing, and Printing Work.",
  keywords: [
    "Design Walla", "Interior Design", "Exterior Design", "3D Models", "Product Design", "OBJ files", "FBX files",
    "Digital Marketing", "Company Branding", "Website Templates", "App Development", "Software Development",
    "Animation", "Motion Graphics", "Graphic Design", "Video Editing", "Printing Work", "Food Cart Design"
  ],
  authors: [{ name: "Design Walla Team" }],
  creator: "Design Walla",
  publisher: "Design Walla",
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    title: "Design Walla | Premium Creative Assets & Services",
    description: "Your ultimate digital ecosystem for Interior Design, 3D Models, Web Development, and Digital Marketing.",
    url: "https://designwalla.com",
    siteName: "Design Walla",
    images: [{ url: "https://designwalla.com/DESIGN%20WALLA%20LOGO%20.jpg", width: 1200, height: 630, alt: "Design Walla Logo" }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Design Walla | Premium Creative Assets",
    description: "Your ultimate digital ecosystem for Interior Design, 3D Models, Web Development, and Digital Marketing.",
    images: ["https://designwalla.com/DESIGN%20WALLA%20LOGO%20.jpg"],
  },
  alternates: { canonical: "https://designwalla.com" },
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  verification: {
    google: ['ab066daedd7a2056', 'UNHyN8C_lGGuRd98oIMGuT6OAksyBZTWnWFPxKk3faI'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${outfit.variable} antialiased`}
    >
      <head>
        {/* Google Analytics (Verification & Tracking) */}
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID}`} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID}', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />

        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_ID}');
            `,
          }}
        />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Design Walla",
              "url": "https://designwalla.com",
              "logo": "https://designwalla.com/DESIGN%20WALLA%20LOGO%20.jpg",
              "description": "World-class digital marketplace for Interior/Exterior Design, 3D Models, Website & App Development, Digital Marketing, Company Branding, Animation, Video Editing, and Printing Work.",
              "sameAs": [
                "https://www.instagram.com/designwalla",
                "https://www.facebook.com/designwalla"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer support"
              }
            })
          }}
        />

        {/* DNS prefetch + preconnect for every external origin we load from */}
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        <link rel="preconnect" href="https://cdn.simpleicons.org" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdn.simpleicons.org" />

        {/* Preload the hero LCP image — highest priority fetch */}
        <link
          rel="preload"
          as="image"
          href="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1920"
          fetchPriority="high"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/30 selection:text-primary max-w-[100vw] overflow-x-hidden">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe 
            src={`https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GTM_ID}`}
            height="0" 
            width="0" 
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <SmoothScrollProvider>
          <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
            <ClientLayoutWrapper>
              {children}
            </ClientLayoutWrapper>
          </ThemeProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
