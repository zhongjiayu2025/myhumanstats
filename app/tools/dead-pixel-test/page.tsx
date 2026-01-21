
"use client";

import React, { useState, useEffect } from 'react';
import { Monitor, Maximize } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';

const COLORS = [
  { name: 'White', hex: '#FFFFFF', text: 'Check for dead pixels (black spots)' },
  { name: 'Black', hex: '#000000', text: 'Check for stuck pixels (bright spots)' },
  { name: 'Red', hex: '#FF0000', text: 'Check Red sub-pixels' },
  { name: 'Green', hex: '#00FF00', text: 'Check Green sub-pixels' },
  { name: 'Blue', hex: '#0000FF', text: 'Check Blue sub-pixels' },
];

export default function DeadPixelPage() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [colorIndex, setColorIndex] = useState(0);
  const [showUI, setShowUI] = useState(true);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
      setShowUI(false);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
      setShowUI(true);
    }
  };

  const handleInteraction = () => {
    if (isFullscreen) {
      setColorIndex((prev) => (prev + 1) % COLORS.length);
    }
  };

  useEffect(() => {
    const handleChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
        setShowUI(true);
        setColorIndex(0);
      }
    };
    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);

  const currentColor = COLORS[colorIndex];

  return (
    <div 
      className={`min-h-screen flex flex-col transition-colors duration-300 ${isFullscreen ? '' : 'max-w-4xl mx-auto py-12 px-4'}`}
      style={{ backgroundColor: isFullscreen ? currentColor.hex : 'transparent' }}
      onClick={handleInteraction}
    >
      {!isFullscreen && (
        <div className="animate-in fade-in">
          <Breadcrumbs items={[{ label: 'Tools', path: '/tools' }, { label: 'Screen Check' }]} />

          <div className="bg-black border border-zinc-800 rounded-xl p-8 text-center relative overflow-hidden">
             <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none"></div>
             
             <Monitor size={64} className="mx-auto text-zinc-600 mb-6 relative z-10" />
             <h1 className="text-3xl font-bold text-white mb-4 relative z-10">Dead Pixel & Burn-in Check</h1>
             <p className="text-zinc-400 max-w-lg mx-auto mb-8 relative z-10">
                Cycle through solid colors to identify defects in your display panel. 
                <br/><br/>
                <strong className="text-white">Dead pixels</strong> appear as black dots on white backgrounds.<br/>
                <strong className="text-white">Stuck pixels</strong> appear as colored dots on black backgrounds.
             </p>

             <button 
                onClick={toggleFullscreen}
                className="btn-primary flex items-center gap-2 mx-auto relative z-10"
             >
                <Maximize size={18} /> Start Fullscreen Test
             </button>
             
             <p className="text-xs text-zinc-500 mt-6 font-mono relative z-10">
                CLICK TO CYCLE COLORS • ESC TO EXIT
             </p>
          </div>
        </div>
      )}

      {isFullscreen && showUI && (
         <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/80 text-white px-6 py-3 rounded-full font-mono text-sm backdrop-blur-md">
               Tap/Click to cycle colors
            </div>
         </div>
      )}
      
      {isFullscreen && (
         <div className={`fixed bottom-10 left-0 right-0 text-center pointer-events-none transition-opacity duration-500 ${colorIndex === 1 ? 'text-zinc-500' : 'text-black/50'}`}>
            <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded text-xs font-bold uppercase tracking-widest">
               {currentColor.name}: {currentColor.text}
            </span>
         </div>
      )}
    </div>
  );
}
