import React, { useState, useRef, useEffect } from 'react';
import { Activity, AlertOctagon, MousePointer2, RotateCcw } from 'lucide-react';
import { saveStat } from '../../lib/core';

// ASRS-v1.1 Part A
const ASRS_QUESTIONS = [
  { id: 1, text: "How often do you have trouble wrapping up the final details of a project?", options: [{label: "Never", value: 0}, {label: "Rarely", value: 1}, {label: "Sometimes", value: 2}, {label: "Often", value: 3}, {label: "Very Often", value: 4}] },
  { id: 2, text: "How often do you have difficulty getting things in order?", options: [{label: "Never", value: 0}, {label: "Rarely", value: 1}, {label: "Sometimes", value: 2}, {label: "Often", value: 3}, {label: "Very Often", value: 4}] },
  { id: 3, text: "How often do you have problems remembering appointments?", options: [{label: "Never", value: 0}, {label: "Rarely", value: 1}, {label: "Sometimes", value: 2}, {label: "Often", value: 3}, {label: "Very Often", value: 4}] },
  { id: 4, text: "When you have a task that requires a lot of thought, how often do you avoid or delay getting started?", options: [{label: "Never", value: 0}, {label: "Rarely", value: 1}, {label: "Sometimes", value: 2}, {label: "Often", value: 3}, {label: "Very Often", value: 4}] },
  { id: 5, text: "How often do you fidget or squirm with your hands or feet?", options: [{label: "Never", value: 0}, {label: "Rarely", value: 1}, {label: "Sometimes", value: 2}, {label: "Often", value: 3}, {label: "Very Often", value: 4}] },
  { id: 6, text: "How often do you feel overly active and compelled to do things?", options: [{label: "Never", value: 0}, {label: "Rarely", value: 1}, {label: "Sometimes", value: 2}, {label: "Often", value: 3}, {label: "Very Often", value: 4}] }
];

const ADHDTest: React.FC = () => {
  const [phase, setPhase] = useState<'intro' | 'gonogo' | 'quiz' | 'result'>('intro');
  
  // Go/No-Go State
  const [gonogoState, setGonogoState] = useState<'wait' | 'go' | 'nogo' | 'feedback'>('wait');
  const [impulseErrors, setImpulseErrors] = useState(0); // Clicked on No-Go
  const [trial, setTrial] = useState(0);
  const TOTAL_TRIALS = 15;
  const timerRef = useRef<number | null>(null);

  // Quiz State
  const [quizScore, setQuizScore] = useState(0);
  const [qIndex, setQIndex] = useState(0);

  // --- GO / NO-GO LOGIC ---
  const startGoNoGo = () => {
      setPhase('gonogo');
      setTrial(0);
      setImpulseErrors(0);
      scheduleTrial();
  };

  const scheduleTrial = () => {
      setGonogoState('wait');
      const delay = 1000 + Math.random() * 1500;
      timerRef.current = window.setTimeout(() => {
          // 30% chance of No-Go (Red)
          const isNoGo = Math.random() < 0.3;
          setGonogoState(isNoGo ? 'nogo' : 'go');
          
          // Auto-fail if too slow on Go
          timerRef.current = window.setTimeout(() => {
              if (isNoGo) {
                  handleSuccess(); // Correctly ignored No-Go
              } else {
                  handleMiss(); // Missed Go
              }
          }, 800); // 800ms window
      }, delay);
  };

  const handleInput = (e?: React.MouseEvent | KeyboardEvent) => {
      if (e) e.preventDefault();
      if (phase !== 'gonogo') return;
      if (timerRef.current) clearTimeout(timerRef.current);
      
      if (gonogoState === 'go') {
          handleSuccess();
      } else if (gonogoState === 'nogo') {
          setImpulseErrors(prev => prev + 1);
          flashFeedback();
      }
  };

  // Add Keyboard Listener
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (e.code === 'Space') {
              handleInput(e);
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, gonogoState]);

  const handleSuccess = () => {
      nextTrial();
  };

  const handleMiss = () => {
      nextTrial();
  };

  const flashFeedback = () => {
      setGonogoState('feedback');
      setTimeout(nextTrial, 500);
  };

  const nextTrial = () => {
      if (trial + 1 >= TOTAL_TRIALS) {
          setPhase('quiz');
      } else {
          setTrial(t => t + 1);
          scheduleTrial();
      }
  };

  // --- QUIZ LOGIC ---
  const handleQuizOption = (val: number) => {
      setQuizScore(s => s + val);
      if (qIndex < ASRS_QUESTIONS.length - 1) {
          setQIndex(q => q + 1);
      } else {
          finishTest(quizScore + val);
      }
  };

  const finishTest = (finalQuizRaw: number) => {
      // Logic:
      // Impulse Score: (15 - errors) / 15
      // Quiz Score: (Raw / 24) * 100
      // High score = High ADHD likelihood for Quiz.
      // High Impulse Errors = High ADHD likelihood.
      
      // Let's normalize everything to "ADHD Likelihood Score" 0-100.
      const impulseScore = (impulseErrors / (TOTAL_TRIALS * 0.3)) * 100; // % of No-Go's failed
      const symptomScore = (finalQuizRaw / 24) * 100;
      
      const composite = Math.min(100, Math.round((impulseScore * 0.4) + (symptomScore * 0.6)));
      saveStat('adhd-test', composite);
      setPhase('result');
  };

  return (
    <div className="max-w-2xl mx-auto select-none" onMouseDown={phase === 'gonogo' ? handleInput : undefined}>
       <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-8px); }
            75% { transform: translateX(8px); }
          }
          .animate-shake { animation: shake 0.3s ease-in-out; }
       `}</style>

       {phase === 'intro' && (
           <div className="text-center py-12 animate-in fade-in">
               <Activity size={64} className="mx-auto text-amber-500 mb-6" />
               <h2 className="text-3xl font-bold text-white mb-2">ADHD Screener Plus</h2>
               <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                   A comprehensive assessment combining:
                   <br/>1. <strong>Go/No-Go Task:</strong> Measures impulse control behaviorally.
                   <br/>2. <strong>ASRS-v1.1:</strong> Standardized symptom checklist.
               </p>
               <button onClick={startGoNoGo} className="btn-primary">Start Assessment</button>
           </div>
       )}

       {phase === 'gonogo' && (
           <div className="py-12 flex flex-col items-center justify-center min-h-[400px]">
               <div className="mb-8 text-center">
                   <h3 className="text-xl font-bold text-white mb-2">Impulse Control Task</h3>
                   <p className="text-zinc-500 text-sm">
                       Press Space / Click on <strong className="text-emerald-500">GREEN</strong>. <br/>
                       Do NOT press on <strong className="text-red-500">RED</strong>.
                   </p>
                   <div className="text-xs font-mono text-zinc-600 mt-2">TRIAL {trial+1}/{TOTAL_TRIALS}</div>
               </div>

               <div className={`
                   w-48 h-48 rounded-2xl flex items-center justify-center transition-all duration-75 shadow-2xl cursor-pointer
                   ${gonogoState === 'wait' ? 'bg-zinc-800 border-2 border-zinc-700' : ''}
                   ${gonogoState === 'go' ? 'bg-emerald-500 scale-110 shadow-[0_0_50px_#10b981]' : ''}
                   ${gonogoState === 'nogo' ? 'bg-red-500 scale-110 shadow-[0_0_50px_#ef4444]' : ''}
                   ${gonogoState === 'feedback' ? 'bg-red-900 border-red-500 animate-shake' : ''}
               `}>
                   {gonogoState === 'go' && <MousePointer2 size={64} className="text-black" />}
                   {gonogoState === 'nogo' && <AlertOctagon size={64} className="text-black" />}
                   {gonogoState === 'feedback' && <span className="text-red-500 font-bold text-xl">MISTAKE</span>}
               </div>
           </div>
       )}

       {phase === 'quiz' && (
           <div className="py-12 animate-in slide-in-from-right">
               <div className="flex justify-between items-center mb-8 px-4 border-b border-zinc-800 pb-4">
                   <span className="text-xs font-mono text-zinc-500">PART 2: ASRS CHECKLIST</span>
                   <span className="text-xs font-mono text-amber-500">Q.{qIndex + 1}</span>
               </div>

               <div className="tech-border bg-surface p-8 min-h-[300px] flex flex-col justify-center">
                   <h3 className="text-xl text-white font-medium mb-8">{ASRS_QUESTIONS[qIndex].text}</h3>
                   <div className="space-y-2">
                       {ASRS_QUESTIONS[qIndex].options.map((opt, i) => (
                           <button 
                              key={i}
                              onClick={() => handleQuizOption(opt.value)}
                              className="w-full text-left p-4 border border-zinc-800 bg-black/50 hover:bg-zinc-900 hover:border-amber-500/50 text-zinc-400 hover:text-white transition-all rounded"
                           >
                               {opt.label}
                           </button>
                       ))}
                   </div>
               </div>
           </div>
       )}

       {phase === 'result' && (
           <div className="py-12 text-center animate-in zoom-in">
               <h2 className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-4">ADHD Likelihood Score</h2>
               
               {/* Calc composite for display */}
               <div className="text-6xl font-bold text-white mb-8">
                   {Math.round(((impulseErrors / (TOTAL_TRIALS * 0.3)) * 100 * 0.4) + ((quizScore / 24) * 100 * 0.6))}
                   <span className="text-2xl text-zinc-600">%</span>
               </div>

               <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8">
                   <div className="bg-zinc-900 border border-zinc-800 p-4 rounded text-center">
                       <div className="text-xs text-zinc-500 uppercase mb-1">Impulsivity</div>
                       <div className={`text-xl font-bold ${impulseErrors > 1 ? 'text-red-500' : 'text-emerald-500'}`}>
                           {impulseErrors} Errors
                       </div>
                       <div className="text-[10px] text-zinc-600 mt-1">NO-GO FAILURES</div>
                   </div>
                   <div className="bg-zinc-900 border border-zinc-800 p-4 rounded text-center">
                       <div className="text-xs text-zinc-500 uppercase mb-1">Symptoms</div>
                       <div className="text-xl font-bold text-white">
                           {Math.round((quizScore / 24) * 100)}%
                       </div>
                       <div className="text-[10px] text-zinc-600 mt-1">ASRS MATCH</div>
                   </div>
               </div>

               <div className="bg-zinc-900/50 p-6 rounded border border-zinc-800 text-left text-sm text-zinc-400 mb-8">
                   <strong className="text-white block mb-2">Assessment Analysis:</strong>
                   {impulseErrors > 2 ? 
                       "You demonstrated significant difficulty inhibiting motor responses during the No-Go task, a common behavioral marker of impulsivity." : 
                       "You performed well on the impulse control task, suggesting good executive inhibition."
                   }
                   <br/><br/>
                   Combined with your symptom report, the results suggest {quizScore > 14 ? "a high probability of adult ADHD." : "you likely do not meet the clinical criteria for ADHD."}
               </div>

               <button onClick={() => window.location.reload()} className="btn-secondary flex items-center gap-2 justify-center mx-auto">
                   <RotateCcw size={16} /> Retake Assessment
               </button>
           </div>
       )}
    </div>
  );
};

export default ADHDTest;