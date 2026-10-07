
import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Ear, Activity } from 'lucide-react';
import ToneGenClient from '@/components/tools/ToneGenClient';

export const metadata: Metadata = {
  alternates: { canonical: '/tools/tone-generator/' },
  title: "Online Tone Generator | Frequency & Binaural Beats",
  description: "Free online sine wave generator. Create pure tones, frequency sweeps, and binaural beats for audio testing and meditation.",
  keywords: ["tone generator", "frequency sweep", "binaural beats", "audio test", "hz generator"]
};

export default function ToneGenPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Online Tone Generator",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "Any",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    "description": "Generate pure sine waves, frequency sweeps, and binaural beats in your browser."
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <header className="max-w-4xl mx-auto px-4 pt-6 pb-3">
        <h1 className="text-3xl sm:text-4xl font-bold text-white">Online Tone Generator</h1>
        <p className="text-sm text-zinc-400 mt-3">Generate tones on your device at a low, comfortable volume. Browser speakers and headphones are not clinically calibrated.</p>
      </header>
      <ToneGenClient />
      
      <div className="max-w-4xl mx-auto px-4 pb-20">
        <div className="prose prose-invert prose-sm text-zinc-400 mb-12">
          <h2 className="text-white text-2xl font-bold">About the Online Tone Generator</h2>
          <p>
            This browser-based tool generates pure sine waves using the Web Audio API. It is designed for audiophiles, sound engineers, and scientists who need a quick reference signal without installing software.
          </p>
          
          <h3 className="text-white text-lg font-bold">Features</h3>
          <ul>
            <li><strong>Frequency Sweep:</strong> Explore how your speakers or headphones reproduce selected pitches; playback is not a certified hardware test.</li>
            <li><strong>Binaural Beats:</strong> Listen to slightly different frequencies in the left and right channels using stereo headphones; no therapeutic effect is established by this tool.</li>
            <li><strong>Waveforms:</strong> Switch between Sine, Square, Sawtooth, and Triangle waves.</li>
          </ul>

          <h3 className="text-white text-lg font-bold">How to Use</h3>
          <p>
            Simply adjust the slider or type a specific Hz value. For hearing tests, start at a low volume. To use the <strong>Binaural Mode</strong>, headphones are required as the effect relies on stereo separation.
          </p>
        </div>

        {/* Related Benchmarks - Point 1 Optimization */}
        <div className="border-t border-zinc-800 pt-8">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Related Benchmarks</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/test/hearing-age-test" className="group p-4 bg-zinc-900 border border-zinc-800 hover:border-primary-500/50 transition-all rounded block">
                    <div className="flex items-center gap-2 text-white font-bold mb-1">
                        <Ear className="text-primary-500" size={18} /> Hearing Age Test
                    </div>
                    <p className="text-xs text-zinc-500 group-hover:text-zinc-400">Can you hear high frequencies like this generator produces?</p>
                    <div className="mt-2 text-[10px] font-mono text-primary-500 flex items-center gap-1">START_TEST <ArrowRight size={10} /></div>
                </Link>
                <Link href="/test/tone-deaf-test" className="group p-4 bg-zinc-900 border border-zinc-800 hover:border-primary-500/50 transition-all rounded block">
                    <div className="flex items-center gap-2 text-white font-bold mb-1">
                        <Activity className="text-emerald-500" size={18} /> Tone Deaf Test
                    </div>
                    <p className="text-xs text-zinc-500 group-hover:text-zinc-400">Test your ability to distinguish between different pitches.</p>
                    <div className="mt-2 text-[10px] font-mono text-emerald-500 flex items-center gap-1">START_TEST <ArrowRight size={10} /></div>
                </Link>
            </div>
        </div>
      </div>
    </>
  );
}
