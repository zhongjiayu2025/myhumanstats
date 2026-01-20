import React, { useState, useRef, useEffect } from 'react';
import { Play, RefreshCcw, Check, Headphones, Volume2, ArrowRight, Minus, Plus } from 'lucide-react';
import { saveStat } from '../../lib/core';
import ShareCard from '../ShareCard';

type EarSide = 'left' | 'right';

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

  // A11y
  const [a11yAnnouncement, setA11yAnnouncement] = useState("");

  // Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const pannerRef = useRef<StereoPannerNode | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Constants
  const START_FREQ = 22000;
  const END_FREQ = 8000;
  const SWEEP_DURATION = 20000; // Slower sweep for better accuracy (20s)

  // --- Initialization & Cleanup ---
  useEffect(() => {
    // Basic init check
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    ctx.close();

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
      stopAudio(); // Safety clear

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const panner = ctx.createStereoPanner();
      const analyzer = ctx.createAnalyser();

      osc.type = type;
      osc.frequency.value = freq;
      
      panner.pan.value = side === 'left' ? -1 : side === 'right' ? 1 : 0;
      
      // Soft start to avoid pop
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.1);

      analyzer.fftSize = 256;
      analyzer.smoothingTimeConstant = 0.5;

      osc.connect(gain);
      gain.connect(panner);
      panner.connect(analyzer);
      panner.connect(ctx.destination);

      osc.start();
      
      // Store refs
      oscillatorRef.current = osc;
      gainRef.current = gain;
      pannerRef.current = panner;
      analyzerRef.current = analyzer;
      
      setIsPlaying(true);
      drawVisualizer();
  };

  const stopAudio = () => {
    if (oscillatorRef.current) {
        const ctx = audioContextRef.current;
        if (ctx && gainRef.current) {
            // Soft stop
            gainRef.current.gain.cancelScheduledValues(ctx.currentTime);
            gainRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.05);
            oscillatorRef.current.stop(ctx.currentTime + 0.05);
        } else {
            try { oscillatorRef.current.stop(); } catch(e){}
        }
        setTimeout(() => {
            oscillatorRef.current?.disconnect();
            oscillatorRef.current = null;
        }, 100);
    }
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    setIsPlaying(false);
    setVizData(new Array(32).fill(0));
  };

  const drawVisualizer = () => {
      if (!analyzerRef.current) return;
      const bufferLength = analyzerRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyzerRef.current.getByteFrequencyData(dataArray);

      // Downsample for UI
      const bars = 32;
      const step = Math.floor(bufferLength / bars);
      const lowRes = [];
      for(let i=0; i<bars; i++) {
          let sum = 0;
          for(let j=0; j<step; j++) sum += dataArray[i*step + j];
          lowRes.push(sum/step);
      }
      setVizData(lowRes);

      if (isPlaying) {
          animationFrameRef.current = requestAnimationFrame(drawVisualizer);
      }
  };

  // --- Logic Flows ---

  const startSweep = () => {
      setFrequency(START_FREQ);
      startTone(START_FREQ, 'sine', activeSide, 0.1);
      setA11yAnnouncement(`Starting sweep for ${activeSide} ear.`);
      
      if (mode === 'auto') {
          startTimeRef.current = Date.now();
          const animateSweep = () => {
              if (!oscillatorRef.current) return;
              
              const elapsed = Date.now() - startTimeRef.current;
              const progress = Math.min(elapsed / SWEEP_DURATION, 1);
              
              // Linear drop is often easier for users to time than logarithmic for this specific test style
              const currentFreq = START_FREQ - (progress * (START_FREQ - END_FREQ));
              
              setFrequency(Math.round(currentFreq));
              if (oscillatorRef.current && audioContextRef.current) {
                  oscillatorRef.current.frequency.setValueAtTime(currentFreq, audioContextRef.current.currentTime);
              }
              
              // Visualizer loop handles drawing via requestAnimationFrame if isPlaying is true

              if (progress < 1) {
                  animationFrameRef.current = requestAnimationFrame(animateSweep);
              } else {
                  stopAudio();
              }
          };
          
          if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = requestAnimationFrame(animateSweep);
      }
  };

  const stopAndRecord = () => {
      stopAudio();
      setResults(prev => ({ ...prev, [activeSide]: frequency }));
      setA11yAnnouncement(`Recorded ${frequency} Hz for ${activeSide} ear.`);
  };

  const manualAdjust = (delta: number) => {
      const newFreq = Math.min(START_FREQ, Math.max(END_FREQ, frequency + delta));
      setFrequency(newFreq);
      if (isPlaying && oscillatorRef.current && audioContextRef.current) {
          oscillatorRef.current.frequency.setValueAtTime(newFreq, audioContextRef.current.currentTime);
      }
  };

  // --- Helpers ---
  const getAgeFromFreq = (freq: number) => {
      if (freq > 19000) return "< 20";
      if (freq > 17000) return "20-24";
      if (freq > 16000) return "25-29";
      if (freq > 15000) return "30-39";
      if (freq > 12000) return "40-49";
      if (freq > 10000) return "50-59";
      return "60+";
  };

  const calculateFinalScore = () => {
      const l = results.left || 0;
      const r = results.right || 0;
      const best = Math.max(l, r);
      // Normalized score 0-100
      const range = START_FREQ - END_FREQ;
      return Math.max(0, Math.min(100, Math.round(((best - END_FREQ) / range) * 100)));
  };

  useEffect(() => {
      if (results.left && results.right && phase !== 'report') {
          // Delay slightly to let user see the number
          // Actually, let user manually click "View Report" so they can retry one side if they want
      }
  }, [results, phase]);


  // --- RENDERERS ---

  if (phase === 'calibration') {
      return (
          <div className="max-w-xl mx-auto py-8 px-4 animate-in fade-in">
              <div className="tech-border bg-black p-8 clip-corner-lg border-primary-500/30 text-center">
                  <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-zinc-800">
                      <Volume2 size={32} className="text-primary-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-wider">Calibration Protocol</h2>
                  <p className="text-zinc-400 text-sm leading-relaxed mb-8 max-w-md mx-auto">
                      <strong>WARNING:</strong> High-frequency sounds can be damaging at high volumes. 
                      <br/>Please calibrate your system volume using the reference tone below.
                  </p>

                  <div className="bg-zinc-900/50 p-6 rounded-lg border border-zinc-800 mb-8">
                      <div className="text-xs font-mono text-zinc-500 uppercase mb-4">1.0 kHz Reference Tone</div>
                      <button 
                          onClick={() => isPlaying ? stopAudio() : startTone(1000, 'sine', 'both', 0.1)}
                          className={`w-full py-4 rounded font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${isPlaying ? 'bg-red-500 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'}`}
                      >
                          {isPlaying ? <><div className="w-2 h-2 bg-white rounded-full animate-pulse"/> Stop Tone</> : <Play size={16} />}
                      </button>
                      <p className="text-[10px] text-zinc-600 mt-4 leading-relaxed">
                          Adjust your device volume until this tone is <strong>clearly audible but comfortable</strong>. <br/>Do not change your volume after this step.
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

      return (
          <div className="max-w-2xl mx-auto animate-in zoom-in duration-500">
              <div className="tech-border bg-black p-8 md:p-12 clip-corner-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-grid opacity-20"></div>
                  
                  <div className="relative z-10">
                      <div className="flex justify-between items-start mb-8">
                          <div>
                              <h2 className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-1">Audiometry Report</h2>
                              <div className="text-3xl font-bold text-white">Binaural Analysis</div>
                          </div>
                          <div className="text-right">
                              <div className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-1">Biological Age</div>
                              <div className="text-4xl font-bold text-primary-400 text-glow">
                                  {getAgeFromFreq(Math.max(results.left || 0, results.right || 0))} <span className="text-lg text-zinc-600">YRS</span>
                              </div>
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6 mb-8">
                          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-lg text-center">
                              <div className="flex justify-center mb-2"><Headphones size={24} className="text-zinc-600"/></div>
                              <div className="text-xs text-zinc-500 uppercase mb-2">Left Ear</div>
                              <div className="text-2xl font-mono text-white">{results.left?.toLocaleString()} Hz</div>
                          </div>
                          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-lg text-center">
                              <div className="flex justify-center mb-2"><Headphones size={24} className="text-zinc-600 scale-x-[-1]"/></div>
                              <div className="text-xs text-zinc-500 uppercase mb-2">Right Ear</div>
                              <div className="text-2xl font-mono text-white">{results.right?.toLocaleString()} Hz</div>
                          </div>
                      </div>

                      <div className="flex gap-4 justify-center">
                          <button onClick={() => { setPhase('testing'); setResults({left:null, right:null}); }} className="btn-secondary flex items-center gap-2">
                              <RefreshCcw size={16} /> New Test
                          </button>
                      </div>
                      
                      <ShareCard 
                          testName="Hearing Age"
                          scoreDisplay={`${Math.max(results.left || 0, results.right || 0).toLocaleString()} Hz`}
                          resultLabel={`Result: ${getAgeFromFreq(Math.max(results.left || 0, results.right || 0))} Yrs`}
                      />
                  </div>
              </div>
          </div>
      );
  }

  // Phase: Testing
  return (
    <div className="max-w-3xl mx-auto select-none">
       <div aria-live="polite" className="sr-only">
         {a11yAnnouncement}
       </div>

       {/* Device Frame */}
       <div className="tech-border bg-black relative clip-corner-lg overflow-hidden border-zinc-800">
           
           {/* Top Bar: L/R Switcher */}
           <div className="flex border-b border-zinc-800">
               <button 
                  onClick={() => { stopAudio(); setActiveSide('left'); }}
                  className={`flex-1 py-4 flex items-center justify-center gap-2 transition-all ${activeSide === 'left' ? 'bg-zinc-900 text-white shadow-[inset_0_-2px_0_#06b6d4]' : 'text-zinc-600 hover:text-zinc-400 hover:bg-zinc-950'}`}
               >
                  <span className="font-bold">L</span>
                  <span className="text-xs font-mono uppercase">Left Ear</span>
                  {results.left && <Check size={12} className="text-emerald-500" />}
               </button>
               <div className="w-px bg-zinc-800"></div>
               <button 
                  onClick={() => { stopAudio(); setActiveSide('right'); }}
                  className={`flex-1 py-4 flex items-center justify-center gap-2 transition-all ${activeSide === 'right' ? 'bg-zinc-900 text-white shadow-[inset_0_-2px_0_#06b6d4]' : 'text-zinc-600 hover:text-zinc-400 hover:bg-zinc-950'}`}
               >
                  <span className="font-bold">R</span>
                  <span className="text-xs font-mono uppercase">Right Ear</span>
                  {results.right && <Check size={12} className="text-emerald-500" />}
               </button>
           </div>

           {/* Main Display Area */}
           <div className="p-8 md:p-12 text-center relative">
               {/* Background Fx */}
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/50 via-black to-black pointer-events-none"></div>
               
               <div className="relative z-10">
                   <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-2">Signal Frequency</div>
                   <div className="text-7xl md:text-8xl font-mono font-bold text-white tracking-tighter mb-2 text-glow tabular-nums">
                       {frequency.toLocaleString()}
                   </div>
                   <div className="text-sm font-mono text-primary-500 mb-12">HERTZ</div>

                   {/* Visualizer Bar */}
                   <div className="h-16 flex items-end justify-center gap-[2px] mb-12 px-12 opacity-80">
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

                   {/* Controls */}
                   <div className="max-w-md mx-auto">
                       {/* Mode Switcher */}
                       <div className="flex justify-center mb-8">
                           <div className="inline-flex bg-zinc-900 p-1 rounded border border-zinc-800">
                               <button 
                                  onClick={() => { setMode('auto'); stopAudio(); }}
                                  className={`px-4 py-1 text-xs rounded transition-all ${mode === 'auto' ? 'bg-primary-600 text-black font-bold' : 'text-zinc-500 hover:text-white'}`}
                               >
                                  Auto Sweep
                               </button>
                               <button 
                                  onClick={() => { setMode('manual'); stopAudio(); }}
                                  className={`px-4 py-1 text-xs rounded transition-all ${mode === 'manual' ? 'bg-primary-600 text-black font-bold' : 'text-zinc-500 hover:text-white'}`}
                               >
                                  Manual Tune
                               </button>
                           </div>
                       </div>

                       {/* Action Buttons */}
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
                           // Manual Controls
                           <div className="space-y-4">
                               <div className="flex gap-4 items-center">
                                   <button onMouseDown={() => manualAdjust(-100)} className="w-12 h-12 bg-zinc-800 rounded flex items-center justify-center hover:bg-zinc-700 active:bg-primary-600 transition-colors"><Minus size={20} className="text-zinc-300" /></button>
                                   <input 
                                      type="range" 
                                      min={END_FREQ} 
                                      max={START_FREQ}
                                      step={50}
                                      value={frequency}
                                      onChange={(e) => manualAdjust(parseInt(e.target.value) - frequency)} // Delta calc
                                      className="flex-1 h-12 bg-zinc-900 rounded appearance-none cursor-pointer accent-primary-500 px-2"
                                   />
                                   <button onMouseDown={() => manualAdjust(100)} className="w-12 h-12 bg-zinc-800 rounded flex items-center justify-center hover:bg-zinc-700 active:bg-primary-600 transition-colors"><Plus size={20} className="text-zinc-300" /></button>
                               </div>
                               <div className="flex gap-4">
                                   <button 
                                      onMouseDown={() => startTone(frequency, 'sine', activeSide)}
                                      onMouseUp={stopAudio}
                                      onMouseLeave={stopAudio}
                                      className="flex-1 py-4 bg-zinc-800 hover:bg-primary-600 hover:text-black text-white font-bold rounded uppercase tracking-wider transition-colors"
                                   >
                                      Hold to Play
                                   </button>
                                   <button 
                                      onClick={stopAndRecord}
                                      className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-black font-bold rounded uppercase tracking-wider transition-colors"
                                   >
                                      Confirm Threshold
                                   </button>
                               </div>
                           </div>
                       )}
                       
                       <div className="mt-6 text-[10px] text-zinc-600 font-mono">
                           {mode === 'auto' ? "PRESS SPACEBAR TO START / STOP" : "ADJUST FREQUENCY UNTIL BARELY AUDIBLE"}
                       </div>
                   </div>
               </div>
           </div>

           {/* Footer Status */}
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