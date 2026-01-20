import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Music, Info, AlertCircle } from 'lucide-react';
import { saveStat } from '../../lib/core';

const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// Standard Vocal Ranges (Approximate centers)
const VOCAL_TYPES = [
  { name: "Bass", min: "E2", max: "E4", desc: "Deep, dark tones. Rare and resonant.", color: "text-blue-500" },
  { name: "Baritone", min: "A2", max: "A4", desc: "The most common male voice type. Rich and versatile.", color: "text-cyan-500" },
  { name: "Tenor", min: "C3", max: "C5", desc: "High male voice. Bright and piercing.", color: "text-teal-500" },
  { name: "Contralto", min: "F3", max: "F5", desc: "Deep female voice. Heavy and soulful.", color: "text-emerald-500" },
  { name: "Mezzo-Soprano", min: "A3", max: "A5", desc: "Middle female voice. Darker than soprano.", color: "text-violet-500" },
  { name: "Soprano", min: "C4", max: "C6", desc: "Highest female voice. Bright and agile.", color: "text-fuchsia-500" }
];

const VocalRangeTest: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [currentNote, setCurrentNote] = useState<string>('--');
  const [currentFreq, setCurrentFreq] = useState<number>(0);
  const [currentVolume, setCurrentVolume] = useState<number>(0);
  
  // Store frequencies
  const [minFreq, setMinFreq] = useState<number | null>(null);
  const [maxFreq, setMaxFreq] = useState<number | null>(null);
  
  const [classification, setClassification] = useState<typeof VOCAL_TYPES[0] | null>(null);
  const [error, setError] = useState<string>('');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Buffer for pitch stabilization
  const pitchBufferRef = useRef<number[]>([]);
  const STABLE_FRAMES_REQUIRED = 5; // Frames to hold note before registering
  const MIN_VOLUME_DB = -50;

  // Visualize Waveform
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    return () => stopListening();
  }, []);

  // --- Pitch Detection Logic ---

  const autoCorrelate = (buf: Float32Array, sampleRate: number): { freq: number, volume: number } => {
    let size = buf.length;
    let rms = 0;
    for (let i = 0; i < size; i++) {
      const val = buf[i];
      rms += val * val;
    }
    rms = Math.sqrt(rms / size);
    
    // Volume in dB
    const db = 20 * Math.log10(rms);
    
    // Hard Noise Gate
    if (db < MIN_VOLUME_DB) return { freq: -1, volume: db };

    // Trim buffer to reduce error
    let r1 = 0, r2 = size - 1, thres = 0.2;
    for (let i = 0; i < size / 2; i++) {
      if (Math.abs(buf[i]) < thres) { r1 = i; break; }
    }
    for (let i = 1; i < size / 2; i++) {
      if (Math.abs(buf[size - i]) < thres) { r2 = size - i; break; }
    }
    buf = buf.slice(r1, r2);
    size = buf.length;

    // Autocorrelation
    let c = new Array(size).fill(0);
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size - i; j++) {
        c[i] = c[i] + buf[j] * buf[j + i];
      }
    }

    let d = 0; while (c[d] > c[d + 1]) d++;
    let maxval = -1, maxpos = -1;
    for (let i = d; i < size; i++) {
      if (c[i] > maxval) { maxval = c[i]; maxpos = i; }
    }
    let T0 = maxpos;

    return { freq: sampleRate / T0, volume: db };
  };

  const freqToMidi = (freq: number) => Math.round(12 * (Math.log(freq / 440) / Math.log(2)) + 69);
  
  const midiToNote = (midi: number) => {
    const noteName = NOTES[midi % 12];
    const octave = Math.floor(midi / 12) - 1;
    return `${noteName}${octave}`;
  };

  const getNoteFromFreq = (freq: number) => {
    const midi = freqToMidi(freq);
    return midiToNote(midi);
  };

  const determineVocalType = (minF: number, maxF: number) => {
     if (!minF || !maxF) return null;
     
     const minMidi = freqToMidi(minF);
     const maxMidi = freqToMidi(maxF);
     const userCenter = (minMidi + maxMidi) / 2;

     let closest = null;
     let minDiff = Infinity;

     VOCAL_TYPES.forEach(type => {
        const typeMinMidi = nameToMidi(type.min);
        const typeMaxMidi = nameToMidi(type.max);
        const typeCenter = (typeMinMidi + typeMaxMidi) / 2;
        
        const diff = Math.abs(userCenter - typeCenter);
        if (diff < minDiff) {
           minDiff = diff;
           closest = type;
        }
     });
     return closest;
  };

  const nameToMidi = (noteName: string) => {
     const regex = /([A-G]#?)(\d)/;
     const match = noteName.match(regex);
     if(!match) return 60; // default C4
     const note = match[1];
     const oct = parseInt(match[2]);
     const noteIdx = NOTES.indexOf(note);
     return (oct + 1) * 12 + noteIdx;
  };

  // --- Audio Loop ---

  const startListening = async () => {
    try {
      setError('');
      // Request Echo Cancellation off for better music processing
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
      analyzer.smoothingTimeConstant = 0.8; 
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
    pitchBufferRef.current = [];
    
    // Save Result if we have valid data
    if (maxFreq && minFreq) {
       const type = determineVocalType(minFreq, maxFreq);
       setClassification(type);

       const maxMidi = freqToMidi(maxFreq);
       const minMidi = freqToMidi(minFreq);
       const rangeSemitones = maxMidi - minMidi;
       
       const score = Math.min(100, Math.round((rangeSemitones / 36) * 100)); 
       saveStat('vocal-range', score);
    }
  };

  const updateLoop = () => {
    if (!analyzerRef.current || !audioContextRef.current) return;
    
    const buf = new Float32Array(analyzerRef.current.fftSize);
    analyzerRef.current.getFloatTimeDomainData(buf);
    
    drawWaveform(buf);

    const { freq, volume } = autoCorrelate(buf, audioContextRef.current.sampleRate);
    setCurrentVolume(volume);

    // Filter reasonable voice range (E1 to C7 roughly: 40Hz - 2100Hz)
    if (freq !== -1 && freq > 40 && freq < 2100) {
      
      // STABILIZATION LOGIC
      // Push to buffer
      pitchBufferRef.current.push(freq);
      if (pitchBufferRef.current.length > STABLE_FRAMES_REQUIRED) {
         pitchBufferRef.current.shift();
      }
      
      // Check consistency
      const buffer = pitchBufferRef.current;
      const isStable = buffer.length === STABLE_FRAMES_REQUIRED && 
                       buffer.every(f => Math.abs(f - buffer[0]) < 2); // Within 2Hz

      if (isStable) {
        // Use average of buffer for smoothness
        const avgFreq = buffer.reduce((a,b) => a+b) / buffer.length;
        
        setCurrentFreq(Math.round(avgFreq));
        const note = getNoteFromFreq(avgFreq);
        setCurrentNote(note);
        
        // Only update Min/Max if signal is strong and stable
        // Add a slight "hold" factor - requires multiple updates to push boundary
        // For MVP, direct update on stable note is fine
        setMinFreq(prev => (prev === null || avgFreq < prev) ? avgFreq : prev);
        setMaxFreq(prev => (prev === null || avgFreq > prev) ? avgFreq : prev);
      }
    } else {
        // Decay visualizer if silent
        if (freq === -1) {
             // Optional: visual decay
        }
    }

    rafRef.current = requestAnimationFrame(updateLoop);
  };

  const drawWaveform = (data: Float32Array) => {
     const canvas = canvasRef.current;
     if (!canvas) return;
     const ctx = canvas.getContext('2d');
     if (!ctx) return;

     ctx.fillStyle = '#09090b'; // matches bg-surface-900 roughly
     ctx.fillRect(0, 0, canvas.width, canvas.height);

     ctx.lineWidth = 2;
     ctx.strokeStyle = '#06b6d4'; // primary-500
     ctx.beginPath();

     const sliceWidth = canvas.width / data.length;
     let x = 0;

     for (let i = 0; i < data.length; i++) {
        const v = data[i] * 4; // amplify
        const y = (canvas.height / 2) + (v * canvas.height / 2);

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);

        x += sliceWidth;
     }
     ctx.stroke();
  };

  const reset = () => {
    setMinFreq(null);
    setMaxFreq(null);
    setClassification(null);
    setCurrentFreq(0);
    setCurrentNote('--');
    pitchBufferRef.current = [];
  };

  // --- Virtual Piano Component ---
  const VirtualPiano = () => {
    // Range C2 (36) to C6 (84)
    // Total White Keys: 29
    // Octave Width concept: 7 white keys.
    // We will render strict CSS grid or Flex? Flex is easier for responsiveness.
    
    const startMidi = 36; // C2
    const endMidi = 84;   // C6
    
    const whiteKeys: { midi: number, note: string }[] = [];
    const blackKeys: { midi: number }[] = [];

    // Pre-calculate keys
    for (let i = startMidi; i <= endMidi; i++) {
        const noteIdx = i % 12;
        const isBlack = [1, 3, 6, 8, 10].includes(noteIdx);
        if (!isBlack) {
            whiteKeys.push({ midi: i, note: midiToNote(i) });
        } else {
            blackKeys.push({ midi: i });
        }
    }

    const currentMidi = freqToMidi(currentFreq);
    const minMidi = minFreq ? freqToMidi(minFreq) : -1;
    const maxMidi = maxFreq ? freqToMidi(maxFreq) : -1;

    // Helper to check range coverage
    const isInRange = (midi: number) => {
        if (minMidi === -1 || maxMidi === -1) return false;
        return midi >= minMidi && midi <= maxMidi;
    };

    return (
        <div className="relative w-full h-40 select-none bg-zinc-900 p-1 rounded-lg border border-zinc-800 shadow-xl overflow-hidden">
            {/* White Keys Layer */}
            <div className="flex h-full w-full">
                {whiteKeys.map((key) => {
                    const isActive = currentMidi === key.midi;
                    const inRange = isInRange(key.midi);
                    return (
                        <div 
                            key={key.midi} 
                            className={`
                                flex-1 border-r border-zinc-300 last:border-0 rounded-b-sm relative
                                ${isActive ? 'bg-primary-500 !border-primary-600 shadow-[0_0_10px_#06b6d4] z-20' : 'bg-white'}
                                ${inRange && !isActive ? 'bg-primary-100' : ''}
                                transition-colors duration-75
                            `}
                        >
                            {/* Key Label (Octaves only) */}
                            {key.midi % 12 === 0 && (
                                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] text-zinc-500 font-bold pointer-events-none">
                                    {key.note}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Black Keys Layer (Overlay) */}
            {blackKeys.map((key) => {
                // Find index of the white key just BEFORE this black key
                const whiteIndex = whiteKeys.findIndex(w => w.midi === key.midi - 1);
                
                const widthPercent = (1 / whiteKeys.length) * 100; // Width of one white key
                const leftPercent = (whiteIndex + 1) * widthPercent - (widthPercent * 0.3); // Offset left by half black key width
                
                const isActive = currentMidi === key.midi;
                const inRange = isInRange(key.midi);

                return (
                    <div
                        key={key.midi}
                        className={`
                            absolute h-[60%] w-[1.8%] z-30 rounded-b-sm border-x border-b border-black/50
                            ${isActive ? 'bg-primary-400 shadow-[0_0_10px_#06b6d4]' : 'bg-black'}
                            ${inRange && !isActive ? 'bg-zinc-700' : ''}
                        `}
                        style={{
                            left: `${leftPercent}%`,
                            width: `${widthPercent * 0.6}%` // 60% of white key width
                        }}
                    ></div>
                );
            })}
        </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto text-center space-y-6">
      
      {/* Top Header & Classification */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-zinc-800 pb-4 gap-4">
         <div className="text-left">
            {/* Optimized Header Title for SEO */}
            <h2 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
               <Music className="text-primary-500" /> Vocal Range Test & Analyzer
            </h2>
            <p className="text-xs text-zinc-500 font-mono mt-1">
                Begin the <strong>Vocal Range Test</strong> by singing a continuous slide from your lowest chest voice to your highest falsetto.
            </p>
         </div>
         {classification && (
            <div className="text-right animate-in slide-in-from-right duration-500">
               <div className="text-[10px] text-zinc-500 uppercase font-mono">Voice Type</div>
               <div className={`text-3xl font-bold ${classification.color} drop-shadow-md`}>{classification.name}</div>
            </div>
         )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         {/* Left Col: Live Stats */}
         <div className="lg:col-span-1 space-y-4">
            <div className="tech-border bg-black p-6 relative overflow-hidden group">
               {/* Volume Indicator Background */}
               <div className="absolute bottom-0 left-0 w-full bg-primary-900/20 transition-all duration-75 ease-out" style={{ height: `${Math.max(0, currentVolume + 60) * 2}%` }}></div>

               <div className="relative z-10">
                   <div className="text-[10px] text-zinc-500 uppercase font-mono mb-2 flex justify-between">
                       <span>Pitch Detector</span>
                       {currentVolume > -40 && <span className="text-primary-500 animate-pulse">● SIGNAL</span>}
                   </div>
                   <div className="flex items-baseline gap-2 justify-center py-2">
                      <span className="text-6xl font-mono font-bold text-white tracking-tighter w-24 text-center">{currentNote}</span>
                   </div>
                   <div className="text-center text-xs font-mono text-zinc-600">{currentFreq} Hz</div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
               <div className="bg-zinc-900/50 p-3 border border-zinc-800 clip-corner-sm">
                  <div className="text-[9px] text-zinc-500 uppercase mb-1">Lowest (Min)</div>
                  <div className="text-xl text-white font-bold">{minFreq ? getNoteFromFreq(minFreq) : '--'}</div>
               </div>
               <div className="bg-zinc-900/50 p-3 border border-zinc-800 clip-corner-sm">
                  <div className="text-[9px] text-zinc-500 uppercase mb-1">Highest (Max)</div>
                  <div className="text-xl text-white font-bold">{maxFreq ? getNoteFromFreq(maxFreq) : '--'}</div>
               </div>
            </div>
         </div>

         {/* Right Col: Waveform & Piano */}
         <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-black border border-zinc-800 relative clip-corner-sm h-[140px] flex items-center justify-center overflow-hidden">
                <canvas ref={canvasRef} width={600} height={140} className="w-full h-full object-cover opacity-80" />
                
                {!isListening && !classification && (
                   <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                      <div className="flex flex-col items-center gap-2">
                         <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
                            <Mic size={24} className="text-zinc-400" />
                         </div>
                         <p className="text-zinc-400 text-sm font-mono">Microphone Standby</p>
                      </div>
                   </div>
                )}
            </div>

            <VirtualPiano />
         </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col items-center justify-center gap-4 py-4">
        {error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-900/20 px-4 py-2 rounded-md border border-red-900/50">
                <AlertCircle size={16} />
                <span className="text-sm">{error}</span>
            </div>
        )}
        
        <div className="flex gap-4">
           {!isListening ? (
             <button onClick={startListening} className="btn-primary flex items-center gap-3 px-8 text-lg">
               <Mic size={20} /> {minFreq ? 'Resume Session' : 'Start Analysis'}
             </button>
           ) : (
             <button onClick={stopListening} className="btn-secondary border-red-500/50 text-red-400 hover:bg-red-900/20 hover:text-red-300 hover:border-red-500 flex items-center gap-3 px-8 text-lg animate-pulse-fast">
               <MicOff size={20} /> Stop & Save
             </button>
           )}
           
           {(minFreq || maxFreq) && (
              <button onClick={reset} className="p-4 border border-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-full transition-colors" title="Reset Data">
                 <RefreshCw size={20} />
              </button>
           )}
        </div>
      </div>
      
      {/* Result Card with Keywords */}
      {classification && !isListening && (
         <div className="bg-zinc-900/30 border border-zinc-800 p-8 text-left max-w-2xl mx-auto clip-corner-lg animate-in slide-in-from-bottom-8 fade-in duration-500">
            <div className="flex flex-col md:flex-row gap-6 items-center">
               <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-full">
                   <Info size={32} className={classification.color} />
               </div>
               <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-bold text-white mb-2">Vocal Range Test Result: <span className={classification.color}>{classification.name}</span></h3>
                  <p className="text-zinc-400 text-sm leading-relaxed mb-4">{classification.desc}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                     <div className="bg-black/50 p-2 border border-zinc-800 rounded">
                        <span className="text-zinc-500 block">STANDARD RANGE</span>
                        <span className="text-white">{classification.min} - {classification.max}</span>
                     </div>
                     <div className="bg-black/50 p-2 border border-zinc-800 rounded">
                        <span className="text-zinc-500 block">YOUR RANGE</span>
                        <span className="text-primary-400 font-bold">{minFreq ? getNoteFromFreq(minFreq) : '?'} - {maxFreq ? getNoteFromFreq(maxFreq) : '?'}</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* SEO Optimized Footer Section */}
      <div className="mt-8 border-t border-zinc-800 pt-6 text-left">
         <h4 className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-2">Technical Analysis Protocol</h4>
         <p className="text-xs text-zinc-500 leading-relaxed max-w-3xl">
            Our <strong>Vocal Range Test</strong> utilizes real-time frequency analysis (FFT) to map your vocal cords' capabilities against standardized musical classifications. Unlike a subjective <strong>vocal range test</strong>, this digital tool measures precise Hertz values to determine if you are a Bass, Baritone, Tenor, Alto, Mezzo-Soprano, or Soprano. For the most accurate <strong>Vocal Range Test</strong> results, ensure you are in a quiet environment and warm up your voice beforehand.
         </p>
      </div>

    </div>
  );
};

// Add RefreshCw icon manually since it was removed from import but used in reset button
import { RefreshCw } from 'lucide-react';

export default VocalRangeTest;