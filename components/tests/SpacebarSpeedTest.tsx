
import React, { useState, useEffect, useRef } from 'react';
import { Keyboard, Rocket } from 'lucide-react';
import { saveStat } from '../../lib/core';

const SpacebarSpeedTest: React.FC = () => {
  const [active, setActive] = useState(false);
  const [finished, setFinished] = useState(false);
  const [count, setCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5);
  const [isPressed, setIsPressed] = useState(false);
  
  const timerRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);

  // Gamification: Instant Speed (CPS) calculation
  const [instantCps, setInstantCps] = useState(0);
  const instantCpsRef = useRef(0); // Ref for animation loop to access fresh value
  const clicksHistory = useRef<number[]>([]); 

  // --- Starfield Logic ---
  const starsRef = useRef<{x: number, y: number, z: number}[]>([]);
  
  const initStars = (w: number, h: number) => {
      const stars = [];
      for(let i=0; i<400; i++) {
          stars.push({
              x: Math.random() * w - w/2,
              y: Math.random() * h - h/2,
              z: Math.random() * w
          });
      }
      starsRef.current = stars;
  };

  const drawStarfield = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      // Clear with trail effect for warp speed
      ctx.fillStyle = instantCpsRef.current > 8 ? 'rgba(0, 0, 0, 0.2)' : '#000000';
      ctx.fillRect(0, 0, w, h);

      // Base speed + CPS boost
      const speed = 2 + (instantCpsRef.current * 8); 
      const isWarp = instantCpsRef.current > 8;

      ctx.fillStyle = '#ffffff';
      
      starsRef.current.forEach(star => {
          star.z -= speed;
          
          if (star.z <= 0) {
              star.z = w;
              star.x = Math.random() * w - cx;
              star.y = Math.random() * h - cy;
          }

          const k = 128.0 / star.z;
          const px = star.x * k + cx;
          const py = star.y * k + cy;

          if (px >= 0 && px <= w && py >= 0 && py <= h) {
              const size = (1 - star.z / w) * 3;
              
              if (isWarp) {
                  // Draw Line (Streak)
                  const oldK = 128.0 / (star.z + speed * 2);
                  const oldPx = star.x * oldK + cx;
                  const oldPy = star.y * oldK + cy;
                  
                  ctx.beginPath();
                  ctx.strokeStyle = `rgba(255, 255, 255, ${1 - star.z/w})`;
                  ctx.lineWidth = size;
                  ctx.moveTo(oldPx, oldPy);
                  ctx.lineTo(px, py);
                  ctx.stroke();
              } else {
                  // Draw Dot
                  ctx.beginPath();
                  ctx.arc(px, py, size, 0, Math.PI * 2);
                  ctx.fill();
              }
          }
      });

      animRef.current = requestAnimationFrame(drawStarfield);
  };

  useEffect(() => {
      if (canvasRef.current) {
          canvasRef.current.width = canvasRef.current.offsetWidth;
          canvasRef.current.height = canvasRef.current.offsetHeight;
          initStars(canvasRef.current.width, canvasRef.current.height);
          drawStarfield();
      }
      return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  // --- Game Logic ---

  useEffect(() => {
    if (active && timeLeft > 0) {
       timerRef.current = window.setTimeout(() => setTimeLeft(t => t - 1), 1000);
    } else if (active && timeLeft === 0) {
       finish();
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [active, timeLeft]);

  const handleInput = (e?: Event) => {
      if (finished) return;
      if (!active) setActive(true);
      
      setCount(c => c + 1);
      setIsPressed(true);
      setTimeout(() => setIsPressed(false), 50);

      // Track instant speed
      const now = Date.now();
      clicksHistory.current.push(now);
      clicksHistory.current = clicksHistory.current.filter(t => now - t < 1000);
      
      const cps = clicksHistory.current.length;
      setInstantCps(cps);
      instantCpsRef.current = cps;
  };

  useEffect(() => {
      const handleDown = (e: KeyboardEvent) => {
          if (e.code === 'Space') {
              e.preventDefault(); 
              if (!finished && !e.repeat) {
                  handleInput();
              }
          }
      };
      
      window.addEventListener('keydown', handleDown);
      return () => {
          window.removeEventListener('keydown', handleDown);
      }
  }, [active, finished]);

  // Decay CPS visual if user stops pressing
  useEffect(() => {
      const interval = setInterval(() => {
          if (clicksHistory.current.length > 0) {
              const now = Date.now();
              clicksHistory.current = clicksHistory.current.filter(t => now - t < 1000);
              const cps = clicksHistory.current.length;
              setInstantCps(cps);
              instantCpsRef.current = cps;
          } else {
              setInstantCps(0);
              instantCpsRef.current = 0;
          }
      }, 100);
      return () => clearInterval(interval);
  }, []);

  const finish = () => {
     setActive(false);
     setFinished(true);
     const cps = count / 5;
     const score = Math.min(100, Math.round((cps / 10) * 100)); 
     saveStat('spacebar-speed', score);
  };

  const reset = () => {
     setActive(false);
     setFinished(false);
     setCount(0);
     setTimeLeft(5);
     setInstantCps(0);
     instantCpsRef.current = 0;
     clicksHistory.current = [];
  };

  return (
    <div className="max-w-xl mx-auto select-none text-center relative overflow-hidden rounded-xl border border-zinc-800 touch-none">
       
       {/* Background Starfield Canvas */}
       <canvas 
          ref={canvasRef} 
          className="absolute inset-0 w-full h-full pointer-events-none opacity-50 z-0"
       />

       {/* Giant Tap Area for Mobile overlay */}
       {!finished && (
           <div 
              className="absolute inset-0 z-20 cursor-pointer md:pointer-events-none no-tap-highlight"
              onTouchStart={(e) => { e.preventDefault(); handleInput(); }}
              onMouseDown={(e) => { 
                  // Only on desktop if clicking outside visual button (mobile uses touchstart)
                  if(window.innerWidth > 768) { 
                      e.preventDefault(); handleInput(); 
                  }
              }}
           ></div>
       )}

       <div className="relative z-10 p-8 bg-gradient-to-b from-transparent to-black/80 pointer-events-none">
           {/* Dashboard */}
           <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-zinc-900/80 backdrop-blur border border-zinc-800 p-4 rounded flex flex-col justify-center">
                 <span className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Time</span>
                 <div className={`text-2xl font-mono ${timeLeft < 2 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                    {timeLeft}s
                 </div>
              </div>
              <div className="bg-zinc-900/80 backdrop-blur border border-zinc-800 p-4 rounded flex flex-col justify-center">
                 <span className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Count</span>
                 <div className="text-2xl font-mono text-primary-400 font-bold">
                    {count}
                 </div>
              </div>
              <div className="bg-zinc-900/80 backdrop-blur border border-zinc-800 p-4 rounded flex flex-col justify-center relative overflow-hidden">
                 <div className={`absolute inset-0 ${instantCps > 8 ? 'bg-amber-500/20' : 'bg-primary-500/10'}`} style={{ height: `${Math.min(100, (instantCps / 12) * 100)}%`, transition: 'height 0.1s' }}></div>
                 <span className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Speed</span>
                 <div className={`text-2xl font-mono relative z-10 ${instantCps > 8 ? 'text-amber-500' : 'text-white'}`}>
                    {instantCps} <span className="text-xs text-zinc-600">CPS</span>
                 </div>
              </div>
           </div>

           {/* Visual Interactive Spacebar */}
           <div className="relative h-40 flex items-center justify-center mb-12">
               <div 
                  className={`
                     w-full max-w-md h-20 border-b-8 rounded-lg flex items-center justify-center transition-all duration-50 backdrop-blur-sm
                     ${isPressed 
                        ? 'border-b-0 mt-2 bg-primary-500 shadow-[0_0_50px_rgba(34,211,238,0.8)] text-black' 
                        : 'bg-zinc-800/80 border-zinc-950 text-zinc-500 shadow-xl'}
                     ${finished ? 'opacity-50 pointer-events-none' : ''}
                  `}
               >
                  {active ? (
                      <span className="font-mono text-2xl font-bold tracking-widest">
                          {instantCps > 8 ? 'HYPERSPACE!' : 'TAP RAPIDLY'}
                      </span>
                  ) : finished ? (
                      <span className="font-mono text-2xl font-bold text-white">COMPLETE</span>
                  ) : (
                      <div className="flex flex-col items-center gap-2">
                          <span className="font-mono text-sm font-bold uppercase">Press Space / Tap Screen</span>
                      </div>
                  )}
               </div>
           </div>

           {/* Rocket Progress Visual */}
           {active && (
               <div className="w-full h-2 bg-zinc-800 rounded-full mb-8 relative overflow-hidden">
                   <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-600 to-white transition-all duration-75" style={{ width: `${Math.min(100, (count / 60) * 100)}%` }}></div>
                   <div className="absolute top-1/2 -translate-y-1/2 transition-all duration-75 text-white" style={{ left: `${Math.min(95, (count / 60) * 100)}%` }}>
                       <Rocket size={16} className={`rotate-45 ${instantCps > 8 ? 'animate-pulse text-amber-500' : ''}`} />
                   </div>
               </div>
           )}

           {finished && (
               <div className="animate-in slide-in-from-bottom-4 pointer-events-auto relative z-30">
                   <div className="text-6xl font-bold text-white mb-2 font-mono">{(count / 5).toFixed(1)}</div>
                   <p className="text-primary-400 text-sm mb-8 uppercase tracking-widest font-bold">Clicks Per Second</p>
                   <button onClick={reset} className="btn-secondary w-full">Try Again</button>
               </div>
           )}
           
           {!active && !finished && (
               <div className="mt-12 text-xs text-zinc-600 font-mono border-t border-zinc-800 pt-6">
                   <div className="flex items-center justify-center gap-2 mb-2">
                       <Keyboard size={14} />
                       <span>THUMB VELOCITY TEST</span>
                   </div>
                   Tip: Use your dominant thumb and keep your wrist planted for maximum stability.
               </div>
           )}
       </div>
    </div>
  );
};

export default SpacebarSpeedTest;
