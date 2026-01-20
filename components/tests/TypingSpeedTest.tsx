import React, { useState, useEffect, useRef } from 'react';
import { Keyboard, RotateCcw, Terminal } from 'lucide-react';
import { saveStat } from '../../lib/core';

const WORDS = [
  "system", "data", "human", "interface", "neural", "network", "protocol", "access",
  "bandwidth", "latency", "cipher", "matrix", "algorithm", "binary", "quantum",
  "logic", "visual", "audio", "cognitive", "status", "online", "buffer", "cache",
  "daemon", "encrypt", "firewall", "grid", "hacker", "input", "kernel", "linux",
  "module", "node", "output", "pixel", "query", "root", "server", "token", "user",
  "vector", "widget", "xenon", "yield", "zero", "abort", "block", "click", "drive"
];

const generateText = (count: number) => {
  const selection = [];
  for(let i=0; i<count; i++) {
    selection.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
  }
  return selection.join(' ');
};

const TypingSpeedTest: React.FC = () => {
  const [phase, setPhase] = useState<'idle' | 'typing' | 'result'>('idle');
  const [text, setText] = useState('');
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setText(generateText(20)); // Generate 20 words batch
  }, []);

  // Auto-focus input
  useEffect(() => {
      if (phase === 'typing' || phase === 'idle') {
          inputRef.current?.focus();
      }
  }, [phase]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      
      if (phase === 'idle' && val.length === 1) {
          setPhase('typing');
          setStartTime(Date.now());
      }

      if (phase === 'result') return;

      setInput(val);

      // Check if finished
      if (val.length >= text.length) {
          finish(val);
      }
  };

  const finish = (finalInput: string) => {
      setPhase('result');
      const endTime = Date.now();
      const durationMin = (endTime - startTime) / 60000;
      
      // Calculate Accuracy
      let correct = 0;
      for(let i=0; i<text.length; i++) {
          if (finalInput[i] === text[i]) correct++;
      }
      const acc = Math.round((correct / text.length) * 100);
      setAccuracy(acc);

      // Calculate WPM (Standard: 5 chars = 1 word)
      const grossWpm = (text.length / 5) / durationMin;
      const netWpm = Math.round(grossWpm * (acc / 100));
      
      setWpm(netWpm);
      
      // Score 0-100. Average is 40. Pro is 100.
      // 100 WPM = 100 Score.
      const score = Math.min(100, netWpm);
      saveStat('typing-speed-test', score);
  };

  const reset = () => {
      setText(generateText(20));
      setInput('');
      setPhase('idle');
      setWpm(0);
      setAccuracy(100);
  };

  // Render helpers
  const renderText = () => {
      return text.split('').map((char, i) => {
          let color = 'text-zinc-500';
          if (i < input.length) {
              color = input[i] === char ? 'text-white' : 'text-red-500 bg-red-900/30';
          }
          return <span key={i} className={color}>{char}</span>;
      });
  };

  return (
    <div className="max-w-3xl mx-auto select-none" onClick={() => inputRef.current?.focus()}>
       
       {/* HUD */}
       <div className="flex justify-between items-end mb-8 border-b border-zinc-800 pb-4">
           <div className="flex items-center gap-3">
               <div className="p-2 bg-zinc-900 border border-zinc-800 rounded">
                   <Keyboard size={20} className="text-zinc-400" />
               </div>
               <div>
                   <div className="text-[10px] text-zinc-500 font-mono uppercase">Status</div>
                   <div className={`text-sm font-bold font-mono ${phase === 'typing' ? 'text-primary-400 animate-pulse' : 'text-white'}`}>
                       {phase === 'idle' ? 'WAITING FOR INPUT' : phase === 'typing' ? 'RECORDING...' : 'COMPLETE'}
                   </div>
               </div>
           </div>
           
           {phase === 'result' && (
               <div className="text-right animate-in slide-in-from-right">
                   <div className="text-[10px] text-zinc-500 font-mono uppercase">Result</div>
                   <div className="text-2xl font-bold text-white font-mono">{wpm} WPM</div>
               </div>
           )}
       </div>

       {/* Typing Area */}
       <div className="relative font-mono text-2xl leading-relaxed break-all min-h-[150px] bg-black/50 p-8 border border-zinc-800 rounded-lg shadow-inner">
           <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
           
           <div className="relative z-10">
               {renderText()}
               {/* Cursor */}
               {phase !== 'result' && (
                   <span className="inline-block w-2.5 h-6 bg-primary-500 align-middle animate-pulse ml-0.5"></span>
               )}
           </div>

           <input 
              ref={inputRef}
              type="text" 
              value={input}
              onChange={handleInput}
              className="absolute opacity-0 inset-0 cursor-text"
              autoFocus
              disabled={phase === 'result'}
           />
       </div>

       {/* Footer / Results */}
       {phase === 'result' ? (
           <div className="mt-8 flex items-center justify-between animate-in fade-in">
               <div className="grid grid-cols-2 gap-8">
                   <div>
                       <div className="text-xs text-zinc-500 uppercase">Accuracy</div>
                       <div className={`text-xl font-mono font-bold ${accuracy > 95 ? 'text-emerald-500' : 'text-yellow-500'}`}>{accuracy}%</div>
                   </div>
                   <div>
                       <div className="text-xs text-zinc-500 uppercase">Speed</div>
                       <div className="text-xl font-mono font-bold text-white">{wpm} WPM</div>
                   </div>
               </div>
               <button onClick={reset} className="btn-secondary flex items-center gap-2">
                   <RotateCcw size={16} /> Restart
               </button>
           </div>
       ) : (
           <div className="mt-8 text-center">
               <div className="inline-flex items-center gap-2 text-xs text-zinc-600 font-mono bg-zinc-900 px-3 py-1 rounded-full">
                   <Terminal size={12} />
                   <span>Type the words above to begin</span>
               </div>
           </div>
       )}
    </div>
  );
};

export default TypingSpeedTest;