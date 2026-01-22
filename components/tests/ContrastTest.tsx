
import React, { useState, useRef, useEffect } from 'react';
import { Contrast, RotateCcw, Monitor, Sun, EyeOff, Activity } from 'lucide-react';
import { saveStat } from '../../lib/core';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from 'recharts';

// Spatial Frequencies to test (Cycles Per Degree approx equivalent)
const FREQUENCIES = [
    { label: 'Low Detail', val: 0.02 }, // Coarse
    { label: 'Med Detail', val: 0.08 }, // Medium
    { label: 'High Detail', val: 0.20 } // Fine
];

const ContrastTest: React.FC = () => {
  const [phase, setPhase] = useState<'intro' | 'calibrate' | 'test' | 'reveal' | 'result'>('intro');
  
  // Test State
  const [freqIndex, setFreqIndex] = useState(0);
  const [contrast, setContrast] = useState(50); 
  const [orientation, setOrientation] = useState<'left' | 'right'>('left');
  const [reversals, setReversals] = useState(0);
  const [lastResult, setLastResult] = useState<'hit'|'miss'|null>(null);
  
  // Data State
  const [results, setResults] = useState<{freq: string, threshold: number}[]>([]);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const MAX_REVERSALS_PER_FREQ = 4; // Shorter staircase for speed

  // Generate Gabor Patch
  const drawGabor = (canvas: HTMLCanvasElement, tilt: 'left' | 'right', contrastPercent: number, frequency: number) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      
      ctx.fillStyle = '#808080';
      ctx.fillRect(0, 0, w, h);
      
      const imageData = ctx.getImageData(0, 0, w, h);
      const data = imageData.data;
      
      const sigma = w / 6; 
      const angle = tilt === 'left' ? -45 * (Math.PI / 180) : 45 * (Math.PI / 180);
      const amplitude = (contrastPercent / 100) * 127; 

      for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
              const dx = x - cx;
              const dy = y - cy;
              const rx = dx * Math.cos(angle) + dy * Math.sin(angle);
              const sine = Math.sin(rx * frequency * Math.PI * 2);
              const gauss = Math.exp(-(dx*dx + dy*dy) / (2 * sigma * sigma));
              const val = 128 + (sine * gauss * amplitude);
              const noise = (Math.random() - 0.5) * 8; 
              const finalVal = Math.min(255, Math.max(0, val + noise));
              
              const idx = (y * w + x) * 4;
              data[idx] = finalVal;     
              data[idx + 1] = finalVal; 
              data[idx + 2] = finalVal; 
              data[idx + 3] = 255;      
          }
      }
      ctx.putImageData(imageData, 0, 0);
  };

  const nextRound = (isCorrect: boolean) => {
      // Reversal Logic
      const currentResult = isCorrect ? 'hit' : 'miss';
      let currentReversals = reversals;
      
      if (lastResult && currentResult !== lastResult) {
          currentReversals += 1;
          setReversals(currentReversals);
      }
      setLastResult(currentResult);

      // Check if Frequency Complete
      if (currentReversals >= MAX_REVERSALS_PER_FREQ) {
          completeFrequency();
          return;
      }

      // Staircase Step
      const factor = currentReversals < 2 ? 2.0 : 1.4; 
      let nextC = contrast;
      
      if (isCorrect) {
          nextC = contrast / factor;
      } else {
          nextC = Math.min(100, contrast * factor);
          revealMistake(); // Brief pause on error
          return; 
      }

      setContrast(nextC);
      
      // Randomize next orientation
      const newTilt = Math.random() > 0.5 ? 'left' : 'right';
      setOrientation(newTilt);
      
      // Render
      setTimeout(() => {
          if (canvasRef.current && phase === 'test') {
              drawGabor(canvasRef.current, newTilt, nextC, FREQUENCIES[freqIndex].val);
          }
      }, 50);
  };

  const completeFrequency = () => {
      // Save result for current frequency
      // Sensitivity = 1 / contrast threshold
      const sensitivity = 1 / (contrast / 100);
      setResults(prev => [...prev, { freq: FREQUENCIES[freqIndex].label, threshold: Math.round(sensitivity) }]);

      if (freqIndex < FREQUENCIES.length - 1) {
          // Next Freq
          setFreqIndex(f => f + 1);
          setContrast(50); // Reset contrast
          setReversals(0);
          setLastResult(null);
          
          // Render new freq start
          setTimeout(() => {
              if (canvasRef.current) drawGabor(canvasRef.current, orientation, 50, FREQUENCIES[freqIndex + 1].val);
          }, 100);
      } else {
          finish();
      }
  };

  const revealMistake = () => {
      setPhase('reveal');
      if (canvasRef.current) drawGabor(canvasRef.current, orientation, 100, FREQUENCIES[freqIndex].val);
      
      setTimeout(() => {
          setPhase('test');
          const factor = 1.5; // Penalty
          const nextC = Math.min(100, contrast * factor);
          setContrast(nextC);
          
          const newTilt = Math.random() > 0.5 ? 'left' : 'right';
          setOrientation(newTilt);
          if (canvasRef.current) drawGabor(canvasRef.current, newTilt, nextC, FREQUENCIES[freqIndex].val);
      }, 1000);
  };

  const handleGuess = (guess: 'left' | 'right') => {
      if (phase !== 'test') return;
      nextRound(guess === orientation);
  };

  const startTest = () => {
      setFreqIndex(0);
      setResults([]);
      setReversals(0);
      setContrast(50);
      setPhase('test');
      
      const newTilt = Math.random() > 0.5 ? 'left' : 'right';
      setOrientation(newTilt);
      setTimeout(() => {
          if (canvasRef.current) drawGabor(canvasRef.current, newTilt, 50, FREQUENCIES[0].val);
      }, 50);
  };

  const finish = () => {
      setPhase('result');
      // Save average sensitivity across frequencies as the single stat
      const avgSens = results.reduce((a,b) => a + b.threshold, 0) / results.length;
      // Convert to 0-100 score (Log scale usually)
      // Normal sensitivity ranges 50-200.
      const finalScore = Math.min(100, Math.round((avgSens / 200) * 100));
      saveStat('contrast-test', finalScore);
  };

  return (
    <div className="max-w-2xl mx-auto text-center select-none">
       {phase === 'intro' && (
           <div className="py-12 animate-in fade-in zoom-in">
               <Contrast size={64} className="mx-auto text-zinc-600 mb-6" />
               <h2 className="text-3xl font-bold text-white mb-2">Contrast Sensitivity Function (CSF)</h2>
               <p className="text-zinc-400 mb-8 max-w-md mx-auto leading-relaxed">
                   Clinical-grade visual assessment.
                   <br/>We will test your vision at <strong>Low</strong>, <strong>Medium</strong>, and <strong>High</strong> spatial frequencies to build your visual profile.
               </p>
               <button onClick={() => setPhase('calibrate')} className="btn-primary">Start Calibration</button>
           </div>
       )}

       {phase === 'calibrate' && (
           <div className="py-12 animate-in slide-in-from-right">
               <Monitor size={48} className="mx-auto text-primary-500 mb-4" />
               <h2 className="text-xl font-bold text-white mb-6">Gamma Check</h2>
               <p className="text-zinc-400 text-sm mb-8 max-w-sm mx-auto">
                   Ensure screen brightness is high. You should be able to distinguish the squares below.
               </p>
               <div className="relative w-64 h-64 mx-auto bg-black border border-zinc-700 mb-8 flex items-center justify-center">
                   <div className="w-48 h-48 bg-[#080808] flex items-center justify-center">
                        <div className="w-32 h-32 bg-[#101010] flex items-center justify-center">
                             <div className="w-16 h-16 bg-[#1a1a1a]"></div>
                        </div>
                   </div>
               </div>
               <button onClick={startTest} className="btn-primary flex items-center gap-2 mx-auto">
                   <Sun size={18} /> Ready
               </button>
           </div>
       )}

       {(phase === 'test' || phase === 'reveal') && (
           <div className="py-8">
               <div className="flex justify-between items-center mb-8 px-8">
                   <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                       Frequency: <span className="text-white">{FREQUENCIES[freqIndex].label}</span>
                   </div>
                   {phase === 'reveal' && (
                       <div className="text-red-500 font-bold text-sm animate-pulse flex items-center gap-2">
                           <EyeOff size={16}/> REVEAL
                       </div>
                   )}
                   <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                       Contrast: {(contrast).toFixed(2)}%
                   </div>
               </div>
               
               <div className="relative w-64 h-64 bg-[#808080] rounded-full mx-auto mb-12 shadow-2xl overflow-hidden border-4 border-zinc-800">
                   <canvas 
                      ref={canvasRef} 
                      width={256} 
                      height={256} 
                      className={`w-full h-full object-cover transition-opacity duration-200 ${phase === 'reveal' ? 'opacity-100' : 'opacity-100'}`}
                   />
                   <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-red-500/50 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
               </div>

               <div className="flex justify-center gap-8">
                   <button 
                      onClick={() => handleGuess('left')}
                      disabled={phase === 'reveal'}
                      className="group flex flex-col items-center gap-3 p-6 bg-zinc-900 border border-zinc-800 hover:border-primary-500 hover:bg-zinc-800 rounded-xl transition-all w-32 disabled:opacity-50"
                   >
                       <RotateCcw size={32} className="text-zinc-500 group-hover:text-primary-400 -rotate-45 transition-colors" />
                       <span className="text-sm font-bold text-zinc-400 group-hover:text-white">LEFT</span>
                   </button>

                   <button 
                      onClick={() => handleGuess('right')}
                      disabled={phase === 'reveal'}
                      className="group flex flex-col items-center gap-3 p-6 bg-zinc-900 border border-zinc-800 hover:border-primary-500 hover:bg-zinc-800 rounded-xl transition-all w-32 disabled:opacity-50"
                   >
                       <RotateCcw size={32} className="text-zinc-500 group-hover:text-primary-400 rotate-45 scale-x-[-1] transition-colors" />
                       <span className="text-sm font-bold text-zinc-400 group-hover:text-white">RIGHT</span>
                   </button>
               </div>
           </div>
       )}

       {phase === 'result' && (
           <div className="py-12 animate-in zoom-in">
               <div className="mb-8">
                   <h2 className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-2">Visual Performance Profile</h2>
                   <div className="text-3xl font-bold text-white mb-2">CSF Curve Analysis</div>
               </div>
               
               <div className="h-64 w-full bg-zinc-900/30 border border-zinc-800 rounded p-4 mb-8 relative">
                   <div className="absolute top-2 left-2 text-[10px] text-zinc-500 font-mono flex items-center gap-2">
                       <Activity size={12}/> SENSITIVITY_CURVE
                   </div>
                   <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={results}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                           <XAxis dataKey="freq" stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
                           <YAxis stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
                           <Tooltip 
                               contentStyle={{ backgroundColor: '#000', borderColor: '#333', fontSize: '12px' }} 
                               cursor={{stroke: '#333'}}
                           />
                           <Line type="monotone" dataKey="threshold" name="Sensitivity" stroke="#06b6d4" strokeWidth={3} dot={{r: 4, fill: '#06b6d4'}} />
                       </LineChart>
                   </ResponsiveContainer>
               </div>

               <div className="grid grid-cols-3 gap-4 mb-8">
                   {results.map((r, i) => (
                       <div key={i} className="bg-zinc-900 border border-zinc-800 p-2 rounded">
                           <div className="text-[10px] text-zinc-500 uppercase">{r.freq}</div>
                           <div className="text-xl font-bold text-white">{r.threshold}</div>
                       </div>
                   ))}
               </div>

               <button onClick={startTest} className="btn-secondary">
                   Retake Protocol
               </button>
           </div>
       )}
    </div>
  );
};

export default ContrastTest;
