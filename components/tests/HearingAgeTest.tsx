import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, RefreshCcw, AlertTriangle, Sliders, Keyboard, Share2, Check, Wrench, Headphones } from 'lucide-react';
import { saveStat } from '../../lib/core';
import ShareCard from '../ShareCard';
import { Link } from 'react-router-dom';

const HearingAgeTest: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [frequency, setFrequency] = useState(20000);
  const [result, setResult] = useState<number | null>(null);
  const [channel, setChannel] = useState<'left' | 'right' | 'both'>('both');
  const [warningAccepted, setWarningAccepted] = useState(false);
  const [vizData, setVizData] = useState<number[]>(new Array(32).fill(0));
  const [sampleRate, setSampleRate] = useState<number>(0);
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  const [copied, setCopied] = useState(false);

  // A11y: Screen reader announcement state
  const [a11yAnnouncement, setA11yAnnouncement] = useState("");

  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const pannerRef = useRef<StereoPannerNode | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const START_FREQ = 22000;
  const END_FREQ = 8000;
  const DURATION = 15000;

  useEffect(() => {
    // Check Sample Rate on mount without starting audio
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    setSampleRate(ctx.sampleRate);
    ctx.close();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (isPlaying) handleHearIt();
        else if (warningAccepted && !result && mode === 'auto') startTest();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      stopAudio();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlaying, warningAccepted, result, mode]); 

  const initAudio = () => {
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  };

  const stopAudio = () => {
    if (oscillatorRef.current) {
      try { oscillatorRef.current.stop(); oscillatorRef.current.disconnect(); } catch (e) {}
      oscillatorRef.current = null;
    }
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    setIsPlaying(false);
    setVizData(new Array(32).fill(0));
  };

  const updateVisualizer = () => {
    if (!analyzerRef.current) return;
    
    const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount);
    analyzerRef.current.getByteFrequencyData(dataArray);
    
    // Subsample
    const step = Math.floor(dataArray.length / 32);
    const lowRes = [];
    for(let i=0; i<32; i++) {
        let sum = 0;
        for(let j=0; j<step; j++) sum += dataArray[i*step + j];
        lowRes.push(sum / step);
    }
    setVizData(lowRes);
    
    if (isPlaying) {
        requestAnimationFrame(updateVisualizer);
    }
  };

  const startTest = useCallback(() => {
    if (!warningAccepted) return;

    setResult(null);
    if (mode === 'auto') setFrequency(START_FREQ);
    
    const ctx = initAudio();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const panner = ctx.createStereoPanner();
    const analyzer = ctx.createAnalyser();

    osc.type = 'sine';
    osc.frequency.value = mode === 'auto' ? START_FREQ : frequency;
    
    panner.pan.value = channel === 'left' ? -1 : channel === 'right' ? 1 : 0;
    pannerRef.current = panner;
    
    analyzer.fftSize = 256;
    analyzerRef.current = analyzer;
    gainRef.current = gain;

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(panner);
    panner.connect(analyzer);
    panner.connect(ctx.destination);

    osc.start();
    oscillatorRef.current = osc;
    setIsPlaying(true);
    
    // A11y start announcement
    setA11yAnnouncement("Test started. Frequency sweeping down from 22000 Hertz. Press Spacebar when you hear the tone.");
    
    if (mode === 'auto') {
      startTimeRef.current = Date.now();
      const animate = () => {
        if (!oscillatorRef.current) return;
        
        const elapsed = Date.now() - startTimeRef.current;
        const progress = Math.min(elapsed / DURATION, 1);
        const currentFreq = START_FREQ - (progress * (START_FREQ - END_FREQ));
        
        const roundedFreq = Math.round(currentFreq);
        setFrequency(roundedFreq);
        
        // Update A11y announcement every 2000Hz drop to avoid spamming screen reader
        if (roundedFreq % 2000 === 0) {
           setA11yAnnouncement(`Current frequency: ${roundedFreq} Hertz`);
        }

        oscillatorRef.current.frequency.setValueAtTime(currentFreq, ctx.currentTime);
        updateVisualizer();

        if (progress < 1) {
            animationFrameRef.current = requestAnimationFrame(animate);
        } else {
            stopAudio();
        }
      };
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      // Manual mode visualizer loop
      const animateManual = () => {
         updateVisualizer();
         if (isPlaying) animationFrameRef.current = requestAnimationFrame(animateManual);
      };
      animationFrameRef.current = requestAnimationFrame(animateManual);
    }
  }, [channel, warningAccepted, mode, frequency]);

  const handleManualFreqChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFreq = parseInt(e.target.value);
    setFrequency(newFreq);
    if (oscillatorRef.current && audioContextRef.current) {
        oscillatorRef.current.frequency.setValueAtTime(newFreq, audioContextRef.current.currentTime);
    }
  };

  const handleHearIt = () => {
    stopAudio();
    setResult(frequency);
    const range = START_FREQ - END_FREQ;
    const score = Math.max(0, Math.min(100, Math.round(((frequency - END_FREQ) / range) * 100)));
    saveStat('hearing-age', score);
    setA11yAnnouncement(`Test finished. Your threshold is ${frequency} Hertz. Estimated hearing age: ${getEstimatedAge(frequency)}.`);
  };

  const playCalibrationTone = () => {
     if (isPlaying) { stopAudio(); return; }
     
     const ctx = initAudio();
     const osc = ctx.createOscillator();
     const gain = ctx.createGain();
     
     osc.frequency.value = 1000;
     gain.gain.value = 0.1;
     
     osc.connect(gain);
     gain.connect(ctx.destination);
     osc.start();
     oscillatorRef.current = osc;
     setIsPlaying(true);
     
     // Auto stop after 3s
     setTimeout(() => {
        if (oscillatorRef.current === osc) stopAudio();
     }, 3000);
  };

  const getEstimatedAge = (freq: number) => {
    if (freq > 19000) return "< 20 YRS";
    if (freq > 17000) return "20-24 YRS";
    if (freq > 16000) return "25-30 YRS";
    if (freq > 15000) return "30-40 YRS";
    if (freq > 12000) return "40-50 YRS";
    if (freq > 10000) return "50-60 YRS";
    return "60+ YRS";
  };

  const shareResult = () => {
    if (!result) return;
    const text = `🦻 My Hearing Age is ${getEstimatedAge(result)} (${result.toLocaleString()}Hz). Test yours at: myhumanstats.org/test/hearing-age-test`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!warningAccepted) {
      return (
         <div className="max-w-xl mx-auto py-12">
            <div className="tech-border bg-black p-8 text-center space-y-6 clip-corner-lg border-primary-500/50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-warning/50 animate-pulse"></div>
                
                {sampleRate < 40000 && (
                   <div className="bg-red-900/30 border border-red-500 p-4 mb-4 text-left">
                      <h3 className="text-red-500 font-bold flex items-center gap-2 text-sm uppercase"><AlertTriangle size={16}/> Hardware Limit Detected</h3>
                      <p className="text-red-200 text-xs mt-1">Your device sample rate is {sampleRate}Hz. This is too low for a standard Hearing Age Test (max freq {sampleRate/2}Hz). Please disconnect Bluetooth headsets or use wired headphones.</p>
                   </div>
                )}

                <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto text-warning">
                    <AlertTriangle size={32} />
                </div>
                
                {/* SEO Optimized Header */}
                <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Hearing Age Test Protocol</h2>
                
                <div className="text-left bg-zinc-900/50 p-4 border border-zinc-800 text-sm text-zinc-400 font-mono space-y-2">
                    {/* Natural keyword insertion */}
                    <p>1. [MANDATORY] To get the most accurate <strong>Hearing Age Test</strong> result, high-fidelity headphones are required.</p>
                    <p>2. <button onClick={playCalibrationTone} className="text-primary-400 underline hover:text-primary-300">Test 1kHz Tone</button> to set a safe volume before the <strong>Hearing Age Test</strong> begins.</p>
                    <p>3. This module generates high-frequency sine waves to assess auditory decline.</p>
                </div>
                
                {/* Cross-Sell Hardware Check */}
                <div className="flex gap-2">
                   <button 
                       onClick={() => setWarningAccepted(true)}
                       disabled={sampleRate < 40000}
                       className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                       aria-label="Acknowledge and Start Hearing Test"
                   >
                       Acknowledge & Initialize
                   </button>
                   <Link to="/tools/stereo-test" className="px-4 bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white hover:border-zinc-600 transition-colors rounded" title="Test Headphones First">
                      <Headphones size={20} />
                   </Link>
                </div>
            </div>
         </div>
      )
  }

  return (
    <div className="max-w-2xl mx-auto select-none">
      
      {/* A11y Live Region for Screen Readers */}
      <div aria-live="polite" className="sr-only">
         {a11yAnnouncement}
      </div>

      {/* Device Frame */}
      <div className="bg-surface border border-zinc-800 p-1 clip-corner-lg relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500/50 to-transparent opacity-50"></div>
        
        <div className="bg-black/80 border border-zinc-800/50 p-8 clip-corner-lg relative overflow-hidden">
           {/* Background Grid */}
           <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_24%,rgba(34,211,238,0.03)_25%,rgba(34,211,238,0.03)_26%,transparent_27%,transparent_74%,rgba(34,211,238,0.03)_75%,rgba(34,211,238,0.03)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(34,211,238,0.03)_25%,rgba(34,211,238,0.03)_26%,transparent_27%,transparent_74%,rgba(34,211,238,0.03)_75%,rgba(34,211,238,0.03)_76%,transparent_77%,transparent)] bg-[size:30px_30px] pointer-events-none"></div>

           <div className="relative z-10 text-center space-y-8">
              
              {/* Header Controls: Mode & Channels */}
              <div className="flex flex-col md:flex-row justify-between gap-4 border-b border-zinc-800 pb-6">
                 {/* Mode Toggle */}
                 <div className="flex bg-zinc-900 border border-zinc-800 p-1 clip-corner-sm" role="group" aria-label="Test Mode">
                    <button 
                       onClick={() => { setMode('auto'); stopAudio(); setResult(null); }}
                       className={`px-4 py-1 text-[10px] font-bold uppercase transition-all ${mode === 'auto' ? 'bg-primary-500 text-black' : 'text-zinc-500 hover:text-white'}`}
                       aria-pressed={mode === 'auto'}
                    >
                       Auto Sweep
                    </button>
                    <button 
                       onClick={() => { setMode('manual'); stopAudio(); setResult(null); }}
                       className={`px-4 py-1 text-[10px] font-bold uppercase transition-all ${mode === 'manual' ? 'bg-primary-500 text-black' : 'text-zinc-500 hover:text-white'}`}
                       aria-pressed={mode === 'manual'}
                    >
                       Manual Tune
                    </button>
                 </div>

                 {/* Channel Toggle */}
                 <div className="flex bg-zinc-900 border border-zinc-800 p-1 clip-corner-sm" role="group" aria-label="Audio Channels">
                     <button onClick={() => setChannel('left')} className={`px-3 py-1 text-[10px] font-bold uppercase ${channel === 'left' ? 'text-white' : 'text-zinc-600'}`} aria-label="Left Channel">L</button>
                     <div className="w-px bg-zinc-700 mx-1"></div>
                     <button onClick={() => setChannel('both')} className={`px-3 py-1 text-[10px] font-bold uppercase ${channel === 'both' ? 'text-white' : 'text-zinc-600'}`} aria-label="Stereo">STEREO</button>
                     <div className="w-px bg-zinc-700 mx-1"></div>
                     <button onClick={() => setChannel('right')} className={`px-3 py-1 text-[10px] font-bold uppercase ${channel === 'right' ? 'text-white' : 'text-zinc-600'}`} aria-label="Right Channel">R</button>
                 </div>
              </div>

              {/* Frequency Display */}
              <div className="inline-block relative">
                 <div className="border border-primary-500/30 bg-black px-8 py-4 clip-corner-sm min-w-[240px]">
                    <div className="text-[10px] text-primary-500/50 font-mono absolute top-1 left-2">OSCILLATOR_FREQ</div>
                    <div className="text-6xl font-mono font-bold text-white text-glow tabular-nums tracking-tighter">
                       {frequency.toLocaleString()}
                    </div>
                    <div className="text-sm font-mono text-zinc-500 mt-1">HERTZ</div>
                 </div>
                 {/* Decorative Lines */}
                 <div className="absolute -left-4 top-1/2 w-4 h-[1px] bg-primary-500/30"></div>
                 <div className="absolute -right-4 top-1/2 w-4 h-[1px] bg-primary-500/30"></div>
              </div>

              {/* Visualization / Manual Slider */}
              <div className="h-24 flex items-end justify-center gap-[2px] px-8 relative">
                 {/* Visualizer */}
                 {vizData.map((val, i) => (
                    <div 
                      key={i} 
                      className="w-full bg-primary-500/80 transition-all duration-75"
                      style={{ 
                        height: `${Math.max(4, val / 2.5)}%`,
                        opacity: Math.max(0.1, val / 255)
                      }}
                    ></div>
                 ))}
                 
                 {/* Manual Slider Overlay */}
                 {mode === 'manual' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                       <div className="w-full max-w-md px-4">
                          <input 
                             type="range" 
                             min={END_FREQ} 
                             max={START_FREQ} 
                             step={50}
                             value={frequency}
                             onChange={handleManualFreqChange}
                             className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
                             aria-label="Frequency Slider"
                          />
                          <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-2">
                             <span>{END_FREQ}Hz</span>
                             <span>DRAG TO ADJUST</span>
                             <span>{START_FREQ}Hz</span>
                          </div>
                       </div>
                    </div>
                 )}
              </div>

              {/* Controls */}
              <div className="min-h-[100px] flex items-center justify-center">
                {/* IDLE STATE */}
                {!isPlaying && !result && (
                  <button 
                    onClick={startTest}
                    className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary-600 hover:bg-primary-500 text-black font-bold uppercase tracking-wider clip-corner-sm transition-all w-full max-w-sm"
                    aria-label="Start Hearing Test"
                  >
                    {mode === 'auto' ? <Play size={20} fill="black" /> : <Sliders size={20} />}
                    <span>{mode === 'auto' ? 'Initiate Sequence' : 'Start Generator'}</span>
                    <div className="absolute inset-0 border border-white/20 clip-corner-sm"></div>
                  </button>
                )}

                {/* PLAYING STATE */}
                {isPlaying && (
                   <div className="w-full max-w-sm space-y-2">
                      <button 
                        onClick={handleHearIt}
                        className="w-full py-6 bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase tracking-widest clip-corner-sm shadow-[0_0_20px_rgba(16,185,129,0.4)] animate-pulse"
                      >
                        {mode === 'auto' ? 'I HEAR IT [STOP]' : 'MARK THRESHOLD'}
                      </button>
                      <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-500 font-mono">
                         <Keyboard size={12} />
                         <span>PRESS SPACEBAR</span>
                      </div>
                   </div>
                )}

                {/* RESULT STATE */}
                {result && (
                  <div className="animate-in fade-in duration-500 space-y-6 w-full">
                    <div className="border border-zinc-800 bg-zinc-900/50 p-6 clip-corner-sm">
                        <div className="grid grid-cols-2 gap-4 text-left">
                            <div>
                                <div className="text-[10px] text-zinc-500 uppercase font-mono mb-1">Threshold</div>
                                <div className="text-2xl text-white font-mono">{frequency} Hz</div>
                            </div>
                            <div>
                                {/* Optimized Header */}
                                <div className="text-[10px] text-zinc-500 uppercase font-mono mb-1">Hearing Age Test Result</div>
                                <div className="text-2xl text-primary-400 font-bold">{getEstimatedAge(result)}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex justify-center gap-4">
                        <button onClick={() => {setResult(null); startTest();}} className="px-6 py-2 border border-zinc-700 hover:bg-zinc-800 text-white text-xs font-mono uppercase clip-corner-sm flex items-center gap-2">
                            <RefreshCcw size={12} /> Retry
                        </button>
                        
                        <button 
                           onClick={shareResult} 
                           className={`px-6 py-2 border transition-all text-xs font-mono uppercase clip-corner-sm flex items-center gap-2 ${copied ? 'bg-emerald-900/50 border-emerald-500 text-emerald-400' : 'border-zinc-700 hover:bg-zinc-800 text-white'}`}
                        >
                            {copied ? <Check size={12} /> : <Share2 size={12} />} 
                            {copied ? 'Copied' : 'Share Result'}
                        </button>
                    </div>

                    {/* Social Asset Generator */}
                    <ShareCard 
                       testName="Hearing Age"
                       scoreDisplay={`${result.toLocaleString()} Hz`}
                       resultLabel={`Ear Age: ${getEstimatedAge(result)}`}
                    />
                  </div>
                )}
              </div>
              
              {/* Technical Description for SEO - Hidden in plain sight as "specs" */}
              <div className="mt-8 border-t border-zinc-800 pt-4 text-left">
                 <div className="flex items-start gap-2">
                    <div className="mt-1 w-1 h-1 bg-zinc-600 rounded-full"></div>
                    <p className="text-[10px] leading-relaxed text-zinc-500 font-mono">
                       <strong>SYSTEM_INFO:</strong> This digital <strong>Hearing Age Test</strong> generates precision sine waves between 8kHz and 20kHz to determine your upper auditory threshold. As human hearing naturally degrades with age (presbycusis), the maximum audible frequency decreases. This <strong>Hearing Age Test</strong> correlates your high-frequency cutoff with ISO 7029 statistical population data to provide an estimated biological ear age.
                    </p>
                 </div>
                 {/* Internal Link to Tool */}
                 <div className="mt-2 pl-3 flex flex-col gap-1">
                    <Link to="/tools/tone-generator" className="text-[10px] text-primary-500 hover:text-white font-mono flex items-center gap-1">
                       <Wrench size={10} /> Need a manual Tone Generator?
                    </Link>
                    <Link to="/tools/stereo-test" className="text-[10px] text-primary-500 hover:text-white font-mono flex items-center gap-1">
                       <Headphones size={10} /> Check Headphones Stereo Balance
                    </Link>
                 </div>
              </div>

           </div>
        </div>
      </div>
    </div>
  );
};

export default HearingAgeTest;