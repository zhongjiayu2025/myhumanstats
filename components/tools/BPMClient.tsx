
"use client";

import React, { useState, useEffect } from 'react';
import { RotateCcw, Clock, Music, HeartPulse, Activity } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function BPMClient() {
  const [taps, setTaps] = useState<number[]>([]);
  const [bpm, setBpm] = useState(0);
  const [stability, setStability] = useState(0); // Standard Deviation in ms
  const [message, setMessage] = useState('Tap any key or click to start');
  const [isTapping, setIsTapping] = useState(false);
  
  const handleTap = () => {
     const now = performance.now();
     setIsTapping(true);
     setTimeout(() => setIsTapping(false), 100);
     
     setTaps(prev => {
        if (prev.length > 0 && now - prev[prev.length - 1] > 2500) {
           return [now]; // Reset if gap > 2.5s
        }
        const newTaps = [...prev, now].slice(-16); // Keep last 16 taps for rolling avg
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
        
        // Calculate Standard Deviation (Stability)
        const variance = intervals.reduce((a, b) => a + Math.pow(b - avgInterval, 2), 0) / intervals.length;
        const stdDev = Math.sqrt(variance);
        
        setStability(stdDev);
        setBpm(Math.round(60000 / avgInterval));
        
        if (taps.length < 4) setMessage('Calculating...');
        else if (stdDev < 10) setMessage('Timing: Metronomic');
        else if (stdDev < 30) setMessage('Timing: Solid');
        else setMessage('Timing: Drifting');
        
     } else if (taps.length === 1) {
        setMessage('First beat registered...');
        setBpm(0);
        setStability(0);
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
     setStability(0);
     setMessage('Tap any key or click to start');
  };

  const getStabilityColor = (sd: number) => {
      if (taps.length < 4) return 'text-zinc-500';
      if (sd < 15) return 'text-emerald-500';
      if (sd < 40) return 'text-yellow-500';
      return 'text-red-500';
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
                {/* Ripple Effect Center */}
                <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isTapping ? 'opacity-30' : 'opacity-0'}`}>
                   <div className="w-64 h-64 bg-emerald-500 rounded-full filter blur-3xl animate-ping"></div>
                </div>

                <div className="relative z-10 text-center">
                   <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-4">{message}</div>
                   <div className="text-9xl font-bold text-white font-mono tracking-tighter mb-4 text-glow tabular-nums">
                      {bpm || '--'}
                   </div>
                   <div className="text-xl text-emerald-500 font-bold uppercase tracking-widest">BPM</div>
                </div>
                
                {/* Stats Bar */}
                {taps.length > 1 && (
                    <div className="absolute top-6 right-6 flex flex-col items-end">
                        <div className="text-[10px] text-zinc-600 font-mono uppercase">Jitter (SD)</div>
                        <div className={`text-lg font-mono font-bold ${getStabilityColor(stability)}`}>
                            ±{stability.toFixed(1)}ms
                        </div>
                    </div>
                )}

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
                
                <div className="mt-6 pt-6 border-t border-zinc-800">
                    <h3 className="text-white font-bold mb-2 flex items-center gap-2 text-sm">
                       <Activity size={16} className="text-emerald-500" /> Stability Stat
                    </h3>
                    <p className="text-[10px] text-zinc-500 leading-relaxed">
                        The <strong>Jitter</strong> value measures how consistent your taps are. Lower is better. Professional drummers typically score below ±15ms.
                    </p>
                </div>
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
