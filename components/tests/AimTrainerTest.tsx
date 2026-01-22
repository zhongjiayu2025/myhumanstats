
import React, { useState, useEffect, useRef } from 'react';
import { Crosshair, Trophy, MousePointer2, Target, Activity, RefreshCcw, Smartphone, Zap } from 'lucide-react';
import { saveStat, getHistory } from '../../lib/core';
import { playUiSound } from '../../lib/sounds';
import { LineChart, Line, YAxis, ResponsiveContainer } from 'recharts';
import CountdownOverlay from '../CountdownOverlay';
import Link from 'next/link';

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

// New: Store hit offsets relative to center of target
interface HitPoint {
    x: number; // Relative offset X from center
    y: number; // Relative offset Y from center
    time: number;
}

const AimTrainerTest: React.FC = () => {
  const [mode, setMode] = useState<'gridshot' | 'tracking'>('gridshot');
  const [phase, setPhase] = useState<'intro' | 'countdown' | 'play' | 'result'>('intro');
  const [isMobile, setIsMobile] = useState(false);
  
  // Gridshot Stats
  const [targets, setTargets] = useState<TargetObj[]>([]);
  const [score, setScore] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [hitPoints, setHitPoints] = useState<HitPoint[]>([]); 
  
  // Tracking Stats
  const [trackingScore, setTrackingScore] = useState(0); 
  const [trackingTarget, setTrackingTarget] = useState<TrackingTarget>({x: 100, y: 100, dx: 2, dy: 2});
  const [isTracked, setIsTracked] = useState(false);
  const [lockOnProgress, setLockOnProgress] = useState(0); // New: Visual charge 0-100

  // Shared
  const [timeLeft, setTimeLeft] = useState(30);
  const [hitmarkers, setHitmarkers] = useState<HitMarker[]>([]);
  const [historyData, setHistoryData] = useState<{i: number, score: number}[]>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const heatmapRef = useRef<HTMLCanvasElement>(null);

  const SPAWN_LIMIT = 30; 
  const TARGET_COUNT = 3; 

  useEffect(() => {
      const checkMobile = () => {
          setIsMobile(window.matchMedia('(max-width: 768px)').matches);
      };
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
      return () => {
          if (timerRef.current) clearInterval(timerRef.current);
          if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
  }, []);

  // --- Heatmap Drawing Logic ---
  useEffect(() => {
      if (phase === 'result' && mode === 'gridshot' && heatmapRef.current) {
          const canvas = heatmapRef.current;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          
          const w = canvas.width;
          const h = canvas.height;
          const cx = w / 2;
          const cy = h / 2;
          
          // Background
          ctx.fillStyle = '#09090b';
          ctx.fillRect(0, 0, w, h);
          
          // Draw Bullseye Rings
          ctx.strokeStyle = '#27272a';
          ctx.lineWidth = 1;
          for(let r=1; r<=4; r++) {
              ctx.beginPath();
              ctx.arc(cx, cy, r * 30, 0, Math.PI * 2);
              ctx.stroke();
          }
          
          // Plot hits
          hitPoints.forEach(p => {
              // p.x/y are offsets in pixels captured from click relative to target center.
              // We render them relative to the canvas center.
              ctx.beginPath();
              ctx.arc(cx + p.x, cy + p.y, 3, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(6, 182, 212, 0.6)`; // Primary-500
              ctx.fill();
          });
          
          // Draw Center Cross
          ctx.beginPath();
          ctx.moveTo(cx - 10, cy); ctx.lineTo(cx + 10, cy);
          ctx.moveTo(cx, cy - 10); ctx.lineTo(cx, cy + 10);
          ctx.strokeStyle = '#ef4444';
          ctx.stroke();
      }
  }, [phase, hitPoints, mode]);

  const initiateGame = () => {
      setPhase('countdown');
  };

  const startGame = () => {
      setScore(0);
      setTotalClicks(0);
      setTargets([]);
      setHitmarkers([]);
      setHitPoints([]);
      
      setTrackingScore(0);
      setIsTracked(false);
      setLockOnProgress(0);
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

  const generateTarget = (seedOffset: number = 0): TargetObj => {
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

  const handleTargetClick = (e: React.MouseEvent | React.TouchEvent, tId: number, bornTime: number) => {
      e.stopPropagation();
      e.preventDefault(); 
      
      if (phase !== 'play' || mode !== 'gridshot') return;
      
      playUiSound('success');
      if (navigator.vibrate) navigator.vibrate(20);

      const now = performance.now();
      const reaction = Math.round(now - bornTime);
      
      setScore(s => s + 1);
      setTotalClicks(c => c + 1);
      
      // Calculate offset for Heatmap
      // Need target center relative to viewport/container
      const targetEl = e.currentTarget as HTMLElement;
      const rect = targetEl.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      let clientX, clientY;
      if ('touches' in e) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
      } else {
          clientX = (e as React.MouseEvent).clientX;
          clientY = (e as React.MouseEvent).clientY;
      }
      
      // Store hit location relative to target center
      const offsetX = clientX - centerX;
      const offsetY = clientY - centerY;
      setHitPoints(prev => [...prev, { x: offsetX, y: offsetY, time: reaction }]);

      // Spawn hitmarker
      if (containerRef.current) {
          const containerRect = containerRef.current.getBoundingClientRect();
          spawnHitmarker(clientX - containerRect.left, clientY - containerRect.top, `${reaction}ms`);
      }
      
      setTargets(prev => prev.map(t => t.id === tId ? generateTarget() : t));
  };

  const handleBackgroundClick = (e: React.MouseEvent | React.TouchEvent) => {
      if (e.cancelable) e.preventDefault(); 
      if (phase === 'play') {
          playUiSound('snap');
          if (navigator.vibrate) navigator.vibrate(5);
          if (mode === 'gridshot') setTotalClicks(c => c + 1);
      }
  };

  // --- Tracking Logic with Lock-on ---
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
  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
      if(e.cancelable) e.preventDefault();

      if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          let clientX, clientY;
          if ('touches' in e) {
              clientX = e.touches[0].clientX;
              clientY = e.touches[0].clientY;
          } else {
              clientX = (e as React.MouseEvent).clientX;
              clientY = (e as React.MouseEvent).clientY;
          }
          
          mousePos.current = {
              x: clientX - rect.left,
              y: clientY - rect.top
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
                  // Increase Lock-on charge
                  setLockOnProgress(p => Math.min(100, p + 2));
              } else {
                  setIsTracked(false);
                  // Decay Lock-on
                  setLockOnProgress(p => Math.max(0, p - 5));
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
      
      const hist = getHistory('aim-trainer');
      setHistoryData(hist.slice(-20).map((h, i) => ({ i, score: h.score })));
  };

  const gridAccuracy = totalClicks > 0 ? Math.round((score / totalClicks) * 100) : 0;
  const trackingAccuracy = Math.round((trackingScore / 30000) * 100);

  return (
    <div className="w-full max-w-4xl mx-auto select-none relative">
       
       <CountdownOverlay isActive={phase === 'countdown'} onComplete={startGame} />

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

               <button onClick={initiateGame} className="btn-primary flex items-center gap-2 mx-auto">
                   <MousePointer2 size={18} /> Start Round
               </button>
           </div>
       )}

       {(phase === 'play' || phase === 'countdown') && (
           <div className="relative">
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

               <div 
                  ref={containerRef}
                  onMouseDown={handleBackgroundClick}
                  onMouseMove={handleMouseMove}
                  onTouchStart={(e) => { handleBackgroundClick(e); handleMouseMove(e); }}
                  onTouchMove={handleMouseMove}
                  className="w-full h-[50vh] md:h-[500px] bg-zinc-950 border border-zinc-800 relative overflow-hidden cursor-crosshair shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] rounded-lg touch-none"
               >
                   <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none"></div>

                   {hitmarkers.map(h => (
                       <div 
                          key={h.id}
                          className="absolute pointer-events-none text-emerald-400 font-bold text-sm animate-out fade-out slide-out-to-top-4 duration-700 z-50 flex items-center gap-1"
                          style={{ left: h.x, top: h.y }}
                       >
                           <span>+</span>{h.value}
                       </div>
                   ))}

                   {mode === 'gridshot' && targets.map(t => (
                       <div
                          key={t.id}
                          onMouseDown={(e) => handleTargetClick(e, t.id, t.born)}
                          onTouchStart={(e) => handleTargetClick(e, t.id, t.born)}
                          className="absolute w-16 h-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-900 border-2 border-primary-500 flex items-center justify-center cursor-pointer active:scale-95 transition-transform duration-75 z-10 animate-in zoom-in-50 duration-100 group touch-manipulation touch-none"
                          style={{ left: `${t.x}%`, top: `${t.y}%` }}
                       >
                           <div className="w-10 h-10 rounded-full bg-primary-500/20 border border-primary-400 flex items-center justify-center group-hover:bg-primary-500/40">
                               <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white]"></div>
                           </div>
                       </div>
                   ))}

                   {mode === 'tracking' && (
                       <div 
                          className={`
                             absolute w-20 h-20 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 flex items-center justify-center transition-all duration-75
                             ${isTracked ? 'border-white bg-primary-500/20 shadow-[0_0_40px_rgba(6,182,212,0.4)]' : 'border-zinc-700 bg-zinc-900/50'}
                          `}
                          style={{ left: trackingTarget.x, top: trackingTarget.y }}
                       >
                           {/* Lock-on Charging Ring */}
                           <svg className="absolute inset-0 w-full h-full -rotate-90">
                               <circle 
                                  cx="40" cy="40" r="38" 
                                  fill="none" 
                                  stroke={isTracked ? "#06b6d4" : "#333"} 
                                  strokeWidth="3" 
                                  strokeDasharray="238"
                                  strokeDashoffset={238 - (lockOnProgress / 100) * 238}
                                  className="transition-all duration-100 ease-linear"
                               />
                           </svg>
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
               
               {/* Accuracy Heatmap Visualization */}
               {mode === 'gridshot' && hitPoints.length > 0 && (
                   <div className="my-8">
                       <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4">Precision Heatmap</h3>
                       <div className="inline-block border border-zinc-800 rounded-full bg-black p-4 relative">
                           <canvas ref={heatmapRef} width={240} height={240} className="w-60 h-60" />
                           <div className="absolute bottom-2 w-full text-center text-[9px] text-zinc-500">Center = Perfect</div>
                       </div>
                   </div>
               )}

               <div className="grid grid-cols-2 gap-4 mb-8">
                   <div className="bg-zinc-900 border border-zinc-800 p-4 rounded">
                       <div className="text-xs text-zinc-500 uppercase mb-1">Accuracy</div>
                       <div className="text-2xl font-bold text-white">
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

               <div className="flex flex-col gap-3">
                   <button onClick={initiateGame} className="btn-secondary w-full flex items-center justify-center gap-2">
                       <RefreshCcw size={16} /> Restart Round
                   </button>
                   <Link href="/test/cps-test" className="btn-primary w-full flex items-center justify-center gap-2 text-xs uppercase">
                       <Zap size={14} /> Test Click Speed (CPS)
                   </Link>
               </div>
           </div>
       )}
    </div>
  );
};

export default AimTrainerTest;
