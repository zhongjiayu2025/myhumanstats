import React, { useState, useRef, useEffect } from 'react';
import { Eye, RefreshCcw } from 'lucide-react';
import { saveStat } from '../../lib/core';

// 4x3 Grid roughly maps to 16:9 aspect ratio
const ROWS = 3;
const COLS = 4;

interface ZoneStats {
    hits: number;
    misses: number;
    avgRt: number;
}

const PeripheralVisionTest: React.FC = () => {
  const [phase, setPhase] = useState<'intro' | 'test' | 'result'>('intro');
  
  // Game State
  const [activeDot, setActiveDot] = useState<{id: number, r: number, c: number, x: number, y: number, born: number} | null>(null);
  
  // 12 Zones (0-11)
  const [zoneStats, setZoneStats] = useState<Record<number, ZoneStats>>({});
  
  const [flashFeedback, setFlashFeedback] = useState<'hit'|'miss'|null>(null);
  const [round, setRound] = useState(0);
  
  // Foveal Distraction
  const [centralChar, setCentralChar] = useState('');
  
  const TOTAL_ROUNDS = 24; 
  const timeoutRef = useRef<number|null>(null);
  const charTimeoutRef = useRef<number|null>(null);

  // Initialize Stats
  useEffect(() => {
      const initial: Record<number, ZoneStats> = {};
      for(let i=0; i<ROWS*COLS; i++) initial[i] = {hits:0, misses:0, avgRt:0};
      setZoneStats(initial);
  }, []);

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
          if (charTimeoutRef.current) clearTimeout(charTimeoutRef.current);
      };
  }, [phase, activeDot]);

  // Central Character Loop (Variable Interval for better fixation load)
  useEffect(() => {
      const loop = () => {
          const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
          setCentralChar(chars[Math.floor(Math.random() * chars.length)]);
          // Random interval between 800ms and 2000ms to prevent rhythm prediction
          const delay = 800 + Math.random() * 1200; 
          charTimeoutRef.current = window.setTimeout(loop, delay);
      };

      if (phase === 'test') {
          loop();
      } else {
          if (charTimeoutRef.current) clearTimeout(charTimeoutRef.current);
      }
      return () => { if (charTimeoutRef.current) clearTimeout(charTimeoutRef.current); };
  }, [phase]);

  const startGame = () => {
      const initial: Record<number, ZoneStats> = {};
      for(let i=0; i<ROWS*COLS; i++) initial[i] = {hits:0, misses:0, avgRt:0};
      setZoneStats(initial);
      
      setRound(0);
      setPhase('test');
      scheduleNext();
  };

  const scheduleNext = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      const delay = 800 + Math.random() * 1500;
      timeoutRef.current = window.setTimeout(spawnDot, delay);
  };

  const spawnDot = () => {
      if (round >= TOTAL_ROUNDS) {
          finish();
          return;
      }

      // Pick random zone
      const r = Math.floor(Math.random() * ROWS);
      const c = Math.floor(Math.random() * COLS);
      
      const w = 100/COLS;
      const h = 100/ROWS;
      
      const padding = 5;
      const x = (c * w) + padding + Math.random() * (w - padding*2);
      const y = (r * h) + padding + Math.random() * (h - padding*2);

      const dot = {
          id: Date.now(),
          r, c, x, y,
          born: performance.now()
      };
      
      setActiveDot(dot);
      
      timeoutRef.current = window.setTimeout(() => {
          handleMiss(dot);
      }, 1200);
  };

  const handleInput = () => {
      if (!activeDot) return; 
      
      const rt = performance.now() - activeDot.born;
      const zoneIdx = activeDot.r * COLS + activeDot.c;
      
      setZoneStats(prev => {
          const z = prev[zoneIdx];
          const newHits = z.hits + 1;
          const newAvg = ((z.avgRt * z.hits) + rt) / newHits;
          return {
              ...prev,
              [zoneIdx]: { ...z, hits: newHits, avgRt: newAvg }
          };
      });

      setFlashFeedback('hit');
      setTimeout(() => setFlashFeedback(null), 200);
      
      setActiveDot(null);
      setRound(r => r + 1);
      
      if (round + 1 >= TOTAL_ROUNDS) finish();
      else scheduleNext();
  };

  const handleMiss = (dot: typeof activeDot) => {
      if (!dot) return;
      
      const zoneIdx = dot.r * COLS + dot.c;
      setZoneStats(prev => ({
          ...prev,
          [zoneIdx]: { ...prev[zoneIdx], misses: prev[zoneIdx].misses + 1 }
      }));
      
      setFlashFeedback('miss');
      setTimeout(() => setFlashFeedback(null), 200);

      setActiveDot(null);
      setRound(r => r + 1);
      
      if (round + 1 >= TOTAL_ROUNDS) finish();
      else scheduleNext();
  };

  const finish = () => {
      setPhase('result');
      // Explicitly cast Object.values to avoid TS errors about unknown types
      const totalHits = (Object.values(zoneStats) as ZoneStats[]).reduce((acc, curr) => acc + curr.hits, 0);
      const score = Math.round((totalHits / TOTAL_ROUNDS) * 100);
      saveStat('peripheral-vision', score);
  };

  const getZoneColor = (stats: ZoneStats) => {
      const total = stats.hits + stats.misses;
      if (total === 0) return 'bg-zinc-900'; 
      
      const accuracy = stats.hits / total;
      if (accuracy === 1) {
          if (stats.avgRt < 400) return 'bg-emerald-500';
          if (stats.avgRt < 600) return 'bg-emerald-600';
          return 'bg-emerald-700';
      }
      if (accuracy >= 0.5) return 'bg-yellow-600';
      return 'bg-red-900';
  };

  return (
    <div className="max-w-4xl mx-auto text-center select-none touch-none">
       {phase === 'intro' && (
           <div className="py-12 animate-in fade-in zoom-in">
               <Eye size={64} className="mx-auto text-zinc-600 mb-6" />
               <h2 className="text-3xl font-bold text-white mb-2">Peripheral Vision Field Test</h2>
               <p className="text-zinc-400 mb-8 max-w-md mx-auto leading-relaxed">
                   Measure your visual field reactivity.
                   <br/><br/>
                   1. Keep your eyes locked on the <strong>changing letter</strong> in the center.<br/>
                   2. Press <strong>SPACEBAR</strong> or <strong>TAP</strong> when a white dot flashes in your side vision.
               </p>
               <button onClick={startGame} className="btn-primary">Start Examination</button>
           </div>
       )}

       {phase === 'test' && (
           <div 
              className="relative w-full aspect-video bg-black border border-zinc-800 rounded-xl overflow-hidden cursor-none shadow-2xl active:border-primary-500/50"
              onTouchStart={(e) => { e.preventDefault(); handleInput(); }}
              onMouseDown={() => { if(window.innerWidth > 768) handleInput(); }}
           >
               <div className="absolute inset-0 z-0 pointer-events-none opacity-10">
                   <div className="w-full h-full grid grid-cols-4 grid-rows-3">
                       {Array.from({length: 12}).map((_, i) => (
                           <div key={i} className="border border-zinc-500"></div>
                       ))}
                   </div>
               </div>

               {/* Fixation Point - Dynamic */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-30">
                   <div className="w-12 h-12 bg-zinc-900/80 border border-zinc-700 rounded flex items-center justify-center">
                       <span className="text-xl font-mono font-bold text-primary-500 animate-pulse">{centralChar}</span>
                   </div>
                   {flashFeedback === 'hit' && <div className="absolute top-full mt-2 text-emerald-500 font-bold text-xs">HIT</div>}
                   {flashFeedback === 'miss' && <div className="absolute top-full mt-2 text-red-500 font-bold text-xs">MISS</div>}
               </div>
               
               {activeDot && (
                   <div 
                      className="absolute w-4 h-4 bg-white rounded-full shadow-[0_0_20px_white] animate-[ping_0.5s_linear_infinite] z-20"
                      style={{ top: `${activeDot.y}%`, left: `${activeDot.x}%` }}
                   ></div>
               )}

               <div className="absolute bottom-4 left-4 text-xs font-mono text-zinc-500 z-30">
                   TARGETS: {round}/{TOTAL_ROUNDS}
               </div>
           </div>
       )}

       {phase === 'result' && (
           <div className="py-12 animate-in zoom-in">
               <h2 className="text-3xl font-bold text-white mb-2">Visual Field Map</h2>
               <p className="text-zinc-400 text-sm mb-8">Green = Fast Reaction. Red = Blind Spot / Slow.</p>
               
               {/* Heatmap Visualization */}
               <div className="max-w-lg mx-auto bg-black border border-zinc-800 p-1 rounded-lg shadow-2xl mb-8">
                   <div className="grid grid-cols-4 gap-1 aspect-video">
                       {Array.from({length: 12}).map((_, i) => {
                           const stat = zoneStats[i];
                           const colorClass = getZoneColor(stat);
                           
                           return (
                               <div key={i} className={`${colorClass} relative group rounded-sm transition-all hover:opacity-80`}>
                                   <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                       <span className="text-xs font-bold text-white drop-shadow-md">
                                           {stat.hits}/{stat.hits+stat.misses}
                                       </span>
                                       {stat.hits > 0 && <span className="text-[9px] text-white font-mono drop-shadow-md">{Math.round(stat.avgRt)}ms</span>}
                                   </div>
                               </div>
                           );
                       })}
                   </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                   <div className="bg-zinc-900 border border-zinc-800 p-4 rounded text-left">
                       <h4 className="text-zinc-400 text-xs uppercase tracking-widest mb-1">Central Focus</h4>
                       <p className="text-sm text-white">
                           Maintaining central fixation while detecting peripheral stimuli tests your <strong className="text-primary-400">Divided Attention</strong>.
                       </p>
                   </div>
                   <div className="bg-zinc-900 border border-zinc-800 p-4 rounded text-left">
                       <h4 className="text-zinc-400 text-xs uppercase tracking-widest mb-1">Field Analysis</h4>
                       <p className="text-sm text-white">
                           Gaps in the outer edges (red blocks) may indicate tunnel vision tendencies or simple fatigue.
                       </p>
                   </div>
               </div>
               
               <div className="mt-12">
                   <button onClick={startGame} className="btn-secondary flex items-center justify-center gap-2 mx-auto">
                       <RefreshCcw size={16}/> Retake Calibration
                   </button>
               </div>
           </div>
       )}
    </div>
  );
};

export default PeripheralVisionTest;