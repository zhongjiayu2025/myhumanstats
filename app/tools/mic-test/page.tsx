
import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Mic, Music } from 'lucide-react';
import MicTestClient from '@/components/tools/MicTestClient';

export const metadata: Metadata = {
  title: "Online Microphone Test | Visualizer & Recorder",
  description: "Test your microphone online. Visualize audio input, check volume levels, and record a playback clip to ensure your mic is working.",
  keywords: ["mic test", "microphone test", "online voice recorder", "audio input test"]
};

export default function MicTestPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Microphone Tester",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    "description": "Visualize and playback microphone input to verify audio settings."
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <MicTestClient />

      <div className="max-w-4xl mx-auto px-4 pb-20">
       {/* Cross Sell */}
       <div className="mt-12 border-t border-zinc-800 pt-8">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Microphone working? Next steps:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <Link href="/test/vocal-range-test" className="group p-4 bg-zinc-900 border border-zinc-800 hover:border-primary-500/50 transition-all rounded block">
                <div className="flex items-center gap-2 text-white font-bold mb-1">
                    <Mic className="text-primary-500" size={18} /> Vocal Range Test
                </div>
                <p className="text-xs text-zinc-500 group-hover:text-zinc-400">Find out if you are a Tenor, Baritone, or Soprano.</p>
                <div className="mt-2 text-[10px] font-mono text-primary-500 flex items-center gap-1">START_TEST <ArrowRight size={10} /></div>
             </Link>
             <Link href="/test/perfect-pitch-test" className="group p-4 bg-zinc-900 border border-zinc-800 hover:border-primary-500/50 transition-all rounded block">
                <div className="flex items-center gap-2 text-white font-bold mb-1">
                    <Music className="text-emerald-500" size={18} /> Perfect Pitch Test
                </div>
                <p className="text-xs text-zinc-500 group-hover:text-zinc-400">Train your ear to identify musical notes.</p>
                <div className="mt-2 text-[10px] font-mono text-emerald-500 flex items-center gap-1">START_TEST <ArrowRight size={10} /></div>
             </Link>
          </div>
       </div>
      </div>
    </>
  );
}
