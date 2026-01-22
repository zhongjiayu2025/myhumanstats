
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Clock, Music, HeartPulse, Activity, Target, TrendingUp } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function BPMClient() {
  const [taps, setTaps] = useState<{time: number, bpm: number}[]>([]);
  const [bpm, setBpm] = useState(0);
  const [stability, setStability] = useState(0); // SD
  const [message, setMessage] = useState('Tap any key or click to start');
  const [isTapping, setIsTapping] = useState(false);
  
  // Trainer Mode
  const [targetBpm, setTargetBpm] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState(100);

  const handleTap = () => {
     const now = performance.now();
     setIsTapping(true);
     setTimeout(() => setIsTapping(false), 100);
     
     setTaps(prev => {
        // Reset if gap > 2.5s
        if (prev.length > 0 && now - prev[prev.length - 1].time > 2500) {
           return [{ time: now, bpm: 0 }]; 
        }
        
        // Calculate instant BPM for this tap
        let instantBpm = 0;
        if (prev.length > 0) {
            const delta = now - prev[prev.length - 1].time;
            instantBpm = Math.round(60000 / delta);
        }

        const newTaps = [...prev, { time: now, bpm: instantBpm }];
        return newTaps.slice(-30); // Keep last 30 points for graph
     });
  };

  useEffect(() => {
     if (taps.length > 1) {
        const intervals = [];
        for (let i = 1; i < taps.length; i++) {
           intervals.push(taps[i].time - taps[i-1].time);
        }
        
        const avgInterval = intervals.reduce((a,b) => a+b, 0) / intervals.length;
        const currentBpm = Math.round(60000 / avgInterval);
        
        // Calculate Stability (Standard Deviation)
        const variance = intervals.reduce((a, b) => a + Math.pow(b - avgInterval, 2), 0) / intervals.length;
        const stdDev = Math.sqrt(variance);
        
        setStability(stdDev);
        setBpm(currentBpm);
        
        // Trainer Logic
        if (targetBpm) {
            const error = Math.abs(currentBpm - targetBpm);
            const acc = Math.max(0, 100 - (error * 2)); // 2% penalty per BPM off
            setAccuracy(acc);
        }
        
        if (taps.length < 4) setMessage('Calculating...');
        else if (stdDev < 10) setMessage('Timing: Metronomic');
        else if (stdDev < 30) setMessage('Timing: Solid');
        else setMessage('Timing: Drifting');
        
     } else if (taps.length === 1) {
        setMessage('First beat registered...');
        setBpm(0);
        setStability(0);
        setAccuracy(100);
     }
  }, [taps, targetBpm]);

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

  const reset = (e?: React.MouseEvent) => {
     e?.stopPropagation();
     setTaps([]);
     setBpm(0);
     setStability(0);
     setMessage('Tap any key or click to start');
     setAccuracy(100);
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
                {/* Visual Metronome Pulse */}
                <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-100 ${isTapping ? 'opacity-40' : 'opacity-0'}`}>
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
                
                {/* Trainer Mode Display */}
                {targetBpm && taps.length > 1 && (
                    <div className="absolute top-6 left-6 flex flex-col items-start">
                        <div className="text-[10px] text-zinc-600 font-mono uppercase">Target: {targetBpm}</div>
                        <div className={`text-lg font-mono font-bold ${accuracy > 90 ? 'text-emerald-500' : 'text-yellow-500'}`}>
                            {Math.round(accuracy)}% ACC
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
             
             {/* Micro-Timing Graph */}
             {taps.length > 4 && (
                 <div className="mt-4 h-32 w-full bg-zinc-900/30 border border-zinc-800 rounded-xl p-4">
                     <div className="text-[10px] text-zinc-500 font-mono mb-2 flex items-center gap-2">
                         <TrendingUp size={12}/> TEMPO DRIFT ANALYSIS
                     </div>
                     <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={taps.slice(2)}> {/* Skip first couple erratic taps */}
                             <defs>
                                 <linearGradient id="colorBpm" x1="0" y1="0" x2="0" y2="1">
                                     <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                     <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                 </linearGradient>
                             </defs>
                             <YAxis domain={['dataMin - 10', 'dataMax + 10']} hide />
                             <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333', fontSize: '12px' }} />
                             {targetBpm && <ReferenceLine y={targetBpm} stroke="#ef4444" strokeDasharray="3 3" />}
                             <Area type="monotone" dataKey="bpm" stroke="#10b981" fillOpacity={1} fill="url(#colorBpm)" />
                         </AreaChart>
                     </ResponsiveContainer>
                 </div>
             )}
          </div>

          <div className="lg:col-span-4 space-y-4">
             {/* Trainer Settings */}
             <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-xl">
                 <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-sm">
                    <Target size={16} className="text-primary-500" /> Target Trainer
                 </h3>
                 <div className="flex gap-2 mb-4">
                     {[100, 120, 140].map(val => (
                         <button 
                            key={val}
                            onClick={() => { setTargetBpm(val); reset(); }}
                            className={`flex-1 py-2 text-xs font-mono border rounded ${targetBpm === val ? 'bg-primary-900/30 border-primary-500 text-primary-400' : 'bg-black border-zinc-700 text-zinc-400'}`}
                         >
                             {val}
                         </button>
                     ))}
                     <button onClick={() => setTargetBpm(null)} className={`flex-1 py-2 text-xs font-mono border rounded ${!targetBpm ? 'bg-zinc-800 border-zinc-600 text-white' : 'bg-black border-zinc-700 text-zinc-400'}`}>OFF</button>
                 </div>
                 <p className="text-[10px] text-zinc-500 leading-relaxed">
                     Select a target BPM to test your ability to maintain a specific tempo without drifting.
                 </p>
             </div>

             <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-xl h-full flex flex-col justify-center">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                   <Music size={18} className="text-emerald-500" /> Common Tempos
                </h3>
                <ul className="text-xs text-zinc-400 font-mono space-y-3">
                   <li className="flex justify-between border-b border-zinc-800 pb-2"><span>Dubstep</span> <span className="text-white">140 BPM</span></li>
                   <li className="flex justify-between border-b border-zinc-800 pb-2"><span>House</span> <span className="text-white">120 - 130 BPM</span></li>
                   <li className="flex justify-between border-b border-zinc-800 pb-2"><span>Hip Hop</span> <span className="text-white">80 - 100 BPM</span></li>
                   <li className="flex justify-between border-b border-zinc-800 pb-2"><span>Heart (Rest)</span> <span className="text-white">60 - 100 BPM</span></li>
                </ul>
             </div>
          </div>
       </div>
    </div>
  );
}
