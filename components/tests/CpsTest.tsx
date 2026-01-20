import React, { useState, useEffect, useRef } from 'react';
import { MousePointer, Timer } from 'lucide-react';
import { saveStat } from '../../lib/core';

const CpsTest: React.FC = () => {
  const [active, setActive] = useState(false);
  const [finished, setFinished] = useState(false);
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (active && timeLeft > 0) {
       timerRef.current = window.setTimeout(() => setTimeLeft(t => t - 1), 1000);
    } else if (active && timeLeft === 0) {
       finish();
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [active, timeLeft]);

  const handleClick = () => {
     if (finished) return;
     if (!active) {
        setActive(true);
     }
     setClicks(c => c + 1);
  };

  const finish = () => {
     setActive(false);
     setFinished(true);
     const cps = clicks / 10;
     // World record ~15-20 CPS? Normal ~6.
     // Score mapping: 6 -> 50, 10 -> 100?
     const score = Math.min(100, Math.round((cps / 12) * 100)); 
     saveStat('cps-test', score);
  };

  const reset = () => {
     setActive(false);
     setFinished(false);
     setClicks(0);
     setTimeLeft(10);
  };

  return (
    <div className="max-w-xl mx-auto select-none">
       <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="tech-border bg-surface p-4 flex items-center justify-between">
             <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Time</span>
             <div className="text-xl font-mono text-white flex items-center gap-2">
                <Timer size={16} /> {timeLeft}s
             </div>
          </div>
          <div className="tech-border bg-surface p-4 flex items-center justify-between">
             <span className="text-[10px] text-zinc-500 uppercase tracking-widest">CPS</span>
             <div className="text-xl font-mono text-primary-400">
                {active ? (clicks / (10 - timeLeft + 0.001)).toFixed(1) : (clicks / 10).toFixed(1)}
             </div>
          </div>
       </div>

       <button 
          onMouseDown={handleClick} // onMouseDown allows faster clicking than onClick
          disabled={finished}
          className={`
             w-full h-64 tech-border bg-black relative overflow-hidden group transition-all duration-75 active:scale-[0.99]
             ${active ? 'border-primary-500 shadow-[0_0_30px_rgba(34,211,238,0.1)]' : 'border-zinc-700 hover:bg-zinc-900'}
          `}
       >
          {/* Ripple effect placeholder */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             {!active && !finished && (
                <div className="text-center">
                   <MousePointer size={48} className="mx-auto text-zinc-600 mb-2 group-hover:text-white transition-colors" />
                   <div className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Click to Start</div>
                </div>
             )}
             
             {active && (
                <div className="text-6xl font-black text-white/10 scale-150 animate-pulse">
                   CLICK!
                </div>
             )}
             
             {finished && (
                <div className="text-center z-10">
                   <div className="text-4xl font-bold text-white mb-2">{clicks / 10} CPS</div>
                   <div className="text-xs text-zinc-500 font-mono">RANK: {clicks > 100 ? 'GODLIKE' : clicks > 80 ? 'PRO' : 'AVERAGE'}</div>
                </div>
             )}
          </div>
          
          {/* Fill background effect */}
          <div className="absolute bottom-0 left-0 w-full bg-primary-500/10 transition-all duration-100 ease-linear" style={{ height: `${(clicks / 120) * 100}%` }}></div>
       </button>
       
       {finished && (
          <button onClick={reset} className="btn-secondary w-full mt-6">Try Again</button>
       )}
    </div>
  );
};

export default CpsTest;