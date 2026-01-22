
import React from 'react';
import { Metadata } from 'next';
import ToneGenClient from '@/components/tools/ToneGenClient';

export const metadata: Metadata = {
  title: "Online Tone Generator | Frequency & Binaural Beats",
  description: "Free online sine wave generator. Create pure tones, frequency sweeps, and binaural beats for audio testing and meditation.",
  keywords: ["tone generator", "frequency sweep", "binaural beats", "audio test", "hz generator"]
};

export default function ToneGenPage() {
  return (
    <>
      <ToneGenClient />
      
      {/* Point 2: Rich Text for Tools */}
      <div className="max-w-4xl mx-auto px-4 pb-20 prose prose-invert prose-sm text-zinc-400">
        <h2 className="text-white text-2xl font-bold">About the Online Tone Generator</h2>
        <p>
          This browser-based tool generates pure sine waves using the Web Audio API. It is designed for audiophiles, sound engineers, and scientists who need a quick reference signal without installing software.
        </p>
        
        <h3 className="text-white text-lg font-bold">Features</h3>
        <ul>
          <li><strong>Frequency Sweep:</strong> Test the range of your speakers or headphones (20Hz - 20kHz).</li>
          <li><strong>Binaural Beats:</strong> Create differing frequencies in left/right channels to induce brainwave states.</li>
          <li><strong>Waveforms:</strong> Switch between Sine, Square, Sawtooth, and Triangle waves.</li>
        </ul>

        <h3 className="text-white text-lg font-bold">How to Use</h3>
        <p>
          Simply adjust the slider or type a specific Hz value. For hearing tests, start at a low volume. To use the <strong>Binaural Mode</strong>, headphones are required as the effect relies on stereo separation.
        </p>
      </div>
    </>
  );
}
