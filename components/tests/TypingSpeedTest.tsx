
import React, { useState, useEffect, useRef } from 'react';
import { Keyboard, RotateCcw, Quote, FileType, Flame, Volume2, VolumeX, Terminal } from 'lucide-react';
import { saveStat } from '../../lib/core';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { playUiSound } from '../../lib/sounds';

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
  "Simplicity is the soul of efficiency."
];

const CODE_SNIPPETS = [
  `const quickSort = (arr) => { if (arr.length <= 1) return arr; return [...quickSort(left), pivot, ...quickSort(right)]; };`,
  `function fibonacci(n) { return n < 1 ? 0 : n <= 2 ? 1 : fibonacci(n - 1) + fibonacci(n - 2); }`,
  `import React, { useState } from 'react'; const App = () => { const [count, setCount] = useState(0); return <div onClick={() => setCount(c => c + 1)}>{count}</div>; };`,
  `db.collection('users').where('age', '>=', 18).get().then(snapshot => { snapshot.forEach(doc => console.log(doc.id, '=>', doc.data())); });`
];

const TypingSpeedTest: React.FC = () => {
  const [mode, setMode] = useState<'words' | 'quotes' | 'code'>('words');
  const [phase, setPhase] = useState<'idle' | 'typing' | 'result'>('idle');
  const [text, setText] = useState('');
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const [wpmHistory, setWpmHistory] = useState<{time: number, wpm: number}[]>([]);
  const [streak, setStreak] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const lastSampleTime = useRef<number>(0);

  useEffect(() => { reset(); }, [mode]);

  const initText = () => {
      if (mode === 'words') {
          const selection = [];
          for(let i=0; i<25; i++) selection.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
          setText(selection.join(' '));
      } else if (mode === 'quotes') {
          setText(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
      } else {
          setText(CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)]);
      }
  };

  useEffect(() => {
      if (phase === 'typing' || phase === 'idle') inputRef.current?.focus();
  }, [phase]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      const now = Date.now();
      
      // Sound & Haptic
      if (val.length > input.length && soundEnabled) {
          playUiSound('click');
          if (navigator.vibrate) navigator.vibrate(10); // Subtle tick
      }

      // Check correctness
      if (val.length > input.length) {
          const expectedChar = text[val.length - 1];
          const typedChar = val[val.length - 1];
          
          if (typedChar === expectedChar) {
              setStreak(s => s + 1);
          } else {
              setStreak(0);
              playUiSound('fail');
          }
      }

      if (phase === 'idle' && val.length === 1) {
          setPhase('typing');
          setStartTime(now);
          lastSampleTime.current = now;
          setWpmHistory([{ time: 0, wpm: 0 }]);
      }

      if (phase === 'result') return;
      setInput(val);

      // Sample WPM
      if (phase === 'typing' && now - lastSampleTime.current > 1000) {
          const durationMin = (now - startTime) / 60000;
          const currentWpm = Math.round((val.length / 5) / durationMin);
          setWpm(currentWpm);
          setWpmHistory(prev => [...prev, { time: Math.round((now - startTime)/1000), wpm: currentWpm }]);
          lastSampleTime.current = now;
      }

      if (val.length >= text.length) finish(val);
  };

  const finish = (finalInput: string) => {
      const endTime = Date.now();
      const durationMin = (endTime - startTime) / 60000;
      let correct = 0;
      for(let i=0; i<text.length; i++) if (finalInput[i] === text[i]) correct++;
      const acc = Math.round((correct / text.length) * 100);
      setAccuracy(acc);
      const netWpm = Math.round(((text.length / 5) / durationMin) * (acc / 100));
      setWpm(netWpm);
      setPhase('result');
      playUiSound('success');
      saveStat('typing-speed-test', Math.min(100, netWpm));
  };

  const reset = () => {
      initText();
      setInput('');
      setPhase('idle');
      setWpm(0);
      setAccuracy(100);
      setWpmHistory([]);
      setStreak(0);
  };

  const renderText = () => {
      return text.split('').map((char, i) => {
          let color = 'text-zinc-600';
          let bg = '';
          const isCursor = i === input.length;
          if (i < input.length) {
              const isCorrect = input[i] === char;
              color = isCorrect ? 'text-white' : 'text-red-500';
              bg = isCorrect ? '' : 'bg-red-900/20';
          }
          // Simple Syntax Highlighting for Code Mode
          if (mode === 'code' && i >= input.length) {
              if (['const', 'let', 'var', 'function', 'return', 'import', 'from'].includes(text.slice(i).split(' ')[0])) color = 'text-pink-500';
              if (['{', '}', '(', ')', '[', ']'].includes(char)) color = 'text-yellow-500';
              if (['=>', '=', '+', '-', '<', '>'].includes(char)) color = 'text-cyan-500';
          }
          return (
            <span key={i} className={`relative ${color} ${bg}`}>
                {isCursor && <span className="absolute left-0 -top-1 bottom-0 w-0.5 bg-primary-500 animate-pulse shadow-[0_0_8px_#06b6d4]"></span>}
                {char}
            </span>
          );
      });
  };

  return (
    <div className="max-w-3xl mx-auto select-none" onClick={() => inputRef.current?.focus()}>
       {phase === 'idle' && (
           <div className="flex justify-center mb-8 gap-4 flex-wrap">
               <button onClick={(e) => { e.stopPropagation(); setMode('words'); }} className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-mono transition-all ${mode === 'words' ? 'bg-primary-500 text-black border-primary-500' : 'bg-zinc-900 text-zinc-500 border-zinc-800'}`}><FileType size={14} /> Words</button>
               <button onClick={(e) => { e.stopPropagation(); setMode('quotes'); }} className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-mono transition-all ${mode === 'quotes' ? 'bg-primary-500 text-black border-primary-500' : 'bg-zinc-900 text-zinc-500 border-zinc-800'}`}><Quote size={14} /> Quotes</button>
               <button onClick={(e) => { e.stopPropagation(); setMode('code'); }} className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-mono transition-all ${mode === 'code' ? 'bg-primary-500 text-black border-primary-500' : 'bg-zinc-900 text-zinc-500 border-zinc-800'}`}><Terminal size={14} /> Code</button>
           </div>
       )}

       {/* HUD */}
       <div className="flex justify-between items-end mb-8 border-b border-zinc-800 pb-4">
           <div className="flex items-center gap-3">
               <div className="p-2 bg-zinc-900 border border-zinc-800 rounded"><Keyboard size={20} className="text-zinc-400" /></div>
               <div>
                   <div className="text-[10px] text-zinc-500 font-mono uppercase">Status</div>
                   <div className={`text-sm font-bold font-mono ${phase === 'typing' ? 'text-primary-400 animate-pulse' : 'text-white'}`}>{phase === 'idle' ? 'WAITING FOR INPUT' : phase === 'typing' ? 'RECORDING...' : 'COMPLETE'}</div>
               </div>
           </div>
           
           <div className="flex items-center gap-6">
                <button onClick={(e) => {e.stopPropagation(); setSoundEnabled(!soundEnabled)}} className="text-zinc-500 hover:text-white transition-colors">
                    {soundEnabled ? <Volume2 size={16}/> : <VolumeX size={16}/>}
                </button>
                {streak > 10 && <div className="hidden md:flex items-center gap-1 text-amber-500 animate-bounce"><Flame size={16} fill="currentColor" /><span className="font-bold font-mono text-sm">{streak}</span></div>}
                <div className="text-right">
                   <div className="text-[10px] text-zinc-500 font-mono uppercase">Speed</div>
                   <div className="text-2xl font-bold text-white font-mono">{wpm} WPM</div>
                </div>
           </div>
       </div>

       {/* Typing Area */}
       <div className="relative font-mono text-xl md:text-2xl leading-relaxed break-words min-h-[180px] bg-black/50 p-8 border border-zinc-800 rounded-lg shadow-inner mb-8">
           <div className="relative z-10">{renderText()}</div>
           <input ref={inputRef} type="text" value={input} onChange={handleInput} className="absolute opacity-0 inset-0 cursor-text" autoFocus disabled={phase === 'result'} />
       </div>

       {/* Results */}
       {phase === 'result' && (
           <div className="mt-8 animate-in fade-in slide-in-from-bottom-4">
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                   <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded text-center"><div className="text-[10px] text-zinc-500 uppercase font-mono">Accuracy</div><div className={`text-xl font-bold ${accuracy > 95 ? 'text-emerald-500' : 'text-yellow-500'}`}>{accuracy}%</div></div>
                   <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded text-center"><div className="text-[10px] text-zinc-500 uppercase font-mono">Streak</div><div className="text-xl font-bold text-white">{streak}</div></div>
               </div>
               <div className="h-64 w-full bg-zinc-900/30 border border-zinc-800 rounded-lg p-4 mb-8 relative">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={wpmHistory}>
                           <defs><linearGradient id="colorWpm" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/><stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/></linearGradient></defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                           <XAxis dataKey="time" stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
                           <YAxis stroke="#555" fontSize={10} tickLine={false} axisLine={false} domain={[0, 'auto']} />
                           <Tooltip contentStyle={{ backgroundColor: '#000', borderColor: '#333', fontSize: '12px' }} itemStyle={{ color: '#06b6d4' }} />
                           <Area type="monotone" dataKey="wpm" stroke="#06b6d4" fillOpacity={1} fill="url(#colorWpm)" strokeWidth={2} />
                       </AreaChart>
                   </ResponsiveContainer>
               </div>
               <button onClick={reset} className="btn-secondary flex items-center justify-center gap-2 w-full"><RotateCcw size={16} /> Restart Protocol</button>
           </div>
       )}
    </div>
  );
};

export default TypingSpeedTest;
