
"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Headphones, Volume2, ArrowLeftCircle, ArrowRightCircle, Repeat, Globe, Waves } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function StereoCheckClient() {
  const [playing, setPlaying] = useState<'none' | 'left' | 'right' | 'center' | 'phase' | 'orbit'>('none');
  const [orbitAngle, setOrbitAngle] = useState(0);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const orbitRef = useRef<number | null>(null);
  const pannerRef = useRef<PannerNode | null>(null); // For 3D
  const sourceRef = useRef<OscillatorNode | null>(null);
  const playTimerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (playTimerRef.current !== null) clearTimeout(playTimerRef.current);
    if (orbitRef.current !== null) cancelAnimationFrame(orbitRef.current);
    if (sourceRef.current) {
      try { sourceRef.current.stop(); } catch (_) {}
      sourceRef.current.disconnect();
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      void audioCtxRef.current.close().catch(() => {});
    }
  }, []);

  const initAudio = () => {
      if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') void ctx.resume().catch(() => {});
      return ctx;
  };

  const stopAudio = () => {
      if (playTimerRef.current !== null) clearTimeout(playTimerRef.current);
      playTimerRef.current = null;
      if (sourceRef.current) {
          try { sourceRef.current.stop(); sourceRef.current.disconnect(); } catch(e){}
          sourceRef.current = null;
      }
      if (orbitRef.current !== null) cancelAnimationFrame(orbitRef.current);
      orbitRef.current = null;
      setPlaying('none');
  };

  const playTone = (pan: number) => { // -1 left, 0 center, 1 right
     stopAudio();
     const ctx = initAudio();

     const osc = ctx.createOscillator();
     const gain = ctx.createGain();
     const panner = ctx.createStereoPanner();

     osc.type = 'sine';
     osc.frequency.setValueAtTime(440, ctx.currentTime); 
     osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.5); 

     panner.pan.value = pan;
     
     gain.gain.setValueAtTime(0, ctx.currentTime);
     gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.05);
     gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);

     osc.connect(gain);
     gain.connect(panner);
     panner.connect(ctx.destination);

     osc.start();
     osc.stop(ctx.currentTime + 1);
     sourceRef.current = osc;

     const side = pan === -1 ? 'left' : pan === 1 ? 'right' : 'center';
     setPlaying(side);
     playTimerRef.current = window.setTimeout(() => setPlaying('none'), 1000);
  };

  const playPhaseTest = (type: 'in' | 'out') => {
      stopAudio();
      const ctx = initAudio();
      
      const osc = ctx.createOscillator();
      osc.type = 'triangle'; // Richer sound for phase detection
      osc.frequency.value = 200; // Low freq makes phase issues obvious

      const merger = ctx.createChannelMerger(2);
      
      const gainL = ctx.createGain();
      const gainR = ctx.createGain();
      
      gainL.gain.value = 0.12;
      gainR.gain.value = type === 'in' ? 0.12 : -0.12; // Invert phase for Right channel

      // Mono signal duplicated into two channels; invert right phase on request.
      osc.connect(gainL);
      osc.connect(gainR);
      
      gainL.connect(merger, 0, 0);
      gainR.connect(merger, 0, 1);
      
      merger.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 2);
      sourceRef.current = osc;
      
      setPlaying('phase');
      playTimerRef.current = window.setTimeout(() => setPlaying('none'), 2000);
  };

  const playOrbit = () => {
      stopAudio();
      const ctx = initAudio();
      
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth'; // Good for localization
      osc.frequency.value = 400;
      
      // Filter to soften
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1000;

      const panner = ctx.createPanner();
      panner.panningModel = 'HRTF';
      panner.distanceModel = 'inverse';
      pannerRef.current = panner;

      const gain = ctx.createGain();
      gain.gain.value = 0.09; // Avoid full-scale continuous sawtooth output.
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(panner);
      panner.connect(ctx.destination);
      
      osc.start();
      sourceRef.current = osc;
      setPlaying('orbit');

      const startTime = performance.now();
      const radius = 3;

      const animate = () => {
          const now = performance.now();
          const elapsed = (now - startTime) / 1000;
          const speed = 2; // rad/s
          const angle = elapsed * speed;
          
          setOrbitAngle(angle);
          
          const x = Math.sin(angle) * radius;
          const z = Math.cos(angle) * radius; // Z is depth (front/back)
          
          // Web Audio Coord System: X=Left/Right, Y=Up/Down, Z=Front/Back
          panner.setPosition(x, 0, z);
          
          if (elapsed < 6) { // 2 full circles approx
              orbitRef.current = requestAnimationFrame(animate);
          } else {
              stopAudio();
          }
      };
      orbitRef.current = requestAnimationFrame(animate);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 animate-in fade-in">
       <Breadcrumbs items={[{ label: 'Tools', path: '/tools' }, { label: 'Stereo Check' }]} />

       <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          
          <div className="order-2 md:order-1 space-y-8">
             <div>
                 <h1 className="text-3xl font-bold text-white mb-4">Stereo & Phase Analyzer</h1>
                 <p className="text-zinc-400 leading-relaxed">
                    Compare left, right and stereo phase with browser-generated tones. Start at a comfortable listening volume; headphones are recommended.
                 </p>
             </div>

             <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-lg">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                   <Waves size={16} className="text-primary-500"/> Polarity Test
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => playPhaseTest('in')} className="p-3 bg-zinc-800 border border-zinc-700 hover:bg-emerald-900/20 hover:border-emerald-500 rounded text-xs font-bold text-white transition-all">
                        IN PHASE (Focused)
                    </button>
                    <button onClick={() => playPhaseTest('out')} className="p-3 bg-zinc-800 border border-zinc-700 hover:bg-red-900/20 hover:border-red-500 rounded text-xs font-bold text-white transition-all">
                        OUT OF PHASE (Hollow)
                    </button>
                </div>
                <p className="text-[10px] text-zinc-500 mt-3 leading-relaxed">
                    <strong>Tip:</strong> The two phase options sound different depending on speaker placement and room acoustics; these online tones cannot prove reversed wiring.
                </p>
             </div>

             <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-lg">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                   <Globe size={16} className="text-primary-500"/> Spatial Audio
                </h3>
                <button onClick={playOrbit} className="w-full p-4 bg-zinc-800 border border-zinc-700 hover:bg-primary-900/20 hover:border-primary-500 rounded flex items-center justify-center gap-2 text-sm font-bold text-white transition-all">
                    Start 3D Orbit <Repeat size={14}/>
                </button>
                <button type="button" onClick={stopAudio} className="mt-3 w-full py-3 text-xs text-zinc-300 border border-zinc-700 rounded hover:bg-zinc-800">Stop Audio</button>
             </div>
          </div>

          <div className="order-1 md:order-2 flex flex-col items-center justify-center bg-black border border-zinc-800 rounded-3xl p-12 relative shadow-2xl overflow-hidden">
             
             {/* 3D Orbit Visualizer */}
             {playing === 'orbit' && (
                 <div 
                    className="absolute w-4 h-4 bg-primary-500 rounded-full shadow-[0_0_20px_#06b6d4] z-20"
                    style={{
                        top: '50%',
                        left: '50%',
                        transform: `translate(-50%, -50%) translate(${Math.sin(orbitAngle) * 100}px, ${Math.cos(orbitAngle) * 40}px) scale(${1 + Math.cos(orbitAngle) * 0.3})`,
                        opacity: 0.8 + Math.cos(orbitAngle) * 0.2
                    }}
                 ></div>
             )}

             <div className="relative mb-12 z-10">
                <Headphones size={120} className="text-zinc-800" />
                
                <div className={`absolute top-1/2 -left-8 -translate-y-1/2 transition-opacity duration-200 ${playing === 'left' ? 'opacity-100' : 'opacity-0'}`}>
                   <Volume2 size={40} className="text-emerald-500 animate-pulse" />
                   <div className="absolute top-0 right-0 w-full h-full bg-emerald-500 blur-xl opacity-20"></div>
                </div>

                <div className={`absolute top-1/2 -right-8 -translate-y-1/2 transition-opacity duration-200 ${playing === 'right' ? 'opacity-100' : 'opacity-0'}`}>
                   <Volume2 size={40} className="text-emerald-500 animate-pulse transform scale-x-[-1]" />
                   <div className="absolute top-0 left-0 w-full h-full bg-emerald-500 blur-xl opacity-20"></div>
                </div>
                
                {playing === 'phase' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Waves size={64} className="text-zinc-500 animate-pulse opacity-50" />
                    </div>
                )}
             </div>

             <div className="flex gap-4 w-full z-10">
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
                className="mt-4 text-xs text-zinc-600 hover:text-zinc-400 font-mono uppercase tracking-widest z-10"
             >
                Test Center (Mono)
             </button>
          </div>

       </div>
    </div>
  );
}
