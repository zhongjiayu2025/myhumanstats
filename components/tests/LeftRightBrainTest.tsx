
import React, { useState, useEffect, useRef } from 'react';
import { Brain, Calculator, Image as ImageIcon, RotateCcw, Check, X, Timer } from 'lucide-react';
import { saveStat } from '../../lib/core';

const MATH_TASKS = [
    { q: "12 + 15 = ?", a: "27" },
    { q: "8 x 7 = ?", a: "56" },
    { q: "50 - 18 = ?", a: "32" },
    { q: "100 / 4 = ?", a: "25" }
];

const VISUAL_TASKS = [
    { type: 'color', q: "What color is a Stop sign?", a: "Red", options: ["Red", "Blue", "Green"] },
    { type: 'shape', q: "Which shape has 3 sides?", a: "Triangle", options: ["Square", "Circle", "Triangle"] },
    { type: 'pattern', q: "Sun : Day :: Moon : ?", a: "Night", options: ["Star", "Night", "Light"] }
];

const LeftRightBrainTest: React.FC = () => {
  const [phase, setPhase] = useState<'intro' | 'left-task' | 'right-task' | 'result'>('intro');
  
  // Metrics
  const [leftScore, setLeftScore] = useState(0); // Avg time (lower is better)
  const [rightScore, setRightScore] = useState(0);
  
  // Task State
  const [currentTaskIdx, setCurrentTaskIdx] = useState(0);
  const [taskStartTime, setTaskStartTime] = useState(0);
  const [inputBuffer, setInputBuffer] = useState('');
  
  // Feedback
  const [feedback, setFeedback] = useState<'correct'|'wrong'|null>(null);

  // --- Left Brain (Math) ---
  const startLeftTask = () => {
      setPhase('left-task');
      setCurrentTaskIdx(0);
      setLeftScore(0);
      setInputBuffer('');
      setTaskStartTime(performance.now());
  };

  const handleMathInput = (val: string) => {
      if (val === 'C') setInputBuffer('');
      else if (val === 'Enter') checkMath();
      else if (inputBuffer.length < 3) setInputBuffer(prev => prev + val);
  };

  const checkMath = () => {
      const target = MATH_TASKS[currentTaskIdx];
      if (inputBuffer === target.a) {
          const time = performance.now() - taskStartTime;
          setLeftScore(prev => prev + time);
          
          setFeedback('correct');
          setTimeout(() => {
              setFeedback(null);
              setInputBuffer('');
              if (currentTaskIdx < MATH_TASKS.length - 1) {
                  setCurrentTaskIdx(i => i + 1);
                  setTaskStartTime(performance.now());
              } else {
                  setPhase('right-task'); // Go to next phase
                  setCurrentTaskIdx(0);
                  setTaskStartTime(performance.now()); // Prep right start
              }
          }, 200);
      } else {
          setFeedback('wrong');
          setInputBuffer('');
          setTimeout(() => setFeedback(null), 300);
      }
  };

  // --- Right Brain (Visual) ---
  const handleVisualChoice = (choice: string) => {
      const target = VISUAL_TASKS[currentTaskIdx];
      if (choice === target.a) {
          const time = performance.now() - taskStartTime;
          setRightScore(prev => prev + time);
          
          setFeedback('correct');
          setTimeout(() => {
              setFeedback(null);
              if (currentTaskIdx < VISUAL_TASKS.length - 1) {
                  setCurrentTaskIdx(i => i + 1);
                  setTaskStartTime(performance.now());
              } else {
                  finishTest();
              }
          }, 200);
      } else {
          setFeedback('wrong');
          setTimeout(() => setFeedback(null), 300);
          // Penalty time? No, just force retry for now or ignore
      }
  };

  const finishTest = () => {
      // Calculate dominance
      // Lower score = Faster = Dominant
      // Normalize: If LeftTime < RightTime, Left Dominant.
      
      const leftAvg = leftScore / MATH_TASKS.length;
      const rightAvg = rightScore / VISUAL_TASKS.length;
      
      // Calculate % Right Dominance
      // If Right is faster (lower), percentage should be higher.
      // Ratio: Left / (Left + Right) -> If Left is big (slow), Right is relatively fast (dominant).
      const rightDominance = Math.round((leftAvg / (leftAvg + rightAvg)) * 100);
      
      saveStat('left-right-brain', rightDominance);
      setPhase('result');
  };

  return (
    <div className="max-w-3xl mx-auto text-center select-none">
       
       {phase === 'intro' && (
           <div className="py-12 animate-in fade-in">
               <div className="flex justify-center gap-4 mb-6">
                   <Calculator size={48} className="text-blue-500" />
                   <div className="w-px h-12 bg-zinc-700"></div>
                   <ImageIcon size={48} className="text-purple-500" />
               </div>
               <h2 className="text-3xl font-bold text-white mb-2">Bicameral Challenge</h2>
               <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                   We will test your <strong>Analytical Speed</strong> (Left Brain) vs. your <strong>Intuitive Speed</strong> (Right Brain).
                   <br/>Complete the tasks as fast as possible.
               </p>
               <button onClick={startLeftTask} className="btn-primary">Start Challenge</button>
           </div>
       )}

       {phase === 'left-task' && (
           <div className="py-12 animate-in slide-in-from-right">
               <div className="text-xs font-mono text-blue-500 mb-8 uppercase tracking-widest flex items-center justify-center gap-2">
                   <Calculator size={14}/> LEFT HEMISPHERE: LOGIC
               </div>
               
               <div className={`text-5xl font-mono font-bold text-white mb-12 ${feedback === 'wrong' ? 'text-red-500 animate-shake' : ''}`}>
                   {MATH_TASKS[currentTaskIdx].q}
               </div>

               <div className="max-w-xs mx-auto mb-8">
                   <div className="bg-zinc-900 border border-zinc-700 h-16 rounded-lg flex items-center justify-center text-3xl font-mono text-white tracking-widest shadow-inner">
                       {inputBuffer}
                       <span className="animate-pulse w-2 h-8 bg-blue-500 ml-1"></span>
                   </div>
               </div>

               {/* Numpad */}
               <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                   {[1,2,3,4,5,6,7,8,9].map(n => (
                       <button key={n} onClick={() => handleMathInput(n.toString())} className="h-14 bg-zinc-800 hover:bg-zinc-700 rounded text-xl font-bold text-white border border-zinc-700 shadow-sm active:translate-y-1">{n}</button>
                   ))}
                   <button onClick={() => handleMathInput('C')} className="h-14 bg-red-900/30 text-red-400 rounded border border-red-900/50 font-bold">CLR</button>
                   <button onClick={() => handleMathInput('0')} className="h-14 bg-zinc-800 hover:bg-zinc-700 rounded text-xl font-bold text-white border border-zinc-700">0</button>
                   <button onClick={() => handleMathInput('Enter')} className="h-14 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold">GO</button>
               </div>
           </div>
       )}

       {phase === 'right-task' && (
           <div className="py-12 animate-in slide-in-from-right">
                <div className="text-xs font-mono text-purple-500 mb-8 uppercase tracking-widest flex items-center justify-center gap-2">
                   <ImageIcon size={14}/> RIGHT HEMISPHERE: INTUITION
               </div>

               <div className="bg-black border border-zinc-800 p-12 rounded-xl mb-8 max-w-md mx-auto">
                   <h3 className="text-2xl font-bold text-white">{VISUAL_TASKS[currentTaskIdx].q}</h3>
               </div>

               <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                   {VISUAL_TASKS[currentTaskIdx].options.map((opt, i) => (
                       <button 
                          key={i} 
                          onClick={() => handleVisualChoice(opt)}
                          className="py-6 bg-zinc-900 hover:bg-purple-900/30 border border-zinc-700 hover:border-purple-500 rounded-xl text-lg font-bold text-zinc-300 hover:text-white transition-all active:scale-95"
                       >
                           {opt}
                       </button>
                   ))}
               </div>
           </div>
       )}

       {phase === 'result' && (
           <div className="py-8 animate-in zoom-in">
               <h2 className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-8">Processing Speed Analysis</h2>
               
               {/* Balance Beam Visual */}
               <div className="relative w-64 h-32 mx-auto mb-8">
                   <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-8 bg-zinc-700"></div>
                   <div 
                      className="absolute bottom-8 left-0 w-full h-2 bg-white rounded transition-transform duration-1000 origin-center"
                      style={{ transform: `rotate(${(leftScore - rightScore) / 200}deg)` }} // Tilt based on diff
                   >
                       {/* Left Weight */}
                       <div className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-lg border-4 border-black">
                           <span className="text-xs font-bold text-black">LOGIC</span>
                       </div>
                       {/* Right Weight */}
                       <div className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center shadow-lg border-4 border-black">
                           <span className="text-xs font-bold text-black">ART</span>
                       </div>
                   </div>
               </div>

               <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8">
                   <div className="bg-zinc-900 border border-zinc-800 p-4 rounded text-center">
                       <div className="text-xs text-blue-500 uppercase font-bold mb-1">Left Speed</div>
                       <p className="text-2xl font-mono text-white">{(leftScore / MATH_TASKS.length / 1000).toFixed(2)}s</p>
                   </div>
                   <div className="bg-zinc-900 border border-zinc-800 p-4 rounded text-center">
                       <div className="text-xs text-purple-500 uppercase font-bold mb-1">Right Speed</div>
                       <p className="text-2xl font-mono text-white">{(rightScore / VISUAL_TASKS.length / 1000).toFixed(2)}s</p>
                   </div>
               </div>
               
               <p className="text-zinc-400 text-sm mb-8">
                   {leftScore < rightScore 
                       ? "You are LEFT-BRAIN dominant. Analytical tasks are processed faster."
                       : "You are RIGHT-BRAIN dominant. Visual/Intuitive tasks are processed faster."
                   }
               </p>

               <button onClick={() => { setPhase('intro'); }} className="btn-secondary flex items-center justify-center gap-2 mx-auto">
                   <RotateCcw size={16} /> Retest
               </button>
           </div>
       )}
    </div>
  );
};

export default LeftRightBrainTest;
