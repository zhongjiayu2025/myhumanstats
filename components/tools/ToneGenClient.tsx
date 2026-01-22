
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Headphones, Sliders, Waves, Radio, Activity, Music } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';
import { setupHiDPICanvas } from '@/lib/core';

// Standard Notes
const NOTES = [
    { name: 'C', freq: 16.35 }, { name: 'C#', freq: 17.32 }, { name: 'D', freq: 18.35 }, { name: 'D#', freq: 19.45 },
    { name: 'E', freq: 20.60 }, { name: 'F', freq: 21.83 }, { name: 'F#', freq: 23.12 }, { name: 'G', freq: 24.50 },
    { name: 'G#', freq: 25.96 }, { name: 'A', freq: 27.50 }, { name: 'A#', freq: 29.14 }, { name: 'B', freq: 30.87 }
];

const getNoteFromFreq = (freq: number) => {
    const A4 = 440;
    const C0 = A4 * Math.pow(2, -4.75);
    const h = Math.round(12 * Math.log2(freq / C0));
    const octave = Math.floor(h / 12);
    const n = h % 12;
    return NOTES[n] ? `${NOTES[n].name}${octave}` : '';
};

const PRESETS = [
  { name: 'Standard (440Hz)', left: 440, right: 440, type: 'sine' },
  { name: 'Brown Noise', type: 'brown' },
  { name: 'Pink Noise', type: 'pink' },
  { name: 'White Noise', type: 'white' },
  { name: 'Alpha (Relax)', left: 200, right: 210, type: 'binaural' }, 
  { name: 'Mosquito (17.4k)', left: 17400, right: 17400, type: 'sine' },
];

type WaveType = OscillatorType | 'white' | 'pink' | 'brown';

export default function ToneGenClient() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState<'mono' | 'binaural'>('mono');
  
  const [freqL, setFreqL] = useState(440);
  const [freqR, setFreqR] = useState(440);
  const [waveType, setWaveType] = useState<WaveType>('sine');
  const [volume, setVolume] = useState(0.5);
  
  // Advanced Features
  const [snapToNote, setSnapToNote] = useState(false);
  const [displayNote, setDisplayNote] = useState('A4');

  const [sweepMode, setSweepMode] = useState(false);
  const [startFreq, setStartFreq] = useState(20);
  const [endFreq, setEndFreq] = useState(20000);
  const [sweepDuration, setSweepDuration] = useState(10);
  const [currentSweepFreq, setCurrentSweepFreq] = useState(20);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscLRef = useRef<OscillatorNode | null>(null);
  const oscRRef = useRef<OscillatorNode | null>(null);
  const noiseRef = useRef<AudioBufferSourceNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  
  const sweepRafRef = useRef<number | null>(null);
  const visualizerRafRef = useRef<number | null>(null);
  const sweepStartTimeRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Noise Buffer Cache
  const noiseBufferRef = useRef<AudioBuffer | null>(null);

  const initAudio = () => {
     if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
     }
     if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
     return audioCtxRef.current;
  };

  // Create Noise Function
  const createNoise = (ctx: AudioContext, type: 'white'|'pink'|'brown') => {
      const bufferSize = ctx.sampleRate * 2; // 2 seconds loop
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      
      if (type === 'white') {
          for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
      } else if (type === 'pink') {
          let b0, b1, b2, b3, b4, b5, b6;
          b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
          for (let i = 0; i < bufferSize; i++) {
              const white = Math.random() * 2 - 1;
              b0 = 0.99886 * b0 + white * 0.0555179;
              b1 = 0.99332 * b1 + white * 0.0750759;
              b2 = 0.96900 * b2 + white * 0.1538520;
              b3 = 0.86650 * b3 + white * 0.3104856;
              b4 = 0.55000 * b4 + white * 0.5329522;
              b5 = -0.7616 * b5 - white * 0.0168980;
              output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
              output[i] *= 0.11; 
              b6 = white * 0.115926;
          }
      } else if (type === 'brown') {
          let lastOut = 0.0;
          for (let i = 0; i < bufferSize; i++) {
              const white = Math.random() * 2 - 1;
              output[i] = (lastOut + (0.02 * white)) / 1.02;
              lastOut = output[i];
              output[i] *= 3.5; 
          }
      }
      return buffer;
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
     analyser.fftSize = 2048;
     
     gain.gain.setValueAtTime(0, ctx.currentTime);
     gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.1);
     
     gain.connect(analyser);
     analyser.connect(ctx.destination);

     const isNoise = ['white', 'pink', 'brown'].includes(waveType);

     if (isNoise) {
         const buffer = createNoise(ctx, waveType as any);
         const source = ctx.createBufferSource();
         source.buffer = buffer;
         source.loop = true;
         source.connect(gain);
         source.start();
         noiseRef.current = source;
     } else {
         const oscL = ctx.createOscillator();
         oscL.type = waveType as OscillatorType;
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
             oscR.type = waveType as OscillatorType;
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
         
         // Update Frequencies immediately
         updateOscillators();
     }

     setIsPlaying(true);
     drawVisualizer();

     if (sweepMode && !isNoise) {
         // Sweep logic remains same
         const now = ctx.currentTime;
         const oscL = oscLRef.current!;
         
         oscL.frequency.setValueAtTime(startFreq, now);
         oscL.frequency.exponentialRampToValueAtTime(endFreq, now + sweepDuration);
         oscL.stop(now + sweepDuration);
         
         if (mode === 'binaural' && oscRRef.current) {
             oscRRef.current.frequency.setValueAtTime(startFreq, now);
             oscRRef.current.frequency.exponentialRampToValueAtTime(endFreq, now + sweepDuration);
             oscRRef.current.stop(now + sweepDuration);
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
     }
  };

  const stop = () => {
     if (sweepRafRef.current) cancelAnimationFrame(sweepRafRef.current);
     if (visualizerRafRef.current) cancelAnimationFrame(visualizerRafRef.current);
     
     if (audioCtxRef.current && gainRef.current) {
        const now = audioCtxRef.current.currentTime;
        gainRef.current.gain.cancelScheduledValues(now);
        gainRef.current.gain.linearRampToValueAtTime(0, now + 0.1);
        
        setTimeout(() => {
           oscLRef.current?.disconnect();
           oscRRef.current?.disconnect();
           noiseRef.current?.disconnect();
           gainRef.current?.disconnect();
           analyserRef.current?.disconnect();
           oscLRef.current = null;
           oscRRef.current = null;
           noiseRef.current = null;
           gainRef.current = null;
           analyserRef.current = null;
        }, 200);
     }
     setIsPlaying(false);
  };

  const updateOscillators = () => {
      if (!audioCtxRef.current) return;
      const now = audioCtxRef.current.currentTime;
      
      // Calculate Note if needed
      if (snapToNote) {
          setDisplayNote(getNoteFromFreq(freqL));
      }

      if (oscLRef.current) {
          oscLRef.current.frequency.setTargetAtTime(freqL, now, 0.1);
      }
      if (oscRRef.current) {
          oscRRef.current.frequency.setTargetAtTime(freqR, now, 0.1);
      }
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
          
          ctx.fillStyle = '#09090b'; 
          ctx.fillRect(0, 0, rect.width, rect.height);
          
          // Draw Grid
          ctx.strokeStyle = '#27272a';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, rect.height/2);
          ctx.lineTo(rect.width, rect.height/2);
          ctx.stroke();

          // Draw Wave
          ctx.lineWidth = 2;
          ctx.strokeStyle = ['white', 'pink', 'brown'].includes(waveType) ? '#a855f7' : '#06b6d4'; 
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
     if (isPlaying && !sweepMode) updateOscillators();
     if (gainRef.current && audioCtxRef.current) {
         gainRef.current.gain.setTargetAtTime(volume, audioCtxRef.current.currentTime, 0.1);
     }
  }, [freqL, freqR, volume, isPlaying, sweepMode, snapToNote]);

  const handlePreset = (p: any) => {
      stop();
      if (p.type === 'binaural') {
          setMode('binaural');
          setFreqL(p.left);
          setFreqR(p.right);
          setWaveType('sine');
      } else if (['white','pink','brown'].includes(p.type)) {
          setMode('mono');
          setWaveType(p.type);
      } else {
          setMode('mono');
          setFreqL(p.left);
          setFreqR(p.right);
          setWaveType(p.type as WaveType);
      }
      setSweepMode(false);
  };

  const handleNoteSnap = (val: number) => {
      // Find nearest standard frequency
      // A4 = 440. Freq = 440 * 2^((n-49)/12)
      // We can just round the input to nearest note in a lookup map for simplicity, or math it.
      // Math: n = 12 * log2(f/440) + 49
      if (!snapToNote) {
          setFreqL(val);
          if(mode === 'mono') setFreqR(val);
          return;
      }
      
      const n = 12 * Math.log2(val / 440);
      const roundedN = Math.round(n);
      const snappedFreq = 440 * Math.pow(2, roundedN / 12);
      
      setFreqL(snappedFreq);
      if(mode === 'mono') setFreqR(snappedFreq);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 animate-in fade-in">
       <Breadcrumbs items={[{ label: 'Tools', path: '/tools' }, { label: 'Tone Generator' }]} />

       <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          
          {/* Main Panel */}
          <div className="lg:col-span-8 bg-black border border-zinc-800 rounded-xl p-8 shadow-2xl relative overflow-hidden flex flex-col">
             
             {/* Visualizer */}
             <div className="relative w-full h-32 bg-zinc-950 border border-zinc-800 rounded-lg mb-6 overflow-hidden shadow-inner">
                 <canvas ref={canvasRef} className="w-full h-full" />
                 {!isPlaying && (
                     <div className="absolute inset-0 flex items-center justify-center text-[10px] text-zinc-600 font-mono tracking-widest pointer-events-none">
                         OUTPUT_DISABLED
                     </div>
                 )}
             </div>

             <div className="relative z-10 space-y-8">
                {/* Header controls */}
                <div className="flex items-center justify-between">
                   <div className="flex bg-zinc-900 rounded p-1 border border-zinc-800">
                       <button onClick={() => { setSweepMode(false); stop(); }} className={`px-4 py-1 text-xs font-bold rounded transition-colors ${!sweepMode ? 'bg-zinc-700 text-white' : 'text-zinc-500'}`}>Fixed</button>
                       <button onClick={() => { setSweepMode(true); setMode('mono'); stop(); }} className={`px-4 py-1 text-xs font-bold rounded transition-colors ${sweepMode ? 'bg-primary-600 text-white' : 'text-zinc-500'}`}>Sweep</button>
                   </div>
                   
                   <div className="flex items-center gap-2">
                       <span className="text-[10px] text-zinc-500 font-mono uppercase">Snap to Note</span>
                       <button onClick={() => setSnapToNote(!snapToNote)} className={`w-8 h-4 rounded-full relative transition-colors ${snapToNote ? 'bg-emerald-500' : 'bg-zinc-700'}`}>
                           <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${snapToNote ? 'translate-x-4' : ''}`}></div>
                       </button>
                   </div>
                </div>

                {!sweepMode ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-center group focus-within:border-primary-500 transition-colors relative overflow-hidden">
                                {snapToNote && <div className="absolute top-2 right-2 text-xs font-mono font-bold text-emerald-500">{getNoteData(freqL).note}</div>}
                                <div className="text-xs text-zinc-500 font-mono mb-2 group-focus-within:text-primary-400">{mode === 'binaural' ? 'LEFT' : 'FREQUENCY'}</div>
                                <input 
                                    type="number" 
                                    value={Math.round(freqL * 100) / 100}
                                    onChange={(e) => handleNoteSnap(Number(e.target.value))}
                                    className="bg-transparent text-3xl font-mono font-bold text-white text-center w-full focus:outline-none"
                                />
                                <div className="text-zinc-600 font-mono text-[10px]">HERTZ</div>
                            </div>
                            
                            {mode === 'binaural' ? (
                                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-center group focus-within:border-primary-500 transition-colors">
                                    <div className="text-xs text-zinc-500 font-mono mb-2 group-focus-within:text-primary-400">RIGHT</div>
                                    <input 
                                        type="number" 
                                        value={Math.round(freqR * 100) / 100}
                                        onChange={(e) => setFreqR(Number(e.target.value))}
                                        className="bg-transparent text-3xl font-mono font-bold text-white text-center w-full focus:outline-none"
                                    />
                                    <div className="text-zinc-600 font-mono text-[10px]">HERTZ</div>
                                </div>
                            ) : (
                                <div 
                                    onClick={() => setMode('binaural')}
                                    className="bg-zinc-900/30 border border-zinc-800 border-dashed rounded-lg p-6 flex flex-col justify-center items-center cursor-pointer hover:bg-zinc-900/50 transition-colors group"
                                >
                                    <Headphones size={24} className="text-zinc-600 group-hover:text-primary-500 mb-2"/>
                                    <span className="text-xs text-zinc-500 font-bold">ACTIVATE BINAURAL</span>
                                </div>
                            )}
                        </div>

                        {/* Frequency Sliders */}
                        <div>
                            <input 
                                type="range" min="20" max="2000" step="1" 
                                value={freqL} 
                                onChange={(e) => handleNoteSnap(Number(e.target.value))}
                                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-center">
                        <div className="text-xs text-zinc-500 font-mono mb-2">SWEEP FREQUENCY</div>
                        <div className="text-5xl font-mono font-bold text-primary-400 text-glow">
                            {isPlaying ? currentSweepFreq : startFreq} Hz
                        </div>
                        <div className="mt-4 flex gap-4">
                            <input type="number" value={startFreq} onChange={e => setStartFreq(Number(e.target.value))} className="w-20 bg-black border border-zinc-700 rounded text-center text-white text-sm" />
                            <div className="flex-1 h-1 bg-zinc-700 my-auto rounded"></div>
                            <input type="number" value={endFreq} onChange={e => setEndFreq(Number(e.target.value))} className="w-20 bg-black border border-zinc-700 rounded text-center text-white text-sm" />
                        </div>
                    </div>
                )}

                <div className="space-y-6 pt-4 border-t border-zinc-800">
                   <div className="flex items-center gap-4">
                       <span className="text-xs font-bold text-zinc-500 w-8 font-mono">VOL</span>
                       <input 
                           type="range" min="0" max="1" step="0.01"
                           value={volume}
                           onChange={(e) => setVolume(Number(e.target.value))}
                           className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
                       />
                   </div>

                   <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                      {['sine', 'square', 'sawtooth', 'triangle'].map(t => (
                         <button 
                            key={t}
                            onClick={() => { setWaveType(t as WaveType); if(['white','pink','brown'].includes(t)) stop(); }}
                            className={`py-2 text-[10px] font-bold uppercase rounded border transition-all ${waveType === t ? 'bg-zinc-800 border-primary-500 text-primary-400' : 'bg-zinc-950 border-zinc-800 text-zinc-600 hover:text-zinc-400'}`}
                         >
                            {t.slice(0,4)}
                         </button>
                      ))}
                      {['white', 'pink', 'brown'].map(t => (
                         <button 
                            key={t}
                            onClick={() => { setWaveType(t as WaveType); setMode('mono'); stop(); }}
                            className={`py-2 text-[10px] font-bold uppercase rounded border transition-all ${waveType === t ? 'bg-zinc-800 border-purple-500 text-purple-400' : 'bg-zinc-950 border-zinc-800 text-zinc-600 hover:text-zinc-400'}`}
                         >
                            {t}
                         </button>
                      ))}
                   </div>

                   <button 
                      onClick={togglePlay}
                      className={`w-full py-4 rounded-lg font-bold text-lg uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-[0.98] ${isPlaying ? 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_#ef4444]' : 'bg-white hover:bg-zinc-200 text-black shadow-[0_0_20px_white]'}`}
                   >
                      {isPlaying ? <><Square size={20} fill="currentColor"/> SILENCE</> : <><Play size={20} fill="currentColor"/> GENERATE</>}
                   </button>
                </div>
             </div>
          </div>

          {/* Presets Panel */}
          <div className="lg:col-span-4 space-y-6">
             <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
                 <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Sliders size={16} /> Quick Presets</h3>
                 <div className="space-y-2">
                     {PRESETS.map((p, i) => (
                         <button 
                            key={i}
                            onClick={() => handlePreset(p)}
                            className="w-full flex items-center justify-between p-3 bg-black border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900 rounded text-xs text-zinc-400 hover:text-white transition-colors group"
                         >
                             <span className="font-bold">{p.name}</span>
                             <span className="text-[10px] font-mono bg-zinc-800 px-2 py-0.5 rounded text-zinc-500 group-hover:text-zinc-300 uppercase">{p.type || 'sine'}</span>
                         </button>
                     ))}
                 </div>
             </div>
             
             <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
                 <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Music size={16} /> Note Reference</h3>
                 <div className="grid grid-cols-3 gap-2 text-center">
                     {[261.63, 440, 880].map(f => (
                         <button key={f} onClick={() => { setFreqL(f); setFreqR(f); setWaveType('triangle'); }} className="p-2 bg-black border border-zinc-800 hover:border-primary-500 rounded">
                             <div className="text-xs font-bold text-white">{getNoteFromFreq(f)}</div>
                             <div className="text-[9px] text-zinc-500">{f}Hz</div>
                         </button>
                     ))}
                 </div>
             </div>
          </div>
       </div>
    </div>
  );
}

// Helper needed inside component or imported
const getNoteData = (freq: number) => {
    // Basic helper to display note name
    const A4 = 440;
    const C0 = A4 * Math.pow(2, -4.75);
    const h = Math.round(12 * Math.log2(freq / C0));
    const n = h % 12;
    return { note: NOTES[n]?.name || '' };
};
