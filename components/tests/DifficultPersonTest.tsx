import React, { useState } from 'react';
import { UserX, RefreshCcw, ShieldAlert } from 'lucide-react';
import { saveStat } from '../../lib/core';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

// Traits based on IDRlabs Difficult Person Test model
const TRAITS = ['Callousness', 'Grandiosity', 'Aggression', 'Suspicion', 'Risk'];

const QUESTIONS = [
  // Callousness
  { id: 1, trait: 'Callousness', text: "I find it hard to feel sympathy for people who make mistakes.", options: [{label: "Strongly Agree", value: 5}, {label: "Neutral", value: 3}, {label: "Disagree", value: 1}] },
  // Grandiosity
  { id: 2, trait: 'Grandiosity', text: "I am more talented than most people I know.", options: [{label: "True", value: 5}, {label: "Neutral", value: 3}, {label: "False", value: 1}] },
  // Aggression
  { id: 3, trait: 'Aggression', text: "It is easy to make me angry.", options: [{label: "Yes", value: 5}, {label: "Sometimes", value: 3}, {label: "No", value: 1}] },
  // Suspicion
  { id: 4, trait: 'Suspicion', text: "I often suspect that others have hidden motives.", options: [{label: "Strongly Agree", value: 5}, {label: "Neutral", value: 3}, {label: "Disagree", value: 1}] },
  // Risk
  { id: 5, trait: 'Risk', text: "I act on impulse without thinking of the consequences.", options: [{label: "Often", value: 5}, {label: "Sometimes", value: 3}, {label: "Never", value: 1}] },
  
  // Round 2
  { id: 6, trait: 'Callousness', text: "Others' feelings are their own problem.", options: [{label: "Agree", value: 5}, {label: "Neutral", value: 3}, {label: "Disagree", value: 1}] },
  { id: 7, trait: 'Grandiosity', text: "I deserve special treatment.", options: [{label: "Agree", value: 5}, {label: "Neutral", value: 3}, {label: "Disagree", value: 1}] },
];

const DifficultPersonTest: React.FC = () => {
  const [phase, setPhase] = useState<'intro' | 'quiz' | 'result'>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({
      Callousness: 0,
      Grandiosity: 0,
      Aggression: 0,
      Suspicion: 0,
      Risk: 0
  });

  const handleAnswer = (val: number) => {
      const trait = QUESTIONS[currentQ].trait;
      setScores(prev => ({ ...prev, [trait]: prev[trait] + val }));
      
      if (currentQ < QUESTIONS.length - 1) {
          setCurrentQ(q => q + 1);
      } else {
          finishTest({ ...scores, [trait]: scores[trait] + val });
      }
  };

  const finishTest = (finalScores: Record<string, number>) => {
      // Normalize scores. 
      // Most traits have 1-2 questions in this mini version.
      // Let's normalize to 0-100% for radar
      
      // Calculate total "Difficulty" score (Average of percentages)
      // Max possible per trait varies in this short version, let's normalize roughly.
      // For demo, assumes 2 Qs per trait roughly, or dynamic.
      
      // Just sum raw for total score (approx)
      const totalRaw = Object.values(finalScores).reduce((a: number, b: number) => a + b, 0);
      const maxPossible = QUESTIONS.length * 5;
      const normalizedTotal = Math.round((totalRaw / maxPossible) * 100);
      
      saveStat('difficult-person-test', normalizedTotal);
      setPhase('result');
  };

  const getRadarData = () => {
      // Normalize each trait to 100
      // Find max per trait
      const traitCounts: Record<string, number> = {};
      QUESTIONS.forEach(q => traitCounts[q.trait] = (traitCounts[q.trait] || 0) + 5);
      
      return TRAITS.map(trait => ({
          subject: trait,
          A: Math.round((scores[trait] / (traitCounts[trait] || 5)) * 100),
          fullMark: 100
      }));
  };

  const totalScore = Math.round((Object.values(scores).reduce((a: number, b: number) => a + b, 0) / (QUESTIONS.length * 5)) * 100);

  return (
    <div className="max-w-3xl mx-auto text-center select-none">
       
       {phase === 'intro' && (
           <div className="py-12 animate-in fade-in">
               <UserX size={64} className="mx-auto text-zinc-600 mb-6" />
               <h2 className="text-3xl font-bold text-white mb-2">Difficult Person Test</h2>
               <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                   Based on the Five-Factor Model of personality (FFM) and research on the "Dark Triad".
                   <br/>Measure traits like <strong>Callousness</strong>, <strong>Grandiosity</strong>, and <strong>Suspicion</strong>.
               </p>
               <button onClick={() => setPhase('quiz')} className="btn-primary">Start Profiling</button>
           </div>
       )}

       {phase === 'quiz' && (
           <div className="py-12 animate-in slide-in-from-right">
               <div className="flex justify-between items-center px-8 mb-8">
                   <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">{QUESTIONS[currentQ].trait}</span>
                   <span className="text-xs font-mono text-primary-500">Q.{currentQ + 1} / {QUESTIONS.length}</span>
               </div>

               <div className="tech-border bg-surface p-8 min-h-[300px] flex flex-col justify-center">
                   <h3 className="text-xl text-white font-medium mb-8">{QUESTIONS[currentQ].text}</h3>
                   <div className="space-y-2">
                       {QUESTIONS[currentQ].options.map((opt, i) => (
                           <button 
                              key={i}
                              onClick={() => handleAnswer(opt.value)}
                              className="w-full text-left p-4 border border-zinc-800 bg-black/50 hover:bg-zinc-900 hover:border-red-500/30 text-zinc-400 hover:text-white transition-all rounded"
                           >
                               {opt.label}
                           </button>
                       ))}
                   </div>
               </div>
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
                            <Radar name="Traits" dataKey="A" stroke="#ef4444" strokeWidth={2} fill="#ef4444" fillOpacity={0.3} />
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