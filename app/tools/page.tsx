
import React from 'react';
import Link from 'next/link';
import { Music, Activity, ArrowRight, Wrench, Monitor, Headphones, Mic, Zap } from 'lucide-react';
import { Metadata } from 'next';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: "Tools & Utilities | MyHumanStats",
  description: "Free online utilities for hardware calibration and measurement. Hz Test, Mic Test, Tone Generator, and more."
};

const ToolsIndex = () => {
  const tools = [
     {
        id: 'refresh-rate',
        title: 'Hz Checker',
        desc: 'Check your screen Refresh Rate and Frame Time latency.',
        icon: Zap,
        color: 'text-yellow-500',
        path: '/tools/hz-test'
     },
     {
        id: 'mic-test',
        title: 'Mic Test',
        desc: 'Test and visualize your microphone input online.',
        icon: Mic,
        color: 'text-indigo-500',
        path: '/tools/mic-test'
     },
     {
        id: 'tone-generator',
        title: 'Tone Generator',
        desc: 'Generate pure sine waves from 1Hz to 22kHz. Audio system testing.',
        icon: Music,
        color: 'text-primary-500',
        path: '/tools/tone-generator'
     },
     {
        id: 'bpm-counter',
        title: 'BPM Counter',
        desc: 'Tap to measure tempo. Essential for musicians and DJs.',
        icon: Activity,
        color: 'text-emerald-500',
        path: '/tools/bpm-counter'
     },
     {
        id: 'dead-pixel',
        title: 'Dead Pixel Test',
        desc: 'Flash colors to find dead or stuck pixels on your screen.',
        icon: Monitor,
        color: 'text-rose-500',
        path: '/tools/dead-pixel-test'
     },
     {
        id: 'stereo-test',
        title: 'Stereo Check',
        desc: 'Test Left/Right audio channels and speaker polarity.',
        icon: Headphones,
        color: 'text-amber-500',
        path: '/tools/stereo-test'
     }
  ];

  // ItemList Schema
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": tools.map((tool, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": tool.title,
      "description": tool.desc,
      "url": `https://myhumanstats.org${tool.path}`
    }))
  };

  return (
    <div className="max-w-6xl mx-auto py-12 animate-in fade-in duration-500">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      
      <Breadcrumbs items={[{ label: 'Tools' }]} />

      {/* Header */}
      <div className="mb-16 border-b border-zinc-800 pb-12">
        <div className="flex items-center gap-3 text-primary-500 mb-4">
           <Wrench size={32} />
           <span className="font-mono text-sm uppercase tracking-widest">Utility Belt</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 max-w-4xl tracking-tight">
           Hardware <span className="text-primary-400">Calibration</span>
        </h1>
        <p className="text-xl text-zinc-400 max-w-2xl leading-relaxed">
           Essential browser-based tools to verify your audiovisual equipment before testing your own biology.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {tools.map(tool => {
            const Icon = tool.icon;
            return (
            <Link 
               key={tool.id}
               href={tool.path} 
               className="group relative bg-black border border-zinc-800 p-8 rounded-2xl overflow-hidden hover:border-zinc-600 transition-all duration-300"
            >
               <div className={`absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-100 transition-opacity ${tool.color} transform translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 duration-500`}>
                  <Icon size={64} />
               </div>
               
               <div className="relative z-10">
                  <div className={`w-12 h-12 bg-zinc-900 rounded-lg flex items-center justify-center mb-6 border border-zinc-800 group-hover:bg-white/5 transition-colors ${tool.color}`}>
                     <Icon size={24} />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-3">{tool.title}</h3>
                  <p className="text-zinc-400 mb-6 leading-relaxed max-w-sm text-sm">
                     {tool.desc}
                  </p>
                  
                  <div className={`flex items-center gap-2 text-sm font-bold font-mono ${tool.color}`}>
                     LAUNCH UTILITY <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
               </div>
            </Link>
         )})}
      </div>
    </div>
  );
};

export default ToolsIndex;
