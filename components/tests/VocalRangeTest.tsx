import React, { useState, useRef, useEffect } from 'react';
import { Mic, Music, RefreshCw, Volume2 } from 'lucide-react';
import { saveStat } from '../../lib/core';

const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

interface SingerProfile {
  name: string;
  range: string;
  note: string;
}

// Standard Vocal Ranges
const VOCAL_TYPES = [
  { name: "Bass", min: 40, max: 260, desc: "Deep, dark tones. Rare power in the low end.", color: "text-blue-500" }, // E2-C4 approx
  { name: "Baritone", min: 55, max: 390, desc: "The most common male voice. Warm and versatile.", color: "text-cyan-500" }, // A2-G4
  { name: "Tenor", min: 130, max: 520, desc: "High male voice. Bright, ringing quality.", color: "text-teal-500" }, // C3-C5
  { name: "Contralto", min: 170, max: 690, desc: "Deep female voice. Heavy chest resonance.", color: "text-emerald-500" }, // F3-F5
  { name: "Mezzo-Soprano", min: 220, max: 880, desc: "Middle female voice. Darker than soprano.", color: "text-violet-500" }, // A3-A5
  { name: "Soprano", min: 260, max: 1050, desc: "Highest female voice. Bright and agile.", color: "text-fuchsia-500" } // C4-C6
];

const FAMOUS_SINGERS: SingerProfile[] = [
  { name: "Axl Rose", range: "F1-B6", note: "Incredible 6 octave range" },
  { name: "Mariah Carey", range: "F2-G7", note: "Known for the whistle register" },
  { name: "Freddie Mercury", range: "F2-F6", note: "Legendary control and power" },
  { name: "Prince", range: "E2-B6", note: "Versatile falsetto master" },
  { name: "Beyoncé", range: "A2-E6", note: "Powerful Mezzo-Soprano" },
  { name: "Elvis Presley", range: "B1-A4", note: "The King's rich Baritone" },
  { name: "Taylor Swift", range: "C3-G5", note: "Clear country-pop tones" },
  { name: "Frank Sinatra", range: "G1-G5", note: "Smooth Jazz Baritone" },
  { name: "Adele", range: "C3-C6", note: "Soulful Mezzo power" },
  { name: "Bruno Mars", range: "C3-D5", note: "High Tenor agility" }
];

type Step = 'intro' | 'mic-check' | 'low-test' | 'high-test' | 'result';

const VocalRangeTest: React.FC = () => {
  const [step, setStep] = useState<Step>('intro');
  const [, setIsListening] = useState(false); // Used setter only
  
  // Live Audio Data
  const [pitch, setPitch] = useState<{freq: number, note: string, cents: number} | null>(null);
  const [volume, setVolume] = useState(0);
  
  // Results
  const [lowRecord, setLowRecord] = useState<{freq: number, note: string} | null>(null);
  const [highRecord, setHighRecord] = useState<{freq: number, note: string} | null>(null);
  
  // System
  const [error, setError] = useState('');
  // Fixed threshold, setter removed to avoid TS error
  const noiseThreshold = -50; // dB
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pitchBufferRef = useRef<number[]>([]);
  
  // Visualization
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pitchHistoryRef = useRef<number[]>(new Array(100).fill(0)); // For graph

  useEffect(() => {
    return () => stopListening();
  }, []);

  // --- Helpers ---
  const freqToMidi = (freq: number) => {
      if (freq <= 0) return 0;
      return 69 + 12 * Math.log2(freq / 440);
  };
  
  const midiToNote = (midi: number) => {
      const rounded = Math.round(midi);
      const noteName = NOTES[rounded % 12];
      const octave = Math.floor(rounded / 12) - 1;
      return `${noteName}${octave}`;
  };

  const getNoteData = (freq: number) => {
      const midiFloat = freqToMidi(freq);
      const midiInt = Math.round(midiFloat);
      const note = midiToNote(midiInt);
      const cents = Math.floor((midiFloat - midiInt) * 100);
      return { note, cents, midi: midiInt };
  };

  const nameToMidi = (noteName: string) => {
     const regex = /([A-G]#?)(\d)/;
     const match = noteName.match(regex);
     if(!match) return 60; 
     const note = match[1];
     const oct = parseInt(match[2]);
     const noteIdx = NOTES.indexOf(note);
     return (oct + 1) * 12 + noteIdx;
  };

  const playReferenceTone = () => {
      if (!pitch || !audioContextRef.current) return;
      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.value = pitch.freq;
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1);
  };

  // --- Audio Engine ---
  const startListening = async () => {
    try {
      if (audioContextRef.current?.state === 'running') return;

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
            echoCancellation: false,
            autoGainControl: false, 
            noiseSuppression: false 
        } 
      });
      streamRef.current = stream;
      
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = ctx;
      
      const source = ctx.createMediaStreamSource(stream);
      const analyzer = ctx.createAnalyser();
      analyzer.fftSize = 2048; 
      source.connect(analyzer);
      analyzerRef.current = analyzer;

      setIsListening(true);
      updateLoop();
    } catch (err) {
      setError('Microphone access denied. Please allow permissions.');
    }
  };

  const stopListening = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (audioContextRef.current) audioContextRef.current.close();
    setIsListening(false);
    audioContextRef.current = null;
  };

  // --- Auto-Correlation Pitch Detection ---
  const autoCorrelate = (buf: Float32Array, sampleRate: number) => {
    let size = buf.length;
    let rms = 0;
    for (let i = 0; i < size; i++) rms += buf[i] * buf[i];
    rms = Math.sqrt(rms / size);
    
    const db = 20 * Math.log10(rms);
    if (db < noiseThreshold) return -1; // Noise gate

    // Simple Autocorrelation
    let r1 = 0, r2 = size - 1, thres = 0.2;
    for (let i = 0; i < size / 2; i++) if (Math.abs(buf[i]) < thres) { r1 = i; break; }
    for (let i = 1; i < size / 2; i++) if (Math.abs(buf[size - i]) < thres) { r2 = size - i; break; }
    buf = buf.slice(r1, r2);
    size = buf.length;

    let c = new Array(size).fill(0);
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size - i; j++) c[i] = c[i] + buf[j] * buf[j + i];
    }

    let d = 0; while (c[d] > c[d + 1]) d++;
    let maxval = -1, maxpos = -1;
    for (let i = d; i < size; i++) {
      if (c[i] > maxval) { maxval = c[i]; maxpos = i; }
    }
    let T0 = maxpos;

    // Parabolic interpolation for better precision
    let x1 = c[T0 - 1], x2 = c[T0], x3 = c[T0 + 1];
    let a = (x1 + x3 - 2 * x2) / 2;
    let b = (x3 - x1) / 2;
    if (a) T0 = T0 - b / (2 * a);

    return sampleRate / T0;
  };

  const updateLoop = () => {
    if (!analyzerRef.current || !audioContextRef.current) return;
    
    const buf = new Float32Array(analyzerRef.current.fftSize);
    analyzerRef.current.getFloatTimeDomainData(buf);
    
    // Calculate Volume for visualizer
    let sum = 0;
    for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
    const rms = Math.sqrt(sum / buf.length);
    const db = 20 * Math.log10(rms);
    setVolume(Math.max(0, (db + 100) / 100)); // Normalize approx 0-1

    const freq = autoCorrelate(buf, audioContextRef.current.sampleRate);

    // Frequency Validation
    if (freq !== -1 && freq > 50 && freq < 1500) {
        pitchBufferRef.current.push(freq);
        if (pitchBufferRef.current.length > 5) pitchBufferRef.current.shift();
        
        // Stabilizer: Median filtering
        const sorted = [...pitchBufferRef.current].sort((a,b) => a-b);
        const median = sorted[Math.floor(sorted.length/2)];
        
        if (Math.abs(median - pitchBufferRef.current[pitchBufferRef.current.length-1]) < 10) {
            const data = getNoteData(median);
            setPitch({ freq: median, note: data.note, cents: data.cents });
            
            // Push to graph history
            pitchHistoryRef.current.push(freqToMidi(median));
            
            // Capture records
            if (step === 'low-test') {
                setLowRecord(prev => (!prev || median < prev.freq) ? {freq: median, note: data.note} : prev);
            }
            if (step === 'high-test') {
                setHighRecord(prev => (!prev || median > prev.freq) ? {freq: median, note: data.note} : prev);
            }
        } else {
            pitchHistoryRef.current.push(0); // Signal unstable
        }
    } else {
        pitchHistoryRef.current.push(0); // No signal
    }
    
    if (pitchHistoryRef.current.length > 150) pitchHistoryRef.current.shift();
    drawGraph();

    rafRef.current = requestAnimationFrame(updateLoop);
  };

  const drawGraph = () => {
      if (!canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;
      
      const width = canvasRef.current.width;
      const height = canvasRef.current.height;
      const history = pitchHistoryRef.current;
      
      ctx.clearRect(0, 0, width, height);
      
      // Guide Lines (Octaves roughly)
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      [36, 48, 60, 72, 84].forEach(midi => {
          // Approximate scale mapping logic
          // Let's assume range 30-90 midi for graph
          const y = height - ((midi - 30) / 60) * height;
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      });

      // Draw Pitch Line
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 3;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      
      let started = false;
      for (let i = 0; i < history.length; i++) {
          const val = history[i];
          if (val === 0) {
              started = false;
              continue;
          }
          
          const x = (i / history.length) * width;
          // Scale MIDI 30 (approx F1) to 90 (approx F6)
          const y = height - ((val - 30) / 60) * height;
          
          if (!started) {
              ctx.moveTo(x, y);
              started = true;
          } else {
              ctx.lineTo(x, y);
          }
      }
      ctx.stroke();
  };

  // --- Logic Flows ---
  const advanceStep = () => {
      if (step === 'intro') {
          startListening();
          setStep('mic-check');
      } else if (step === 'mic-check') {
          setStep('low-test');
      } else if (step === 'low-test') {
          setStep('high-test');
      } else if (step === 'high-test') {
          stopListening();
          setStep('result');
          saveResult();
      }
  };

  const saveResult = () => {
      if (lowRecord && highRecord) {
          const minMidi = freqToMidi(lowRecord.freq);
          const maxMidi = freqToMidi(highRecord.freq);
          const range = maxMidi - minMidi;
          const score = Math.min(100, Math.round((range / 36) * 100)); // 3 octaves = 100%
          saveStat('vocal-range', score);
      }
  };

  const findClosestSinger = (): SingerProfile | null => {
      if (!lowRecord || !highRecord) return null;
      const userLow = freqToMidi(lowRecord.freq);
      const userHigh = freqToMidi(highRecord.freq);
      const userCenter = (userLow + userHigh) / 2;

      let bestMatch: SingerProfile | null = null;
      let minDiff = Infinity;

      FAMOUS_SINGERS.forEach(singer => {
          const [minStr, maxStr] = singer.range.split('-');
          const singerLow = nameToMidi(minStr);
          const singerHigh = nameToMidi(maxStr);
          const singerCenter = (singerLow + singerHigh) / 2;
          
          const diff = Math.abs(userCenter - singerCenter);
          if (diff < minDiff) {
              minDiff = diff;
              bestMatch = singer;
          }
      });
      return bestMatch;
  };

  const getVoiceType = () => {
      if (!lowRecord || !highRecord) return null;
      const userLow = freqToMidi(lowRecord.freq);
      const userHigh = freqToMidi(highRecord.freq);
      const userCenter = (userLow + userHigh) / 2;
      
      let bestType = VOCAL_TYPES[0];
      let minDiff = Infinity;
      
      VOCAL_TYPES.forEach(type => {
          const typeCenter = (freqToMidi(type.min) + freqToMidi(type.max)) / 2;
          const diff = Math.abs(userCenter - typeCenter);
          if (diff < minDiff) {
              minDiff = diff;
              bestType = type;
          }
      });
      return bestType;
  };

  // --- RENDER ---
  
  // 1. Result Screen
  if (step === 'result' && lowRecord && highRecord) {
      const singer = findClosestSinger();
      const voiceType = getVoiceType();
      
      return (
          <div className="max-w-2xl mx-auto animate-in zoom-in duration-500">
              <div className="bg-black border border-zinc-800 p-8 rounded-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-grid opacity-20"></div>
                  
                  <div className="relative z-10 text-center">
                      <h2 className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-2">Vocal Analysis Complete</h2>
                      <div className={`text-5xl font-bold mb-4 text-glow ${voiceType?.color}`}>{voiceType?.name}</div>
                      <p className="text-zinc-400 mb-8 max-w-md mx-auto">{voiceType?.desc}</p>
                      
                      <div className="grid grid-cols-2 gap-4 mb-8">
                          <div className="bg-zinc-900/50 p-4 rounded border border-zinc-800">
                              <div className="text-xs text-zinc-500 uppercase mb-1">Lowest</div>
                              <div className="text-2xl font-mono text-white">{lowRecord.note} <span className="text-sm text-zinc-600">({Math.round(lowRecord.freq)}Hz)</span></div>
                          </div>
                          <div className="bg-zinc-900/50 p-4 rounded border border-zinc-800">
                              <div className="text-xs text-zinc-500 uppercase mb-1">Highest</div>
                              <div className="text-2xl font-mono text-white">{highRecord.note} <span className="text-sm text-zinc-600">({Math.round(highRecord.freq)}Hz)</span></div>
                          </div>
                      </div>

                      {singer && (
                          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex items-center gap-4 text-left">
                              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-xl font-bold text-white shrink-0">
                                  {singer.name[0]}
                              </div>
                              <div>
                                  <div className="text-xs text-primary-400 font-bold uppercase tracking-wider mb-1">Voice Match Detected</div>
                                  <h3 className="text-xl font-bold text-white">{singer.name}</h3>
                                  <p className="text-xs text-zinc-500 mt-1">{singer.note}</p>
                              </div>
                          </div>
                      )}
                  </div>
              </div>
              <div className="mt-8 flex justify-center gap-4">
                  <button onClick={() => { setStep('intro'); setLowRecord(null); setHighRecord(null); }} className="btn-secondary flex items-center gap-2">
                      <RefreshCw size={16} /> Retest
                  </button>
              </div>
          </div>
      );
  }

  // 2. Wizard Flow
  return (
    <div className="max-w-3xl mx-auto py-8 text-center select-none">
       {/* Header */}
       <div className="mb-8">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 rounded-full border border-zinc-800 text-[10px] text-zinc-500 font-mono uppercase mb-4">
               <Music size={12} />
               <span>Vocal Range Finder</span>
           </div>
           
           <div className="flex justify-center gap-2 mb-8">
               {['intro', 'mic-check', 'low-test', 'high-test'].map((s, i) => {
                   const active = ['intro', 'mic-check', 'low-test', 'high-test'].indexOf(step) >= i;
                   return <div key={s} className={`w-2 h-2 rounded-full transition-colors ${active ? 'bg-primary-500' : 'bg-zinc-800'}`}></div>
               })}
           </div>
       </div>

       {/* Main Card */}
       <div className="bg-surface border border-zinc-800 p-8 rounded-2xl min-h-[450px] flex flex-col justify-between relative overflow-hidden">
           
           {/* Live Graph Background (Active during test) */}
           {(step === 'low-test' || step === 'high-test') && (
               <div className="absolute inset-0 opacity-20 pointer-events-none">
                   <canvas ref={canvasRef} width={800} height={400} className="w-full h-full" />
               </div>
           )}

           {step === 'intro' && (
               <div className="animate-in fade-in zoom-in">
                   <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-zinc-800 shadow-inner">
                       <Mic size={32} className="text-zinc-400" />
                   </div>
                   <h1 className="text-2xl font-bold text-white mb-4">Let's find your voice type.</h1>
                   <p className="text-zinc-400 text-sm mb-8 leading-relaxed max-w-md mx-auto">
                       We will measure your lowest and highest comfortable notes to classify you as a Bass, Tenor, Soprano, etc.
                       <br/><br/>
                       <strong>Note:</strong> Sing comfortably. Do not strain.
                   </p>
                   {error && <div className="text-red-500 text-xs mb-4 bg-red-900/20 p-2 rounded">{error}</div>}
                   <button onClick={advanceStep} className="btn-primary">Start Calibration</button>
               </div>
           )}

           {step === 'mic-check' && (
               <div className="animate-in slide-in-from-right">
                   <h2 className="text-xl font-bold text-white mb-2">Microphone Check</h2>
                   <p className="text-zinc-400 text-sm mb-8">Make some noise to verify input level.</p>
                   
                   <div className="w-48 h-48 mx-auto mb-8 relative flex items-center justify-center">
                        {/* Circular Progress for volume */}
                        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#27272a" strokeWidth="8" />
                            <circle 
                                cx="50" cy="50" r="45" fill="none" stroke="#06b6d4" strokeWidth="8"
                                strokeDasharray="283"
                                strokeDashoffset={283 - (Math.min(1, volume * 1.5) * 283)}
                                className="transition-all duration-75"
                            />
                        </svg>
                        <Mic size={48} className={volume > 0.1 ? 'text-white' : 'text-zinc-700'} />
                   </div>
                   
                   <button onClick={advanceStep} disabled={volume < 0.05} className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
                       {volume > 0.05 ? "Signal Good - Continue" : "Waiting for Signal..."}
                   </button>
               </div>
           )}

           {(step === 'low-test' || step === 'high-test') && (
               <div className="animate-in slide-in-from-right relative z-10">
                   <h2 className="text-xl font-bold text-white mb-2">
                       {step === 'low-test' ? "Lowest Note Challenge" : "Highest Note Challenge"}
                   </h2>
                   <p className="text-zinc-400 text-sm mb-6">
                       {step === 'low-test' 
                           ? "Relax your throat and hum 'Ahhh' as low as you can." 
                           : "Now go high! Sing 'Eeee' or a siren sound up to your limit."}
                   </p>
                   
                   {/* Tuner Visualization */}
                   <div className="relative h-24 bg-black/50 border border-zinc-700 rounded-xl overflow-hidden flex flex-col items-center justify-center mb-6 backdrop-blur-sm">
                        {pitch ? (
                            <>
                                <div className="text-4xl font-bold text-white font-mono flex items-baseline gap-2">
                                    {pitch.note} <span className="text-xs text-zinc-500 font-sans">{pitch.freq.toFixed(0)} Hz</span>
                                </div>
                                <div className="w-48 h-1 bg-zinc-700 mt-2 relative rounded-full">
                                    <div 
                                        className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full transition-all duration-100 ${Math.abs(pitch.cents) < 10 ? 'bg-emerald-500' : 'bg-primary-500'}`}
                                        style={{ left: `calc(50% + ${pitch.cents}px)` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between w-48 mt-1 text-[9px] text-zinc-600 font-mono">
                                    <span>FLAT</span>
                                    <span>SHARP</span>
                                </div>
                            </>
                        ) : (
                            <div className="text-zinc-600 font-mono animate-pulse">LISTENING...</div>
                        )}
                   </div>
                   
                   <div className="bg-zinc-900/80 p-4 rounded mb-8 flex items-center justify-between border border-zinc-700 backdrop-blur-md">
                       <span className="text-xs text-zinc-500 uppercase">
                           {step === 'low-test' ? "Best Low" : "Best High"}
                       </span>
                       <span className="text-2xl font-mono text-primary-400 font-bold">
                           {(step === 'low-test' ? lowRecord?.note : highRecord?.note) || '--'}
                       </span>
                   </div>

                   <div className="flex gap-4">
                       <button onClick={playReferenceTone} className="flex-1 py-4 bg-zinc-800 hover:bg-zinc-700 rounded border border-zinc-600 text-zinc-300 text-xs font-bold uppercase flex flex-col items-center justify-center gap-1 transition-colors">
                           <Volume2 size={16} /> Play Tone
                       </button>
                       <button onClick={advanceStep} disabled={step === 'low-test' ? !lowRecord : !highRecord} className="flex-[2] btn-primary">
                           {step === 'low-test' ? "Confirm Lowest Note" : "Analyze Results"}
                       </button>
                   </div>
                   
               </div>
           )}

       </div>
    </div>
  );
};

export default VocalRangeTest;