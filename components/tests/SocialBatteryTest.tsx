
import React, { useState } from 'react';
import { BatteryCharging, BatteryWarning, Users, BookOpen, Music, Mic2, RefreshCcw, Activity, XCircle, CheckCircle } from 'lucide-react';
import { saveStat } from '../../lib/core';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';

interface Scenario {
    id: number;
    title: string;
    icon: React.ElementType;
    description: string;
}

const SCENARIOS: Scenario[] = [
    { id: 1, title: "Loud House Party", icon: Music, description: "Crowded room, loud music, shouting to talk." },
    { id: 2, title: "Quiet Library", icon: BookOpen, description: "Reading alone for 3 hours in silence." },
    { id: 3, title: "Group Project", icon: Users, description: "Collaborating with 5 people on a deadline." },
    { id: 4, title: "Public Speaking", icon: Mic2, description: "Giving a presentation to 20 people." },
    { id: 5, title: "Dinner with Best Friend", icon: Users, description: "One-on-one deep conversation." },
];

const SocialBatteryTest: React.FC = () => {
  const [phase, setPhase] = useState<'intro' | 'sim' | 'result'>('intro');
  const [batteryLevel, setBatteryLevel] = useState(50); // Start at 50%
  const [currentScenario, setCurrentScenario] = useState(0);
  
  // Data for Graph
  const [energyHistory, setEnergyHistory] = useState<{step: string, level: number}[]>([
      { step: 'Start', level: 50 }
  ]);

  // Rejection Simulator Stats
  const [hesitationTime, setHesitationTime] = useState(0);

  const handleChoice = (change: number) => {
      const newLevel = Math.max(0, Math.min(100, batteryLevel + change));
      setBatteryLevel(newLevel);
      setEnergyHistory(prev => [...prev, { step: `Evt ${currentScenario+1}`, level: newLevel }]);
      
      if (currentScenario < SCENARIOS.length - 1) {
          setCurrentScenario(c => c + 1);
      } else {
          finishTest(newLevel);
      }
  };

  const finishTest = (finalLevel: number) => {
      saveStat('social-battery', finalLevel);
      setPhase('result');
  };

  const activeScenario = SCENARIOS[currentScenario];

  return (
    <div className="max-w-2xl mx-auto text-center select-none">
       
       {phase === 'intro' && (
           <div className="py-12 animate-in fade-in">
               <BatteryCharging size={64} className="mx-auto text-emerald-500 mb-6" />
               <h2 className="text-3xl font-bold text-white mb-2">Social Battery Simulator</h2>
               <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                   Simulate a week of social activities.
                   <br/>We will track your <strong>Energy Flux</strong> to determine your social recharge rate.
               </p>
               <button onClick={() => setPhase('sim')} className="btn-primary">Start Simulation</button>
           </div>
       )}

       {phase === 'sim' && (
           <div className="py-8 animate-in slide-in-from-right">
               {/* Live Energy Graph */}
               <div className="mb-8 h-32 w-full bg-zinc-900/30 border border-zinc-800 rounded-lg p-2">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={energyHistory}>
                           <defs>
                               <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                               </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                           <XAxis dataKey="step" hide />
                           <YAxis domain={[0, 100]} hide />
                           <Tooltip contentStyle={{ backgroundColor: '#000', borderColor: '#333', fontSize: '12px' }} />
                           <Area type="monotone" dataKey="level" stroke="#10b981" strokeWidth={2} fill="url(#colorLevel)" animationDuration={300} />
                           <ReferenceLine y={50} stroke="#555" strokeDasharray="3 3" />
                       </AreaChart>
                   </ResponsiveContainer>
               </div>

               {/* Scenario Card */}
               <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-xl mb-8 max-w-md mx-auto min-h-[220px] flex flex-col justify-center">
                   <div className="flex items-center justify-center gap-2 mb-4 text-zinc-500 text-xs font-mono uppercase tracking-widest">
                       Event {currentScenario + 1}/{SCENARIOS.length}
                   </div>
                   <activeScenario.icon size={48} className="mx-auto text-white mb-6" />
                   <h3 className="text-2xl font-bold text-white mb-2">{activeScenario.title}</h3>
                   <p className="text-sm text-zinc-400">{activeScenario.description}</p>
               </div>

               <div className="flex justify-center gap-6">
                   <button 
                      onClick={() => handleChoice(-20)}
                      className="flex-1 max-w-[140px] py-4 bg-red-900/20 border border-red-500/30 hover:bg-red-900/40 hover:border-red-500 text-red-400 font-bold rounded-xl flex flex-col items-center gap-2 transition-all active:scale-95"
                   >
                       <BatteryWarning size={24} />
                       <span>DRAIN (-20)</span>
                   </button>
                   <button 
                      onClick={() => handleChoice(20)}
                      className="flex-1 max-w-[140px] py-4 bg-emerald-900/20 border border-emerald-500/30 hover:bg-emerald-900/40 hover:border-emerald-500 text-emerald-400 font-bold rounded-xl flex flex-col items-center gap-2 transition-all active:scale-95"
                   >
                       <BatteryCharging size={24} />
                       <span>CHARGE (+20)</span>
                   </button>
               </div>
           </div>
       )}

       {phase === 'result' && (
           <div className="py-12 animate-in zoom-in">
               <div className="mb-8">
                   <h2 className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-2">Final Energy Level</h2>
                   <div className={`text-6xl font-bold mb-4 ${batteryLevel > 60 ? 'text-emerald-500' : batteryLevel > 30 ? 'text-yellow-500' : 'text-red-500'}`}>
                       {batteryLevel}%
                   </div>
               </div>

               {/* Full Graph Recap */}
               <div className="h-48 w-full bg-zinc-900/30 border border-zinc-800 rounded-lg p-4 mb-8">
                   <div className="text-[10px] text-zinc-500 font-mono text-left mb-2 flex items-center gap-2"><Activity size={12}/> SOCIAL_FLUX_TIMELINE</div>
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={energyHistory}>
                           <defs>
                               <linearGradient id="resGrad" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                               </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                           <XAxis dataKey="step" stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
                           <YAxis stroke="#555" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                           <Tooltip contentStyle={{ backgroundColor: '#000', borderColor: '#333' }} />
                           <Area type="monotone" dataKey="level" stroke="#8b5cf6" strokeWidth={2} fill="url(#resGrad)" />
                       </AreaChart>
                   </ResponsiveContainer>
               </div>

               {/* Analysis Logic */}
               <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl max-w-md mx-auto text-left">
                   <h3 className="text-white font-bold mb-2">Personality Insight</h3>
                   <p className="text-sm text-zinc-400 leading-relaxed">
                       {batteryLevel > 70 ? "Social Dynamo. You gain significant energy from interaction. Likely Extrovert." :
                        batteryLevel < 30 ? "Solitary Recharger. Social interaction costs you energy. Likely Introvert." :
                        "Ambivert. Your social battery fluctuates based on the context."}
                   </p>
               </div>

               <button onClick={() => { setPhase('intro'); setBatteryLevel(50); setCurrentScenario(0); setEnergyHistory([{step:'Start', level:50}]); }} className="btn-secondary mt-8 flex items-center justify-center gap-2 mx-auto">
                   <RefreshCcw size={16} /> Restart Simulator
               </button>
           </div>
       )}
    </div>
  );
};

export default SocialBatteryTest;
