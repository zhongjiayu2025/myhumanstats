
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Activity, Play, MousePointer2, RefreshCcw, Music2, TrendingUp, BarChart3, Wrench, Settings } from 'lucide-react';
import { saveStat } from '../../lib/core';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell, LineChart, Line, CartesianGrid } from 'recharts';

const RhythmTest: React.FC = () => {
  const [phase, setPhase] = useState<'idle' | 'calibrate' | 'listening' | 'tapping' | 'result'>('idle');
  const [count, setCount] = useState(0);
  const [taps, setTaps] = useState<{timestamp: number, interval: number, deviation: number}[]>([]);
  const [score, setScore] = useState(0);
  const [activeBeat, setActiveBeat] = useState(-1); // For visual metronome
  
  // Calibration
  const [inputLatency, setInputLatency] = useState(0);
  const [calibrationTaps, setCalibrationTaps] = useState<number[]>([]);
  
  // Stats
  const [stats, setStats] = useState({ avgError: 0, stdDev: 0, tendency: 'Stable' });
  const [histData, setHistData] = useState<any[]>([]);
  const [driftData, setDriftData] = useState<any[]>([]);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastTapTimeRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0); 
  
  const BPM = 120;
  const INTERVAL_MS = 60000 / BPM; // 500ms per beat
  const LISTENING_BEATS = 4;
  const TARGET_TAPS = 20; 

  const playClick = (time: number, type: 'strong' | 'weak' = 'strong') => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.frequency.setValueAtTime(type === 'strong' ? 1000 : 800, time);
    osc.frequency.exponentialRampToValueAtTime(100, time + 0.05);
    osc.type = 'triangle'; 
    
    filter.type = 'highpass';
    filter.frequency.value = 300;

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(type === 'strong' ? 0.3 : 0.15, time + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(time);
    osc.stop(time + 0.1);
  };

  const startCalibration = () => {
      setPhase('calibrate');
      setCalibrationTaps([]);
      setCount(0);
      
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      
      const startTime = ctx.currentTime + 0.5;
      startTimeRef.current = performance.now() + 500;
      
      // Play 10 beats for calibration
      for(let i=0; i<10; i++) {
          playClick(startTime + i * (INTERVAL_MS/1000), 'weak');
          setTimeout(() => setActiveBeat(i), 500 + i * INTERVAL_MS);
      }
  };

  const handleCalibrationTap = () => {
      if (count >= 10) return;
      const now = performance.now();
      const expected = startTimeRef.current + (count * INTERVAL_MS);
      const diff = now - expected;
      
      setCalibrationTaps(prev => [...prev, diff]);
      setCount(c => c + 1);
      
      if (count >= 9) {
          // Finish calibration
          setTimeout(() => {
              const validTaps = calibrationTaps.slice(2); // Remove first 2 for stability
              const avg = validTaps.reduce((a,b)=>a+b, 0) / validTaps.length;
              setInputLatency(avg);
              startTest();
          }, 500);
      }
  };

  const startTest = useCallback(() => {
    setTaps([]);
    setCount(0);
    setPhase('listening');
    setActiveBeat(-1);
    
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const audioStartTime = ctx.currentTime + 0.5;
    
    // Establishing the Time Grid based on performance.now()
    startTimeRef.current = performance.now() + 500; 

    // Schedule Listening Beats
    for (let i = 0; i < LISTENING_BEATS; i++) {
      playClick(audioStartTime + i * (INTERVAL_MS / 1000), i === 0 ? 'strong' : 'weak');
      // Visual Metronome logic
      setTimeout(() => setActiveBeat(i), 500 + (i * INTERVAL_MS));
    }

    setTimeout(() => {
        setPhase('tapping');
        lastTapTimeRef.current = startTimeRef.current + (LISTENING_BEATS - 1) * INTERVAL_MS; 
    }, 500 + (LISTENING_BEATS * INTERVAL_MS));

  }, [inputLatency]);

  const handleInput = useCallback((e?: React.MouseEvent | KeyboardEvent) => {
    if (phase === 'calibrate') {
        handleCalibrationTap();
        return;
    }
    
    if (phase !== 'tapping') return;
    if (e) e.preventDefault(); 

    const now = performance.now();
    
    const currentBeatIndex = count + LISTENING_BEATS;
    const expectedTime = startTimeRef.current + (currentBeatIndex * INTERVAL_MS);
    
    // Deviation from Grid (Sync) - Corrected by input latency
    let deviation = now - expectedTime - inputLatency;
    
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
  }, [phase, count, taps, inputLatency]);

  // Keyboard Support (Spacebar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.code === 'Space') {
            if (phase === 'idle' || phase === 'result') startCalibration();
            else if (phase === 'tapping' || phase === 'calibrate') handleInput(e);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, startCalibration, handleInput]);

  const finishTest = (finalTaps: typeof taps) => {
    setPhase('result');
    
    const meanInterval = finalTaps.reduce((acc, t) => acc + t.interval, 0) / finalTaps.length;
    const variance = finalTaps.reduce((acc, t) => acc + Math.pow(t.interval - meanInterval, 2), 0) / finalTaps.length;
    const stdDev = Math.sqrt(variance);

    const avgDeviation = finalTaps.reduce((acc, t) => acc + t.deviation, 0) / finalTaps.length;
    
    const score = Math.max(0, Math.min(100, Math.round(100 - (stdDev * 2) - (Math.abs(avgDeviation) * 0.2))));
    
    setScore(score);
    setStats({
        avgError: Math.round(avgDeviation),
        stdDev: Math.round(stdDev),
        tendency: avgDeviation < -15 ? 'Rushing' : avgDeviation > 15 ? 'Dragging' : 'Precise'
    });
    
    // 1. Histogram Data
    const bins = Array.from({length: 11}, (_, i) => ({
        range: (i - 5) * 20, 
        label: `${(i-5)*20}ms`,
        count: 0
    }));
    
    finalTaps.forEach(t => {
        const binIndex = Math.max(0, Math.min(10, Math.floor((t.deviation + 110) / 20)));
        bins[binIndex].count++;
    });
    setHistData(bins);

    // 2. Drift Line Chart Data
    const drifts = finalTaps.map((t, i) => ({
        beat: i + 1,
        deviation: Math.round(t.deviation)
    }));
    setDriftData(drifts);

    saveStat('rhythm-test', score);
  };

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
      {(phase === 'tapping' || phase === 'result' || phase === 'calibrate') && (
        <div className="flex justify-between items-end border-b border-zinc-800 pb-4 mb-8">
           <div className="text-left">
              <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Tempo</div>
              <div className="text-xl text-white font-mono font-bold flex items-center gap-2">
                 {BPM} BPM <span className="text-zinc-600 text-sm">/ 500ms</span>
              </div>
           </div>
           <div className="text-right">
               <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">{phase === 'calibrate' ? 'Calibrating' : 'Beat Count'}</div>
               <div className="text-xl text-primary-400 font-mono font-bold">
                   {phase === 'calibrate' ? `${count}/10` : `${Math.min(count, TARGET_TAPS)}/${TARGET_TAPS}`}
               </div>
           </div>
        </div>
      )}

      {/* Main Interactive Area */}
      <div className="relative min-h-[300px] flex flex-col items-center justify-center">
        
        {phase === 'idle' && (
            <div className="text-center animate-in fade-in zoom-in">
                <div className="w-24 h-24 rounded-full border-2 border-zinc-700 bg-zinc-900 flex items-center justify-center mx-auto mb-6 group cursor-pointer hover:border-primary-500 hover:bg-zinc-800 transition-all" onClick={startCalibration}>
                    <Play size={32} className="text-zinc-500 group-hover:text-primary-400 ml-1 transition-colors" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Rhythm Test</h2>
                <p className="text-zinc-400 text-sm max-w-md mx-auto mb-6 leading-relaxed">
                    <strong>Synchronization-Continuation Task</strong><br/>
                    Listen to 4 beats, then continue tapping blindly to the grid. Measures your internal clock stability and drift.
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded text-[10px] text-zinc-500 font-mono">
                    <span>TIP: USE KEYBOARD SPACEBAR</span>
                </div>
            </div>
        )}

        {phase === 'calibrate' && (
            <div className="text-center animate-in fade-in">
                <div className="flex justify-center mb-6">
                    <Settings size={48} className="text-primary-500 animate-spin-slow" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Hardware Calibration</h2>
                <p className="text-zinc-400 text-sm mb-8">Tap along with the beat to measure your system latency.</p>
                
                <div className="w-full h-2 bg-zinc-800 rounded-full max-w-xs mx-auto overflow-hidden">
                    <div className="h-full bg-primary-500 transition-all duration-200" style={{ width: `${count * 10}%` }}></div>
                </div>
            </div>
        )}

        {phase === 'listening' && (
            <div className="flex flex-col items-center gap-8">
                <div className="relative w-32 h-32 flex items-center justify-center">
                    <div className="absolute inset-0 border-4 border-zinc-800 rounded-full"></div>
                    {/* Visual Metronome */}
                    <div 
                        className={`absolute inset-0 border-4 border-primary-500 rounded-full transition-all duration-100 ${activeBeat >= 0 ? 'scale-110 opacity-100' : 'scale-100 opacity-20'}`}
                    ></div>
                    <Music2 size={48} className={`text-primary-500 transition-transform ${activeBeat >= 0 ? 'scale-125' : 'scale-100'}`} />
                </div>
                <div className="text-sm font-mono text-primary-400 uppercase tracking-widest">
                    Listen & Sync... {activeBeat >= 0 ? activeBeat + 1 : ''}
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

                {/* Dual Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {/* Histogram */}
                    <div className="h-48 w-full bg-black/30 border border-zinc-800 rounded p-4 relative">
                        <div className="absolute top-2 left-2 text-[10px] text-zinc-500 font-mono">DISTRIBUTION</div>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={histData}>
                                <ReferenceLine x="0ms" stroke="#10b981" strokeDasharray="3 3" />
                                <XAxis dataKey="label" stroke="#555" fontSize={9} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', fontSize: '12px' }} />
                                <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                                    {histData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={Math.abs(entry.range) < 30 ? '#10b981' : Math.abs(entry.range) < 60 ? '#facc15' : '#ef4444'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Drift Line Chart */}
                    <div className="h-48 w-full bg-black/30 border border-zinc-800 rounded p-4 relative">
                        <div className="absolute top-2 left-2 text-[10px] text-zinc-500 font-mono">TEMPO DRIFT</div>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={driftData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="beat" stroke="#555" fontSize={9} tickLine={false} axisLine={false} tickFormatter={(val) => `B${val}`} />
                                <YAxis stroke="#555" fontSize={9} tickLine={false} axisLine={false} />
                                <ReferenceLine y={0} stroke="#10b981" strokeDasharray="3 3" />
                                <Tooltip cursor={{stroke: '#333'}} contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', fontSize: '12px' }} />
                                <Line type="monotone" dataKey="deviation" stroke="#06b6d4" strokeWidth={2} dot={{r: 2, fill: '#06b6d4'}} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-zinc-900/50 p-4 border border-zinc-800 text-xs text-zinc-400 leading-relaxed mb-6">
                    <strong>Measured Input Latency:</strong> {Math.round(inputLatency)}ms (Compensated)
                    <br/><br/>
                    {score > 90 ? "Metronomic precision. Your internal clock is rock solid." :
                     score > 70 ? "Solid rhythm. Minor drift is natural for humans." :
                     "Significant drift detected. Practice with a metronome to internalize the grid."}
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
