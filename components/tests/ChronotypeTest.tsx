
import React, { useState } from 'react';
import { Moon, Sun, Briefcase, Coffee, Zap, RotateCcw, Sunrise, Sunset } from 'lucide-react';
import { saveStat } from '../../lib/core';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from 'recharts';

// Simplified Logic: 
// Lion: Early riser, crash early.
// Bear: Solar cycle, steady.
// Wolf: Late riser, energy at night.
// Dolphin: Irregular, low sleep drive.

const QUESTIONS = [
  { id: 1, text: "If you had no schedule, what time would you wake up?", options: [{label: "Before 6:30 AM", value: 1}, {label: "7:00 AM - 9:00 AM", value: 2}, {label: "After 9:00 AM", value: 3}, {label: "It varies / Insomnia", value: 4}] },
  { id: 2, text: "When do you feel most productive?", options: [{label: "Early Morning", value: 1}, {label: "Mid-day (10am - 2pm)", value: 2}, {label: "Late Night", value: 3}, {label: "Short bursts anytime", value: 4}] },
  { id: 3, text: "How is your appetite in the morning?", options: [{label: "Starving", value: 1}, {label: "Normal", value: 2}, {label: "Not hungry at all", value: 3}, {label: "I often forget to eat", value: 4}] },
  { id: 4, text: "How easy is it for you to fall asleep?", options: [{label: "Very easy (9-10pm)", value: 1}, {label: "Normal (11pm)", value: 2}, {label: "Hard, I'm wired at night", value: 3}, {label: "Light sleeper / Wake often", value: 4}] }
];

type Chronotype = 'Lion' | 'Bear' | 'Wolf' | 'Dolphin';

// Hourly energy data (0-23h)
const ENERGY_CURVES: Record<Chronotype, number[]> = {
    'Lion': [10, 10, 20, 50, 80, 95, 100, 90, 80, 70, 60, 50, 60, 50, 40, 30, 20, 15, 10, 10, 10, 10, 10, 10],
    'Bear': [10, 10, 10, 10, 20, 40, 60, 80, 90, 100, 90, 80, 70, 60, 70, 80, 70, 60, 50, 40, 30, 20, 10, 10],
    'Wolf': [20, 30, 40, 20, 10, 10, 10, 20, 30, 40, 50, 60, 70, 60, 50, 60, 80, 90, 100, 90, 80, 60, 40, 30],
    'Dolphin': [30, 20, 10, 20, 30, 40, 50, 60, 50, 40, 50, 60, 50, 40, 50, 60, 50, 40, 30, 40, 30, 20, 30, 40]
};

const ChronotypeTest: React.FC = () => {
  const [phase, setPhase] = useState<'intro' | 'quiz' | 'result'>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  
  // Interactive Schedule
  const [wakeTime, setWakeTime] = useState(7); // Default 7 AM

  const handleAnswer = (val: number) => {
      setScore(s => s + val);
      if (currentQ < QUESTIONS.length - 1) {
          setCurrentQ(q => q + 1);
      } else {
          finishTest(score + val);
      }
  };

  const finishTest = (finalScore: number) => {
      saveStat('chronotype-test', Math.round((finalScore/16)*100)); 
      setPhase('result');
  };

  const getResult = (): Chronotype => {
      if (score <= 6) return 'Lion';
      if (score <= 10) return 'Bear';
      if (score <= 13) return 'Wolf';
      return 'Dolphin';
  };

  const result = getResult();
  
  // Generate Graph Data based on Wake Time Shift
  const generateChartData = () => {
      const baseCurve = ENERGY_CURVES[result];
      // Default curves are based on ~7AM wake. 
      // If user wakes at 5AM, shift left by 2. If 9AM, shift right by 2.
      const shift = wakeTime - 7;
      
      return baseCurve.map((energy, hour) => {
          // Circular shift logic
          let sourceIndex = (hour - shift);
          if (sourceIndex < 0) sourceIndex += 24;
          if (sourceIndex >= 24) sourceIndex -= 24;
          
          return {
              hour: `${hour}:00`,
              energy: baseCurve[sourceIndex],
              isSleep: hour < wakeTime || hour > (wakeTime + 16) % 24 // Approx 16h awake
          };
      });
  };

  const chartData = generateChartData();

  return (
    <div className="max-w-3xl mx-auto text-center select-none">
       
       {phase === 'intro' && (
           <div className="py-12 animate-in fade-in">
               <Sun size={64} className="mx-auto text-amber-500 mb-6" />
               <h2 className="text-3xl font-bold text-white mb-2">Chronotype & Circadian Rhythm</h2>
               <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                   Analyze your biological clock. 
                   <br/>Find your genetically optimal times for <strong>Deep Work</strong>, <strong>Caffeine</strong>, and <strong>Sleep</strong>.
               </p>
               <button onClick={() => setPhase('quiz')} className="btn-primary">Start Analysis</button>
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
                          className="w-full p-4 border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 hover:border-amber-500/50 rounded text-left transition-all text-zinc-300 hover:text-white"
                       >
                           {opt.label}
                       </button>
                   ))}
               </div>
           </div>
       )}

       {phase === 'result' && (
           <div className="py-8 animate-in zoom-in">
               <div className="mb-8">
                   <div className="text-6xl mb-2">{result === 'Lion' ? '🦁' : result === 'Bear' ? '🐻' : result === 'Wolf' ? '🐺' : '🐬'}</div>
                   <h2 className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-1">Biological Profile</h2>
                   <div className="text-4xl font-bold text-white mb-4">{result} Chronotype</div>
                   <p className="text-zinc-400 max-w-md mx-auto text-sm">
                       {result === 'Lion' && "Early riser. Peak productivity in the morning. Exhausted by evening."}
                       {result === 'Bear' && "Solar synced. Steady energy flows. Needs consistent 8 hours."}
                       {result === 'Wolf' && "Nocturnal. Struggles with mornings. Creative peaks late at night."}
                       {result === 'Dolphin' && "Irregular. Light sleeper. Bursts of nervous energy."}
                   </p>
               </div>

               {/* Schedule Simulator */}
               <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl mb-8">
                   <div className="flex justify-between items-center mb-6">
                       <div className="text-left">
                           <h3 className="text-white font-bold flex items-center gap-2"><Zap size={16} className="text-amber-500"/> Energy Map</h3>
                           <p className="text-xs text-zinc-500">Based on your wake-up time</p>
                       </div>
                       <div className="flex items-center gap-2 bg-black px-3 py-1 rounded border border-zinc-800">
                           <Sunrise size={14} className="text-zinc-400" />
                           <select 
                              value={wakeTime} 
                              onChange={(e) => setWakeTime(parseInt(e.target.value))}
                              className="bg-transparent text-white text-xs font-mono outline-none cursor-pointer"
                           >
                               {[5,6,7,8,9,10,11,12].map(h => (
                                   <option key={h} value={h}>Wake: {h}:00 AM</option>
                               ))}
                           </select>
                       </div>
                   </div>

                   <div className="h-48 w-full">
                       <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={chartData}>
                               <defs>
                                   <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                       <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                   </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                               <XAxis dataKey="hour" stroke="#555" fontSize={9} interval={3} tickLine={false} axisLine={false} />
                               <Tooltip contentStyle={{ backgroundColor: '#09090b', border: '1px solid #333', fontSize: '12px' }} />
                               <Area 
                                  type="monotone" 
                                  dataKey="energy" 
                                  stroke="#f59e0b" 
                                  fill="url(#energyGrad)" 
                                  strokeWidth={2}
                               />
                               {/* Key Markers */}
                               <ReferenceLine x={`${wakeTime + 2}:00`} stroke="#06b6d4" strokeDasharray="3 3" label={{ value: 'Focus', fill: '#06b6d4', fontSize: 10, position: 'top' }} />
                               <ReferenceLine x={`${wakeTime + 9}:00`} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Exercise', fill: '#10b981', fontSize: 10, position: 'top' }} />
                           </AreaChart>
                       </ResponsiveContainer>
                   </div>
               </div>

               <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto text-left">
                   <div className="p-4 bg-zinc-900 border border-zinc-800 rounded">
                       <div className="flex items-center gap-2 mb-2 text-amber-500">
                           <Coffee size={16} />
                           <span className="text-xs font-bold uppercase">Caffeine Window</span>
                       </div>
                       <div className="text-white font-mono text-sm">{wakeTime + 2}:00 AM - {wakeTime + 4}:00 AM</div>
                       <p className="text-[10px] text-zinc-500 mt-1">Wait 90m after waking to avoid crash.</p>
                   </div>
                   <div className="p-4 bg-zinc-900 border border-zinc-800 rounded">
                       <div className="flex items-center gap-2 mb-2 text-indigo-500">
                           <Briefcase size={16} />
                           <span className="text-xs font-bold uppercase">Deep Work</span>
                       </div>
                       <div className="text-white font-mono text-sm">
                           {result === 'Wolf' ? `${wakeTime + 8}:00 PM` : `${wakeTime + 2}:00 AM`}
                       </div>
                       <p className="text-[10px] text-zinc-500 mt-1">Peak cognitive throughput.</p>
                   </div>
               </div>

               <button onClick={() => { setScore(0); setCurrentQ(0); setPhase('intro'); }} className="mt-12 btn-secondary flex items-center justify-center gap-2 mx-auto">
                   <RotateCcw size={16} /> Retake
               </button>
           </div>
       )}
    </div>
  );
};

export default ChronotypeTest;
