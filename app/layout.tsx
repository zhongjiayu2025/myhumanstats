
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
  title: "MyHumanStats | Quantify Yourself",
  description: "A personal digital ability dashboard to measure your auditory, visual, cognitive, and personality traits through scientific testing.",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
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
