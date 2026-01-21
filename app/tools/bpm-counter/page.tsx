
import React from 'react';
import { Metadata } from 'next';
import BPMClient from '@/components/tools/BPMClient';

export const metadata: Metadata = {
  title: "Tap BPM Counter | Online Tempo Tool",
  description: "Tap any key to count beats per minute (BPM). Free online tempo tapper for musicians, DJs, and producers.",
  keywords: ["bpm counter", "tap bpm", "tempo tapper", "beats per minute", "music tool"]
};

export default function BPMPage() {
  return <BPMClient />;
}
