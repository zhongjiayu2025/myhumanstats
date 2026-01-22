
import React from 'react';
import Link from 'next/link';
import { WifiOff, Home, Database, Activity, Brain } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "404 Not Found | MyHumanStats",
  description: "Signal Lost. The page you are looking for does not exist.",
  robots: "noindex, nofollow"
};

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-4">
      <div className="relative mb-8">
         <WifiOff size={80} className="text-zinc-800" />
         <div className="absolute inset-0 flex items-center justify-center">
            <WifiOff size={80} className="text-primary-500 animate-pulse opacity-50" />
         </div>
      </div>

      <h1 className="text-6xl font-black text-white tracking-tighter mb-2 glitch-text">404</h1>
      <h2 className="text-xl font-mono text-primary-500 uppercase tracking-widest mb-6">Signal Lost</h2>
      
      <p className="text-zinc-400 max-w-md mx-auto mb-12 leading-relaxed">
         The requested sector could not be located in the neural link. The path may be corrupted or restricted.
      </p>

      {/* Point 7: Popular Modules Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12 w-full max-w-md">
         <Link href="/test/reaction-time-test" className="p-4 bg-zinc-900 border border-zinc-800 rounded hover:border-primary-500/50 transition-colors group text-left">
            <div className="flex items-center gap-2 text-white font-bold mb-1">
               <Activity size={16} className="text-primary-500"/> Reaction Time
            </div>
            <p className="text-xs text-zinc-500">Test your reflexes</p>
         </Link>
         <Link href="/test/hearing-age-test" className="p-4 bg-zinc-900 border border-zinc-800 rounded hover:border-primary-500/50 transition-colors group text-left">
            <div className="flex items-center gap-2 text-white font-bold mb-1">
               <Activity size={16} className="text-primary-500"/> Hearing Age
            </div>
            <p className="text-xs text-zinc-500">Check frequency range</p>
         </Link>
         <Link href="/test/iq-test" className="p-4 bg-zinc-900 border border-zinc-800 rounded hover:border-primary-500/50 transition-colors group text-left">
            <div className="flex items-center gap-2 text-white font-bold mb-1">
               <Brain size={16} className="text-primary-500"/> Cognitive
            </div>
            <p className="text-xs text-zinc-500">Memory & Logic</p>
         </Link>
         <Link href="/tools" className="p-4 bg-zinc-900 border border-zinc-800 rounded hover:border-primary-500/50 transition-colors group text-left">
            <div className="flex items-center gap-2 text-white font-bold mb-1">
               <Database size={16} className="text-primary-500"/> All Tools
            </div>
            <p className="text-xs text-zinc-500">Utilities & Benchmarks</p>
         </Link>
      </div>

      <div className="flex gap-4">
         <Link href="/" className="btn-primary flex items-center gap-2">
            <Home size={18} /> Return to Dashboard
         </Link>
      </div>
    </div>
  );
}
