import React, { useState, useEffect, useRef } from 'react';
import { Minus, Timer, Keyboard } from 'lucide-react';
import { saveStat } from '../../lib/core';

const SpacebarSpeedTest: React.FC = () => {
  const [active, setActive] = useState(false);
  const [finished, setFinished] = useState(false);
  const [count, setCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5);
  const [isPressed, setIsPressed] = useState(false);
  
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (active && timeLeft > 0) {
       timerRef.current = window.setTimeout(() => setTimeLeft(t => t - 1), 1000);
    } else if (active && timeLeft === 0) {
       finish();
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [active, timeLeft]);

  useEffect(() => {
      const handleDown = (e: KeyboardEvent) => {
          if (e.code === 'Space') {
              e.preventDefault(); // Prevent scrolling
              if (!finished && !e.repeat) {
                  if (!active) setActive(true);
                  setIsPressed(true);
                  setCount(c => c + 1);
              }
          }
      };
      
      const handleUp = (e: KeyboardEvent) => {
          if (e.code === 'Space') {
              setIsPressed(false);
          }
      };

      window.addEventListener('keydown', handleDown);
      window.addEventListener('keyup', handleUp);
      return () => {
          window.removeEventListener('keydown', handleDown);
          window.removeEventListener('keyup', handleUp);
      }
  }, [active, finished]);

  const finish = () => {
     setActive(false);
     setFinished(true);
     // Average spacebar CPS is around 6-8. 
     // Score: 8 CPS -> 100.
     const cps = count / 5;
     const score = Math.min(100, Math.round((cps / 10) * 100)); 
     saveStat('spacebar-speed', score);
  };

  const reset = () => {
     setActive(false);
     setFinished(false);
     setCount(0);
     setTimeLeft(5);
  };

  return (
    <div className="max-w-xl mx-auto select-none text-center">
       <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="tech-border bg-surface p-4 flex items-center justify-between">
             <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Timer</span>
             <div className="text-xl font-mono text-white flex items-center gap-2">
                <Timer size={16} /> {timeLeft}s
             </div>
          </div>
          <div className="tech-border bg-surface p-4 flex items-center justify-between">
             <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Count</span>
             <div className="text-xl font-mono text-primary-400">
                {count}
             </div>
          </div>
       </div>

       <div className="relative h-48 flex items-center justify-center">
           {/* Visual Spacebar Representation */}
           <div 
              className={`
                 w-full max-w-sm h-24 border-2 rounded-lg flex items-center justify-center transition-all duration-75
                 ${isPressed ? 'bg-primary-500 border-primary-400 scale-95 shadow-[0_0_30px_rgba(34,211,238,0.5)]' : 'bg-zinc-900 border-zinc-700 shadow-lg'}
                 ${finished ? 'opacity-50' : ''}
              `}
           >
              {active ? (
                  <span className={`font-mono text-2xl font-bold ${isPressed ? 'text-black' : 'text-zinc-500'}`}>PRESS SPACE</span>
              ) : finished ? (
                  <span className="font-mono text-2xl font-bold text-white">DONE</span>
              ) : (
                  <div className="flex flex-col items-center">
                      <Minus size={32} className="text-zinc-500 mb-1" />
                      <span className="font-mono text-sm font-bold text-zinc-500 uppercase">Hit Spacebar to Start</span>
                  </div>
              )}
           </div>
       </div>

       {finished && (
           <div className="animate-in slide-in-from-bottom-4">
               <div className="text-5xl font-bold text-white mb-2">{(count / 5).toFixed(1)} <span className="text-2xl text-zinc-500">CPS</span></div>
               <p className="text-zinc-400 text-sm mb-8">Spacebar clicks per second</p>
               <button onClick={reset} className="btn-secondary w-full">Try Again</button>
           </div>
       )}
       
       <div className="mt-12 text-xs text-zinc-600 font-mono border-t border-zinc-800 pt-6">
           <div className="flex items-center justify-center gap-2 mb-2">
               <Keyboard size={14} />
               <span>SPACEBAR COUNTER</span>
           </div>
           Use this tool to measure your thumb speed and keyboard latency specifically for the Spacebar key.
       </div>
    </div>
  );
};

export default SpacebarSpeedTest;