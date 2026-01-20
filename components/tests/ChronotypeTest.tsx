import React, { useState } from 'react';
import { Moon, Sun, Coffee, Briefcase, Bed, Sunrise, Sunset, RotateCcw, Activity } from 'lucide-react';
import { saveStat } from '../../lib/core';

// Simplified Logic: 
// Q1 (Wake): Early(1) -> Late(3)
// Q2 (Peak): Morning(1) -> Night(3)
// Lion (Low score), Bear (Mid), Wolf (High), Dolphin (Irregular)

const QUESTIONS = [
  { id: 1, text: "If you had no schedule, what time would you wake up?", options: [{label: "Before 6:30 AM", value: 1}, {label: "7:00 AM - 9:00 AM", value: 2}, {label: "After 9:00 AM", value: 3}, {label: "It varies / Insomnia", value: 4}] },
  { id: 2, text: "When do you feel most productive?", options: [{label: "Early Morning", value: 1}, {label: "Mid-day (10am - 2pm)", value: 2}, {label: "Late Night", value: 3}, {label: "Short bursts anytime", value: 4}] },
  { id: 3, text: "How is your appetite in the morning?", options: [{label: "Starving", value: 1}, {label: "Normal", value: 2}, {label: "Not hungry at all", value: 3}, {label: "I often forget to eat", value: 4}] },
  { id: 4, text: "How easy is it for you to fall asleep?", options: [{label: "Very easy (9-10pm)", value: 1}, {label: "Normal (11pm)", value: 2}, {label: "Hard, I'm wired at night", value: 3}, {label: "Light sleeper / Wake often", value: 4}] }
];

type Chronotype = 'Lion' | 'Bear' | 'Wolf' | 'Dolphin';

const SCHEDLUES: Record<Chronotype, { wake: string, focus: string, exercise: string, sleep: string, desc: string, icon: string }> = {
    'Lion': {
        wake: "5:30 AM",
        focus: "8:00 AM - 12:00 PM",
        exercise: "5:00 PM",
        sleep: "10:00 PM",
        desc: "Morning hunter. High energy early in the day, but crashes in the evening.",
        icon: "🦁"
    },
    'Bear': {
        wake: "7:00 AM",
        focus: "10:00 AM - 2:00 PM",
        exercise: "6:00 PM",
        sleep: "11:00 PM",
        desc: "Follows the sun. Steady energy. Needs consistent 8 hours.",
        icon: "🐻"
    },
    'Wolf': {
        wake: "9:00 AM",
        focus: "5:00 PM - 9:00 PM",
        exercise: "7:00 PM",
        sleep: "1:00 AM",
        desc: "Nocturnal creative. Struggles with mornings, peaks when others sleep.",
        icon: "🐺"
    },
    'Dolphin': {
        wake: "6:30 AM",
        focus: "Flexible Bursts",
        exercise: "Morning",
        sleep: "11:30 PM",
        desc: "Light sleeper with irregular energy. Wired and tired.",
        icon: "🐬"
    }
};

const ChronotypeTest: React.FC = () => {
  const [phase, setPhase] = useState<'intro' | 'quiz' | 'result'>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);

  const handleAnswer = (val: number) => {
      setScore(s => s + val);
      if (currentQ < QUESTIONS.length - 1) {
          setCurrentQ(q => q + 1);
      } else {
          finishTest(score + val);
      }
  };

  const finishTest = (finalScore: number) => {
      saveStat('chronotype-test', Math.round((finalScore/16)*100)); // Just for completion stat
      setPhase('result');
  };

  const getResult = (): Chronotype => {
      // 4 questions, min 4, max 16.
      // 4-6: Lion
      // 7-10: Bear
      // 11-13: Wolf
      // 14+: Dolphin (Rough approx)
      if (score <= 6) return 'Lion';
      if (score <= 10) return 'Bear';
      if (score <= 13) return 'Wolf';
      return 'Dolphin';
  };

  const result = getResult();
  const schedule = SCHEDLUES[result];

  return (
    <div className="max-w-3xl mx-auto text-center select-none">
       
       {phase === 'intro' && (
           <div className="py-12 animate-in fade-in">
               <Moon size={64} className="mx-auto text-indigo-400 mb-6" />
               <h2 className="text-3xl font-bold text-white mb-2">Chronotype Finder</h2>
               <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                   Based on Dr. Michael Breus's "The Power of When". 
                   <br/>Are you a Lion, Bear, Wolf, or Dolphin? Find your optimal daily schedule.
               </p>
               <button onClick={() => setPhase('quiz')} className="btn-primary">Begin Analysis</button>
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
                          className="w-full p-4 border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 hover:border-indigo-500/50 rounded text-left transition-all text-zinc-300 hover:text-white"
                       >
                           {opt.label}
                       </button>
                   ))}
               </div>
           </div>
       )}

       {phase === 'result' && (
           <div className="py-8 animate-in zoom-in">
               <div className="text-8xl mb-4 animate-bounce">{schedule.icon}</div>
               <h2 className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-2">Your Chronotype</h2>
               <div className="text-5xl font-bold text-white mb-4">{result}</div>
               <p className="text-zinc-400 max-w-md mx-auto mb-12 leading-relaxed">
                   {schedule.desc}
               </p>

               {/* Schedule Timeline Visual */}
               <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-xl max-w-xl mx-auto text-left">
                   <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                       <Sun size={18} className="text-amber-500"/> Ideal Daily Rhythm
                   </h3>
                   
                   <div className="relative border-l-2 border-zinc-800 ml-3 space-y-8 pb-2">
                       {/* Wake */}
                       <div className="relative pl-8">
                           <div className="absolute -left-[9px] top-0 w-4 h-4 bg-zinc-900 border-2 border-amber-500 rounded-full"></div>
                           <div className="text-xs font-mono text-amber-500 mb-1">{schedule.wake}</div>
                           <div className="text-white font-bold flex items-center gap-2"><Sunrise size={16}/> Wake Up</div>
                       </div>

                       {/* Focus */}
                       <div className="relative pl-8">
                           <div className="absolute -left-[9px] top-0 w-4 h-4 bg-zinc-900 border-2 border-indigo-500 rounded-full"></div>
                           <div className="text-xs font-mono text-indigo-500 mb-1">{schedule.focus}</div>
                           <div className="text-white font-bold flex items-center gap-2"><Briefcase size={16}/> Deep Work</div>
                           <div className="text-xs text-zinc-500 mt-1">Maximum cognitive throughput window.</div>
                       </div>

                       {/* Exercise */}
                       <div className="relative pl-8">
                           <div className="absolute -left-[9px] top-0 w-4 h-4 bg-zinc-900 border-2 border-emerald-500 rounded-full"></div>
                           <div className="text-xs font-mono text-emerald-500 mb-1">{schedule.exercise}</div>
                           <div className="text-white font-bold flex items-center gap-2"><Activity size={16} /> Exercise</div> {/* Using Activity instead of Dumbbell for simplicity unless imported */}
                       </div>

                       {/* Sleep */}
                       <div className="relative pl-8">
                           <div className="absolute -left-[9px] top-0 w-4 h-4 bg-zinc-900 border-2 border-zinc-500 rounded-full"></div>
                           <div className="text-xs font-mono text-zinc-500 mb-1">{schedule.sleep}</div>
                           <div className="text-white font-bold flex items-center gap-2"><Bed size={16}/> Sleep</div>
                       </div>
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