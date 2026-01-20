import React, { useState, useEffect } from 'react';
import { Sun, Eye, Timer, ScanLine } from 'lucide-react';
import { saveStat } from '../../lib/core';

const AfterimageTest: React.FC = () => {
  const [phase, setPhase] = useState<'intro' | 'stare' | 'reveal' | 'result'>('intro');
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    let timer: number;
    if (phase === 'stare' && timeLeft > 0) {
      timer = window.setTimeout(() => setTimeLeft(t => t - 1), 1000);
    } else if (phase === 'stare' && timeLeft === 0) {
      setPhase('reveal');
      setTimeout(() => setPhase('result'), 8000); // 8s reveal time
      saveStat('afterimage-test', 100);
    }
    return () => clearTimeout(timer);
  }, [phase, timeLeft]);

  return (
    <div className="max-w-2xl mx-auto text-center select-none">
       {phase === 'intro' && (
          <div className="py-12 animate-in fade-in zoom-in">
             <div className="w-20 h-20 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sun size={32} className="text-amber-500" />
             </div>
             <h2 className="text-3xl font-bold text-white mb-2">Retinal Fatigue Protocol</h2>
             <p className="text-zinc-400 mb-8 max-w-md mx-auto leading-relaxed">
                Induce a <strong>Negative Afterimage</strong>.
                <br/><br/>
                1. Stare at the central crosshair for 30 seconds.<br/>
                2. Do not blink or move your eyes.<br/>
                3. When the screen flashes white, blink rapidly to see the "phantom" image in true color.
             </p>
             <button onClick={() => setPhase('stare')} className="btn-primary">
                Initialize Stimulus
             </button>
          </div>
       )}

       {phase === 'stare' && (
          <div className="flex flex-col items-center justify-center min-h-[500px]">
             
             {/* The Stimulus Image - Inverted Colors */}
             {/* Cyan/Teal turns to Red/Skin tone. Magenta turns to Green. White turns Black. */}
             <div className="relative w-80 h-80 cursor-crosshair">
                <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
                    {/* Background Circle (White -> Black) */}
                    <circle cx="100" cy="100" r="95" fill="white" />
                    
                    {/* Face Shape (Cyan -> Reddish skin) */}
                    <path d="M 50 50 Q 100 20 150 50 L 150 140 Q 100 180 50 140 Z" fill="#00FFFF" />
                    
                    {/* Eyes (Black -> White) */}
                    <ellipse cx="75" cy="90" rx="10" ry="6" fill="black" />
                    <ellipse cx="125" cy="90" rx="10" ry="6" fill="black" />
                    
                    {/* Nose (Magenta -> Green) */}
                    <path d="M 100 90 L 90 120 L 110 120 Z" fill="#FF00FF" />
                    
                    {/* Mouth (Magenta -> Green) */}
                    <path d="M 70 140 Q 100 160 130 140" stroke="#FF00FF" strokeWidth="5" fill="none" />
                    
                    {/* Hair (Blue -> Yellow/Blonde) */}
                    <path d="M 40 60 Q 100 0 160 60" stroke="#0000FF" strokeWidth="20" fill="none" />
                </svg>

                {/* Fixation Point */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-2 h-2 bg-black rounded-full relative z-20">
                        <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-50"></div>
                    </div>
                    {/* Focus Ring */}
                    <div className="absolute w-12 h-12 border border-red-500/30 rounded-full animate-pulse"></div>
                </div>

                {/* Scanner Effect */}
                <div className="absolute top-0 left-0 w-full h-1 bg-black/20 animate-scan pointer-events-none"></div>
             </div>

             <div className="mt-8 font-mono text-xl text-zinc-400 flex items-center gap-3">
                <ScanLine className="animate-pulse text-primary-500" />
                <span>LOCK VISION: {timeLeft}s</span>
             </div>
          </div>
       )}

       {phase === 'reveal' && (
          <div className="fixed inset-0 bg-white z-[100] flex flex-col items-center justify-center cursor-pointer animate-in fade-in duration-75" onClick={() => setPhase('result')}>
             <div className="w-4 h-4 bg-black/5 rounded-full mb-8"></div>
             <h1 className="text-black/80 font-black text-4xl tracking-tighter uppercase mb-2">Blink Fast</h1>
             <p className="text-black/40 font-mono text-sm">Look at a blank wall if needed</p>
             <p className="text-black/20 text-xs mt-12">(Click anywhere to finish)</p>
          </div>
       )}

       {phase === 'result' && (
          <div className="py-12 animate-in fade-in">
             <Eye size={64} className="mx-auto text-primary-500 mb-6" />
             <h2 className="text-2xl font-bold text-white mb-4">Illusion Analysis</h2>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto text-left bg-zinc-900/50 p-8 border border-zinc-800 rounded-xl mb-8">
                 <div>
                     <h3 className="text-primary-400 font-bold mb-2">What happened?</h3>
                     <p className="text-sm text-zinc-400 leading-relaxed">
                         You likely saw a normal-colored face (skin tone, blonde hair) on the white background. This is a <strong>Negative Afterimage</strong>.
                     </p>
                 </div>
                 <div>
                     <h3 className="text-primary-400 font-bold mb-2">The Science</h3>
                     <p className="text-sm text-zinc-400 leading-relaxed">
                         Your retina's cone cells adapted to the Cyan/Magenta stimulus by becoming fatigued. When the stimulus was removed, the "opponent" colors (Red/Green) fired relatively stronger signals to the brain.
                     </p>
                 </div>
             </div>

             <button onClick={() => { setPhase('intro'); setTimeLeft(30); }} className="btn-secondary">
                Restart Experiment
             </button>
          </div>
       )}
    </div>
  );
};

export default AfterimageTest;