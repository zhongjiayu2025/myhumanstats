import React, { useState } from 'react';
import { saveStat } from '../../lib/core';

const COLORS = [
  { name: 'Red', hex: '#ef4444' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Green', hex: '#22c55e' },
  { name: 'Yellow', hex: '#eab308' },
];

const StroopTest: React.FC = () => {
  const [phase, setPhase] = useState<'start' | 'play' | 'end'>('start');
  const [score, setScore] = useState(0);
  const [count, setCount] = useState(0);
  const [current, setCurrent] = useState({ text: 'Red', color: '#ef4444' });
  const [startTime, setStartTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);

  const TOTAL_TRIALS = 10;

  const nextTrial = () => {
    if (count >= TOTAL_TRIALS) {
       finish();
       return;
    }
    
    // Generate new stimulus
    const textIdx = Math.floor(Math.random() * 4);
    const colorIdx = Math.floor(Math.random() * 4);
    
    // Ensure occasional match (congruent) but mostly incongruent? 
    // Random is fine, statistically incongruent.
    
    setCurrent({
       text: COLORS[textIdx].name,
       color: COLORS[colorIdx].hex
    });
    setStartTime(performance.now());
    setCount(c => c + 1);
  };

  const start = () => {
     setScore(0);
     setCount(0);
     setTotalTime(0);
     setPhase('play');
     nextTrial();
  };

  const handleAnswer = (colorName: string) => {
     const endTime = performance.now();
     const reaction = endTime - startTime;
     setTotalTime(t => t + reaction);

     // Check if color of text matches the button clicked
     // current.color is hex. We need to match hex to name.
     const correctColorObj = COLORS.find(c => c.hex === current.color);
     
     if (correctColorObj?.name === colorName) {
        setScore(s => s + 1);
     }
     
     nextTrial();
  };

  const finish = () => {
     setPhase('end');
     const avgTime = totalTime / TOTAL_TRIALS; // ms
     // Score: Accuracy * Speed Factor
     // Perfect: 10/10 accuracy, < 600ms avg.
     
     const accuracy = score / TOTAL_TRIALS;
     const speedScore = Math.max(0, Math.min(100, (1200 - avgTime) / 6)); // 600ms->100, 1200ms->0
     
     const finalScore = Math.round((accuracy * 50) + (speedScore * 0.5));
     saveStat('stroop', finalScore);
  };

  return (
    <div className="max-w-xl mx-auto text-center">
       {phase === 'start' && (
          <div className="py-12">
             <div className="text-6xl font-bold mb-4">
                <span className="text-red-500">B</span>
                <span className="text-blue-500">L</span>
                <span className="text-green-500">U</span>
                <span className="text-yellow-500">E</span>
             </div>
             <p className="text-zinc-400 mb-8">Click the color of the text, not the word itself.</p>
             <button onClick={start} className="btn-primary">Start</button>
          </div>
       )}

       {phase === 'play' && (
          <div className="h-[400px] flex flex-col justify-between">
             <div className="flex-grow flex items-center justify-center">
                <h1 
                   className="text-6xl font-black tracking-tighter transition-all duration-75"
                   style={{ color: current.color }}
                >
                   {current.text}
                </h1>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                {COLORS.map(c => (
                   <button 
                      key={c.name}
                      onClick={() => handleAnswer(c.name)}
                      className="py-6 border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-white font-bold uppercase tracking-widest clip-corner-sm"
                   >
                      {c.name}
                   </button>
                ))}
             </div>
             
             <div className="mt-4 text-[10px] font-mono text-zinc-600">
                TRIAL {count} / {TOTAL_TRIALS}
             </div>
          </div>
       )}

       {phase === 'end' && (
          <div className="py-12">
             <h2 className="text-3xl text-white font-bold mb-4">Results</h2>
             <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="tech-border bg-surface p-4">
                   <div className="text-xs text-zinc-500 uppercase">Accuracy</div>
                   <div className="text-2xl text-white font-mono">{score}/{TOTAL_TRIALS}</div>
                </div>
                <div className="tech-border bg-surface p-4">
                   <div className="text-xs text-zinc-500 uppercase">Avg Reaction</div>
                   <div className="text-2xl text-white font-mono">{Math.round(totalTime / TOTAL_TRIALS)}ms</div>
                </div>
             </div>
             <button onClick={start} className="btn-secondary">Retry</button>
          </div>
       )}
    </div>
  );
};

export default StroopTest;