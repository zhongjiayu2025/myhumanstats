
import React, { useState, useEffect } from 'react';
import { Sun, Eye, ScanLine, Layers, Zap, Grid as GridIcon } from 'lucide-react';
import { saveStat } from '../../lib/core';

type StimulusType = 'face' | 'rgb' | 'geometric';

const AfterimageTest: React.FC = () => {
  const [phase, setPhase] = useState<'intro' | 'stare' | 'reveal' | 'result'>('intro');
  const [timeLeft, setTimeLeft] = useState(30);
  const [stimulus, setStimulus] = useState<StimulusType>('face');
  const [flickerAssist, setFlickerAssist] = useState(false);

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

  // --- SVGs designed for Negative Afterimage ---
  // Inverted colors: Cyan -> Red skin, Magenta -> Green, Blue -> Yellow
  const RenderFace = () => (
    <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
        <circle cx="100" cy="100" r="95" fill="white" />
        {/* Face shape (Cyan will turn Red) */}
        <path d="M 50 50 Q 100 20 150 50 L 150 140 Q 100 180 50 140 Z" fill="#00FFFF" />
        
        {/* Eyes (Black pupils -> White highlights) */}
        <ellipse cx="75" cy="90" rx="10" ry="6" fill="black" />
        <ellipse cx="125" cy="90" rx="10" ry="6" fill="black" />
        
        {/* Nose (Magenta -> Green) */}
        <path d="M 100 90 L 90 120 L 110 120 Z" fill="#FF00FF" />
        
        {/* Mouth (Magenta -> Green lips) */}
        <path d="M 70 140 Q 100 160 130 140" stroke="#FF00FF" strokeWidth="5" fill="none" />
        
        {/* Hair (Blue -> Yellow/Blonde) */}
        <path d="M 40 60 Q 100 0 160 60" stroke="#0000FF" strokeWidth="20" fill="none" />
    </svg>
  );

  const RenderRGB = () => (
    <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
        {/* Primary Colors (Additive) -> CMY Subtractive Afterimage */}
        <circle cx="70" cy="70" r="40" fill="#00FFFF" mixBlendMode="screen" />
        <circle cx="130" cy="70" r="40" fill="#FF00FF" mixBlendMode="screen" />
        <circle cx="100" cy="130" r="40" fill="#FFFF00" mixBlendMode="screen" />
        <circle cx="100" cy="90" r="2" fill="black" />
    </svg>
  );

  const RenderGeometric = () => (
    <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
        <rect x="0" y="0" width="200" height="200" fill="#000" />
        <circle cx="100" cy="100" r="80" fill="white" />
        <circle cx="100" cy="100" r="60" fill="black" />
        <circle cx="100" cy="100" r="40" fill="white" />
        <rect x="90" y="20" width="20" height="160" fill="#00FFFF" />
        <rect x="20" y="90" width="160" height="20" fill="#00FFFF" />
    </svg>
  );

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
                <br/>Select a stimulus target below.
             </p>
             
             <div className="grid grid-cols-3 gap-4 mb-8 max-w-md mx-auto">
                 <button onClick={() => setStimulus('face')} className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${stimulus === 'face' ? 'bg-zinc-800 border-primary-500 text-primary-400' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>
                     <ScanLine size={20}/> <span className="text-xs font-bold">Portrait</span>
                 </button>
                 <button onClick={() => setStimulus('rgb')} className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${stimulus === 'rgb' ? 'bg-zinc-800 border-primary-500 text-primary-400' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>
                     <Layers size={20}/> <span className="text-xs font-bold">RGB Split</span>
                 </button>
                 <button onClick={() => setStimulus('geometric')} className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${stimulus === 'geometric' ? 'bg-zinc-800 border-primary-500 text-primary-400' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>
                     <GridIcon size={20}/> <span className="text-xs font-bold">Shapes</span>
                 </button>
             </div>

             <div className="flex items-center justify-center gap-2 mb-8">
                 <button onClick={() => setFlickerAssist(!flickerAssist)} className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs border ${flickerAssist ? 'bg-primary-900/20 border-primary-500 text-primary-400' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>
                     <Zap size={12} className={flickerAssist ? "fill-current" : ""} /> Flicker Assist (Stronger Effect)
                 </button>
             </div>

             <button onClick={() => setPhase('stare')} className="btn-primary">
                Initialize Stimulus
             </button>
          </div>
       )}

       {phase === 'stare' && (
          <div className="flex flex-col items-center justify-center min-h-[500px]">
             <div className="relative w-80 h-80 cursor-crosshair">
                {stimulus === 'face' && <RenderFace />}
                {stimulus === 'rgb' && <RenderRGB />}
                {stimulus === 'geometric' && <RenderGeometric />}

                {/* Fixation Point */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-2 h-2 bg-black rounded-full relative z-20">
                        <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-50"></div>
                    </div>
                    <div className="absolute w-12 h-12 border border-red-500/30 rounded-full animate-pulse"></div>
                </div>

                <div className="absolute top-0 left-0 w-full h-1 bg-black/20 animate-scan pointer-events-none"></div>
             </div>

             <div className="mt-8 font-mono text-xl text-zinc-400 flex items-center gap-3">
                <Eye className="animate-pulse text-primary-500" />
                <span>LOCK VISION: {timeLeft}s</span>
             </div>
          </div>
       )}

       {phase === 'reveal' && (
          <div 
            className={`fixed inset-0 z-[100] flex flex-col items-center justify-center cursor-pointer bg-white animate-in fade-in duration-75`}
            onClick={() => setPhase('result')}
          >
             {/* Flicker Assist Overlay: 12Hz Strobe effect using CSS animation */}
             {flickerAssist && (
                 <div className="absolute inset-0 bg-black/10 animate-[pulse_0.08s_linear_infinite] pointer-events-none"></div>
             )}

             <div className="w-4 h-4 bg-black/10 rounded-full mb-8"></div>
             <h1 className="text-black/80 font-black text-4xl tracking-tighter uppercase mb-2">Blink Fast</h1>
             <p className="text-black/40 font-mono text-sm">Look at the center dot</p>
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
                         You likely saw the <strong>complementary colors</strong> of the original image. 
                         <br/>Cyan → Red Skin tone.
                         <br/>Magenta → Green.
                         <br/>Blue → Yellow.
                     </p>
                 </div>
                 <div>
                     <h3 className="text-primary-400 font-bold mb-2">The Science</h3>
                     <p className="text-sm text-zinc-400 leading-relaxed">
                         This is the <strong>Opponent Process Theory</strong>. When cone cells fatigue from one color (e.g., Cyan/Blue+Green), the opponent channel (Red) rebounds, creating a phantom signal.
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
