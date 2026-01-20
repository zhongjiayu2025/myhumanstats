import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Activity, Play, MousePointer2, RefreshCcw, Music2, TrendingUp, BarChart3, Wrench } from 'lucide-react';
import { saveStat } from '../../lib/core';
import { Link } from 'react-router-dom';

const RhythmTest: React.FC = () => {
  const [phase, setPhase] = useState<'idle' | 'listening' | 'tapping' | 'result'>('idle');
  const [count, setCount] = useState(0);
  const [taps, setTaps] = useState<{timestamp: number, interval: number, deviation: number}[]>([]);
  const [score, setScore] = useState(0);
  
  // Stats
  const [stats, setStats] = useState({ avgError: 0, stdDev: 0, tendency: 'Stable' });

  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastTapTimeRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0); // Reference for the grid
  
  const BPM = 120;
  const INTERVAL_MS = 60000 / BPM; // 500ms per beat
  const LISTENING_BEATS = 4;
  const TARGET_TAPS = 20; 

  // --- Audio Engine ---
  const playClick = (time: number, type: 'strong' | 'weak' = 'strong') => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    // Professional Metronome Click Synthesis
    // High-pass filtered square/sine mix for a sharp "woodblock" type sound
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.frequency.setValueAtTime(type === 'strong' ? 1000 : 800, time);
    osc.frequency.exponentialRampToValueAtTime(100, time + 0.05);
    osc.type = 'triangle'; // Richer than sine
    
    // High-pass filter to remove muddy low-end, making the transient clearer
    filter.type = 'highpass';
    filter.frequency.value = 300;

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(type === 'strong' ? 0.3 : 0.15, time + 0.002); // Fast attack
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08); // Short decay

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(time);
    osc.stop(time + 0.1);
  };

  const startTest = useCallback(() => {
    if (phase !== 'idle' && phase !== 'result') return;
    
    setTaps([]);
    setCount(0);
    setPhase('listening');
    
    audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    // Schedule audio a bit in the future
    const audioStartTime = ctx.currentTime + 0.5;
    
    // Establishing the Time Grid based on performance.now()
    // We approximate the start time in performance timeline
    startTimeRef.current = performance.now() + 500; 

    // Schedule Listening Beats
    for (let i = 0; i < LISTENING_BEATS; i++) {
      playClick(audioStartTime + i * (INTERVAL_MS / 1000), i === 0 ? 'strong' : 'weak');
    }

    // Switch UI phase after listening
    setTimeout(() => {
        setPhase('tapping');
        // Reset last tap ref to theoretically correct time for Interval calculation
        lastTapTimeRef.current = startTimeRef.current + (LISTENING_BEATS - 1) * INTERVAL_MS; 
    }, 500 + (LISTENING_BEATS * INTERVAL_MS));

  }, [phase]);

  const handleInput = useCallback((e?: React.MouseEvent | KeyboardEvent) => {
    if (phase !== 'tapping') return;
    if (e) e.preventDefault(); 

    const now = performance.now();
    
    const currentBeatIndex = count + LISTENING_BEATS;
    const expectedTime = startTimeRef.current + (currentBeatIndex * INTERVAL_MS);
    
    // Deviation from Grid (Sync)
    let deviation = now - expectedTime;
    
    // Interval consistency (Continuation)
    const intervalDiff = now - lastTapTimeRef.current;

    lastTapTimeRef.current = now;

    // Cap outliers
    if (deviation > 300) deviation = 300;
    if (deviation < -300) deviation = -300;

    const newTap = {
        timestamp: now,
        interval: intervalDiff,
        deviation: deviation
    };

    setTaps(prev => [...prev, newTap]);
    setCount(c => c + 1);

    if (count + 1 >= TARGET_TAPS) {
        finishTest([...taps, newTap]);
    }
  }, [phase, count, taps]);

  // Keyboard Support (Spacebar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.code === 'Space') {
            if (phase === 'idle' || phase === 'result') startTest();
            else if (phase === 'tapping') handleInput(e);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, startTest, handleInput]);

  const finishTest = (finalTaps: typeof taps) => {
    setPhase('result');
    
    // Analysis
    // 1. Stability (Jitter) -> Standard Deviation of Intervals
    const meanInterval = finalTaps.reduce((acc, t) => acc + t.interval, 0) / finalTaps.length;
    const variance = finalTaps.reduce((acc, t) => acc + Math.pow(t.interval - meanInterval, 2), 0) / finalTaps.length;
    const stdDev = Math.sqrt(variance);

    // 2. Bias (Drift/Latency) -> Average Deviation from Grid
    const avgDeviation = finalTaps.reduce((acc, t) => acc + t.deviation, 0) / finalTaps.length;
    
    // Score Calculation
    const score = Math.max(0, Math.min(100, Math.round(100 - (stdDev * 2) - (Math.abs(avgDeviation) * 0.2))));
    
    setScore(score);
    setStats({
        avgError: Math.round(avgDeviation),
        stdDev: Math.round(stdDev),
        tendency: avgDeviation < -15 ? 'Rushing' : avgDeviation > 15 ? 'Dragging' : 'Precise'
    });
    
    saveStat('rhythm-test', score);
  };

  // Render Helpers
  const getLastTapDeviation = () => {
      if (taps.length === 0) return 0;
      return taps[taps.length - 1].deviation;
  };
  
  const getDeviationColor = (dev: number) => {
      const abs = Math.abs(dev);
      if (abs < 25) return 'bg-emerald-500 shadow-[0_0_15px_#10b981]';
      if (abs < 60) return 'bg-yellow-400';
      return 'bg-rose-500';
  };

  const lastDev = getLastTapDeviation();

  return (
    <div className="max-w-2xl mx-auto select-none" onMouseDown={() => handleInput()}>
      
      {/* HUD Header */}
      {(phase === 'tapping' || phase === 'result') && (
        <div className="flex justify-between items-end border-b border-zinc-800 pb-4 mb-8">
           <div className="text-left">
              <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Tempo</div>
              <div className="text-xl text-white font-mono font-bold flex items-center gap-2">
                 {BPM} BPM <span className="text-zinc-600 text-sm">/ 500ms</span>
              </div>
           </div>
           <div className="text-right">
               <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Beat Count</div>
               <div className="text-xl text-primary-400 font-mono font-bold">{Math.min(count, TARGET_TAPS)}/{TARGET_TAPS}</div>
           </div>
        </div>
      )}

      {/* Main Interactive Area */}
      <div className="relative min-h-[300px] flex flex-col items-center justify-center">
        
        {phase === 'idle' && (
            <div className="text-center animate-in fade-in zoom-in">
                <div className="w-24 h-24 rounded-full border-2 border-zinc-700 bg-zinc-900 flex items-center justify-center mx-auto mb-6 group cursor-pointer hover:border-primary-500 hover:bg-zinc-800 transition-all" onClick={startTest}>
                    <Play size={32} className="text-zinc-500 group-hover:text-primary-400 ml-1 transition-colors" />
                </div>
                {/* Optimized H2 matches Primary Keyword */}
                <h2 className="text-2xl font-bold text-white mb-2">Rhythm Test</h2>
                <p className="text-zinc-400 text-sm max-w-md mx-auto mb-6 leading-relaxed">
                    <strong>Synchronization-Continuation Task</strong><br/>
                    Master this <strong>Rhythm Test</strong>. Listen to 4 beats, then continue tapping blindly. This test measures your beat perception and internal clock stability.
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded text-[10px] text-zinc-500 font-mono">
                    <span>TIP: USE KEYBOARD SPACEBAR</span>
                </div>
            </div>
        )}

        {phase === 'listening' && (
            <div className="flex flex-col items-center gap-8">
                <div className="relative w-32 h-32 flex items-center justify-center">
                    <div className="absolute inset-0 border-4 border-zinc-800 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-primary-500 rounded-full animate-ping opacity-20"></div>
                    <Music2 size={48} className="text-primary-500 animate-bounce" />
                </div>
                <div className="text-sm font-mono text-primary-400 animate-pulse uppercase tracking-widest">
                    Listen & Sync...
                </div>
            </div>
        )}

        {phase === 'tapping' && (
            <div className="w-full max-w-md">
                <div className="relative h-20 w-full bg-black border border-zinc-800 mb-4 overflow-hidden rounded-md clip-corner-sm">
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_49%,rgba(255,255,255,0.1)_50%,transparent_51%)] bg-[size:100%_100%]"></div>
                    <div className="absolute top-0 bottom-0 left-1/2 w-[60px] bg-emerald-500/5 -translate-x-1/2 border-x border-emerald-500/20"></div>
                    <div className="absolute top-2 left-2 text-[9px] text-zinc-700 font-mono">EARLY</div>
                    <div className="absolute top-2 right-2 text-[9px] text-zinc-700 font-mono">LATE</div>
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] text-emerald-500/50 font-mono font-bold tracking-widest">PERFECT</div>
                    {taps.length > 0 && (
                        <div 
                            key={taps.length}
                            className={`absolute top-1/2 -translate-y-1/2 w-1.5 h-12 rounded-full ${getDeviationColor(lastDev)}`}
                            style={{ 
                                left: `calc(50% + ${lastDev}px)`,
                                transform: 'translate(-50%, -50%)',
                                animation: 'ping 0.4s cubic-bezier(0, 0, 0.2, 1)'
                            }}
                        ></div>
                    )}
                </div>
                
                <div className="h-8 flex justify-center items-center font-mono font-bold text-lg mb-8">
                    {taps.length === 0 ? (
                        <span className="text-zinc-600 text-sm animate-pulse">TAP TO THE BEAT</span>
                    ) : (
                        <span className={`flex items-center gap-2 ${Math.abs(lastDev) < 25 ? 'text-emerald-500' : Math.abs(lastDev) < 60 ? 'text-yellow-500' : 'text-rose-500'}`}>
                            {Math.abs(lastDev) < 10 ? 'PERFECT' : lastDev < 0 ? 'EARLY' : 'LATE'}
                            <span className="text-sm opacity-70">
                                {lastDev > 0 ? `+${Math.round(lastDev)}` : `${Math.round(lastDev)}`}ms
                            </span>
                        </span>
                    )}
                </div>
                
                <div className="text-center">
                    <div className="w-20 h-20 bg-zinc-900 rounded-full border-2 border-zinc-700 mx-auto flex items-center justify-center active:bg-zinc-800 active:border-primary-500 transition-all cursor-pointer shadow-lg">
                        <MousePointer2 size={24} className="text-zinc-500" />
                    </div>
                    <div className="text-[10px] text-zinc-600 mt-3 font-mono">TAP HERE OR SPACEBAR</div>
                </div>
            </div>
        )}

        {phase === 'result' && (
            <div className="w-full animate-in slide-in-from-bottom-4 fade-in duration-500">
                <div className="grid grid-cols-3 gap-4 mb-8">
                     <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg text-center">
                        <div className="text-[10px] text-zinc-500 uppercase font-mono mb-1">Stability (Jitter)</div>
                        <div className="text-2xl font-bold text-white">{stats.stdDev}ms</div>
                        <div className="text-[9px] text-zinc-600">STD DEV</div>
                     </div>
                     <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg text-center">
                        <div className="text-[10px] text-zinc-500 uppercase font-mono mb-1">Drift (Bias)</div>
                        <div className={`text-2xl font-bold ${stats.tendency === 'Stable' ? 'text-emerald-400' : 'text-yellow-400'}`}>
                            {stats.avgError > 0 ? '+' : ''}{stats.avgError}ms
                        </div>
                        <div className="text-[9px] text-zinc-600 flex justify-center items-center gap-1">
                            {stats.tendency} {stats.tendency === 'Rushing' ? <TrendingUp size={10} className="rotate-180"/> : stats.tendency === 'Dragging' ? <TrendingUp size={10}/> : <Activity size={10}/>}
                        </div>
                     </div>
                     <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg text-center">
                        <div className="text-[10px] text-zinc-500 uppercase font-mono mb-1">Rhythm Score</div>
                        <div className="text-2xl font-bold text-primary-400">{score}</div>
                        <div className="text-[9px] text-zinc-600">POINTS</div>
                     </div>
                </div>

                <div className="bg-black border border-zinc-800 p-4 rounded-lg mb-6 relative h-48 overflow-hidden">
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-zinc-800 border-t border-dashed border-zinc-700"></div>
                    <div className="absolute top-2 left-2 text-[9px] text-zinc-600 font-mono">LATE (+150ms)</div>
                    <div className="absolute bottom-2 left-2 text-[9px] text-zinc-600 font-mono">EARLY (-150ms)</div>
                    <div className="relative w-full h-full flex items-center justify-between px-4">
                        {taps.map((t, i) => {
                            const yPos = Math.max(-70, Math.min(70, t.deviation / 2));
                            return (
                                <div key={i} className="flex flex-col items-center group relative h-full justify-center" style={{ width: `${100/taps.length}%` }}>
                                    <div 
                                        className={`w-1.5 h-1.5 rounded-full ${getDeviationColor(t.deviation)} transition-all z-10`}
                                        style={{ transform: `translateY(${yPos}px)` }}
                                    ></div>
                                    <div 
                                        className={`w-px bg-zinc-800 absolute top-1/2`}
                                        style={{ height: `${Math.abs(yPos)}px`, transform: yPos > 0 ? 'translateY(0)' : `translateY(${yPos}px)` }}
                                    ></div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="bg-zinc-900/50 p-4 border border-zinc-800 text-xs text-zinc-400 leading-relaxed mb-6">
                    {score > 90 ? "Metronomic precision. Your Rhythm Test results suggest an incredible internal clock." :
                     score > 70 ? "Solid rhythm. Your Rhythm Test indicates a stable internal clock with minor deviations." :
                     "Inconsistent timing. This Rhythm Test detected significant jitter or drift."}
                </div>

                <button onClick={() => setPhase('idle')} className="btn-secondary w-full flex justify-center items-center gap-2">
                    <RefreshCcw size={16} /> Retry Rhythm Test
                </button>
            </div>
        )}

      </div>
      
      {/* SEO Footer */}
      <div className="mt-12 border-t border-zinc-800 pt-6 text-left">
          <h4 className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-2 flex items-center gap-2">
             <BarChart3 size={12} /> Technical Context: Temporal consistency
          </h4>
          <p className="text-xs text-zinc-500 leading-relaxed">
             Why take a <strong>Rhythm Test</strong>? This tool serves as a precise <strong>rhythm test</strong> designed to quantify temporal consistency. Unlike a standard metronome check, this online <strong>rhythm test</strong> analyzes milliseconds of drift to provide a comprehensive aptitude score.
          </p>
          {/* Internal Link */}
          <div className="mt-2">
             <Link to="/tools/bpm-counter" className="text-[10px] text-primary-500 hover:text-white font-mono flex items-center gap-1">
                <Wrench size={10} /> Calculate BPM manually? Use BPM Counter
             </Link>
          </div>
      </div>
    </div>
  );
};

export default RhythmTest;