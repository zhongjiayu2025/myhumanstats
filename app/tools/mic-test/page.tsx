
import React from 'react';
import { Metadata } from 'next';
import MicTestClient from '@/components/tools/MicTestClient';

export const metadata: Metadata = {
  title: "Online Microphone Test | Visualizer & Recorder",
  description: "Test your microphone online. Visualize audio input, check volume levels, and record a playback clip to ensure your mic is working.",
  keywords: ["mic test", "microphone test", "online voice recorder", "audio input test"]
};

export default function MicTestPage() {
  return <MicTestClient />;
}
