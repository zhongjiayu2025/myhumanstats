
import React from 'react';
import Link from 'next/link';
import { WifiOff, Home, Database } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "404 Not Found | MyHumanStats",
  description: "Signal Lost. The page you are looking for does not exist.",
  robots: "noindex, nofollow"
};

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
      <div className="relative mb-8">
         <WifiOff size={80} className="text-zinc-800" />
         <div className="absolute inset-0 flex items-center justify-center">
            <WifiOff size={80} className="text-primary-500 animate-pulse opacity-50" />
         </div>
      </div>

      <h1 className="text-6xl font-black text-white tracking-tighter mb-2 glitch-text">404</h1>
      <h2 className="text-xl font-mono text-primary-500 uppercase tracking-widest mb-6">Signal Lost</h2>
      
      <p className="text-zinc-400 max-w-md mx-auto mb-8 leading-relaxed">
         The requested sector could not be located in the neural link. The path may be corrupted or restricted.
      </p>

      <div className="flex gap-4">
         <Link href="/" className="btn-primary flex items-center gap-2">
            <Home size={18} /> Return to Dashboard
         </Link>
         <Link href="/sitemap" className="btn-secondary flex items-center gap-2">
            <Database size={18} /> View Sitemap
         </Link>
      </div>
    </div>
  );
}
