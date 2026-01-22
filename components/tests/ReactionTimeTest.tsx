
import React, { useState, useRef, useEffect } from 'react';
import { Zap, AlertTriangle, RotateCcw, Clock, BarChart3, Medal, Volume2, Eye, ScatterChart as ScatterIcon, History, Settings2, Crosshair, Lock } from 'lucide-react';
import { saveStat, getHistory } from '../../lib/core';
import { playUiSound } from '../../lib/sounds';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, ZAxis, LineChart, Line } from 'recharts';
import Link from 'next/link';

enum GameState { IDLE, WAITING, READY, RESULT, EARLY, CHEAT, PENALTY }

const ReactionTimeTest: React.FC = () => {
  const [mode, setMode] = useState<'visual' | 'audio'>('visual');
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [history, setHistory] = useState<number[]>([]);
  const [average, setAverage] = useState(0);
  const [stdDev, setStdDev] = useState(0); // New: Stability Metric
  const [lastTime, setLastTime] = useState(0);
  const [shake, setShake] = useState(false);
  
  // Visuals
  const [clickPos, setClickPos] = useState<{x: number, y: number} | null>(null);
  
  // Settings
  const [inputLag, setInputLag] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  
  // Historical Data for Trend Chart
  const [longTermHistory, setLongTermHistory] = useState<{timestamp: number, score: number, raw?: number}[]>([]);
  
  const timeoutRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => { 
      // Load initial history
      const h = getHistory('reaction-time');
      setLongTermHistory(h);
      return () => clearExistingTimeout(); 
  }, []);

  // Global "R" or Space to retry
  useEffect(() => {
      const handleGlobalKey = (e: KeyboardEvent) => {
          if (gameState === GameState.RESULT && (e.key.toLowerCase() === 'r' || e.code === 'Space')) {
              e.preventDefault();
              resetTest();
          }
      };
      window.addEventListener('keydown', handleGlobalKey);
      return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [gameState]);

  const clearExistingTimeout = () => {
      if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
      }
  };

  const playStimulus = () => {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      // Create Gunshot-like White Noise Burst
      const bufferSize = ctx.sampleRate * 0.1; // 100ms
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      
      const gain = ctx.createGain();
      // Envelope
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      
      // Lowpass to make it punchy not harsh
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1000;

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      noise.start();
  };

  const prepareRound = () => {
    setGameState(GameState.WAITING);
    setShake(false);
    setClickPos(null);
    playUiSound('hover'); // Subtle start sound
    
    // Random delay between 2s and 5s
    const delay = Math.floor(Math.random() * 3000) + 2000;
    
    clearExistingTimeout();
    timeoutRef.current = window.setTimeout(() => {
      setGameState(GameState.READY);
      startTimeRef.current = Date.now();
      if (mode === 'audio') playStimulus();
    }, delay);
  };

  const handleAction = (e: React.MouseEvent | React.TouchEvent) => {
    // Prevent default to stop scrolling or zooming on rapid taps
    if (e.cancelable && e.type !== 'mousedown') e.preventDefault(); 
    
    // Calculate click pos for ripple
    let clientX, clientY;
    if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = (e as React.MouseEvent).clientX;
        clientY = (e as React.MouseEvent).clientY;
    }
    // Relative to container logic would be better, but for full screen effect:
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    setClickPos({ x: clientX - rect.left, y: clientY - rect.top });

    if (gameState === GameState.IDLE || gameState === GameState.RESULT || gameState === GameState.CHEAT) {
        if (!showSettings) resetTest();
        return;
    }

    if (gameState === GameState.PENALTY) return; // Locked

    if (gameState === GameState.WAITING) {
        setGameState(GameState.PENALTY);
        setShake(true); 
        playUiSound('fail');
        if (navigator.vibrate) navigator.vibrate(200);
        clearExistingTimeout();
        
        // Enforce 1s cooldown penalty
        setTimeout(() => {
            setGameState(GameState.EARLY);
        }, 1000);
        return;
    }

    if (gameState === GameState.READY) {
        const endTime = Date.now();
        const rawDiff = endTime - startTimeRef.current;
        // Apply manual hardware lag compensation
        const diff = Math.max(0, rawDiff - inputLag);
        
        // CHEAT DETECTION (< 80ms is physiologically impossible for visual RT)
        if (rawDiff < 80) {
            setGameState(GameState.CHEAT);
            playUiSound('fail');
            return;
        }

        playUiSound('click');
        setLastTime(diff);
        
        const newHistory = [...history, diff];
        setHistory(newHistory);

        if (newHistory.length >= 5) {
            // Finish Set
            const avg = Math.round(newHistory.reduce((a, b) => a + b, 0) / newHistory.length);
            // Calculate Standard Deviation (Jitter)
            const variance = newHistory.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / newHistory.length;
            const sd = Math.round(Math.sqrt(variance));
            
            setAverage(avg);
            setStdDev(sd);
            setGameState(GameState.RESULT);
            playUiSound('success');
            
            // Save & Load History
            const score = Math.max(0, Math.min(100, Math.round(100 - (avg - 150) / 3.5)));
            // IMPORTANT: Saving RAW average now
            saveStat('reaction-time', score, avg);
            
            const rawHist = getHistory('reaction-time');
            setLongTermHistory(rawHist);
        } else {
            setGameState(GameState.IDLE); 
        }
    }

    if (gameState === GameState.EARLY) {
        prepareRound();
    }
  };

  const resetTest = () => {
      setHistory([]);
      setAverage(0);
      setStdDev(0);
      prepareRound();
  };

  // UI Config Logic
  const getConfig = () => {
    if (gameState === GameState.IDLE && history.length > 0) {
        return { 
            bg: 'bg-zinc-900', 
            icon: Clock, 
            title: `${lastTime} ms`, 
            sub: 'Click to keep going', 
            color: 'text-white' 
        };
    }

    switch(gameState) {
      case GameState.IDLE: 
        return { 
            bg: 'bg-zinc-900', 
            icon: mode === 'visual' ? Zap : Volume2, 
            title: mode === 'visual' ? 'Visual Reflex' : 'Audio Reflex', 
            sub: mode === 'visual' ? 'Wait for Green' : 'Wait for Sound', 
            color: 'text-white' 
        };
      case GameState.WAITING: 
        return { 
            bg: 'bg-rose-950', 
            icon: Clock, 
            title: 'Wait for it...', 
            sub: 'Steady...', 
            color: 'text-rose-500' 
        };
      case GameState.READY: 
        return { 
            bg: 'bg-emerald-500', 
            icon: mode === 'visual' ? Zap : Volume2, 
            title: 'CLICK!', 
            sub: '', 
            color: 'text-white' 
        };
      case GameState.PENALTY:
        return {
            bg: 'bg-zinc-950',
            icon: Lock,
            title: 'LOCKED',
            sub: 'Penalty Cooldown...',
            color: 'text-red-500'
        };
      case GameState.EARLY: 
        return { 
            bg: 'bg-zinc-900', 
            icon: AlertTriangle, 
            title: 'Too Early!', 
            sub: 'Click to try again.', 
            color: 'text-yellow-500' 
        };
      case GameState.CHEAT:
        return {
            bg: 'bg-zinc-900',
            icon: AlertTriangle,
            title: 'Prediction?',
            sub: 'Human limit is ~150ms. Too fast.',
            color: 'text-red-500'
        }
      case GameState.RESULT: 
        return { 
            bg: 'bg-zinc-900', 
            icon: BarChart3, 
            title: `${average} ms`, 
            sub: 'Average Score', 
            color: 'text-primary-400' 
        };
    }
  };

  const ui = getConfig();
  const Icon = ui.icon;
  
  // Prepare Scatter Data: { index, time, tooltip }
  const scatterData = history.map((val, idx) => ({ x: idx + 1, y: val, z: 1 }));
  const minTime = Math.min(...history, 9999);
  const maxTime = Math.max(...history, 0);

  // Prepare Trend Data (Last 20 entries), preferring Raw MS if available
  const trendData = longTermHistory.slice(-20).map((h, i) => ({
      i,
      val: h.raw || (150 + (100 - h.score) * 3.5) // Approximate MS from score if raw missing
  }));

  return (
    <div className="max-w-xl mx-auto select-none relative touch-none">
      
      {/* Point 1: Live Region for Screen Readers */}
      <div className="sr-only" aria-live="polite" role="status">
          {gameState === GameState.WAITING && "Status: Waiting for signal."}
          {gameState === GameState.READY && "Status: Go! Click now!"}
          {gameState === GameState.RESULT && `Test complete. Average reaction time ${average} milliseconds.`}
          {gameState === GameState.EARLY && "Status: Failed. Too early. Click to try again."}
      </div>

      {/* Settings Modal */}
      {showSettings && (
          <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur flex items-center justify-center p-4 animate-in fade-in rounded-2xl">
              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl w-full max-w-sm">
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Settings2 size={18}/> Calibration</h3>
                  <div className="mb-6">
                      <label className="text-xs text-zinc-400 uppercase font-bold mb-2 block">Hardware Input Lag Compensation</label>
                      <input 
                          type="range" min="0" max="100" step="5" 
                          value={inputLag} 
                          onChange={(e) => setInputLag(Number(e.target.value))}
                          className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary-500 mb-2"
                      />
                      <div className="flex justify-between text-xs text-zinc-500 font-mono">
                          <span>0ms (Default)</span>
                          <span className="text-primary-400 font-bold">-{inputLag}ms</span>
                          <span>100ms</span>
                      </div>
                      <p className="text-[10px] text-zinc-600 mt-2 leading-relaxed">
                          Subtracts a fixed value from your result to account for wireless mouse/screen delay. Pro Tip: Use 0ms for raw data.
                      </p>
                  </div>
                  <button onClick={() => setShowSettings(false)} className="btn-primary w-full py-2 text-sm">Save & Close</button>
              </div>
          </div>
      )}

      {/* Mode Switcher */}
      {gameState === GameState.IDLE && history.length === 0 && (
          <div className="flex justify-between items-center mb-6 px-2">
              <div className="flex gap-4">
                  <button 
                     onClick={() => { setMode('visual'); playUiSound('click'); }}
                     className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold uppercase transition-all ${mode === 'visual' ? 'bg-primary-500 text-black border-primary-500' : 'bg-zinc-900 text-zinc-500 border-zinc-800'}`}
                  >
                      <Eye size={14} /> Visual
                  </button>
                  <button 
                     onClick={() => { setMode('audio'); playUiSound('click'); }}
                     className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold uppercase transition-all ${mode === 'audio' ? 'bg-primary-500 text-black border-primary-500' : 'bg-zinc-900 text-zinc-500 border-zinc-800'}`}
                  >
                      <Volume2 size={14} /> Audio
                  </button>
              </div>
              <button onClick={() => setShowSettings(true)} className="text-zinc-600 hover:text-white transition-colors" aria-label="Settings">
                  <Settings2 size={18} />
              </button>
          </div>
      )}

      {/* Main Click Area */}
      {gameState !== GameState.RESULT ? (
          <div 
            role="button"
            tabIndex={0}
            onMouseDown={handleAction}
            onTouchStart={handleAction}
            onKeyDown={(e) => { if(e.key === 'Enter' || e.key === ' ') handleAction(e as any); }}
            className={`
                relative w-full h-[50vh] min-h-[300px] md:h-[400px] rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors duration-150 shadow-2xl overflow-hidden group touch-none
                ${ui.bg}
                ${gameState === GameState.IDLE ? 'hover:bg-zinc-800 border border-zinc-700' : ''}
                ${shake ? 'animate-[shake_0.5s_cubic-bezier(.36,.07,.19,.97)_both]' : ''}
            `}
            aria-label={ui.title}
          >
             <style>{`
                @keyframes shake {
                  10%, 90% { transform: translate3d(-2px, 0, 0); }
                  20%, 80% { transform: translate3d(4px, 0, 0); }
                  30%, 50%, 70% { transform: translate3d(-8px, 0, 0); }
                  40%, 60% { transform: translate3d(8px, 0, 0); }
                }
             `}</style>

             {/* Background pattern */}
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
             
             {/* Click Ripple */}
             {clickPos && (
                 <div 
                    className="absolute w-20 h-20 bg-white rounded-full animate-ping pointer-events-none z-0 opacity-50"
                    style={{ left: clickPos.x - 40, top: clickPos.y - 40 }}
                 ></div>
             )}
             
             <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in duration-200 pointer-events-none">
                 <Icon size={64} className={`mb-6 ${ui.color} ${gameState === GameState.WAITING ? 'animate-pulse' : ''}`} />
                 <h1 className={`text-5xl font-black tracking-tight mb-2 ${ui.color}`}>{ui.title}</h1>
                 <p className={`font-mono text-sm uppercase tracking-widest ${ui.color} opacity-80`}>{ui.sub}</p>
                 {inputLag > 0 && <div className="mt-2 text-[10px] text-zinc-500 font-mono bg-black/20 px-2 py-1 rounded">LAG COMP: -{inputLag}ms</div>}
             </div>
          </div>
      ) : (
          // Result View
          <div className="bg-black border border-zinc-800 rounded-xl p-8 text-center animate-in zoom-in">
              <Medal size={64} className="mx-auto text-primary-500 mb-6" />
              <div className="text-6xl font-bold text-white mb-2">{average} <span className="text-2xl text-zinc-600">ms</span></div>
              <p className="text-zinc-400 mb-8 font-mono uppercase tracking-widest text-xs">
                  {mode === 'audio' ? 'Auditory' : 'Visual'} Reaction Time
                  {inputLag > 0 && <span className="block text-[10px] text-zinc-600 mt-1">(Adjusted -{inputLag}ms)</span>}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-zinc-900 border border-zinc-800 p-3 rounded">
                      <div className="text-[10px] text-zinc-500 uppercase font-mono">Best</div>
                      <div className="text-xl text-white font-bold">{minTime} ms</div>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 p-3 rounded">
                      <div className="text-[10px] text-zinc-500 uppercase font-mono">Stability (Jitter)</div>
                      <div className={`text-xl font-bold ${stdDev < 30 ? 'text-emerald-500' : 'text-yellow-500'}`}>±{stdDev} ms</div>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {/* Consistency Scatter Plot */}
                  <div className="h-40 w-full relative bg-zinc-900/30 rounded border border-zinc-800/50 p-2">
                      <div className="absolute top-2 left-2 text-[10px] text-zinc-500 font-mono flex items-center gap-1">
                          <ScatterIcon size={10} /> CONSISTENCY
                      </div>
                      <ResponsiveContainer width="100%" height="100%">
                          <ScatterChart margin={{ top: 20, right: 20, bottom: 0, left: 0 }}>
                              <XAxis type="number" dataKey="x" name="Attempt" tick={false} axisLine={false} domain={[0, 6]} />
                              <YAxis type="number" dataKey="y" name="Time" unit="ms" stroke="#555" fontSize={10} domain={[minTime - 20, maxTime + 20]} hide />
                              <ZAxis type="number" dataKey="z" range={[60, 60]} />
                              <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#000', borderColor: '#333', fontSize: '10px' }} />
                              <ReferenceLine y={average} stroke="#10b981" strokeDasharray="3 3" />
                              <Scatter name="Reaction" data={scatterData} fill="#06b6d4" />
                          </ScatterChart>
                      </ResponsiveContainer>
                  </div>

                  {/* History Trend Line */}
                  <div className="h-40 w-full relative bg-zinc-900/30 rounded border border-zinc-800/50 p-2">
                      <div className="absolute top-2 left-2 text-[10px] text-zinc-500 font-mono flex items-center gap-1">
                          <History size={10} /> HISTORY (MS)
                      </div>
                      <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={trendData} margin={{ top: 20, right: 10, bottom: 0, left: 0 }}>
                              <Line type="monotone" dataKey="val" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                              <YAxis domain={['auto', 'auto']} hide />
                              <Tooltip contentStyle={{ backgroundColor: '#000', borderColor: '#333', fontSize: '10px' }} />
                          </LineChart>
                      </ResponsiveContainer>
                  </div>
              </div>

              <div className="flex flex-col gap-3">
                  <button 
                    onClick={(e) => { e.stopPropagation(); resetTest(); playUiSound('click'); }}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                      <RotateCcw size={16} /> Press [R] to Restart
                  </button>
                  
                  <Link 
                    href="/test/aim-trainer-test"
                    className="btn-secondary w-full flex items-center justify-center gap-2 text-xs uppercase"
                  >
                      <Crosshair size={14} /> Train Your Aim (Next)
                  </Link>
              </div>
          </div>
      )}

      {/* Stats History Bar (Only visible during play) */}
      {gameState !== GameState.RESULT && (
          <div className="mt-8 grid grid-cols-5 gap-2">
              {[0, 1, 2, 3, 4].map((i) => {
                  const val = history[i];
                  return (
                      <div key={i} className={`h-24 rounded border flex flex-col items-center justify-center transition-all ${val ? 'bg-zinc-900 border-primary-500/50' : 'bg-black border-zinc-800 opacity-50'}`}>
                          <div className="text-[10px] text-zinc-500 font-mono mb-1">RUN {i + 1}</div>
                          <div className={`font-bold text-lg ${val ? 'text-white' : 'text-zinc-700'}`}>
                              {val || '--'}
                          </div>
                      </div>
                  )
              })}
          </div>
      )}

    </div>
  );
};

export default ReactionTimeTest;
