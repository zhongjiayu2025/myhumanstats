import React, { useState, useEffect, useRef } from 'react';
import { Contrast, ArrowLeft, ArrowRight, RotateCcw, Activity } from 'lucide-react';
import { saveStat } from '../../lib/core';

const ContrastTest: React.FC = () => {
  const [phase, setPhase] = useState<'intro' | 'test' | 'result'>('intro');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [orientation, setOrientation] = useState<'left' | 'right'>('left');
  const [contrast, setContrast] = useState(100); // 0-100%
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate Gabor Patch
  const drawGabor = (canvas: HTMLCanvasElement, tilt: 'left' | 'right', contrastPercent: number) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      
      // Clear with mid-grey
      ctx.fillStyle = '#808080';
      ctx.fillRect(0, 0, w, h);
      
      const imageData = ctx.getImageData(0, 0, w, h);
      const data = imageData.data;
      
      // Params
      const freq = 0.05; // Spatial frequency
      const sigma = w / 6; // Gaussian window width
      const angle = tilt === 'left' ? -45 * (Math.PI / 180) : 45 * (Math.PI / 180);
      const amplitude = (contrastPercent / 100) * 127; // Contrast amplitude (0-127)

      for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
              // Centered coords
              const dx = x - cx;
              const dy = y - cy;
              
              // Rotate coords
              const rx = dx * Math.cos(angle) + dy * Math.sin(angle);
              
              // Sine wave
              const sine = Math.sin(rx * freq * Math.PI * 2);
              
              // Gaussian window (Circular fade)
              const gauss = Math.exp(-(dx*dx + dy*dy) / (2 * sigma * sigma));
              
              // Final pixel value (128 is mid-grey)
              const val = 128 + (sine * gauss * amplitude);
              
              // Add noise to prevent pixel-peeping (Dithering)
              const noise = (Math.random() - 0.5) * 8; 
              
              const finalVal = Math.min(255, Math.max(0, val + noise));
              
              const idx = (y * w + x) * 4;
              data[idx] = finalVal;     // R
              data[idx + 1] = finalVal; // G
              data[idx + 2] = finalVal; // B
              data[idx + 3] = 255;      // A
          }
      }
      
      ctx.putImageData(imageData, 0, 0);
  };

  const nextRound = () => {
      const newTilt = Math.random() > 0.5 ? 'left' : 'right';
      setOrientation(newTilt);
      
      // Contrast Decay Curve: 
      // Lvl 1: 50%
      // Lvl 5: 10%
      // Lvl 10: 1%
      // Lvl 15: 0.5%
      const newContrast = 100 * Math.pow(0.65, level);
      setContrast(newContrast);
      
      setTimeout(() => {
          if (canvasRef.current) drawGabor(canvasRef.current, newTilt, newContrast);
      }, 50);
  };

  const handleGuess = (guess: 'left' | 'right') => {
      if (guess === orientation) {
          setScore(level);
          setLevel(l => l + 1);
          nextRound();
      } else {
          finish();
      }
  };

  const startTest = () => {
      setLevel(1);
      setScore(0);
      setPhase('test');
      nextRound();
  };

  const finish = () => {
      setPhase('result');
      // Score normalization. Level 12 is roughly 0.5% contrast (Human Limit is ~0.5-1%)
      const finalScore = Math.min(100, Math.round((level / 12) * 100));
      saveStat('contrast-test', finalScore);
  };

  return (
    <div className="max-w-2xl mx-auto text-center select-none">
       {phase === 'intro' && (
           <div className="py-12 animate-in fade-in zoom-in">
               <Contrast size={64} className="mx-auto text-zinc-600 mb-6" />
               <h2 className="text-3xl font-bold text-white mb-2">Contrast Sensitivity (Gabor)</h2>
               <p className="text-zinc-400 mb-8 max-w-md mx-auto leading-relaxed">
                   Scientific Gabor Patch Test.
                   <br/>Identify the tilt of the fuzzy stripes: <strong>Left</strong> vs <strong>Right</strong>.
                   <br/>The pattern will fade until it becomes invisible.
               </p>
               <button onClick={startTest} className="btn-primary">Start Calibration</button>
           </div>
       )}

       {phase === 'test' && (
           <div className="py-8">
               <div className="text-[10px] font-mono text-zinc-500 mb-4 uppercase tracking-widest">
                   Level {level} • Contrast {(contrast).toFixed(2)}%
               </div>
               
               <div className="relative w-64 h-64 bg-[#808080] rounded-full mx-auto mb-12 shadow-2xl overflow-hidden border-4 border-zinc-800">
                   <canvas 
                      ref={canvasRef} 
                      width={256} 
                      height={256} 
                      className="w-full h-full object-cover"
                   />
                   {/* Fixation Point */}
                   <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-red-500/50 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
               </div>

               <div className="flex justify-center gap-8">
                   <button 
                      onClick={() => handleGuess('left')}
                      className="group flex flex-col items-center gap-3 p-6 bg-zinc-900 border border-zinc-800 hover:border-primary-500 hover:bg-zinc-800 rounded-xl transition-all w-32"
                   >
                       <RotateCcw size={32} className="text-zinc-500 group-hover:text-primary-400 -rotate-45 transition-colors" />
                       <span className="text-sm font-bold text-zinc-400 group-hover:text-white">LEFT</span>
                       <div className="text-[10px] text-zinc-600 font-mono opacity-50 group-hover:opacity-100">[KEY: ←]</div>
                   </button>

                   <button 
                      onClick={() => handleGuess('right')}
                      className="group flex flex-col items-center gap-3 p-6 bg-zinc-900 border border-zinc-800 hover:border-primary-500 hover:bg-zinc-800 rounded-xl transition-all w-32"
                   >
                       <RotateCcw size={32} className="text-zinc-500 group-hover:text-primary-400 rotate-45 scale-x-[-1] transition-colors" />
                       <span className="text-sm font-bold text-zinc-400 group-hover:text-white">RIGHT</span>
                       <div className="text-[10px] text-zinc-600 font-mono opacity-50 group-hover:opacity-100">[KEY: →]</div>
                   </button>
               </div>
           </div>
       )}

       {phase === 'result' && (
           <div className="py-12 animate-in zoom-in">
               <Activity size={64} className="mx-auto text-primary-500 mb-6" />
               
               <div className="text-6xl font-bold text-white mb-2">{score}<span className="text-3xl text-zinc-600">%</span></div>
               <h2 className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-8">Visual Sensitivity Score</h2>
               
               <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8">
                   <div className="bg-zinc-900 border border-zinc-800 p-4 rounded text-center">
                       <div className="text-xs text-zinc-500 uppercase">Min Contrast</div>
                       <div className="text-xl text-white font-mono">{contrast.toFixed(2)}%</div>
                   </div>
                   <div className="bg-zinc-900 border border-zinc-800 p-4 rounded text-center">
                       <div className="text-xs text-zinc-500 uppercase">Levels</div>
                       <div className="text-xl text-white font-mono">{level - 1}</div>
                   </div>
               </div>

               <div className="bg-zinc-900/50 p-4 rounded border border-zinc-800 mb-8 max-w-sm mx-auto text-sm text-zinc-400 leading-relaxed text-left">
                   <strong>Gabor Function Analysis:</strong> 
                   {level > 10 ? " Exceptional. You can detect contrast variations below 1%. This indicates a healthy retina and neural pathway." :
                    level > 6 ? " Normal Range. Your contrast sensitivity is adequate for daily tasks and night driving." :
                    " Low Sensitivity. You may struggle in low-light conditions or with glare. Consider checking your monitor settings or visiting an eye doctor."}
               </div>

               <button onClick={startTest} className="btn-secondary">
                   Retake Test
               </button>
           </div>
       )}
    </div>
  );
};

export default ContrastTest;