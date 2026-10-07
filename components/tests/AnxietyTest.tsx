
import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, Wind, RotateCcw, Fingerprint, Focus } from 'lucide-react';
import { saveStat } from '../../lib/core';

// Four self-reflection prompts, not the full GAD-7 instrument or a validated screen.
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
  const holdStartRef = useRef(0);
  const holdingRef = useRef(false);
  const completionTimerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (holdTimerRef.current !== null) clearInterval(holdTimerRef.current);
    if (completionTimerRef.current !== null) clearTimeout(completionTimerRef.current);
  }, []);

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
    // This personal reflection index is not a clinical anxiety severity scale.
    const index = Math.max(0, Math.min(100, Math.round(100 * (1 - finalQuizScore / (QUESTIONS.length * 3)))));
    saveStat('anxiety-test', index, finalQuizScore);
    setPhase('result');
  };

  const calculateMovement = () => {
    let distance = 0;
    for (let i = 1; i < positionsRef.current.length; i++) {
      const a = positionsRef.current[i-1], b = positionsRef.current[i];
      distance += Math.hypot(b.x - a.x, b.y - a.y);
    }
    setTremorScore(Math.round(distance)); // Pointer travel distance, not a biomarker.
    setPhase('quiz');
  };

  const handleStartHold = () => {
    if (holdingRef.current || phase !== 'tremor') return;
    if (holdTimerRef.current !== null) clearInterval(holdTimerRef.current);
    holdingRef.current = true;
    holdStartRef.current = performance.now();
    positionsRef.current = [];
    setIsHolding(true);
    setHoldTime(0);
    holdTimerRef.current = window.setInterval(() => {
      const elapsed = Math.min(10, (performance.now() - holdStartRef.current) / 1000);
      setHoldTime(elapsed);
      if (elapsed >= 10) {
        if (holdTimerRef.current !== null) clearInterval(holdTimerRef.current);
        holdTimerRef.current = null;
        holdingRef.current = false;
        setIsHolding(false);
        calculateMovement();
      }
    }, 50);
  };

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (holdingRef.current) positionsRef.current.push({ x: e.clientX, y: e.clientY });
  };

  const handleStopHold = () => {
    if (!holdingRef.current) return;
    holdingRef.current = false;
    if (holdTimerRef.current !== null) clearInterval(holdTimerRef.current);
    holdTimerRef.current = null;
    setIsHolding(false);
    setHoldTime(0);
    positionsRef.current = [];
  };

  const restartExercise = () => {
    handleStopHold();
    if (completionTimerRef.current !== null) clearTimeout(completionTimerRef.current);
    setTremorScore(0);
    setCurrentQ(0);
    setQuizScore(0);
    setGroundingTargets([]);
    setPhase('intro');
  };

  // --- GROUNDING GAME ---
  const startGrounding = () => {
      setPhase('grounding');
      setGroundingTargets([1, 2, 3, 4, 5]);
  };

  const clickTarget = (id: number) => {
      setGroundingTargets(prev => prev.filter(t => t !== id));
      if (groundingTargets.length <= 1) {
          completionTimerRef.current = window.setTimeout(() => setPhase('result'), 500);
      }
  };

  return (
    <div className="max-w-2xl mx-auto text-center select-none" onPointerMove={handleMove}>
       
       {phase === 'intro' && (
           <div className="py-12 animate-in fade-in">
               <AlertCircle size={64} className="mx-auto text-zinc-600 mb-6" />
               <h2 className="text-3xl font-bold text-white mb-2">Anxiety Test — Calm & Focus Exercise</h2>
               <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                   A non-diagnostic pointer control exercise and four optional self-reflection questions. Not a clinical screening tool.
               </p>
               <button onClick={() => setPhase('tremor')} className="btn-primary">Start Exercise</button>
           </div>
       )}

       {phase === 'tremor' && (
           <div className="py-12 animate-in slide-in-from-right">
               <h3 className="text-white font-bold mb-4">Pointer Control Exercise</h3>
               <p className="text-zinc-400 text-sm mb-8">
                   Press and hold the circle for 10 seconds. <br/>Try to keep your hand as steady as possible.
               </p>
               
               <div className="relative h-64 flex items-center justify-center">
                   <button 
                      onPointerDown={(e) => { e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); handleStartHold(); }}
                      onPointerUp={handleStopHold}
                      onPointerCancel={handleStopHold}
                      onLostPointerCapture={handleStopHold}
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
               <div className="text-xs font-mono text-zinc-500 mb-8">PART 2: SELF-REFLECTION ({currentQ + 1}/4)</div>
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
                          top: `${20 + (id * 17) % 55}%`,
                          left: `${10 + (id * 19) % 70}%`,
                          animationDuration: '2.5s'
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
                       Pointer Movement Path: <strong className="text-white">{tremorScore} px</strong>
                   </div>
               </div>

               {/* Breathing / Grounding CTA */}
               <div className="bg-black border border-zinc-800 p-8 rounded-xl relative overflow-hidden mb-8">
                   <div className="relative z-10">
                       <h3 className="text-white font-bold mb-2">Take a Focus Break</h3>
                       <p className="text-zinc-400 text-sm mb-6 max-w-xs mx-auto">
                           Try a short, optional focus game. This does not measure or treat a health condition.
                       </p>
                       <button 
                          onClick={startGrounding}
                          className="btn-primary bg-emerald-500 hover:bg-emerald-400 text-black border-none flex items-center justify-center gap-2 mx-auto"
                       >
                           <Focus size={18} /> Start Grounding Game
                       </button>
                   </div>
               </div>
               
               <button onClick={restartExercise} className="btn-secondary flex items-center justify-center gap-2 mx-auto">
                   <RotateCcw size={16} /> Restart
               </button>
           </div>
       )}
    </div>
  );
};

export default AnxietyTest;
