import React, { useState } from 'react';
import { Contrast, ArrowRight } from 'lucide-react';
import { saveStat } from '../../lib/core';

const LETTERS = ['C', 'O', 'D', 'H', 'K', 'N', 'R', 'S', 'V', 'Z'];

const ContrastTest: React.FC = () => {
  const [phase, setPhase] = useState<'intro' | 'test' | 'result'>('intro');
  const [level, setLevel] = useState(1);
  const [currentLetter, setCurrentLetter] = useState('C');
  const [options, setOptions] = useState<string[]>([]);
  
  // Opacity decreases as level increases (1.0 down to 0.005)
  const getOpacity = (lvl: number) => {
      // Exponential decay
      return Math.max(0.005, 0.2 * Math.pow(0.7, lvl - 1));
  };

  const startLevel = (lvl: number) => {
      const letter = LETTERS[Math.floor(Math.random() * LETTERS.length)];
      setCurrentLetter(letter);
      
      // Generate options including correct one
      const opts = new Set<string>();
      opts.add(letter);
      while(opts.size < 4) {
          opts.add(LETTERS[Math.floor(Math.random() * LETTERS.length)]);
      }
      setOptions(Array.from(opts).sort());
      setPhase('test');
  };

  const handleGuess = (guess: string) => {
      if (guess === currentLetter) {
          if (level < 20) {
              setLevel(l => l + 1);
              startLevel(level + 1);
          } else {
              finish(true);
          }
      } else {
          finish(false);
      }
  };

  const finish = (win: boolean) => {
      setPhase('result');
      // Score based on level. Normal contrast sensitivity usually allows seeing down to ~1-2%
      // Level 10 ~ 0.8%. 
      const score = Math.min(100, level * 5); 
      saveStat('contrast-test', score);
  };

  return (
    <div className="max-w-xl mx-auto text-center select-none">
       {phase === 'intro' && (
           <div className="py-12 animate-in fade-in">
               <Contrast size={64} className="mx-auto text-zinc-600 mb-6" />
               <h2 className="text-3xl font-bold text-white mb-2">Contrast Sensitivity</h2>
               <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                   Can you see the hidden letters?
                   <br/>The letters will become increasingly faint (lower contrast) against the grey background.
               </p>
               <button onClick={() => startLevel(1)} className="btn-primary">Start</button>
           </div>
       )}

       {phase === 'test' && (
           <div className="py-8">
               <div className="relative w-64 h-64 bg-[#808080] rounded-full mx-auto mb-12 flex items-center justify-center border-4 border-zinc-800 shadow-xl overflow-hidden">
                   {/* The faint letter */}
                   <span 
                      className="text-9xl font-sans font-bold select-none pointer-events-none"
                      style={{ 
                          color: '#000000', 
                          opacity: getOpacity(level)
                      }}
                   >
                       {currentLetter}
                   </span>
               </div>

               <div className="grid grid-cols-4 gap-4">
                   {options.map(opt => (
                       <button 
                          key={opt}
                          onClick={() => handleGuess(opt)}
                          className="h-16 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-2xl font-bold text-white rounded transition-colors"
                       >
                           {opt}
                       </button>
                   ))}
               </div>
               
               <div className="mt-8 text-xs text-zinc-500 font-mono">
                   CONTRAST LEVEL: {(getOpacity(level) * 100).toFixed(2)}%
               </div>
           </div>
       )}

       {phase === 'result' && (
           <div className="py-12 animate-in zoom-in">
               <div className="text-6xl font-bold text-white mb-2">Lvl {level}</div>
               <h2 className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-6">Sensitivity Limit Reached</h2>
               <p className="text-zinc-400 mb-8">
                   You detected contrast down to <strong>{(getOpacity(level) * 100).toFixed(2)}%</strong> opacity.
               </p>
               <button onClick={() => { setLevel(1); setPhase('intro'); }} className="btn-secondary">
                   Retake Test
               </button>
           </div>
       )}
    </div>
  );
};

export default ContrastTest;