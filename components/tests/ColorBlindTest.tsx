
import React, { useState, useEffect, useRef } from 'react';
import { Eye, RefreshCcw, Layers } from 'lucide-react';
import { saveStat } from '../../lib/core';

// --- Types ---
type DefectType = 'demo' | 'red-green' | 'blue-yellow' | 'total';

interface PlateConfig {
  id: number;
  number: string;
  type: DefectType;
  subtype?: 'protan' | 'deutan'; 
  complexity: number;
  colors: {
    bg: string[]; 
    fg: string[]; 
  };
}

const PLATES: PlateConfig[] = [
  { 
    id: 1, number: '12', type: 'demo', complexity: 1,
    colors: { bg: ['#a1a1aa', '#71717a'], fg: ['#f97316', '#ea580c'] } 
  },
  { 
    id: 2, number: '8', type: 'red-green', subtype: 'deutan', complexity: 2,
    colors: { bg: ['#4d7c0f', '#65a30d'], fg: ['#b91c1c', '#dc2626'] } 
  },
  { 
    id: 3, number: '29', type: 'red-green', subtype: 'protan', complexity: 3,
    colors: { bg: ['#047857', '#059669'], fg: ['#ea580c', '#c2410c'] } 
  },
  { 
    id: 4, number: '5', type: 'red-green', subtype: 'deutan', complexity: 3,
    colors: { bg: ['#3f6212', '#4d7c0f'], fg: ['#be123c', '#e11d48'] } 
  },
  { 
    id: 5, number: '3', type: 'red-green', subtype: 'protan', complexity: 2,
    colors: { bg: ['#15803d', '#166534'], fg: ['#b91c1c', '#991b1b'] } 
  },
  { 
    id: 6, number: '7', type: 'blue-yellow', complexity: 2,
    colors: { bg: ['#a16207', '#ca8a04'], fg: ['#0891b2', '#06b6d4'] } 
  },
];

const ColorBlindTest: React.FC = () => {
  const [phase, setPhase] = useState<'intro' | 'test' | 'result'>('intro');
  const [currentPlateIndex, setCurrentPlateIndex] = useState(0);
  const [answers, setAnswers] = useState<{expected: string, actual: string, plate: PlateConfig, timeTaken: number}[]>([]);
  const [inputBuffer, setInputBuffer] = useState('');
  
  // Simulation State
  const [simMode, setSimMode] = useState<'normal' | 'protan' | 'deutan'>('normal');
  
  // Timer State
  const [plateStartTime, setPlateStartTime] = useState(0);
  const [timerBar, setTimerBar] = useState(100);
  const timerRef = useRef<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  // --- Drawing Logic ---
  const drawPlateToCanvas = (ctx: CanvasRenderingContext2D, width: number, height: number, plate: PlateConfig, animate = false) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = width / 2 - 10;

    // 1. Create Mask for Number
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = width;
    maskCanvas.height = height;
    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx) return;
    
    maskCtx.font = `bold ${width * 0.55}px "Inter", sans-serif`;
    maskCtx.textAlign = 'center';
    maskCtx.textBaseline = 'middle';
    maskCtx.fillStyle = '#FFFFFF';
    const jX = (Math.sin(plate.id) * 15); 
    const jY = (Math.cos(plate.id) * 15);
    maskCtx.fillText(plate.number, centerX + jX, centerY + jY);
    const maskData = maskCtx.getImageData(0, 0, width, height).data;

    // 2. Generate Dots
    const dots: {x: number, y: number, r: number, color: string}[] = [];
    const minR = 4;
    const maxR = 14 - (plate.complexity * 1.5); 
    const gridSize = maxR; 
    
    let seed = plate.id * 1000;
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
        ctx.fillStyle = '#18181b';
        ctx.fillRect(0,0,width,height);
        dots.forEach(dot => {
            ctx.beginPath(); ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
            ctx.fillStyle = dot.color; ctx.fill();
        });
        return;
    }

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
         if (ctx) drawPlateToCanvas(ctx, canvasRef.current.width, canvasRef.current.height, PLATES[currentPlateIndex], true);
         
         setPlateStartTime(Date.now());
         let t = 100;
         const interval = setInterval(() => {
             t -= 1; 
             setTimerBar(prev => Math.max(0, prev - 0.5)); 
         }, 100);
         timerRef.current = window.setInterval(() => {}, 1000); 
         return () => clearInterval(interval);
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
      const timeTaken = (Date.now() - plateStartTime) / 1000;
      setAnswers(prev => [...prev, {
          expected: PLATES[currentPlateIndex].number,
          actual: answer === 'nothing' ? '' : answer,
          plate: PLATES[currentPlateIndex],
          timeTaken
      }]);

      if (currentPlateIndex < PLATES.length - 1) {
          setInputBuffer('');
          setTimerBar(100);
          setCurrentPlateIndex(i => i + 1);
      } else {
          setPhase('result');
      }
  };

  const calculateResult = () => {
      const total = answers.length;
      const correct = answers.filter(a => a.expected === a.actual).length;
      const score = Math.round((correct / total) * 100);
      saveStat('color-blind-test', score);

      const errors = answers.filter(a => a.expected !== a.actual);
      const protanErrors = errors.filter(a => a.plate.subtype === 'protan').length;
      const deutanErrors = errors.filter(a => a.plate.subtype === 'deutan').length;
      
      let diagnosis = "Normal Color Vision";
      if (score < 90) {
          if (protanErrors > deutanErrors) diagnosis = "Protanopia (Red-Blind) Tendency";
          else if (deutanErrors > protanErrors) diagnosis = "Deuteranopia (Green-Blind) Tendency";
          else diagnosis = "General Color Vision Deficiency";
      }
      return { score, diagnosis, errors };
  };

  return (
    <div className="max-w-xl mx-auto text-center select-none">
       {/* SVG Filters for Simulation */}
       <svg style={{ display: 'none' }}>
           <defs>
               <filter id="protanopia">
                   <feColorMatrix type="matrix" values="0.567, 0.433, 0, 0, 0  0.558, 0.442, 0, 0, 0  0, 0.242, 0.758, 0, 0  0, 0, 0, 1, 0" />
               </filter>
               <filter id="deuteranopia">
                   <feColorMatrix type="matrix" values="0.625, 0.375, 0, 0, 0  0.7, 0.3, 0, 0, 0  0, 0.3, 0.7, 0, 0  0, 0, 0, 1, 0" />
               </filter>
           </defs>
       </svg>

       {phase === 'intro' && (
          <div className="animate-in fade-in zoom-in">
              <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-zinc-800 shadow-inner">
                  <Eye size={32} className="text-primary-500" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Color Blind Test (Ishihara)</h1>
              <p className="text-zinc-400 text-sm max-w-md mx-auto mb-8 leading-relaxed">
                  Advanced screening for Red-Green deficiencies. 
                  <br/>Identify the numbers hidden in the dot patterns.
              </p>
              <button onClick={() => setPhase('test')} className="btn-primary w-full max-w-xs">Start Vision Test</button>
          </div>
       )}

       {phase === 'test' && (
          <div className="max-w-lg mx-auto">
              <div className="flex justify-between items-center mb-4 px-2">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Plate {currentPlateIndex + 1} / {PLATES.length}</span>
                  <div className="w-32 h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-500 transition-all ease-linear duration-100" style={{ width: `${timerBar}%` }}></div>
                  </div>
              </div>

              <div className="relative w-full aspect-square max-w-[320px] mx-auto mb-8 bg-zinc-900 rounded-full border-4 border-zinc-800 shadow-2xl overflow-hidden">
                  <canvas 
                    ref={canvasRef} 
                    width={640} 
                    height={640} 
                    className="w-full h-full object-cover"
                  />
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
      )}

      {phase === 'result' && (
          <div className="animate-in slide-in-from-bottom-4">
              <div className="mb-8">
                  <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">Diagnosis Report</h2>
                  <div className={`text-2xl font-bold text-white mb-2`}>{calculateResult().diagnosis}</div>
                  <div className={`text-6xl font-bold mb-4 ${calculateResult().score > 80 ? 'text-emerald-500' : 'text-yellow-500'}`}>
                      {calculateResult().score}%
                  </div>
              </div>

              {/* Vision Simulator Feature */}
              <div className="mb-8 bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 justify-center">
                      <Layers size={16} className="text-primary-500" /> Vision Simulator
                  </h3>
                  
                  {/* Sample Image */}
                  <div className="relative w-full h-48 rounded-lg overflow-hidden mb-4 bg-black">
                      <img 
                          src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=600" 
                          alt="Colorful scene" 
                          className="w-full h-full object-cover"
                          style={{ filter: simMode === 'protan' ? 'url(#protanopia)' : simMode === 'deutan' ? 'url(#deuteranopia)' : 'none' }}
                      />
                      <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 text-[10px] text-white rounded">
                          {simMode.toUpperCase()} VIEW
                      </div>
                  </div>

                  <div className="flex justify-center gap-2">
                      <button onClick={() => setSimMode('normal')} className={`px-3 py-1 rounded text-xs border ${simMode === 'normal' ? 'bg-zinc-700 text-white border-zinc-500' : 'bg-black border-zinc-800 text-zinc-500'}`}>Normal</button>
                      <button onClick={() => setSimMode('protan')} className={`px-3 py-1 rounded text-xs border ${simMode === 'protan' ? 'bg-red-900/50 text-red-200 border-red-500' : 'bg-black border-zinc-800 text-zinc-500'}`}>Protan (Red)</button>
                      <button onClick={() => setSimMode('deutan')} className={`px-3 py-1 rounded text-xs border ${simMode === 'deutan' ? 'bg-green-900/50 text-green-200 border-green-500' : 'bg-black border-zinc-800 text-zinc-500'}`}>Deutan (Green)</button>
                  </div>
              </div>

              <button onClick={() => { setPhase('intro'); setAnswers([]); setCurrentPlateIndex(0); setInputBuffer(''); setSimMode('normal'); }} className="btn-secondary flex items-center justify-center gap-2 mx-auto">
                  <RefreshCcw size={16} /> Retake Test
              </button>
          </div>
      )}
    </div>
  );
};

export default ColorBlindTest;
