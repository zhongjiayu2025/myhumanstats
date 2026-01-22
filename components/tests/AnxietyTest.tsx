
import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, Wind, RotateCcw, Fingerprint, Focus } from 'lucide-react';
import { saveStat } from '../../lib/core';

// GAD-7
const QUESTIONS = [
  { text: "Feeling nervous, anxious, or on edge", options: [{label: "Not at all", value: 0}, {label: "Several days", value: 1}, {label: "Over half", value: 2}, {label: "Nearly every day", value: 3}] },
  { text: "Not being able to stop or control worrying", options: [{label: "Not at all", value: 0}, {label: "Several days", value: 1}, {label: "Over half", value: 2}, {label: "Nearly every day", value: 3}] },
  { text: "Trouble relaxing", options: [{label: "Not at all", value: 0}, {label: "Several days", value: 1}, {label: "Over half", value: 2}, {label: "Nearly every day", value: 3}] },
  { text: "Being so restless that it is hard to sit still", options: [{label: "Not at all", value: 0}, {label: "Several days", value: 1}, {label: "Over half", value: 2}, {label: "Nearly every day", value: 3}] },
];

const AnxietyTest: React.FC = () => {
  const [phase, setPhase] = useState<'intro' | 'tremor' | 'quiz' | 'result' | 'grounding'>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  
  // Tremor Test State
  const [tremorScore, setTremorScore] = useState(0); // Jitter score
  const [isHolding, setIsHolding] = useState(false);
  const [holdTime, setHoldTime] = useState(0);
  const positionsRef = useRef<{x:number, y:number}[]>([]);
  const holdTimerRef = useRef<number | null>(null);

  // Grounding Game
  const [groundingTargets, setGroundingTargets] = useState<number[]>([]);
  
  const handleAnswer = (val: number) => {
      setQuizScore(s => s + val);
      if (currentQ < QUESTIONS.length - 1) {
          setCurrentQ(q => q + 1);
      } else {
          finishTest(quizScore + val);
      }
  };

  const finishTest = (finalQuizScore: number) => {
      // Normalize GAD (Max 12 in short version, usually 21) -> 0-100
      const normQuiz = (finalQuizScore / 12) * 100;
      // Tremor score is arbitrary jitter sum. Let's normalize.
      // Lower tremor is better. 
      // If Jitter > 500, High Anxiety physical symptom.
      const normTremor = Math.min(100, (tremorScore / 500) * 100);
      
      const total = Math.round((normQuiz * 0.7) + (normTremor * 0.3));
      
      saveStat('anxiety-test', total);
      setPhase('result');
  };

  // --- TREMOR LOGIC ---
  const handleStartHold = () => {
      setIsHolding(true);
      setHoldTime(0);
      positionsRef.current = [];
      
      const interval = setInterval(() => {
          setHoldTime(t => {
              if (t >= 10) {
                  clearInterval(interval);
                  setIsHolding(false);
                  calculateTremor();
                  return 10;
              }
              return t + 0.1;
          });
      }, 100);
      holdTimerRef.current = interval as any;
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
      if (!isHolding) return;
      let clientX, clientY;
      if ('touches' in e) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
      } else {
          clientX = (e as React.MouseEvent).clientX;
          clientY = (e as React.MouseEvent).clientY;
      }
      positionsRef.current.push({ x: clientX, y: clientY });
  };

  const handleStopHold = () => {
      if (holdTime < 10) {
          if(holdTimerRef.current) clearInterval(holdTimerRef.current);
          setIsHolding(false);
          setHoldTime(0);
          positionsRef.current = [];
      }
  };

  const calculateTremor = () => {
      // Calculate total path length vs displacement? 
      // Or just standard deviation of movement from center?
      // Simplified: Sum of distance between consecutive points.
      // High jitter = long path length in small area.
      let totalDist = 0;
      for(let i=1; i<positionsRef.current.length; i++) {
          const p1 = positionsRef.current[i-1];
          const p2 = positionsRef.current[i];
          const dist = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
          totalDist += dist;
      }
      setTremorScore(Math.round(totalDist));
      setPhase('quiz');
  };

  // --- GROUNDING GAME ---
  const startGrounding = () => {
      setPhase('grounding');
      setGroundingTargets([1, 2, 3, 4, 5]);
  };

  const clickTarget = (id: number) => {
      setGroundingTargets(prev => prev.filter(t => t !== id));
      if (groundingTargets.length <= 1) {
          setTimeout(() => setPhase('result'), 500);
      }
  };

  return (
    <div className="max-w-2xl mx-auto text-center select-none" onMouseMove={handleMove} onTouchMove={handleMove}>
       
       {phase === 'intro' && (
           <div className="py-12 animate-in fade-in">
               <AlertCircle size={64} className="mx-auto text-zinc-600 mb-6" />
               <h2 className="text-3xl font-bold text-white mb-2">Anxiety & Motor Screener</h2>
               <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                   Assesses both psychological symptoms (GAD-7) and physiological markers (Motor Stability/Tremor).
               </p>
               <button onClick={() => setPhase('tremor')} className="btn-primary">Start Assessment</button>
           </div>
       )}

       {phase === 'tremor' && (
           <div className="py-12 animate-in slide-in-from-right">
               <h3 className="text-white font-bold mb-4">Motor Stability Test</h3>
               <p className="text-zinc-400 text-sm mb-8">
                   Press and hold the circle for 10 seconds. <br/>Try to keep your hand as steady as possible.
               </p>
               
               <div className="relative h-64 flex items-center justify-center">
                   <button 
                      onMouseDown={handleStartHold}
                      onMouseUp={handleStopHold}
                      onTouchStart={(e) => { e.preventDefault(); handleStartHold(); }}
                      onTouchEnd={handleStopHold}
                      className={`w-32 h-32 rounded-full border-4 flex items-center justify-center transition-all ${isHolding ? 'border-primary-500 bg-primary-900/20 scale-110' : 'border-zinc-700 bg-zinc-900'}`}
                   >
                       {isHolding ? (
                           <span className="text-2xl font-mono font-bold text-primary-400">{holdTime.toFixed(1)}s</span>
                       ) : (
                           <Fingerprint size={48} className="text-zinc-500" />
                       )}
                   </button>
                   
                   {/* Stability Ring */}
                   {isHolding && (
                       <div className="absolute w-48 h-48 border border-dashed border-zinc-600 rounded-full animate-spin-slow opacity-50 pointer-events-none"></div>
                   )}
               </div>
           </div>
       )}

       {phase === 'quiz' && (
           <div className="py-12 animate-in slide-in-from-right">
               <div className="text-xs font-mono text-zinc-500 mb-8">PART 2: SYMPTOM CHECK ({currentQ + 1}/4)</div>
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

       {phase === 'grounding' && (
           <div className="py-12 h-[500px] relative animate-in fade-in">
               <h3 className="text-white font-bold mb-2">5-4-3-2-1 Grounding</h3>
               <p className="text-zinc-400 text-sm mb-8">Click the floating orbs to reset your focus.</p>
               
               {groundingTargets.map(id => (
                   <button 
                      key={id}
                      onClick={() => clickTarget(id)}
                      className="absolute w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 shadow-[0_0_20px_#10b981] flex items-center justify-center text-black font-bold animate-pulse transition-all"
                      style={{ 
                          top: `${20 + Math.random() * 60}%`, 
                          left: `${10 + Math.random() * 80}%`,
                          animationDuration: `${2 + Math.random()}s`
                      }}
                   >
                       {id}
                   </button>
               ))}
           </div>
       )}

       {phase === 'result' && (
           <div className="py-8 animate-in zoom-in">
               <div className="mb-12">
                   <h2 className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-2">Analysis Complete</h2>
                   <div className="text-zinc-400 text-sm">
                       Physiological Jitter: <strong className="text-white">{tremorScore} px</strong>
                   </div>
               </div>

               {/* Breathing / Grounding CTA */}
               <div className="bg-black border border-zinc-800 p-8 rounded-xl relative overflow-hidden mb-8">
                   <div className="relative z-10">
                       <h3 className="text-white font-bold mb-2">High Arousal Detected?</h3>
                       <p className="text-zinc-400 text-sm mb-6 max-w-xs mx-auto">
                           Engage in a visual grounding exercise to reset your parasympathetic nervous system.
                       </p>
                       <button 
                          onClick={startGrounding}
                          className="btn-primary bg-emerald-500 hover:bg-emerald-400 text-black border-none flex items-center justify-center gap-2 mx-auto"
                       >
                           <Focus size={18} /> Start Grounding Game
                       </button>
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

export default AnxietyTest;
