
import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Eye, Monitor } from 'lucide-react';
import DeadPixelClient from '@/components/tools/DeadPixelClient';

export const metadata: Metadata = {
  title: "Dead Pixel Test | Screen Quality Check",
  description: "Identify dead, stuck, or hot pixels on your monitor or phone screen. Fullscreen color cycle tool.",
  keywords: ["dead pixel test", "screen check", "monitor test", "stuck pixel fixer"]
};

export default function DeadPixelPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Dead Pixel Tester",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    "description": "Flash solid colors to find screen defects like stuck or dead pixels."
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <DeadPixelClient />
      
      <div className="max-w-4xl mx-auto px-4 pb-20 mt-12">
        {/* Related Benchmarks */}
        <div className="border-t border-zinc-800 pt-8">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Related Benchmarks</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/test/color-blind-test" className="group p-4 bg-zinc-900 border border-zinc-800 hover:border-primary-500/50 transition-all rounded block">
                    <div className="flex items-center gap-2 text-white font-bold mb-1">
                        <Eye className="text-primary-500" size={18} /> Color Blind Test
                    </div>
                    <p className="text-xs text-zinc-500 group-hover:text-zinc-400">Is it your screen or your eyes? Check for CVD.</p>
                    <div className="mt-2 text-[10px] font-mono text-primary-500 flex items-center gap-1">START_TEST <ArrowRight size={10} /></div>
                </Link>
                <Link href="/tools/hz-test" className="group p-4 bg-zinc-900 border border-zinc-800 hover:border-primary-500/50 transition-all rounded block">
                    <div className="flex items-center gap-2 text-white font-bold mb-1">
                        <Monitor className="text-yellow-500" size={18} /> Hz Checker
                    </div>
                    <p className="text-xs text-zinc-500 group-hover:text-zinc-400">Verify your screen refresh rate and motion blur.</p>
                    <div className="mt-2 text-[10px] font-mono text-yellow-500 flex items-center gap-1">START_TEST <ArrowRight size={10} /></div>
                </Link>
            </div>
        </div>
      </div>
    </>
  );
}
