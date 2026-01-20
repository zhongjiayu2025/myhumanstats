import React, { useState, useEffect, useRef } from 'react';
import { Crosshair, Trophy, MousePointer2 } from 'lucide-react';
import { saveStat } from '../../lib/core';

interface TargetObj {
  id: number;
  x: number; // Percentage
  y: number; // Percentage
  born: number; // timestamp
}

const AimTrainerTest: React.FC = () => {
  const [phase, setPhase] = useState<'intro' | 'play' | 'result'>('intro');
  const [targets, setTargets] = useState<TargetObj[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [totalClicks, setTotalClicks] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);

  const SPAWN_LIMIT = 30; // 30 seconds game

  const startGame = () => {
      setScore(0);
      setTotalClicks(0);
      setReactionTimes([]);
      setTimeLeft(SPAWN_LIMIT);
      setTargets([]);
      setPhase('play');
      
      // Spawn first target
      spawnTarget();
  };

  const spawnTarget = () => {
      const newTarget: TargetObj = {
          id: Math.random(),
          x: Math.random() * 90 + 5, // Keep within 5-95% to avoid edge clipping
          y: Math.random() * 80 + 10,
          born: performance.now()
      };
      // For this simplified version, only 1 target at a time to measure raw reaction + precision
      setTargets([newTarget]);
  };

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

  const handleBackgroundClick = () => {
      if (phase === 'play') {
          setTotalClicks(c => c + 1);
          // Missed shot logic could go here
      }
  };

  const handleTargetClick = (e: React.MouseEvent, t: TargetObj) => {
      e.stopPropagation();
      if (phase !== 'play') return;
      
      const now = performance.now();
      const reaction = now - t.born;
      
      setScore(s => s + 1);
      setTotalClicks(c => c + 1);
      setReactionTimes(prev => [...prev, reaction]);
      
      spawnTarget();
  };

  const finish = () => {
      setPhase('result');
      // Normalize score for dashboard. 30 hits in 30s = 1 hit/sec. Pro gamers > 60.
      // 60 hits -> 100 score.
      const normalizedScore = Math.min(100, Math.round((score / 50) * 100));
      saveStat('aim-trainer', normalizedScore);
  };

  const avgReaction = reactionTimes.length > 0 
      ? Math.round(reactionTimes.reduce((a,b) => a+b, 0) / reactionTimes.length) 
      : 0;

  const accuracy = totalClicks > 0 ? Math.round((score / totalClicks) * 100) : 0;

  return (
    <div className="w-full max-w-4xl mx-auto select-none">
       {phase === 'intro' && (
           <div className="max-w-xl mx-auto text-center py-12 animate-in fade-in zoom-in">
               <div className="w-24 h-24 bg-zinc-900 border border-zinc-700 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                   <Crosshair size={48} className="text-primary-500" />
                   <div className="absolute inset-0 border-2 border-primary-500/30 rounded-full animate-ping"></div>
               </div>
               <h2 className="text-3xl font-bold text-white mb-2">Aim Trainer</h2>
               <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                   Test your reflexes and hand-eye coordination. Click the targets as quickly as possible. You have 30 seconds.
               </p>
               <button onClick={startGame} className="btn-primary flex items-center gap-2 mx-auto">
                   <MousePointer2 size={18} /> Start Training
               </button>
           </div>
       )}

       {phase === 'play' && (
           <div className="relative">
               {/* HUD */}
               <div className="flex justify-between items-center mb-4 bg-black border border-zinc-800 p-4 clip-corner-sm">
                   <div className="flex gap-8">
                       <div>
                           <div className="text-[10px] text-zinc-500 uppercase">Time</div>
                           <div className="text-2xl font-mono text-white">{timeLeft}s</div>
                       </div>
                       <div>
                           <div className="text-[10px] text-zinc-500 uppercase">Hits</div>
                           <div className="text-2xl font-mono text-primary-400">{score}</div>
                       </div>
                   </div>
                   <div className="text-right">
                       <div className="text-[10px] text-zinc-500 uppercase">Avg Time</div>
                       <div className="text-xl font-mono text-zinc-300">{avgReaction}ms</div>
                   </div>
               </div>

               {/* Game Area */}
               <div 
                  ref={containerRef}
                  onMouseDown={handleBackgroundClick}
                  className="w-full h-[500px] bg-zinc-950 border border-zinc-800 relative overflow-hidden cursor-crosshair shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]"
               >
                   {/* Grid Lines */}
                   <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none"></div>

                   {targets.map(t => (
                       <div
                          key={t.id}
                          onMouseDown={(e) => handleTargetClick(e, t)}
                          className="absolute w-12 h-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary-500 bg-primary-500/20 flex items-center justify-center cursor-pointer hover:bg-primary-400 active:scale-90 transition-transform duration-75 group z-10"
                          style={{ left: `${t.x}%`, top: `${t.y}%` }}
                       >
                           <div className="w-2 h-2 bg-primary-200 rounded-full group-hover:w-4 group-hover:h-4 transition-all"></div>
                           <div className="absolute w-full h-full border border-primary-500 rounded-full animate-ping opacity-50"></div>
                       </div>
                   ))}
               </div>
           </div>
       )}

       {phase === 'result' && (
           <div className="max-w-xl mx-auto text-center py-12 animate-in fade-in slide-in-from-bottom-8">
               <Trophy size={64} className="mx-auto text-yellow-500 mb-6" />
               <h2 className="text-3xl font-bold text-white mb-8">Training Complete</h2>

               <div className="grid grid-cols-3 gap-4 mb-8">
                   <div className="bg-zinc-900 border border-zinc-800 p-4 rounded">
                       <div className="text-xs text-zinc-500 uppercase mb-1">Targets</div>
                       <div className="text-3xl font-bold text-white">{score}</div>
                   </div>
                   <div className="bg-zinc-900 border border-zinc-800 p-4 rounded">
                       <div className="text-xs text-zinc-500 uppercase mb-1">Accuracy</div>
                       <div className={`text-3xl font-bold ${accuracy > 90 ? 'text-emerald-500' : 'text-yellow-500'}`}>{accuracy}%</div>
                   </div>
                   <div className="bg-zinc-900 border border-zinc-800 p-4 rounded">
                       <div className="text-xs text-zinc-500 uppercase mb-1">Reaction</div>
                       <div className="text-3xl font-bold text-primary-400">{avgReaction}<span className="text-sm">ms</span></div>
                   </div>
               </div>

               <button onClick={startGame} className="btn-secondary w-full">
                   Restart Round
               </button>
           </div>
       )}
    </div>
  );
};

export default AimTrainerTest;