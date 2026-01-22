import React, { useState, useEffect, useRef } from 'react';
import { Keyboard, RotateCcw, Quote, FileType, Flame, Volume2, VolumeX, Terminal, LineChart as ChartIcon, AlertTriangle } from 'lucide-react';
import { saveStat, getHistory } from '../../lib/core';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
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
  const [audioMode, setAudioMode] = useState<'ui'|'mech'>('mech'); // New audio mode
  
  const [wpmHistory, setWpmHistory] = useState<{time: number, wpm: number}[]>([]);
  const [longTermHistory, setLongTermHistory] = useState<{date: string, score: number}[]>([]);
  const [streak, setStreak] = useState(0);
  
  // New: Error Tracking
  const [missedKeys, setMissedKeys] = useState<Record<string, number>>({});
  
  const inputRef = useRef<HTMLInputElement>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const lastSampleTime = useRef<number>(0);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => { reset(); }, [mode]);

  useEffect(() => {
      const h = getHistory('typing-speed-test');
      setLongTermHistory(h.map(entry => ({ date: new Date(entry.timestamp).toLocaleDateString(), score: entry.score })).slice(-10));
  }, [phase]);

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

  // Mechanical Switch Sound Synthesis
  const playMechSound = () => {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = audioCtxRef.current;
      if(ctx.state === 'suspended') ctx.resume();

      const t = ctx.currentTime;
      // High click (plastic hit)
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(2000, t);
      osc.frequency.exponentialRampToValueAtTime(100, t + 0.05);
      
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
      
      // Low thud (switch bottoming out)
      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(300, t);
      osc2.frequency.exponentialRampToValueAtTime(50, t + 0.1);
      
      const gain2 = ctx.createGain();
      gain2.gain.setValueAtTime(0.5, t);
      gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      
      osc.start(t);
      osc.stop(t + 0.05);
      osc2.start(t);
      osc2.stop(t + 0.1);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      const now = Date.now();
      
      // Sound & Haptic
      if (val.length > input.length && soundEnabled) {
          if (audioMode === 'mech') playMechSound();
          else playUiSound('click');
          
          if (navigator.vibrate) navigator.vibrate(10);
      }

      // Check correctness of latest char
      if (val.length > input.length) {
          const expectedChar = text[val.length - 1];
          const typedChar = val[val.length - 1];
          
          if (typedChar === expectedChar) {
              setStreak(s => s + 1);
          } else {
              setStreak(0);
              playUiSound('fail');
              
              // Track specific key error
              setMissedKeys(prev => ({
                  ...prev,
                  [expectedChar]: (prev[expectedChar] || 0) + 1
              }));
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
      saveStat('typing-speed-test', netWpm);
  };

  const reset = () => {
      initText();
      setInput('');
      setPhase('idle');
      setWpm(0);
      setAccuracy(100);
      setWpmHistory([]);
      setStreak(0);
      setMissedKeys({});
  };

  // Calculate Caret Position
  const [caretPos, setCaretPos] = useState({ left: 0, top: 0 });
  useEffect(() => {
      const idx = input.length;
      if (charRefs.current[idx]) {
          const el = charRefs.current[idx];
          if (el) {
              setCaretPos({
                  left: el.offsetLeft,
                  top: el.offsetTop
              });
          }
      }
  }, [input, text]);

  const renderText = () => {
      return text.split('').map((char, i) => {
          let color = 'text-zinc-600';
          let bg = '';
          const isCurrent = i === input.length;
          
          if (i < input.length) {
              const isCorrect = input[i] === char;
              color = isCorrect ? 'text-white' : 'text-red-500';
              bg = isCorrect ? '' : 'bg-red-900/20';
          }
          
          // Code Syntax Highlighting
          if (mode === 'code' && i >= input.length) {
              if (['const', 'let', 'var', 'function', 'return', 'import', 'from'].includes(text.slice(i).split(' ')[0])) color = 'text-pink-500';
              if (['{', '}', '(', ')', '[', ']'].includes(char)) color = 'text-yellow-500';
              if (['=>', '=', '+', '-', '<', '>'].includes(char)) color = 'text-cyan-500';
          }

          return (
            <span 
                key={i} 
                ref={el => { charRefs.current[i] = el; }}
                className={`relative ${color} ${bg} transition-colors duration-100`}
            >
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
                <button 
                    onClick={(e) => {
                        e.stopPropagation(); 
                        if (!soundEnabled) setSoundEnabled(true);
                        else if (audioMode === 'mech') setAudioMode('ui');
                        else { setSoundEnabled(false); setAudioMode('mech'); }
                    }} 
                    className="text-zinc-500 hover:text-white transition-colors flex items-center gap-1 text-[10px] font-mono uppercase"
                >
                    {!soundEnabled ? <><VolumeX size={16}/> MUTE</> : audioMode === 'mech' ? <><Keyboard size={16}/> THOCK</> : <><Volume2 size={16}/> BEEP</>}
                </button>
                {streak > 10 && <div className="hidden md:flex items-center gap-1 text-amber-500 animate-bounce"><Flame size={16} fill="currentColor" /><span className="font-bold font-mono text-sm">{streak}</span></div>}
                <div className="text-right">
                   <div className="text-[10px] text-zinc-500 font-mono uppercase">Speed</div>
                   <div className="text-2xl font-bold text-white font-mono">{wpm} WPM</div>
                </div>
           </div>
       </div>

       {/* Typing Area */}
       <div className="relative font-mono text-xl md:text-2xl leading-relaxed break-words min-h-[180px] bg-black/50 p-8 border border-zinc-800 rounded-lg shadow-inner mb-8 overflow-hidden">
           {/* Smooth Caret */}
           {phase !== 'result' && (
               <div 
                  className="absolute w-0.5 h-6 bg-primary-500 shadow-[0_0_10px_#06b6d4] transition-all duration-100 ease-out z-20 pointer-events-none"
                  style={{ left: caretPos.left + 32, top: caretPos.top + 35 }} 
               ></div>
           )}
           
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
               
               {/* New: Error Heatmap Analysis */}
               {Object.keys(missedKeys).length > 0 && (
                   <div className="mb-8 p-4 bg-red-900/10 border border-red-500/20 rounded">
                       <h4 className="text-xs font-bold text-red-400 uppercase mb-2 flex items-center gap-2"><AlertTriangle size={12}/> Trouble Keys</h4>
                       <div className="flex gap-2 flex-wrap">
                           {Object.entries(missedKeys).sort((a,b) => b[1] - a[1]).slice(0, 5).map(([key, count]) => (
                               <div key={key} className="bg-red-900/40 text-red-200 px-3 py-1 rounded text-xs border border-red-500/30">
                                   <strong className="text-white font-mono text-sm">'{key}'</strong> x{count}
                               </div>
                           ))}
                       </div>
                   </div>
               )}
               
               {/* Speed Chart */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                   <div className="h-48 w-full bg-zinc-900/30 border border-zinc-800 rounded-lg p-4 relative">
                       <div className="absolute top-2 left-2 text-[10px] text-zinc-500 font-mono">LIVE WPM</div>
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

                   {/* History Chart */}
                   <div className="h-48 w-full bg-zinc-900/30 border border-zinc-800 rounded-lg p-4 relative">
                        <div className="absolute top-2 left-2 text-[10px] text-zinc-500 font-mono flex items-center gap-2">
                            <ChartIcon size={12} /> PROGRESS HISTORY
                        </div>
                        {longTermHistory.length > 1 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={longTermHistory}>
                                    <defs><linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/></linearGradient></defs>
                                    <XAxis dataKey="date" stroke="#555" fontSize={9} tickLine={false} axisLine={false} />
                                    <YAxis 
                                        stroke="#555" 
                                        fontSize={9} 
                                        tickLine={false} 
                                        axisLine={false} 
                                        domain={[(dataMin: any) => dataMin - 10, (dataMax: any) => dataMax + 10]} 
                                    />
                                    <Tooltip contentStyle={{ backgroundColor: '#000', borderColor: '#333', fontSize: '12px' }} itemStyle={{ color: '#8b5cf6' }} />
                                    <Area type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2} fill="url(#histGrad)" />
                                    <ReferenceLine y={60} stroke="#333" strokeDasharray="3 3" label={{ value: 'Avg', fill: '#555', fontSize: 10 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-zinc-600 text-xs">Complete more tests to see trends</div>
                        )}
                   </div>
               </div>

               <button onClick={reset} className="btn-secondary flex items-center justify-center gap-2 w-full"><RotateCcw size={16} /> Restart Protocol</button>
           </div>
       )}
    </div>
  );
};

export default TypingSpeedTest;