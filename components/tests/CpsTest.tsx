import React, { useState, useEffect, useRef } from 'react';
import { MousePointer, Timer, RotateCcw, Zap } from 'lucide-react';
import { saveStat } from '../../lib/core';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';

interface Particle {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
}

const CPS_RANKS = [
    { threshold: 0, title: "Turtle", color: "text-zinc-500" },
    { threshold: 5, title: "Rabbit", color: "text-emerald-500" },
    { threshold: 8, title: "Cheetah", color: "text-blue-500" },
    { threshold: 10, title: "Falcon", color: "text-purple-500" },
    { threshold: 12, title: "Lightning", color: "text-yellow-500" },
    { threshold: 14, title: "Machine", color: "text-red-500" },
];

const CpsTest: React.FC = () => {
  const [active, setActive] = useState(false);
  const [finished, setFinished] = useState(false);
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  
  // Analytics
  const [history, setHistory] = useState<{time: number, rate: number}[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [stability, setStability] = useState(0);

  const timerRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const animRef = useRef<number | null>(null);
  const clickTimestampsRef = useRef<number[]>([]);
  const startTimeRef = useRef<number>(0);

  // Particle Loop
  useEffect(() => {
      const loop = () => {
          setParticles(prev => prev.map(p => ({
              ...p,
              x: p.x + p.vx,
              y: p.y + p.vy,
              vy: p.vy + 0.5 // Gravity
          })).filter(p => p.y < 500)); // Cull
          
          animRef.current = requestAnimationFrame(loop);
      };
      animRef.current = requestAnimationFrame(loop);
      return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  useEffect(() => {
    if (active && timeLeft > 0) {
       timerRef.current = window.setTimeout(() => setTimeLeft(t => t - 1), 1000);
    } else if (active && timeLeft === 0) {
       finish();
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [active, timeLeft]);

  // Live Chart Updater
  useEffect(() => {
      if (active) {
          intervalRef.current = window.setInterval(() => {
              const now = performance.now();
              const elapsed = (now - startTimeRef.current) / 1000;
              const recentClicks = clickTimestampsRef.current.filter(t => now - t < 500).length;
              const instantCps = recentClicks * 2;
              setHistory(prev => [...prev, { time: elapsed, rate: instantCps }]);
          }, 200);
      }
      return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [active]);

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
     if (finished) return;
     
     // Coords relative to container
     let clientX, clientY;
     if ('touches' in e) {
         clientX = e.touches[0].clientX;
         clientY = e.touches[0].clientY;
     } else {
         clientX = (e as React.MouseEvent).clientX;
         clientY = (e as React.MouseEvent).clientY;
     }
     const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
     const x = clientX - rect.left;
     const y = clientY - rect.top;

     // Spawn Particles
     const newParticles = Array.from({length: 5}).map(() => ({
         id: Math.random(),
         x,
         y,
         vx: (Math.random() - 0.5) * 10,
         vy: (Math.random() - 1) * 10,
         color: Math.random() > 0.5 ? '#06b6d4' : '#ffffff'
     }));
     setParticles(prev => [...prev, ...newParticles]);

     if (!active) {
        setActive(true);
        startTimeRef.current = performance.now();
        setHistory([{ time: 0, rate: 0 }]);
     }
     
     setClicks(c => c + 1);
     clickTimestampsRef.current.push(performance.now());
  };

  const finish = () => {
     setActive(false);
     setFinished(true);
     
     const totalTime = 10;
     const cps = clicks / totalTime;
     
     // Stability Calc
     const intervals = [];
     for(let i=1; i<clickTimestampsRef.current.length; i++) {
         intervals.push(clickTimestampsRef.current[i] - clickTimestampsRef.current[i-1]);
     }
     if (intervals.length > 0) {
         const mean = intervals.reduce((a,b)=>a+b,0) / intervals.length;
         const variance = intervals.reduce((a,b)=>a+Math.pow(b-mean, 2), 0) / intervals.length;
         setStability(Math.sqrt(variance));
     }

     const score = Math.min(100, Math.round((cps / 12) * 100)); 
     saveStat('cps-test', score);
  };

  const reset = () => {
     setActive(false);
     setFinished(false);
     setClicks(0);
     setTimeLeft(10);
     setHistory([]);
     setParticles([]);
     setStability(0);
     clickTimestampsRef.current = [];
  };

  const currentCPS = active ? (clicks / (10 - timeLeft + 0.001)).toFixed(1) : (clicks / 10).toFixed(1);
  const rank = CPS_RANKS.slice().reverse().find(r => (clicks/10) >= r.threshold) || CPS_RANKS[0];

  return (
    <div className="max-w-xl mx-auto select-none">
       {/* HUD */}
       <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="tech-border bg-surface p-4 flex items-center justify-between">
             <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Time</span>
             <div className="text-xl font-mono text-white flex items-center gap-2">
                <Timer size={16} /> {timeLeft}s
             </div>
          </div>
          <div className="tech-border bg-surface p-4 flex items-center justify-between">
             <span className="text-[10px] text-zinc-500 uppercase tracking-widest">CPS (Avg)</span>
             <div className="text-xl font-mono text-primary-400">
                {currentCPS}
             </div>
          </div>
       </div>

       {/* Click Area */}
       {!finished ? (
           <div 
              onMouseDown={handleInteraction}
              onTouchStart={handleInteraction}
              className={`
                 w-full h-64 tech-border bg-black relative overflow-hidden group transition-all duration-50 active:scale-[0.99] cursor-crosshair
                 ${active ? 'border-primary-500 shadow-[0_0_30px_rgba(34,211,238,0.1)]' : 'border-zinc-700 hover:bg-zinc-900'}
              `}
              // Shake effect proportional to CPS
              style={{
                  transform: active ? `translate(${Math.random() * Number(currentCPS) * 0.2}px, ${Math.random() * Number(currentCPS) * 0.2}px)` : 'none'
              }}
           >
              {/* Particles */}
              {particles.map(p => (
                  <div 
                    key={p.id}
                    className="absolute w-1 h-1 rounded-full pointer-events-none"
                    style={{ 
                        left: p.x, 
                        top: p.y, 
                        backgroundColor: p.color,
                        opacity: 1 - (p.y / 300) // Fade out as they fall
                    }}
                  />
              ))}

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 {!active && (
                    <div className="text-center">
                       <MousePointer size={48} className="mx-auto text-zinc-600 mb-2 group-hover:text-white transition-colors" />
                       <div className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Click / Tap to Start</div>
                    </div>
                 )}
                 
                 {active && (
                    <div className="text-8xl font-black text-white/5 select-none">
                       {clicks}
                    </div>
                 )}
              </div>
              
              {/* Progress Line */}
              <div className="absolute bottom-0 left-0 w-full bg-primary-500/20 h-1">
                 <div className="h-full bg-primary-500 transition-all duration-100 ease-linear" style={{ width: `${((10 - timeLeft) / 10) * 100}%` }}></div>
              </div>
           </div>
       ) : (
           // Result View
           <div className="animate-in zoom-in">
               <div className="bg-black border border-zinc-800 rounded-xl p-6 mb-6 text-center">
                   <Zap size={64} className={`mx-auto mb-4 ${rank.color}`} />
                   
                   <div className="text-xs text-zinc-500 uppercase font-mono mb-2">Final Score</div>
                   <div className="text-6xl font-bold text-white mb-2">{clicks / 10} <span className="text-2xl text-zinc-600">CPS</span></div>
                   
                   <div className={`text-xl font-bold uppercase tracking-widest mb-6 ${rank.color}`}>
                       Rank: {rank.title}
                   </div>

                   <div className="grid grid-cols-2 gap-4 mb-6">
                       <div className="bg-zinc-900 border border-zinc-800 p-3 rounded">
                           <div className="text-[10px] text-zinc-500">Total Clicks</div>
                           <div className="text-white font-mono">{clicks}</div>
                       </div>
                       <div className="bg-zinc-900 border border-zinc-800 p-3 rounded">
                           <div className="text-[10px] text-zinc-500">Jitter (Stability)</div>
                           <div className="text-white font-mono">{stability.toFixed(1)}ms</div>
                       </div>
                   </div>

                   {/* Graph */}
                   <div className="h-32 w-full bg-zinc-900/50 rounded border border-zinc-800 relative">
                       <div className="absolute top-2 left-2 text-[9px] text-zinc-600 uppercase font-mono">Burst Rate Analysis</div>
                       <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={history}>
                               <defs>
                                   <linearGradient id="cpsGrad" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                                       <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                                   </linearGradient>
                               </defs>
                               <YAxis hide domain={[0, 'auto']} />
                               <Area type="monotone" dataKey="rate" stroke="#06b6d4" fill="url(#cpsGrad)" strokeWidth={2} />
                           </AreaChart>
                       </ResponsiveContainer>
                   </div>
               </div>
               
               <button onClick={reset} className="btn-secondary w-full flex items-center justify-center gap-2">
                   <RotateCcw size={16} /> Try Again
               </button>
           </div>
       )}
    </div>
  );
};

export default CpsTest;