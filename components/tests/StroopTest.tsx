import React, { useState, useEffect } from 'react';
import { saveStat } from '../../lib/core';
import { Brain, Keyboard, RotateCcw, Zap } from 'lucide-react';
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
  
  // Game State
  const [startTime, setStartTime] = useState(0);
  const [results, setResults] = useState<{type: 'congruent'|'incongruent', time: number, correct: boolean}[]>([]);
  const [combo, setCombo] = useState(0);
  const [shake, setShake] = useState(false);

  const TOTAL_TRIALS = 16;

  const nextTrial = () => {
    if (count >= TOTAL_TRIALS) {
       finish();
       return;
    }
    
    // Generate new stimulus
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

  const handleAnswer = (colorName: string) => {
     const endTime = performance.now();
     const reaction = endTime - startTime;

     // Correct answer is the COLOR of the text (current.color hex -> match to name)
     const correctColorObj = COLORS.find(c => c.hex === current.color);
     const isCorrect = correctColorObj?.name === colorName;
     
     if (isCorrect) {
         setCombo(c => c + 1);
     } else {
         setCombo(0);
         setShake(true);
         setTimeout(() => setShake(false), 300);
     }

     setResults(prev => [...prev, {
         type: current.isCongruent ? 'congruent' : 'incongruent',
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
  }, [phase, current]);

  const finish = () => {
     setPhase('end');
     const stats = calculateStats(results); // Use local helper
     
     // Normalize score: Low Stroop Cost is better. 
     // <50ms cost = 100pts. >300ms cost = 0pts.
     // Also penalize inaccuracy heavily.
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
    <div className="max-w-xl mx-auto text-center select-none">
       {phase === 'intro' && (
          <div className="py-12 animate-in fade-in">
             <Brain size={64} className="mx-auto text-zinc-600 mb-6" />
             <h2 className="text-3xl font-bold text-white mb-2">Stroop Effect Test</h2>
             <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                Test your inhibitory control. Click the button that matches the <strong>INK COLOR</strong>, not the word text.
                <br/>
                <span className="text-xs text-zinc-500 font-mono mt-2 block"><Keyboard size={12} className="inline mr-1"/> Keys 1 (Red), 2 (Blue), 3 (Green), 4 (Yellow)</span>
             </p>
             <button onClick={start} className="btn-primary">Start Cognitive Test</button>
          </div>
       )}

       {phase === 'play' && (
          <div className="h-[450px] flex flex-col justify-between">
             {/* HUD */}
             <div className="flex justify-between items-center px-4 pt-2">
                 <div className="text-[10px] text-zinc-600 font-mono">TRIAL {count + 1}/{TOTAL_TRIALS}</div>
                 {combo > 1 && (
                     <div className="text-amber-500 font-bold text-sm animate-bounce flex items-center gap-1">
                         <Zap size={14} fill="currentColor" /> {combo} COMBO
                     </div>
                 )}
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
             <div className="grid grid-cols-2 gap-4">
                {COLORS.map(c => (
                   <button 
                      key={c.name}
                      onClick={() => handleAnswer(c.name)}
                      className="py-6 border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-white font-bold uppercase tracking-widest clip-corner-sm relative group active:scale-[0.98] transition-transform"
                   >
                      <span className="text-xl">{c.name}</span>
                      <span className="absolute top-2 left-2 text-[10px] text-zinc-600 font-mono group-hover:text-primary-500">[{c.key}]</span>
                      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   </button>
                ))}
             </div>
          </div>
       )}

       {phase === 'end' && (
          <div className="py-12 animate-in zoom-in">
             <h2 className="text-2xl text-white font-bold mb-8">Cognitive Processing Report</h2>
             
             {/* Main Metric */}
             <div className="mb-8">
                 <div className="text-[10px] text-zinc-500 uppercase font-mono tracking-widest mb-1">Stroop Cost (Brain Lag)</div>
                 <div className={`text-5xl font-mono font-bold ${stats.diff < 100 ? 'text-emerald-500' : stats.diff < 200 ? 'text-yellow-500' : 'text-red-500'}`}>
                     {Math.round(stats.diff)}<span className="text-lg text-zinc-600">ms</span>
                 </div>
                 <p className="text-xs text-zinc-400 mt-2 max-w-sm mx-auto">
                     {stats.diff < 100 ? "Excellent inhibitory control. Your brain filters conflicting information efficiently." : 
                      stats.diff < 200 ? "Normal range. The conflicting color information slowed you down slightly." : 
                      "High interference detected. The semantic meaning of the word strongly overrode the visual color processing."}
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