import React, { useState } from 'react';
import { Hourglass, Play, Square, RotateCcw } from 'lucide-react';
import { saveStat } from '../../lib/core';

const QUESTIONS = [
  { id: 1, text: "I often find myself doing tasks that aren't urgent just to avoid the important ones.", options: [{label: "Never", value: 5}, {label: "Sometimes", value: 3}, {label: "Always", value: 1}] },
  { id: 2, text: "When I have a deadline, I wait until the last minute to start.", options: [{label: "Never", value: 5}, {label: "Usually", value: 3}, {label: "Always", value: 1}] },
  { id: 3, text: "I underestimate how long a task will take.", options: [{label: "Rarely", value: 5}, {label: "Often", value: 2}, {label: "Always", value: 0}] },
  { id: 4, text: "I make to-do lists but rarely finish them.", options: [{label: "False", value: 5}, {label: "True", value: 1}] },
  { id: 5, text: "I feel guilty about how I spend my time.", options: [{label: "No", value: 5}, {label: "Sometimes", value: 3}, {label: "Yes", value: 1}] },
];

const ProcrastinationTest: React.FC = () => {
  const [phase, setPhase] = useState<'intro' | 'time-test' | 'quiz' | 'result'>('intro');
  
  // Time Blindness Test State
  const [isCounting, setIsCounting] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0); // The user's attempt
  const [timeError, setTimeError] = useState(0); // Deviation %

  const [quizScore, setQuizScore] = useState(0);
  const [qIndex, setQIndex] = useState(0);

  // --- Phase 1: Time Blindness ---
  const startTimer = () => {
      setIsCounting(true);
      setStartTime(performance.now());
  };

  const stopTimer = () => {
      const end = performance.now();
      const duration = (end - startTime) / 1000;
      setEstimatedTime(duration);
      setIsCounting(false);
      
      // Calculate deviation from 10s
      // e.g. 10s target. User clicked at 12s. Error = 20%.
      // User clicked at 8s. Error = 20%.
      const error = Math.abs(duration - 10) / 10;
      setTimeError(error);
      
      setTimeout(() => setPhase('quiz'), 2000);
  };

  // --- Phase 2: Quiz ---
  const handleQuizOption = (val: number) => {
      setQuizScore(s => s + val);
      if (qIndex < QUESTIONS.length - 1) {
          setQIndex(q => q + 1);
      } else {
          finishTest(quizScore + val);
      }
  };

  const finishTest = (finalQuizRaw: number) => {
      // Calculation:
      // Quiz: Max 25 (5*5). 
      // Time Error: > 30% error suggests time blindness (common in procrastination).
      // Let's normalize quiz to 0-100.
      const normalizedQuiz = (finalQuizRaw / 25) * 100;
      
      // Time penalty: If error > 20%, reduce score (indicating higher procrastination tendency)
      // Actually, Procrastination Score = (100 - Quiz%) + (TimeError * 100)
      // High score = High Procrastination.
      // Current Quiz: High value = GOOD (Non-procrastinator). So Low Quiz = Procrastinator.
      
      // Let's produce a "Focus Score" (High is Good)
      const timeAccuracy = Math.max(0, 100 - (timeError * 100 * 1.5)); // 1.5x multiplier for error
      const focusScore = Math.round((normalizedQuiz * 0.7) + (timeAccuracy * 0.3));
      
      saveStat('procrastination-test', focusScore);
      setPhase('result');
  };

  const getResultAnalysis = () => {
      // Calculate derived stats for display
      const quizPercent = Math.round((quizScore / 25) * 100);
      const timeDev = Math.round(timeError * 100);
      const actualTime = estimatedTime.toFixed(2);
      
      const composite = Math.round((quizPercent * 0.7) + (Math.max(0, 100 - timeDev * 1.5) * 0.3));
      
      return { quizPercent, timeDev, actualTime, composite };
  };

  return (
    <div className="max-w-2xl mx-auto text-center select-none">
       
       {phase === 'intro' && (
           <div className="py-12 animate-in fade-in">
               <Hourglass size={64} className="mx-auto text-zinc-600 mb-6" />
               <h2 className="text-3xl font-bold text-white mb-2">Procrastination & Time Blindness</h2>
               <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                   Procrastination is often linked to "Time Blindness"—the inability to accurately sense the passage of time.
                   <br/><br/>
                   <strong>Part 1:</strong> Mental Clock Calibration.<br/>
                   <strong>Part 2:</strong> Behavioral Assessment.
               </p>
               <button onClick={() => setPhase('time-test')} className="btn-primary">Begin Analysis</button>
           </div>
       )}

       {phase === 'time-test' && (
           <div className="py-12 animate-in slide-in-from-right">
               <h3 className="text-xl font-bold text-white mb-8">Internal Clock Challenge</h3>
               
               {!estimatedTime ? (
                   <div className="bg-black border border-zinc-800 p-8 rounded-xl max-w-sm mx-auto">
                       <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
                           Close your eyes (optional). <br/>
                           Click <strong>Start</strong>, count <strong>10 seconds</strong> in your head, then click <strong>Stop</strong>.
                       </p>
                       
                       {!isCounting ? (
                           <button onClick={startTimer} className="w-24 h-24 rounded-full bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all">
                               <Play size={32} fill="white" className="ml-1"/>
                           </button>
                       ) : (
                           <button onClick={stopTimer} className="w-24 h-24 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(239,68,68,0.3)] animate-pulse transition-all">
                               <Square size={32} fill="white" />
                           </button>
                       )}
                       
                       <div className="mt-8 text-xs font-mono text-zinc-600">
                           {isCounting ? "TIMER RUNNING..." : "READY"}
                       </div>
                   </div>
               ) : (
                   <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-xl max-w-sm mx-auto animate-in zoom-in">
                       <div className="text-zinc-500 text-xs uppercase mb-2">Your Estimate</div>
                       <div className={`text-4xl font-bold font-mono mb-4 ${timeError < 0.15 ? 'text-emerald-500' : 'text-yellow-500'}`}>
                           {estimatedTime.toFixed(2)}s
                       </div>
                       <div className="text-xs text-zinc-400">Target: 10.00s</div>
                       <div className="mt-4 text-[10px] text-zinc-600 font-mono">
                           DEVIATION: {Math.round(timeError * 100)}%
                       </div>
                   </div>
               )}
           </div>
       )}

       {phase === 'quiz' && (
           <div className="py-12 animate-in slide-in-from-right">
               <div className="flex justify-between items-center px-8 mb-8">
                   <span className="text-xs font-mono text-zinc-500">PART 2: BEHAVIOR</span>
                   <span className="text-xs font-mono text-primary-500">Q.{qIndex + 1}</span>
               </div>

               <div className="tech-border bg-surface p-8 min-h-[300px] flex flex-col justify-center">
                   <h3 className="text-xl text-white font-medium mb-8">{QUESTIONS[qIndex].text}</h3>
                   <div className="space-y-2">
                       {QUESTIONS[qIndex].options.map((opt, i) => (
                           <button 
                              key={i}
                              onClick={() => handleQuizOption(opt.value)}
                              className="w-full text-left p-4 border border-zinc-800 bg-black/50 hover:bg-zinc-900 hover:border-primary-500/50 text-zinc-400 hover:text-white transition-all rounded"
                           >
                               {opt.label}
                           </button>
                       ))}
                   </div>
               </div>
           </div>
       )}

       {phase === 'result' && (
           <div className="py-12 animate-in zoom-in">
               <div className="mb-8">
                   <h2 className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-2">Focus Score</h2>
                   <div className="text-6xl font-bold text-white mb-2">
                       {getResultAnalysis().composite}
                   </div>
                   <p className="text-zinc-400 text-sm max-w-sm mx-auto">
                       {getResultAnalysis().composite > 75 ? "Master of Time. Excellent discipline and temporal awareness." :
                        getResultAnalysis().composite > 50 ? "Average. Occasional procrastination is normal." :
                        "Chronic Procrastinator. High time blindness detected."}
                   </p>
               </div>

               <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8">
                   <div className="bg-zinc-900 border border-zinc-800 p-4 rounded text-center">
                       <div className="text-xs text-zinc-500 uppercase mb-1">Time Bias</div>
                       <div className={`text-xl font-bold ${getResultAnalysis().timeDev > 20 ? 'text-red-500' : 'text-emerald-500'}`}>
                           {getResultAnalysis().timeDev}%
                       </div>
                       <div className="text-[10px] text-zinc-600 mt-1">
                           ({getResultAnalysis().actualTime}s / 10s)
                       </div>
                   </div>
                   <div className="bg-zinc-900 border border-zinc-800 p-4 rounded text-center">
                       <div className="text-xs text-zinc-500 uppercase mb-1">Discipline</div>
                       <div className="text-xl font-bold text-white">
                           {getResultAnalysis().quizPercent}%
                       </div>
                   </div>
               </div>

               <button onClick={() => window.location.reload()} className="btn-secondary flex items-center justify-center gap-2 mx-auto">
                   <RotateCcw size={16} /> Restart
               </button>
           </div>
       )}
    </div>
  );
};

export default ProcrastinationTest;