
import React from 'react';
import { Metadata } from 'next';
import BPMClient from '@/components/tools/BPMClient';

export const metadata: Metadata = {
  title: "Tap BPM Counter | Online Tempo Tool",
  description: "Tap any key to count beats per minute (BPM). Free online tempo tapper for musicians, DJs, and producers.",
  keywords: ["bpm counter", "tap bpm", "tempo tapper", "beats per minute", "music tool"]
};

export default function BPMPage() {
  return (
    <>
      <BPMClient />
      
      {/* Point 2: Rich Text for Tools */}
      <div className="max-w-4xl mx-auto px-4 pb-20 prose prose-invert prose-sm text-zinc-400">
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
    </>
  );
}
