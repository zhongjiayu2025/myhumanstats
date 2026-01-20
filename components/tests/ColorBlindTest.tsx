import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Eye, Check, X, RefreshCcw, AlertTriangle, Keyboard } from 'lucide-react';
import { saveStat } from '../../lib/core';

// --- Types ---
type DefectType = 'demo' | 'red-green' | 'blue-yellow';

interface PlateConfig {
  number: string;
  type: DefectType;
  complexity: number; // 1-5, controls dot density/noise
  colors: {
    bg: string[]; // Background hue range (hex)
    fg: string[]; // Foreground hue range (hex)
  };
}

const PLATES: PlateConfig[] = [
  { 
    number: '12', 
    type: 'demo', 
    complexity: 1,
    colors: { bg: ['#a1a1aa', '#71717a'], fg: ['#f97316', '#ea580c'] } // Grey vs Orange
  },
  { 
    number: '8', 
    type: 'red-green', 
    complexity: 2,
    colors: { bg: ['#4d7c0f', '#65a30d'], fg: ['#b91c1c', '#dc2626'] } // Green vs Red
  },
  { 
    number: '29', 
    type: 'red-green', 
    complexity: 3,
    colors: { bg: ['#047857', '#059669'], fg: ['#ea580c', '#c2410c'] } // Emerald vs Orange-Red (Deutan trap)
  },
  { 
    number: '5', 
    type: 'red-green', 
    complexity: 3,
    colors: { bg: ['#3f6212', '#4d7c0f'], fg: ['#be123c', '#e11d48'] } // Olive vs Rose
  },
  { 
    number: '6', 
    type: 'blue-yellow', 
    complexity: 2,
    colors: { bg: ['#a16207', '#ca8a04'], fg: ['#0891b2', '#06b6d4'] } // Yellow vs Cyan (Tritan)
  },
  { 
    number: '7', 
    type: 'blue-yellow', 
    complexity: 3,
    colors: { bg: ['#d97706', '#b45309'], fg: ['#7c3aed', '#8b5cf6'] } // Orange vs Violet
  },
  { 
    number: '74', 
    type: 'red-green', 
    complexity: 4, 
    colors: { bg: ['#15803d', '#166534'], fg: ['#b91c1c', '#991b1b'] } // Forest vs Dark Red (Hard)
  }
];

const ColorBlindTest: React.FC = () => {
  const [phase, setPhase] = useState<'intro' | 'test' | 'result'>('intro');
  const [currentPlateIndex, setCurrentPlateIndex] = useState(0);
  const [answers, setAnswers] = useState<{expected: string, actual: string, type: DefectType}[]>([]);
  const [inputBuffer, setInputBuffer] = useState('');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  // --- Keyboard Support ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase !== 'test') return;

      if (e.key >= '0' && e.key <= '9') {
        handleInput(e.key);
      } else if (e.key === 'Backspace') {
        handleInput('clear');
      } else if (e.key === 'Enter') {
        handleInput('submit');
      } else if (e.key.toLowerCase() === 'n') {
        handleInput('nothing');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, inputBuffer]); 

  // --- Ishihara Generation Engine ---
  
  const drawPlate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    if (animationRef.current) cancelAnimationFrame(animationRef.current);

    const plate = PLATES[currentPlateIndex];
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = width / 2 - 10;

    // 1. Generate Mask (The Number)
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = width;
    maskCanvas.height = height;
    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx) return;
    
    maskCtx.font = `bold ${width * 0.55}px "Inter", sans-serif`;
    maskCtx.textAlign = 'center';
    maskCtx.textBaseline = 'middle';
    maskCtx.fillStyle = '#FFFFFF';
    
    // Jitter position
    const jX = (Math.random() - 0.5) * 20;
    const jY = (Math.random() - 0.5) * 20;
    maskCtx.fillText(plate.number, centerX + jX, centerY + jY);

    const maskData = maskCtx.getImageData(0, 0, width, height).data;

    // 2. Generate Dots (Data only)
    const dots: {x: number, y: number, r: number, color: string}[] = [];
    const minR = 4;
    const maxR = 14 - (plate.complexity * 1.5); 
    const gridSize = maxR; 
    
    for(let y = 0; y < height; y += gridSize) {
        for(let x = 0; x < width; x += gridSize) {
             const dist = Math.sqrt((x - centerX)**2 + (y - centerY)**2);
             if (dist > radius) continue;

             const r = minR + Math.random() * (maxR - minR);
             const offX = (Math.random() - 0.5) * (gridSize - r*2);
             const offY = (Math.random() - 0.5) * (gridSize - r*2);
             
             const finalX = x + gridSize/2 + offX;
             const finalY = y + gridSize/2 + offY;

             const pixelIndex = (Math.floor(finalY) * width + Math.floor(finalX)) * 4;
             const isForeground = maskData[pixelIndex] > 128; 

             const palette = isForeground ? plate.colors.fg : plate.colors.bg;
             const baseColor = palette[Math.floor(Math.random() * palette.length)];
             
             dots.push({ x: finalX, y: finalY, r, color: baseColor });
        }
    }

    // 3. Animate Dots (Pop-in effect)
    const startTime = performance.now();
    const DURATION = 600;

    const animate = (time: number) => {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / DURATION, 1);
        const ease = 1 - Math.pow(1 - progress, 3); // Cubic Ease Out

        ctx.clearRect(0, 0, width, height);
        
        // Background
        ctx.fillStyle = '#18181b'; // Zinc-950
        ctx.fillRect(0,0,width,height);

        // Batch draw
        dots.forEach(dot => {
            const currentR = dot.r * ease;
            if (currentR <= 0) return;

            ctx.beginPath();
            ctx.arc(dot.x, dot.y, currentR, 0, Math.PI * 2);
            ctx.fillStyle = dot.color;
            ctx.fill();
        });

        if (progress < 1) {
            animationRef.current = requestAnimationFrame(animate);
        }
    };

    animationRef.current = requestAnimationFrame(animate);

  }, [currentPlateIndex]);

  useEffect(() => {
     if (phase === 'test') {
         setTimeout(drawPlate, 50);
     }
     return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [phase, currentPlateIndex, drawPlate]);

  // --- Logic ---

  const handleInput = (val: string) => {
      if (val === 'clear') {
          setInputBuffer('');
          return;
      }
      if (val === 'submit') {
          processAnswer(inputBuffer);
          return;
      }
      if (val === 'nothing') {
          processAnswer('nothing');
          return;
      }
      // Limit to 2 digits
      if (inputBuffer.length < 2) {
          setInputBuffer(prev => prev + val);
      }
  };

  const processAnswer = (answer: string) => {
      const plate = PLATES[currentPlateIndex];
      setAnswers(prev => [...prev, {
          expected: plate.number,
          actual: answer === 'nothing' ? '' : answer,
          type: plate.type
      }]);

      if (currentPlateIndex < PLATES.length - 1) {
          setInputBuffer('');
          setCurrentPlateIndex(i => i + 1);
      } else {
          setPhase('result');
      }
  };

  const restart = () => {
      setAnswers([]);
      setCurrentPlateIndex(0);
      setInputBuffer('');
      setPhase('intro');
  };

  // --- Result Calculation ---
  const calculateResult = () => {
      const total = answers.length;
      const correct = answers.filter(a => a.expected === a.actual).length;
      
      const rgTotal = answers.filter(a => a.type === 'red-green').length;
      const rgCorrect = answers.filter(a => a.type === 'red-green' && a.expected === a.actual).length;
      
      const byTotal = answers.filter(a => a.type === 'blue-yellow').length;
      const byCorrect = answers.filter(a => a.type === 'blue-yellow' && a.expected === a.actual).length;

      const score = Math.round((correct / total) * 100);
      saveStat('color-blind-test', score);

      return { score, rgCorrect, rgTotal, byCorrect, byTotal };
  };

  // --- Renderers ---

  if (phase === 'intro') {
      return (
          <div className="max-w-xl mx-auto text-center animate-in fade-in zoom-in">
              <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-zinc-800 shadow-inner">
                  <Eye size={32} className="text-primary-500" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Color Blind Test (Ishihara)</h1>
              <p className="text-zinc-400 text-sm max-w-md mx-auto mb-8 leading-relaxed">
                  This scientific <strong>Color Blind Test</strong> uses procedurally generated Ishihara plates to detect <strong>Red-Green</strong> and <strong>Blue-Yellow</strong> color vision deficiencies.
                  <br/><br/>
                  Identify the number hidden within the dots. 
              </p>
              
              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8">
                 <div className="p-3 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-500">
                    <span className="block text-white font-bold mb-1">Protan/Deutan</span>
                    Red-Green Check
                 </div>
                 <div className="p-3 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-500">
                    <span className="block text-white font-bold mb-1">Tritan</span>
                    Blue-Yellow Check
                 </div>
              </div>

              <button onClick={() => setPhase('test')} className="btn-primary w-full max-w-xs">
                  Start Vision Test
              </button>
          </div>
      );
  }

  if (phase === 'test') {
      return (
          <div className="max-w-lg mx-auto select-none">
              {/* Progress */}
              <div className="flex justify-between items-center mb-4 px-2">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Plate {currentPlateIndex + 1} / {PLATES.length}</span>
                  <div className="flex gap-1">
                      {PLATES.map((_, i) => (
                          <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === currentPlateIndex ? 'bg-primary-500 animate-pulse' : i < currentPlateIndex ? 'bg-zinc-600' : 'bg-zinc-800'}`}></div>
                      ))}
                  </div>
              </div>

              {/* The Ishihara Plate */}
              <div className="relative w-full aspect-square max-w-[320px] mx-auto mb-8 bg-zinc-900 rounded-full border-4 border-zinc-800 shadow-2xl overflow-hidden">
                  <canvas 
                      ref={canvasRef} 
                      width={640} 
                      height={640} 
                      className="w-full h-full object-cover"
                  />
                  {/* Noise overlay for texture */}
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
              </div>

              {/* Input Display */}
              <div className="flex justify-center mb-6 h-12">
                   <div className="bg-black border border-zinc-700 w-32 flex items-center justify-center rounded text-2xl font-mono font-bold text-white tracking-widest shadow-inner">
                       {inputBuffer || <span className="animate-pulse opacity-20">_</span>}
                   </div>
              </div>

              {/* Keypad */}
              <div className="grid grid-cols-3 gap-2 max-w-[280px] mx-auto">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                      <button 
                          key={num} 
                          onClick={() => handleInput(num.toString())}
                          className="h-14 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xl rounded active:scale-95 transition-transform border border-white/5 shadow-md"
                      >
                          {num}
                      </button>
                  ))}
                  <button onClick={() => handleInput('clear')} className="h-14 bg-zinc-900 text-zinc-500 font-mono text-xs rounded border border-zinc-800 hover:text-white uppercase flex flex-col items-center justify-center">
                    <span>Clear</span>
                    <span className="text-[9px] opacity-50">⌫</span>
                  </button>
                  <button onClick={() => handleInput('0')} className="h-14 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xl rounded border border-white/5 shadow-md">0</button>
                  <button onClick={() => handleInput('submit')} className="h-14 bg-primary-600 hover:bg-primary-500 text-black font-bold text-sm rounded uppercase tracking-wide flex flex-col items-center justify-center">
                    <span>Enter</span>
                    <span className="text-[9px] opacity-50">↵</span>
                  </button>
              </div>

              <div className="mt-6 text-center">
                  <button onClick={() => handleInput('nothing')} className="text-xs text-zinc-500 hover:text-primary-400 underline decoration-zinc-700 underline-offset-4 transition-colors font-mono">
                      I don't see anything (Press N)
                  </button>
                  <div className="flex items-center justify-center gap-2 mt-4 text-[10px] text-zinc-600 font-mono opacity-60">
                     <Keyboard size={12} />
                     <span>KEYBOARD SUPPORTED</span>
                  </div>
              </div>
          </div>
      );
  }

  // Result Phase
  const { score, rgCorrect, rgTotal, byCorrect, byTotal } = calculateResult();

  return (
      <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom-4 fade-in duration-500">
          <div className="tech-border bg-black p-8 clip-corner-lg text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-grid opacity-10"></div>
              
              <h2 className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-4">Color Blind Test Results</h2>
              <div className={`text-6xl font-bold mb-2 ${score === 100 ? 'text-emerald-500' : score > 80 ? 'text-primary-400' : 'text-yellow-500'}`}>
                  {score}%
              </div>
              <p className="text-zinc-400 text-sm mb-8">Visual Accuracy Score</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {/* Red Green Analysis */}
                  <div className={`p-4 border rounded bg-zinc-900/50 text-left ${rgCorrect === rgTotal ? 'border-zinc-800' : 'border-yellow-900/50 bg-yellow-900/10'}`}>
                      <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-bold text-zinc-300 uppercase">Red-Green Vision</span>
                          {rgCorrect === rgTotal ? <Check size={16} className="text-emerald-500"/> : <AlertTriangle size={16} className="text-yellow-500"/>}
                      </div>
                      <div className="text-2xl font-mono text-white mb-1">{rgCorrect}/{rgTotal}</div>
                      <p className="text-[10px] text-zinc-500 leading-tight">
                          {rgCorrect === rgTotal 
                              ? "Normal Protan/Deutan sensitivity." 
                              : "Potential Protanomaly (Red) or Deuteranomaly (Green) detected."}
                      </p>
                  </div>

                  {/* Blue Yellow Analysis */}
                  <div className={`p-4 border rounded bg-zinc-900/50 text-left ${byCorrect === byTotal ? 'border-zinc-800' : 'border-blue-900/50 bg-blue-900/10'}`}>
                      <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-bold text-zinc-300 uppercase">Blue-Yellow Vision</span>
                          {byCorrect === byTotal ? <Check size={16} className="text-emerald-500"/> : <AlertTriangle size={16} className="text-blue-500"/>}
                      </div>
                      <div className="text-2xl font-mono text-white mb-1">{byCorrect}/{byTotal}</div>
                      <p className="text-[10px] text-zinc-500 leading-tight">
                          {byCorrect === byTotal 
                              ? "Normal Tritan sensitivity." 
                              : "Potential Tritanomaly (Blue-Yellow) detected."}
                      </p>
                  </div>
              </div>

              {/* Detailed Breakdown */}
              {score < 100 && (
                <div className="mb-8 border-t border-zinc-800 pt-6">
                    <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest text-left mb-4">Detailed Analysis</h3>
                    <div className="space-y-2">
                        {answers.map((ans, idx) => {
                            if (ans.expected === ans.actual) return null;
                            return (
                                <div key={idx} className="flex justify-between items-center bg-zinc-900/80 p-3 rounded border border-red-900/30">
                                    <div className="flex flex-col text-left">
                                        <span className="text-xs text-white font-bold">Plate #{idx + 1} ({ans.type === 'red-green' ? 'Red-Green' : 'Blue-Yellow'})</span>
                                        <span className="text-[10px] text-zinc-500">Correct: {ans.expected}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="text-right">
                                            <span className="text-[10px] text-zinc-500 block">You Saw</span>
                                            <span className="text-red-400 font-mono font-bold">{ans.actual || 'None'}</span>
                                        </div>
                                        <X size={14} className="text-red-500" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
              )}

              <button onClick={restart} className="btn-secondary w-full flex items-center justify-center gap-2">
                  <RefreshCcw size={16} /> Retake Test
              </button>
          </div>

          {/* SEO Footer */}
          <div className="mt-12 border-t border-zinc-800 pt-6 text-left">
              <h4 className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-2">Clinical Context: Ishihara Plates</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                 This <strong>Color Blind Test</strong> is based on the <strong>Ishihara Test</strong> principles. It utilizes pseudoisochromatic plates to screen for <strong>Color Vision Deficiency (CVD)</strong>. The test creates confusion lines where colors appear indistinguishable to those with specific types of color blindness (Protanopia, Deuteranopia, Tritanopia). While accurate for screening, a comprehensive diagnosis requires a visit to an optometrist.
              </p>
          </div>
      </div>
  );
};

export default ColorBlindTest;