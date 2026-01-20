import React, { useState, useRef, useEffect } from 'react';
import { Play, RefreshCcw, Check, Volume2, ArrowRight, Minus, Plus, AlertTriangle, Info, Activity } from 'lucide-react';
import { saveStat } from '../../lib/core';
import ShareCard from '../ShareCard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot, ReferenceLine } from 'recharts';

type EarSide = 'left' | 'right';

// ISO 7029 Approximation Data for Chart
const AGE_DATA = [
  { age: 10, freq: 20000, label: '20k' },
  { age: 20, freq: 17000, label: '17k' },
  { age: 30, freq: 15000, label: '15k' },
  { age: 40, freq: 12000, label: '12k' },
  { age: 50, freq: 10500, label: '10.5k' },
  { age: 60, freq: 8000, label: '8k' },
  { age: 70, freq: 6000, label: '6k' },
  { age: 80, freq: 4000, label: '4k' },
];

const HearingAgeTest: React.FC = () => {
  // System State
  const [phase, setPhase] = useState<'calibration' | 'testing' | 'report'>('calibration');
  const [activeSide, setActiveSide] = useState<EarSide>('left');
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  
  // Audio State
  const [isPlaying, setIsPlaying] = useState(false);
  const [frequency, setFrequency] = useState(20000);
  
  // Data State
  const [results, setResults] = useState<{left: number | null, right: number | null}>({ left: null, right: null });
  const [vizData, setVizData] = useState<number[]>(new Array(32).fill(0));
  const [sampleRate, setSampleRate] = useState<number>(0);

  // A11y
  const [a11yAnnouncement, setA11yAnnouncement] = useState("");

  // Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const pannerRef = useRef<StereoPannerNode | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  
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
    // Check hardware sample rate
    const tempCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    setSampleRate(tempCtx.sampleRate);
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
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [phase, isPlaying, activeSide]);

  const initAudio = () => {
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  };

  // --- Core Audio Engine ---
  const startTone = (freq: number, type: OscillatorType = 'sine', side: EarSide | 'both' = 'both', vol: number = 0.1) => {
      const ctx = initAudio();
      
      if (oscillatorRef.current) {
          try { oscillatorRef.current.stop(); oscillatorRef.current.disconnect(); } catch(e){}
      }
      if (gainRef.current) {
          gainRef.current.disconnect();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const panner = ctx.createStereoPanner();
      const analyzer = ctx.createAnalyser();

      osc.type = type;
      osc.frequency.value = freq;
      
      panner.pan.value = side === 'left' ? -1 : side === 'right' ? 1 : 0;
      
      // Soft envelope
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.05);

      analyzer.fftSize = 256;
      analyzer.smoothingTimeConstant = 0.5;

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
    if (sweepRafRef.current) {
        cancelAnimationFrame(sweepRafRef.current);
        sweepRafRef.current = null;
    }
    if (visualizerRafRef.current) {
        cancelAnimationFrame(visualizerRafRef.current);
        visualizerRafRef.current = null;
    }

    if (oscillatorRef.current && audioContextRef.current && gainRef.current) {
        const ctx = audioContextRef.current;
        try {
            gainRef.current.gain.cancelScheduledValues(ctx.currentTime);
            gainRef.current.gain.setValueAtTime(gainRef.current.gain.value, ctx.currentTime);
            gainRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.05);
            oscillatorRef.current.stop(ctx.currentTime + 0.06);
        } catch (e) {}
        
        setTimeout(() => {
            oscillatorRef.current?.disconnect();
            gainRef.current?.disconnect();
            oscillatorRef.current = null;
            gainRef.current = null;
        }, 100);
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
      setA11yAnnouncement(`Starting sweep for ${activeSide} ear.`);
      
      if (mode === 'auto') {
          startTimeRef.current = Date.now();
          const animateSweep = () => {
              if (!oscillatorRef.current || !audioContextRef.current) return;
              const elapsed = Date.now() - startTimeRef.current;
              const progress = Math.min(elapsed / SWEEP_DURATION, 1);
              const currentFreq = START_FREQ - (progress * (START_FREQ - END_FREQ));
              
              setFrequency(Math.round(currentFreq));
              oscillatorRef.current.frequency.setValueAtTime(currentFreq, audioContextRef.current.currentTime);
              
              if (progress < 1) {
                  sweepRafRef.current = requestAnimationFrame(animateSweep);
              } else {
                  stopAudio();
              }
          };
          if (sweepRafRef.current) cancelAnimationFrame(sweepRafRef.current);
          sweepRafRef.current = requestAnimationFrame(animateSweep);
      }
  };

  const stopAndRecord = () => {
      stopAudio();
      if (mode === 'auto') {
          setMode('manual');
          setA11yAnnouncement(`Sweep paused at ${frequency} Hz. Use manual controls to fine tune.`);
      } else {
          setResults(prev => ({ ...prev, [activeSide]: frequency }));
          setA11yAnnouncement(`Recorded ${frequency} Hz for ${activeSide} ear.`);
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

  const calculateFinalScore = () => {
      const l = results.left || 0;
      const r = results.right || 0;
      const best = Math.max(l, r);
      const range = START_FREQ - END_FREQ;
      return Math.max(0, Math.min(100, Math.round(((best - END_FREQ) / range) * 100)));
  };

  // --- RENDERERS ---

  if (phase === 'calibration') {
      return (
          <div className="max-w-xl mx-auto py-8 px-4 animate-in fade-in">
              <div className="tech-border bg-black p-8 clip-corner-lg border-primary-500/30 text-center">
                  <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-zinc-800">
                      <Volume2 size={32} className="text-primary-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-wider">Calibration Protocol</h2>
                  
                  <div className="bg-red-900/10 border border-red-500/30 p-4 rounded text-left mb-6">
                      <div className="flex items-center gap-2 text-red-400 font-bold text-sm mb-2">
                          <AlertTriangle size={16} /> Hardware Warning
                      </div>
                      <p className="text-xs text-red-200 leading-relaxed">
                          Bluetooth headphones and cheap speakers often cannot play sounds above 16,000 Hz. 
                          For accurate results, use <strong>Wired Headphones</strong> or high-quality monitors.
                          {sampleRate < 44100 && (
                              <span className="block mt-2 font-mono text-red-400 uppercase">
                                  Error: Device Sample Rate {sampleRate}Hz is too low. Results will be inaccurate.
                              </span>
                          )}
                      </p>
                  </div>

                  <div className="bg-zinc-900/50 p-6 rounded-lg border border-zinc-800 mb-8">
                      <div className="text-xs font-mono text-zinc-500 uppercase mb-4">1.0 kHz Reference Tone</div>
                      <button 
                          onClick={() => isPlaying ? stopAudio() : startTone(1000, 'sine', 'both', 0.1)}
                          className={`w-full py-4 rounded font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${isPlaying ? 'bg-red-500 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'}`}
                      >
                          {isPlaying ? <><div className="w-2 h-2 bg-white rounded-full animate-pulse"/> Stop Tone</> : <Play size={16} />}
                      </button>
                      <p className="text-[10px] text-zinc-600 mt-4 leading-relaxed">
                          Adjust your volume until this tone is audible but <strong>comfortable</strong>. Do not change volume during the test.
                      </p>
                  </div>

                  <button 
                      onClick={() => { stopAudio(); setPhase('testing'); }}
                      className="btn-primary w-full"
                  >
                      Volume Calibrated - Start Test
                  </button>
              </div>
          </div>
      );
  }

  if (phase === 'report') {
      const score = calculateFinalScore();
      saveStat('hearing-age', score);
      const bestFreq = Math.max(results.left || 0, results.right || 0);
      
      // Calculate approximate age for plotting
      let estimatedAge = 80;
      if (bestFreq > 19000) estimatedAge = 15;
      else if (bestFreq > 4000) {
          // Linear interp approximation for graph plotting
          estimatedAge = 10 + (20000 - bestFreq) / 228; 
      }

      return (
          <div className="max-w-3xl mx-auto animate-in zoom-in duration-500">
              <div className="tech-border bg-black p-8 md:p-12 clip-corner-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-grid opacity-20"></div>
                  
                  <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-8">
                      <div>
                          <h2 className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-1">Audiometry Report</h2>
                          <div className="text-3xl font-bold text-white mb-6">Binaural Analysis</div>
                          
                          <div className="mb-6">
                              <div className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-1">Biological Age</div>
                              <div className="text-5xl font-bold text-primary-400 text-glow">
                                  {getAgeFromFreq(bestFreq)} <span className="text-lg text-zinc-600">YRS</span>
                              </div>
                          </div>

                          <div className="flex gap-4 mb-4">
                              <div className="flex-1 bg-zinc-900/50 border border-zinc-800 p-3 rounded">
                                  <div className="text-[10px] text-zinc-500 uppercase">Left Ear</div>
                                  <div className="text-lg font-mono text-white">{results.left?.toLocaleString()} Hz</div>
                              </div>
                              <div className="flex-1 bg-zinc-900/50 border border-zinc-800 p-3 rounded">
                                  <div className="text-[10px] text-zinc-500 uppercase">Right Ear</div>
                                  <div className="text-lg font-mono text-white">{results.right?.toLocaleString()} Hz</div>
                              </div>
                          </div>
                      </div>

                      {/* Professional Chart */}
                      <div className="h-64 w-full bg-zinc-900/30 border border-zinc-800 rounded p-2 relative">
                          <div className="absolute top-2 right-2 flex items-center gap-1 text-[9px] text-zinc-500 font-mono">
                              <Activity size={10} /> ISO_7029_CURVE
                          </div>
                          <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={AGE_DATA} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                                  <defs>
                                      <linearGradient id="colorFreq" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                                      </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                  <XAxis dataKey="age" stroke="#555" fontSize={10} tickLine={false} axisLine={false} unit="yr" />
                                  <YAxis dataKey="freq" stroke="#555" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${val/1000}k`} />
                                  <Tooltip 
                                      contentStyle={{ backgroundColor: '#000', borderColor: '#333', fontSize: '12px' }}
                                      itemStyle={{ color: '#06b6d4' }}
                                      labelStyle={{ color: '#888' }}
                                  />
                                  <Area type="monotone" dataKey="freq" stroke="#52525b" fill="url(#colorFreq)" strokeWidth={2} strokeDasharray="5 5" name="Avg Limit" />
                                  
                                  {/* User Point */}
                                  <ReferenceDot x={estimatedAge} y={bestFreq} r={6} fill="#06b6d4" stroke="#fff" />
                                  <ReferenceLine x={estimatedAge} stroke="#06b6d4" strokeDasharray="3 3" />
                              </AreaChart>
                          </ResponsiveContainer>
                      </div>
                  </div>

                  <div className="flex flex-col items-center gap-6 border-t border-zinc-800 pt-8">
                      <ShareCard 
                          testName="Hearing Age"
                          scoreDisplay={`${bestFreq.toLocaleString()} Hz`}
                          resultLabel={`Ear Age: ${getAgeFromFreq(bestFreq)}`}
                      />
                      <button onClick={() => { setPhase('testing'); setResults({left:null, right:null}); }} className="btn-secondary flex items-center gap-2">
                          <RefreshCcw size={16} /> New Test
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  // Phase: Testing
  return (
    <div className="max-w-3xl mx-auto select-none">
       <div aria-live="polite" className="sr-only">{a11yAnnouncement}</div>

       <div className="tech-border bg-black relative clip-corner-lg overflow-hidden border-zinc-800">
           <div className="flex border-b border-zinc-800">
               <button 
                  onClick={() => { stopAudio(); setActiveSide('left'); setMode('auto'); }}
                  disabled={!!results.left}
                  className={`flex-1 py-4 flex items-center justify-center gap-2 transition-all 
                    ${activeSide === 'left' ? 'bg-zinc-900 text-white shadow-[inset_0_-2px_0_#06b6d4]' : 'text-zinc-600 hover:text-zinc-400'}
                    ${results.left ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
               >
                  <span className="font-bold">L</span>
                  <span className="text-xs font-mono uppercase">Left Ear</span>
                  {results.left && <Check size={12} className="text-emerald-500" />}
               </button>
               <div className="w-px bg-zinc-800"></div>
               <button 
                  onClick={() => { stopAudio(); setActiveSide('right'); setMode('auto'); }}
                  disabled={!!results.right}
                  className={`flex-1 py-4 flex items-center justify-center gap-2 transition-all 
                    ${activeSide === 'right' ? 'bg-zinc-900 text-white shadow-[inset_0_-2px_0_#06b6d4]' : 'text-zinc-600 hover:text-zinc-400'}
                    ${results.right ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
               >
                  <span className="font-bold">R</span>
                  <span className="text-xs font-mono uppercase">Right Ear</span>
                  {results.right && <Check size={12} className="text-emerald-500" />}
               </button>
           </div>

           <div className="p-8 md:p-12 text-center relative min-h-[400px] flex flex-col justify-center">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/50 via-black to-black pointer-events-none"></div>
               
               <div className="relative z-10">
                   <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-2">Signal Frequency</div>
                   <div className="text-7xl md:text-8xl font-mono font-bold text-white tracking-tighter mb-2 text-glow tabular-nums">
                       {frequency.toLocaleString()}
                   </div>
                   <div className="text-sm font-mono text-primary-500 mb-12">HERTZ</div>

                   {/* Visualizer Bar */}
                   <div className="h-16 flex items-end justify-center gap-[2px] mb-8 px-12 opacity-80">
                        {vizData.map((val, i) => (
                            <div 
                                key={i} 
                                className="flex-1 bg-primary-500 transition-all duration-75 ease-out rounded-t-sm"
                                style={{ 
                                    height: `${Math.max(2, val / 2)}%`,
                                    opacity: Math.max(0.1, val / 200)
                                }}
                            ></div>
                        ))}
                   </div>

                   <div className="max-w-md mx-auto">
                       {mode === 'auto' ? (
                           <button 
                              onClick={isPlaying ? stopAndRecord : startSweep}
                              className={`
                                w-full py-6 rounded text-xl font-bold uppercase tracking-widest transition-all shadow-lg
                                ${isPlaying 
                                    ? 'bg-emerald-500 hover:bg-emerald-400 text-black animate-pulse shadow-[0_0_30px_rgba(16,185,129,0.3)]' 
                                    : 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 hover:border-primary-500'
                                }
                              `}
                           >
                              {isPlaying ? "I Hear It (Stop)" : `Start ${activeSide === 'left' ? 'Left' : 'Right'} Sweep`}
                           </button>
                       ) : (
                           <div className="space-y-4 animate-in slide-in-from-bottom-4">
                               <div className="flex items-center justify-center gap-2 mb-2">
                                   <Info size={14} className="text-primary-500" />
                                   <span className="text-xs text-primary-400 font-bold uppercase">Fine Tune Mode Active</span>
                               </div>
                               
                               <div className="flex gap-4 items-center">
                                   <button onMouseDown={() => manualAdjust(-100)} className="w-12 h-12 bg-zinc-800 rounded flex items-center justify-center hover:bg-zinc-700 active:bg-primary-600 transition-colors"><Minus size={20} className="text-zinc-300" /></button>
                                   <input 
                                      type="range" 
                                      min={END_FREQ} 
                                      max={START_FREQ}
                                      step={50}
                                      value={frequency}
                                      onChange={(e) => manualAdjust(parseInt(e.target.value) - frequency)} 
                                      className="flex-1 h-12 bg-zinc-900 rounded appearance-none cursor-pointer accent-primary-500 px-2"
                                   />
                                   <button onMouseDown={() => manualAdjust(100)} className="w-12 h-12 bg-zinc-800 rounded flex items-center justify-center hover:bg-zinc-700 active:bg-primary-600 transition-colors"><Plus size={20} className="text-zinc-300" /></button>
                               </div>
                               
                               <div className="flex gap-4">
                                   <button 
                                      onMouseDown={() => startTone(frequency, 'sine', activeSide)}
                                      onMouseUp={stopAudio}
                                      onMouseLeave={stopAudio}
                                      className="flex-1 py-4 bg-zinc-800 hover:bg-primary-600 hover:text-black text-white font-bold rounded uppercase tracking-wider transition-colors border border-zinc-700"
                                   >
                                      Hold to Check
                                   </button>
                                   <button 
                                      onClick={() => {
                                          stopAudio();
                                          setResults(prev => ({ ...prev, [activeSide]: frequency }));
                                          if (activeSide === 'left' && !results.right) {
                                              setActiveSide('right');
                                              setMode('auto');
                                              setFrequency(START_FREQ);
                                          }
                                      }}
                                      className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-black font-bold rounded uppercase tracking-wider transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                                   >
                                      Confirm {frequency}Hz
                                   </button>
                               </div>
                           </div>
                       )}
                       
                       <div className="mt-6 text-[10px] text-zinc-600 font-mono">
                           {mode === 'auto' && !isPlaying && "PRESS SPACEBAR TO START"}
                           {mode === 'auto' && isPlaying && "PRESS SPACEBAR WHEN SOUND IS AUDIBLE"}
                       </div>
                   </div>
               </div>
           </div>

           <div className="bg-zinc-900 border-t border-zinc-800 px-6 py-3 flex justify-between items-center text-xs text-zinc-500 font-mono">
               <div className="flex gap-4">
                   <span className={activeSide === 'left' ? 'text-primary-400' : ''}>L: {results.left ? `${results.left} Hz` : '--'}</span>
                   <span className={activeSide === 'right' ? 'text-primary-400' : ''}>R: {results.right ? `${results.right} Hz` : '--'}</span>
               </div>
               {results.left && results.right && (
                   <button onClick={() => setPhase('report')} className="flex items-center gap-1 text-emerald-500 hover:text-emerald-400 hover:underline">
                       VIEW REPORT <ArrowRight size={12} />
                   </button>
               )}
           </div>
       </div>
    </div>
  );
};

export default HearingAgeTest;