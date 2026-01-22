
import React, { useState, useEffect, useRef } from 'react';
import { Focus, Eye, AlertCircle, RotateCcw, Activity, ZapOff } from 'lucide-react';
import { saveStat } from '../../lib/core';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, Radar, PolarRadiusAxis } from 'recharts';

const AttentionSpanTest: React.FC = () => {
  const [phase, setPhase] = useState<'intro' | 'test' | 'result'>('intro');
  const [score, setScore] = useState(0); 
  const [misses, setMisses] = useState(0);
  const [falseAlarms, setFalseAlarms] = useState(0);
  
  // Clock State
  const [position, setPosition] = useState(0); 
  const [events, setEvents] = useState(0); 
  const [lastJumpTime, setLastJumpTime] = useState(0);
  const [feedback, setFeedback] = useState<'none' | 'hit' | 'miss' | 'false'>('none');
  
  // Distractor State
  const [distractorPos, setDistractorPos] = useState<number | null>(null);
  const [visualNoise, setVisualNoise] = useState(false); // Toggle
  const [particles, setParticles] = useState<{id: number, x: number, y: number, size: number, opacity: number}[]>([]);

  // Analytics
  const [reactionHistory, setReactionHistory] = useState<{eventIndex: number, reactionTime: number}[]>([]);
  // Spatial Miss Tracking (0-3 quadrants)
  const [missMap, setMissMap] = useState([0, 0, 0, 0]); // Top, Right, Bottom, Left counts

  const timerRef = useRef<number | null>(null);
  const particleRef = useRef<number | null>(null);
  const testStartRef = useRef<number>(0);
  const canRespondRef = useRef(false);
  const lastSkipPosRef = useRef(0);

  const TICKS = 60;
  const TICK_RATE = 1000;
  const TEST_DURATION = 60000; 

  // --- Visual Noise Engine ---
  useEffect(() => {
      if (phase === 'test' && visualNoise) {
          const loop = () => {
              // Randomly spawn/despawn particles
              if (Math.random() > 0.8) {
                  setParticles(prev => [
                      ...prev.slice(-10), // Limit count
                      {
                          id: Math.random(),
                          x: Math.random() * 100,
                          y: Math.random() * 100,
                          size: Math.random() * 10 + 2,
                          opacity: Math.random() * 0.5
                      }
                  ]);
              }
              particleRef.current = requestAnimationFrame(loop);
          };
          particleRef.current = requestAnimationFrame(loop);
      } else {
          if (particleRef.current) cancelAnimationFrame(particleRef.current);
          setParticles([]);
      }
      return () => { if (particleRef.current) cancelAnimationFrame(particleRef.current); };
  }, [phase, visualNoise]);

  const startTest = () => {
      setPhase('test');
      setScore(0);
      setMisses(0);
      setFalseAlarms(0);
      setEvents(0);
      setPosition(0);
      setReactionHistory([]);
      setDistractorPos(null);
      setMissMap([0, 0, 0, 0]);
      testStartRef.current = performance.now();
      
      stepClock();
  };

  const stepClock = () => {
      if (canRespondRef.current) {
          handleMiss();
      }

      if (performance.now() - testStartRef.current > TEST_DURATION) {
          finishTest();
          return;
      }

      const isSkip = Math.random() < 0.15; 
      
      if (!isSkip && Math.random() < 0.15) {
          const ghost = Math.floor(Math.random() * TICKS);
          setDistractorPos(ghost);
          setTimeout(() => setDistractorPos(null), 300);
      }

      setPosition(pos => {
          const jump = isSkip ? 2 : 1;
          const next = (pos + jump) % TICKS;
          if (isSkip) lastSkipPosRef.current = next; // Track where the skip landed
          return next;
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
          setScore(s => s + 1);
          setFeedback('hit');
          canRespondRef.current = false; 
          
          const rt = now - lastJumpTime;
          setReactionHistory(prev => [...prev, { eventIndex: events, reactionTime: rt }]);

      } else {
          setFalseAlarms(f => f + 1);
          setFeedback('false');
      }
      setTimeout(() => setFeedback('none'), 500);
  };

  const handleMiss = () => {
      setMisses(m => m + 1);
      setFeedback('miss');
      canRespondRef.current = false;
      
      // Update Spatial Map
      // Quadrants: 0-15 (Top), 15-30 (Right), 30-45 (Bottom), 45-60 (Left)
      const quadrant = Math.floor(lastSkipPosRef.current / 15);
      setMissMap(prev => {
          const n = [...prev];
          n[quadrant] += 1;
          return n;
      });
      
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
  }, [phase, events]);

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
                      isDistractor ? 'bg-zinc-500 animate-ping opacity-50' :
                      i % 5 === 0 ? 'bg-zinc-700' : 'bg-zinc-800'}
                 `}
                 style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
              ></div>
          );
      });
  };

  const radarData = [
      { subject: 'Top (0-15s)', A: missMap[0], fullMark: 5 },
      { subject: 'Right (15-30s)', A: missMap[1], fullMark: 5 },
      { subject: 'Bottom (30-45s)', A: missMap[2], fullMark: 5 },
      { subject: 'Left (45-60s)', A: missMap[3], fullMark: 5 },
  ];

  return (
    <div className="max-w-xl mx-auto text-center select-none" onMouseDown={handleInput}>
       
       {phase === 'intro' && (
           <div className="py-12 animate-in fade-in zoom-in">
               <Eye size={64} className="mx-auto text-zinc-600 mb-6" />
               <h2 className="text-3xl font-bold text-white mb-2">The Mackworth Clock</h2>
               <p className="text-zinc-400 mb-8 max-w-md mx-auto leading-relaxed">
                   A classic radar vigilance test. 
                   <br/>The dot moves <strong>one step</strong> per second. 
                   <br/>Press SPACE when it makes a <strong>double jump</strong>.
               </p>
               
               <div className="flex justify-center mb-8">
                   <button 
                      onClick={() => setVisualNoise(!visualNoise)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold uppercase transition-all ${visualNoise ? 'bg-amber-900/30 border-amber-500 text-amber-500' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}
                   >
                       <ZapOff size={14} /> Distractions: {visualNoise ? 'ON' : 'OFF'}
                   </button>
               </div>

               <button onClick={startTest} className="btn-primary">
                   Start Surveillance
               </button>
           </div>
       )}

       {phase === 'test' && (
           <div className="relative h-[400px] w-full flex items-center justify-center overflow-hidden bg-black/50 border border-zinc-800 rounded-xl">
               
               {/* Distraction Particles */}
               {particles.map(p => (
                   <div 
                      key={p.id}
                      className="absolute bg-zinc-600 rounded-full animate-pulse pointer-events-none"
                      style={{
                          left: `${p.x}%`,
                          top: `${p.y}%`,
                          width: `${p.size}px`,
                          height: `${p.size}px`,
                          opacity: p.opacity
                      }}
                   ></div>
               ))}

               {/* Radar Scanner Effect */}
               <div className="absolute inset-0 rounded-full opacity-20 overflow-hidden pointer-events-none">
                   <div className="absolute top-1/2 left-1/2 w-[50%] h-[2px] bg-gradient-to-r from-transparent to-primary-500/50 origin-left animate-[spin_4s_linear_infinite] z-0"></div>
               </div>
               <div className="absolute w-[70%] h-[70%] border border-zinc-800 rounded-full opacity-20 pointer-events-none"></div>
               
               {/* Clock Ticks */}
               <div className="relative w-full h-full z-10 max-w-[350px] max-h-[350px]">
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

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                   {/* Miss Heatmap */}
                   <div className="h-48 w-full bg-zinc-900/30 border border-zinc-800 rounded p-4 relative">
                       <div className="absolute top-2 left-2 text-[10px] text-zinc-500 font-mono">LAPSES_BY_QUADRANT</div>
                       <ResponsiveContainer width="100%" height="100%">
                           <RadarChart cx="50%" cy="50%" outerRadius="60%" data={radarData}>
                               <PolarGrid stroke="#333" />
                               <PolarAngleAxis dataKey="subject" tick={{ fill: '#555', fontSize: 10 }} />
                               <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                               <Radar name="Misses" dataKey="A" stroke="#ef4444" strokeWidth={2} fill="#ef4444" fillOpacity={0.3} />
                           </RadarChart>
                       </ResponsiveContainer>
                   </div>

                   {/* Vigilance Decrement Chart */}
                   <div className="h-48 w-full bg-zinc-900/30 border border-zinc-800 rounded p-4 relative">
                       <div className="absolute top-2 left-2 text-[10px] text-zinc-500 font-mono flex items-center gap-2">
                           <Activity size={10} /> REACTION_DECAY
                       </div>
                       <ResponsiveContainer width="100%" height="100%">
                           <LineChart data={reactionHistory}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                               <XAxis dataKey="eventIndex" stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
                               <YAxis stroke="#555" fontSize={10} tickLine={false} axisLine={false} unit="ms" />
                               <Tooltip contentStyle={{ backgroundColor: '#000', borderColor: '#333', fontSize: '12px' }} itemStyle={{ color: '#06b6d4' }} />
                               <Line type="monotone" dataKey="reactionTime" stroke="#06b6d4" strokeWidth={2} dot={{r: 2}} />
                           </LineChart>
                       </ResponsiveContainer>
                   </div>
               </div>

               <div className="text-left bg-zinc-900/50 p-6 border border-zinc-800 mb-8 rounded">
                   <h4 className="text-white font-bold mb-2 flex items-center gap-2"><AlertCircle size={16}/> Analysis</h4>
                   <p className="text-sm text-zinc-400">
                       {score / (score+misses || 1) > 0.9 ? "High Alertness. You maintained focus throughout the monotony." :
                        score / (score+misses || 1) > 0.6 ? "Average Vigilance. Some lapses in attention occurred." :
                        "Low Vigilance. Significant decrement in sustained attention detected."}
                   </p>
               </div>

               <button onClick={() => setPhase('intro')} className="btn-secondary flex items-center justify-center gap-2 mx-auto">
                   <RotateCcw size={16} /> Retake Test
               </button>
           </div>
       )}
    </div>
  );
};

export default AttentionSpanTest;
