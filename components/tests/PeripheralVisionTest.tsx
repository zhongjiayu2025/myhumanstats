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

  // Stable refs prevent expired timers and stale state from corrupting results.
  const activeRef = useRef<typeof activeDot>(null);
  const roundRef = useRef(0);
  const phaseRef = useRef<'intro' | 'test' | 'result'>('intro');
  const statsRef = useRef<Record<number, ZoneStats>>({});
  const zoneOrderRef = useRef<number[]>([]);
  const feedbackTimer = useRef<number | null>(null);

  const emptyStats = (): Record<number, ZoneStats> =>
    Object.fromEntries(Array.from({ length: ROWS * COLS }, (_, i) => [i, {hits: 0, misses: 0, avgRt: 0}]));

  const stopTimers = () => {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    if (charTimeoutRef.current !== null) window.clearTimeout(charTimeoutRef.current);
    if (feedbackTimer.current !== null) window.clearTimeout(feedbackTimer.current);
  };

  const finish = () => {
    stopTimers();
    phaseRef.current = 'result';
    activeRef.current = null;
    setActiveDot(null);
    const hits = Object.values(statsRef.current).reduce((total, item) => total + item.hits, 0);
    saveStat('peripheral-vision-test', Math.round(100 * hits / TOTAL_ROUNDS), hits);
    setPhase('result');
  };

  const resolveDot = (hit: boolean, dotId?: number) => {
    if (phaseRef.current !== 'test') return;
    const dot = activeRef.current;
    if (!dot || (dotId !== undefined && dotId !== dot.id)) return;
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    activeRef.current = null;
    setActiveDot(null);
    const idx = dot.r * COLS + dot.c;
    const prev = statsRef.current[idx];
    const newHits = prev.hits + (hit ? 1 : 0);
    const nextStat = hit
      ? { ...prev, hits: newHits, avgRt: (prev.avgRt * prev.hits + performance.now() - dot.born) / newHits }
      : { ...prev, misses: prev.misses + 1 };
    statsRef.current = { ...statsRef.current, [idx]: nextStat };
    setZoneStats(statsRef.current);
    setFlashFeedback(hit ? 'hit' : 'miss');
    if (feedbackTimer.current !== null) window.clearTimeout(feedbackTimer.current);
    feedbackTimer.current = window.setTimeout(() => setFlashFeedback(null), 250);
    roundRef.current += 1;
    setRound(roundRef.current);
    if (roundRef.current >= TOTAL_ROUNDS) finish();
    else scheduleNext();
  };

  const scheduleNext = () => {
    timeoutRef.current = window.setTimeout(() => {
      if (phaseRef.current !== 'test') return;
      const zone = zoneOrderRef.current[roundRef.current];
      if (zone === undefined) return finish();
      const r = Math.floor(zone / COLS);
      const col = zone % COLS;
      const width = 100 / COLS, height = 100 / ROWS, padding = 5;
      const dot = {
        id: roundRef.current + 1, r, c: col,
        x: col * width + padding + Math.random() * (width - padding * 2),
        y: r * height + padding + Math.random() * (height - padding * 2),
        born: performance.now()
      };
      activeRef.current = dot;
      setActiveDot(dot);
      timeoutRef.current = window.setTimeout(() => resolveDot(false, dot.id), 1200);
    }, 700 + Math.random() * 900);
  };

  const startGame = () => {
    stopTimers();
    statsRef.current = emptyStats();
    setZoneStats(statsRef.current);
    roundRef.current = 0;
    // Each region is tested exactly twice, rather than being skipped randomly.
    const order = [...Array(ROWS * COLS).keys(), ...Array(ROWS * COLS).keys()];
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    zoneOrderRef.current = order;
    activeRef.current = null;
    setActiveDot(null);
    setFlashFeedback(null);
    setRound(0);
    phaseRef.current = 'test';
    setPhase('test');
    scheduleNext();
  };

  const handleInput = () => resolveDot(true);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.code === 'Space' && phaseRef.current === 'test') {
        event.preventDefault();
        handleInput();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      stopTimers();
    };
  }, []);

  useEffect(() => {
    if (phase !== 'test') return;
    const refreshFocus = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      setCentralChar(chars[Math.floor(Math.random() * chars.length)]);
      charTimeoutRef.current = window.setTimeout(refreshFocus, 800 + Math.random() * 1200);
    };
    refreshFocus();
    return () => {
      if (charTimeoutRef.current !== null) window.clearTimeout(charTimeoutRef.current);
    };
  }, [phase]);

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
    <div className="max-w-4xl mx-auto text-center select-none">
       {phase === 'intro' && (
           <div className="py-12 animate-in fade-in zoom-in">
               <Eye size={64} className="mx-auto text-zinc-600 mb-6" />
               <h2 className="text-3xl font-bold text-white mb-2">Peripheral Vision Field Test</h2>
               <p className="text-zinc-400 mb-8 max-w-md mx-auto leading-relaxed">
                   Explore how quickly you notice brief targets around your screen. This exercise is not a medical visual-field exam.
                   <br/><br/>
                   1. Keep your eyes locked on the <strong>changing letter</strong> in the center.<br/>
                   2. Press <strong>SPACEBAR</strong> or <strong>TAP</strong> when a white dot flashes in your side vision.
               </p>
               <button onClick={startGame} className="btn-primary">Start Screen Awareness Test</button>
           </div>
       )}

       {phase === 'test' && (
           <div 
              className="relative w-full aspect-video bg-black border border-zinc-800 rounded-xl overflow-hidden cursor-crosshair touch-none shadow-2xl active:border-primary-500/50"
              onPointerDown={(e) => { e.preventDefault(); handleInput(); }}
               role="button" tabIndex={0}
               aria-label="Respond when a dot flashes. Tap the field or press Space."
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
               <p className="text-zinc-400 text-sm mb-8">Green means faster detections in this session; red means missed targets, not medical blind spots.</p>
               
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
                           Missed dots may reflect distraction, small screens or input delay. This online exercise cannot diagnose vision conditions.
                       </p>
                   </div>
               </div>
               
               <div className="mt-12">
                   <button onClick={startGame} className="btn-secondary flex items-center justify-center gap-2 mx-auto">
                       <RefreshCcw size={16}/> Retake Exercise
                   </button>
               </div>
           </div>
       )}
    </div>
  );
};

export default PeripheralVisionTest;