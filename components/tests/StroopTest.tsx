
import React, { useState, useEffect } from 'react';
import { saveStat } from '../../lib/core';
import { Brain, Keyboard, RotateCcw, Zap, Shuffle, Type, Palette } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = [
  { name: 'Red', hex: '#ef4444', key: '1' },
  { name: 'Blue', hex: '#3b82f6', key: '2' },
  { name: 'Green', hex: '#22c55e', key: '3' },
  { name: 'Yellow', hex: '#eab308', key: '4' },
];

const StroopTest: React.FC = () => {
  const [phase, setPhase] = useState<'intro' | 'play' | 'end'>('intro');
  const [count, setCount] = useState(0);
  const [current, setCurrent] = useState({ text: 'Red', color: '#ef4444', isCongruent: true });
  
  // New: Rule Switching State
  const [currentRule, setCurrentRule] = useState<'color' | 'text'>('color');
  
  // Game State
  const [startTime, setStartTime] = useState(0);
  const [results, setResults] = useState<{type: 'congruent'|'incongruent', rule: 'color'|'text', time: number, correct: boolean}[]>([]);
  const [combo, setCombo] = useState(0);
  const [shake, setShake] = useState(false);

  const TOTAL_TRIALS = 20;

  const nextTrial = () => {
    if (count >= TOTAL_TRIALS) {
       finish();
       return;
    }
    
    // 1. Generate Stimulus
    const textIdx = Math.floor(Math.random() * 4);
    // 50% chance of congruent (match), 50% chance of incongruent (mismatch)
    const isCongruent = Math.random() > 0.5;
    
    let colorIdx;
    if (isCongruent) {
        colorIdx = textIdx;
    } else {
        // Pick a different color
        do {
            colorIdx = Math.floor(Math.random() * 4);
        } while (colorIdx === textIdx);
    }
    
    // 2. Generate Rule (Switching logic)
    // 30% chance to switch rule from previous
    // Or simpler: 50/50 rule distribution
    const newRule = Math.random() > 0.5 ? 'color' : 'text';
    setCurrentRule(newRule);
    
    setCurrent({
       text: COLORS[textIdx].name,
       color: COLORS[colorIdx].hex,
       isCongruent
    });
    setStartTime(performance.now());
    setCount(c => c + 1);
  };

  const start = () => {
     setResults([]);
     setCount(0);
     setCombo(0);
     setPhase('play');
     nextTrial();
  };

  const handleAnswer = (selectedColorName: string) => {
     const endTime = performance.now();
     const reaction = endTime - startTime;

     // Logic dependent on rule
     let correctName = "";
     
     if (currentRule === 'color') {
         // Match the INK COLOR
         const correctColorObj = COLORS.find(c => c.hex === current.color);
         correctName = correctColorObj?.name || "";
     } else {
         // Match the WRITTEN TEXT
         correctName = current.text;
     }

     const isCorrect = correctName === selectedColorName;
     
     if (isCorrect) {
         setCombo(c => c + 1);
     } else {
         setCombo(0);
         setShake(true);
         setTimeout(() => setShake(false), 300);
     }

     setResults(prev => [...prev, {
         type: current.isCongruent ? 'congruent' : 'incongruent',
         rule: currentRule,
         time: reaction,
         correct: isCorrect
     }]);
     
     nextTrial();
  };

  // Keyboard Support
  useEffect(() => {
      const handleKey = (e: KeyboardEvent) => {
          if (phase !== 'play') return;
          const match = COLORS.find(c => c.key === e.key);
          if (match) {
              handleAnswer(match.name);
          }
      };
      window.addEventListener('keydown', handleKey);
      return () => window.removeEventListener('keydown', handleKey);
  }, [phase, current, currentRule]);

  const finish = () => {
     setPhase('end');
     const stats = calculateStats(results);
     
     // Normalize score with switch cost penalty
     const costScore = Math.max(0, Math.min(100, 100 - ((stats.diff - 50) / 2.5)));
     const accuracy = results.filter(r => r.correct).length / TOTAL_TRIALS;
     const finalScore = Math.round(costScore * accuracy);
     
     saveStat('stroop-effect-test', finalScore);
  };

  const calculateStats = (res: typeof results) => {
     const congruentTrials = res.filter(r => r.type === 'congruent' && r.correct);
     const incongruentTrials = res.filter(r => r.type === 'incongruent' && r.correct);
     
     const avgC = congruentTrials.reduce((a,b) => a+b.time, 0) / (congruentTrials.length || 1);
     const avgI = incongruentTrials.reduce((a,b) => a+b.time, 0) / (incongruentTrials.length || 1);
     
     return { avgC, avgI, diff: avgI - avgC };
  };

  const stats = phase === 'end' ? calculateStats(results) : { avgC: 0, avgI: 0, diff: 0 };
  const chartData = [
      { name: 'Matching (Easy)', time: Math.round(stats.avgC), color: '#10b981' },
      { name: 'Conflict (Hard)', time: Math.round(stats.avgI), color: '#ef4444' }
  ];

  return (
    <div className="max-w-xl mx-auto text-center select-none touch-none">
       {phase === 'intro' && (
          <div className="py-12 animate-in fade-in">
             <Brain size={64} className="mx-auto text-zinc-600 mb-6" />
             <h2 className="text-3xl font-bold text-white mb-2">Advanced Stroop Test</h2>
             <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                Test your Cognitive Flexibility. 
                <br/>The rule will switch between <strong>MATCH COLOR</strong> and <strong>MATCH TEXT</strong>.
                <br/>Adapt instantly to the changing instructions.
             </p>
             <button onClick={start} className="btn-primary">Start Cognitive Test</button>
          </div>
       )}

       {phase === 'play' && (
          <div className="h-[500px] flex flex-col justify-between">
             {/* HUD */}
             <div className="flex justify-between items-center px-4 pt-2">
                 <div className="text-[10px] text-zinc-600 font-mono">TRIAL {count + 1}/{TOTAL_TRIALS}</div>
                 {combo > 1 && (
                     <div className="text-amber-500 font-bold text-sm animate-bounce flex items-center gap-1">
                         <Zap size={14} fill="currentColor" /> {combo} COMBO
                     </div>
                 )}
             </div>

             {/* Rule Indicator */}
             <div className="flex justify-center mt-4">
                 <div className={`
                    px-6 py-2 rounded-full border-2 font-bold uppercase tracking-widest text-lg flex items-center gap-2 transition-all duration-300
                    ${currentRule === 'color' ? 'bg-primary-500/20 border-primary-500 text-primary-400' : 'bg-white/10 border-white text-white'}
                 `}>
                     {currentRule === 'color' ? <Palette size={20}/> : <Type size={20}/>}
                     MATCH {currentRule === 'color' ? 'INK COLOR' : 'WORD TEXT'}
                 </div>
             </div>

             {/* Stimulus */}
             <div className={`flex-grow flex items-center justify-center relative ${shake ? 'animate-shake' : ''}`}>
                <style>{`
                    @keyframes shake {
                        0%, 100% { transform: translateX(0); }
                        25% { transform: translateX(-5px); }
                        75% { transform: translateX(5px); }
                    }
                    .animate-shake { animation: shake 0.2s ease-in-out; }
                `}</style>
                <h1 
                   className="text-7xl font-black tracking-tighter transition-all duration-75 scale-110"
                   style={{ color: current.color, textShadow: `0 0 30px ${current.color}40` }}
                >
                   {current.text}
                </h1>
             </div>
             
             {/* Controls */}
             <div className="grid grid-cols-2 gap-4 pb-4">
                {COLORS.map(c => (
                   <button 
                      key={c.name}
                      onMouseDown={(e) => { e.preventDefault(); handleAnswer(c.name); }}
                      onTouchStart={(e) => { e.preventDefault(); handleAnswer(c.name); }}
                      className="py-8 border border-zinc-700 bg-zinc-900 active:bg-zinc-700 text-white font-bold uppercase tracking-widest clip-corner-sm relative group active:scale-[0.98] transition-transform no-tap-highlight"
                   >
                      <span className="text-xl">{c.name}</span>
                      <div className="absolute top-2 left-2 w-3 h-3 rounded-full" style={{ backgroundColor: c.hex }}></div>
                   </button>
                ))}
             </div>
          </div>
       )}

       {phase === 'end' && (
          <div className="py-12 animate-in zoom-in">
             <h2 className="text-2xl text-white font-bold mb-8">Executive Function Report</h2>
             
             {/* Main Metric */}
             <div className="mb-8">
                 <div className="text-[10px] text-zinc-500 uppercase font-mono tracking-widest mb-1">Stroop Cost (Interference)</div>
                 <div className={`text-5xl font-mono font-bold ${stats.diff < 100 ? 'text-emerald-500' : stats.diff < 200 ? 'text-yellow-500' : 'text-red-500'}`}>
                     {Math.round(stats.diff)}<span className="text-lg text-zinc-600">ms</span>
                 </div>
                 <p className="text-xs text-zinc-400 mt-2 max-w-sm mx-auto">
                     {stats.diff < 100 ? "Elite Flexibility. Your brain switches contexts effortlessly." : 
                      stats.diff < 200 ? "Normal Range. Cognitive switching causes expected delay." : 
                      "High Interference. The conflicting rules slowed down your processing significantly."}
                 </p>
             </div>

             {/* Chart */}
             <div className="h-48 w-full bg-zinc-900/30 border border-zinc-800 rounded p-4 mb-8 relative">
                 <div className="absolute top-2 left-2 text-[10px] text-zinc-500 font-mono">REACTION_TIME_COMPARISON</div>
                 <ResponsiveContainer width="100%" height="100%">
                     <BarChart layout="vertical" data={chartData} margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                         <XAxis type="number" hide />
                         <YAxis dataKey="name" type="category" width={100} stroke="#71717a" fontSize={10} fontWeight={700} />
                         <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', fontSize: '12px' }} />
                         <Bar dataKey="time" barSize={20} radius={[0, 4, 4, 0]}>
                             {chartData.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={entry.color} />
                             ))}
                         </Bar>
                     </BarChart>
                 </ResponsiveContainer>
             </div>
             
             <button onClick={start} className="btn-secondary flex items-center justify-center gap-2 mx-auto">
                 <RotateCcw size={16} /> Restart Protocol
             </button>
          </div>
       )}
    </div>
  );
};

export default StroopTest;
