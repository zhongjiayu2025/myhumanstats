
import React, { useRef, useEffect, useState } from 'react';
import { Eye, Check, MousePointer2, RefreshCcw, RotateCw, ArrowRight, CreditCard, Scaling } from 'lucide-react';
import { saveStat } from '../../lib/core';

const AstigmatismTest: React.FC = () => {
  const [phase, setPhase] = useState<'intro' | 'calibrate' | 'setup-left' | 'test-left' | 'setup-right' | 'test-right' | 'result'>('intro');
  const [activeEye, setActiveEye] = useState<'left'|'right'>('left');
  
  // Calibration State
  const [ppi, setPpi] = useState(96); // Default PPI
  const [sliderVal, setSliderVal] = useState(50); // Slider 0-100
  
  // Results
  const [results, setResults] = useState<{left: number | null, right: number | null}>({ left: null, right: null });
  const [knobAngle, setKnobAngle] = useState(0);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- Calibration Logic ---
  // Standard Credit Card width is 85.6mm
  const CARD_MM = 85.6;
  
  // Base width in pixels at default 96 PPI approx 323px.
  // Slider adjusts this pixel width.
  const calculatePPI = (pxWidth: number) => {
      // PPI = Pixels / Inches
      // Inches = mm / 25.4
      const inches = CARD_MM / 25.4;
      return pxWidth / inches;
  };

  const handleCalibration = () => {
      // Map slider 0-100 to range 250px - 450px approx
      const pxWidth = 250 + (sliderVal * 2.5); 
      const newPpi = calculatePPI(pxWidth);
      setPpi(newPpi);
      setPhase('setup-left');
      setActiveEye('left');
  };

  useEffect(() => {
    if (phase === 'test-left' || phase === 'test-right') {
      drawFanChart();
    }
  }, [phase, knobAngle, ppi]);

  const drawFanChart = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      
      // Use PPI to size the chart physically correct (approx 10cm diameter?)
      // Let's say 300px is decent fallback, but we can scale.
      const radius = Math.min(w, h) * 0.4;

      // Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);

      // Draw Static Lines (The Fan)
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2; // Maybe scale line width with PPI too?

      for (let i = 0; i < 36; i++) { 
        const angleDeg = i * 10; 
        const angleRad = angleDeg * (Math.PI / 180);
        
        const startX = cx + Math.cos(angleRad) * (radius * 0.1);
        const startY = cy + Math.sin(angleRad) * (radius * 0.1);
        const endX = cx + Math.cos(angleRad) * radius;
        const endY = cy + Math.sin(angleRad) * radius;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }
      
      if (knobAngle !== 0) {
          const rad = (knobAngle - 90) * (Math.PI / 180); 
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
          ctx.lineWidth = 12;
          
          const x1 = cx + Math.cos(rad) * radius * 1.1;
          const y1 = cy + Math.sin(rad) * radius * 1.1;
          const x2 = cx - Math.cos(rad) * radius * 1.1;
          const y2 = cy - Math.sin(rad) * radius * 1.1;
          
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
          
          ctx.fillStyle = '#ef4444';
          ctx.font = 'bold 24px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${Math.round(knobAngle)}°`, cx, cy);
      }
  };

  const confirmEyeResult = (hasIssue: boolean) => {
      const axis = hasIssue ? knobAngle : null;
      setResults(prev => ({ ...prev, [activeEye]: axis }));
      
      if (activeEye === 'left') {
          setActiveEye('right');
          setPhase('setup-right');
          setKnobAngle(0); 
      } else {
          finishTest();
      }
  };
  
  const finishTest = () => {
      setPhase('result');
      let score = 100;
      if (results.left !== null || results.right !== null) score = 60;
      saveStat('astigmatism-test', score);
  };

  return (
    <div className="max-w-xl mx-auto text-center select-none">
       {phase === 'intro' && (
          <div className="py-12 animate-in fade-in">
             <Eye size={64} className="mx-auto text-zinc-600 mb-6" />
             <h2 className="text-3xl font-bold text-white mb-2">Astigmatism Axis Finder</h2>
             <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                A digital version of the "Clock Dial" test used by optometrists.
                <br/>We will test each eye individually to find your axis of distortion.
             </p>
             <button onClick={() => setPhase('calibrate')} className="btn-primary">Start</button>
          </div>
       )}

       {phase === 'calibrate' && (
           <div className="py-12 animate-in slide-in-from-right">
               <Scaling size={48} className="mx-auto text-primary-500 mb-4" />
               <h2 className="text-xl font-bold text-white mb-2">Screen Calibration</h2>
               <p className="text-zinc-400 text-sm mb-8">
                   For accurate results, we need to know your screen size.
                   <br/>Hold a standard card (Credit/ID) against the screen.
               </p>
               
               <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-xl mb-8 flex flex-col items-center">
                   {/* Interactive Card Box */}
                   <div 
                      className="bg-emerald-500/20 border-2 border-emerald-500 rounded-lg flex items-center justify-center mb-6 relative transition-all"
                      style={{ width: `${250 + (sliderVal * 2.5)}px`, height: `${(250 + (sliderVal * 2.5)) / 1.586}px` }}
                   >
                       <div className="absolute inset-0 flex flex-col items-center justify-center text-emerald-500 font-bold text-sm pointer-events-none">
                           <CreditCard size={32} className="mb-2" />
                           Match Card Size
                       </div>
                   </div>
                   
                   <input 
                      type="range" min="0" max="100" value={sliderVal} 
                      onChange={(e) => setSliderVal(parseInt(e.target.value))}
                      className="w-full max-w-sm h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                   />
                   <div className="flex justify-between w-full max-w-sm text-[10px] text-zinc-500 font-mono mt-2">
                       <span>SMALLER</span>
                       <span>LARGER</span>
                   </div>
               </div>
               
               <button onClick={handleCalibration} className="btn-primary">
                   Calibration Complete
               </button>
           </div>
       )}

       {(phase === 'setup-left' || phase === 'setup-right') && (
           <div className="py-20 animate-in slide-in-from-right">
               <h3 className="text-2xl font-bold text-white mb-6 uppercase tracking-widest">
                   {phase === 'setup-left' ? 'Left Eye' : 'Right Eye'}
               </h3>
               <div className="bg-black border border-zinc-800 p-8 rounded-xl max-w-sm mx-auto mb-8">
                   <div className="flex justify-center gap-4 mb-4">
                       <div className={`w-16 h-10 border-2 rounded-full ${phase === 'setup-left' ? 'bg-zinc-800 border-zinc-600' : 'bg-black border-zinc-800'}`}></div>
                       <div className={`w-16 h-10 border-2 rounded-full ${phase === 'setup-right' ? 'bg-zinc-800 border-zinc-600' : 'bg-black border-zinc-800'}`}></div>
                   </div>
                   <p className="text-lg text-white font-bold mb-2">
                       Cover your {phase === 'setup-left' ? 'RIGHT' : 'LEFT'} eye.
                   </p>
               </div>
               <button onClick={() => setPhase(phase === 'setup-left' ? 'test-left' : 'test-right')} className="btn-primary">
                   Ready <ArrowRight size={16} className="inline ml-1"/>
               </button>
           </div>
       )}

       {(phase === 'test-left' || phase === 'test-right') && (
          <div className="animate-in fade-in">
             <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-4">Testing: {activeEye} Eye</div>
             
             <div className="relative w-[350px] h-[350px] mx-auto mb-8">
                <canvas 
                    ref={canvasRef} 
                    width={350} height={350} 
                    className="rounded-full bg-white shadow-2xl"
                />
             </div>
             
             <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
                 <h3 className="text-sm text-zinc-400 font-bold mb-6">Are any lines darker/bolder?</h3>
                 
                 <div className="flex flex-col gap-6">
                     <div className="flex items-center gap-4 bg-black p-4 rounded-lg border border-zinc-800">
                         <RotateCw size={20} className="text-zinc-500" />
                         <input 
                            type="range" min="0" max="180" step="1"
                            value={knobAngle}
                            onChange={(e) => setKnobAngle(Number(e.target.value))}
                            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                         />
                         <span className="font-mono text-white w-12 text-right">{knobAngle}°</span>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                         <button onClick={() => confirmEyeResult(false)} className="p-4 bg-zinc-800 hover:bg-emerald-900/20 border border-zinc-700 hover:border-emerald-500 rounded transition-all text-xs text-zinc-300 hover:text-emerald-400">
                             No, all uniform
                         </button>
                         <button onClick={() => confirmEyeResult(true)} className="p-4 bg-zinc-800 hover:bg-red-900/20 border border-zinc-700 hover:border-red-500 rounded transition-all text-xs text-zinc-300 hover:text-red-400">
                             Yes, confirmed at {knobAngle}°
                         </button>
                     </div>
                 </div>
             </div>
          </div>
       )}

       {phase === 'result' && (
          <div className="py-12 animate-in zoom-in">
             <h2 className="text-3xl font-bold text-white mb-8">Refractive Analysis</h2>
             
             <div className="flex justify-center gap-8 mb-12">
                 <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl w-40">
                     <div className="text-xs text-zinc-500 uppercase mb-2">Left Eye</div>
                     <div className={`text-3xl font-bold ${results.left !== null ? 'text-red-500' : 'text-emerald-500'}`}>
                         {results.left !== null ? `${results.left}°` : 'Normal'}
                     </div>
                     {results.left !== null && <div className="text-[10px] text-zinc-600 mt-1">AXIS DETECTED</div>}
                 </div>

                 <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl w-40">
                     <div className="text-xs text-zinc-500 uppercase mb-2">Right Eye</div>
                     <div className={`text-3xl font-bold ${results.right !== null ? 'text-red-500' : 'text-emerald-500'}`}>
                         {results.right !== null ? `${results.right}°` : 'Normal'}
                     </div>
                     {results.right !== null && <div className="text-[10px] text-zinc-600 mt-1">AXIS DETECTED</div>}
                 </div>
             </div>
             
             <button onClick={() => { setPhase('intro'); setResults({left:null, right:null}); setKnobAngle(0); }} className="btn-secondary flex items-center justify-center gap-2 mx-auto">
                <RefreshCcw size={16}/> Restart
             </button>
          </div>
       )}
    </div>
  );
};

export default AstigmatismTest;
