import React, { useState, useEffect } from 'react';
import { saveStat } from '../../lib/core';

const VisualMemoryTest: React.FC = () => {
  const [level, setLevel] = useState(1);
  const [gridSize, setGridSize] = useState(3);
  const [pattern, setPattern] = useState<number[]>([]);
  const [userPattern, setUserPattern] = useState<number[]>([]);
  const [phase, setPhase] = useState<'start' | 'memorize' | 'recall' | 'gameover'>('start');

  useEffect(() => {
    if (phase === 'memorize') {
       generateLevel();
       const timer = setTimeout(() => {
          setPhase('recall');
       }, 1000 + (level * 200)); 
       return () => clearTimeout(timer);
    }
  }, [phase, level]);

  const generateLevel = () => {
     const size = Math.min(6, 3 + Math.floor((level - 1) / 3));
     const tilesCount = 3 + Math.floor(level / 2);
     
     setGridSize(size);
     
     const newPattern = new Set<number>();
     while(newPattern.size < tilesCount) {
        newPattern.add(Math.floor(Math.random() * (size * size)));
     }
     setPattern(Array.from(newPattern));
     setUserPattern([]);
  };

  const handleTileClick = (index: number) => {
     if (phase !== 'recall') return;
     
     // Check if correct
     if (pattern.includes(index)) {
        // Prevent double click
        if (!userPattern.includes(index)) {
           const newUserPattern = [...userPattern, index];
           setUserPattern(newUserPattern);
           
           if (newUserPattern.length === pattern.length) {
              // Level Complete
              setTimeout(() => {
                 setLevel(l => l + 1);
                 setPhase('memorize');
              }, 500);
           }
        }
     } else {
        // Wrong tile
        saveScore();
        setPhase('gameover');
     }
  };

  const saveScore = () => {
     const score = Math.min(100, Math.round((level / 15) * 100));
     saveStat('visual-memory', score);
  };

  const startGame = () => {
     setLevel(1);
     setPhase('memorize');
  };

  return (
    <div className="max-w-xl mx-auto text-center">
      <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
         <div className="text-left">
            <div className="text-[10px] text-zinc-500 font-mono uppercase">Level</div>
            <div className="text-2xl text-white font-mono">{level}</div>
         </div>
         <div className="text-right">
             <div className="text-[10px] text-zinc-500 font-mono uppercase">Status</div>
             <div className={`text-sm font-bold uppercase tracking-wider ${phase === 'memorize' ? 'text-primary-400' : 'text-zinc-400'}`}>
                {phase === 'start' ? 'Standby' : phase === 'memorize' ? 'Watch Pattern' : phase === 'recall' ? 'Repeat Pattern' : 'Failed'}
             </div>
         </div>
      </div>

      <div className="flex justify-center mb-8">
         {phase === 'start' || phase === 'gameover' ? (
            <div className="h-[300px] flex flex-col items-center justify-center">
               {phase === 'gameover' && (
                  <div className="mb-6 text-red-500 font-bold text-xl">Incorrect Tile!</div>
               )}
               <button onClick={startGame} className="btn-primary">
                  {phase === 'start' ? 'Start Memory Test' : 'Try Again'}
               </button>
            </div>
         ) : (
            <div 
               className="grid gap-2 bg-zinc-900 p-2 rounded-xl"
               style={{ 
                  gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                  width: 'min(100%, 350px)',
                  aspectRatio: '1/1'
               }}
            >
               {Array.from({ length: gridSize * gridSize }).map((_, i) => {
                  const isActive = phase === 'memorize' && pattern.includes(i);
                  const isSelected = userPattern.includes(i);
                  
                  // Fix for TS2367: Use an explicit boolean logic rather than implicit string literal comparison if types are narrow
                  // Actually the error was due to 'phase' being strictly narrowed in map function context possibly?
                  // No, the error likely came from comparing phase (which is 'memorize'|'recall'...) to 'gameover' inside a scope where TS thought it couldn't be 'gameover'.
                  // However, since phase IS typed to include 'gameover', it should be fine unless narrowed by early return.
                  // We can simplify by just checking isSelected && !pattern.includes(i) which implies wrong choice in recall phase.
                  // Or just use the prop to style "wrong" if we wanted to show it.
                  // Since we immediately switch phase to 'gameover' on wrong click, we can just use that.
                  
                  return (
                     <div 
                        key={i}
                        onClick={() => handleTileClick(i)}
                        className={`
                           rounded-md transition-all duration-200 cursor-pointer border border-white/5
                           ${isActive ? 'bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)] scale-105' : 
                             isSelected ? 'bg-primary-500' : 
                             'bg-zinc-800 hover:bg-zinc-700'}
                        `}
                     ></div>
                  );
               })}
            </div>
         )}
      </div>
    </div>
  );
};

export default VisualMemoryTest;