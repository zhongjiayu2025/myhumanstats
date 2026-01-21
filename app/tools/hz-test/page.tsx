
import React from 'react';
import { Metadata } from 'next';
import HzCheckClient from '@/components/tools/HzCheckClient';

export const metadata: Metadata = {
  title: "Screen Refresh Rate Test | Hz Checker",
  description: "Check your monitor's real refresh rate (Hz) and frame time latency. Visualize motion smoothness and motion blur.",
  keywords: ["hz test", "refresh rate", "monitor test", "fps counter", "screen check"]
};

export default function RefreshRatePage() {
  return <HzCheckClient />;
}
