
import React, { useState, useRef, useEffect } from 'react';
import { Activity, RotateCcw, Play, Zap, Brain, AlertTriangle } from 'lucide-react';
import { saveStat } from '../../lib/core';
import { LineChart, Line, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';

// ASRS-v1.1 Part A
const ASRS_QUESTIONS = [
  { id: 1, text: "How often do you have trouble wrapping up the final details of a project?", options: [{label: "Never", value: 0}, {label: "Rarely", value: 1}, {label: "Sometimes", value: 2}, {label: "Often", value: 3}, {label: "Very Often", value: 4}] },
  { id: 2, text: "How often do you have difficulty getting things in order?", options: [{label: "Never", value: 0}, {label: "Rarely", value: 1}, {label: "Sometimes", value: 2}, {label: "Often", value: 3}, {label: "Very Often", value: 4}] },
  { id: 3, text: "How often do you have problems remembering appointments?", options: [{label: "Never", value: 0}, {label: "Rarely", value: 1}, {label: "Sometimes", value: 2}, {label: "Often", value: 3}, {label: "Very Often", value: 4}] },
  { id: 4, text: "When you have a task that requires a lot of thought, how often do you avoid or delay getting started?", options: [{label: "Never", value: 0}, {label: "Rarely", value: 1}, {label: "Sometimes", value: 2}, {label: "Often", value: 3}, {label: "Very Often", value: 4}] },
];

const ADHDTest: React.FC = () => {
  const [phase, setPhase] = useState<'intro' | 'gonogo' | 'quiz' | 'result'>('intro');
  
  // Go/No-Go State
  const [gonogoState, setGonogoState] = useState<'wait' | 'go' | 'nogo' | 'feedback'>('wait');
  const [impulseErrors, setImpulseErrors] = useState(0); 
  const [omissionErrors, setOmissionErrors] = useState(0);
  const [trial, setTrial] = useState(0);
  
  // RTV Analysis
  const [reactionTimes, setReactionTimes] = useState<{trial: number, ms: number}[]>([]);
  const [stimulusTime, setStimulusTime] = useState(0);
  const [distracted, setDistracted] = useState(false);

  const TOTAL_TRIALS = 15;
  const timerRef = useRef<number | null>(null);

  // Quiz State
  const [quizScore, setQuizScore] = useState(0);
  const [qIndex, setQIndex] = useState(0);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // --- GO / NO-GO LOGIC ---
  const startGoNoGo = () => {
      setPhase('gonogo');
      setTrial(0);
      setImpulseErrors(0);
      setOmissionErrors(0);
      setReactionTimes([]);
      setTimeout(scheduleTrial, 500);
  };

  const scheduleTrial = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      
      setGonogoState('wait');
      setDistracted(false);
      
      // Variable Inter-Stimulus Interval (ISI) to test sustained attention
      const delay = 1500 + Math.random() * 2000;
      
      // Distraction: Flash screen white briefly during wait?
      if (Math.random() > 0.7 && trial > 3) {
          setTimeout(() => {
              setDistracted(true);
              setTimeout(() => setDistracted(false), 100);
          }, delay / 2);
      }
      
      timerRef.current = window.setTimeout(() => {
          // 30% chance of No-Go (Red)
          const isNoGo = Math.random() < 0.3;
          setGonogoState(isNoGo ? 'nogo' : 'go');
          setStimulusTime(performance.now());
          
          // Reaction window: 800ms
          timerRef.current = window.setTimeout(() => {
              if (isNoGo) {
                  // Correctly ignored No-Go
                  handleSuccess(false); 
              } else {
                  // Missed Go (Inattention)
                  setOmissionErrors(prev => prev + 1);
                  nextTrial(); 
              }
          }, 1000); 
      }, delay);
  };

  const handleInput = (e?: React.MouseEvent | KeyboardEvent) => {
      if (e) {
        if ((e as KeyboardEvent).key === ' ' || (e as KeyboardEvent).code === 'Space') {
            e.preventDefault();
        }
      }
      
      if (phase !== 'gonogo' || gonogoState === 'wait') return;

      if (timerRef.current) clearTimeout(timerRef.current);
      
      if (gonogoState === 'go') {
          handleSuccess(true);
      } else if (gonogoState === 'nogo') {
          setImpulseErrors(prev => prev + 1);
          flashFeedback();
      }
  };

  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (e.code === 'Space') handleInput(e);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, gonogoState]);

  const handleSuccess = (wasClick: boolean) => {
      if (wasClick) {
          const rt = Math.round(performance.now() - stimulusTime);
          setReactionTimes(prev => [...prev, { trial: trial + 1, ms: rt }]);
      }
      nextTrial();
  };

  const flashFeedback = () => {
      setGonogoState('feedback');
      setTimeout(nextTrial, 300);
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
      // Calculate Variability (Standard Deviation)
      const rts = reactionTimes.map(r => r.ms);
      const mean = rts.reduce((a,b) => a+b, 0) / rts.length;
      const variance = rts.reduce((a,b) => a + Math.pow(b - mean, 2), 0) / rts.length;
      const stdDev = Math.sqrt(variance); // Reaction Time Variability (RTV)

      // Scoring
      const rtvScore = Math.min(100, (stdDev / 150) * 100); // Higher RTV = More ADHD-like
      const impulseScore = (impulseErrors / (TOTAL_TRIALS * 0.3)) * 100;
      const symptomScore = (finalQuizRaw / (ASRS_QUESTIONS.length * 4)) * 100;
      
      const composite = Math.min(100, Math.round((impulseScore * 0.3) + (rtvScore * 0.3) + (symptomScore * 0.4)));
      saveStat('adhd-test', composite);
      setPhase('result');
  };

  return (
    <div className="max-w-2xl mx-auto select-none" onMouseDown={phase === 'gonogo' ? handleInput : undefined}>
       
       {phase === 'intro' && (
           <div className="text-center py-12 animate-in fade-in">
               <Activity size={64} className="mx-auto text-amber-500 mb-6" />
               <h2 className="text-3xl font-bold text-white mb-2">Clinical ADHD Screener</h2>
               <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                   Measures <strong>Reaction Time Variability (RTV)</strong> - a core biomarker of ADHD.
                   <br/>Includes distraction resistance and impulse control tasks.
               </p>
               <button onClick={startGoNoGo} className="btn-primary flex items-center gap-2 mx-auto">
                   <Play size={18} fill="currentColor" /> Start Behavioral Task
               </button>
           </div>
       )}

       {phase === 'gonogo' && (
           <div className={`py-12 flex flex-col items-center justify-center min-h-[450px] transition-colors duration-100 ${distracted ? 'bg-white' : ''}`}>
               {!distracted && (
                   <>
                       <div className="mb-8 text-center">
                           <h3 className="text-xl font-bold text-white mb-2">Attention Task</h3>
                           <div className="text-xs font-mono text-zinc-600 mt-2">TRIAL {trial+1}/{TOTAL_TRIALS}</div>
                       </div>

                       <div className={`
                           w-64 h-64 rounded-3xl flex items-center justify-center transition-all duration-75 shadow-2xl cursor-pointer border-4
                           ${gonogoState === 'wait' ? 'bg-zinc-800 border-zinc-700' : ''}
                           ${gonogoState === 'go' ? 'bg-emerald-500 border-emerald-400 scale-105 shadow-[0_0_50px_#10b981]' : ''}
                           ${gonogoState === 'nogo' ? 'bg-red-500 border-red-400 scale-105 shadow-[0_0_50px_#ef4444]' : ''}
                           ${gonogoState === 'feedback' ? 'bg-red-900 border-red-500 animate-shake' : ''}
                       `}>
                           {gonogoState === 'go' && <span className="text-black font-black text-4xl">CLICK!</span>}
                           {gonogoState === 'nogo' && <span className="text-black font-black text-4xl">STOP!</span>}
                           {gonogoState === 'feedback' && <span className="text-red-500 font-bold text-xl">IMPULSE!</span>}
                       </div>
                   </>
               )}
           </div>
       )}

       {phase === 'quiz' && (
           <div className="py-12 animate-in slide-in-from-right">
               <div className="flex justify-between items-center mb-8 px-4 border-b border-zinc-800 pb-4">
                   <span className="text-xs font-mono text-zinc-500">PART 2: SYMPTOMS</span>
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
               <h2 className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-4">Attention Profile</h2>
               
               <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-8 h-64">
                   <div className="text-[10px] text-zinc-500 text-left mb-2 flex items-center gap-2"><Zap size={10}/> REACTION TIME VARIABILITY (RTV)</div>
                   <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={reactionTimes}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                           <YAxis stroke="#555" fontSize={10} domain={['auto', 'auto']} width={30} />
                           <Tooltip contentStyle={{ backgroundColor: '#000', borderColor: '#333' }} />
                           <Line type="monotone" dataKey="ms" stroke="#f59e0b" strokeWidth={2} dot={{r: 3}} />
                       </LineChart>
                   </ResponsiveContainer>
                   <div className="text-[10px] text-zinc-500 text-right mt-1">Consistency Check</div>
               </div>

               <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8">
                   <div className="bg-zinc-900 border border-zinc-800 p-4 rounded text-center">
                       <div className="text-xs text-zinc-500 uppercase mb-1">Impulsivity</div>
                       <div className={`text-xl font-bold ${impulseErrors > 1 ? 'text-red-500' : 'text-emerald-500'}`}>
                           {impulseErrors} Errors
                       </div>
                   </div>
                   <div className="bg-zinc-900 border border-zinc-800 p-4 rounded text-center">
                       <div className="text-xs text-zinc-500 uppercase mb-1">Inattention</div>
                       <div className={`text-xl font-bold ${omissionErrors > 1 ? 'text-yellow-500' : 'text-emerald-500'}`}>
                           {omissionErrors} Misses
                       </div>
                   </div>
               </div>

               <div className="bg-zinc-900/50 p-6 rounded border border-zinc-800 text-left text-sm text-zinc-400 mb-8">
                   <strong className="text-white block mb-2">Bio-Marker Analysis:</strong>
                   Your Reaction Time Variability graph {Math.max(...reactionTimes.map(r=>r.ms)) - Math.min(...reactionTimes.map(r=>r.ms)) > 200 ? "shows significant spikes, a potential indicator of micro-lapses in attention." : "is relatively stable, indicating consistent focus."}
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
