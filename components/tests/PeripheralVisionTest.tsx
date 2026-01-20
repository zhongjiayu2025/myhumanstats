import React, { useState, useEffect, useRef } from 'react';
import { Eye, MousePointer2 } from 'lucide-react';
import { saveStat } from '../../lib/core';

const PeripheralVisionTest: React.FC = () => {
  const [phase, setPhase] = useState<'intro' | 'test' | 'result'>('intro');
  const [score, setScore] = useState(0);
  const [targetsHit, setTargetsHit] = useState(0);
  const [missed, setMissed] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const [targetPos, setTargetPos] = useState<{top: number, left: number} | null>(null);
  const [isFixated, setIsFixated] = useState(true); // Hovering center

  // Game Logic
  const spawnTimer = useRef<number | null>(null);
  
  const startGame = () => {
      setScore(0);
      setTargetsHit(0);
      setMissed(0);
      setPhase('test');
      spawnNext();
  };

  const spawnNext = () => {
      if (spawnTimer.current) clearTimeout(spawnTimer.current);
      
      const delay = 1000 + Math.random() * 2000;
      spawnTimer.current = window.setTimeout(() => {
          if (Math.random() > 0.9) {
             // 10% chance to finish test after some time? No, let's fix count.
          }
          
          // Random position on edge circle
          const angle = Math.random() * Math.PI * 2;
          const radius = 40 + Math.random() * 5; // 40-45% from center (Periphery)
          
          const left = 50 + Math.cos(angle) * radius;
          const top = 50 + Math.sin(angle) * radius;
          
          setTargetPos({ top, left });
          
          // Auto miss if not clicked in 1.5s
          setTimeout(() => {
              setTargetPos(prev => {
                  if (prev && prev.top === top) { // If still same target
                      handleMiss();
                      return null; 
                  }
                  return prev;
              });
          }, 1500);

      }, delay);
  };

  const handleClickTarget = (e: React.MouseEvent) => {
      e.stopPropagation();
      setTargetsHit(h => h + 1);
      setTargetPos(null);
      
      if (targetsHit + 1 >= 10) {
          finish();
      } else {
          spawnNext();
      }
  };

  const handleMiss = () => {
      setMissed(m => m + 1);
      setTargetPos(null);
      if (targetsHit + missed + 1 >= 10) {
          finish();
      } else {
          spawnNext();
      }
  };

  const finish = () => {
      setPhase('result');
      const total = targetsHit + missed;
      const finalScore = total > 0 ? Math.round((targetsHit / total) * 100) : 0;
      saveStat('peripheral-vision', finalScore);
  };

  return (
    <div className="max-w-3xl mx-auto text-center select-none">
       {phase === 'intro' && (
           <div className="py-12 animate-in fade-in">
               <Eye size={64} className="mx-auto text-zinc-600 mb-6" />
               <h2 className="text-3xl font-bold text-white mb-2">Peripheral Vision Test</h2>
               <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                   Test your visual field awareness. 
                   <br/>Keep your mouse cursor and eyes on the <strong>Center Cross</strong>.
                   <br/>Click the flashing dots that appear in your peripheral vision <strong>without moving your eyes</strong>.
               </p>
               <button onClick={startGame} className="btn-primary">Start Field Test</button>
           </div>
       )}

       {phase === 'test' && (
           <div className="relative w-full aspect-video bg-black border border-zinc-800 rounded-xl overflow-hidden cursor-none" ref={containerRef}>
               {/* Grid */}
               <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:100px_100px]"></div>

               {/* Fixation Point */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-12 h-12 border-2 border-zinc-700 rounded-full z-20">
                   <div className="w-1 h-4 bg-primary-500"></div>
                   <div className="h-1 w-4 bg-primary-500 absolute"></div>
               </div>
               
               {/* Target */}
               {targetPos && (
                   <div 
                      onMouseDown={handleClickTarget}
                      className="absolute w-8 h-8 bg-white rounded-full shadow-[0_0_20px_white] animate-pulse cursor-pointer z-30 hover:scale-125 transition-transform"
                      style={{ top: `${targetPos.top}%`, left: `${targetPos.left}%`, transform: 'translate(-50%, -50%)' }}
                   ></div>
               )}

               <div className="absolute bottom-4 left-4 text-xs font-mono text-zinc-500">
                   HITS: {targetsHit} | MISSED: {missed}
               </div>
           </div>
       )}

       {phase === 'result' && (
           <div className="py-12 animate-in zoom-in">
               <div className="text-6xl font-bold text-white mb-2">{Math.round((targetsHit / (targetsHit + missed)) * 100)}%</div>
               <h2 className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-6">Field Awareness Score</h2>
               
               <button onClick={startGame} className="btn-secondary">
                   Retake Test
               </button>
           </div>
       )}
    </div>
  );
};

export default PeripheralVisionTest;