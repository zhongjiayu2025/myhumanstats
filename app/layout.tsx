
import React from 'react';
import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/Layout";
import { SettingsProvider } from "@/lib/settings";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
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
    // Sets a default canonical strategy.
    // './' resolves to the current absolute URL path (e.g. https://myhumanstats.org/about)
    // Dynamic pages override this with specific IDs.
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
        url: '/api/og', // Uses dynamic OG image generator
        width: 1200,
        height: 630,
        alt: 'MyHumanStats Dashboard',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MyHumanStats | Quantify Yourself',
    description: 'Measure your auditory, visual, and cognitive performance.',
    images: ['/api/og'],
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
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-background text-zinc-200 antialiased`}>
        <SettingsProvider>
           <ClientLayout>
              {children}
           </ClientLayout>
        </SettingsProvider>
      </body>
    </html>
  );
}
