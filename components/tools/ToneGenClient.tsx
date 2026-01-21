
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Headphones, Sliders, Waves } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';

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
  const sweepRafRef = useRef<number | null>(null);
  const sweepStartTimeRef = useRef<number>(0);

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
     gainRef.current = gain;
     
     gain.gain.setValueAtTime(0, ctx.currentTime);
     gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.1);
     gain.connect(ctx.destination);

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
           oscLRef.current = null;
           oscRRef.current = null;
           gainRef.current = null;
        }, 200);
     }
     setIsPlaying(false);
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

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          <div className="bg-black border border-zinc-800 rounded-xl p-8 shadow-2xl relative overflow-hidden">
             
             <div className="relative z-10 space-y-8">
                <div className="flex items-center justify-between mb-2">
                   <div className="flex items-center gap-3">
                       <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-emerald-500 animate-pulse' : 'bg-red-500 opacity-20'}`}></div>
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
                            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-center">
                                <div className="text-xs text-zinc-500 font-mono mb-2">{mode === 'binaural' ? 'LEFT EAR' : 'FREQUENCY'}</div>
                                <input 
                                    type="number" 
                                    value={freqL}
                                    onChange={(e) => setFreqL(Number(e.target.value))}
                                    className="bg-transparent text-4xl font-mono font-bold text-white text-center w-full focus:outline-none"
                                />
                                <div className="text-zinc-600 font-mono text-[10px]">HERTZ</div>
                            </div>
                            
                            {mode === 'binaural' ? (
                                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-center">
                                    <div className="text-xs text-zinc-500 font-mono mb-2">RIGHT EAR</div>
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
                                    <span className="text-xs text-zinc-500">Enable Binaural Mode to split channels</span>
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
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white font-mono"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-zinc-500 uppercase font-bold">End (Hz)</label>
                                <input 
                                    type="number" 
                                    value={endFreq} 
                                    onChange={(e) => setEndFreq(Number(e.target.value))}
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white font-mono"
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
                            className={`py-2 text-[10px] font-bold uppercase rounded border ${waveType === t ? 'bg-zinc-800 border-zinc-600 text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-600 hover:text-zinc-400'}`}
                         >
                            {t}
                         </button>
                      ))}
                   </div>

                   <button 
                      onClick={togglePlay}
                      className={`w-full py-4 rounded-lg font-bold text-lg uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${isPlaying ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-white hover:bg-zinc-200 text-black'}`}
                   >
                      {isPlaying ? <><Square size={20} fill="currentColor"/> STOP</> : <><Play size={20} fill="currentColor"/> {sweepMode ? 'START SWEEP' : 'GENERATE'}</>}
                   </button>
                </div>
             </div>
          </div>

          <div className="space-y-8">
             {!sweepMode && (
                 <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                     <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Sliders size={16} /> Quick Presets</h3>
                     <div className="grid grid-cols-2 gap-2">
                         {PRESETS.map(p => (
                             <button 
                                key={p.name}
                                onClick={() => loadPreset(p)}
                                className="text-left p-3 bg-black border border-zinc-800 hover:border-zinc-600 rounded text-xs text-zinc-400 hover:text-white transition-colors"
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

             <article className="prose prose-invert prose-sm text-zinc-400">
                <h2 className="text-white">Binaural Beats Guide</h2>
                <p>
                   When two slightly different frequencies are played in each ear (using headphones), the brain perceives a third "phantom" sound called a <strong>Binaural Beat</strong>.
                </p>
                <div className="flex items-center gap-2 text-primary-400 text-xs font-bold bg-primary-900/10 p-3 rounded border border-primary-900/30">
                    <Headphones size={16} />
                    HEADPHONES REQUIRED FOR BINAURAL MODE
                </div>
             </article>
          </div>

       </div>
    </div>
  );
}
