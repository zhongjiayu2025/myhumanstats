
import React, { useState, useEffect } from 'react';
import { Hash, ArrowRight, Delete, RotateCcw, Clock, Layers, AlertTriangle, ArrowLeft, Volume2 } from 'lucide-react';
import { saveStat } from '../../lib/core';

const NumberMemoryTest: React.FC = () => {
  const [level, setLevel] = useState(1);
  const [phase, setPhase] = useState<'intro' | 'memorize' | 'input' | 'result'>('intro');
  const [number, setNumber] = useState('');
  const [input, setInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [maxTime, setMaxTime] = useState(0);
  
  // Feature Toggles
  const [useChunking, setUseChunking] = useState(false);
  const [useInterference, setUseInterference] = useState(false);
  const [reverseMode, setReverseMode] = useState(false); // Feature 1
  const [audioMode, setAudioMode] = useState(false); // Feature 2
  
  const [distractor, setDistractor] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const startLevel = (lvl: number) => {
    const length = lvl + 2; 
    let num = '';
    for(let i=0; i<length; i++) {
        num += Math.floor(Math.random() * 10);
    }
    
    setNumber(num);
    setInput('');
    setPhase('memorize');
    
    if (audioMode) {
        speakSequence(num);
    } else {
        // Visual Timer Logic
        const duration = 1500 + (length * 600);
        setMaxTime(duration);
        setTimeLeft(duration);
    }
  };

  // Speech Logic
  const speakSequence = (seq: string) => {
      if (!window.speechSynthesis) return;
      setIsSpeaking(true);
      
      const digits = seq.split('');
      let delay = 0;
      
      digits.forEach((d, i) => {
          setTimeout(() => {
              const u = new SpeechSynthesisUtterance(d);
              u.rate = 1.2;
              window.speechSynthesis.speak(u);
              
              if (i === digits.length - 1) {
                  u.onend = () => {
                      setTimeout(() => {
                          setIsSpeaking(false);
                          setPhase('input');
                      }, 500);
                  };
              }
          }, delay);
          delay += 1000; // 1 second gap per digit
      });
  };

  useEffect(() => {
    let interval: number;
    let distractorInterval: number;

    if (phase === 'memorize' && !audioMode) {
        const start = performance.now();
        interval = window.setInterval(() => {
            const elapsed = performance.now() - start;
            const remaining = Math.max(0, maxTime - elapsed);
            setTimeLeft(remaining);
            if (remaining <= 0) {
                setPhase('input');
            }
        }, 16);

        // Interference Logic (Visual only)
        if (useInterference) {
            const symbols = ["●", "■", "▲", "◆", "+", "x", "?", "!"];
            
            distractorInterval = window.setInterval(() => {
                const randSymbol = symbols[Math.floor(Math.random() * symbols.length)];
                setDistractor(randSymbol);
                setTimeout(() => setDistractor(''), 200);
            }, 800); 
        }
    }
    return () => {
        clearInterval(interval);
        clearInterval(distractorInterval);
    };
  }, [phase, maxTime, useInterference, audioMode]);

  const handleKeypad = (val: string) => {
      if (navigator.vibrate) navigator.vibrate(5);

      if (val === 'back') {
          setInput(prev => prev.slice(0, -1));
      } else if (val === 'submit') {
          submitAnswer();
      } else {
          setInput(prev => prev + val);
      }
  };

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
      let target = number;
      if (reverseMode) {
          target = number.split('').reverse().join('');
      }

      if (input === target) {
          setLevel(l => l + 1);
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

  const formatChunk = (str: string) => {
      if (!useChunking) return str;
      return str.match(/.{1,3}/g)?.join(' ') || str;
  };

  const renderDiff = () => {
      let target = number;
      if (reverseMode) target = number.split('').reverse().join('');

      const correctChars = target.split('');
      const inputChars = input.split('');
      
      return (
          <div className="flex flex-col gap-4 font-mono text-xl tracking-widest bg-black p-6 rounded-xl border border-zinc-800">
              <div className="text-left">
                  <div className="text-[10px] text-zinc-500 uppercase font-bold mb-1">
                      {reverseMode ? "Target (Reversed)" : "Target Sequence"}
                  </div>
                  <div className="text-emerald-400">{formatChunk(target)}</div>
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
                      {target.length > input.length && (
                          <span className="text-zinc-600 opacity-50">
                              {'_'.repeat(target.length - input.length)}
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
                The average human can hold 7 digits in their working memory.
             </p>
             
             {/* Settings Panel */}
             <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl mb-8 max-w-xs mx-auto space-y-3">
                 <div className="flex items-center justify-between">
                     <span className="text-xs text-zinc-400 flex items-center gap-2"><ArrowLeft size={14}/> Reverse Mode</span>
                     <button onClick={() => setReverseMode(!reverseMode)} className={`w-10 h-5 rounded-full relative transition-colors ${reverseMode ? 'bg-indigo-500' : 'bg-zinc-700'}`}>
                         <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${reverseMode ? 'translate-x-5' : ''}`}></div>
                     </button>
                 </div>
                 <div className="flex items-center justify-between">
                     <span className="text-xs text-zinc-400 flex items-center gap-2"><Volume2 size={14}/> Audio TTS</span>
                     <button onClick={() => setAudioMode(!audioMode)} className={`w-10 h-5 rounded-full relative transition-colors ${audioMode ? 'bg-indigo-500' : 'bg-zinc-700'}`}>
                         <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${audioMode ? 'translate-x-5' : ''}`}></div>
                     </button>
                 </div>
                 <div className="h-px bg-zinc-800 w-full my-2"></div>
                 <div className="flex items-center justify-between">
                     <span className="text-xs text-zinc-400 flex items-center gap-2"><Layers size={14}/> Chunking</span>
                     <button onClick={() => setUseChunking(!useChunking)} className={`w-10 h-5 rounded-full relative transition-colors ${useChunking ? 'bg-primary-600' : 'bg-zinc-700'}`}>
                         <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${useChunking ? 'translate-x-5' : ''}`}></div>
                     </button>
                 </div>
                 <div className="flex items-center justify-between">
                     <span className="text-xs text-zinc-400 flex items-center gap-2"><AlertTriangle size={14}/> Distraction</span>
                     <button onClick={() => setUseInterference(!useInterference)} className={`w-10 h-5 rounded-full relative transition-colors ${useInterference ? 'bg-red-600' : 'bg-zinc-700'}`}>
                         <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${useInterference ? 'translate-x-5' : ''}`}></div>
                     </button>
                 </div>
             </div>

             <button onClick={startGame} className="btn-primary w-full">
                 Start Test
             </button>
          </div>
      )}

      {phase === 'memorize' && (
          <div className="w-full relative">
              <div className="flex justify-between items-center mb-12 px-4">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Level {level}</div>
                  {!audioMode && (
                      <div className="flex items-center gap-2 text-zinc-500 font-mono text-xs">
                          <Clock size={12} />
                          <span>{(timeLeft/1000).toFixed(1)}s</span>
                      </div>
                  )}
              </div>
              
              {audioMode ? (
                  <div className="text-2xl text-white font-mono animate-pulse">
                      <Volume2 size={48} className="mx-auto mb-4 text-indigo-400"/>
                      {isSpeaking ? "LISTENING..." : "PREPARING INPUT"}
                  </div>
              ) : (
                  <div className="text-5xl md:text-6xl font-mono font-bold text-white mb-16 tracking-widest text-glow break-all leading-tight relative z-10">
                      {formatChunk(number)}
                  </div>
              )}
              
              {/* Visual Distractor Overlay */}
              {distractor && !audioMode && (
                  <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                      <div className="text-8xl opacity-30 text-white animate-ping font-black transform rotate-12 scale-150">
                          {distractor}
                      </div>
                  </div>
              )}
              
              {/* Urgency Bar */}
              {!audioMode && (
                  <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-75 ease-linear ${timeLeft < 1000 ? 'bg-red-500' : timeLeft < 3000 ? 'bg-yellow-500' : 'bg-primary-500'}`} 
                        style={{ width: `${(timeLeft / maxTime) * 100}%` }}
                      ></div>
                  </div>
              )}
          </div>
      )}

      {phase === 'input' && (
          <div className="w-full animate-in slide-in-from-bottom-8">
              <div className="text-zinc-400 mb-6 text-sm font-mono uppercase tracking-widest">
                  {reverseMode ? "Enter Sequence REVERSED" : "Enter Sequence"}
              </div>
              
              {/* Display Area */}
              <div className={`
                  bg-black border-b-2 p-4 mb-8 min-h-[70px] flex items-center justify-center relative overflow-hidden
                  ${reverseMode ? 'border-indigo-500/50' : 'border-primary-500/50'}
              `}>
                  <span className="text-3xl font-mono text-white tracking-widest">
                      {formatChunk(input)}
                      <span className={`animate-pulse ml-1 ${reverseMode ? 'text-indigo-500' : 'text-primary-500'}`}>_</span>
                  </span>
              </div>

              {/* Cyber Keypad */}
              <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                      <button 
                        key={n} 
                        onClick={() => handleKeypad(n.toString())}
                        className="h-16 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 hover:border-primary-500/50 rounded-lg text-2xl font-mono text-white active:scale-95 transition-all shadow-md active:shadow-none active:translate-y-[2px]"
                      >
                          {n}
                      </button>
                  ))}
                  <button 
                    onClick={() => handleKeypad('back')}
                    className="h-16 bg-red-900/20 hover:bg-red-900/40 border border-red-900/50 rounded-lg flex items-center justify-center text-red-400 active:scale-95 transition-all"
                  >
                      <Delete size={24} />
                  </button>
                  <button 
                    onClick={() => handleKeypad('0')}
                    className="h-16 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 hover:border-primary-500/50 rounded-lg text-2xl font-mono text-white active:scale-95 transition-all"
                  >
                      0
                  </button>
                  <button 
                    onClick={() => handleKeypad('submit')}
                    className="h-16 bg-primary-600 hover:bg-primary-500 rounded-lg flex items-center justify-center text-black active:scale-95 transition-all font-bold"
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
                  {reverseMode && <span className="block text-xs text-indigo-400 mt-1">(Reverse Mode - High IQ)</span>}
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
