import React, { useState, useRef, useEffect } from 'react';
import { Zap, AlertTriangle, RotateCcw, Clock, BarChart3, Medal, Volume2, Eye, ScatterChart as ScatterIcon } from 'lucide-react';
import { saveStat } from '../../lib/core';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, ZAxis } from 'recharts';

enum GameState { IDLE, WAITING, READY, RESULT, EARLY }

const ReactionTimeTest: React.FC = () => {
  const [mode, setMode] = useState<'visual' | 'audio'>('visual');
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [history, setHistory] = useState<number[]>([]);
  const [average, setAverage] = useState(0);
  const [lastTime, setLastTime] = useState(0);
  const [shake, setShake] = useState(false);
  
  const timeoutRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => { return () => clearExistingTimeout(); }, []);

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
    e.preventDefault(); 
    
    if (gameState === GameState.IDLE || gameState === GameState.RESULT) {
        setHistory([]);
        setAverage(0);
        prepareRound();
        return;
    }

    if (gameState === GameState.WAITING) {
        setGameState(GameState.EARLY);
        setShake(true); // Trigger shake animation
        clearExistingTimeout();
        return;
    }

    if (gameState === GameState.READY) {
        const endTime = Date.now();
        const diff = endTime - startTimeRef.current;
        setLastTime(diff);
        
        const newHistory = [...history, diff];
        setHistory(newHistory);

        if (newHistory.length >= 5) {
            // Finish Set
            const avg = Math.round(newHistory.reduce((a, b) => a + b, 0) / newHistory.length);
            setAverage(avg);
            setGameState(GameState.RESULT);
            const score = Math.max(0, Math.min(100, Math.round(100 - (avg - 150) / 3.5)));
            saveStat('reaction-time', score);
        } else {
            setGameState(GameState.IDLE); 
        }
    }

    if (gameState === GameState.EARLY) {
        prepareRound();
    }
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
      case GameState.EARLY: 
        return { 
            bg: 'bg-zinc-900', 
            icon: AlertTriangle, 
            title: 'Too Early!', 
            sub: 'Click to try again.', 
            color: 'text-yellow-500' 
        };
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

  return (
    <div className="max-w-xl mx-auto select-none">
      
      {/* Mode Switcher */}
      {gameState === GameState.IDLE && history.length === 0 && (
          <div className="flex justify-center mb-6 gap-4">
              <button 
                 onClick={() => setMode('visual')}
                 className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold uppercase transition-all ${mode === 'visual' ? 'bg-primary-500 text-black border-primary-500' : 'bg-zinc-900 text-zinc-500 border-zinc-800'}`}
              >
                  <Eye size={14} /> Visual
              </button>
              <button 
                 onClick={() => setMode('audio')}
                 className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold uppercase transition-all ${mode === 'audio' ? 'bg-primary-500 text-black border-primary-500' : 'bg-zinc-900 text-zinc-500 border-zinc-800'}`}
              >
                  <Volume2 size={14} /> Audio
              </button>
          </div>
      )}

      {/* Main Click Area */}
      {gameState !== GameState.RESULT ? (
          <div 
            onMouseDown={handleAction}
            onTouchStart={handleAction}
            className={`
                relative w-full h-[400px] rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors duration-150 shadow-2xl overflow-hidden group
                ${ui.bg}
                ${gameState === GameState.IDLE ? 'hover:bg-zinc-800 border border-zinc-700' : ''}
                ${shake ? 'animate-[shake_0.5s_cubic-bezier(.36,.07,.19,.97)_both]' : ''}
            `}
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
             
             <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in duration-200">
                 <Icon size={64} className={`mb-6 ${ui.color} ${gameState === GameState.WAITING ? 'animate-pulse' : ''}`} />
                 <h1 className={`text-5xl font-black tracking-tight mb-2 ${ui.color}`}>{ui.title}</h1>
                 <p className={`font-mono text-sm uppercase tracking-widest ${ui.color} opacity-80`}>{ui.sub}</p>
             </div>
          </div>
      ) : (
          // Result View
          <div className="bg-black border border-zinc-800 rounded-xl p-8 text-center animate-in zoom-in">
              <Medal size={64} className="mx-auto text-primary-500 mb-6" />
              <div className="text-6xl font-bold text-white mb-2">{average} <span className="text-2xl text-zinc-600">ms</span></div>
              <p className="text-zinc-400 mb-8 font-mono uppercase tracking-widest text-xs">
                  {mode === 'audio' ? 'Auditory' : 'Visual'} Reaction Time
              </p>

              {/* Consistency Scatter Plot */}
              <div className="h-48 w-full mb-8 relative bg-zinc-900/30 rounded border border-zinc-800/50 p-2">
                  <div className="absolute top-2 left-2 text-[10px] text-zinc-500 font-mono flex items-center gap-1">
                      <ScatterIcon size={10} /> CONSISTENCY_DISTRIBUTION
                  </div>
                  <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                          <XAxis type="number" dataKey="x" name="Attempt" tick={false} axisLine={false} domain={[0, 6]} />
                          <YAxis type="number" dataKey="y" name="Time" unit="ms" stroke="#555" fontSize={10} domain={[minTime - 20, maxTime + 20]} />
                          <ZAxis type="number" dataKey="z" range={[100, 100]} />
                          <Tooltip 
                              cursor={{ strokeDasharray: '3 3' }} 
                              contentStyle={{ backgroundColor: '#000', borderColor: '#333', fontSize: '12px' }} 
                          />
                          <ReferenceLine y={average} stroke="#10b981" strokeDasharray="3 3" />
                          <Scatter name="Reaction" data={scatterData} fill="#06b6d4" />
                      </ScatterChart>
                  </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-zinc-900 border border-zinc-800 p-4 rounded">
                      <div className="text-xs text-zinc-500 uppercase mb-1">Fastest</div>
                      <div className="text-2xl font-bold text-emerald-500">{minTime}ms</div>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 p-4 rounded">
                      <div className="text-xs text-zinc-500 uppercase mb-1">Slowest</div>
                      <div className="text-2xl font-bold text-red-500">{maxTime}ms</div>
                  </div>
              </div>

              <button 
                onClick={(e) => { e.stopPropagation(); setGameState(GameState.IDLE); setHistory([]); }}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                  <RotateCcw size={16} /> Restart Test
              </button>
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