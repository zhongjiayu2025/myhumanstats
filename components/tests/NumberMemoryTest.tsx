import React, { useState, useEffect, useRef } from 'react';
import { Hash, Check, X, Play, ArrowRight, Brain } from 'lucide-react';
import { saveStat } from '../../lib/core';

const NumberMemoryTest: React.FC = () => {
  const [level, setLevel] = useState(1);
  const [phase, setPhase] = useState<'intro' | 'memorize' | 'input' | 'result'>('intro');
  const [number, setNumber] = useState('');
  const [input, setInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [maxTime, setMaxTime] = useState(0);

  const progressBarRef = useRef<number>(0);

  const startLevel = (lvl: number) => {
    // Generate number: level 1 = 1 digit, level 2 = 2 digits...
    // Actually standard starts at ~3 digits usually, let's start at 3 for level 1
    const length = lvl + 2; 
    let num = '';
    for(let i=0; i<length; i++) {
        num += Math.floor(Math.random() * 10);
    }
    
    setNumber(num);
    setInput('');
    setPhase('memorize');
    
    // Time to memorize: 1000ms + 500ms per digit roughly? 
    // Or constant time? Standard is ~2-3 seconds usually.
    // Let's do: 1500ms + (length * 500ms)
    const duration = 1000 + (length * 600);
    setMaxTime(duration);
    setTimeLeft(duration);
  };

  useEffect(() => {
    let interval: number;
    if (phase === 'memorize') {
        const start = performance.now();
        interval = window.setInterval(() => {
            const elapsed = performance.now() - start;
            const remaining = Math.max(0, maxTime - elapsed);
            setTimeLeft(remaining);
            if (remaining <= 0) {
                setPhase('input');
            }
        }, 16);
    }
    return () => clearInterval(interval);
  }, [phase, maxTime]);

  const handleSubmit = (e?: React.FormEvent) => {
      e?.preventDefault();
      if (input === number) {
          // Correct
          setPhase('intro'); // Temporary state or toast?
          // Direct transition to next level text
          setLevel(l => l + 1);
          setTimeout(() => startLevel(level + 1), 200); // Short delay
      } else {
          // Wrong
          saveStat('number-memory', level);
          setPhase('result');
      }
  };

  const startGame = () => {
      setLevel(1);
      startLevel(1);
  };

  return (
    <div className="max-w-2xl mx-auto text-center select-none min-h-[400px] flex flex-col justify-center">
      
      {phase === 'intro' && (
          <div className="animate-in fade-in zoom-in">
             <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-zinc-800 shadow-inner">
                 <Hash size={32} className="text-primary-500" />
             </div>
             <h2 className="text-3xl font-bold text-white mb-2">Number Memory Test</h2>
             <p className="text-zinc-400 text-sm max-w-md mx-auto mb-8">
                The average human can hold 7 digits in their working memory. How many can you store?
             </p>
             <button onClick={startGame} className="btn-primary w-full max-w-xs">
                 Start Test
             </button>
          </div>
      )}

      {phase === 'memorize' && (
          <div className="w-full">
              <div className="text-8xl font-mono font-bold text-white mb-12 tracking-widest text-glow">
                  {number}
              </div>
              
              <div className="w-full max-w-md mx-auto h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-500" 
                    style={{ width: `${(timeLeft / maxTime) * 100}%` }}
                  ></div>
              </div>
              <div className="mt-4 text-zinc-500 font-mono text-xs uppercase tracking-widest">Memorize</div>
          </div>
      )}

      {phase === 'input' && (
          <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto animate-in slide-in-from-bottom-4">
              <div className="text-zinc-400 mb-4 text-sm">What was the number?</div>
              <div className="flex gap-2">
                  <input 
                    type="text" 
                    pattern="[0-9]*" 
                    inputMode="numeric"
                    autoFocus
                    value={input}
                    onChange={(e) => setInput(e.target.value.replace(/[^0-9]/g, ''))}
                    className="flex-1 bg-black border border-zinc-700 p-4 text-center text-3xl font-mono text-white focus:border-primary-500 focus:outline-none rounded-l-md"
                  />
                  <button type="submit" className="bg-primary-600 hover:bg-primary-500 text-black px-6 rounded-r-md font-bold">
                      <ArrowRight />
                  </button>
              </div>
              <div className="mt-4 text-xs text-zinc-600 font-mono">PRESS ENTER TO SUBMIT</div>
          </form>
      )}

      {phase === 'result' && (
          <div className="animate-in fade-in zoom-in">
              <div className="text-zinc-500 font-mono text-xs uppercase mb-2">Number Memory</div>
              <div className="text-6xl font-bold text-white mb-2">Level {level}</div>
              <p className="text-zinc-400 mb-8">
                  {level > 12 ? "Genius Level." : level > 7 ? "Above Average." : "Average."}
              </p>

              <div className="bg-zinc-900/50 p-6 border border-zinc-800 rounded-lg max-w-sm mx-auto mb-8 text-left space-y-4">
                  <div>
                      <div className="text-[10px] text-zinc-500 uppercase">Correct Number</div>
                      <div className="font-mono text-xl text-emerald-500 tracking-wider break-all">{number}</div>
                  </div>
                  <div>
                      <div className="text-[10px] text-zinc-500 uppercase">Your Answer</div>
                      <div className="font-mono text-xl text-red-500 tracking-wider line-through decoration-red-500/50 break-all">{input}</div>
                  </div>
              </div>

              <button onClick={startGame} className="btn-secondary">
                  Try Again
              </button>
          </div>
      )}

    </div>
  );
};

export default NumberMemoryTest;