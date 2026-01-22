
import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Music2, Volume2 } from 'lucide-react';
import StereoCheckClient from '@/components/tools/StereoCheckClient';

export const metadata: Metadata = {
  title: "Left Right Stereo Audio Test | Speaker Check",
  description: "Test your speakers or headphones for correct Left/Right channel wiring. Ensure your audio setup is balanced.",
  keywords: ["stereo test", "left right audio test", "speaker test", "headphone test"]
};

export default function StereoTestPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Stereo Channel Tester",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    "description": "Verify Left and Right audio channels for headphones and speakers."
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <StereoCheckClient />

      <div className="max-w-4xl mx-auto px-4 pb-20">
        {/* Related Benchmarks */}
        <div className="border-t border-zinc-800 pt-8">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Related Benchmarks</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/test/tone-deaf-test" className="group p-4 bg-zinc-900 border border-zinc-800 hover:border-primary-500/50 transition-all rounded block">
                    <div className="flex items-center gap-2 text-white font-bold mb-1">
                        <Music2 className="text-primary-500" size={18} /> Tone Deaf Test
                    </div>
                    <p className="text-xs text-zinc-500 group-hover:text-zinc-400">Can you distinguish subtle pitch differences?</p>
                    <div className="mt-2 text-[10px] font-mono text-primary-500 flex items-center gap-1">START_TEST <ArrowRight size={10} /></div>
                </Link>
                <Link href="/test/hearing-age-test" className="group p-4 bg-zinc-900 border border-zinc-800 hover:border-primary-500/50 transition-all rounded block">
                    <div className="flex items-center gap-2 text-white font-bold mb-1">
                        <Volume2 className="text-emerald-500" size={18} /> Hearing Age
                    </div>
                    <p className="text-xs text-zinc-500 group-hover:text-zinc-400">Test your high-frequency hearing limit.</p>
                    <div className="mt-2 text-[10px] font-mono text-emerald-500 flex items-center gap-1">START_TEST <ArrowRight size={10} /></div>
                </Link>
            </div>
        </div>
      </div>
    </>
  );
}
