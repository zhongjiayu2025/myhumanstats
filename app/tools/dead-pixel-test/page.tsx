
import React from 'react';
import { Metadata } from 'next';
import DeadPixelClient from '@/components/tools/DeadPixelClient';

export const metadata: Metadata = {
  title: "Dead Pixel Test | Screen Quality Check",
  description: "Identify dead, stuck, or hot pixels on your monitor or phone screen. Fullscreen color cycle tool.",
  keywords: ["dead pixel test", "screen check", "monitor test", "stuck pixel fixer"]
};

export default function DeadPixelPage() {
  return <DeadPixelClient />;
}
