import React, { useState, useEffect, useRef } from 'react';
import { Keyboard, RotateCcw, Terminal, Activity, Quote, FileType, Flame } from 'lucide-react';
import { saveStat } from '../../lib/core';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const WORDS = [
  "system", "data", "human", "interface", "neural", "network", "protocol", "access",
  "bandwidth", "latency", "cipher", "matrix", "algorithm", "binary", "quantum",
  "logic", "visual", "audio", "cognitive", "status", "online", "buffer", "cache",
  "daemon", "encrypt", "firewall", "grid", "hacker", "input", "kernel", "linux",
  "module", "node", "output", "pixel", "query", "root", "server", "token", "user",
  "vector", "widget", "xenon", "yield", "zero", "abort", "block", "click", "drive"
];

const QUOTES = [
  "The only way to do great work is to love what you do.",
  "Technology is best when it brings people together.",
  "It's not a bug, it's a feature.",
  "Talk is cheap. Show me the code.",
  "Simplicity is the soul of efficiency.",
  "Before software can be reusable it first has to be usable.",
  "Knowledge is power.",
  "Any sufficiently advanced technology is indistinguishable from magic."
];

// QWERTY Layout for Visualizer
const KEYBOARD_LAYOUT = [
  "qwertyuiop",
  "asdfghjkl",
  "zxcvbnm"
];

const TypingSpeedTest: React.FC = () => {
  const [mode, setMode] = useState<'words' | 'quotes'>('words');
  const [phase, setPhase] = useState<'idle' | 'typing' | 'result'>('idle');
  const [text, setText] = useState('');
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  
  // Analytics
  const [wpmHistory, setWpmHistory] = useState<{time: number, wpm: number}[]>([]);
  const [missedKeys, setMissedKeys] = useState<Record<string, number>>({});
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const lastSampleTime = useRef<number>(0);

  useEffect(() => {
    reset();
  }, [mode]);

  // Generate text based on mode
  const initText = () => {
      if (mode === 'words') {
          const selection = [];
          for(let i=0; i<25; i++) selection.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
          setText(selection.join(' '));
      } else {
          setText(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
      }
  };

  // Auto-focus input
  useEffect(() => {
      if (phase === 'typing' || phase === 'idle') {
          inputRef.current?.focus();
      }
  }, [phase]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      const now = Date.now();
      const lastChar = val.slice(-1).toLowerCase();
      
      setActiveKey(lastChar);
      setTimeout(() => setActiveKey(null), 150);

      // Check correctness of last char
      if (val.length > input.length) {
          // User typed something new
          const expectedChar = text[val.length - 1];
          const typedChar = val[val.length - 1];
          
          if (typedChar === expectedChar) {
              setStreak(s => {
                  const newS = s + 1;
                  setMaxStreak(m => Math.max(m, newS));
                  return newS;
              });
          } else {
              setStreak(0);
              // Record miss
              const missKey = expectedChar.toLowerCase();
              setMissedKeys(prev => ({ ...prev, [missKey]: (prev[missKey] || 0) + 1 }));
          }
      } else {
          // User deleted something
          setStreak(0);
      }

      if (phase === 'idle' && val.length === 1) {
          setPhase('typing');
          setStartTime(now);
          lastSampleTime.current = now;
          setWpmHistory([{ time: 0, wpm: 0 }]);
      }

      if (phase === 'result') return;

      setInput(val);

      // Sample WPM every ~1s
      if (phase === 'typing' && now - lastSampleTime.current > 1000) {
          const durationMin = (now - startTime) / 60000;
          const currentWpm = Math.round((val.length / 5) / durationMin);
          setWpm(currentWpm);
          setWpmHistory(prev => [...prev, { 
              time: Math.round((now - startTime)/1000), 
              wpm: currentWpm 
          }]);
          lastSampleTime.current = now;
      }

      if (val.length >= text.length) {
          finish(val);
      }
  };

  const finish = (finalInput: string) => {
      const endTime = Date.now();
      const durationMin = (endTime - startTime) / 60000;
      
      let correct = 0;
      for(let i=0; i<text.length; i++) {
          if (finalInput[i] === text[i]) correct++;
      }
      const acc = Math.round((correct / text.length) * 100);
      setAccuracy(acc);

      const grossWpm = (text.length / 5) / durationMin;
      const netWpm = Math.round(grossWpm * (acc / 100));
      
      setWpm(netWpm);
      
      setWpmHistory(prev => [...prev, { 
          time: Math.round((endTime - startTime)/1000), 
          wpm: netWpm 
      }]);

      setPhase('result');
      const score = Math.min(100, netWpm);
      saveStat('typing-speed-test', score);
  };

  const reset = () => {
      initText();
      setInput('');
      setPhase('idle');
      setWpm(0);
      setAccuracy(100);
      setWpmHistory([]);
      setMissedKeys({});
      setStreak(0);
      setMaxStreak(0);
  };

  const renderText = () => {
      return text.split('').map((char, i) => {
          let color = 'text-zinc-600';
          let bg = '';
          if (i < input.length) {
              const isCorrect = input[i] === char;
              color = isCorrect ? 'text-white' : 'text-red-500';
              bg = isCorrect ? '' : 'bg-red-900/20';
          }
          if (i === input.length) return <span key={i} className="border-l-2 border-primary-500 animate-pulse pl-0.5">{char}</span>;
          
          return <span key={i} className={`${color} ${bg}`}>{char}</span>;
      });
  };

  return (
    <div className="max-w-3xl mx-auto select-none" onClick={() => inputRef.current?.focus()}>
       
       {/* Mode Switcher */}
       {phase === 'idle' && (
           <div className="flex justify-center mb-8 gap-4">
               <button 
                  onClick={(e) => { e.stopPropagation(); setMode('words'); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-mono transition-all ${mode === 'words' ? 'bg-primary-500 text-black border-primary-500' : 'bg-zinc-900 text-zinc-500 border-zinc-800'}`}
               >
                   <FileType size={14} /> Random Words
               </button>
               <button 
                  onClick={(e) => { e.stopPropagation(); setMode('quotes'); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-mono transition-all ${mode === 'quotes' ? 'bg-primary-500 text-black border-primary-500' : 'bg-zinc-900 text-zinc-500 border-zinc-800'}`}
               >
                   <Quote size={14} /> Quotes Mode
               </button>
           </div>
       )}

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
           
           {/* Real-time WPM Gauge / Streak */}
           <div className="flex items-center gap-6">
                {streak > 10 && (
                    <div className="hidden md:flex items-center gap-1 text-amber-500 animate-bounce">
                        <Flame size={16} fill="currentColor" />
                        <span className="font-bold font-mono text-sm">{streak}</span>
                    </div>
                )}
                
                <div className="text-right">
                   <div className="text-[10px] text-zinc-500 font-mono uppercase">Speed</div>
                   <div className="text-2xl font-bold text-white font-mono">{wpm} WPM</div>
                </div>
           </div>
       </div>

       {/* Typing Area */}
       <div className="relative font-mono text-xl md:text-2xl leading-relaxed break-words min-h-[180px] bg-black/50 p-8 border border-zinc-800 rounded-lg shadow-inner mb-8">
           <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
           
           <div className="relative z-10">
               {renderText()}
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

       {/* Virtual Keyboard (With Heatmap Logic) */}
       <div className="flex flex-col items-center gap-1 transform scale-90 md:scale-100 select-none">
           {KEYBOARD_LAYOUT.map((row, i) => (
               <div key={i} className="flex gap-1">
                   {row.split('').map(key => {
                       const mistakes = missedKeys[key] || 0;
                       // Heatmap Color Logic: 0 = zinc-900, 1 = yellow-900, 3+ = red-900
                       let bgClass = 'bg-zinc-900 border-zinc-800 text-zinc-600';
                       if (mistakes > 0 && mistakes < 3) bgClass = 'bg-yellow-900/30 border-yellow-700/50 text-yellow-500';
                       if (mistakes >= 3) bgClass = 'bg-red-900/30 border-red-700/50 text-red-500';
                       if (activeKey === key) bgClass = 'bg-primary-500 text-black border-primary-500 scale-95';

                       return (
                           <div 
                              key={key} 
                              className={`
                                  w-8 h-8 md:w-10 md:h-10 rounded flex items-center justify-center border text-sm font-bold uppercase transition-all duration-75
                                  ${bgClass}
                              `}
                           >
                               {key}
                           </div>
                       );
                   })}
               </div>
           ))}
           <div className={`w-48 h-8 rounded border mt-1 transition-colors duration-75 ${activeKey === ' ' ? 'bg-primary-500 border-primary-500' : 'bg-zinc-900 border-zinc-800'}`}></div>
       </div>

       {/* Results & Analysis */}
       {phase === 'result' && (
           <div className="mt-8 animate-in fade-in slide-in-from-bottom-4">
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                   <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded text-center">
                       <div className="text-[10px] text-zinc-500 uppercase font-mono">Accuracy</div>
                       <div className={`text-xl font-bold ${accuracy > 95 ? 'text-emerald-500' : 'text-yellow-500'}`}>{accuracy}%</div>
                   </div>
                   <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded text-center">
                       <div className="text-[10px] text-zinc-500 uppercase font-mono">Max Streak</div>
                       <div className="text-xl font-bold text-white">{maxStreak}</div>
                   </div>
                   <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded text-center">
                       <div className="text-[10px] text-zinc-500 uppercase font-mono">Time</div>
                       <div className="text-xl font-bold text-white">{wpmHistory[wpmHistory.length-1]?.time}s</div>
                   </div>
                   <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded text-center">
                       <div className="text-[10px] text-zinc-500 uppercase font-mono">Problem Keys</div>
                       <div className="text-xs text-red-400 font-mono mt-1">
                           {Object.keys(missedKeys).length > 0 ? Object.entries(missedKeys).sort((a: [string, number], b: [string, number]) => b[1]-a[1]).slice(0,3).map(k => k[0].toUpperCase()).join(' ') : 'None'}
                       </div>
                   </div>
               </div>

               {/* Chart */}
               <div className="h-64 w-full bg-zinc-900/30 border border-zinc-800 rounded-lg p-4 mb-8 relative">
                   <div className="absolute top-4 left-4 text-[10px] font-mono text-zinc-500 flex items-center gap-2">
                       <Activity size={12} /> VELOCITY_GRAPH
                   </div>
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={wpmHistory}>
                           <defs>
                               <linearGradient id="colorWpm" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                               </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                           <XAxis dataKey="time" stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
                           <YAxis stroke="#555" fontSize={10} tickLine={false} axisLine={false} domain={[0, 'auto']} />
                           <Tooltip 
                               contentStyle={{ backgroundColor: '#000', borderColor: '#333', fontSize: '12px' }}
                               itemStyle={{ color: '#06b6d4' }}
                           />
                           <Area type="monotone" dataKey="wpm" stroke="#06b6d4" fillOpacity={1} fill="url(#colorWpm)" strokeWidth={2} />
                       </AreaChart>
                   </ResponsiveContainer>
               </div>

               <button onClick={reset} className="btn-secondary flex items-center justify-center gap-2 w-full">
                   <RotateCcw size={16} /> Restart Protocol
               </button>
           </div>
       )}
    </div>
  );
};

export default TypingSpeedTest;