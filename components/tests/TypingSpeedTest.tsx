import React, { useState, useEffect, useRef } from 'react';
import { Keyboard, RotateCcw, Zap, Activity, Terminal } from 'lucide-react';
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
  const [timer, setTimer] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const timerInterval = useRef<number | null>(null);

  useEffect(() => {
    setText(generateText(20)); // Generate 20 words batch
  }, []);

  useEffect(() => {
    if (phase === 'typing') {
      timerInterval.current = window.setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    } else {
      if (timerInterval.current) clearInterval(timerInterval.current);
    }
    return () => { if (timerInterval.current) clearInterval(timerInterval.current); };
  }, [phase]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    
    if (phase === 'idle') {
      setPhase('typing');
      setStartTime(Date.now());
    }

    setInput(val);
    calculateStats(val);

    if (val.length === text.length) {
      finishTest(val);
    }
  };

  const calculateStats = (currentInput: string) => {
    // Basic live stats
    let correctChars = 0;
    for (let i = 0; i < currentInput.length; i++) {
      if (currentInput[i] === text[i]) correctChars++;
    }
    const acc = Math.round((correctChars / currentInput.length) * 100) || 100;
    setAccuracy(acc);
  };

  const finishTest = (finalInput: string) => {
    setPhase('result');
    const endTime = Date.now();
    const durationMin = (endTime - startTime) / 60000;
    
    // Standard WPM formula: (All characters / 5) / Time in minutes
    const rawWpm = (finalInput.length / 5) / durationMin;
    
    // Adjust for errors? Standard gross WPM is usually shown, let's show net.
    // Net WPM = Gross WPM - (Uncorrected Errors / Time)
    // For simplicity in this UI, we stick to Gross WPM * Accuracy
    
    const finalWpm = Math.round(rawWpm);
    setWpm(finalWpm);
    
    saveStat('typing-speed', finalWpm); // Saving WPM directly as score, though score is usually 0-100.
    // Let's cap score at 100 for the radar chart, but display WPM
    // Actually, saving normalized score for the system:
    const normalizedScore = Math.min(100, Math.round((finalWpm / 120) * 100)); // 120 WPM = 100 score
    saveStat('typing-speed-score', normalizedScore);
  };

  const reset = () => {
    setPhase('idle');
    setInput('');
    setText(generateText(20));
    setTimer(0);
    setWpm(0);
    setAccuracy(100);
    // Focus input again
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Render text with highlighting
  const renderText = () => {
    return text.split('').map((char, index) => {
      let color = 'text-zinc-600';
      if (index < input.length) {
        color = input[index] === char ? 'text-primary-400' : 'text-red-500 bg-red-900/20';
      } else if (index === input.length) {
        return <span key={index} className="bg-primary-500 text-black animate-pulse">{char}</span>;
      }
      return <span key={index} className={color}>{char}</span>;
    });
  };

  return (
    <div className="max-w-3xl mx-auto select-none">
       {/* HUD */}
       <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="tech-border bg-black p-4 flex flex-col items-center">
             <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Timer</span>
             <span className="text-2xl font-mono text-white">{timer}s</span>
          </div>
          <div className="tech-border bg-black p-4 flex flex-col items-center">
             <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Accuracy</span>
             <span className={`text-2xl font-mono ${accuracy < 90 ? 'text-yellow-500' : 'text-emerald-500'}`}>{accuracy}%</span>
          </div>
          <div className="tech-border bg-black p-4 flex flex-col items-center">
             <span className="text-[10px] text-zinc-500 uppercase tracking-widest">WPM</span>
             <span className="text-2xl font-mono text-primary-400">{phase === 'result' ? wpm : '---'}</span>
          </div>
       </div>

       {/* Main Terminal Area */}
       <div className="relative tech-border bg-black p-8 min-h-[200px] flex items-center mb-8 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="absolute top-2 left-2 flex gap-2">
             <div className="w-2 h-2 rounded-full bg-red-500"></div>
             <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
             <div className="w-2 h-2 rounded-full bg-green-500"></div>
          </div>
          
          <div className="font-mono text-xl md:text-2xl leading-relaxed break-all cursor-text" onClick={() => inputRef.current?.focus()}>
             {renderText()}
          </div>

          {/* Hidden Input for handling typing */}
          <input 
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInput}
            className="absolute opacity-0 top-0 left-0 w-full h-full cursor-text"
            autoFocus
            disabled={phase === 'result'}
          />
       </div>

       {phase === 'result' && (
         <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
             <div className="bg-zinc-900/50 border border-zinc-800 p-6 mb-6">
                <div className="flex items-start gap-4">
                   <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-full">
                      <Terminal size={24} className="text-primary-500" />
                   </div>
                   <div>
                      <h3 className="text-lg font-bold text-white mb-1">Typing Efficiency Analysis</h3>
                      <p className="text-sm text-zinc-400">
                         You typed at <strong>{wpm} WPM</strong> with <strong>{accuracy}%</strong> accuracy. 
                         {wpm > 80 ? " You have elite keyboard dexterity." : wpm > 40 ? " You have average professional typing speed." : " Keep practicing to improve efficiency."}
                      </p>
                   </div>
                </div>
             </div>
             <button onClick={reset} className="btn-secondary w-full flex items-center justify-center gap-2">
                <RotateCcw size={16} /> Reset Terminal
             </button>
         </div>
       )}
       
       {phase === 'idle' && (
          <div className="text-center text-xs text-zinc-500 font-mono animate-pulse">
             [STATUS: AWAITING INPUT... START TYPING TO BEGIN]
          </div>
       )}

       {/* SEO Footer */}
       <div className="mt-12 border-t border-zinc-800 pt-6 text-left">
           <h4 className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-2 flex items-center gap-2">
              <Keyboard size={12} /> Technical Context: WPM & Latency
           </h4>
           <p className="text-xs text-zinc-500 leading-relaxed">
              This <strong>Typing Speed Test</strong> (or <strong>WPM Test</strong>) measures your motor reflex latency and cognitive processing speed via keyboard input. Standard Words Per Minute (WPM) is calculated as (Characters / 5) / Minutes. High WPM correlates with efficient neural pathways for language processing and fine motor control.
           </p>
       </div>
    </div>
  );
};

export default TypingSpeedTest;