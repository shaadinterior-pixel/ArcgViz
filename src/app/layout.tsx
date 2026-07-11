import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
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
  title: "Design Walla | Premium 3D Interior Assets",
  description: "World-class digital marketplace for selling Interior Architecture and Design Walla assets.",
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
      <body className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/30 selection:text-primary">
        <SmoothScrollProvider>
          <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
            <ClientLayoutWrapper>
              {children}
            </ClientLayoutWrapper>
          </ThemeProvider>
        </SmoothScrollProvider>
        <Analytics />
      </body>
    </html>
  );
}
