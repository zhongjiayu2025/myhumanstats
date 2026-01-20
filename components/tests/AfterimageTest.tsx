import React, { useState, useEffect } from 'react';
import { Sun, Eye, Timer } from 'lucide-react';
import { saveStat } from '../../lib/core';

const AfterimageTest: React.FC = () => {
  const [phase, setPhase] = useState<'intro' | 'stare' | 'reveal' | 'result'>('intro');
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    let timer: number;
    if (phase === 'stare' && timeLeft > 0) {
      timer = window.setTimeout(() => setTimeLeft(t => t - 1), 1000);
    } else if (phase === 'stare' && timeLeft === 0) {
      setPhase('reveal');
      setTimeout(() => setPhase('result'), 5000); // Auto move to result after 5s of reveal
      saveStat('afterimage-test', 100); // Completion score
    }
    return () => clearTimeout(timer);
  }, [phase, timeLeft]);

  return (
    <div className="max-w-2xl mx-auto text-center select-none">
       {phase === 'intro' && (
          <div className="py-12 animate-in fade-in zoom-in">
             <Sun size={64} className="mx-auto text-amber-500 mb-6" />
             <h2 className="text-3xl font-bold text-white mb-2">Afterimage Test</h2>
             <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                Experience a <strong>Negative Afterimage Illusion</strong>. 
                Focus on the image for 30 seconds. When the screen turns white, you will see the "ghost" image in its true colors due to retina fatigue.
             </p>
             <button onClick={() => setPhase('stare')} className="btn-primary">
                Start Illusion
             </button>
          </div>
       )}

       {phase === 'stare' && (
          <div className="flex flex-col items-center">
             <div className="text-xl font-mono text-white mb-4 flex items-center gap-2">
                <Timer className="animate-pulse text-primary-500" />
                STARE AT THE DOT: {timeLeft}s
             </div>
             
             {/* The Negative Image - A cyan/magenta inverted version of a simple shape, or just a bright colored dot */}
             <div className="w-64 h-64 bg-white rounded-full flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-cyan-500"></div> {/* Inverted Red */}
                <div className="w-4 h-4 bg-black rounded-full z-10"></div> {/* Fixation point */}
                <div className="absolute bottom-10 text-black font-black text-4xl invert">HELLO</div>
             </div>
             
             <p className="text-zinc-500 mt-8 text-sm animate-pulse">
                Do not blink. Keep your eyes fixed on the center dot.
             </p>
          </div>
       )}

       {phase === 'reveal' && (
          <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center cursor-pointer" onClick={() => setPhase('result')}>
             <div className="w-4 h-4 bg-black/10 rounded-full mb-8"></div>
             <p className="text-black font-mono text-lg tracking-widest">BLINK YOUR EYES FAST</p>
             <p className="text-black/30 text-xs mt-4">(Click to finish)</p>
          </div>
       )}

       {phase === 'result' && (
          <div className="py-12 animate-in fade-in">
             <Eye size={64} className="mx-auto text-primary-500 mb-6" />
             <h2 className="text-2xl font-bold text-white mb-4">Did you see the Ghost Image?</h2>
             <p className="text-zinc-400 mb-8 max-w-lg mx-auto">
                This <strong>Optical Illusion Test</strong> demonstrates how your cone cells adapt to constant stimulation. When the stimulus is removed, the fatigued cells trigger a <strong>Negative Afterimage</strong> in the complementary color.
             </p>
             <button onClick={() => { setPhase('intro'); setTimeLeft(30); }} className="btn-secondary">
                Try Again
             </button>
          </div>
       )}
    </div>
  );
};

export default AfterimageTest;