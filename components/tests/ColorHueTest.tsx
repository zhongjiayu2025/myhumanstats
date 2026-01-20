import React, { useState, useEffect, useRef } from 'react';
import { Palette, Play, AlertCircle } from 'lucide-react';
import { saveStat } from '../../lib/core';

const ColorHueTest: React.FC = () => {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [phase, setPhase] = useState<'start' | 'play' | 'end'>('start');
  const [shake, setShake] = useState(false);
  
  // Game Data
  const [gridSize, setGridSize] = useState(2);
  const [colors, setColors] = useState({ base: '', diff: '' });
  const [diffIndex, setDiffIndex] = useState(0);

  const timerRef = useRef<number | null>(null);

  // Timer Logic
  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
       timerRef.current = window.setTimeout(() => setTimeLeft(t => t - 1), 1000);
    } else if (isPlaying && timeLeft <= 0) {
       endGame();
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isPlaying, timeLeft]);

  // Level Gen
  useEffect(() => {
    if (isPlaying) generateLevel();
  }, [level, isPlaying]);

  const generateLevel = () => {
    // Grid: 2x2 -> 8x8 max
    const size = Math.min(8, Math.floor(Math.sqrt(level + 3)));
    setGridSize(size);

    const hue = Math.floor(Math.random() * 360);
    const sat = 70 + Math.random() * 20;
    const light = 40 + Math.random() * 40;
    
    // Difficulty: Opacity/Lightness difference
    // Starts at 20%, decays to ~1-2%
    const difficulty = Math.max(1.5, 20 * Math.pow(0.85, level - 1)); 
    
    const isLighter = Math.random() > 0.5;
    const diffLight = isLighter ? Math.min(100, light + difficulty) : Math.max(0, light - difficulty);

    const baseColor = `hsl(${hue}, ${sat}%, ${light}%)`;
    const diffColor = `hsl(${hue}, ${sat}%, ${diffLight}%)`;

    setColors({ base: baseColor, diff: diffColor });
    setDiffIndex(Math.floor(Math.random() * (size * size)));
  };

  const handleTileClick = (index: number) => {
    if (index === diffIndex) {
      // Correct
      setLevel(l => l + 1);
      setScore(s => s + 1);
      // Bonus time (diminishing returns)
      setTimeLeft(t => Math.min(60, t + 1)); 
    } else {
      // Penalty
      setShake(true);
      setTimeout(() => setShake(false), 400);
      setTimeLeft(t => Math.max(0, t - 3));
    }
  };

  const endGame = () => {
    setIsPlaying(false);
    setPhase('end');
    const finalScore = Math.min(100, Math.round((score / 40) * 100)); // ~40 levels is pro
    saveStat('color-hue', finalScore);
  };

  const startGame = () => {
    setLevel(1);
    setScore(0);
    setTimeLeft(60);
    setPhase('play');
    setIsPlaying(true);
  };

  return (
    <div className="max-w-xl mx-auto flex flex-col items-center select-none">
      
      {phase === 'start' && (
          <div className="text-center py-12 animate-in fade-in">
             <div className="w-24 h-24 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Palette size={40} className="text-pink-500" />
             </div>
             <h2 className="text-3xl font-bold text-white mb-2">Color Hue Test</h2>
             <p className="text-zinc-400 mb-8 max-w-sm mx-auto">
                Find the odd colored tile. 
                <br/>You have 60 seconds. Correct answers add time. Wrong answers subtract time.
             </p>
             <button onClick={startGame} className="btn-primary flex items-center gap-2 mx-auto">
                <Play size={18} /> Start Kuku Kube
             </button>
          </div>
      )}

      {phase === 'play' && (
          <div className="w-full">
             <div className="flex justify-between items-center mb-6 px-4">
                <div className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-full font-mono text-xl text-white font-bold">
                   Score: {score}
                </div>
                <div className="relative w-12 h-12 flex items-center justify-center">
                    {/* SVG Timer Ring */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle cx="24" cy="24" r="20" fill="none" stroke="#27272a" strokeWidth="4" />
                        <circle 
                            cx="24" cy="24" r="20" fill="none" stroke={timeLeft < 10 ? '#ef4444' : '#06b6d4'} strokeWidth="4"
                            strokeDasharray="125.6"
                            strokeDashoffset={125.6 - ((timeLeft/60) * 125.6)}
                            className="transition-all duration-1000 ease-linear"
                        />
                    </svg>
                    <span className={`text-xs font-bold ${timeLeft < 10 ? 'text-red-500' : 'text-white'}`}>{timeLeft}</span>
                </div>
             </div>

             <div 
               className={`grid gap-2 p-4 bg-zinc-900 rounded-full shadow-2xl aspect-square w-full max-w-[400px] mx-auto border border-zinc-800 transition-transform duration-100 ${shake ? 'translate-x-2' : ''}`}
               style={{ 
                 gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                 gridTemplateRows: `repeat(${gridSize}, 1fr)`
               }}
             >
               {Array.from({ length: gridSize * gridSize }).map((_, i) => (
                 <button
                   key={i}
                   onMouseDown={() => handleTileClick(i)} // Faster response than onClick
                   className="rounded-full transition-transform active:scale-90 duration-75 shadow-inner border border-black/10 hover:brightness-110"
                   style={{ 
                     backgroundColor: i === diffIndex ? colors.diff : colors.base 
                   }}
                 />
               ))}
             </div>
          </div>
      )}

      {phase === 'end' && (
          <div className="text-center py-12 animate-in zoom-in">
             <AlertCircle size={64} className="mx-auto text-zinc-600 mb-6" />
             <div className="text-6xl font-bold text-white mb-2">{score}</div>
             <p className="text-zinc-500 uppercase font-mono tracking-widest mb-8">Final Score</p>
             
             <div className="bg-zinc-900/50 p-4 rounded border border-zinc-800 mb-8 max-w-sm mx-auto text-sm text-zinc-400">
                {score > 45 ? "Eagle Eye. Top 1% vision." : 
                 score > 30 ? "Excellent. Great color discrimination." : 
                 score > 20 ? "Average. Normal vision." : 
                 "Below Average. Might want to check your screen calibration."}
             </div>

             <button onClick={startGame} className="btn-primary">Try Again</button>
          </div>
      )}

    </div>
  );
};

export default ColorHueTest;