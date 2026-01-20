import React, { useState } from 'react';
import { Brain, RotateCcw } from 'lucide-react';
import { saveStat } from '../../lib/core';

const ChimpTest: React.FC = () => {
  const [level, setLevel] = useState(4); // Starts at 4 numbers
  const [strikes, setStrikes] = useState(0);
  const [phase, setPhase] = useState<'start' | 'play' | 'result'>('start');
  const [grid, setGrid] = useState<{id: number, val: number}[]>([]);
  const [nextNum, setNextNum] = useState(1);
  const [hideNumbers, setHideNumbers] = useState(false);

  const ROWS = 5;
  const COLS = 8;

  const startGame = () => {
     setLevel(4);
     setStrikes(0);
     startLevel(4);
  };

  const startLevel = (numCount: number) => {
     setPhase('play');
     setNextNum(1);
     setHideNumbers(false);

     // Generate positions
     const positions = new Set<number>();
     while(positions.size < numCount) {
        positions.add(Math.floor(Math.random() * (ROWS * COLS)));
     }
     
     const newGrid = Array.from(positions).map((pos, i) => ({
        id: pos,
        val: i + 1
     }));
     setGrid(newGrid);
  };

  const handleClick = (item: {id: number, val: number}) => {
     if (item.val === nextNum) {
        // Correct
        if (item.val === 1) {
           setHideNumbers(true);
        }
        
        setNextNum(n => n + 1);
        
        // Remove item from grid visually (or just mark strictly)
        // Let's filter it out
        setGrid(g => g.filter(x => x.val !== item.val));

        if (grid.length === 1) {
           // Level Complete (last item clicked)
           if (level < 20) {
              setLevel(l => l + 1);
              startLevel(level + 1);
           } else {
              finish(true);
           }
        }
     } else {
        // Wrong
        setStrikes(s => s + 1);
        if (strikes >= 2) {
           finish(false);
        } else {
           // Restart same level or downgrade? usually continue but strikes count
           // Simple version: Reset to same level
           startLevel(level);
        }
     }
  };

  const finish = (win: boolean) => {
     setPhase('result');
     // Max level ~15-20. 
     const score = Math.min(100, Math.round((level / 15) * 100));
     saveStat('chimp-test', score);
  };

  return (
    <div className="max-w-3xl mx-auto select-none">
       {phase === 'start' || phase === 'result' ? (
          <div className="text-center py-12">
             <Brain size={64} className="mx-auto text-zinc-700 mb-6" />
             <h2 className="text-3xl font-bold text-white mb-2">{phase === 'result' ? 'Test Over' : 'Chimp Test'}</h2>
             <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                {phase === 'result' 
                  ? `You memorized ${level} numbers.` 
                  : "Click the numbers in order. They will disappear after the first click. Test your working memory."}
             </p>
             <button onClick={startGame} className="btn-primary">
                {phase === 'start' ? 'Start Test' : 'Try Again'}
             </button>
          </div>
       ) : (
          <div>
             <div className="flex justify-between items-center mb-6 px-4">
                <div className="text-zinc-500 font-mono text-xs">NUMBERS: <span className="text-white text-lg">{level}</span></div>
                <div className="text-zinc-500 font-mono text-xs">STRIKES: <span className="text-white text-lg">{strikes}/3</span></div>
             </div>
             
             <div className="relative w-full aspect-[8/5] bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                {grid.map(item => {
                   const r = Math.floor(item.id / COLS);
                   const c = item.id % COLS;
                   return (
                      <div 
                         key={item.val}
                         onClick={() => handleClick(item)}
                         className="absolute w-[11%] aspect-square flex items-center justify-center rounded-lg border-2 border-white/10 bg-surface hover:bg-zinc-700 cursor-pointer transition-transform active:scale-95 shadow-lg"
                         style={{ 
                            top: `${(r / ROWS) * 100}%`,
                            left: `${(c / COLS) * 100}%`,
                            margin: '1%'
                         }}
                      >
                         <span className={`text-2xl font-bold text-white ${hideNumbers && item.val > 1 ? 'opacity-0' : 'opacity-100'}`}>
                            {item.val}
                         </span>
                         {hideNumbers && item.val > 1 && (
                            <div className="absolute inset-2 bg-white rounded-sm opacity-90"></div>
                         )}
                      </div>
                   );
                })}
             </div>
          </div>
       )}
    </div>
  );
};

export default ChimpTest;