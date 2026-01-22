
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Headphones, Sliders, Waves, Radio, Activity } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';
import { setupHiDPICanvas } from '@/lib/core';

const PRESETS = [
  { name: 'Standard (440Hz)', left: 440, right: 440 },
  { name: 'Delta (Sleep)', left: 200, right: 202 }, 
  { name: 'Theta (Deep Med)', left: 200, right: 206 },
  { name: 'Alpha (Relax)', left: 200, right: 210 }, 
  { name: 'Beta (Focus)', left: 200, right: 220 },
  { name: 'Mosquito (17.4k)', left: 17400, right: 17400 },
];

export default function ToneGenClient() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState<'mono' | 'binaural'>('mono');
  
  const [freqL, setFreqL] = useState(440);
  const [freqR, setFreqR] = useState(440);
  const [waveType, setWaveType] = useState<OscillatorType>('sine');
  const [volume, setVolume] = useState(0.5);
  
  const [sweepMode, setSweepMode] = useState(false);
  const [startFreq, setStartFreq] = useState(20);
  const [endFreq, setEndFreq] = useState(20000);
  const [sweepDuration, setSweepDuration] = useState(10);
  const [currentSweepFreq, setCurrentSweepFreq] = useState(20);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscLRef = useRef<OscillatorNode | null>(null);
  const oscRRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  
  const sweepRafRef = useRef<number | null>(null);
  const visualizerRafRef = useRef<number | null>(null);
  const sweepStartTimeRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const initAudio = () => {
     if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
     }
     if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
     return audioCtxRef.current;
  };

  const togglePlay = () => {
     if (isPlaying) stop();
     else start();
  };

  const start = () => {
     const ctx = initAudio();
     const gain = ctx.createGain();
     const analyser = ctx.createAnalyser();
     
     gainRef.current = gain;
     analyserRef.current = analyser;
     
     // Config Analyser
     analyser.fftSize = 2048;
     
     gain.gain.setValueAtTime(0, ctx.currentTime);
     gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.1);
     
     // Route: Osc -> Gain -> Analyser -> Destination
     gain.connect(analyser);
     analyser.connect(ctx.destination);

     const oscL = ctx.createOscillator();
     oscL.type = waveType;
     oscL.connect(mode === 'binaural' ? ctx.createStereoPanner() : gain); 
     
     if (mode === 'binaural') {
         const pannerL = ctx.createStereoPanner();
         pannerL.pan.value = -1;
         pannerL.connect(gain);
         
         const pannerR = ctx.createStereoPanner();
         pannerR.pan.value = 1;
         pannerR.connect(gain);
         
         oscL.connect(pannerL);
         
         const oscR = ctx.createOscillator();
         oscR.type = waveType;
         oscR.connect(pannerR);
         
         oscL.start();
         oscR.start();
         
         oscLRef.current = oscL;
         oscRRef.current = oscR;
     } else {
         oscL.connect(gain);
         oscL.start();
         oscLRef.current = oscL;
     }

     setIsPlaying(true);
     drawVisualizer();

     if (sweepMode) {
         const now = ctx.currentTime;
         if (mode === 'mono') {
             oscL.frequency.setValueAtTime(startFreq, now);
             oscL.frequency.exponentialRampToValueAtTime(endFreq, now + sweepDuration);
             oscL.stop(now + sweepDuration);
         } else {
             oscL.frequency.setValueAtTime(startFreq, now);
             oscL.frequency.exponentialRampToValueAtTime(endFreq, now + sweepDuration);
             if (oscRRef.current) {
                 oscRRef.current.frequency.setValueAtTime(startFreq, now);
                 oscRRef.current.frequency.exponentialRampToValueAtTime(endFreq, now + sweepDuration);
                 oscRRef.current.stop(now + sweepDuration);
             }
             oscL.stop(now + sweepDuration);
         }
         
         sweepStartTimeRef.current = performance.now();
         const loop = () => {
             const elapsed = (performance.now() - sweepStartTimeRef.current) / 1000;
             if (elapsed >= sweepDuration) {
                 stop();
                 return;
             }
             const progress = elapsed / sweepDuration;
             const curr = startFreq * Math.pow(endFreq / startFreq, progress);
             setCurrentSweepFreq(Math.round(curr));
             sweepRafRef.current = requestAnimationFrame(loop);
         };
         sweepRafRef.current = requestAnimationFrame(loop);

     } else {
         if (oscLRef.current) oscLRef.current.frequency.value = freqL;
         if (oscRRef.current) oscRRef.current.frequency.value = freqR;
     }
  };

  const stop = () => {
     if (sweepRafRef.current) cancelAnimationFrame(sweepRafRef.current);
     if (visualizerRafRef.current) cancelAnimationFrame(visualizerRafRef.current);
     
     if (audioCtxRef.current && gainRef.current) {
        const now = audioCtxRef.current.currentTime;
        gainRef.current.gain.cancelScheduledValues(now);
        gainRef.current.gain.linearRampToValueAtTime(0, now + 0.1);
        
        const stopTime = now + 0.15;
        try {
            if (oscLRef.current) oscLRef.current.stop(stopTime);
            if (oscRRef.current) oscRRef.current.stop(stopTime);
        } catch(e) {}
        
        setTimeout(() => {
           oscLRef.current?.disconnect();
           oscRRef.current?.disconnect();
           gainRef.current?.disconnect();
           analyserRef.current?.disconnect();
           oscLRef.current = null;
           oscRRef.current = null;
           gainRef.current = null;
           analyserRef.current = null;
        }, 200);
     }
     setIsPlaying(false);
  };

  const drawVisualizer = () => {
      const canvas = canvasRef.current;
      const analyser = analyserRef.current;
      if (!canvas || !analyser) return;

      const rect = canvas.getBoundingClientRect();
      const ctx = setupHiDPICanvas(canvas, rect.width, rect.height);
      if (!ctx) return;

      const bufferLength = analyser.fftSize;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
          analyser.getByteTimeDomainData(dataArray);
          
          ctx.fillStyle = '#09090b'; // Match bg-black/zinc-950
          ctx.fillRect(0, 0, rect.width, rect.height);
          
          // Draw Grid
          ctx.strokeStyle = '#27272a';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, rect.height/2);
          ctx.lineTo(rect.width, rect.height/2);
          ctx.stroke();

          ctx.lineWidth = 2;
          ctx.strokeStyle = '#06b6d4'; // Primary-500
          ctx.beginPath();

          const sliceWidth = rect.width / bufferLength;
          let x = 0;

          for(let i = 0; i < bufferLength; i++) {
              const v = dataArray[i] / 128.0;
              const y = v * (rect.height / 2);

              if(i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);

              x += sliceWidth;
          }

          ctx.lineTo(canvas.width, canvas.height/2);
          ctx.stroke();

          if (isPlaying) {
              visualizerRafRef.current = requestAnimationFrame(draw);
          }
      };
      draw();
  };

  useEffect(() => {
     if (!isPlaying || sweepMode || !audioCtxRef.current) return;
     const now = audioCtxRef.current.currentTime;

     if (oscLRef.current) {
         oscLRef.current.frequency.setTargetAtTime(freqL, now, 0.1);
         oscLRef.current.type = waveType;
     }
     if (oscRRef.current && mode === 'binaural') {
         oscRRef.current.frequency.setTargetAtTime(freqR, now, 0.1);
         oscRRef.current.type = waveType;
     }
     if (gainRef.current) {
         gainRef.current.gain.setTargetAtTime(volume, now, 0.1);
     }
  }, [freqL, freqR, volume, waveType, mode, isPlaying, sweepMode]);

  const loadPreset = (p: typeof PRESETS[0]) => {
      setSweepMode(false);
      setFreqL(p.left);
      if (p.left !== p.right) {
          setMode('binaural');
          setFreqR(p.right);
      } else {
          setMode('mono');
          setFreqR(p.right);
      }
  };

  const beatFreq = Math.abs(freqL - freqR).toFixed(1);

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 animate-in fade-in">
       <Breadcrumbs items={[{ label: 'Tools', path: '/tools' }, { label: 'Tone Generator' }]} />

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          
          {/* Controls Panel */}
          <div className="bg-black border border-zinc-800 rounded-xl p-8 shadow-2xl relative overflow-hidden flex flex-col">
             
             {/* Oscilloscope Screen */}
             <div className="relative w-full h-32 bg-zinc-950 border border-zinc-800 rounded-lg mb-6 overflow-hidden shadow-inner">
                 <canvas ref={canvasRef} className="w-full h-full" />
                 {!isPlaying && (
                     <div className="absolute inset-0 flex items-center justify-center text-[10px] text-zinc-600 font-mono tracking-widest pointer-events-none">
                         SIGNAL_OFFLINE
                     </div>
                 )}
                 {isPlaying && (
                     <div className="absolute top-2 right-2 flex items-center gap-1">
                         <Activity size={10} className="text-primary-500 animate-pulse" />
                         <span className="text-[9px] text-primary-500 font-mono">LIVE_OUTPUT</span>
                     </div>
                 )}
             </div>

             <div className="relative z-10 space-y-8">
                <div className="flex items-center justify-between mb-2">
                   <div className="flex items-center gap-3">
                       <h1 className="text-2xl font-bold text-white">Signal Gen</h1>
                   </div>
                   <div className="flex bg-zinc-900 rounded p-1 border border-zinc-800">
                       <button onClick={() => { setSweepMode(false); stop(); }} className={`px-3 py-1 text-xs rounded ${!sweepMode ? 'bg-zinc-700 text-white' : 'text-zinc-500'}`}>Manual</button>
                       <button onClick={() => { setSweepMode(true); setMode('mono'); stop(); }} className={`px-3 py-1 text-xs rounded ${sweepMode ? 'bg-primary-600 text-white' : 'text-zinc-500'}`}>Sweep</button>
                   </div>
                </div>

                {!sweepMode ? (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="flex justify-center mb-4">
                            <div className="flex bg-zinc-900 rounded p-1 border border-zinc-800">
                                <button onClick={() => { setMode('mono'); }} className={`px-3 py-1 text-xs rounded ${mode === 'mono' ? 'bg-zinc-700 text-white' : 'text-zinc-500'}`}>Mono</button>
                                <button onClick={() => { setMode('binaural'); }} className={`px-3 py-1 text-xs rounded ${mode === 'binaural' ? 'bg-primary-600 text-white' : 'text-zinc-500'}`}>Binaural</button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-center group focus-within:border-primary-500 transition-colors">
                                <div className="text-xs text-zinc-500 font-mono mb-2 group-focus-within:text-primary-400">{mode === 'binaural' ? 'LEFT CH' : 'FREQUENCY'}</div>
                                <input 
                                    type="number" 
                                    value={freqL}
                                    onChange={(e) => setFreqL(Number(e.target.value))}
                                    className="bg-transparent text-4xl font-mono font-bold text-white text-center w-full focus:outline-none"
                                />
                                <div className="text-zinc-600 font-mono text-[10px]">HERTZ</div>
                            </div>
                            
                            {mode === 'binaural' ? (
                                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-center group focus-within:border-primary-500 transition-colors">
                                    <div className="text-xs text-zinc-500 font-mono mb-2 group-focus-within:text-primary-400">RIGHT CH</div>
                                    <input 
                                        type="number" 
                                        value={freqR}
                                        onChange={(e) => setFreqR(Number(e.target.value))}
                                        className="bg-transparent text-4xl font-mono font-bold text-white text-center w-full focus:outline-none"
                                    />
                                    <div className="text-zinc-600 font-mono text-[10px]">HERTZ</div>
                                </div>
                            ) : (
                                <div className="bg-zinc-900/30 border border-zinc-800 rounded-lg p-6 flex flex-col justify-center items-center opacity-50">
                                    <span className="text-xs text-zinc-500">Enable Binaural</span>
                                </div>
                            )}
                        </div>

                        {mode === 'binaural' && (
                            <div className="text-center p-2 bg-primary-900/20 border border-primary-900/50 rounded">
                                <div className="text-xs text-primary-400 font-mono uppercase tracking-widest">Beat Frequency</div>
                                <div className="text-xl font-bold text-white">{beatFreq} Hz</div>
                            </div>
                        )}

                        <div>
                            <input 
                                type="range" min="20" max="1000" step="1" 
                                value={freqL} 
                                onChange={(e) => setFreqL(Number(e.target.value))}
                                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
                            />
                        </div>
                        {mode === 'binaural' && (
                            <div>
                                <input 
                                    type="range" min="20" max="1000" step="1" 
                                    value={freqR} 
                                    onChange={(e) => setFreqR(Number(e.target.value))}
                                    className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
                                />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-center mb-6">
                            <div className="text-xs text-zinc-500 font-mono mb-2">CURRENT SIGNAL</div>
                            <div className="text-5xl font-mono font-bold text-primary-400 text-glow">
                                {isPlaying ? currentSweepFreq : startFreq}
                            </div>
                            <div className="text-zinc-600 font-mono text-[10px]">HERTZ</div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-zinc-500 uppercase font-bold">Start (Hz)</label>
                                <input 
                                    type="number" 
                                    value={startFreq} 
                                    onChange={(e) => setStartFreq(Number(e.target.value))}
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white font-mono focus:border-primary-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-zinc-500 uppercase font-bold">End (Hz)</label>
                                <input 
                                    type="number" 
                                    value={endFreq} 
                                    onChange={(e) => setEndFreq(Number(e.target.value))}
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white font-mono focus:border-primary-500 outline-none"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="text-xs text-zinc-500 uppercase font-bold mb-1 block">Duration: {sweepDuration}s</label>
                            <input 
                                type="range" min="1" max="60" step="1"
                                value={sweepDuration}
                                onChange={(e) => setSweepDuration(Number(e.target.value))}
                                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
                            />
                        </div>
                    </div>
                )}

                <div className="space-y-6 pt-4 border-t border-zinc-800">
                   <div className="flex items-center gap-4">
                       <span className="text-xs font-bold text-zinc-500 w-12 font-mono">VOL</span>
                       <input 
                           type="range" min="0" max="1" step="0.01"
                           value={volume}
                           onChange={(e) => setVolume(Number(e.target.value))}
                           className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
                       />
                   </div>

                   <div className="grid grid-cols-4 gap-2">
                      {['sine', 'square', 'sawtooth', 'triangle'].map(t => (
                         <button 
                            key={t}
                            onClick={() => setWaveType(t as OscillatorType)}
                            className={`py-2 text-[10px] font-bold uppercase rounded border transition-all ${waveType === t ? 'bg-zinc-800 border-primary-500 text-primary-400' : 'bg-zinc-950 border-zinc-800 text-zinc-600 hover:text-zinc-400'}`}
                         >
                            {t.slice(0,4)}
                         </button>
                      ))}
                   </div>

                   <button 
                      onClick={togglePlay}
                      className={`w-full py-4 rounded-lg font-bold text-lg uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-[0.98] ${isPlaying ? 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_#ef4444]' : 'bg-white hover:bg-zinc-200 text-black shadow-[0_0_20px_white]'}`}
                   >
                      {isPlaying ? <><Square size={20} fill="currentColor"/> STOP</> : <><Play size={20} fill="currentColor"/> {sweepMode ? 'START SWEEP' : 'GENERATE'}</>}
                   </button>
                </div>
             </div>
          </div>

          {/* Sidebar / Info */}
          <div className="space-y-8">
             {!sweepMode && (
                 <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                     <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Sliders size={16} /> Quick Presets</h3>
                     <div className="grid grid-cols-2 gap-2">
                         {PRESETS.map(p => (
                             <button 
                                key={p.name}
                                onClick={() => loadPreset(p)}
                                className="text-left p-3 bg-black border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900 rounded text-xs text-zinc-400 hover:text-white transition-colors"
                             >
                                 {p.name}
                             </button>
                         ))}
                     </div>
                 </div>
             )}

             {sweepMode && (
                 <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                     <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Waves size={16} /> Sweep Info</h3>
                     <p className="text-xs text-zinc-400 leading-relaxed">
                         Frequency sweeps are used to test the frequency response of speakers and headphones. 
                         <br/><br/>
                         <strong>Bass Test:</strong> 20Hz - 200Hz<br/>
                         <strong>Full Range:</strong> 20Hz - 20,000Hz
                     </p>
                 </div>
             )}
          </div>
       </div>

       {/* SEO Rich Content */}
       <article className="prose prose-invert max-w-none border-t border-zinc-800 pt-12">
           <h2 className="flex items-center gap-3 text-2xl font-bold text-white">
               <Radio className="text-primary-500" />
               The Science of Frequency
           </h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               <div>
                   <h3 className="text-lg font-bold text-white mt-6 mb-2">Binaural Beats Explained</h3>
                   <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                       When two tones with slightly different frequencies are played in each ear (e.g., 440Hz and 444Hz), the brain perceives a third "phantom" pulsing sound. This is called a <strong>Binaural Beat</strong>. The frequency of the beat is the difference between the two tones (4Hz).
                   </p>
                   <div className="flex items-center gap-2 text-primary-400 text-xs font-bold bg-primary-900/10 p-3 rounded border border-primary-900/30">
                        <Headphones size={16} />
                        HEADPHONES REQUIRED FOR BINAURAL MODE
                   </div>
               </div>
               <div>
                   <h3 className="text-lg font-bold text-white mt-6 mb-2">Brainwave Entrainment</h3>
                   <ul className="list-disc pl-5 space-y-2 text-zinc-400 text-sm">
                       <li><strong>Delta (1-4Hz):</strong> Deep sleep, healing.</li>
                       <li><strong>Theta (4-8Hz):</strong> Meditation, creativity, REM sleep.</li>
                       <li><strong>Alpha (8-14Hz):</strong> Relaxation, light focus.</li>
                       <li><strong>Beta (14-30Hz):</strong> Active concentration, alertness.</li>
                   </ul>
               </div>
           </div>
       </article>
    </div>
  );
}
