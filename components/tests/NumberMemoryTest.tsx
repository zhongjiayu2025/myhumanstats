import React, { useState, useEffect } from 'react';
import { Hash, ArrowRight, Delete, RotateCcw, Clock } from 'lucide-react';
import { saveStat } from '../../lib/core';

const NumberMemoryTest: React.FC = () => {
  const [level, setLevel] = useState(1);
  const [phase, setPhase] = useState<'intro' | 'memorize' | 'input' | 'result'>('intro');
  const [number, setNumber] = useState('');
  const [input, setInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [maxTime, setMaxTime] = useState(0);

  const startLevel = (lvl: number) => {
    const length = lvl + 2; 
    let num = '';
    for(let i=0; i<length; i++) {
        num += Math.floor(Math.random() * 10);
    }
    
    setNumber(num);
    setInput('');
    setPhase('memorize');
    
    // Time algorithm: Base 1.5s + 0.5s per digit
    const duration = 1500 + (length * 600);
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

  const handleKeypad = (val: string) => {
      // Simple haptic
      if (navigator.vibrate) navigator.vibrate(5);

      if (val === 'back') {
          setInput(prev => prev.slice(0, -1));
      } else if (val === 'submit') {
          submitAnswer();
      } else {
          setInput(prev => prev + val);
      }
  };

  // Physical Keyboard Support
  useEffect(() => {
      const handleKey = (e: KeyboardEvent) => {
          if (phase !== 'input') return;
          if (e.key >= '0' && e.key <= '9') handleKeypad(e.key);
          if (e.key === 'Backspace') handleKeypad('back');
          if (e.key === 'Enter') handleKeypad('submit');
      };
      window.addEventListener('keydown', handleKey);
      return () => window.removeEventListener('keydown', handleKey);
  }, [phase, input]);

  const submitAnswer = () => {
      if (input === number) {
          setLevel(l => l + 1);
          // Short delay to show success?
          setTimeout(() => startLevel(level + 1), 200);
      } else {
          saveStat('number-memory', level);
          setPhase('result');
      }
  };

  const startGame = () => {
      setLevel(1);
      startLevel(1);
  };

  // Chunking helper: 1234567 -> 123 456 7
  const chunkNumber = (num: string) => {
      return num.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  // Render Diff: Compare Correct vs User Input char by char
  const renderDiff = () => {
      const correctChars = number.split('');
      const inputChars = input.split('');
      
      return (
          <div className="flex flex-col gap-4 font-mono text-xl tracking-widest bg-black p-6 rounded-xl border border-zinc-800">
              <div className="text-left">
                  <div className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Target Sequence</div>
                  <div className="text-emerald-400">{number}</div>
              </div>
              
              <div className="h-px bg-zinc-800 w-full"></div>
              
              <div className="text-left">
                  <div className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Your Input</div>
                  <div>
                      {inputChars.map((char, i) => (
                          <span key={i} className={char === correctChars[i] ? 'text-white' : 'text-red-500 line-through decoration-red-500/50'}>
                              {char}
                          </span>
                      ))}
                      {/* Missing chars */}
                      {number.length > input.length && (
                          <span className="text-zinc-600 opacity-50">
                              {'_'.repeat(number.length - input.length)}
                          </span>
                      )}
                  </div>
              </div>
          </div>
      );
  };

  return (
    <div className="max-w-md mx-auto text-center select-none min-h-[500px] flex flex-col justify-center">
      
      {phase === 'intro' && (
          <div className="animate-in fade-in zoom-in">
             <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-zinc-800 shadow-inner">
                 <Hash size={32} className="text-primary-500" />
             </div>
             <h2 className="text-3xl font-bold text-white mb-2">Number Memory</h2>
             <p className="text-zinc-400 text-sm max-w-xs mx-auto mb-8">
                The average human can hold 7 digits in their working memory. How many can you store?
             </p>
             <button onClick={startGame} className="btn-primary w-full">
                 Start Test
             </button>
          </div>
      )}

      {phase === 'memorize' && (
          <div className="w-full">
              <div className="flex justify-between items-center mb-12 px-4">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Level {level}</div>
                  <div className="flex items-center gap-2 text-zinc-500 font-mono text-xs">
                      <Clock size={12} />
                      <span>{(timeLeft/1000).toFixed(1)}s</span>
                  </div>
              </div>
              
              <div className="text-5xl md:text-6xl font-mono font-bold text-white mb-16 tracking-widest text-glow break-all leading-tight">
                  {chunkNumber(number)}
              </div>
              
              {/* Urgency Bar */}
              <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-75 ease-linear ${timeLeft < 1000 ? 'bg-red-500' : timeLeft < 3000 ? 'bg-yellow-500' : 'bg-primary-500'}`} 
                    style={{ width: `${(timeLeft / maxTime) * 100}%` }}
                  ></div>
              </div>
          </div>
      )}

      {phase === 'input' && (
          <div className="w-full animate-in slide-in-from-bottom-8">
              <div className="text-zinc-400 mb-6 text-sm font-mono uppercase tracking-widest">Input Sequence</div>
              
              {/* Display Area */}
              <div className="bg-black border-b-2 border-primary-500/50 p-4 mb-8 min-h-[70px] flex items-center justify-center relative overflow-hidden">
                  <span className="text-3xl font-mono text-white tracking-widest">
                      {chunkNumber(input)}
                      <span className="animate-pulse text-primary-500 ml-1">_</span>
                  </span>
              </div>

              {/* Cyber Keypad */}
              <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                      <button 
                        key={n} 
                        onClick={() => handleKeypad(n.toString())}
                        className="h-16 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 hover:border-primary-500/50 rounded-sm text-2xl font-mono text-white active:scale-95 transition-all shadow-[0_4px_0_#000] active:shadow-none active:translate-y-[4px]"
                      >
                          {n}
                      </button>
                  ))}
                  <button 
                    onClick={() => handleKeypad('back')}
                    className="h-16 bg-red-900/20 hover:bg-red-900/40 border border-red-900/50 rounded-sm flex items-center justify-center text-red-400 active:scale-95 transition-all shadow-[0_4px_0_#000] active:shadow-none active:translate-y-[4px]"
                  >
                      <Delete size={20} />
                  </button>
                  <button 
                    onClick={() => handleKeypad('0')}
                    className="h-16 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 hover:border-primary-500/50 rounded-sm text-2xl font-mono text-white active:scale-95 transition-all shadow-[0_4px_0_#000] active:shadow-none active:translate-y-[4px]"
                  >
                      0
                  </button>
                  <button 
                    onClick={() => handleKeypad('submit')}
                    className="h-16 bg-primary-600 hover:bg-primary-500 rounded-sm flex items-center justify-center text-black active:scale-95 transition-all shadow-[0_4px_0_#000] active:shadow-none active:translate-y-[4px]"
                  >
                      <ArrowRight size={24} />
                  </button>
              </div>
          </div>
      )}

      {phase === 'result' && (
          <div className="animate-in fade-in zoom-in">
              <div className="text-zinc-500 font-mono text-xs uppercase mb-2">Memory Capacity</div>
              <div className="text-6xl font-bold text-white mb-2">{level} <span className="text-xl text-zinc-600">Digits</span></div>
              <p className="text-zinc-400 text-sm mb-8">
                  {level > 12 ? "Genius Level." : level > 7 ? "Above Average." : "Average."}
              </p>

              <div className="mb-8">
                  {renderDiff()}
              </div>

              <button onClick={startGame} className="btn-secondary flex items-center gap-2 mx-auto">
                  <RotateCcw size={16} /> Try Again
              </button>
          </div>
      )}

    </div>
  );
};

export default NumberMemoryTest;