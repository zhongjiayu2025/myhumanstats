
import React from 'react';
import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/Layout";
import { SettingsProvider } from "@/lib/settings";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://myhumanstats.org'),
  title: {
    default: "MyHumanStats | Quantify Yourself",
    template: "%s | MyHumanStats"
  },
  description: "A personal digital ability dashboard to measure your auditory, visual, cognitive, and personality traits through scientific testing.",
  keywords: ["human benchmark", "reaction time test", "hearing test", "iq test", "cognitive test", "quantified self", "online test"],
  authors: [{ name: "MyHumanStats Team" }],
  creator: "MyHumanStats",
  publisher: "MyHumanStats",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: './',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://myhumanstats.org',
    title: 'MyHumanStats | Quantify Yourself',
    description: 'Measure your auditory, visual, and cognitive performance with professional-grade online tools.',
    siteName: 'MyHumanStats',
    images: [
      {
        url: '/logo.svg',
        width: 512,
        height: 512,
        alt: 'MyHumanStats Dashboard',
      }
    ],
  },
  twitter: {
    card: 'summary',
    title: 'MyHumanStats | Quantify Yourself',
    description: 'Measure your auditory, visual, and cognitive performance.',
    images: ['/logo.svg'],
    creator: '@myhumanstats',
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" }
    ],
    apple: [
      { url: "/logo.svg", type: "image/svg+xml" }
    ]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Advanced Schema: Sitelinks Search Box
  const searchSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": "https://myhumanstats.org/",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://myhumanstats.org/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(searchSchema) }}
        />
        {/* Performance Optimization: Preconnect to Image CDN */}
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        
        {/* Fallback for Image SEO if JS fails */}
        <noscript>
          <img 
            src="https://myhumanstats.org/logo.svg" 
            alt="MyHumanStats Quantified Self Dashboard Logo" 
            style={{ display: 'none', visibility: 'hidden' }} 
          />
        </noscript>
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-background text-zinc-200 antialiased`}>
        <SettingsProvider>
           <ServiceWorkerRegister />
           <ClientLayout>
              {children}
           </ClientLayout>
        </SettingsProvider>
      </body>
    </html>
  );
}
