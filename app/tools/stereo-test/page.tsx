
"use client";

import React, { useRef, useState } from 'react';
import { Headphones, Volume2, ArrowLeftCircle, ArrowRightCircle } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function StereoTestPage() {
  const [playing, setPlaying] = useState<'none' | 'left' | 'right' | 'center'>('none');
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playTone = (pan: number) => { // -1 left, 0 center, 1 right
     if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
     }
     const ctx = audioCtxRef.current;
     if (ctx.state === 'suspended') ctx.resume();

     const osc = ctx.createOscillator();
     const gain = ctx.createGain();
     const panner = ctx.createStereoPanner();

     osc.type = 'sine';
     osc.frequency.setValueAtTime(440, ctx.currentTime); 
     osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.5); 

     panner.pan.value = pan;
     
     gain.gain.setValueAtTime(0, ctx.currentTime);
     gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
     gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);

     osc.connect(gain);
     gain.connect(panner);
     panner.connect(ctx.destination);

     osc.start();
     osc.stop(ctx.currentTime + 1);

     const side = pan === -1 ? 'left' : pan === 1 ? 'right' : 'center';
     setPlaying(side);
     setTimeout(() => setPlaying('none'), 1000);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 animate-in fade-in">
       <Breadcrumbs items={[{ label: 'Tools', path: '/tools' }, { label: 'Stereo Check' }]} />

       <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          <div className="order-2 md:order-1">
             <h1 className="text-3xl font-bold text-white mb-4">Stereo Channel Tester</h1>
             <p className="text-zinc-400 mb-8 leading-relaxed">
                Verify your audio equipment setup. Click the buttons to send a signal exclusively to the Left or Right speaker.
                <br/><br/>
                If you hear the "Left" sound in your Right ear, your headphones are worn backwards or wired incorrectly.
             </p>

             <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-lg mb-8">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                   <Headphones size={16} className="text-primary-500"/> Wiring Check
                </h3>
                <ul className="space-y-3 text-xs text-zinc-400 font-mono">
                   <li className="flex justify-between border-b border-zinc-800 pb-2">
                      <span>1. Wear headphones</span>
                      <span className="text-white">"L" on Left Ear</span>
                   </li>
                   <li className="flex justify-between border-b border-zinc-800 pb-2">
                      <span>2. Click 'Left Channel'</span>
                      <span className="text-white">Sound only in Left</span>
                   </li>
                   <li className="flex justify-between border-b border-zinc-800 pb-2">
                      <span>3. Click 'Right Channel'</span>
                      <span className="text-white">Sound only in Right</span>
                   </li>
                </ul>
             </div>
          </div>

          <div className="order-1 md:order-2 flex flex-col items-center justify-center bg-black border border-zinc-800 rounded-3xl p-12 relative shadow-2xl">
             <div className="relative mb-12">
                <Headphones size={120} className="text-zinc-800" />
                
                <div className={`absolute top-1/2 -left-8 -translate-y-1/2 transition-opacity duration-200 ${playing === 'left' ? 'opacity-100' : 'opacity-0'}`}>
                   <Volume2 size={40} className="text-emerald-500 animate-pulse" />
                   <div className="absolute top-0 right-0 w-full h-full bg-emerald-500 blur-xl opacity-20"></div>
                </div>

                <div className={`absolute top-1/2 -right-8 -translate-y-1/2 transition-opacity duration-200 ${playing === 'right' ? 'opacity-100' : 'opacity-0'}`}>
                   <Volume2 size={40} className="text-emerald-500 animate-pulse transform scale-x-[-1]" />
                   <div className="absolute top-0 left-0 w-full h-full bg-emerald-500 blur-xl opacity-20"></div>
                </div>
             </div>

             <div className="flex gap-4 w-full">
                <button 
                   onClick={() => playTone(-1)}
                   className={`flex-1 py-6 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 hover:border-emerald-500 transition-all flex flex-col items-center gap-2 group ${playing === 'left' ? 'border-emerald-500 bg-zinc-800' : ''}`}
                >
                   <ArrowLeftCircle size={32} className={`text-zinc-500 group-hover:text-emerald-500 ${playing === 'left' ? 'text-emerald-500' : ''}`} />
                   <span className="text-xs font-bold text-white uppercase">Left</span>
                </button>

                <button 
                   onClick={() => playTone(1)}
                   className={`flex-1 py-6 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 hover:border-emerald-500 transition-all flex flex-col items-center gap-2 group ${playing === 'right' ? 'border-emerald-500 bg-zinc-800' : ''}`}
                >
                   <ArrowRightCircle size={32} className={`text-zinc-500 group-hover:text-emerald-500 ${playing === 'right' ? 'text-emerald-500' : ''}`} />
                   <span className="text-xs font-bold text-white uppercase">Right</span>
                </button>
             </div>
             
             <button 
                onClick={() => playTone(0)}
                className="mt-4 text-xs text-zinc-600 hover:text-zinc-400 font-mono uppercase tracking-widest"
             >
                Test Center (Mono)
             </button>
          </div>

       </div>
    </div>
  );
}
