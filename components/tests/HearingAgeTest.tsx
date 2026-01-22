
import React, { useState, useRef, useEffect } from 'react';
import { RefreshCcw, Check, Volume2, ArrowRight, Minus, Plus, AlertTriangle, Info, Mic, Music2 } from 'lucide-react';
import { saveStat } from '../../lib/core';
import ShareCard from '../ShareCard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import Link from 'next/link';

type EarSide = 'left' | 'right';

// ISO 7029 Approximation Data
const AGE_DATA = [
  { age: 10, freq: 20000 },
  { age: 20, freq: 17000 },
  { age: 30, freq: 15000 },
  { age: 40, freq: 12000 },
  { age: 50, freq: 10500 },
  { age: 60, freq: 8000 },
  { age: 70, freq: 6000 },
  { age: 80, freq: 4000 },
];

const HearingAgeTest: React.FC = () => {
  // System State
  const [phase, setPhase] = useState<'env-check' | 'calibration' | 'testing' | 'report'>('env-check');
  const [activeSide, setActiveSide] = useState<EarSide>('left');
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  
  // Audio State
  const [isPlaying, setIsPlaying] = useState(false);
  const [frequency, setFrequency] = useState(20000);
  const [noiseLevel, setNoiseLevel] = useState(0); // For environment check
  
  // Data State
  const [results, setResults] = useState<{left: number | null, right: number | null}>({ left: null, right: null });
  const [vizData, setVizData] = useState<number[]>(new Array(32).fill(0));

  // Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const pannerRef = useRef<StereoPannerNode | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  
  // Environment Check Refs
  const micStreamRef = useRef<MediaStream | null>(null);
  const micRafRef = useRef<number | null>(null);
  
  // Loop Refs
  const visualizerRafRef = useRef<number | null>(null);
  const sweepRafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Constants
  const START_FREQ = 22000;
  const END_FREQ = 8000;
  const SWEEP_DURATION = 20000; // 20s sweep

  // --- Initialization & Cleanup ---
  useEffect(() => {
    // Just initialize audio context to unlock it if possible
    const tempCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    tempCtx.close();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase !== 'testing') return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (isPlaying) stopAndRecord();
        else startSweep();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      stopAudio();
      stopEnvCheck();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [phase, isPlaying, activeSide]);

  // --- Phase 0: Environment Check ---
  const startEnvCheck = async () => {
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          micStreamRef.current = stream;
          const ctx = new AudioContext();
          const src = ctx.createMediaStreamSource(stream);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 256;
          src.connect(analyser);
          
          const buffer = new Uint8Array(analyser.frequencyBinCount);
          
          const loop = () => {
              analyser.getByteFrequencyData(buffer);
              if (buffer.length > 0) {
                  const avg = buffer.reduce((a,b)=>a+b) / buffer.length;
                  setNoiseLevel(avg);
              }
              micRafRef.current = requestAnimationFrame(loop);
          };
          loop();
      } catch (e) {
          // If mic denied, skip check
          setPhase('calibration');
      }
  };

  const stopEnvCheck = () => {
      if (micRafRef.current) cancelAnimationFrame(micRafRef.current);
      if (micStreamRef.current) micStreamRef.current.getTracks().forEach(t => t.stop());
  };

  // --- Core Audio Engine ---
  const initAudio = () => {
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  };

  const startTone = (freq: number, type: OscillatorType = 'sine', side: EarSide | 'both' = 'both', vol: number = 0.1) => {
      const ctx = initAudio();
      if (oscillatorRef.current) try { oscillatorRef.current.stop(); oscillatorRef.current.disconnect(); } catch(e){}
      if (gainRef.current) try { gainRef.current.disconnect(); } catch(e){}

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const panner = ctx.createStereoPanner();
      const analyzer = ctx.createAnalyser();

      osc.type = type;
      osc.frequency.value = freq;
      panner.pan.value = side === 'left' ? -1 : side === 'right' ? 1 : 0;
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.05);

      analyzer.fftSize = 256;
      osc.connect(gain);
      gain.connect(panner);
      panner.connect(analyzer);
      panner.connect(ctx.destination);

      osc.start();
      oscillatorRef.current = osc;
      gainRef.current = gain;
      pannerRef.current = panner;
      analyzerRef.current = analyzer;
      
      setIsPlaying(true);
      drawVisualizer();
  };

  const stopAudio = () => {
    if (sweepRafRef.current) { cancelAnimationFrame(sweepRafRef.current); sweepRafRef.current = null; }
    if (visualizerRafRef.current) { cancelAnimationFrame(visualizerRafRef.current); visualizerRafRef.current = null; }

    if (oscillatorRef.current && audioContextRef.current && gainRef.current) {
        const ctx = audioContextRef.current;
        try {
            gainRef.current.gain.cancelScheduledValues(ctx.currentTime);
            gainRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.05);
            oscillatorRef.current.stop(ctx.currentTime + 0.06);
        } catch (e) {}
    }
    setIsPlaying(false);
    setVizData(new Array(32).fill(0));
  };

  const drawVisualizer = () => {
      if (!analyzerRef.current || !oscillatorRef.current) return;
      const bufferLength = analyzerRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyzerRef.current.getByteFrequencyData(dataArray);
      const bars = 32;
      const step = Math.floor(bufferLength / bars);
      const lowRes = [];
      for(let i=0; i<bars; i++) {
          let sum = 0;
          for(let j=0; j<step; j++) sum += dataArray[i*step + j];
          lowRes.push(sum/step);
      }
      setVizData(lowRes);
      visualizerRafRef.current = requestAnimationFrame(drawVisualizer);
  };

  const startSweep = () => {
      setFrequency(START_FREQ);
      startTone(START_FREQ, 'sine', activeSide, 0.1);
      if (mode === 'auto') {
          startTimeRef.current = Date.now();
          const animateSweep = () => {
              if (!oscillatorRef.current || !audioContextRef.current) return;
              const elapsed = Date.now() - startTimeRef.current;
              const progress = Math.min(elapsed / SWEEP_DURATION, 1);
              const currentFreq = START_FREQ - (progress * (START_FREQ - END_FREQ));
              setFrequency(Math.round(currentFreq));
              oscillatorRef.current.frequency.setValueAtTime(currentFreq, audioContextRef.current.currentTime);
              if (progress < 1) sweepRafRef.current = requestAnimationFrame(animateSweep);
              else stopAudio();
          };
          if (sweepRafRef.current) cancelAnimationFrame(sweepRafRef.current);
          sweepRafRef.current = requestAnimationFrame(animateSweep);
      }
  };

  const stopAndRecord = () => {
      stopAudio();
      if (mode === 'auto') {
          setMode('manual');
      } else {
          setResults(prev => ({ ...prev, [activeSide]: frequency }));
      }
  };

  const manualAdjust = (delta: number) => {
      const newFreq = Math.min(START_FREQ, Math.max(END_FREQ, frequency + delta));
      setFrequency(newFreq);
      if (isPlaying && oscillatorRef.current && audioContextRef.current) {
          oscillatorRef.current.frequency.setValueAtTime(newFreq, audioContextRef.current.currentTime);
      }
  };

  const getAgeFromFreq = (freq: number) => {
      if (freq > 19000) return "< 20";
      if (freq > 17000) return "20 - 24";
      if (freq > 16000) return "25 - 29";
      if (freq > 15000) return "30 - 39";
      if (freq > 12000) return "40 - 49";
      if (freq > 10000) return "50 - 59";
      return "60+";
  };

  // --- RENDERERS ---

  if (phase === 'env-check') {
      return (
          <div className="max-w-xl mx-auto py-8 px-4 animate-in fade-in">
              <div className="tech-border bg-black p-8 clip-corner-lg border-zinc-800 text-center">
                  <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Mic size={32} className={noiseLevel > 30 ? "text-red-500" : "text-emerald-500"} />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">Environment Calibration</h2>
                  <p className="text-zinc-400 text-sm mb-8">
                      Hearing tests require silence. We are measuring your background noise floor.
                  </p>
                  
                  <div className="bg-zinc-900/50 p-6 rounded border border-zinc-800 mb-8">
                      <div className="flex justify-between text-xs text-zinc-500 uppercase font-mono mb-2">
                          <span>Quiet</span>
                          <span>Noisy</span>
                      </div>
                      <div className="h-4 bg-zinc-800 rounded-full overflow-hidden">
                          <div 
                             className={`h-full transition-all duration-200 ${noiseLevel > 40 ? 'bg-red-500' : noiseLevel > 20 ? 'bg-yellow-500' : 'bg-emerald-500'}`} 
                             style={{ width: `${Math.min(100, noiseLevel * 2)}%` }}
                          ></div>
                      </div>
                      <div className="mt-4 text-xs font-bold text-white">
                          Current Status: {noiseLevel > 30 ? <span className="text-red-400">TOO LOUD</span> : <span className="text-emerald-400">OPTIMAL</span>}
                      </div>
                  </div>

                  <div className="flex gap-4">
                      <button onClick={startEnvCheck} className="btn-secondary flex-1">Activate Mic</button>
                      <button onClick={() => { stopEnvCheck(); setPhase('calibration'); }} className="btn-primary flex-1">Continue Anyway</button>
                  </div>
              </div>
          </div>
      );
  }

  if (phase === 'calibration') {
      return (
          <div className="max-w-xl mx-auto py-8 px-4 animate-in fade-in">
              <div className="tech-border bg-black p-8 clip-corner-lg border-primary-500/30 text-center">
                  <Volume2 size={48} className="mx-auto text-primary-500 mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-4">Volume Safety</h2>
                  <div className="bg-red-900/10 border border-red-500/30 p-4 rounded text-left mb-6 text-sm text-red-200">
                      <AlertTriangle size={16} className="inline mr-2" />
                      Set your device volume to 50%. Do not exceed this level.
                  </div>
                  <div className="bg-zinc-900/50 p-6 rounded mb-8">
                      <button 
                          onClick={() => isPlaying ? stopAudio() : startTone(1000, 'sine', 'both', 0.1)}
                          className={`w-full py-4 rounded font-bold uppercase tracking-widest ${isPlaying ? 'bg-red-500 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-white'}`}
                      >
                          {isPlaying ? "Stop Tone" : "Play 1kHz Reference"}
                      </button>
                  </div>
                  <button onClick={() => { stopAudio(); setPhase('testing'); }} className="btn-primary w-full">Start Test</button>
              </div>
          </div>
      );
  }

  if (phase === 'report') {
      const bestFreq = Math.max(results.left || 0, results.right || 0);
      saveStat('hearing-age', Math.max(0, Math.min(100, Math.round(((bestFreq - END_FREQ) / (START_FREQ - END_FREQ)) * 100))));

      return (
          <div className="max-w-3xl mx-auto animate-in zoom-in duration-500">
              <div className="tech-border bg-black p-8 clip-corner-lg relative overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                      <div>
                          <h2 className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-1">Audiometry Report</h2>
                          <div className="text-3xl font-bold text-white mb-6">Binaural Analysis</div>
                          <div className="mb-6">
                              <div className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-1">Biological Age</div>
                              <div className="text-5xl font-bold text-primary-400 text-glow">{getAgeFromFreq(bestFreq)} <span className="text-lg text-zinc-600">YRS</span></div>
                          </div>
                          <div className="flex gap-4">
                              <div className="bg-zinc-900 p-3 rounded w-1/2 border-l-4 border-emerald-500">
                                  <div className="text-[10px] text-zinc-500">LEFT EAR</div>
                                  <div className="font-mono text-white">{results.left} Hz</div>
                              </div>
                              <div className="bg-zinc-900 p-3 rounded w-1/2 border-l-4 border-red-500">
                                  <div className="text-[10px] text-zinc-500">RIGHT EAR</div>
                                  <div className="font-mono text-white">{results.right} Hz</div>
                              </div>
                          </div>
                      </div>
                      <div className="h-64 w-full bg-zinc-900/30 border border-zinc-800 rounded p-2">
                          <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={AGE_DATA}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                  <XAxis dataKey="age" stroke="#555" fontSize={10} unit="yr" />
                                  <YAxis stroke="#555" fontSize={10} tickFormatter={(val) => `${val/1000}k`} />
                                  <Tooltip contentStyle={{ backgroundColor: '#000' }} itemStyle={{ color: '#fff' }} />
                                  <Area type="monotone" dataKey="freq" stroke="#52525b" fill="#52525b" fillOpacity={0.1} />
                                  {results.left && <ReferenceLine y={results.left} stroke="#10b981" strokeDasharray="3 3" label="L" />}
                                  {results.right && <ReferenceLine y={results.right} stroke="#ef4444" strokeDasharray="3 3" label="R" />}
                              </AreaChart>
                          </ResponsiveContainer>
                      </div>
                  </div>
                  <ShareCard testName="Hearing Age" scoreDisplay={`${bestFreq} Hz`} resultLabel={`Ear Age: ${getAgeFromFreq(bestFreq)}`} />
                  
                  <div className="flex gap-4 mt-8">
                      <button onClick={() => { setPhase('testing'); setResults({left:null, right:null}); }} className="btn-secondary flex-1 flex items-center justify-center gap-2"><RefreshCcw size={16}/> New Test</button>
                      
                      {/* Point 4: Internal Linking Hook */}
                      <Link href="/test/tone-deaf-test" className="btn-primary flex-1 flex items-center justify-center gap-2 text-xs uppercase">
                          <Music2 size={16} /> Test Pitch (Tone Deaf)
                      </Link>
                  </div>
              </div>
          </div>
      );
  }

  // Testing Phase
  return (
    <div className="max-w-3xl mx-auto select-none">
       <div className="tech-border bg-black relative clip-corner-lg overflow-hidden border-zinc-800">
           {/* Point 1: Semantic Output for Screen Readers */}
           <output className="sr-only" aria-live="polite">
               {isPlaying ? `Playing ${frequency} Hertz` : "Generator Stopped"}
           </output>

           <div className="flex border-b border-zinc-800">
               <button onClick={() => { stopAudio(); setActiveSide('left'); setMode('auto'); }} disabled={!!results.left} className={`flex-1 py-4 flex items-center justify-center gap-2 transition-all ${activeSide === 'left' ? 'bg-zinc-900 text-white border-b-2 border-emerald-500' : 'text-zinc-600'} ${results.left ? 'opacity-50' : ''}`}>
                  <span className="font-bold">L</span> Left Ear {results.left && <Check size={12} className="text-emerald-500" />}
               </button>
               <div className="w-px bg-zinc-800"></div>
               <button onClick={() => { stopAudio(); setActiveSide('right'); setMode('auto'); }} disabled={!!results.right} className={`flex-1 py-4 flex items-center justify-center gap-2 transition-all ${activeSide === 'right' ? 'bg-zinc-900 text-white border-b-2 border-red-500' : 'text-zinc-600'} ${results.right ? 'opacity-50' : ''}`}>
                  <span className="font-bold">R</span> Right Ear {results.right && <Check size={12} className="text-emerald-500" />}
               </button>
           </div>

           <div className="p-12 text-center min-h-[400px] flex flex-col justify-center">
               <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-2">Signal Frequency</div>
               <div className="text-7xl font-mono font-bold text-white tracking-tighter mb-2 text-glow tabular-nums">{frequency.toLocaleString()}</div>
               <div className="text-sm font-mono text-primary-500 mb-12">HERTZ</div>

               <div className="h-16 flex items-end justify-center gap-[2px] mb-8 px-12 opacity-80" aria-hidden="true">
                    {vizData.map((val, i) => (
                        <div key={i} className="flex-1 bg-primary-500 transition-all duration-75 ease-out rounded-t-sm" style={{ height: `${Math.max(2, val / 2)}%`, opacity: Math.max(0.1, val / 200) }}></div>
                    ))}
               </div>

               <div className="max-w-md mx-auto">
                   {mode === 'auto' ? (
                       <button onClick={isPlaying ? stopAndRecord : startSweep} className={`w-full py-6 rounded text-xl font-bold uppercase tracking-widest transition-all shadow-lg ${isPlaying ? 'bg-emerald-500 text-black animate-pulse' : 'bg-zinc-800 hover:bg-zinc-700 text-white'}`}>
                          {isPlaying ? "I Hear It (Stop)" : `Start ${activeSide} Sweep`}
                       </button>
                   ) : (
                       <div className="space-y-4 animate-in slide-in-from-bottom-4">
                           <div className="flex items-center justify-center gap-2 mb-2"><Info size={14} className="text-primary-500" /><span className="text-xs text-primary-400 font-bold uppercase">Fine Tune Mode</span></div>
                           <div className="flex gap-4 items-center">
                               <button onMouseDown={() => manualAdjust(-100)} className="w-12 h-12 bg-zinc-800 rounded flex items-center justify-center"><Minus size={20}/></button>
                               <input type="range" min={END_FREQ} max={START_FREQ} step={50} value={frequency} onChange={(e) => manualAdjust(parseInt(e.target.value) - frequency)} className="flex-1 h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-primary-500"/>
                               <button onMouseDown={() => manualAdjust(100)} className="w-12 h-12 bg-zinc-800 rounded flex items-center justify-center"><Plus size={20}/></button>
                           </div>
                           <div className="flex gap-4">
                               <button onMouseDown={() => startTone(frequency, 'sine', activeSide)} onMouseUp={stopAudio} onMouseLeave={stopAudio} className="flex-1 py-4 bg-zinc-800 hover:bg-primary-600 hover:text-black text-white font-bold rounded uppercase">Hold to Check</button>
                               <button onClick={() => { stopAudio(); setResults(prev => ({ ...prev, [activeSide]: frequency })); if (activeSide === 'left' && !results.right) { setActiveSide('right'); setMode('auto'); setFrequency(START_FREQ); } }} className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-black font-bold rounded uppercase">Confirm {frequency}Hz</button>
                           </div>
                       </div>
                   )}
               </div>
           </div>
           
           <div className="bg-zinc-900 border-t border-zinc-800 px-6 py-3 flex justify-between items-center text-xs text-zinc-500 font-mono">
               <div className="flex gap-4"><span className={activeSide === 'left' ? 'text-primary-400' : ''}>L: {results.left ? `${results.left} Hz` : '--'}</span><span className={activeSide === 'right' ? 'text-primary-400' : ''}>R: {results.right ? `${results.right} Hz` : '--'}</span></div>
               {results.left && results.right && <button onClick={() => setPhase('report')} className="flex items-center gap-1 text-emerald-500 hover:underline">VIEW REPORT <ArrowRight size={12} /></button>}
           </div>
       </div>
    </div>
  );
};

export default HearingAgeTest;
