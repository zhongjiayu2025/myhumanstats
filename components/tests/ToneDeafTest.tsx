
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowUp, ArrowDown, Play, Check, X, RotateCcw, Volume2, Ear, BarChart3, Info, GitMerge, Music } from 'lucide-react';
import { saveStat } from '../../lib/core';

type Instrument = 'sine' | 'piano' | 'strings';

const ToneDeafTest: React.FC = () => {
  const [stage, setStage] = useState<'intro' | 'playing' | 'guessing' | 'feedback' | 'result'>('intro');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [frequencies, setFrequencies] = useState<{f1: number, f2: number} | null>(null);
  
  const [correctAnswer, setCorrectAnswer] = useState<'higher' | 'lower'>('higher');
  const [userGuess, setUserGuess] = useState<'higher' | 'lower' | null>(null);
  const [replaysLeft, setReplaysLeft] = useState(3);
  
  // Settings
  const [instrument, setInstrument] = useState<Instrument>('piano');
  
  // Audio Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  
  // Visualization Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  const TOTAL_LEVELS = 10;
  const BASE_FREQ = 440; // A4 Standard

  // Difficulty Curve
  const getDiffForLevel = (lvl: number) => {
      return Math.max(1.5, Math.round(50 * Math.pow(0.55, lvl - 1) * 10) / 10);
  };

  const calculateCents = (f1: number, f2: number) => {
      return Math.abs(Math.round(1200 * Math.log2(f2 / f1)));
  };

  useEffect(() => {
    return () => stopAudio();
  }, []);

  // --- Visualization Logic ---
  const drawVisualizer = (isActive: boolean, frequency: number, isInterference = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#09090b'; 
    ctx.fillRect(0, 0, width, height);

    if (!isActive) {
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.strokeStyle = '#27272a';
        ctx.lineWidth = 1;
        ctx.stroke();
        return;
    }

    const time = Date.now() / 1000;
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#06b6d4';

    // Draw Sine Wave
    const wavelength = 30000 / frequency; 
    
    for (let x = 0; x < width; x++) {
        const window = Math.sin((x / width) * Math.PI);
        let y = 0;
        
        if (isInterference && frequencies) {
            // Visualize the beat frequency physically
            const y1 = Math.sin((x / wavelength) - (time * 25));
            const diff = Math.abs(frequencies.f1 - frequencies.f2);
            // Modulation wave
            const mod = Math.cos(time * diff * Math.PI); 
            y = y1 * mod * (height / 3) * window + (height / 2);
        } else {
            y = Math.sin((x / wavelength) - (time * 25)) * (height / 3) * window + (height / 2);
        }
        
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();

    animationRef.current = requestAnimationFrame(() => drawVisualizer(true, frequency, isInterference));
  };

  const stopAudio = () => {
      if (oscRef.current) {
          try { oscRef.current.stop(); oscRef.current.disconnect(); } catch (e) {}
          oscRef.current = null;
      }
      if (gainRef.current) {
          try { gainRef.current.disconnect(); } catch(e) {}
          gainRef.current = null;
      }
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      drawVisualizer(false, 0);
  };

  const initAudioCtx = () => {
      if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
      return audioCtxRef.current;
  };

  // Play two tones simultaneously to hear the "beats"
  const playInterference = () => {
      if (!frequencies) return;
      stopAudio();
      
      const ctx = initAudioCtx();
      const now = ctx.currentTime;
      const duration = 2.0;

      const masterGain = ctx.createGain();
      masterGain.connect(ctx.destination);
      masterGain.gain.setValueAtTime(0.1, now);
      masterGain.gain.linearRampToValueAtTime(0.1, now + duration - 0.1);
      masterGain.gain.linearRampToValueAtTime(0, now + duration);

      const osc1 = ctx.createOscillator();
      osc1.frequency.value = frequencies.f1;
      osc1.connect(masterGain);

      const osc2 = ctx.createOscillator();
      osc2.frequency.value = frequencies.f2;
      osc2.connect(masterGain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + duration);
      osc2.stop(now + duration);

      drawVisualizer(true, frequencies.f1, true);
      setTimeout(() => stopAudio(), duration * 1000);
  };

  const playToneSequence = useCallback(async () => {
    if (stage === 'playing') return;
    setStage('playing');
    setUserGuess(null);
    
    const ctx = initAudioCtx();
    const diff = getDiffForLevel(level);
    
    const isHigher = Math.random() > 0.5;
    setCorrectAnswer(isHigher ? 'higher' : 'lower');
    
    const jitter = (Math.random() * 60) - 30;
    const roundBase = BASE_FREQ + jitter; 
    const freq2 = isHigher ? roundBase + diff : roundBase - diff;

    setFrequencies({ f1: Math.round(roundBase * 10)/10, f2: Math.round(freq2 * 10)/10 });

    const playSingleTone = (freq: number, duration: number) => new Promise<void>((resolve) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        // --- Timbre Synthesis ---
        const now = ctx.currentTime;
        
        if (instrument === 'piano') {
            osc.type = 'triangle'; // Piano-ish base
            // Envelope: Percussive
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.3, now + 0.02); // Fast attack
            gain.gain.exponentialRampToValueAtTime(0.01, now + duration); // Long decay
        } else if (instrument === 'strings') {
            osc.type = 'sawtooth'; // String-ish base
            // Envelope: Swell
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.15, now + 0.2); // Slow attack
            gain.gain.setValueAtTime(0.15, now + duration - 0.1); // Sustain
            gain.gain.linearRampToValueAtTime(0, now + duration); // Release
            
            // Filter to soften the saw
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 1500;
            osc.disconnect();
            osc.connect(filter);
            filter.connect(gain);
        } else {
            // Sine / Pure
            osc.type = 'sine';
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
            gain.gain.setValueAtTime(0.2, now + duration - 0.05);
            gain.gain.linearRampToValueAtTime(0, now + duration);
        }

        if (instrument !== 'strings') osc.connect(gain); // Strings connected via filter
        gain.connect(ctx.destination);
        
        oscRef.current = osc;
        gainRef.current = gain;
        
        drawVisualizer(true, freq);
        osc.start(now);
        osc.stop(now + duration + 0.1);
        
        setTimeout(() => {
            stopAudio();
            resolve();
        }, duration * 1000);
    });

    await playSingleTone(roundBase, 0.6);
    await new Promise(r => setTimeout(r, 400)); 
    await playSingleTone(freq2, 0.6);
    
    setStage('guessing');
  }, [level, stage, instrument]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
        if (stage !== 'guessing') return;
        if (e.key === 'ArrowUp') handleGuess('higher');
        if (e.key === 'ArrowDown') handleGuess('lower');
        if (e.code === 'Space' && replaysLeft > 0) playToneSequence();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [stage, replaysLeft, playToneSequence]);

  const handleGuess = (guess: 'higher' | 'lower') => {
    setUserGuess(guess);
    const isCorrect = guess === correctAnswer;
    
    if (navigator.vibrate) {
        if (isCorrect) navigator.vibrate(50);
        else navigator.vibrate([50, 50, 50]);
    }

    setStage('feedback');
    
    if (isCorrect) {
        setScore(s => s + 1);
        setTimeout(() => {
            if (level < TOTAL_LEVELS) {
                setLevel(l => l + 1);
                setTimeout(() => playToneSequence(), 500); 
            } else {
                finishGame(score + 1); 
            }
        }, 2200);
    } else {
        // Longer pause on failure to allow user to use "Compare" feature
        setTimeout(() => {
            if (level < TOTAL_LEVELS) {
                setLevel(l => l + 1);
                setTimeout(() => playToneSequence(), 500);
            } else {
                finishGame(score);
            }
        }, 4000); 
    }
  };

  const finishGame = (finalScore: number) => {
    setStage('result');
    const percentage = Math.round((finalScore / TOTAL_LEVELS) * 100);
    saveStat('tone-deaf', percentage);
  };

  const restart = () => {
      setLevel(1);
      setScore(0);
      setReplaysLeft(3);
      setStage('intro');
  };

  return (
    <div className="max-w-xl mx-auto text-center select-none">
      
      {(stage !== 'intro' && stage !== 'result') && (
        <div className="flex justify-between items-end border-b border-zinc-800 pb-4 mb-6">
           <div className="text-left">
              <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Diff Threshold</div>
              <div className="flex items-center gap-3">
                  <div className="text-xl text-white font-mono font-bold">
                     {getDiffForLevel(level)} Hz
                  </div>
                  <div className="flex items-center h-4 gap-[2px]">
                      <div className="w-0.5 h-full bg-zinc-600"></div>
                      <div className="h-[2px] bg-primary-500 shadow-[0_0_5px_#06b6d4] transition-all duration-500 ease-out" style={{ width: `${Math.max(2, getDiffForLevel(level) * 1.5)}px` }}></div>
                      <div className="w-0.5 h-full bg-zinc-600"></div>
                  </div>
              </div>
           </div>
           <div className="text-right">
               <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Level</div>
               <div className="text-xl text-primary-400 font-mono font-bold">{level}/{TOTAL_LEVELS}</div>
           </div>
        </div>
      )}

      <div className="relative min-h-[360px] flex flex-col items-center justify-center">
        
        {stage === 'intro' && (
            <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto border border-zinc-800 shadow-inner">
                    <Ear size={32} className="text-primary-500" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Tone Deaf Test</h2>
                    <p className="text-zinc-400 text-sm max-w-md mx-auto leading-relaxed">
                        Assess your <strong>relative pitch</strong> capabilities.
                        <br/>
                        You will hear two tones. Determine if the <strong>second tone</strong> is higher or lower. 
                    </p>
                </div>

                {/* Instrument Selection */}
                <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 max-w-sm mx-auto">
                    <div className="text-[10px] text-zinc-500 uppercase font-mono mb-3 tracking-widest">Select Timbre</div>
                    <div className="grid grid-cols-3 gap-2">
                        {['piano', 'sine', 'strings'].map((inst) => (
                            <button
                                key={inst}
                                onClick={() => setInstrument(inst as Instrument)}
                                className={`py-2 px-1 text-xs font-bold rounded border transition-all ${instrument === inst ? 'bg-primary-900/30 border-primary-500 text-primary-400' : 'bg-zinc-900 border-zinc-700 text-zinc-500 hover:text-white'}`}
                            >
                                {inst.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                <button onClick={playToneSequence} className="btn-primary flex items-center gap-2 mx-auto">
                    <Play size={18} /> Begin Calibration
                </button>
                <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-600 font-mono mt-4">
                    <Volume2 size={12} />
                    <span>AUDIO ENABLED • WEAR HEADPHONES</span>
                </div>
            </div>
        )}

        {(stage === 'playing' || stage === 'guessing' || stage === 'feedback') && (
            <div className="w-full max-w-sm mx-auto space-y-6 relative">
                
                <div className={`
                    w-full h-32 bg-black border relative overflow-hidden clip-corner-sm transition-colors duration-200
                    ${stage === 'feedback' && userGuess === correctAnswer ? 'border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : ''}
                    ${stage === 'feedback' && userGuess !== correctAnswer ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'border-zinc-800'}
                `}>
                    <canvas ref={canvasRef} width={400} height={128} className="w-full h-full" />
                    
                    {stage === 'playing' && (
                        <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 bg-primary-900/50 rounded-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse"></div>
                            <span className="text-[9px] text-primary-200 font-mono uppercase">Signal Active ({instrument})</span>
                        </div>
                    )}

                    {stage === 'feedback' && frequencies && (
                        <div className="absolute inset-0 bg-black/90 backdrop-blur-[2px] flex flex-col items-center justify-center animate-in fade-in duration-300">
                            
                            <div className="flex items-center gap-6 mb-2">
                                <div className="text-center">
                                    <div className="text-[9px] text-zinc-600 uppercase">Ref</div>
                                    <div className="text-lg font-mono text-zinc-400">{frequencies.f1}</div>
                                </div>
                                <div className="text-primary-500">
                                   {frequencies.f2 > frequencies.f1 ? <ArrowUp size={20} /> : <ArrowDown size={20} />}
                                </div>
                                <div className="text-center">
                                    <div className="text-[9px] text-zinc-600 uppercase">Target</div>
                                    <div className="text-lg font-mono text-white">{frequencies.f2}</div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <div className="bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800 flex items-center gap-2">
                                    <span className="text-xs text-zinc-500 font-mono">DELTA:</span>
                                    <span className="text-sm font-bold text-primary-400">{calculateCents(frequencies.f1, frequencies.f2)} Cents</span>
                                </div>
                                
                                {/* Educational Feature */}
                                <button 
                                    onClick={playInterference}
                                    className="px-3 py-1 bg-indigo-900/50 hover:bg-indigo-900 border border-indigo-500/50 rounded-full flex items-center gap-2 text-xs font-bold text-indigo-300 transition-colors"
                                >
                                    <GitMerge size={12} /> Play Interference
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => handleGuess('higher')}
                        disabled={stage !== 'guessing'}
                        className={`
                            h-32 border border-zinc-800 bg-surface flex flex-col items-center justify-center gap-3 transition-all duration-200 group relative overflow-hidden clip-corner-sm
                            ${stage === 'guessing' ? 'hover:bg-zinc-800 hover:border-primary-500/30 cursor-pointer active:scale-95' : 'opacity-40 cursor-not-allowed'}
                            ${userGuess === 'higher' && correctAnswer === 'higher' ? '!bg-emerald-900/20 !border-emerald-500' : ''}
                            ${userGuess === 'higher' && correctAnswer === 'lower' ? '!bg-red-900/20 !border-red-500' : ''}
                        `}
                    >
                        <ArrowUp size={32} className={`text-zinc-500 transition-colors ${stage === 'guessing' ? 'group-hover:text-primary-400' : ''}`} />
                        <span className="text-sm font-bold text-white uppercase tracking-wider">Higher</span>
                        <div className="absolute bottom-2 text-[9px] text-zinc-700 font-mono group-hover:text-zinc-500 transition-colors">[KEY: UP]</div>
                    </button>

                    <button 
                        onClick={() => handleGuess('lower')}
                        disabled={stage !== 'guessing'}
                        className={`
                            h-32 border border-zinc-800 bg-surface flex flex-col items-center justify-center gap-3 transition-all duration-200 group relative overflow-hidden clip-corner-sm
                            ${stage === 'guessing' ? 'hover:bg-zinc-800 hover:border-primary-500/30 cursor-pointer active:scale-95' : 'opacity-40 cursor-not-allowed'}
                            ${userGuess === 'lower' && correctAnswer === 'lower' ? '!bg-emerald-900/20 !border-emerald-500' : ''}
                            ${userGuess === 'lower' && correctAnswer === 'higher' ? '!bg-red-900/20 !border-red-500' : ''}
                        `}
                    >
                        <ArrowDown size={32} className={`text-zinc-500 transition-colors ${stage === 'guessing' ? 'group-hover:text-primary-400' : ''}`} />
                        <span className="text-sm font-bold text-white uppercase tracking-wider">Lower</span>
                        <div className="absolute bottom-2 text-[9px] text-zinc-700 font-mono group-hover:text-zinc-500 transition-colors">[KEY: DOWN]</div>
                    </button>
                </div>

                <div className="h-10 flex items-center justify-center">
                    {stage === 'feedback' ? (
                        <div className={`flex items-center gap-2 font-bold uppercase tracking-widest animate-in zoom-in duration-300 ${userGuess === correctAnswer ? 'text-emerald-500' : 'text-red-500'}`}>
                            {userGuess === correctAnswer ? <Check size={18} /> : <X size={18} />}
                            {userGuess === correctAnswer ? 'Pitch Confirmed' : 'Deviation Detected'}
                        </div>
                    ) : (
                        <div className="flex justify-center">
                            <button 
                                onClick={playToneSequence} 
                                disabled={stage !== 'guessing' || replaysLeft <= 0}
                                className="flex items-center gap-2 text-xs text-zinc-500 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-500 transition-colors font-mono"
                            >
                                <RotateCcw size={12} /> REPLAY SIGNAL ({replaysLeft})
                            </button>
                        </div>
                    )}
                </div>
            </div>
        )}

        {stage === 'result' && (
            <div className="max-w-md w-full animate-in slide-in-from-bottom-4 fade-in duration-500">
                <div className="tech-border bg-black p-8 clip-corner-lg mb-6 text-center">
                    <h2 className="text-zinc-500 font-mono text-sm uppercase tracking-widest mb-2">Tone Deaf Analysis</h2>
                    <div className="text-5xl font-bold text-white mb-2">{Math.round((score / TOTAL_LEVELS) * 100)}<span className="text-2xl text-zinc-600">%</span></div>
                    
                    <div className="h-px bg-zinc-800 w-full my-6"></div>
                    
                    <div className="space-y-4 text-left">
                        <div className="flex justify-between items-center">
                           <span className="text-zinc-400 text-sm">Levels Cleared</span>
                           <span className="text-white font-mono">{score}/{TOTAL_LEVELS}</span>
                        </div>
                        <div className="flex justify-between items-center">
                           <span className="text-zinc-400 text-sm">JND (Sensitivity)</span>
                           <span className="text-primary-400 font-bold font-mono">
                               ~{score < 1 ? '>50' : getDiffForLevel(score)} Hz
                           </span>
                        </div>
                    </div>
                    
                    <div className="mt-8 bg-zinc-900/50 p-4 border border-zinc-800 text-xs text-zinc-400 leading-relaxed text-left flex gap-3">
                        <Info size={32} className="text-zinc-600 shrink-0" />
                        <div>
                        {score >= 9 ? "Exceptional. Your pitch discrimination is < 2Hz, putting you in the top tier of auditory sensitivity. No signs of Tone Deafness." :
                         score >= 6 ? "Normal Range. You can reliably detect standard semitone differences." :
                         score >= 3 ? "Below Average. Subtle pitch changes may escape you." :
                         "Low Sensitivity. This result suggests potential Congenital Amusia (Tone Deafness), or simply a lack of musical training."}
                        </div>
                    </div>
                </div>
                
                <button onClick={restart} className="btn-secondary w-full">Restart Protocol</button>
            </div>
        )}

      </div>
      
      <div className="mt-12 border-t border-zinc-800 pt-6 text-left">
          <h4 className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-2 flex items-center gap-2">
             <BarChart3 size={12} /> Clinical Context: Cents & Amusia
          </h4>
          <p className="text-xs text-zinc-500 leading-relaxed">
             This <strong>Tone Deaf Test</strong> evaluates your Just Noticeable Difference (JND) in frequency. In music theory, a <strong>Cent</strong> is a logarithmic unit of measure for musical intervals (100 Cents = 1 Semitone). 
             <br/><br/>
             <strong>Tip:</strong> If you struggle to hear the difference, use the "Play Interference" button. This plays both tones together, creating a "wobble" (beat frequency) equal to the difference in Hertz. Learning to hear this wobble is a key skill in tuning instruments.
          </p>
      </div>

    </div>
  );
};

export default ToneDeafTest;
