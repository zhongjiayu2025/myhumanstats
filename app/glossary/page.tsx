
import React from 'react';
import Link from 'next/link';
import { Book, Search, ExternalLink } from 'lucide-react';
import { Metadata } from 'next';
import { TESTS } from '@/lib/core';
import GlossaryClient from './GlossaryClient'; // We'll separate the search logic

export const metadata: Metadata = {
  title: "Codex | Human Performance Glossary",
  description: "A comprehensive dictionary of terms related to auditory, visual, and cognitive science. Definitions for Hertz, JND, Stroop Effect, and more."
};

export default function GlossaryPage() {
  return <GlossaryClient tests={TESTS} />;
}
