import React, { useState, useEffect, useRef } from 'react';
import { Eye, RefreshCcw, Layers } from 'lucide-react';
import { saveStat } from '../../lib/core';

// --- Types ---
type DefectType = 'demo' | 'red-green' | 'blue-yellow';

interface PlateConfig {
  number: string;
  type: DefectType;
  complexity: number; // 1-5
  colors: {
    bg: string[]; 
    fg: string[]; 
  };
}

const PLATES: PlateConfig[] = [
  { 
    number: '12', 
    type: 'demo', 
    complexity: 1,
    colors: { bg: ['#a1a1aa', '#71717a'], fg: ['#f97316', '#ea580c'] } 
  },
  { 
    number: '8', 
    type: 'red-green', 
    complexity: 2,
    colors: { bg: ['#4d7c0f', '#65a30d'], fg: ['#b91c1c', '#dc2626'] } 
  },
  { 
    number: '29', 
    type: 'red-green', 
    complexity: 3,
    colors: { bg: ['#047857', '#059669'], fg: ['#ea580c', '#c2410c'] } 
  },
  { 
    number: '5', 
    type: 'red-green', 
    complexity: 3,
    colors: { bg: ['#3f6212', '#4d7c0f'], fg: ['#be123c', '#e11d48'] } 
  },
  { 
    number: '6', 
    type: 'blue-yellow', 
    complexity: 2,
    colors: { bg: ['#a16207', '#ca8a04'], fg: ['#0891b2', '#06b6d4'] } 
  },
  { 
    number: '74', 
    type: 'red-green', 
    complexity: 4, 
    colors: { bg: ['#15803d', '#166534'], fg: ['#b91c1c', '#991b1b'] } 
  }
];

// SVG Filters for CVD Simulation
const CVDFilters = () => (
  <svg className="hidden">
    <defs>
      {/* Protanopia (Red Blind) */}
      <filter id="protanopia">
        <feColorMatrix
          type="matrix"
          values="0.567, 0.433, 0, 0, 0
                  0.558, 0.442, 0, 0, 0
                  0, 0.242, 0.758, 0, 0
                  0, 0, 0, 1, 0"
        />
      </filter>
      {/* Deuteranopia (Green Blind) */}
      <filter id="deuteranopia">
        <feColorMatrix
          type="matrix"
          values="0.625, 0.375, 0, 0, 0
                  0.7, 0.3, 0, 0, 0
                  0, 0.3, 0.7, 0, 0
                  0, 0, 0, 1, 0"
        />
      </filter>
      {/* Tritanopia (Blue Blind) */}
      <filter id="tritanopia">
        <feColorMatrix
          type="matrix"
          values="0.95, 0.05, 0, 0, 0
                  0, 0.433, 0.567, 0, 0
                  0, 0.475, 0.525, 0, 0
                  0, 0, 0, 1, 0"
        />
      </filter>
    </defs>
  </svg>
);

const ColorBlindTest: React.FC = () => {
  const [phase, setPhase] = useState<'intro' | 'test' | 'result'>('intro');
  const [currentPlateIndex, setCurrentPlateIndex] = useState(0);
  const [answers, setAnswers] = useState<{expected: string, actual: string, type: DefectType, plateIdx: number}[]>([]);
  const [inputBuffer, setInputBuffer] = useState('');
  const [simMode, setSimMode] = useState<string | null>(null); // For result page visualizer
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const resultCanvasRef = useRef<HTMLCanvasElement>(null); // For re-drawing mistakes
  const animationRef = useRef<number>(0);

  // --- Keyboard Support ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase !== 'test') return;

      if (e.key >= '0' && e.key <= '9') handleInput(e.key);
      else if (e.key === 'Backspace') handleInput('clear');
      else if (e.key === 'Enter') handleInput('submit');
      else if (e.key.toLowerCase() === 'n') handleInput('nothing');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, inputBuffer]); 

  // --- Draw Function ---
  const drawPlateToCanvas = (ctx: CanvasRenderingContext2D, width: number, height: number, plateIndex: number, animate = false) => {
    const plate = PLATES[plateIndex];
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = width / 2 - 10;

    // Mask Generation
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = width;
    maskCanvas.height = height;
    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx) return;
    
    maskCtx.font = `bold ${width * 0.55}px "Inter", sans-serif`;
    maskCtx.textAlign = 'center';
    maskCtx.textBaseline = 'middle';
    maskCtx.fillStyle = '#FFFFFF';
    const jX = (Math.sin(plateIndex) * 20); // Pseudo-random jitter based on ID
    const jY = (Math.cos(plateIndex) * 20);
    maskCtx.fillText(plate.number, centerX + jX, centerY + jY);
    const maskData = maskCtx.getImageData(0, 0, width, height).data;

    // Dot Generation
    const dots: {x: number, y: number, r: number, color: string}[] = [];
    const minR = 4;
    const maxR = 14 - (plate.complexity * 1.5); 
    const gridSize = maxR; 
    
    // Seeded random for consistency
    let seed = plateIndex * 100;
    const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

    for(let y = 0; y < height; y += gridSize) {
        for(let x = 0; x < width; x += gridSize) {
             const dist = Math.sqrt((x - centerX)**2 + (y - centerY)**2);
             if (dist > radius) continue;

             const r = minR + random() * (maxR - minR);
             const offX = (random() - 0.5) * (gridSize - r*2);
             const offY = (random() - 0.5) * (gridSize - r*2);
             
             const finalX = x + gridSize/2 + offX;
             const finalY = y + gridSize/2 + offY;

             const pixelIndex = (Math.floor(finalY) * width + Math.floor(finalX)) * 4;
             const isForeground = maskData[pixelIndex] > 128; 

             const palette = isForeground ? plate.colors.fg : plate.colors.bg;
             const baseColor = palette[Math.floor(random() * palette.length)];
             
             dots.push({ x: finalX, y: finalY, r, color: baseColor });
        }
    }

    if (!animate) {
        // Instant draw for results
        ctx.fillStyle = '#18181b';
        ctx.fillRect(0,0,width,height);
        dots.forEach(dot => {
            ctx.beginPath(); ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
            ctx.fillStyle = dot.color; ctx.fill();
        });
        return;
    }

    // Animation Loop
    const startTime = performance.now();
    const DURATION = 600;
    const renderFrame = (time: number) => {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / DURATION, 1);
        const ease = 1 - Math.pow(1 - progress, 3); 

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#18181b';
        ctx.fillRect(0,0,width,height);

        dots.forEach(dot => {
            const currentR = dot.r * ease;
            if (currentR <= 0) return;
            ctx.beginPath(); ctx.arc(dot.x, dot.y, currentR, 0, Math.PI * 2);
            ctx.fillStyle = dot.color; ctx.fill();
        });

        if (progress < 1) animationRef.current = requestAnimationFrame(renderFrame);
    };
    animationRef.current = requestAnimationFrame(renderFrame);
  };

  useEffect(() => {
     if (phase === 'test' && canvasRef.current) {
         const ctx = canvasRef.current.getContext('2d', { willReadFrequently: true });
         if (ctx) drawPlateToCanvas(ctx, canvasRef.current.width, canvasRef.current.height, currentPlateIndex, true);
     }
     return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [phase, currentPlateIndex]);

  const handleInput = (val: string) => {
      if (val === 'clear') setInputBuffer('');
      else if (val === 'submit') processAnswer(inputBuffer);
      else if (val === 'nothing') processAnswer('nothing');
      else if (inputBuffer.length < 2) setInputBuffer(prev => prev + val);
  };

  const processAnswer = (answer: string) => {
      const plate = PLATES[currentPlateIndex];
      setAnswers(prev => [...prev, {
          expected: plate.number,
          actual: answer === 'nothing' ? '' : answer,
          type: plate.type,
          plateIdx: currentPlateIndex
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

  const { score, rgCorrect, rgTotal, byCorrect, byTotal } = (() => {
      const total = answers.length;
      const correct = answers.filter(a => a.expected === a.actual).length;
      const rgTotal = answers.filter(a => a.type === 'red-green').length;
      const rgCorrect = answers.filter(a => a.type === 'red-green' && a.expected === a.actual).length;
      const byTotal = answers.filter(a => a.type === 'blue-yellow').length;
      const byCorrect = answers.filter(a => a.type === 'blue-yellow' && a.expected === a.actual).length;
      const score = total > 0 ? Math.round((correct / total) * 100) : 0;
      if (phase === 'result') saveStat('color-blind-test', score);
      return { score, rgCorrect, rgTotal, byCorrect, byTotal };
  })();

  // --- Result Simulation Effect ---
  // When user hovers/clicks a mistake, redraw that plate on a side canvas and apply CSS filter
  const [previewMistake, setPreviewMistake] = useState<typeof answers[0] | null>(null);
  
  useEffect(() => {
      if (phase === 'result' && previewMistake && resultCanvasRef.current) {
          const ctx = resultCanvasRef.current.getContext('2d');
          if (ctx) drawPlateToCanvas(ctx, 300, 300, previewMistake.plateIdx, false);
      }
  }, [previewMistake, phase]);

  if (phase === 'intro') {
      return (
          <div className="max-w-xl mx-auto text-center animate-in fade-in zoom-in">
              <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-zinc-800 shadow-inner">
                  <Eye size={32} className="text-primary-500" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Color Blind Test (Ishihara)</h1>
              <p className="text-zinc-400 text-sm max-w-md mx-auto mb-8 leading-relaxed">
                  Screen for <strong>Red-Green</strong> and <strong>Blue-Yellow</strong> deficiencies using digital pseudoisochromatic plates.
              </p>
              <button onClick={() => setPhase('test')} className="btn-primary w-full max-w-xs">Start Vision Test</button>
          </div>
      );
  }

  if (phase === 'test') {
      return (
          <div className="max-w-lg mx-auto select-none">
              <div className="flex justify-between items-center mb-4 px-2">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Plate {currentPlateIndex + 1} / {PLATES.length}</span>
                  <div className="flex gap-1">
                      {PLATES.map((_, i) => (
                          <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === currentPlateIndex ? 'bg-primary-500 animate-pulse' : i < currentPlateIndex ? 'bg-zinc-600' : 'bg-zinc-800'}`}></div>
                      ))}
                  </div>
              </div>

              <div className="relative w-full aspect-square max-w-[320px] mx-auto mb-8 bg-zinc-900 rounded-full border-4 border-zinc-800 shadow-2xl overflow-hidden">
                  <canvas ref={canvasRef} width={640} height={640} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
              </div>

              <div className="flex justify-center mb-6 h-12">
                   <div className="bg-black border border-zinc-700 w-32 flex items-center justify-center rounded text-2xl font-mono font-bold text-white tracking-widest shadow-inner">
                       {inputBuffer || <span className="animate-pulse opacity-20">_</span>}
                   </div>
              </div>

              <div className="grid grid-cols-3 gap-2 max-w-[280px] mx-auto">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                      <button key={num} onClick={() => handleInput(num.toString())} className="h-14 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xl rounded active:scale-95 transition-transform border border-white/5 shadow-md">{num}</button>
                  ))}
                  <button onClick={() => handleInput('clear')} className="h-14 bg-zinc-900 text-zinc-500 font-mono text-xs rounded border border-zinc-800 hover:text-white uppercase flex flex-col items-center justify-center"><span>Clear</span></button>
                  <button onClick={() => handleInput('0')} className="h-14 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xl rounded border border-white/5 shadow-md">0</button>
                  <button onClick={() => handleInput('submit')} className="h-14 bg-primary-600 hover:bg-primary-500 text-black font-bold text-sm rounded uppercase tracking-wide flex flex-col items-center justify-center"><span>Enter</span></button>
              </div>

              <div className="mt-6 text-center">
                  <button onClick={() => handleInput('nothing')} className="text-xs text-zinc-500 hover:text-primary-400 underline decoration-zinc-700 underline-offset-4 transition-colors font-mono">I don't see anything (Press N)</button>
              </div>
          </div>
      );
  }

  // RESULT PHASE
  return (
      <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-4 fade-in duration-500">
          <CVDFilters />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Score Card */}
              <div className="tech-border bg-black p-8 clip-corner-lg text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-grid opacity-10"></div>
                  <h2 className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-4">Color Vision Analysis</h2>
                  <div className={`text-6xl font-bold mb-2 ${score === 100 ? 'text-emerald-500' : score > 80 ? 'text-primary-400' : 'text-yellow-500'}`}>
                      {score}%
                  </div>
                  <p className="text-zinc-400 text-sm mb-8">Accuracy</p>
                  
                  <div className="space-y-3 mb-8">
                      <div className="flex justify-between p-3 bg-zinc-900/50 rounded border border-zinc-800">
                          <span className="text-xs text-zinc-400">Red-Green</span>
                          <span className={`text-sm font-mono font-bold ${rgCorrect === rgTotal ? 'text-emerald-500' : 'text-red-500'}`}>{rgCorrect}/{rgTotal}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-zinc-900/50 rounded border border-zinc-800">
                          <span className="text-xs text-zinc-400">Blue-Yellow</span>
                          <span className={`text-sm font-mono font-bold ${byCorrect === byTotal ? 'text-emerald-500' : 'text-red-500'}`}>{byCorrect}/{byTotal}</span>
                      </div>
                  </div>
                  <button onClick={restart} className="btn-secondary w-full flex items-center justify-center gap-2"><RefreshCcw size={16} /> Retake</button>
              </div>

              {/* Analysis & Simulator */}
              <div>
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Layers size={18} className="text-primary-500"/> Plate Analysis</h3>
                  
                  {score === 100 ? (
                      <div className="p-6 bg-emerald-900/20 border border-emerald-500/30 rounded text-emerald-200 text-sm">
                          Perfect score. No color vision deficiency detected.
                      </div>
                  ) : (
                      <div className="space-y-6">
                          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded text-xs text-zinc-400">
                              <p className="mb-4">Click a missed plate below to launch the <strong>CVD Simulator</strong>.</p>
                              <div className="grid grid-cols-5 gap-2">
                                  {answers.map((ans, idx) => (
                                      <button 
                                          key={idx} 
                                          onClick={() => setPreviewMistake(ans)}
                                          className={`aspect-square rounded flex items-center justify-center border font-bold text-sm transition-all ${ans.expected === ans.actual ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-500' : 'bg-red-900/20 border-red-500/50 text-red-500 hover:scale-110 cursor-pointer ring-2 ring-transparent hover:ring-red-500'}`}
                                      >
                                          {idx + 1}
                                      </button>
                                  ))}
                              </div>
                          </div>

                          {previewMistake && (
                              <div className="bg-black border border-zinc-700 rounded-xl p-4 animate-in zoom-in">
                                  <div className="flex justify-between items-center mb-4">
                                      <span className="text-xs font-bold text-white">Plate #{previewMistake.plateIdx + 1} Simulation</span>
                                      <div className="flex gap-1">
                                          {['Normal', 'Protan', 'Deutan'].map(mode => (
                                              <button 
                                                  key={mode}
                                                  onClick={() => setSimMode(mode === 'Normal' ? null : mode === 'Protan' ? 'protanopia' : 'deuteranopia')}
                                                  className={`px-2 py-1 text-[10px] uppercase rounded border ${(!simMode && mode === 'Normal') || (simMode?.includes(mode.toLowerCase())) ? 'bg-primary-600 text-white border-primary-500' : 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}
                                              >
                                                  {mode}
                                              </button>
                                          ))}
                                      </div>
                                  </div>
                                  <div className="flex justify-center bg-zinc-900 rounded-lg p-4">
                                      <canvas 
                                          ref={resultCanvasRef} 
                                          width={300} 
                                          height={300} 
                                          className="w-48 h-48 object-contain rounded-full border-4 border-zinc-800"
                                          style={{ filter: simMode ? `url(#${simMode})` : 'none' }}
                                      />
                                  </div>
                                  <div className="mt-4 text-center text-xs text-zinc-500">
                                      Correct: <span className="text-white font-bold">{previewMistake.expected}</span> &nbsp;|&nbsp; You Saw: <span className="text-red-400 font-bold">{previewMistake.actual || 'None'}</span>
                                  </div>
                              </div>
                          )}
                      </div>
                  )}
              </div>
          </div>
      </div>
  );
};

export default ColorBlindTest;