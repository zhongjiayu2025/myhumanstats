
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Monitor, Zap, Activity, AlertTriangle } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function HzCheckClient() {
  const [fps, setFps] = useState(0);
  const [stability, setStability] = useState('Analysing...');
  const [isRunning, setIsRunning] = useState(false);
  const [ufoSpeed, setUfoSpeed] = useState(960); // Pixels per second
  
  const requestRef = useRef<number>(0);
  const prevTimeRef = useRef<number>(0);
  const frameTimesRef = useRef<number[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ufoRef = useRef<HTMLDivElement>(null);

  // Screen refresh is approximated by browser animation frames; never claim
  // this is a calibrated hardware measurement.
  useEffect(() => {
    setIsRunning(true);
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    frameTimesRef.current = [];
    prevTimeRef.current = 0;
    let sampledAt = 0;

    const sizeCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(Math.max(1, rect.width) * dpr);
      canvas.height = Math.round(Math.max(1, rect.height) * dpr);
    };
    sizeCanvas();
    window.addEventListener('resize', sizeCanvas);

    const frame = (time: number) => {
      if (document.visibilityState !== 'visible') {
        prevTimeRef.current = 0;
        frameTimesRef.current = [];
        requestRef.current = requestAnimationFrame(frame);
        return;
      }
      const prev = prevTimeRef.current;
      prevTimeRef.current = time;
      const delta = prev ? time - prev : 0;
      if (delta > 1 && delta < 200) {
        frameTimesRef.current.push(delta);
        if (frameTimesRef.current.length > 120) frameTimesRef.current.shift();
      }
      const frames = frameTimesRef.current;
      if (frames.length >= 20 && time - sampledAt >= 500) {
        const mean = frames.reduce((sum, ms) => sum + ms, 0) / frames.length;
        if (mean > 0) {
          setFps(Math.round(1000 / mean));
          const spread = Math.max(...frames) - Math.min(...frames);
          setStability(spread < 4 ? 'Steady' : spread < 8 ? 'Variable' : 'Frame pacing varies');
        }
        sampledAt = time;
      }

      const canvas = canvasRef.current;
      const context = canvas?.getContext('2d');
      if (canvas && context) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = canvas.width / dpr, h = canvas.height / dpr;
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        context.clearRect(0, 0, w, h);
        context.beginPath();
        context.strokeStyle = '#06b6d4';
        context.lineWidth = 2;
        const scaleY = h / 40;
        frames.forEach((ms, i) => {
          const x = frames.length > 1 ? i * w / (frames.length - 1) : 0;
          const y = Math.max(0, h - ms * scaleY);
          if (i === 0) context.moveTo(x, y); else context.lineTo(x, y);
        });
        context.stroke();
      }
      if (ufoRef.current) {
        const track = ufoRef.current.parentElement?.clientWidth || window.innerWidth;
        const x = (time * ufoSpeed / 1000) % (track + 120) - 60;
        ufoRef.current.style.transform = `translateX(${x}px)`;
      }
      requestRef.current = requestAnimationFrame(frame);
    };
    requestRef.current = requestAnimationFrame(frame);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      window.removeEventListener('resize', sizeCanvas);
    };
  }, [isRunning, ufoSpeed]);

  return (
    <div className="w-full overflow-hidden">
       <div className="max-w-6xl mx-auto pt-12 px-4 animate-in fade-in">
          <Breadcrumbs items={[{ label: 'Tools', path: '/tools' }, { label: 'Hz Checker' }]} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
             {/* Stats Panel */}
             <div className="lg:col-span-1 space-y-6">
                <div className="bg-black border border-zinc-800 p-6 rounded-xl">
                    <h1 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                       <Monitor className="text-primary-500" /> Refresh Rate
                    </h1>
                    <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-6xl font-mono font-bold text-white tracking-tighter text-glow">{fps}</span>
                        <span className="text-xl text-zinc-500 font-mono">Hz</span>
                    </div>
                    <div className="text-xs font-mono text-zinc-400">
                        FRAME TIME: <span className="text-white">{(1000/(fps||60)).toFixed(2)}ms</span>
                    </div>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-zinc-500 uppercase font-bold">Stability</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${stability === 'Steady' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-yellow-900/50 text-yellow-400'}`}>
                            {stability}
                        </span>
                    </div>
                    {stability !== 'Perfect' && (
                        <p className="text-[10px] text-zinc-500 leading-relaxed">
                            <AlertTriangle size={10} className="inline mr-1"/>
                            Browser frame pacing varies. Try closing heavy tabs; this is not a hardware refresh calibration.
                        </p>
                    )}
                </div>
                
                <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl">
                    <span className="text-xs text-zinc-500 uppercase font-bold mb-4 block">Motion Speed</span>
                    <div className="flex gap-2">
                        {[480, 960, 1920].map(s => (
                            <button 
                               key={s} 
                               onClick={() => setUfoSpeed(s)}
                               className={`flex-1 py-2 text-xs font-mono border rounded transition-all ${ufoSpeed === s ? 'bg-primary-600 border-primary-500 text-white' : 'bg-black border-zinc-700 text-zinc-400'}`}
                            >
                                {s}px/s
                            </button>
                        ))}
                    </div>
                </div>
             </div>

             {/* Graph & UFO */}
             <div className="lg:col-span-2 space-y-8">
                 {/* Frame Time Graph */}
                 <div className="relative w-full h-48 bg-black border border-zinc-800 rounded-xl overflow-hidden shadow-inner">
                     <canvas ref={canvasRef} className="w-full h-full" />
                     <div className="absolute top-2 left-2 text-[9px] text-zinc-500 font-mono uppercase">Frame Time Variance (Live)</div>
                 </div>

                 {/* Motion Test Track */}
                 <div className="relative w-full h-40 bg-zinc-950 border-y border-zinc-800 overflow-hidden flex items-center">
                     <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_49%,rgba(255,255,255,0.05)_50%,transparent_51%)] bg-[size:100px_100%] pointer-events-none"></div>
                     
                     <div 
                        ref={ufoRef}
                        className="absolute will-change-transform flex flex-col items-center gap-2"
                        style={{ left: 0 }}
                     >
                         <div className="w-16 h-8 bg-zinc-800 rounded-full relative border border-zinc-600 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                             <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-6 bg-primary-500/50 rounded-t-full border-t border-l border-r border-primary-400 backdrop-blur-sm"></div>
                             <div className="absolute bottom-1 left-2 w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                             <div className="absolute bottom-1 right-2 w-2 h-2 bg-yellow-500 rounded-full animate-pulse delay-75"></div>
                             <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_5px_red]"></div>
                         </div>
                         <span className="text-[9px] font-mono text-zinc-500">{ufoSpeed} px/s</span>
                     </div>
                 </div>
                 
                 <div className="text-center text-xs text-zinc-500 font-mono">
                     Observe the UFO. Gaps can indicate browser frame pacing changes. A background tab or power-saving mode can affect this estimate.
                 </div>
             </div>
          </div>
       </div>
    </div>
  );
}
