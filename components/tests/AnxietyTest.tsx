import React, { useState, useEffect } from 'react';
import { AlertCircle, Wind, Heart, RotateCcw, Check } from 'lucide-react';
import { saveStat } from '../../lib/core';

const QUESTIONS = [
  { text: "Feeling nervous, anxious, or on edge", options: [{label: "Not at all", value: 0}, {label: "Several days", value: 1}, {label: "Over half the days", value: 2}, {label: "Nearly every day", value: 3}] },
  { text: "Not being able to stop or control worrying", options: [{label: "Not at all", value: 0}, {label: "Several days", value: 1}, {label: "Over half the days", value: 2}, {label: "Nearly every day", value: 3}] },
  { text: "Worrying too much about different things", options: [{label: "Not at all", value: 0}, {label: "Several days", value: 1}, {label: "Over half the days", value: 2}, {label: "Nearly every day", value: 3}] },
  { text: "Trouble relaxing", options: [{label: "Not at all", value: 0}, {label: "Several days", value: 1}, {label: "Over half the days", value: 2}, {label: "Nearly every day", value: 3}] },
  { text: "Being so restless that it is hard to sit still", options: [{label: "Not at all", value: 0}, {label: "Several days", value: 1}, {label: "Over half the days", value: 2}, {label: "Nearly every day", value: 3}] },
  { text: "Becoming easily annoyed or irritable", options: [{label: "Not at all", value: 0}, {label: "Several days", value: 1}, {label: "Over half the days", value: 2}, {label: "Nearly every day", value: 3}] },
  { text: "Feeling afraid, as if something awful might happen", options: [{label: "Not at all", value: 0}, {label: "Several days", value: 1}, {label: "Over half the days", value: 2}, {label: "Nearly every day", value: 3}] }
];

const AnxietyTest: React.FC = () => {
  const [phase, setPhase] = useState<'intro' | 'quiz' | 'result'>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  
  // Breathing App State
  const [breathingState, setBreathingState] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathCount, setBreathCount] = useState(0);
  const [isBreathingActive, setIsBreathingActive] = useState(false);

  const handleAnswer = (val: number) => {
      setScore(s => s + val);
      if (currentQ < QUESTIONS.length - 1) {
          setCurrentQ(q => q + 1);
      } else {
          finishTest(score + val);
      }
  };

  const finishTest = (finalScore: number) => {
      // Normalize to 0-100 for storage (Max GAD-7 score is 21)
      const normalized = Math.min(100, Math.round((finalScore / 21) * 100));
      saveStat('anxiety-test', normalized);
      setPhase('result');
  };

  // Breathing Loop (4-7-8 Technique)
  useEffect(() => {
      if (phase === 'result' && isBreathingActive) {
          let timer: number;
          if (breathingState === 'inhale') {
              timer = window.setTimeout(() => setBreathingState('hold'), 4000);
          } else if (breathingState === 'hold') {
              timer = window.setTimeout(() => setBreathingState('exhale'), 7000);
          } else if (breathingState === 'exhale') {
              timer = window.setTimeout(() => {
                  setBreathingState('inhale');
                  setBreathCount(c => c + 1);
              }, 8000);
          }
          return () => clearTimeout(timer);
      }
  }, [phase, isBreathingActive, breathingState]);

  const severity = score <= 4 ? "Minimal" : score <= 9 ? "Mild" : score <= 14 ? "Moderate" : "Severe";
  const color = score <= 4 ? "text-emerald-500" : score <= 9 ? "text-yellow-500" : score <= 14 ? "text-orange-500" : "text-red-500";

  return (
    <div className="max-w-2xl mx-auto text-center select-none">
       
       {phase === 'intro' && (
           <div className="py-12 animate-in fade-in">
               <AlertCircle size={64} className="mx-auto text-zinc-600 mb-6" />
               <h2 className="text-3xl font-bold text-white mb-2">GAD-7 Anxiety Screener</h2>
               <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                   A clinically validated 7-question tool to assess generalized anxiety disorder severity.
               </p>
               <button onClick={() => setPhase('quiz')} className="btn-primary">Start Assessment</button>
           </div>
       )}

       {phase === 'quiz' && (
           <div className="py-12 animate-in slide-in-from-right">
               <div className="text-xs font-mono text-zinc-500 mb-8">QUESTION {currentQ + 1} / {QUESTIONS.length}</div>
               <h3 className="text-2xl font-medium text-white mb-12 min-h-[80px]">{QUESTIONS[currentQ].text}</h3>
               <div className="space-y-3 max-w-md mx-auto">
                   {QUESTIONS[currentQ].options.map((opt, i) => (
                       <button 
                          key={i} 
                          onClick={() => handleAnswer(opt.value)}
                          className="w-full p-4 border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 hover:border-zinc-600 rounded text-left transition-all text-zinc-300 hover:text-white"
                       >
                           {opt.label}
                       </button>
                   ))}
               </div>
           </div>
       )}

       {phase === 'result' && (
           <div className="py-8 animate-in zoom-in">
               <div className="mb-12">
                   <h2 className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-2">Anxiety Severity</h2>
                   <div className={`text-5xl font-bold ${color} mb-2`}>{severity}</div>
                   <div className="text-zinc-400 text-sm">Score: {score}/21</div>
               </div>

               {/* Breathing Tool */}
               <div className="bg-black border border-zinc-800 p-8 rounded-xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-10">
                       <Wind size={100} />
                   </div>
                   
                   {!isBreathingActive ? (
                       <div className="relative z-10">
                           <h3 className="text-white font-bold mb-2">Feeling overwhelmed?</h3>
                           <p className="text-zinc-400 text-sm mb-6 max-w-xs mx-auto">
                               Try the 4-7-8 breathing technique to activate your parasympathetic nervous system.
                           </p>
                           <button 
                              onClick={() => setIsBreathingActive(true)}
                              className="btn-primary bg-emerald-500 hover:bg-emerald-400 text-black border-none flex items-center justify-center gap-2 mx-auto"
                           >
                               <Wind size={18} /> Start Breathing Exercise
                           </button>
                       </div>
                   ) : (
                       <div className="relative z-10 py-4">
                           <div className="text-xs font-mono text-emerald-500 uppercase tracking-widest mb-8">
                               {breathingState === 'inhale' && "Inhale through nose"}
                               {breathingState === 'hold' && "Hold breath"}
                               {breathingState === 'exhale' && "Exhale through mouth"}
                           </div>
                           
                           {/* Animation Circle */}
                           <div className="relative w-48 h-48 mx-auto mb-8 flex items-center justify-center">
                               <div 
                                  className={`absolute inset-0 bg-emerald-500/20 rounded-full blur-xl transition-all duration-[4000ms] ease-in-out
                                    ${breathingState === 'inhale' ? 'scale-100 opacity-100' : breathingState === 'hold' ? 'scale-100 opacity-80' : 'scale-50 opacity-20'}
                                  `}
                               ></div>
                               <div 
                                  className={`w-32 h-32 border-4 border-emerald-500 rounded-full flex items-center justify-center transition-all ease-in-out relative z-10
                                    ${breathingState === 'inhale' ? 'scale-125 duration-[4000ms]' : breathingState === 'hold' ? 'scale-125 duration-0' : 'scale-75 duration-[8000ms]'}
                                  `}
                               >
                                   <span className="text-2xl font-bold text-white tabular-nums">
                                       {breathingState === 'inhale' ? 4 : breathingState === 'hold' ? 7 : 8}s
                                   </span>
                               </div>
                           </div>

                           <div className="text-zinc-500 text-xs font-mono">
                               Cycles Completed: {breathCount}
                           </div>
                           
                           <button 
                              onClick={() => setIsBreathingActive(false)}
                              className="mt-8 text-xs text-zinc-500 hover:text-white underline"
                           >
                               Stop Exercise
                           </button>
                       </div>
                   )}
               </div>

               <div className="mt-8 text-[10px] text-zinc-600 font-mono">
                   Note: This is a screening tool, not a medical diagnosis.
               </div>
               
               <button onClick={() => window.location.reload()} className="mt-8 btn-secondary flex items-center justify-center gap-2 mx-auto">
                   <RotateCcw size={16} /> Restart
               </button>
           </div>
       )}
    </div>
  );
};

export default AnxietyTest;