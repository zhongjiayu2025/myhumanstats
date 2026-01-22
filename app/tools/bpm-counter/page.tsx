
import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Activity, Zap } from 'lucide-react';
import BPMClient from '@/components/tools/BPMClient';

export const metadata: Metadata = {
  title: "Tap BPM Counter | Online Tempo Tool",
  description: "Tap any key to count beats per minute (BPM). Free online tempo tapper for musicians, DJs, and producers.",
  keywords: ["bpm counter", "tap bpm", "tempo tapper", "beats per minute", "music tool"]
};

export default function BPMPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Tap BPM Counter",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "Any",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    "description": "Calculate tempo (Beats Per Minute) by tapping a key."
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <BPMClient />
      
      <div className="max-w-4xl mx-auto px-4 pb-20">
        <div className="prose prose-invert prose-sm text-zinc-400 mb-12">
          <h2 className="text-white text-2xl font-bold">How to Calculate BPM Manually</h2>
          <p>
            Beats Per Minute (BPM) is the standard unit for measuring tempo. While digital tools like this <strong>Tap BPM Counter</strong> are instant, you can calculate it manually by counting beats for 15 seconds and multiplying by 4.
          </p>
          
          <h3 className="text-white text-lg font-bold">Common Genre Tempos</h3>
          <ul>
            <li><strong>Hip Hop:</strong> 85 - 100 BPM</li>
            <li><strong>House:</strong> 115 - 130 BPM</li>
            <li><strong>Techno:</strong> 120 - 140 BPM</li>
            <li><strong>Dubstep:</strong> 140 BPM (often felt as 70 BPM)</li>
            <li><strong>Drum & Bass:</strong> 170 - 180 BPM</li>
          </ul>

          <h3 className="text-white text-lg font-bold">Why Use a Tap Counter?</h3>
          <p>
            DJs use tap counters to beatmatch songs when the software analysis fails. Musicians use them to find the tempo of a sample or to synchronize delay effects to a live band.
          </p>
        </div>

        {/* Related Benchmarks */}
        <div className="border-t border-zinc-800 pt-8">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Related Benchmarks</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/test/rhythm-test" className="group p-4 bg-zinc-900 border border-zinc-800 hover:border-primary-500/50 transition-all rounded block">
                    <div className="flex items-center gap-2 text-white font-bold mb-1">
                        <Activity className="text-primary-500" size={18} /> Rhythm Test
                    </div>
                    <p className="text-xs text-zinc-500 group-hover:text-zinc-400">Can you keep a steady beat without a metronome?</p>
                    <div className="mt-2 text-[10px] font-mono text-primary-500 flex items-center gap-1">START_TEST <ArrowRight size={10} /></div>
                </Link>
                <Link href="/test/spacebar-speed-test" className="group p-4 bg-zinc-900 border border-zinc-800 hover:border-primary-500/50 transition-all rounded block">
                    <div className="flex items-center gap-2 text-white font-bold mb-1">
                        <Zap className="text-yellow-500" size={18} /> Spacebar Speed
                    </div>
                    <p className="text-xs text-zinc-500 group-hover:text-zinc-400">How fast can you tap? Measure your max CPS.</p>
                    <div className="mt-2 text-[10px] font-mono text-yellow-500 flex items-center gap-1">START_TEST <ArrowRight size={10} /></div>
                </Link>
            </div>
        </div>
      </div>
    </>
  );
}
