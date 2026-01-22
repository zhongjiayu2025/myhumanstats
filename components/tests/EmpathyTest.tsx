
import React, { useState } from 'react';
import { Heart, Brain, Eye, RotateCcw, ScanLine } from 'lucide-react';
import { saveStat } from '../../lib/core';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ZAxis } from 'recharts';

// --- Types ---
type Phase = 'intro' | 'quiz' | 'eyes-task' | 'result';

// Q1-Q7 are Questionnaire.
const QUESTIONS = [
  { type: 'C', text: "I can easily tell if someone else wants to enter a conversation.", options: [{label: "Yes", value: 5}, {label: "Sometimes", value: 3}, {label: "No", value: 1}] },
  { type: 'C', text: "I find it hard to know what to do in a social situation.", options: [{label: "Yes", value: 1}, {label: "Sometimes", value: 3}, {label: "No", value: 5}] }, 
  { type: 'A', text: "I really enjoy caring for other people.", options: [{label: "Yes", value: 5}, {label: "Sometimes", value: 3}, {label: "No", value: 1}] },
  { type: 'A', text: "I tend to get emotionally involved with a friend's problems.", options: [{label: "Yes", value: 5}, {label: "Sometimes", value: 3}, {label: "No", value: 1}] },
  { type: 'C', text: "I am good at predicting how someone will feel.", options: [{label: "Yes", value: 5}, {label: "Sometimes", value: 3}, {label: "No", value: 1}] },
  { type: 'A', text: "Seeing people cry makes me want to cry.", options: [{label: "Yes", value: 5}, {label: "Sometimes", value: 3}, {label: "No", value: 1}] },
  { type: 'C', text: "I can usually appreciate the other person's viewpoint, even if I disagree.", options: [{label: "Yes", value: 5}, {label: "Sometimes", value: 3}, {label: "No", value: 1}] }
];

// Eye Reading Task Stimuli (Simulated with text/shapes for simplicity without assets)
const EYE_TASKS = [
    { id: 1, emotion: 'Suspicious', options: ['Bored', 'Suspicious', 'Excited', 'Tired'], correct: 'Suspicious', desc: 'Brows narrowed, looking sideways.' },
    { id: 2, emotion: 'Panicked', options: ['Happy', 'Panicked', 'Friendly', 'Annoyed'], correct: 'Panicked', desc: 'Eyes wide open, pupils dilated.' },
    { id: 3, emotion: 'Playful', options: ['Playful', 'Serious', 'Angry', 'Sad'], correct: 'Playful', desc: 'Crow\'s feet wrinkles, slight squint.' }
];

const EmpathyTest: React.FC = () => {
  const [phase, setPhase] = useState<Phase>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [scores, setScores] = useState({ A: 0, C: 0 }); // A=Affective, C=Cognitive
  const [eyeScore, setEyeScore] = useState(0);
  const [currentEye, setCurrentEye] = useState(0);

  // --- Quiz Logic ---
  const handleAnswer = (val: number) => {
      const type = QUESTIONS[currentQ].type as 'A' | 'C';
      setScores(prev => ({ ...prev, [type]: prev[type] + val }));
      
      if (currentQ < QUESTIONS.length - 1) {
          setCurrentQ(q => q + 1);
      } else {
          setPhase('eyes-task');
      }
  };

  // --- Eye Task Logic ---
  const handleEyeGuess = (guess: string) => {
      if (guess === EYE_TASKS[currentEye].correct) {
          setEyeScore(s => s + 5); // 5 points per correct eye
      }
      
      if (currentEye < EYE_TASKS.length - 1) {
          setCurrentEye(e => e + 1);
      } else {
          finishTest();
      }
  };

  const finishTest = () => {
      // Normalize:
      // A max: 15. C max: 20. Eye max: 15.
      // Total Max = 50.
      const totalRaw = scores.A + scores.C + eyeScore;
      const normalizedScore = Math.round((totalRaw / 50) * 100);
      saveStat('empathy-test', normalizedScore);
      setPhase('result');
  };

  // Coordinates for Scatter Plot
  // X: Cognitive (Understanding) - 0 to 100
  // Y: Affective (Feeling) - 0 to 100
  const xVal = Math.round(((scores.C + (eyeScore/2)) / 27.5) * 100); // Cog + half eye score
  const yVal = Math.round((scores.A / 15) * 100);

  const scatterData = [{ x: xVal, y: yVal, z: 1 }];

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
               <h2 className="text-3xl font-bold text-white mb-2">Empathy Spectrum Profile</h2>
               <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                   Measure your <strong>Affective Empathy</strong> (Feeling) vs. <strong>Cognitive Empathy</strong> (Understanding).
                   <br/>Includes the "Reading the Mind in the Eyes" behavioral task.
               </p>
               <button onClick={() => setPhase('quiz')} className="btn-primary">Start Profiling</button>
           </div>
       )}

       {phase === 'quiz' && (
           <div className="py-12 animate-in slide-in-from-right">
               <div className="text-xs font-mono text-zinc-500 mb-8">PART 1: SELF REPORT ({currentQ + 1}/{QUESTIONS.length})</div>
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

       {phase === 'eyes-task' && (
           <div className="py-12 animate-in slide-in-from-right">
               <div className="text-xs font-mono text-zinc-500 mb-8">PART 2: BEHAVIORAL ({currentEye + 1}/{EYE_TASKS.length})</div>
               <h3 className="text-xl font-bold text-white mb-6">What emotion is this person feeling?</h3>
               
               {/* Simplified Eye Visualization (Placeholder for actual images) */}
               <div className="w-full h-32 bg-black border border-zinc-700 rounded-lg mb-8 flex items-center justify-center relative overflow-hidden">
                   <div className="absolute inset-0 bg-zinc-900 opacity-50"></div>
                   <div className="relative z-10 flex gap-4 items-center">
                       <Eye size={64} className="text-zinc-300" />
                       <Eye size={64} className="text-zinc-300 scale-x-[-1]" />
                   </div>
                   <div className="absolute bottom-2 text-zinc-500 text-[10px] font-mono">
                       CUE: {EYE_TASKS[currentEye].desc}
                   </div>
               </div>

               <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                   {EYE_TASKS[currentEye].options.map((opt, i) => (
                       <button 
                          key={i}
                          onClick={() => handleEyeGuess(opt)}
                          className="p-4 bg-zinc-800 hover:bg-primary-900/20 border border-zinc-700 hover:border-primary-500 rounded text-sm font-bold text-zinc-300 hover:text-white transition-all"
                       >
                           {opt}
                       </button>
                   ))}
               </div>
           </div>
       )}

       {phase === 'result' && (
           <div className="py-8 animate-in zoom-in">
               <h2 className="text-2xl font-bold text-white mb-2">The Empathy Quadrant</h2>
               <p className="text-zinc-400 text-sm mb-8">Your emotional position relative to the population.</p>
               
               {/* 2D Scatter Chart */}
               <div className="h-80 w-full max-w-md mx-auto bg-black border border-zinc-800 rounded-xl relative mb-8 p-4">
                   {/* Quadrant Labels */}
                   <div className="absolute top-2 left-2 text-[9px] text-zinc-500 font-mono">EMOTIONAL SPONGE</div>
                   <div className="absolute top-2 right-2 text-[9px] text-zinc-500 font-mono">TOTAL EMPATH</div>
                   <div className="absolute bottom-2 left-2 text-[9px] text-zinc-500 font-mono">DETACHED</div>
                   <div className="absolute bottom-2 right-2 text-[9px] text-zinc-500 font-mono">LOGICAL ANALYST</div>

                   <ResponsiveContainer width="100%" height="100%">
                       <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                           <XAxis type="number" dataKey="x" name="Cognitive" domain={[0, 100]} hide />
                           <YAxis type="number" dataKey="y" name="Affective" domain={[0, 100]} hide />
                           <ZAxis type="number" dataKey="z" range={[100, 100]} />
                           <Tooltip cursor={{ strokeDasharray: '3 3' }} content={() => null} />
                           {/* Crosshairs */}
                           <ReferenceLine x={50} stroke="#555" />
                           <ReferenceLine y={50} stroke="#555" />
                           <Scatter name="You" data={scatterData} fill="#ec4899" shape="circle" />
                       </ScatterChart>
                   </ResponsiveContainer>
               </div>

               <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8">
                   <div className="bg-zinc-900 border border-zinc-800 p-4 rounded text-left">
                       <div className="text-xs text-pink-500 font-bold uppercase mb-1 flex items-center gap-1"><Heart size={12}/> Affective</div>
                       <div className="text-2xl font-bold text-white mb-1">{yVal}%</div>
                       <p className="text-[10px] text-zinc-400">Emotional Resonance. Feeling what they feel.</p>
                   </div>
                   <div className="bg-zinc-900 border border-zinc-800 p-4 rounded text-left">
                       <div className="text-xs text-cyan-500 font-bold uppercase mb-1 flex items-center gap-1"><Brain size={12}/> Cognitive</div>
                       <div className="text-2xl font-bold text-white mb-1">{xVal}%</div>
                       <p className="text-[10px] text-zinc-400">Theory of Mind. Understanding perspective.</p>
                   </div>
               </div>

               <button onClick={() => { setScores({A:0, C:0}); setEyeScore(0); setCurrentQ(0); setCurrentEye(0); setPhase('intro'); }} className="btn-secondary flex items-center justify-center gap-2 mx-auto">
                   <RotateCcw size={16} /> Retake
               </button>
           </div>
       )}
    </div>
  );
};

export default EmpathyTest;
