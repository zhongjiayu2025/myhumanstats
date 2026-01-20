import React, { useState, useRef, useEffect } from 'react';
import { Eye, Target, Crosshair, MousePointer2 } from 'lucide-react';
import { saveStat } from '../../lib/core';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

type Quadrant = 'TL' | 'TR' | 'BL' | 'BR';

interface QuadrantStats {
    hits: number;
    misses: number;
    avgRt: number;
}

const PeripheralVisionTest: React.FC = () => {
  const [phase, setPhase] = useState<'intro' | 'test' | 'result'>('intro');
  
  // Game State
  const [activeDot, setActiveDot] = useState<{id: number, x: number, y: number, quad: Quadrant, born: number} | null>(null);
  const [stats, setStats] = useState<Record<Quadrant, QuadrantStats>>({
      TL: {hits:0, misses:0, avgRt:0},
      TR: {hits:0, misses:0, avgRt:0},
      BL: {hits:0, misses:0, avgRt:0},
      BR: {hits:0, misses:0, avgRt:0},
  });
  
  const [flashFeedback, setFlashFeedback] = useState<'hit'|'miss'|null>(null);
  const [round, setRound] = useState(0);
  
  const TOTAL_ROUNDS = 20;
  const timeoutRef = useRef<number|null>(null);

  // Keyboard Listener
  useEffect(() => {
      const handleKey = (e: KeyboardEvent) => {
          if (phase === 'test' && e.code === 'Space') {
              e.preventDefault();
              handleInput();
          }
      };
      window.addEventListener('keydown', handleKey);
      return () => {
          window.removeEventListener('keydown', handleKey);
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
  }, [phase, activeDot]);

  const startGame = () => {
      setStats({
          TL: {hits:0, misses:0, avgRt:0},
          TR: {hits:0, misses:0, avgRt:0},
          BL: {hits:0, misses:0, avgRt:0},
          BR: {hits:0, misses:0, avgRt:0},
      });
      setRound(0);
      setPhase('test');
      scheduleNext();
  };

  const scheduleNext = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      // Random delay 1s - 3s
      const delay = 1000 + Math.random() * 2000;
      timeoutRef.current = window.setTimeout(spawnDot, delay);
  };

  const spawnDot = () => {
      if (round >= TOTAL_ROUNDS) {
          finish();
          return;
      }

      // 1. Pick Quadrant
      const quads: Quadrant[] = ['TL', 'TR', 'BL', 'BR'];
      const q = quads[Math.floor(Math.random() * 4)];
      
      // 2. Coords based on Quadrant (0-100%)
      // Center is 50, 50.
      // TL: x < 40, y < 40
      let x, y;
      const margin = 10; // edge margin
      const centerSafe = 15; // dist from center
      
      switch(q) {
          case 'TL': x = margin + Math.random() * (50 - centerSafe - margin); y = margin + Math.random() * (50 - centerSafe - margin); break;
          case 'TR': x = 50 + centerSafe + Math.random() * (50 - centerSafe - margin); y = margin + Math.random() * (50 - centerSafe - margin); break;
          case 'BL': x = margin + Math.random() * (50 - centerSafe - margin); y = 50 + centerSafe + Math.random() * (50 - centerSafe - margin); break;
          case 'BR': x = 50 + centerSafe + Math.random() * (50 - centerSafe - margin); y = 50 + centerSafe + Math.random() * (50 - centerSafe - margin); break;
      }

      const dot = {
          id: Date.now(),
          x, y,
          quad: q,
          born: performance.now()
      };
      
      setActiveDot(dot);
      
      // Auto-miss after 1.5s
      timeoutRef.current = window.setTimeout(() => {
          handleMiss(dot);
      }, 1500);
  };

  const handleInput = () => {
      if (!activeDot) return; // False alarm ignored for now (or penalize?)
      
      const rt = performance.now() - activeDot.born;
      
      // Record Hit
      setStats(prev => {
          const q = prev[activeDot.quad];
          const newHits = q.hits + 1;
          const newAvg = ((q.avgRt * q.hits) + rt) / newHits;
          return {
              ...prev,
              [activeDot.quad]: { ...q, hits: newHits, avgRt: newAvg }
          };
      });

      setFlashFeedback('hit');
      setTimeout(() => setFlashFeedback(null), 300);
      
      setActiveDot(null);
      setRound(r => r + 1);
      
      if (round + 1 >= TOTAL_ROUNDS) finish();
      else scheduleNext();
  };

  const handleMiss = (dot: typeof activeDot) => {
      if (!dot) return;
      
      setStats(prev => ({
          ...prev,
          [dot.quad]: { ...prev[dot.quad], misses: prev[dot.quad].misses + 1 }
      }));
      
      setFlashFeedback('miss');
      setTimeout(() => setFlashFeedback(null), 300);

      setActiveDot(null);
      setRound(r => r + 1);
      
      if (round + 1 >= TOTAL_ROUNDS) finish();
      else scheduleNext();
  };

  const finish = () => {
      setPhase('result');
      // Score = Accuracy
      const totalHits = (Object.values(stats) as QuadrantStats[]).reduce<number>((acc, curr) => acc + curr.hits, 0);
      const score = Math.round((totalHits / TOTAL_ROUNDS) * 100);
      saveStat('peripheral-vision', score);
  };

  // Helper for accuracy calculation
  const getAccuracy = (data: QuadrantStats) => {
      const total = data.hits + data.misses;
      return total === 0 ? 0 : (data.hits / total) * 100;
  };

  // Radar Data calculation: Accuracy % per quadrant
  const radarData = [
      { subject: 'Top-Left', A: getAccuracy(stats.TL), fullMark: 100 },
      { subject: 'Top-Right', A: getAccuracy(stats.TR), fullMark: 100 },
      { subject: 'Bottom-Right', A: getAccuracy(stats.BR), fullMark: 100 },
      { subject: 'Bottom-Left', A: getAccuracy(stats.BL), fullMark: 100 },
  ];

  // Calculate average latency explicitly to avoid type errors
  const averageLatency = Math.round(
      (Object.values(stats) as QuadrantStats[]).reduce<number>((acc, curr) => {
          return acc + (curr.hits > 0 ? curr.avgRt : 0);
      }, 0) / 4
  );

  return (
    <div className="max-w-4xl mx-auto text-center select-none">
       {phase === 'intro' && (
           <div className="py-12 animate-in fade-in zoom-in">
               <Eye size={64} className="mx-auto text-zinc-600 mb-6" />
               <h2 className="text-3xl font-bold text-white mb-2">Peripheral Vision Field Test</h2>
               <p className="text-zinc-400 mb-8 max-w-md mx-auto leading-relaxed">
                   Measure your visual field reactivity.
                   <br/><br/>
                   1. Stare at the <strong>Central Cross</strong>. Do not move your eyes.<br/>
                   2. Press <strong>SPACEBAR</strong> immediately when you see a white dot flash in your peripheral vision.
               </p>
               <button onClick={startGame} className="btn-primary">Start Examination</button>
           </div>
       )}

       {phase === 'test' && (
           <div className="relative w-full aspect-video bg-black border border-zinc-800 rounded-xl overflow-hidden cursor-none shadow-2xl">
               {/* Radar Grid UI */}
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.8)_100%)] z-10 pointer-events-none"></div>
               <div className="absolute inset-0 opacity-20 pointer-events-none">
                   <div className="absolute top-1/2 left-0 w-full h-px bg-primary-900"></div>
                   <div className="absolute top-0 left-1/2 w-px h-full bg-primary-900"></div>
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] h-[50%] border border-primary-900 rounded-full"></div>
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] border border-primary-900 rounded-full"></div>
               </div>

               {/* Fixation Point */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-20">
                   <Crosshair size={32} className={`text-primary-500 ${activeDot ? '' : 'opacity-50'}`} />
                   {flashFeedback === 'hit' && <div className="absolute text-emerald-500 font-bold text-xs mt-8">DETECTED</div>}
                   {flashFeedback === 'miss' && <div className="absolute text-red-500 font-bold text-xs mt-8">MISSED</div>}
               </div>
               
               {/* Target */}
               {activeDot && (
                   <div 
                      className="absolute w-3 h-3 bg-white rounded-full shadow-[0_0_15px_white] animate-pulse z-10"
                      style={{ top: `${activeDot.y}%`, left: `${activeDot.x}%` }}
                   ></div>
               )}

               {/* Scanline */}
               <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-500/5 to-transparent h-[10%] animate-scan pointer-events-none z-0"></div>

               <div className="absolute bottom-4 left-4 text-xs font-mono text-zinc-500 z-30">
                   TARGETS: {round}/{TOTAL_ROUNDS}
               </div>
               <div className="absolute bottom-4 right-4 text-xs font-mono text-zinc-500 z-30 flex items-center gap-2">
                   <MousePointer2 size={12} /> PRESS SPACE
               </div>
           </div>
       )}

       {phase === 'result' && (
           <div className="py-12 animate-in zoom-in">
               <h2 className="text-3xl font-bold text-white mb-8">Visual Field Map</h2>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                   <div className="h-64 w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                <PolarGrid stroke="#333" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#71717a', fontSize: 10 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name="Vision" dataKey="A" stroke="#06b6d4" strokeWidth={2} fill="#06b6d4" fillOpacity={0.3} />
                            </RadarChart>
                        </ResponsiveContainer>
                   </div>

                   <div className="text-left space-y-4">
                       <div className="bg-zinc-900 border border-zinc-800 p-4 rounded">
                           <h4 className="text-zinc-400 text-xs uppercase tracking-widest mb-2">Reaction Latency (Avg)</h4>
                           <div className="text-2xl font-mono text-white">
                               {averageLatency}ms
                           </div>
                       </div>
                       
                       <div className="bg-zinc-900 border border-zinc-800 p-4 rounded">
                           <h4 className="text-zinc-400 text-xs uppercase tracking-widest mb-2">Blind Spots</h4>
                           <div className="text-sm text-white">
                               {radarData.some(d => d.A < 50) 
                                 ? `Deficit detected in: ${radarData.filter(d => d.A < 50).map(d => d.subject).join(', ')}`
                                 : "No significant blind spots detected."
                               }
                           </div>
                       </div>
                   </div>
               </div>
               
               <div className="mt-12">
                   <button onClick={startGame} className="btn-secondary">
                       Retake Calibration
                   </button>
               </div>
           </div>
       )}
    </div>
  );
};

export default PeripheralVisionTest;