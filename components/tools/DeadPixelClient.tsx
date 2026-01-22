
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Monitor, Maximize, Grid3X3, Zap, Palette, Move } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';

const COLORS = [
  { name: 'White', hex: '#FFFFFF', text: 'Check for dead pixels (black spots)' },
  { name: 'Black', hex: '#000000', text: 'Check for stuck pixels (bright spots)' },
  { name: 'Red', hex: '#FF0000', text: 'Check Red sub-pixels' },
  { name: 'Green', hex: '#00FF00', text: 'Check Green sub-pixels' },
  { name: 'Blue', hex: '#0000FF', text: 'Check Blue sub-pixels' },
];

type Mode = 'solid' | 'checker' | 'gradient' | 'fixer';

export default function DeadPixelClient() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [colorIndex, setColorIndex] = useState(0);
  const [showUI, setShowUI] = useState(true);
  const [mode, setMode] = useState<Mode>('solid');
  
  // Fixer State
  const fixerCanvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  const toggleFullscreen = (selectedMode: Mode = 'solid') => {
    setMode(selectedMode);
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
      setShowUI(false);
    }
  };

  const exitFullscreen = () => {
      if (document.fullscreenElement) {
          document.exitFullscreen();
          setIsFullscreen(false);
          setShowUI(true);
      }
  };

  const handleInteraction = () => {
    if (isFullscreen) {
        if (mode === 'solid') {
            setColorIndex((prev) => (prev + 1) % COLORS.length);
        } else {
            setShowUI(prev => !prev);
        }
    }
  };

  // Pixel Fixer Loop (High Speed Noise)
  useEffect(() => {
      if (mode === 'fixer' && isFullscreen && fixerCanvasRef.current) {
          const canvas = fixerCanvasRef.current;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          const render = () => {
              const w = canvas.width;
              const h = canvas.height;
              
              // Generate random noise
              const imgData = ctx.createImageData(w, h);
              const data = imgData.data;
              for (let i = 0; i < data.length; i += 4) {
                  data[i] = Math.random() * 255;     // R
                  data[i + 1] = Math.random() * 255; // G
                  data[i + 2] = Math.random() * 255; // B
                  data[i + 3] = 255; // A
              }
              ctx.putImageData(imgData, 0, 0);
              rafRef.current = requestAnimationFrame(render);
          };
          rafRef.current = requestAnimationFrame(render);
      }
      return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [mode, isFullscreen]);

  useEffect(() => {
    const handleChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
        setShowUI(true);
        setColorIndex(0);
        setMode('solid');
      }
    };
    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);

  const currentColor = COLORS[colorIndex];

  return (
    <div 
      className={`min-h-screen flex flex-col transition-colors duration-300 ${isFullscreen ? '' : 'max-w-4xl mx-auto py-12 px-4'}`}
      style={{ 
          backgroundColor: isFullscreen && mode === 'solid' ? currentColor.hex : '#000' 
      }}
      onClick={handleInteraction}
    >
      {!isFullscreen && (
        <div className="animate-in fade-in">
          <Breadcrumbs items={[{ label: 'Tools', path: '/tools' }, { label: 'Screen Check' }]} />

          <div className="bg-black border border-zinc-800 rounded-xl p-8 text-center relative overflow-hidden mb-12">
             <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none"></div>
             
             <Monitor size={64} className="mx-auto text-zinc-600 mb-6 relative z-10" />
             <h1 className="text-3xl font-bold text-white mb-4 relative z-10">Display Diagnostics Suite</h1>
             <p className="text-zinc-400 max-w-lg mx-auto mb-12 relative z-10">
                Identify dead pixels, backlight bleeding, and motion artifacts.
                Use the <strong className="text-white">Pixel Fixer</strong> to attempt repair of stuck pixels.
             </p>

             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto relative z-10">
                 <button onClick={() => toggleFullscreen('solid')} className="p-4 bg-zinc-900 border border-zinc-800 hover:border-primary-500 rounded-lg flex flex-col items-center gap-2 group transition-all">
                     <Palette size={24} className="text-zinc-500 group-hover:text-primary-500"/>
                     <span className="text-xs font-bold text-zinc-300">Solid Colors</span>
                 </button>
                 <button onClick={() => toggleFullscreen('checker')} className="p-4 bg-zinc-900 border border-zinc-800 hover:border-primary-500 rounded-lg flex flex-col items-center gap-2 group transition-all">
                     <Grid3X3 size={24} className="text-zinc-500 group-hover:text-primary-500"/>
                     <span className="text-xs font-bold text-zinc-300">Checkerboard</span>
                 </button>
                 <button onClick={() => toggleFullscreen('gradient')} className="p-4 bg-zinc-900 border border-zinc-800 hover:border-primary-500 rounded-lg flex flex-col items-center gap-2 group transition-all">
                     <Move size={24} className="text-zinc-500 group-hover:text-primary-500"/>
                     <span className="text-xs font-bold text-zinc-300">Gradients</span>
                 </button>
                 <button onClick={() => toggleFullscreen('fixer')} className="p-4 bg-zinc-900 border border-red-900/50 hover:border-red-500 rounded-lg flex flex-col items-center gap-2 group transition-all">
                     <Zap size={24} className="text-red-700 group-hover:text-red-500"/>
                     <span className="text-xs font-bold text-zinc-300 group-hover:text-red-400">Pixel Fixer</span>
                 </button>
             </div>
          </div>
        </div>
      )}

      {/* --- FULLSCREEN MODES --- */}
      
      {isFullscreen && mode === 'checker' && (
          <div className="w-full h-full flex flex-wrap" style={{backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)', backgroundSize: '100px 100px', backgroundColor: 'black'}}></div>
      )}

      {isFullscreen && mode === 'gradient' && (
          <div className="w-full h-full bg-gradient-to-r from-black via-white to-black flex items-center justify-center">
              <div className="w-full h-1/2 bg-gradient-to-b from-black via-white to-black mix-blend-difference"></div>
          </div>
      )}

      {isFullscreen && mode === 'fixer' && (
          <div className="w-full h-full flex items-center justify-center bg-black relative">
              <div className="text-center absolute top-10 left-0 right-0 z-20 pointer-events-none">
                  <h2 className="text-red-500 font-bold uppercase tracking-widest animate-pulse">Epilepsy Warning: Flashing Lights</h2>
              </div>
              {/* Fixer Box (Draggable concept simplified to centered for now) */}
              <div className="w-[300px] h-[300px] border-4 border-red-500 relative bg-black">
                  <canvas ref={fixerCanvasRef} width={300} height={300} className="w-full h-full" />
                  <div className="absolute -top-8 left-0 text-xs text-red-500 font-bold">STUCK PIXEL MASSEUR</div>
              </div>
          </div>
      )}

      {isFullscreen && showUI && (
         <div className="fixed bottom-10 left-0 right-0 text-center pointer-events-none transition-opacity duration-500">
            <span className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded text-xs font-bold uppercase tracking-widest text-zinc-400 border border-zinc-800">
               {mode === 'solid' ? `${currentColor.name}: ${currentColor.text}` : 'Tap to toggle UI • ESC to Exit'}
            </span>
         </div>
      )}
    </div>
  );
}
