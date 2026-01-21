
import React from 'react';
import { Metadata } from 'next';
import ToneGenClient from '@/components/tools/ToneGenClient';

export const metadata: Metadata = {
  title: "Online Tone Generator | Frequency & Binaural Beats",
  description: "Free online sine wave generator. Create pure tones, frequency sweeps, and binaural beats for audio testing and meditation.",
  keywords: ["tone generator", "frequency sweep", "binaural beats", "audio test", "hz generator"]
};

export default function ToneGenPage() {
  return <ToneGenClient />;
}
