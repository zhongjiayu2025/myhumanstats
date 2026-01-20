
import React, { useState, useEffect, useRef } from 'react';
import { Crosshair, Trophy, MousePointer2, Target, Activity, RefreshCcw } from 'lucide-react';
import { saveStat, getHistory } from '../../lib/core';
import { playUiSound } from '../../lib/sounds';
import { LineChart, Line, YAxis, ResponsiveContainer } from 'recharts';

interface TargetObj {
  id: number;
  x: number; // Percentage
  y: number; // Percentage
  born: number; // timestamp
}

interface HitMarker {
    id: number;
    x: number;
    y: number;
    value: string;
}

interface TrackingTarget {
    x: number; // px
    y: number; // px
    dx: number;
    dy: number;
}

const AimTrainerTest: React.FC = () => {
  const [mode, setMode] = useState<'gridshot' | 'tracking'>('gridshot');
  const [phase, setPhase] = useState<'intro' | 'play' | 'result'>('intro');
  
  // Gridshot Stats
  const [targets, setTargets] = useState<TargetObj[]>([]);
  const [score, setScore] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  
  // Tracking Stats
  const [trackingScore, setTrackingScore] = useState(0); // Milliseconds on target
  const [trackingTarget, setTrackingTarget] = useState<TrackingTarget>({x: 0, y: 0, dx: 2, dy: 2});
  const [isTracked, setIsTracked] = useState(false);

  // Shared
  const [timeLeft, setTimeLeft] = useState(30);
  const [hitmarkers, setHitmarkers] = useState<HitMarker[]>([]);
  const [historyData, setHistoryData] = useState<{i: number, score: number}[]>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const SPAWN_LIMIT = 30; // 30 seconds game
  const TARGET_COUNT = 3; 

  // Cleanup
  useEffect(() => {
      return () => {
          if (timerRef.current) clearInterval(timerRef.current);
          if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
  }, []);

  const startGame = () => {
      setScore(0);
      setTotalClicks(0);
      setTargets([]);
      setHitmarkers([]);
      
      setTrackingScore(0);
      setIsTracked(false);
      setTrackingTarget({x: 100, y: 100, dx: 3, dy: 2}); 

      setTimeLeft(SPAWN_LIMIT);
      setPhase('play');

      if (mode === 'gridshot') {
          const initialTargets = [];
          for(let i=0; i<TARGET_COUNT; i++) initialTargets.push(generateTarget(i));
          setTargets(initialTargets);
      } else {
          updateTracking();
      }
  };

  // --- Gridshot Logic ---
  const generateTarget = (seedOffset: number = 0): TargetObj => {
      // Basic overlap prevention could be added here
      return {
          id: performance.now() + seedOffset + Math.random(),
          x: Math.random() * 80 + 10, 
          y: Math.random() * 70 + 15,
          born: performance.now()
      };
  };

  const spawnHitmarker = (x: number, y: number, text: string) => {
      const id = Date.now();
      setHitmarkers(prev => [...prev, { id, x, y, value: text }]);
      setTimeout(() => setHitmarkers(prev => prev.filter(h => h.id !== id)), 800);
  };

  const handleTargetClick = (e: React.MouseEvent, tId: number, bornTime: number) => {
      e.stopPropagation();
      if (phase !== 'play' || mode !== 'gridshot') return;
      
      playUiSound('success');
      if (navigator.vibrate) navigator.vibrate(20);

      const now = performance.now();
      const reaction = Math.round(now - bornTime);
      
      setScore(s => s + 1);
      setTotalClicks(c => c + 1);
      
      // Spawn hitmarker at mouse position relative to container
      if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          spawnHitmarker(e.clientX - rect.left, e.clientY - rect.top, `${reaction}ms`);
      }
      
      setTargets(prev => prev.map(t => t.id === tId ? generateTarget() : t));
  };

  const handleBackgroundClick = () => {
      if (phase === 'play') {
          playUiSound('snap');
          if (navigator.vibrate) navigator.vibrate(5);
          if (mode === 'gridshot') setTotalClicks(c => c + 1);
      }
  };

  // --- Tracking Logic ---
  const updateTracking = () => {
      if (phase !== 'play' && mode === 'tracking') return;
      
      setTrackingTarget(prev => {
          let nx = prev.x + prev.dx;
          let ny = prev.y + prev.dy;
          let ndx = prev.dx;
          let ndy = prev.dy;
          
          const bounds = containerRef.current?.getBoundingClientRect();
          const w = bounds?.width || 500;
          const h = bounds?.height || 500;
          const r = 30; 

          if (nx < r || nx > w - r) ndx *= -1;
          if (ny < r || ny > h - r) ndy *= -1;
          
          return { x: nx, y: ny, dx: ndx, dy: ndy };
      });
      
      rafRef.current = requestAnimationFrame(updateTracking);
  };

  const mousePos = useRef({x: 0, y: 0});
  const handleMouseMove = (e: React.MouseEvent) => {
      if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          mousePos.current = {
              x: e.clientX - rect.left,
              y: e.clientY - rect.top
          };
      }
  };

  useEffect(() => {
      if (mode === 'tracking' && phase === 'play') {
          const checkTracking = setInterval(() => {
              const t = trackingTarget;
              const m = mousePos.current;
              const dist = Math.sqrt((t.x - m.x)**2 + (t.y - m.y)**2);
              const radius = 40; 
              
              if (dist < radius) {
                  setIsTracked(true);
                  setTrackingScore(s => s + 16); 
              } else {
                  setIsTracked(false);
              }
          }, 16);
          return () => clearInterval(checkTracking);
      }
  }, [trackingTarget, phase, mode]);


  // --- Timer ---
  useEffect(() => {
      if (phase === 'play') {
          timerRef.current = window.setInterval(() => {
              setTimeLeft(t => {
                  if (t <= 1) {
                      finish();
                      return 0;
                  }
                  return t - 1;
              });
          }, 1000);
      }
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  const finish = () => {
      setPhase('result');
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      
      let finalScore = 0;
      if (mode === 'gridshot') {
          finalScore = Math.min(100, Math.round((score / 80) * 100));
      } else {
          finalScore = Math.min(100, Math.round((trackingScore / 30000) * 100));
      }
      saveStat('aim-trainer', finalScore);
      
      // Load History
      const hist = getHistory('aim-trainer');
      setHistoryData(hist.slice(-20).map((h, i) => ({ i, score: h.score })));
  };

  const gridAccuracy = totalClicks > 0 ? Math.round((score / totalClicks) * 100) : 0;
  const trackingAccuracy = Math.round((trackingScore / 30000) * 100);

  return (
    <div className="w-full max-w-4xl mx-auto select-none">
       {phase === 'intro' && (
           <div className="max-w-xl mx-auto text-center py-12 animate-in fade-in zoom-in">
               <div className="w-24 h-24 bg-zinc-900 border border-zinc-700 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                   <Target size={48} className="text-primary-500" />
                   <div className="absolute inset-0 border-2 border-primary-500/30 rounded-full animate-ping"></div>
               </div>
               <h2 className="text-3xl font-bold text-white mb-2">Aim Trainer</h2>
               <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                   Calibrate your mouse control.
               </p>
               
               <div className="flex justify-center gap-4 mb-8">
                   <button 
                      onClick={() => setMode('gridshot')}
                      className={`flex flex-col items-center p-4 border rounded-xl w-32 transition-all ${mode === 'gridshot' ? 'bg-primary-900/20 border-primary-500 text-primary-400' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}
                   >
                       <Crosshair size={24} className="mb-2"/>
                       <span className="font-bold text-sm">Gridshot</span>
                       <span className="text-[10px] opacity-70">Flicking</span>
                   </button>
                   <button 
                      onClick={() => setMode('tracking')}
                      className={`flex flex-col items-center p-4 border rounded-xl w-32 transition-all ${mode === 'tracking' ? 'bg-primary-900/20 border-primary-500 text-primary-400' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}
                   >
                       <Activity size={24} className="mb-2"/>
                       <span className="font-bold text-sm">Tracking</span>
                       <span className="text-[10px] opacity-70">Smoothness</span>
                   </button>
               </div>

               <button onClick={startGame} className="btn-primary flex items-center gap-2 mx-auto">
                   <MousePointer2 size={18} /> Start Round
               </button>
           </div>
       )}

       {phase === 'play' && (
           <div className="relative">
               {/* HUD */}
               <div className="flex justify-between items-center mb-4 bg-black border border-zinc-800 p-4 clip-corner-sm">
                   <div className="flex gap-8">
                       <div>
                           <div className="text-[10px] text-zinc-500 uppercase font-mono">Time</div>
                           <div className={`text-2xl font-mono ${timeLeft < 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>{timeLeft}s</div>
                       </div>
                       <div>
                           <div className="text-[10px] text-zinc-500 uppercase font-mono">Score</div>
                           <div className="text-2xl font-mono text-primary-400">
                               {mode === 'gridshot' ? score : `${(trackingScore/1000).toFixed(1)}s`}
                           </div>
                       </div>
                   </div>
               </div>

               {/* Game Area */}
               <div 
                  ref={containerRef}
                  onMouseDown={handleBackgroundClick}
                  onMouseMove={handleMouseMove}
                  className="w-full h-[500px] bg-zinc-950 border border-zinc-800 relative overflow-hidden cursor-crosshair shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] rounded-lg"
               >
                   <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none"></div>

                   {/* Hitmarkers */}
                   {hitmarkers.map(h => (
                       <div 
                          key={h.id}
                          className="absolute pointer-events-none text-emerald-400 font-bold text-sm animate-out fade-out slide-out-to-top-4 duration-700 z-50 flex items-center gap-1"
                          style={{ left: h.x, top: h.y }}
                       >
                           <span>+</span>{h.value}
                       </div>
                   ))}

                   {/* Gridshot Targets */}
                   {mode === 'gridshot' && targets.map(t => (
                       <div
                          key={t.id}
                          onMouseDown={(e) => handleTargetClick(e, t.id, t.born)}
                          className="absolute w-16 h-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-900 border-2 border-primary-500 flex items-center justify-center cursor-pointer active:scale-95 transition-transform duration-75 z-10 animate-in zoom-in-50 duration-100 group"
                          style={{ left: `${t.x}%`, top: `${t.y}%` }}
                       >
                           {/* Bullseye inner */}
                           <div className="w-10 h-10 rounded-full bg-primary-500/20 border border-primary-400 flex items-center justify-center group-hover:bg-primary-500/40">
                               <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white]"></div>
                           </div>
                       </div>
                   ))}

                   {/* Tracking Target */}
                   {mode === 'tracking' && (
                       <div 
                          className={`
                             absolute w-20 h-20 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 flex items-center justify-center transition-all duration-75
                             ${isTracked ? 'border-white bg-primary-500/20 shadow-[0_0_40px_rgba(6,182,212,0.4)]' : 'border-zinc-700 bg-zinc-900/50'}
                          `}
                          style={{ left: trackingTarget.x, top: trackingTarget.y }}
                       >
                           {/* Health Ring Visual */}
                           {isTracked && (
                               <svg className="absolute inset-0 w-full h-full -rotate-90 animate-spin-slow">
                                   <circle cx="40" cy="40" r="38" fill="none" stroke="#06b6d4" strokeWidth="2" strokeDasharray="10 5" />
                               </svg>
                           )}
                           <div className={`w-4 h-4 rounded-full ${isTracked ? 'bg-white scale-125' : 'bg-zinc-600'} transition-all`}></div>
                       </div>
                   )}
               </div>
           </div>
       )}

       {phase === 'result' && (
           <div className="max-w-xl mx-auto text-center py-12 animate-in fade-in slide-in-from-bottom-8">
               <Trophy size={64} className="mx-auto text-yellow-500 mb-6" />
               
               <div className="text-6xl font-bold text-white mb-2">
                   {mode === 'gridshot' ? score : `${(trackingScore/1000).toFixed(1)}s`}
               </div>
               <div className="text-zinc-500 uppercase font-mono tracking-widest mb-8">
                   {mode === 'gridshot' ? 'Total Hits' : 'Time Tracked'}
               </div>

               <div className="grid grid-cols-2 gap-4 mb-8">
                   <div className="bg-zinc-900 border border-zinc-800 p-4 rounded">
                       <div className="text-xs text-zinc-500 uppercase mb-1">Accuracy</div>
                       <div className={`text-2xl font-bold ${mode === 'gridshot' ? (gridAccuracy > 90 ? 'text-emerald-500' : 'text-yellow-500') : (trackingAccuracy > 60 ? 'text-emerald-500' : 'text-yellow-500')}`}>
                           {mode === 'gridshot' ? gridAccuracy : trackingAccuracy}%
                       </div>
                   </div>
                   <div className="bg-zinc-900 border border-zinc-800 p-4 rounded">
                       <div className="text-xs text-zinc-500 uppercase mb-1">Performance</div>
                       <div className="text-2xl font-bold text-primary-400">
                           {mode === 'gridshot' ? `${(score / 30).toFixed(2)} KPS` : `${trackingScore}ms`}
                       </div>
                   </div>
               </div>

               {/* History Trend */}
               <div className="h-32 w-full bg-zinc-900/30 border border-zinc-800 rounded p-2 mb-8">
                   <div className="text-[10px] text-zinc-500 font-mono text-left mb-1">RECENT_PERFORMANCE</div>
                   <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={historyData}>
                           <Line type="monotone" dataKey="score" stroke="#06b6d4" strokeWidth={2} dot={false} />
                           <YAxis hide domain={[0, 100]} />
                       </LineChart>
                   </ResponsiveContainer>
               </div>

               <button onClick={startGame} className="btn-secondary w-full flex items-center justify-center gap-2">
                   <RefreshCcw size={16} /> Restart Round
               </button>
           </div>
       )}
    </div>
  );
};

export default AimTrainerTest;
