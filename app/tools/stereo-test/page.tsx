
import React from 'react';
import { Metadata } from 'next';
import StereoCheckClient from '@/components/tools/StereoCheckClient';

export const metadata: Metadata = {
  title: "Left Right Stereo Audio Test | Speaker Check",
  description: "Test your speakers or headphones for correct Left/Right channel wiring. Ensure your audio setup is balanced.",
  keywords: ["stereo test", "left right audio test", "speaker test", "headphone test"]
};

export default function StereoTestPage() {
  return <StereoCheckClient />;
}
