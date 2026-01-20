import React, { useState, useEffect } from 'react';
import { Palette, Play } from 'lucide-react';
import { saveStat } from '../../lib/core';

const ColorHueTest: React.FC = () => {
  const [level, setLevel] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gridSize, setGridSize] = useState(2);
  const [colors, setColors] = useState({ base: '', diff: '' });
  const [diffIndex, setDiffIndex] = useState(0);

  // Generate colors on level change
  useEffect(() => {
    if (isPlaying && !gameOver) {
      generateLevel();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, isPlaying]);

  const generateLevel = () => {
    // Grid grows: 2x2, 3x3... cap at 8x8
    const size = Math.min(8, Math.floor(level / 2) + 2);
    setGridSize(size);

    const hue = Math.floor(Math.random() * 360);
    const sat = 70 + Math.random() * 20;
    const light = 40 + Math.random() * 40;
    
    // Difficulty: difference gets smaller as level increases
    // Level 1: 30% diff, Level 20: 3% diff
    const difficulty = Math.max(2, 25 - level); 
    const isLighter = Math.random() > 0.5;
    const diffLight = isLighter ? light + difficulty : light - difficulty;

    const baseColor = `hsl(${hue}, ${sat}%, ${light}%)`;
    const diffColor = `hsl(${hue}, ${sat}%, ${diffLight}%)`;

    setColors({ base: baseColor, diff: diffColor });
    setDiffIndex(Math.floor(Math.random() * (size * size)));
  };

  const handleTileClick = (index: number) => {
    if (index === diffIndex) {
      setLevel(prev => prev + 1);
    } else {
      endGame();
    }
  };

  const endGame = () => {
    setGameOver(true);
    setIsPlaying(false);
    
    // Calculate Score based on level reached
    // Level 30 is roughly expert/100pts
    const score = Math.min(100, Math.round((level / 30) * 100));
    saveStat('color-hue', score);
  };

  const startGame = () => {
    setLevel(1);
    setGameOver(false);
    setIsPlaying(true);
  };

  if (!isPlaying && !gameOver) {
    return (
      <div className="max-w-xl mx-auto text-center">
        <div className="w-20 h-20 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-dark-700 shadow-inner">
          <Palette size={32} className="text-indigo-400" />
        </div>
        <h2 className="text-2xl font-bold mb-4 text-white">Color Hue Challenge</h2>
        <p className="text-slate-400 mb-8">
          Identify the square that is a slightly different shade. 
          <br />It gets harder with every correct click.
        </p>
        <button onClick={startGame} className="btn-primary w-full max-w-xs mx-auto py-3 flex items-center justify-center gap-2">
          <Play size={18} /> Start Challenge
        </button>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="max-w-xl mx-auto text-center animate-in fade-in zoom-in duration-300">
        <div className="text-6xl mb-4">🎨</div>
        <h2 className="text-3xl font-bold text-white mb-2">Game Over!</h2>
        <p className="text-slate-400 mb-6">You reached <span className="text-brand-400 font-bold text-xl">Level {level}</span></p>
        
        <button onClick={startGame} className="btn-primary px-8 py-3">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-4 px-2">
        <span className="text-slate-400 font-mono">LEVEL {level}</span>
        <span className="text-slate-500 text-xs">Find the odd one out</span>
      </div>

      <div 
        className="grid gap-2 p-2 bg-dark-800 rounded-xl shadow-2xl aspect-square w-full max-w-[400px]"
        style={{ 
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`
        }}
      >
        {Array.from({ length: gridSize * gridSize }).map((_, i) => (
          <button
            key={i}
            onClick={() => handleTileClick(i)}
            className="rounded-md transition-transform active:scale-95 duration-75 shadow-sm"
            style={{ 
              backgroundColor: i === diffIndex ? colors.diff : colors.base 
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorHueTest;