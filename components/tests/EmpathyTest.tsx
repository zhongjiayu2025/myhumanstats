import React, { useState } from 'react';
import { Heart, Brain, Scale, RotateCcw } from 'lucide-react';
import { saveStat } from '../../lib/core';

// Question Type: A = Affective (Feeling), C = Cognitive (Understanding)
const QUESTIONS = [
  { type: 'C', text: "I can easily tell if someone else wants to enter a conversation.", options: [{label: "Yes", value: 5}, {label: "Sometimes", value: 3}, {label: "No", value: 1}] },
  { type: 'C', text: "I find it hard to know what to do in a social situation.", options: [{label: "Yes", value: 1}, {label: "Sometimes", value: 3}, {label: "No", value: 5}] }, 
  { type: 'A', text: "I really enjoy caring for other people.", options: [{label: "Yes", value: 5}, {label: "Sometimes", value: 3}, {label: "No", value: 1}] },
  { type: 'A', text: "I tend to get emotionally involved with a friend's problems.", options: [{label: "Yes", value: 5}, {label: "Sometimes", value: 3}, {label: "No", value: 1}] },
  { type: 'C', text: "I am good at predicting how someone will feel.", options: [{label: "Yes", value: 5}, {label: "Sometimes", value: 3}, {label: "No", value: 1}] },
  { type: 'A', text: "Seeing people cry makes me want to cry.", options: [{label: "Yes", value: 5}, {label: "Sometimes", value: 3}, {label: "No", value: 1}] },
  { type: 'C', text: "I can usually appreciate the other person's viewpoint, even if I disagree.", options: [{label: "Yes", value: 5}, {label: "Sometimes", value: 3}, {label: "No", value: 1}] }
];

const EmpathyTest: React.FC = () => {
  const [phase, setPhase] = useState<'intro' | 'quiz' | 'result'>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [scores, setScores] = useState({ A: 0, C: 0 });

  const handleAnswer = (val: number) => {
      const type = QUESTIONS[currentQ].type as 'A' | 'C';
      setScores(prev => ({ ...prev, [type]: prev[type] + val }));
      
      if (currentQ < QUESTIONS.length - 1) {
          setCurrentQ(q => q + 1);
      } else {
          finishTest({ ...scores, [type]: scores[type] + val });
      }
  };

  const finishTest = (finalScores: {A: number, C: number}) => {
      // Normalize both to ~100 range? 
      // A total max = 3 * 5 = 15. C total max = 4 * 5 = 20.
      const normalizedScore = Math.round(((finalScores.A + finalScores.C) / 35) * 100);
      saveStat('empathy-test', normalizedScore);
      setPhase('result');
  };

  // Calculations for result view
  // Normalize each sub-score to 0-100% relative to its own max
  const aPercent = Math.round((scores.A / 15) * 100);
  const cPercent = Math.round((scores.C / 20) * 100);

  return (
    <div className="max-w-3xl mx-auto text-center select-none">
       
       {phase === 'intro' && (
           <div className="py-12 animate-in fade-in">
               <div className="flex justify-center gap-4 mb-6">
                   <div className="w-16 h-16 bg-pink-900/20 rounded-full flex items-center justify-center border border-pink-500/50">
                       <Heart size={32} className="text-pink-500" />
                   </div>
                   <div className="w-16 h-16 bg-cyan-900/20 rounded-full flex items-center justify-center border border-cyan-500/50">
                       <Brain size={32} className="text-cyan-500" />
                   </div>
               </div>
               <h2 className="text-3xl font-bold text-white mb-2">Empathy Spectrum Test</h2>
               <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                   Measure your <strong>Affective Empathy</strong> (Feeling) vs. <strong>Cognitive Empathy</strong> (Understanding).
               </p>
               <button onClick={() => setPhase('quiz')} className="btn-primary">Start Profiling</button>
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
                          className="w-full p-4 border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 hover:border-zinc-600 rounded text-left transition-all text-zinc-300 hover:text-white"
                       >
                           {opt.label}
                       </button>
                   ))}
               </div>
           </div>
       )}

       {phase === 'result' && (
           <div className="py-8 animate-in zoom-in">
               <h2 className="text-2xl font-bold text-white mb-8">Your Empathy Profile</h2>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                   
                   {/* Affective Card */}
                   <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-xl relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-4 opacity-10"><Heart size={64}/></div>
                       <div className="text-pink-500 font-bold mb-2 flex items-center gap-2">
                           <Heart size={20}/> Affective
                       </div>
                       <div className="text-4xl font-bold text-white mb-2">{aPercent}%</div>
                       <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mb-4">
                           <div className="h-full bg-pink-500" style={{ width: `${aPercent}%` }}></div>
                       </div>
                       <p className="text-xs text-zinc-400 text-left leading-relaxed">
                           Your ability to physically feel what others are feeling. High scores indicate "Emotional Contagion".
                       </p>
                   </div>

                   {/* Cognitive Card */}
                   <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-xl relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-4 opacity-10"><Brain size={64}/></div>
                       <div className="text-cyan-500 font-bold mb-2 flex items-center gap-2">
                           <Brain size={20}/> Cognitive
                       </div>
                       <div className="text-4xl font-bold text-white mb-2">{cPercent}%</div>
                       <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mb-4">
                           <div className="h-full bg-cyan-500" style={{ width: `${cPercent}%` }}></div>
                       </div>
                       <p className="text-xs text-zinc-400 text-left leading-relaxed">
                           Your ability to intellectually understand another's perspective ("Theory of Mind"). Useful for negotiation.
                       </p>
                   </div>
               </div>

               {/* Balance Analysis */}
               <div className="bg-black border border-zinc-800 p-6 rounded-xl mb-8">
                   <h3 className="text-white font-bold mb-2 flex items-center justify-center gap-2"><Scale size={18}/> Balance Analysis</h3>
                   <p className="text-sm text-zinc-400">
                       {Math.abs(aPercent - cPercent) < 20 ? "You have a balanced empathy profile. You can both feel and understand others effectively." :
                        aPercent > cPercent ? "You lead with your heart. You feel deeply but may sometimes struggle to detach objectively." :
                        "You lead with your head. You are great at understanding perspectives but may appear emotionally distant."}
                   </p>
               </div>

               <button onClick={() => { setScores({A:0, C:0}); setCurrentQ(0); setPhase('intro'); }} className="btn-secondary flex items-center justify-center gap-2 mx-auto">
                   <RotateCcw size={16} /> Retake
               </button>
           </div>
       )}
    </div>
  );
};

export default EmpathyTest;