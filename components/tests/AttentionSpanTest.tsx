import React, { useState, useEffect, useRef } from 'react';
import { Focus, Eye, AlertCircle, RotateCcw, Activity } from 'lucide-react';
import { saveStat } from '../../lib/core';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const AttentionSpanTest: React.FC = () => {
  const [phase, setPhase] = useState<'intro' | 'test' | 'result'>('intro');
  const [score, setScore] = useState(0); // Caught skips
  const [misses, setMisses] = useState(0);
  const [falseAlarms, setFalseAlarms] = useState(0);
  
  // Clock State
  const [position, setPosition] = useState(0); // 0 to 59
  const [events, setEvents] = useState(0); // Total skip events occurred
  const [lastJumpTime, setLastJumpTime] = useState(0);
  const [feedback, setFeedback] = useState<'none' | 'hit' | 'miss' | 'false'>('none');
  
  // Distractor State
  const [distractorPos, setDistractorPos] = useState<number | null>(null);

  // Analytics
  const [reactionHistory, setReactionHistory] = useState<{eventIndex: number, reactionTime: number}[]>([]);

  const timerRef = useRef<number | null>(null);
  const testStartRef = useRef<number>(0);
  const canRespondRef = useRef(false); // Window open for response?

  const TICKS = 60; // 60 positions like a clock
  const TICK_RATE = 1000; // 1 second per tick (Classic Mackworth is slow)
  const TEST_DURATION = 60000; // 1 Minute shortened version (Real is 30m+)

  const startTest = () => {
      setPhase('test');
      setScore(0);
      setMisses(0);
      setFalseAlarms(0);
      setEvents(0);
      setPosition(0);
      setReactionHistory([]);
      setDistractorPos(null);
      testStartRef.current = performance.now();
      
      stepClock();
  };

  const stepClock = () => {
      // Check if previous skip was missed
      if (canRespondRef.current) {
          handleMiss();
      }

      // Check time limit
      if (performance.now() - testStartRef.current > TEST_DURATION) {
          finishTest();
          return;
      }

      // Logic: 15% chance to skip (Double Jump)
      const isSkip = Math.random() < 0.15; 
      
      // Distractor Logic: 10% chance to show a ghost dot elsewhere
      if (!isSkip && Math.random() < 0.1) {
          const ghost = Math.floor(Math.random() * TICKS);
          setDistractorPos(ghost);
          setTimeout(() => setDistractorPos(null), 300); // Flash briefly
      }

      setPosition(pos => {
          const jump = isSkip ? 2 : 1;
          return (pos + jump) % TICKS;
      });

      if (isSkip) {
          setEvents(e => e + 1);
          canRespondRef.current = true;
          setLastJumpTime(Date.now());
      } else {
          canRespondRef.current = false;
      }

      timerRef.current = window.setTimeout(stepClock, TICK_RATE);
  };

  const handleInput = (e?: React.MouseEvent | KeyboardEvent) => {
      if (e) e.preventDefault();
      if (phase !== 'test') return;

      const now = Date.now();

      if (canRespondRef.current) {
          // HIT
          setScore(s => s + 1);
          setFeedback('hit');
          canRespondRef.current = false; // Close window immediately
          
          // Log Reaction Time
          const rt = now - lastJumpTime;
          setReactionHistory(prev => [...prev, { eventIndex: events, reactionTime: rt }]);

      } else {
          // FALSE ALARM
          setFalseAlarms(f => f + 1);
          setFeedback('false');
      }
      
      setTimeout(() => setFeedback('none'), 500);
  };

  const handleMiss = () => {
      setMisses(m => m + 1);
      setFeedback('miss');
      canRespondRef.current = false;
      
      // Log Miss as max time (for graph continuity)
      setReactionHistory(prev => [...prev, { eventIndex: events, reactionTime: 1000 }]);
      
      setTimeout(() => setFeedback('none'), 500);
  };

  useEffect(() => {
      const handleKey = (e: KeyboardEvent) => {
          if (e.code === 'Space') handleInput(e);
      };
      window.addEventListener('keydown', handleKey);
      return () => {
          window.removeEventListener('keydown', handleKey);
          if (timerRef.current) clearTimeout(timerRef.current);
      };
  }, [phase, events]); // Depend on events for closure capture

  const finishTest = () => {
      setPhase('result');
      const totalEvents = events; 
      const accuracy = totalEvents > 0 ? Math.round((score / totalEvents) * 100) : 0;
      const adjustedScore = Math.max(0, accuracy - (falseAlarms * 5));
      saveStat('attention-span', adjustedScore);
  };

  // Render Position Calculation
  const renderTicks = () => {
      return Array.from({length: TICKS}).map((_, i) => {
          const angle = (i * 6) - 90; // Deg
          const rad = angle * (Math.PI / 180);
          const x = 50 + (Math.cos(rad) * 45); // %
          const y = 50 + (Math.sin(rad) * 45); // %
          
          const isCurrent = i === position;
          const isDistractor = i === distractorPos;
          
          return (
              <div 
                 key={i}
                 className={`absolute w-2 h-2 rounded-full transition-all duration-300 
                    ${isCurrent ? 'bg-primary-500 shadow-[0_0_15px_#06b6d4] scale-150 z-20' : 
                      isDistractor ? 'bg-zinc-600 animate-ping opacity-50' :
                      i % 5 === 0 ? 'bg-zinc-700' : 'bg-zinc-800'}
                 `}
                 style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
              ></div>
          );
      });
  };

  return (
    <div className="max-w-xl mx-auto text-center select-none" onMouseDown={handleInput}>
       
       {phase === 'intro' && (
           <div className="py-12 animate-in fade-in zoom-in">
               <Eye size={64} className="mx-auto text-zinc-600 mb-6" />
               <h2 className="text-3xl font-bold text-white mb-2">The Mackworth Clock</h2>
               <p className="text-zinc-400 mb-8 max-w-md mx-auto leading-relaxed">
                   A classic radar vigilance test. 
                   <br/>The dot moves <strong>one step</strong> per second. 
                   <br/>Press SPACE when it makes a <strong>double jump</strong> (skips a dot).
                   <br/>Ignore random ghost signals.
               </p>
               <button onClick={startTest} className="btn-primary">
                   Start Surveillance
               </button>
           </div>
       )}

       {phase === 'test' && (
           <div className="relative h-[400px] w-full flex items-center justify-center">
               {/* Radar Scanner Effect */}
               <div className="absolute inset-0 rounded-full border border-zinc-800 opacity-20 overflow-hidden">
                   <div className="absolute top-1/2 left-1/2 w-[50%] h-[2px] bg-gradient-to-r from-transparent to-primary-500/50 origin-left animate-[spin_4s_linear_infinite] z-0"></div>
               </div>
               <div className="absolute w-[70%] h-[70%] border border-zinc-800 rounded-full opacity-20"></div>
               
               {/* Clock Ticks */}
               <div className="relative w-full h-full z-10">
                   {renderTicks()}
               </div>

               {/* Center Feedback */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-30">
                   <div className={`text-2xl font-bold font-mono transition-opacity duration-200 ${feedback === 'none' ? 'opacity-0' : 'opacity-100'} ${feedback === 'hit' ? 'text-emerald-500' : feedback === 'false' ? 'text-yellow-500' : 'text-red-500'}`}>
                       {feedback === 'hit' && "CONTACT"}
                       {feedback === 'miss' && "MISSED"}
                       {feedback === 'false' && "GHOST"}
                   </div>
               </div>
               
               {/* Mobile Tap Layer */}
               <div className="absolute inset-0 z-40 cursor-pointer"></div>
           </div>
       )}

       {phase === 'result' && (
           <div className="py-12 animate-in fade-in">
               <Focus size={64} className="mx-auto text-primary-500 mb-6" />
               <h2 className="text-3xl font-bold text-white mb-8">Vigilance Report</h2>

               <div className="grid grid-cols-3 gap-4 mb-8">
                   <div className="bg-zinc-900 border border-zinc-800 p-4 rounded">
                       <div className="text-xs text-zinc-500 uppercase mb-1">Detected</div>
                       <div className="text-2xl font-bold text-emerald-500">{score}/{events}</div>
                   </div>
                   <div className="bg-zinc-900 border border-zinc-800 p-4 rounded">
                       <div className="text-xs text-zinc-500 uppercase mb-1">Missed</div>
                       <div className="text-2xl font-bold text-zinc-500">{misses}</div>
                   </div>
                   <div className="bg-zinc-900 border border-zinc-800 p-4 rounded">
                       <div className="text-xs text-zinc-500 uppercase mb-1">False Alarms</div>
                       <div className="text-2xl font-bold text-red-500">{falseAlarms}</div>
                   </div>
               </div>

               {/* Vigilance Decrement Chart */}
               {reactionHistory.length > 2 && (
                   <div className="h-48 w-full bg-zinc-900/30 border border-zinc-800 rounded p-4 mb-8 relative">
                       <div className="absolute top-2 left-2 text-[10px] text-zinc-500 font-mono flex items-center gap-2">
                           <Activity size={10} /> VIGILANCE_DECREMENT
                       </div>
                       <ResponsiveContainer width="100%" height="100%">
                           <LineChart data={reactionHistory}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                               <XAxis dataKey="eventIndex" stroke="#555" fontSize={10} tickLine={false} axisLine={false} label={{ value: 'Event Sequence', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#555' }} />
                               <YAxis stroke="#555" fontSize={10} tickLine={false} axisLine={false} unit="ms" />
                               <Tooltip 
                                   contentStyle={{ backgroundColor: '#000', borderColor: '#333', fontSize: '12px' }}
                                   itemStyle={{ color: '#06b6d4' }}
                                   labelFormatter={(i) => `Event #${i}`}
                               />
                               <Line type="monotone" dataKey="reactionTime" stroke="#06b6d4" strokeWidth={2} dot={{r: 2}} />
                           </LineChart>
                       </ResponsiveContainer>
                   </div>
               )}

               <div className="text-left bg-zinc-900/50 p-6 border border-zinc-800 mb-8 rounded">
                   <h4 className="text-white font-bold mb-2 flex items-center gap-2"><AlertCircle size={16}/> Analysis</h4>
                   <p className="text-sm text-zinc-400">
                       {score / (score+misses || 1) > 0.9 ? "High Alertness. You maintained focus throughout the monotony." :
                        score / (score+misses || 1) > 0.6 ? "Average Vigilance. Some lapses in attention occurred." :
                        "Low Vigilance. Significant decrement in sustained attention detected."}
                   </p>
               </div>

               <button onClick={startTest} className="btn-secondary flex items-center justify-center gap-2 mx-auto">
                   <RotateCcw size={16} /> Retake Test
               </button>
           </div>
       )}
    </div>
  );
};

export default AttentionSpanTest;