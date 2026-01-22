import React, { useState } from 'react';
import { UserX, RefreshCcw, Skull, ShieldAlert, HeartHandshake } from 'lucide-react';
import { saveStat } from '../../lib/core';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

// Traits based on IDRlabs Difficult Person Test model
const TRAITS = ['Callousness', 'Grandiosity', 'Aggression', 'Suspicion', 'Risk'];

const SCENARIOS = [
  { 
      id: 1, 
      trait: 'Callousness', 
      text: "A waiter accidentally spills water on your table.", 
      leftLabel: "Demand a manager", 
      rightLabel: "Help clean it up",
      icon: <Skull size={24} className="text-zinc-500"/>
  },
  { 
      id: 2, 
      trait: 'Grandiosity', 
      text: "You are working on a group project.", 
      leftLabel: "I should lead everything", 
      rightLabel: "We share tasks equally",
      icon: <UserX size={24} className="text-zinc-500"/>
  },
  { 
      id: 3, 
      trait: 'Aggression', 
      text: "Someone cuts you off in traffic.", 
      leftLabel: "Road rage / Honk", 
      rightLabel: "Let it go calmly",
      icon: <ShieldAlert size={24} className="text-zinc-500"/>
  },
  { 
      id: 4, 
      trait: 'Suspicion', 
      text: "A colleague offers you unexpected help.", 
      leftLabel: "What do they want?", 
      rightLabel: "How kind of them",
      icon: <ShieldAlert size={24} className="text-zinc-500"/>
  },
  { 
      id: 5, 
      trait: 'Risk', 
      text: "You see a shortcut that trespasses private property.", 
      leftLabel: "Take it immediately", 
      rightLabel: "Stick to the path",
      icon: <Skull size={24} className="text-zinc-500"/>
  },
];

const DifficultPersonTest: React.FC = () => {
  const [phase, setPhase] = useState<'intro' | 'quiz' | 'result'>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [sliderValue, setSliderValue] = useState(50);
  const [scores, setScores] = useState<Record<string, number>>({
      Callousness: 0,
      Grandiosity: 0,
      Aggression: 0,
      Suspicion: 0,
      Risk: 0
  });

  const handleNext = () => {
      // Slider 0 (Left/Dark) to 100 (Right/Light)
      // We want high score = Difficult.
      // So if slider is 0 (Left), score add 100. If 100 (Right), score add 0.
      const difficultyPoints = 100 - sliderValue;
      
      const trait = SCENARIOS[currentQ].trait;
      setScores(prev => ({ ...prev, [trait]: difficultyPoints })); // One Q per trait in this mini version
      
      if (currentQ < SCENARIOS.length - 1) {
          setCurrentQ(q => q + 1);
          setSliderValue(50); // Reset center
      } else {
          finishTest({ ...scores, [trait]: difficultyPoints });
      }
  };

  const finishTest = (finalScores: Record<string, number>) => {
      const totalRaw = (Object.values(finalScores) as number[]).reduce((a, b) => a + b, 0);
      const avg = Math.round(totalRaw / SCENARIOS.length);
      
      saveStat('difficult-person-test', avg);
      setPhase('result');
  };

  const getRadarData = () => {
      return TRAITS.map(trait => ({
          subject: trait,
          A: scores[trait] || 0,
          fullMark: 100
      }));
  };

  const totalScore = Math.round((Object.values(scores) as number[]).reduce((a, b) => a + b, 0) / SCENARIOS.length);

  // Dynamic "Dark Core" color based on slider
  const getCoreColor = () => {
      const val = 100 - sliderValue; // 0 (Good) to 100 (Bad)
      // Green (0) -> Red (100)
      return `rgb(${val * 2.55}, ${(100-val)*2}, 50)`;
  };

  return (
    <div className="max-w-3xl mx-auto text-center select-none">
       
       {phase === 'intro' && (
           <div className="py-12 animate-in fade-in">
               <UserX size={64} className="mx-auto text-zinc-600 mb-6" />
               <h2 className="text-3xl font-bold text-white mb-2">Difficult Person Test</h2>
               <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                   Based on the Five-Factor Model and Dark Triad research.
                   <br/>Use the <strong>Moral Slider</strong> to respond to conflict scenarios.
               </p>
               <button onClick={() => setPhase('quiz')} className="btn-primary">Start Profiling</button>
           </div>
       )}

       {phase === 'quiz' && (
           <div className="py-12 animate-in slide-in-from-right">
               <div className="flex justify-between items-center px-8 mb-12">
                   <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">{SCENARIOS[currentQ].trait}</span>
                   <span className="text-xs font-mono text-primary-500">SCENARIO {currentQ + 1} / {SCENARIOS.length}</span>
               </div>

               <div className="mb-12 min-h-[100px] flex items-center justify-center flex-col">
                   {SCENARIOS[currentQ].icon}
                   <h3 className="text-2xl text-white font-medium mt-4 max-w-lg leading-relaxed">{SCENARIOS[currentQ].text}</h3>
               </div>

               {/* Moral Slider */}
               <div className="max-w-xl mx-auto bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800 relative overflow-hidden">
                   
                   {/* Background Gradient Visualization */}
                   <div className="absolute inset-0 opacity-20 pointer-events-none" 
                        style={{ background: `linear-gradient(to right, #ef4444 0%, transparent 50%, #10b981 100%)` }}>
                   </div>

                   <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={sliderValue}
                      onChange={(e) => setSliderValue(parseInt(e.target.value))}
                      className="w-full h-4 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-white relative z-10"
                   />
                   
                   <div className="flex justify-between mt-6 text-sm font-bold">
                       <span className="text-red-500 w-1/3 text-left leading-tight">{SCENARIOS[currentQ].leftLabel}</span>
                       <span className="text-emerald-500 w-1/3 text-right leading-tight">{SCENARIOS[currentQ].rightLabel}</span>
                   </div>
               </div>

               <button onClick={handleNext} className="mt-12 btn-primary w-48">
                   Next Scenario
               </button>
           </div>
       )}

       {phase === 'result' && (
           <div className="py-8 animate-in zoom-in">
               <div className="mb-4">
                   <h2 className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-2">Difficulty Score</h2>
                   <div className={`text-6xl font-bold mb-2 ${totalScore > 60 ? 'text-red-500' : 'text-emerald-500'}`}>
                       {totalScore}%
                   </div>
                   <p className="text-zinc-400 text-sm max-w-sm mx-auto">
                       {totalScore > 60 ? "High Difficulty. You may often find yourself in conflict with others." : "Easy Going. You are generally agreeable and cooperative."}
                   </p>
               </div>

               {/* Radar Chart */}
               <div className="h-64 w-full relative mb-8">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={getRadarData()}>
                            <PolarGrid stroke="#333" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#71717a', fontSize: 10 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar name="Traits" dataKey="A" stroke="#ef4444" strokeWidth={2} fill="#ef4444" fillOpacity={0.5} />
                        </RadarChart>
                    </ResponsiveContainer>
               </div>

               {/* Trait Breakdown */}
               <div className="grid grid-cols-2 gap-2 max-w-md mx-auto mb-8 text-left">
                   {getRadarData().map(d => (
                       <div key={d.subject} className="bg-zinc-900/50 border border-zinc-800 p-2 px-3 rounded flex justify-between items-center">
                           <span className="text-xs text-zinc-400">{d.subject}</span>
                           <span className={`text-xs font-mono font-bold ${d.A > 60 ? 'text-red-400' : 'text-zinc-500'}`}>{d.A}%</span>
                       </div>
                   ))}
               </div>

               <button onClick={() => window.location.reload()} className="btn-secondary flex items-center justify-center gap-2 mx-auto">
                   <RefreshCcw size={16} /> Retake Test
               </button>
           </div>
       )}
    </div>
  );
};

export default DifficultPersonTest;