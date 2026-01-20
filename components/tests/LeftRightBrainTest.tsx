import React, { useState } from 'react';
import { Brain, Lightbulb, Calculator, RotateCcw } from 'lucide-react';
import { saveStat } from '../../lib/core';

const QUESTIONS = [
  { id: 1, type: 'Right', text: "Look at the word colors.", image: "https://via.placeholder.com/150", task: "Stroop: Color vs Text", options: [{label: "I see the colors first", value: 'Right'}, {label: "I read the words first", value: 'Left'}] },
  { id: 2, type: 'Left', text: "2, 4, 8, 16... What comes next?", options: [{label: "32 (Instant Calculation)", value: 'Left'}, {label: "I have to think about it", value: 'Right'}] },
  { id: 3, type: 'Right', text: "When you meet someone, what do you notice first?", options: [{label: "Their vibe/face", value: 'Right'}, {label: "Their name/status", value: 'Left'}] },
  { id: 4, type: 'Left', text: "Your desk is usually...", options: [{label: "Organized systematically", value: 'Left'}, {label: "Organized chaos", value: 'Right'}] },
  { id: 5, type: 'Right', text: "In a group project, you prefer...", options: [{label: "Brainstorming ideas", value: 'Right'}, {label: "Planning the schedule", value: 'Left'}] },
];

const LeftRightBrainTest: React.FC = () => {
  const [phase, setPhase] = useState<'intro' | 'quiz' | 'result'>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [scores, setScores] = useState({ Left: 0, Right: 0 });

  const handleAnswer = (val: string) => {
      setScores(prev => ({ ...prev, [val]: prev[val as 'Left'|'Right'] + 1 }));
      
      if (currentQ < QUESTIONS.length - 1) {
          setCurrentQ(q => q + 1);
      } else {
          finishTest({ ...scores, [val]: scores[val as 'Left'|'Right'] + 1 });
      }
  };

  const finishTest = (finalScores: {Left: number, Right: number}) => {
      // Calculate dominance percentage
      const total = finalScores.Left + finalScores.Right;
      const rightPercent = Math.round((finalScores.Right / total) * 100);
      
      saveStat('left-right-brain', rightPercent); // Save % Right Brain
      setPhase('result');
  };

  const leftPercent = Math.round((scores.Left / (scores.Left + scores.Right || 1)) * 100);
  const rightPercent = Math.round((scores.Right / (scores.Left + scores.Right || 1)) * 100);

  return (
    <div className="max-w-3xl mx-auto text-center select-none">
       
       {phase === 'intro' && (
           <div className="py-12 animate-in fade-in">
               <div className="flex justify-center gap-2 mb-6">
                   <Brain size={64} className="text-zinc-700" />
               </div>
               <h2 className="text-3xl font-bold text-white mb-2">Hemisphere Dominance</h2>
               <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                   Are you <strong>Left-Brained</strong> (Logical, Analytical) or <strong>Right-Brained</strong> (Creative, Intuitive)?
               </p>
               <button onClick={() => setPhase('quiz')} className="btn-primary">Start Mapping</button>
           </div>
       )}

       {phase === 'quiz' && (
           <div className="py-12 animate-in slide-in-from-right">
               <div className="text-xs font-mono text-zinc-500 mb-8 uppercase tracking-widest">Q.{currentQ + 1} / {QUESTIONS.length}</div>
               <h3 className="text-2xl font-bold text-white mb-8">{QUESTIONS[currentQ].text}</h3>
               
               <div className="grid grid-cols-2 gap-6 max-w-lg mx-auto">
                   {QUESTIONS[currentQ].options.map((opt, i) => (
                       <button 
                          key={i}
                          onClick={() => handleAnswer(opt.value)}
                          className="h-32 border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:border-primary-500/50 rounded-xl p-4 flex flex-col items-center justify-center transition-all group"
                       >
                           {opt.value === 'Left' ? <Calculator size={24} className="mb-2 text-blue-500 opacity-50 group-hover:opacity-100"/> : <Lightbulb size={24} className="mb-2 text-purple-500 opacity-50 group-hover:opacity-100"/>}
                           <span className="text-sm font-medium text-zinc-300 group-hover:text-white">{opt.label}</span>
                       </button>
                   ))}
               </div>
           </div>
       )}

       {phase === 'result' && (
           <div className="py-8 animate-in zoom-in">
               <h2 className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-8">Brain Map</h2>
               
               <div className="relative w-64 h-64 mx-auto mb-12">
                   {/* SVG Brain */}
                   <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
                       {/* Left Hemisphere */}
                       <path 
                          d="M 98 20 C 60 20 20 50 20 100 C 20 160 70 180 98 180 Z" 
                          fill={leftPercent > rightPercent ? '#3b82f6' : '#1e3a8a'} // Blue vs Dark Blue
                          className="transition-colors duration-500"
                          opacity={leftPercent / 100 + 0.3}
                       />
                       {/* Right Hemisphere */}
                       <path 
                          d="M 102 20 C 140 20 180 50 180 100 C 180 160 130 180 102 180 Z" 
                          fill={rightPercent > leftPercent ? '#a855f7' : '#581c87'} // Purple vs Dark Purple
                          className="transition-colors duration-500"
                          opacity={rightPercent / 100 + 0.3}
                       />
                       {/* Divider */}
                       <line x1="100" y1="20" x2="100" y2="180" stroke="#000" strokeWidth="2" />
                   </svg>
                   
                   <div className="absolute top-1/2 left-4 -translate-y-1/2 text-blue-400 font-bold text-xl drop-shadow-md">{leftPercent}%</div>
                   <div className="absolute top-1/2 right-4 -translate-y-1/2 text-purple-400 font-bold text-xl drop-shadow-md">{rightPercent}%</div>
               </div>

               <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8">
                   <div className="bg-zinc-900 border border-zinc-800 p-4 rounded text-center">
                       <div className="text-xs text-blue-500 uppercase font-bold mb-1">Left Brain</div>
                       <p className="text-[10px] text-zinc-400">Logic, Analysis, Sequencing, Linear, Mathematics, Language, Facts.</p>
                   </div>
                   <div className="bg-zinc-900 border border-zinc-800 p-4 rounded text-center">
                       <div className="text-xs text-purple-500 uppercase font-bold mb-1">Right Brain</div>
                       <p className="text-[10px] text-zinc-400">Creativity, Imagination, Holistic, Arts, Rhythm, Feelings.</p>
                   </div>
               </div>

               <button onClick={() => { setScores({Left:0,Right:0}); setCurrentQ(0); setPhase('intro'); }} className="btn-secondary flex items-center justify-center gap-2 mx-auto">
                   <RotateCcw size={16} /> Retest
               </button>
           </div>
       )}
    </div>
  );
};

export default LeftRightBrainTest;