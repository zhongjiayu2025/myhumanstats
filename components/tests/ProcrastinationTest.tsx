
import React, { useState, useEffect, useRef } from 'react';
import { Hourglass, Play, Square, RotateCcw, Hand, AlertTriangle, MessageSquare, Bell } from 'lucide-react';
import { saveStat } from '../../lib/core';

const QUESTIONS = [
  { id: 1, text: "I often find myself doing tasks that aren't urgent just to avoid the important ones.", options: [{label: "Never", value: 5}, {label: "Sometimes", value: 3}, {label: "Always", value: 1}] },
  { id: 2, text: "When I have a deadline, I wait until the last minute to start.", options: [{label: "Never", value: 5}, {label: "Usually", value: 3}, {label: "Always", value: 1}] },
  { id: 3, text: "I underestimate how long a task will take.", options: [{label: "Rarely", value: 5}, {label: "Often", value: 2}, {label: "Always", value: 0}] },
  { id: 4, text: "I make to-do lists but rarely finish them.", options: [{label: "False", value: 5}, {label: "True", value: 1}] },
  { id: 5, text: "I feel guilty about how I spend my time.", options: [{label: "No", value: 5}, {label: "Sometimes", value: 3}, {label: "Yes", value: 1}] },
];

const ProcrastinationTest: React.FC = () => {
  const [phase, setPhase] = useState<'intro' | 'impulse-test' | 'time-test' | 'quiz' | 'result'>('intro');
  
  // Impulse Test (Marshmallow)
  const [holding, setHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [distraction, setDistraction] = useState<{type: 'msg'|'notif', x:number, y:number} | null>(null);
  const [impulseFail, setImpulseFail] = useState(false);
  const holdTimerRef = useRef<number | null>(null);

  // Time Blindness
  const [isCounting, setIsCounting] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [timeError, setTimeError] = useState(0);

  const [quizScore, setQuizScore] = useState(0);
  const [qIndex, setQIndex] = useState(0);

  // --- PHASE 1: IMPULSE CONTROL (Marshmallow) ---
  const startHold = () => {
      setHolding(true);
      setHoldProgress(0);
      setImpulseFail(false);
      setDistraction(null);
      
      let p = 0;
      const interval = setInterval(() => {
          p += 1; // 100ms ticks, need 100 ticks for 10s? No, make it 8s fast.
          setHoldProgress(prev => Math.min(100, prev + 1));
          
          // Distractions
          if (p === 30 || p === 60 || p === 80) {
              setDistraction({
                  type: Math.random() > 0.5 ? 'msg' : 'notif',
                  x: Math.random() * 60 + 20, // %
                  y: Math.random() * 60 + 20  // %
              });
              setTimeout(() => setDistraction(null), 1500);
          }

          if (p >= 100) {
              clearInterval(interval);
              setHolding(false);
              setPhase('time-test');
          }
      }, 80); // 8 seconds total
      holdTimerRef.current = interval as any;
  };

  const releaseHold = () => {
      if (holdProgress < 100 && holding) {
          if(holdTimerRef.current) clearInterval(holdTimerRef.current);
          setHolding(false);
          setImpulseFail(true);
          // Penalty applied later
          setTimeout(() => setPhase('time-test'), 1500);
      }
  };

  // --- PHASE 2: TIME BLINDNESS ---
  const startTimer = () => {
      setIsCounting(true);
      setStartTime(performance.now());
  };

  const stopTimer = () => {
      const end = performance.now();
      const duration = (end - startTime) / 1000;
      setEstimatedTime(duration);
      setIsCounting(false);
      
      const error = Math.abs(duration - 10) / 10;
      setTimeError(error);
      
      setTimeout(() => setPhase('quiz'), 2000);
  };

  // --- PHASE 3: QUIZ ---
  const handleQuizOption = (val: number) => {
      setQuizScore(s => s + val);
      if (qIndex < QUESTIONS.length - 1) {
          setQIndex(q => q + 1);
      } else {
          finishTest(quizScore + val);
      }
  };

  const finishTest = (finalQuizRaw: number) => {
      // Scores
      const normalizedQuiz = (finalQuizRaw / 25) * 100;
      const timeAccuracy = Math.max(0, 100 - (timeError * 100 * 1.5));
      const impulseScore = impulseFail ? 0 : 100; // Binary pass/fail for this mini game
      
      // Composite: 50% Quiz, 25% Time, 25% Impulse
      const focusScore = Math.round((normalizedQuiz * 0.5) + (timeAccuracy * 0.25) + (impulseScore * 0.25));
      
      saveStat('procrastination-test', focusScore);
      setPhase('result');
  };

  return (
    <div className="max-w-2xl mx-auto text-center select-none touch-none">
       
       {phase === 'intro' && (
           <div className="py-12 animate-in fade-in">
               <Hourglass size={64} className="mx-auto text-zinc-600 mb-6" />
               <h2 className="text-3xl font-bold text-white mb-2">Procrastination Analysis</h2>
               <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                   We test three pillars of execution:
                   <br/>1. <strong>Impulse Control</strong> (The Marshmallow Test)
                   <br/>2. <strong>Time Perception</strong> (Internal Clock)
                   <br/>3. <strong>Behavioral Habits</strong> (Self-Report)
               </p>
               <button onClick={() => setPhase('impulse-test')} className="btn-primary">Start</button>
           </div>
       )}

       {phase === 'impulse-test' && (
           <div className="py-12 animate-in slide-in-from-right relative h-[400px] flex flex-col items-center justify-center">
               <h3 className="text-white font-bold mb-8">Test 1: Impulse Control</h3>
               
               {/* Distraction Popup */}
               {distraction && (
                   <div 
                      className="absolute bg-zinc-800 border border-zinc-700 p-3 rounded shadow-2xl flex items-center gap-3 animate-in zoom-in-50 slide-in-from-bottom-2 z-20 pointer-events-none"
                      style={{ top: `${distraction.y}%`, left: `${distraction.x}%` }}
                   >
                       {distraction.type === 'msg' ? <MessageSquare size={20} className="text-blue-500"/> : <Bell size={20} className="text-yellow-500"/>}
                       <div className="text-left">
                           <div className="text-[10px] font-bold text-white">New Notification</div>
                           <div className="text-[8px] text-zinc-400">Just now</div>
                       </div>
                   </div>
               )}

               {!impulseFail ? (
                   <div className="relative">
                       <button
                          onMouseDown={startHold}
                          onMouseUp={releaseHold}
                          onTouchStart={(e) => { e.preventDefault(); startHold(); }}
                          onTouchEnd={releaseHold}
                          className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center transition-all active:scale-95 ${holding ? 'border-primary-500 bg-primary-900/20' : 'border-zinc-600 bg-zinc-900'}`}
                       >
                           <Hand size={32} className={holding ? 'text-primary-500' : 'text-zinc-500'} />
                           <span className="text-xs font-bold mt-2 text-zinc-300">{holding ? 'HOLD...' : 'HOLD ME'}</span>
                       </button>
                       {holding && (
                           <div className="absolute -bottom-8 left-0 w-full h-1 bg-zinc-800 rounded overflow-hidden">
                               <div className="h-full bg-primary-500 transition-all duration-75" style={{ width: `${holdProgress}%` }}></div>
                           </div>
                       )}
                   </div>
               ) : (
                   <div className="text-red-500 font-bold animate-pulse">
                       <AlertTriangle size={48} className="mx-auto mb-2"/>
                       IMPULSE FAILED
                   </div>
               )}
               
               <p className="mt-12 text-zinc-500 text-xs">Don't let go until the bar fills. Ignore distractions.</p>
           </div>
       )}

       {phase === 'time-test' && (
           <div className="py-12 animate-in slide-in-from-right">
               <h3 className="text-xl font-bold text-white mb-8">Test 2: Time Blindness</h3>
               
               {!estimatedTime ? (
                   <div className="bg-black border border-zinc-800 p-8 rounded-xl max-w-sm mx-auto">
                       <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
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
                   </div>
               ) : (
                   <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-xl max-w-sm mx-auto animate-in zoom-in">
                       <div className="text-zinc-500 text-xs uppercase mb-2">Your Estimate</div>
                       <div className={`text-4xl font-bold font-mono mb-4 ${timeError < 0.15 ? 'text-emerald-500' : 'text-yellow-500'}`}>
                           {estimatedTime.toFixed(2)}s
                       </div>
                       <div className="text-xs text-zinc-400">Target: 10.00s</div>
                   </div>
               )}
           </div>
       )}

       {phase === 'quiz' && (
           <div className="py-12 animate-in slide-in-from-right">
               <div className="text-xs font-mono text-zinc-500 mb-8">PART 3: BEHAVIOR ({qIndex + 1}/{QUESTIONS.length})</div>
               <h3 className="text-xl text-white font-medium mb-8">{QUESTIONS[qIndex].text}</h3>
               <div className="space-y-2 max-w-md mx-auto">
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
       )}

       {phase === 'result' && (
           <div className="py-12 animate-in zoom-in">
               <div className="mb-8">
                   <h2 className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-2">Executive Function Score</h2>
                   {/* We assume getting result from saveStat return or just recalculate/store in state if needed */}
                   <div className="text-6xl font-bold text-white mb-2">
                        {/* Recalculating for display */}
                        {Math.round(((quizScore/25)*100 * 0.5) + (Math.max(0, 100 - timeError*100*1.5) * 0.25) + ((impulseFail?0:100)*0.25))}
                   </div>
               </div>

               <div className="grid grid-cols-3 gap-2 max-w-lg mx-auto mb-8">
                   <div className="bg-zinc-900 border border-zinc-800 p-3 rounded">
                       <div className="text-[10px] text-zinc-500 uppercase mb-1">Impulse</div>
                       <div className={`text-lg font-bold ${impulseFail ? 'text-red-500' : 'text-emerald-500'}`}>
                           {impulseFail ? "Failed" : "Pass"}
                       </div>
                   </div>
                   <div className="bg-zinc-900 border border-zinc-800 p-3 rounded">
                       <div className="text-[10px] text-zinc-500 uppercase mb-1">Time Bias</div>
                       <div className={`text-lg font-bold ${timeError > 0.2 ? 'text-yellow-500' : 'text-emerald-500'}`}>
                           {Math.round(timeError * 100)}%
                       </div>
                   </div>
                   <div className="bg-zinc-900 border border-zinc-800 p-3 rounded">
                       <div className="text-[10px] text-zinc-500 uppercase mb-1">Habits</div>
                       <div className="text-lg font-bold text-white">
                           {Math.round((quizScore / 25) * 100)}%
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
