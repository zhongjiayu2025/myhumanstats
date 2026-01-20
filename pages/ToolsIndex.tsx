import React from 'react';
import { Link } from 'react-router-dom';
import { Settings, Music, Activity, ArrowRight, Wrench } from 'lucide-react';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';

const ToolsIndex: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto py-12 animate-in fade-in duration-500">
      <SEO 
        title="Audio & Visual Tools"
        description="Free online utilities for musicians, audio engineers, and researchers. Tone Generator, BPM Tapper, and more."
      />
      
      <Breadcrumbs items={[{ label: 'Tools' }]} />

      {/* Header */}
      <div className="mb-16 border-b border-zinc-800 pb-12">
        <div className="flex items-center gap-3 text-primary-500 mb-4">
           <Wrench size={32} />
           <span className="font-mono text-sm uppercase tracking-widest">Utility Belt</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 max-w-4xl tracking-tight">
           Digital <span className="text-primary-400">Utilities</span>
        </h1>
        <p className="text-xl text-zinc-400 max-w-2xl leading-relaxed">
           Essential browser-based tools for calibration, testing, and creative work. No installation required.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         
         {/* Tone Generator Card */}
         <Link to="/tools/tone-generator" className="group relative bg-black border border-zinc-800 p-8 rounded-2xl overflow-hidden hover:border-primary-500/50 transition-all duration-300">
            <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-100 transition-opacity text-primary-500 transform translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 duration-500">
               <Music size={64} />
            </div>
            
            <div className="relative z-10">
               <div className="w-12 h-12 bg-zinc-900 rounded-lg flex items-center justify-center mb-6 border border-zinc-800 group-hover:bg-primary-900/20 group-hover:text-primary-400 transition-colors">
                  <Settings size={24} />
               </div>
               
               <h3 className="text-2xl font-bold text-white mb-3">Online Tone Generator</h3>
               <p className="text-zinc-400 mb-6 leading-relaxed max-w-sm">
                  Generate pure sine, square, saw, or triangle waves from 1Hz to 22kHz. Ideal for tuning instruments or testing audio equipment.
               </p>
               
               <div className="flex items-center gap-2 text-primary-500 text-sm font-bold font-mono">
                  LAUNCH TOOL <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
               </div>
            </div>
         </Link>

         {/* BPM Counter Card */}
         <Link to="/tools/bpm-counter" className="group relative bg-black border border-zinc-800 p-8 rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-all duration-300">
            <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-100 transition-opacity text-emerald-500 transform translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 duration-500">
               <Activity size={64} />
            </div>
            
            <div className="relative z-10">
               <div className="w-12 h-12 bg-zinc-900 rounded-lg flex items-center justify-center mb-6 border border-zinc-800 group-hover:bg-emerald-900/20 group-hover:text-emerald-400 transition-colors">
                  <Activity size={24} />
               </div>
               
               <h3 className="text-2xl font-bold text-white mb-3">BPM Counter / Tapper</h3>
               <p className="text-zinc-400 mb-6 leading-relaxed max-w-sm">
                  Tap any rhythm to calculate Beats Per Minute (BPM) instantly. Used by DJs, producers, and musicians to find tempo.
               </p>
               
               <div className="flex items-center gap-2 text-emerald-500 text-sm font-bold font-mono">
                  LAUNCH TOOL <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
               </div>
            </div>
         </Link>

      </div>
    </div>
  );
};

export default ToolsIndex;