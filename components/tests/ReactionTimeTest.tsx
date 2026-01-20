import React, { useState, useRef, useEffect } from 'react';
import { Zap, AlertTriangle, CheckCircle, Share2, Check } from 'lucide-react';
import { saveStat } from '../../lib/core';

enum GameState { IDLE, WAITING, READY, RESULT, EARLY }

const ReactionTimeTest: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [time, setTime] = useState(0);
  const [copied, setCopied] = useState(false);
  
  const timeoutRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);

  useEffect(() => { return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }; }, []);

  const startTest = () => {
    setGameState(GameState.WAITING);
    setCopied(false);
    const delay = Math.floor(Math.random() * 2000) + 2000;
    timeoutRef.current = window.setTimeout(() => {
      setGameState(GameState.READY);
      startTimeRef.current = Date.now();
    }, delay);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (gameState === GameState.IDLE) startTest();
    else if (gameState === GameState.WAITING) { setGameState(GameState.EARLY); if (timeoutRef.current) clearTimeout(timeoutRef.current); }
    else if (gameState === GameState.READY) {
      const endTime = Date.now();
      const reactionTime = endTime - startTimeRef.current;
      setTime(reactionTime);
      setGameState(GameState.RESULT);
      const score = Math.max(0, Math.min(100, Math.round(100 - (reactionTime - 150) / 3.5)));
      saveStat('reaction-time', score);
    } else if (gameState === GameState.RESULT || gameState === GameState.EARLY) { 
        // Don't restart on click if clicking a specific button, handled by propagation
        startTest(); 
    }
  };

  const copyResult = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent restarting game
    const text = `⚡️ My Reaction Time: ${time}ms. Benchmarked at: myhumanstats.org/test/reaction-time-test`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getConfig = () => {
    switch(gameState) {
      case GameState.IDLE: return { color: 'border-zinc-600', bg: 'bg-zinc-900', icon: Zap, text: 'SYSTEM STANDBY', sub: 'Click to Initialize Reflex Test' };
      case GameState.WAITING: return { color: 'border-rose-900', bg: 'bg-rose-950', icon: AlertTriangle, text: 'AWAIT SIGNAL...', sub: 'Hold Position' };
      case GameState.READY: return { color: 'border-emerald-500', bg: 'bg-emerald-500', icon: Zap, text: 'ENGAGE!', sub: 'Click Now!' };
      case GameState.RESULT: return { color: 'border-primary-500', bg: 'bg-primary-900', icon: CheckCircle, text: `${time}ms`, sub: 'Latency Logged. Click to Retry.' };
      case GameState.EARLY: return { color: 'border-amber-500', bg: 'bg-amber-900', icon: AlertTriangle, text: 'MISFIRE', sub: 'Premature Engagement' };
    }
  };

  const config = getConfig();
  const LucideIcon = config.icon;

  return (
    <div className="max-w-xl mx-auto h-[400px] select-none">
      <div 
        onClick={handleClick}
        className={`
          w-full h-full relative group cursor-pointer transition-all duration-100 ease-out
          border-2 ${gameState === GameState.READY ? 'border-transparent' : config.color}
          ${config.bg}
          clip-corner-lg
        `}
      >
        {/* Background Patterns */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%,transparent_100%)] bg-[size:20px_20px] opacity-20 pointer-events-none"></div>
        
        {/* Central Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
           <div className={`p-6 rounded-full border-2 ${config.color} bg-black/30 backdrop-blur-sm mb-6 transition-transform duration-200 group-active:scale-95`}>
              <LucideIcon size={48} className="text-white" />
           </div>
           
           <h1 className="text-5xl md:text-6xl font-black italic tracking-tighter text-white mb-2 text-center text-shadow-lg">
             {config.text}
           </h1>
           <p className="text-white/70 font-mono text-sm uppercase tracking-widest">{config.sub}</p>

           {/* Social Share Button (Only visible on result) */}
           {gameState === GameState.RESULT && (
              <button 
                onClick={copyResult}
                className={`mt-8 px-6 py-2 rounded-full border flex items-center gap-2 text-xs font-bold uppercase transition-all z-20 ${copied ? 'bg-emerald-500 border-emerald-400 text-black' : 'bg-black/50 border-white/20 text-white hover:bg-white hover:text-black'}`}
              >
                 {copied ? <Check size={14} /> : <Share2 size={14} />}
                 {copied ? 'Copied to Clipboard' : 'Share Result'}
              </button>
           )}
        </div>

        {/* Decorative Corners */}
        <div className="absolute top-0 left-0 p-4">
           <div className={`w-16 h-16 border-t-2 border-l-2 ${config.color} opacity-50`}></div>
        </div>
        <div className="absolute bottom-0 right-0 p-4">
           <div className={`w-16 h-16 border-b-2 border-r-2 ${config.color} opacity-50`}></div>
        </div>

        {/* Scanlines Overlay for Ready State */}
        {gameState === GameState.READY && (
           <div className="absolute inset-0 bg-emerald-500 mix-blend-overlay animate-pulse"></div>
        )}
      </div>

      <div className="mt-6 flex justify-between text-zinc-600 font-mono text-[10px] uppercase">
        <span>Reflex_Monitor_v1.0</span>
        <span>Avg_Human_Latency: 273ms</span>
      </div>
    </div>
  );
};

export default ReactionTimeTest;