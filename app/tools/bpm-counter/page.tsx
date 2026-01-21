
"use client";

import React, { useState, useEffect } from 'react';
import { RotateCcw, Clock, Music } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function BPMPage() {
  const [taps, setTaps] = useState<number[]>([]);
  const [bpm, setBpm] = useState(0);
  const [message, setMessage] = useState('Tap any key or click to start');
  
  const handleTap = () => {
     const now = performance.now();
     
     setTaps(prev => {
        if (prev.length > 0 && now - prev[prev.length - 1] > 2500) {
           return [now];
        }
        const newTaps = [...prev, now].slice(-10);
        return newTaps;
     });
  };

  useEffect(() => {
     if (taps.length > 1) {
        let intervals = [];
        for (let i = 1; i < taps.length; i++) {
           intervals.push(taps[i] - taps[i-1]);
        }
        const avgInterval = intervals.reduce((a,b) => a+b, 0) / intervals.length;
        const calculatedBpm = Math.round(60000 / avgInterval);
        setBpm(calculatedBpm);
        setMessage('Keep tapping to improve accuracy');
     } else if (taps.length === 1) {
        setMessage('First beat registered...');
     }
  }, [taps]);

  useEffect(() => {
     const handleKey = (e: KeyboardEvent) => {
        if (e.code === 'Space' || e.key === 'Enter') {
           e.preventDefault(); 
           handleTap();
        }
     };
     window.addEventListener('keydown', handleKey);
     return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const reset = (e: React.MouseEvent) => {
     e.stopPropagation();
     setTaps([]);
     setBpm(0);
     setMessage('Tap any key or click to start');
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 animate-in fade-in">
       <Breadcrumbs items={[{ label: 'Tools', path: '/tools' }, { label: 'BPM Counter' }]} />

       <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-7">
             <div 
                onMouseDown={handleTap}
                className="bg-black border border-zinc-800 rounded-2xl aspect-square md:aspect-[4/3] flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500/50 hover:bg-zinc-900 transition-all active:scale-[0.99] select-none shadow-2xl relative overflow-hidden group"
             >
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-active:opacity-20 transition-opacity">
                   <div className="w-64 h-64 bg-emerald-500 rounded-full filter blur-3xl"></div>
                </div>

                <div className="relative z-10 text-center">
                   <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-4">{message}</div>
                   <div className="text-9xl font-bold text-white font-mono tracking-tighter mb-4 text-glow">
                      {bpm || '--'}
                   </div>
                   <div className="text-xl text-emerald-500 font-bold uppercase tracking-widest">BPM</div>
                </div>

                {taps.length > 0 && (
                   <button 
                      onClick={reset}
                      className="absolute bottom-6 px-4 py-2 bg-zinc-800 rounded-full text-xs font-mono text-zinc-400 hover:text-white hover:bg-zinc-700 flex items-center gap-2"
                   >
                      <RotateCcw size={12} /> RESET
                   </button>
                )}
             </div>
          </div>

          <div className="lg:col-span-5 space-y-8">
             <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-xl">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                   <Clock size={20} className="text-emerald-500" /> What is BPM?
                </h2>
                <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                   <strong>Beats Per Minute (BPM)</strong> measures the tempo of a piece of music. It is the heartbeat of a song.
                </p>
                <h3 className="text-sm font-bold text-white mb-2">Common Tempos:</h3>
                <ul className="text-xs text-zinc-500 font-mono space-y-2">
                   <li className="flex justify-between border-b border-zinc-800 pb-1"><span>Hip Hop / R&B</span> <span>60 - 100 BPM</span></li>
                   <li className="flex justify-between border-b border-zinc-800 pb-1"><span>Pop / House</span> <span>110 - 128 BPM</span></li>
                   <li className="flex justify-between border-b border-zinc-800 pb-1"><span>Techno / Trance</span> <span>130 - 150 BPM</span></li>
                   <li className="flex justify-between border-b border-zinc-800 pb-1"><span>Drum & Bass</span> <span>160 - 180 BPM</span></li>
                </ul>
             </div>
          </div>

       </div>
    </div>
  );
}
