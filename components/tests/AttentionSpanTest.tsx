import React, { useState, useEffect, useRef } from 'react';
import { Focus, Eye, AlertCircle } from 'lucide-react';
import { saveStat } from '../../lib/core';

const AttentionSpanTest: React.FC = () => {
  const [phase, setPhase] = useState<'intro' | 'test' | 'result'>('intro');
  const [message, setMessage] = useState('');
  const [score, setScore] = useState(0); // Successful reactions
  const [misses, setMisses] = useState(0);
  const [falseAlarms, setFalseAlarms] = useState(0);
  
  // The state of the "Dot"
  const [isStimulusActive, setIsStimulusActive] = useState(false);
  const [stimulusColor, setStimulusColor] = useState('bg-zinc-500');
  
  const timeoutRef = useRef<number | null>(null);
  const reactionStartRef = useRef<number>(0);
  const reactionTimesRef = useRef<number[]>([]);
  const testDurationRef = useRef<number>(0);
  const testStartRef = useRef<number>(0);

  const TEST_LENGTH_MS = 30000; // 30 seconds for web version (Clinical is usually minutes)

  const startTest = () => {
      setPhase('test');
      setScore(0);
      setMisses(0);
      setFalseAlarms(0);
      reactionTimesRef.current = [];
      testStartRef.current = performance.now();
      
      scheduleNextStimulus();
      
      // End test timer
      setTimeout(() => finishTest(), TEST_LENGTH_MS);
  };

  const scheduleNextStimulus = () => {
      if (performance.now() - testStartRef.current > TEST_LENGTH_MS) return;

      setIsStimulusActive(false);
      setStimulusColor('bg-zinc-600'); // Neutral

      // Random delay between 1s and 4s
      const delay = 1000 + Math.random() * 3000;
      
      timeoutRef.current = window.setTimeout(() => {
          triggerStimulus();
      }, delay);
  };

  const triggerStimulus = () => {
      setIsStimulusActive(true);
      setStimulusColor('bg-primary-500 shadow-[0_0_20px_#06b6d4]'); // Active
      reactionStartRef.current = performance.now();
      
      // Auto-fail if not clicked within 1s
      timeoutRef.current = window.setTimeout(() => {
          if (phase === 'test') { // check if still testing
              handleMiss();
          }
      }, 1000);
  };

  const handleClick = (e: React.MouseEvent | KeyboardEvent) => {
      if (phase !== 'test') return;
      e.preventDefault();

      if (isStimulusActive) {
          // Success
          const reaction = performance.now() - reactionStartRef.current;
          reactionTimesRef.current.push(reaction);
          setScore(s => s + 1);
          
          if (timeoutRef.current) clearTimeout(timeoutRef.current); // Clear the miss timer
          scheduleNextStimulus();
      } else {
          // False Alarm (clicked when nothing happened)
          setFalseAlarms(f => f + 1);
          setMessage("Too Early!");
          setTimeout(() => setMessage(''), 500);
      }
  };

  const handleMiss = () => {
      setMisses(m => m + 1);
      setMessage("Missed!");
      setTimeout(() => setMessage(''), 500);
      scheduleNextStimulus();
  };

  // Spacebar support
  useEffect(() => {
      const handleKey = (e: KeyboardEvent) => {
          if (e.code === 'Space' && phase === 'test') {
              handleClick(e);
          }
      };
      window.addEventListener('keydown', handleKey);
      return () => window.removeEventListener('keydown', handleKey);
  }, [phase, isStimulusActive]);

  const finishTest = () => {
      setPhase('result');
      // Calculate Score
      // Base: Percentage of stimuli caught
      const totalEvents = score + misses;
      const accuracy = totalEvents > 0 ? (score / totalEvents) : 0;
      
      // Penalty for false alarms
      const penalty = falseAlarms * 0.1;
      
      const finalRaw = (accuracy - penalty);
      const normalized = Math.max(0, Math.min(100, Math.round(finalRaw * 100)));
      
      saveStat('attention-span', normalized);
  };

  return (
    <div className="max-w-xl mx-auto text-center select-none">
       {phase === 'intro' && (
           <div className="py-12 animate-in fade-in zoom-in">
               <Eye size={64} className="mx-auto text-zinc-600 mb-6" />
               <h2 className="text-3xl font-bold text-white mb-2">Attention Span Test</h2>
               <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                   A Vigilance Task. Fixate on the center dot. 
                   <br/>When it flashes <span className="text-primary-400">BLUE</span>, click or press Spacebar immediately. 
                   <br/>Do not click otherwise.
               </p>
               <button onClick={startTest} className="btn-primary">
                   Start Vigilance Task
               </button>
           </div>
       )}

       {phase === 'test' && (
           <div 
              className="h-[400px] flex flex-col items-center justify-center relative cursor-pointer outline-none"
              onMouseDown={handleClick}
           >
               {/* Fixation Cross */}
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                   <div className="w-[1px] h-full bg-zinc-700"></div>
                   <div className="h-[1px] w-full bg-zinc-700"></div>
               </div>

               {/* The Stimulus */}
               <div className={`w-16 h-16 rounded-full transition-all duration-75 ${stimulusColor}`}></div>

               {/* Feedback Text */}
               <div className="absolute bottom-10 h-6 text-red-500 font-mono font-bold">
                   {message}
               </div>

               <div className="absolute top-0 right-0 p-4 text-xs font-mono text-zinc-600">
                   EVENTS: {score + misses + falseAlarms}
               </div>
           </div>
       )}

       {phase === 'result' && (
           <div className="py-12 animate-in fade-in">
               <Focus size={64} className="mx-auto text-primary-500 mb-6" />
               <h2 className="text-3xl font-bold text-white mb-8">Attention Report</h2>

               <div className="grid grid-cols-3 gap-4 mb-8">
                   <div className="bg-zinc-900 border border-zinc-800 p-4 rounded">
                       <div className="text-xs text-zinc-500 uppercase mb-1">Caught</div>
                       <div className="text-2xl font-bold text-emerald-500">{score}</div>
                   </div>
                   <div className="bg-zinc-900 border border-zinc-800 p-4 rounded">
                       <div className="text-xs text-zinc-500 uppercase mb-1">Missed</div>
                       <div className="text-2xl font-bold text-yellow-500">{misses}</div>
                   </div>
                   <div className="bg-zinc-900 border border-zinc-800 p-4 rounded">
                       <div className="text-xs text-zinc-500 uppercase mb-1">False Alarms</div>
                       <div className="text-2xl font-bold text-red-500">{falseAlarms}</div>
                   </div>
               </div>

               <div className="text-left bg-zinc-900/50 p-6 border border-zinc-800 mb-8">
                   <h4 className="text-white font-bold mb-2 flex items-center gap-2"><AlertCircle size={16}/> Analysis</h4>
                   <p className="text-sm text-zinc-400">
                       {score / (score+misses+falseAlarms) > 0.9 ? "Excellent focus. You maintained high vigilance with minimal distraction." :
                        score / (score+misses+falseAlarms) > 0.7 ? "Good attention span. Some minor lapses in concentration detected." :
                        "Your attention drifted significantly. This is common in high-stimulation environments."}
                   </p>
               </div>

               <button onClick={startTest} className="btn-secondary">
                   Retake Test
               </button>
           </div>
       )}
    </div>
  );
};

export default AttentionSpanTest;