import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Activity, Volume2, Settings2, Info } from 'lucide-react';
import SEO from '../../components/SEO';
import Breadcrumbs from '../../components/Breadcrumbs';

const ToneGenPage: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [freq, setFreq] = useState(440);
  const [waveType, setWaveType] = useState<OscillatorType>('sine');
  const [volume, setVolume] = useState(0.5);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const initAudio = () => {
     if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
     }
     if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
     return audioCtxRef.current;
  };

  const togglePlay = () => {
     if (isPlaying) {
        stop();
     } else {
        start();
     }
  };

  const start = () => {
     const ctx = initAudio();
     const osc = ctx.createOscillator();
     const gain = ctx.createGain();
     
     osc.type = waveType;
     osc.frequency.setValueAtTime(freq, ctx.currentTime);
     
     gain.gain.setValueAtTime(0, ctx.currentTime);
     gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.05);
     
     osc.connect(gain);
     gain.connect(ctx.destination);
     osc.start();
     
     oscRef.current = osc;
     gainRef.current = gain;
     setIsPlaying(true);
  };

  const stop = () => {
     if (oscRef.current && gainRef.current && audioCtxRef.current) {
        const now = audioCtxRef.current.currentTime;
        gainRef.current.gain.cancelScheduledValues(now);
        gainRef.current.gain.linearRampToValueAtTime(0, now + 0.05);
        oscRef.current.stop(now + 0.05);
        
        setTimeout(() => {
           oscRef.current?.disconnect();
           gainRef.current?.disconnect();
           oscRef.current = null;
           gainRef.current = null;
        }, 60);
     }
     setIsPlaying(false);
  };

  // Real-time updates
  useEffect(() => {
     if (oscRef.current && audioCtxRef.current) {
        oscRef.current.frequency.setValueAtTime(freq, audioCtxRef.current.currentTime);
        oscRef.current.type = waveType;
     }
     if (gainRef.current && audioCtxRef.current) {
        gainRef.current.gain.setTargetAtTime(volume, audioCtxRef.current.currentTime, 0.05);
     }
  }, [freq, waveType, volume]);

  useEffect(() => {
     return () => stop();
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 animate-in fade-in">
       <SEO 
          title="Online Tone Generator (Free)"
          description="Generate pure sine, square, sawtooth, and triangle waves. Adjust frequency from 1Hz to 22kHz. Free online audio test signal tool."
       />
       
       <Breadcrumbs items={[{ label: 'Tools', path: '/tools' }, { label: 'Tone Generator' }]} />

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Tool Interface */}
          <div className="bg-black border border-zinc-800 rounded-xl p-8 shadow-2xl relative overflow-hidden">
             {/* Decor */}
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <Settings2 size={120} />
             </div>

             <div className="relative z-10 space-y-8">
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" style={{ opacity: isPlaying ? 1 : 0.2 }}></div>
                   <h1 className="text-2xl font-bold text-white">Signal Generator</h1>
                </div>

                {/* Display */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-center">
                   <input 
                      type="number" 
                      value={freq}
                      onChange={(e) => setFreq(Number(e.target.value))}
                      className="bg-transparent text-6xl font-mono font-bold text-white text-center w-full focus:outline-none"
                   />
                   <div className="text-zinc-500 font-mono text-sm mt-2">HERTZ (Hz)</div>
                </div>

                {/* Controls */}
                <div className="space-y-6">
                   {/* Frequency Slider */}
                   <div>
                      <div className="flex justify-between text-xs text-zinc-500 font-mono mb-2">
                         <span>20 Hz</span>
                         <span>Frequency</span>
                         <span>20,000 Hz</span>
                      </div>
                      <input 
                         type="range" min="20" max="20000" step="1" 
                         value={freq} 
                         onChange={(e) => setFreq(Number(e.target.value))}
                         className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
                      />
                   </div>

                   {/* Wave Type */}
                   <div className="grid grid-cols-4 gap-2">
                      {['sine', 'square', 'sawtooth', 'triangle'].map(t => (
                         <button 
                            key={t}
                            onClick={() => setWaveType(t as OscillatorType)}
                            className={`py-2 text-[10px] font-bold uppercase rounded border ${waveType === t ? 'bg-primary-900/30 border-primary-500 text-primary-400' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white'}`}
                         >
                            {t}
                         </button>
                      ))}
                   </div>

                   {/* Play Button */}
                   <button 
                      onClick={togglePlay}
                      className={`w-full py-4 rounded-lg font-bold text-lg uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${isPlaying ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-primary-600 hover:bg-primary-500 text-black'}`}
                   >
                      {isPlaying ? <><Square size={20} fill="currentColor"/> Stop Signal</> : <><Play size={20} fill="currentColor"/> Generate Tone</>}
                   </button>
                </div>
             </div>
          </div>

          {/* SEO Content / Sidebar */}
          <div className="space-y-8">
             <article className="prose prose-invert prose-sm text-zinc-400">
                <h2 className="text-white">About This Tool</h2>
                <p>
                   This <strong>Online Tone Generator</strong> creates a precise audio signal directly in your browser using the Web Audio API. It requires no downloads and works on mobile and desktop.
                </p>
                <h3 className="text-white">Common Uses</h3>
                <ul className="list-disc pl-4 space-y-2">
                   <li><strong>Speaker Testing:</strong> Use low frequencies (20-100Hz) to test subwoofers.</li>
                   <li><strong>Tinnitus Relief:</strong> Some users find relief (masking) by matching their tinnitus frequency.</li>
                   <li><strong>Sound Engineering:</strong> Use Pink/White noise (coming soon) or sine sweeps to calibrate room acoustics.</li>
                   <li><strong>Hearing Check:</strong> While not a medical test, you can check your upper hearing limit (try 15,000Hz).</li>
                </ul>
             </article>

             <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-lg">
                <div className="flex items-center gap-2 mb-4 text-white font-bold">
                   <Activity size={20} className="text-primary-500" />
                   <span>Related Tests</span>
                </div>
                <div className="space-y-3">
                   <a href="/test/hearing-age-test" className="block text-sm text-zinc-400 hover:text-primary-400 underline decoration-zinc-700 underline-offset-4">Hearing Age Test</a>
                   <a href="/test/perfect-pitch-test" className="block text-sm text-zinc-400 hover:text-primary-400 underline decoration-zinc-700 underline-offset-4">Perfect Pitch Test</a>
                </div>
             </div>
          </div>

       </div>
    </div>
  );
};

export default ToneGenPage;