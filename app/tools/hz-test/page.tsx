
import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Crosshair, Zap } from 'lucide-react';
import HzCheckClient from '@/components/tools/HzCheckClient';

export const metadata: Metadata = {
  title: "Screen Refresh Rate Test | Hz Checker",
  description: "Check your monitor's real refresh rate (Hz) and frame time latency. Visualize motion smoothness and motion blur.",
  keywords: ["hz test", "refresh rate", "monitor test", "fps counter", "screen check"]
};

export default function RefreshRatePage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Hz Checker",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    "description": "Measure screen refresh rate and visualize motion clarity."
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <HzCheckClient />

      <div className="max-w-4xl mx-auto px-4 pb-20">
        {/* Related Benchmarks */}
        <div className="border-t border-zinc-800 pt-8">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Related Benchmarks</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/test/reaction-time-test" className="group p-4 bg-zinc-900 border border-zinc-800 hover:border-primary-500/50 transition-all rounded block">
                    <div className="flex items-center gap-2 text-white font-bold mb-1">
                        <Zap className="text-yellow-500" size={18} /> Reaction Time
                    </div>
                    <p className="text-xs text-zinc-500 group-hover:text-zinc-400">High refresh rates improve reaction scores. Test it now.</p>
                    <div className="mt-2 text-[10px] font-mono text-yellow-500 flex items-center gap-1">START_TEST <ArrowRight size={10} /></div>
                </Link>
                <Link href="/test/aim-trainer-test" className="group p-4 bg-zinc-900 border border-zinc-800 hover:border-primary-500/50 transition-all rounded block">
                    <div className="flex items-center gap-2 text-white font-bold mb-1">
                        <Crosshair className="text-primary-500" size={18} /> Aim Trainer
                    </div>
                    <p className="text-xs text-zinc-500 group-hover:text-zinc-400">Test your tracking accuracy on this screen.</p>
                    <div className="mt-2 text-[10px] font-mono text-primary-500 flex items-center gap-1">START_TEST <ArrowRight size={10} /></div>
                </Link>
            </div>
        </div>
      </div>
    </>
  );
}
