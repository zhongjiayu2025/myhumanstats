
"use client";

import React, { useState, useEffect } from 'react';
import { RotateCcw, Clock, Music, HeartPulse } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function BPMClient() {
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

       <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          
          <div className="lg:col-span-8">
             <div 
                onMouseDown={handleTap}
                className="bg-black border border-zinc-800 rounded-2xl aspect-square md:aspect-video flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500/50 hover:bg-zinc-900 transition-all active:scale-[0.99] select-none shadow-2xl relative overflow-hidden group"
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

          <div className="lg:col-span-4 space-y-4">
             <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-xl h-full flex flex-col justify-center">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                   <Music size={18} className="text-emerald-500" /> Common Tempos
                </h3>
                <ul className="text-xs text-zinc-400 font-mono space-y-3">
                   <li className="flex justify-between border-b border-zinc-800 pb-2">
                       <span>Dubstep / Trap</span> 
                       <span className="text-white">140 BPM</span>
                   </li>
                   <li className="flex justify-between border-b border-zinc-800 pb-2">
                       <span>House / Techno</span> 
                       <span className="text-white">120 - 130 BPM</span>
                   </li>
                   <li className="flex justify-between border-b border-zinc-800 pb-2">
                       <span>Hip Hop</span> 
                       <span className="text-white">80 - 100 BPM</span>
                   </li>
                   <li className="flex justify-between border-b border-zinc-800 pb-2">
                       <span>Resting Heart Rate</span> 
                       <span className="text-white">60 - 100 BPM</span>
                   </li>
                </ul>
             </div>
          </div>
       </div>

       {/* SEO Rich Content */}
       <article className="prose prose-invert max-w-none border-t border-zinc-800 pt-12">
           <h2 className="flex items-center gap-3 text-2xl font-bold text-white">
               <Clock className="text-emerald-500" />
               What is Beats Per Minute (BPM)?
           </h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               <div>
                   <p className="text-zinc-400 text-sm leading-relaxed">
                       <strong>Beats Per Minute (BPM)</strong> is a unit of measure used to express the tempo of music or the rate of a heartbeat. It simply counts how many beats occur in a sixty-second interval.
                   </p>
                   <h3 className="text-lg font-bold text-white mt-6 mb-2">How to Use This Tool</h3>
                   <ul className="list-disc pl-5 space-y-2 text-zinc-400 text-sm">
                       <li>Listen to the music or feel your pulse.</li>
                       <li>Tap the <strong>SPACEBAR</strong> or click the box in time with the beat.</li>
                       <li>Keep tapping for at least 5-10 seconds to get a stable average.</li>
                       <li>Use the <strong>RESET</strong> button to start over for a new song.</li>
                   </ul>
               </div>
               <div>
                   <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                       <HeartPulse className="text-red-500" size={20} />
                       Medical & Fitness Use
                   </h3>
                   <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                       While primarily a musical tool, a BPM counter can serve as a quick manual heart rate monitor. By tapping in sync with your pulse, you can estimate your heart rate without a smartwatch.
                   </p>
                   <div className="bg-zinc-900 p-4 rounded border border-zinc-800 text-xs text-zinc-500 font-mono">
                       <strong>Target Zones:</strong><br/>
                       Resting: 60-100 BPM<br/>
                       Fat Burn: 120-140 BPM<br/>
                       Cardio: 150-180 BPM
                   </div>
               </div>
           </div>
       </article>
    </div>
  );
}
