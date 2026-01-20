import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Activity, AlertTriangle, ShieldAlert, Play, Square, Headphones, Wind } from 'lucide-react';
import { saveStat } from '../../lib/core';

// --- Types ---
type Phase = 'warning' | 'intro' | 'audio-test' | 'questionnaire' | 'result';
type TriggerType = 'repetitive' | 'high-freq' | 'organic';

const MisophoniaTest: React.FC = () => {
  const [phase, setPhase] = useState<Phase>('warning');
  
  // Scoring breakdown
  const [triggerScores, setTriggerScores] = useState<Record<TriggerType, number>>({
    repetitive: 0,
    'high-freq': 0,
    organic: 0
  });
  const [surveyScore, setSurveyScore] = useState(0); 
  
  // Audio Test State
  const [currentTrigger, setCurrentTrigger] = useState<TriggerType>('repetitive');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMasking, setIsMasking] = useState(false); // Brown noise masking
  const [discomfortLevel, setDiscomfortLevel] = useState(0); 
  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 3;

  // Questionnaire State
  const [currentQ, setCurrentQ] = useState(0);

  // Audio Engine Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const mainGainRef = useRef<GainNode | null>(null);
  const maskGainRef = useRef<GainNode | null>(null);
  
  const oscRef = useRef<OscillatorNode | null>(null);
  const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);
  
  const intervalRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    return () => stopAllAudio();
  }, []);

  // --- AUDIO SYNTHESIS ENGINE ---
  
  const initAudio = () => {
      if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioCtxRef.current?.state === 'suspended') {
          audioCtxRef.current.resume();
      }
      return audioCtxRef.current;
  };

  const createNoiseBuffer = (ctx: AudioContext) => {
      const bufferSize = ctx.sampleRate * 2; // 2 seconds
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
          // Pink/Brownish noise approx
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5; // Compensate for gain loss
      }
      return buffer;
  };
  let lastOut = 0;

  const toggleMasking = () => {
      const ctx = initAudio();
      
      if (isMasking) {
          // Turn off
          if (maskGainRef.current) {
              const now = ctx.currentTime;
              maskGainRef.current.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
              setTimeout(() => {
                  try { maskGainRef.current?.disconnect(); } catch(e){}
                  maskGainRef.current = null;
              }, 500);
          }
          setIsMasking(false);
      } else {
          // Turn on Brown Noise
          const bufferSize = ctx.sampleRate * 5;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
              const white = Math.random() * 2 - 1;
              data[i] = (lastOut + (0.02 * white)) / 1.02;
              lastOut = data[i];
              data[i] *= 3.5; 
          }

          const noise = ctx.createBufferSource();
          noise.buffer = buffer;
          noise.loop = true;
          
          const gain = ctx.createGain();
          gain.gain.value = 0.001;
          
          // Lowpass for "Brown" warmth
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 400;

          noise.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          
          noise.start();
          gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 1); // Smooth fade in
          
          maskGainRef.current = gain;
          setIsMasking(true);
      }
  };

  const playTrigger = (type: TriggerType) => {
      const ctx = initAudio();
      stopTriggerAudio(); // Stop previous trigger, keep masking if active
      setIsPlaying(true);

      const masterGain = ctx.createGain();
      masterGain.connect(ctx.destination);
      mainGainRef.current = masterGain;

      if (type === 'repetitive') {
          // MECHANICAL: Pen clicking / Tapping
          // Sharp square wave bursts
          const playClick = () => {
              const osc = ctx.createOscillator();
              const clickGain = ctx.createGain();
              osc.frequency.value = 800; 
              osc.type = 'square';
              
              // Filter to make it sound "plastic"
              const filter = ctx.createBiquadFilter();
              filter.type = 'bandpass';
              filter.frequency.value = 1200;

              clickGain.connect(filter);
              filter.connect(masterGain);
              osc.connect(clickGain);
              
              const now = ctx.currentTime;
              osc.start(now);
              osc.stop(now + 0.08);
              
              clickGain.gain.setValueAtTime(0, now);
              clickGain.gain.linearRampToValueAtTime(0.2, now + 0.005);
              clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
          };
          
          playClick();
          intervalRef.current = window.setInterval(playClick, 1200); // Irregular-ish feel? No, keep it rhythmic for "repetitive" stress
          
      } else if (type === 'high-freq') {
          // ELECTRONIC: Coil whine / Tinnitus
          const osc = ctx.createOscillator();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(9000, ctx.currentTime);
          // Modulate pitch slightly to make it "scratchy"
          osc.frequency.linearRampToValueAtTime(9500, ctx.currentTime + 10);
          
          const filter = ctx.createBiquadFilter();
          filter.type = 'highpass';
          filter.frequency.value = 4000;

          osc.connect(filter);
          filter.connect(masterGain);
          
          masterGain.gain.setValueAtTime(0.03, ctx.currentTime); // Very quiet but piercing
          
          osc.start();
          oscRef.current = osc;

      } else if (type === 'organic') {
          // ORGANIC: Mouth sounds / Crunching
          // Filtered noise bursts with varying lengths
          const buffer = createNoiseBuffer(ctx);

          const playChew = () => {
             const source = ctx.createBufferSource();
             source.buffer = buffer;
             
             const gain = ctx.createGain();
             const filter = ctx.createBiquadFilter();
             filter.type = 'lowpass';
             filter.frequency.value = 600 + Math.random() * 400; // Varying texture

             source.connect(filter);
             filter.connect(gain);
             gain.connect(masterGain);

             const now = ctx.currentTime;
             const duration = 0.2 + Math.random() * 0.3; // 200-500ms

             source.start(now);
             source.stop(now + duration + 0.1);

             gain.gain.setValueAtTime(0, now);
             gain.gain.linearRampToValueAtTime(0.4, now + 0.05);
             gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
          };

          playChew();
          // Irregular intervals are MORE annoying
          const scheduleNext = () => {
              if (!isPlaying) return;
              const nextDelay = 800 + Math.random() * 1500;
              intervalRef.current = window.setTimeout(() => {
                  playChew();
                  scheduleNext();
              }, nextDelay);
          };
          scheduleNext();
      }

      drawVisualizer();
  };

  const stopTriggerAudio = () => {
      if (oscRef.current) {
          try { oscRef.current.stop(); oscRef.current.disconnect(); } catch (e) {}
          oscRef.current = null;
      }
      if (noiseNodeRef.current) {
         try { noiseNodeRef.current.stop(); noiseNodeRef.current.disconnect(); } catch(e){}
         noiseNodeRef.current = null;
      }
      if (intervalRef.current) {
          clearInterval(intervalRef.current);
          clearTimeout(intervalRef.current); // Handle both setIntervall/setTimeout
          intervalRef.current = null;
      }
      if (mainGainRef.current) {
          try { mainGainRef.current.disconnect(); } catch(e){}
          mainGainRef.current = null;
      }
      setIsPlaying(false);
  };

  const stopAllAudio = () => {
      stopTriggerAudio();
      if (maskGainRef.current) {
          try { maskGainRef.current.disconnect(); } catch(e){}
          maskGainRef.current = null;
      }
      setIsMasking(false);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
  };

  // --- VISUALIZATION ---
  const drawVisualizer = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;
      const time = Date.now() / 200;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, w, h);

      // Draw Masking background (Blue waves)
      if (isMasking) {
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(34, 211, 238, 0.2)'; // Primary-400 low opacity
          ctx.lineWidth = 10;
          for (let x = 0; x < w; x+=10) {
              const y = h/2 + Math.sin(x * 0.02 + time * 0.5) * 40;
              if (x === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
          }
          ctx.stroke();
      }

      if (!isPlaying) {
          ctx.beginPath();
          ctx.strokeStyle = '#27272a';
          ctx.lineWidth = 1;
          ctx.moveTo(0, h/2);
          ctx.lineTo(w, h/2);
          ctx.stroke();
          return;
      }

      // Trigger Waveform (Red/Chaos)
      ctx.beginPath();
      ctx.strokeStyle = currentTrigger === 'organic' ? '#eab308' : '#ef4444'; // Yellow for chew, Red for others
      ctx.lineWidth = 2;

      for (let x = 0; x < w; x++) {
          let noise = 0;
          if (currentTrigger === 'high-freq') {
              noise = Math.sin(x * 0.5 + time * 10) * 5;
          } else if (currentTrigger === 'organic') {
               // Burst visuals
               const burst = (Math.sin(time) > 0.5) ? Math.random() * 30 : 2;
               noise = burst * (Math.random() - 0.5);
          } else {
               // Repetitive spikes
               const spike = (x + (time * 100)) % 100 < 10 ? 30 : 2;
               noise = spike * (Math.random() - 0.5);
          }

          const y = h/2 + noise;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
      }
      ctx.stroke();

      animationRef.current = requestAnimationFrame(drawVisualizer);
  };

  // --- LOGIC FLOW ---

  const submitAudioRating = () => {
      stopTriggerAudio();
      
      // Save score for current trigger (0-10 scale)
      const newScores = { ...triggerScores, [currentTrigger]: discomfortLevel };
      setTriggerScores(newScores);
      setDiscomfortLevel(0);
      
      if (step < TOTAL_STEPS) {
          setStep(s => s + 1);
          if (step === 1) setCurrentTrigger('high-freq');
          if (step === 2) setCurrentTrigger('organic');
      } else {
          stopAllAudio();
          setPhase('questionnaire');
      }
  };

  const QUESTIONS = [
      { text: "Hearing people chew or eat loudly makes me instantly angry.", weight: 2 },
      { text: "I have to leave the room when I hear repetitive noises (like pen clicking).", weight: 2 },
      { text: "Certain sounds trigger a physical 'fight or flight' response (heart racing, sweat).", weight: 2 },
      { text: "I use headphones or white noise specifically to block out family or coworkers.", weight: 2 },
      { text: "I feel that people are making these noises 'on purpose' to annoy me.", weight: 2 },
  ];

  const handleSurveyAnswer = (val: number) => {
      setSurveyScore(s => s + (val * 10)); // Max 50 points (5 Q * 2 max val * 5 scale factor = 50)
      
      if (currentQ < QUESTIONS.length - 1) {
          setCurrentQ(currentQ + 1);
      } else {
          finishTest();
      }
  };

  const finishTest = () => {
      setPhase('result');
  };

  useEffect(() => {
      if (phase === 'result') {
          // Calc total audio score (0-50)
          // Avg discomfort * 5
          const avgDiscomfort = (triggerScores.repetitive + triggerScores['high-freq'] + triggerScores.organic) / 3;
          const audioTotal = avgDiscomfort * 5;
          const finalScore = Math.min(100, Math.round(audioTotal + surveyScore));
          
          saveStat('misophonia-test', finalScore);
      }
  }, [phase, triggerScores, surveyScore]);


  // --- RENDERERS ---

  if (phase === 'warning') {
      return (
          <div className="max-w-xl mx-auto py-12 px-4">
              <div className="tech-border bg-black p-8 text-center clip-corner-lg border-red-900/50">
                  <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 animate-pulse">
                      <ShieldAlert size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-wider">Misophonia Test Safety</h2>
                  <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                      This online <strong>Misophonia Test</strong> involves playback of potentially distressing audio triggers, including repetitive tapping and high frequencies.
                  </p>
                  <ul className="text-left text-xs text-zinc-500 font-mono space-y-2 bg-zinc-900 p-4 rounded mb-8 border border-zinc-800">
                      <li className="flex gap-2"><AlertTriangle size={12} className="text-yellow-500"/> DO NOT take this <strong>Misophonia Test</strong> if you are currently distressed.</li>
                      <li className="flex gap-2"><Volume2 size={12} className="text-primary-500"/> Please ensure volume is set to a moderate level.</li>
                      <li className="flex gap-2"><Activity size={12} className="text-red-500"/> Panic Stop is available to immediately halt the <strong>Misophonia Test</strong>.</li>
                  </ul>
                  <button onClick={() => setPhase('intro')} className="btn-primary w-full border-red-500 hover:bg-red-950 text-black hover:text-red-500">
                      I Understand & Proceed
                  </button>
              </div>
          </div>
      );
  }

  if (phase === 'intro') {
      return (
          <div className="max-w-2xl mx-auto text-center animate-in fade-in zoom-in">
              <Headphones size={48} className="mx-auto text-zinc-600 mb-6" />
              <h1 className="text-3xl font-bold text-white mb-2">Misophonia Test & Sensitivity Assessment</h1>
              <p className="text-zinc-400 max-w-lg mx-auto mb-8">
                  Quantify your Selective Sound Sensitivity Syndrome. This professional <strong>Misophonia Test</strong> combines a clinical questionnaire with a real-time psychoacoustic tolerance challenge using synthetic triggers.
              </p>
              <button onClick={() => setPhase('audio-test')} className="btn-primary">
                  Start Misophonia Test Calibration
              </button>
          </div>
      );
  }

  if (phase === 'audio-test') {
      const getTriggerName = (t: TriggerType) => {
          if (t === 'repetitive') return "Pattern A: Mechanical Repetition";
          if (t === 'high-freq') return "Pattern B: High Frequency";
          return "Pattern C: Organic / Mouth Sounds";
      };

      return (
          <div className="max-w-xl mx-auto animate-in slide-in-from-right">
              <div className="flex justify-between items-center mb-6">
                  <span className="text-xs font-mono text-zinc-500">MISOPHONIA TEST: PHASE 1</span>
                  <span className="text-xs font-mono text-primary-500">STEP {step} / {TOTAL_STEPS}</span>
              </div>

              <div className="tech-border bg-black p-6 mb-8 relative overflow-hidden">
                  <div className="absolute top-2 left-2 flex gap-4">
                      <div className="text-[9px] text-red-500 font-mono animate-pulse">
                         {isPlaying ? '• STIMULUS ACTIVE' : '• STANDBY'}
                      </div>
                      {isMasking && <div className="text-[9px] text-cyan-500 font-mono"> + MASKING ACTIVE</div>}
                  </div>
                  
                  {/* Canvas Visualizer */}
                  <canvas ref={canvasRef} width={500} height={150} className="w-full h-32 bg-zinc-900 border border-zinc-800 rounded mb-6 opacity-80" />

                  <h3 className="text-lg font-bold text-white mb-1 text-center">
                      {getTriggerName(currentTrigger)}
                  </h3>
                  <p className="text-zinc-500 text-xs text-center mb-6">
                      Click play to continue the <strong>Misophonia Test</strong>. Listen for at least 5 seconds.
                  </p>

                  <div className="flex justify-center gap-4 mb-8">
                      {!isPlaying ? (
                          <button onClick={() => playTrigger(currentTrigger)} className="w-16 h-16 rounded-full bg-primary-600 hover:bg-primary-500 flex items-center justify-center text-black shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all hover:scale-105">
                              <Play size={32} fill="black" />
                          </button>
                      ) : (
                          <div className="flex gap-4">
                              {/* Masking Tool */}
                              <button 
                                onClick={toggleMasking} 
                                className={`h-16 px-6 rounded-full border border-cyan-500/30 flex flex-col items-center justify-center gap-1 transition-all ${isMasking ? 'bg-cyan-900/30 text-cyan-400' : 'bg-black text-zinc-500 hover:text-cyan-400'}`}
                              >
                                  <Wind size={20} />
                                  <span className="text-[9px] font-bold uppercase">{isMasking ? 'Masking On' : 'Try Masking'}</span>
                              </button>
                              
                              {/* Panic Stop */}
                              <button onClick={stopAllAudio} className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center text-black shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all hover:scale-105 animate-pulse">
                                  <Square size={24} fill="black" />
                              </button>
                          </div>
                      )}
                  </div>

                  {/* Rating Scale */}
                  <div className="space-y-4 bg-zinc-900/50 p-4 rounded border border-zinc-800">
                      <div className="flex justify-between text-xs font-mono text-zinc-400">
                          <span>No Reaction</span>
                          <span>Annoying</span>
                          <span>Unbearable</span>
                      </div>
                      <input 
                          type="range" 
                          min="0" 
                          max="10" 
                          step="1"
                          value={discomfortLevel}
                          onChange={(e) => setDiscomfortLevel(parseInt(e.target.value))}
                          className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
                      />
                      <div className="text-center font-mono font-bold text-white text-lg">
                          Discomfort Level: <span className="text-primary-400">{discomfortLevel}</span>/10
                      </div>
                  </div>
              </div>

              <button onClick={submitAudioRating} className="btn-secondary w-full">
                  Confirm Rating & Next
              </button>
          </div>
      );
  }

  if (phase === 'questionnaire') {
      return (
          <div className="max-w-xl mx-auto animate-in slide-in-from-right">
             <div className="flex justify-between items-center mb-6">
                  <span className="text-xs font-mono text-zinc-500">MISOPHONIA TEST: PHASE 2</span>
                  <span className="text-xs font-mono text-primary-500">Q.{currentQ + 1}</span>
             </div>
             
             <div className="tech-border bg-surface p-8 min-h-[300px] flex flex-col justify-center">
                 <h3 className="text-xl md:text-2xl text-white font-medium mb-8 leading-relaxed">
                     {QUESTIONS[currentQ].text}
                 </h3>
                 
                 <div className="space-y-3">
                     <button onClick={() => handleSurveyAnswer(0)} className="w-full p-4 border border-zinc-800 bg-black/50 hover:bg-zinc-800 text-left text-zinc-400 hover:text-white transition-all clip-corner-sm">
                         Not really / Never
                     </button>
                     <button onClick={() => handleSurveyAnswer(1)} className="w-full p-4 border border-zinc-800 bg-black/50 hover:bg-zinc-800 text-left text-zinc-400 hover:text-white transition-all clip-corner-sm">
                         Sometimes / Mildly
                     </button>
                     <button onClick={() => handleSurveyAnswer(2)} className="w-full p-4 border border-zinc-800 bg-black/50 hover:bg-zinc-800 text-left text-white font-bold border-l-4 border-l-primary-500 transition-all clip-corner-sm shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                         Yes / Often / Strongly
                     </button>
                 </div>
             </div>
          </div>
      );
  }

  // Result Phase
  // Recalculate total for display
  const avgDiscomfort = (triggerScores.repetitive + triggerScores['high-freq'] + triggerScores.organic) / 3;
  const totalScore = Math.min(100, Math.round((avgDiscomfort * 5) + surveyScore));
  
  return (
    <div className="max-w-2xl mx-auto text-center animate-in zoom-in duration-500">
        <div className="tech-border bg-black p-10 clip-corner-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-grid opacity-20"></div>
            
            <h2 className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-4">Misophonia Test Report</h2>
            
            <div className="mb-8">
                <div className={`text-5xl font-bold mb-2 text-glow ${totalScore > 70 ? 'text-red-500' : totalScore > 40 ? 'text-yellow-500' : 'text-emerald-500'}`}>
                    {totalScore > 70 ? "High Sensitivity" : totalScore > 40 ? "Moderate" : "Low Sensitivity"}
                </div>
                <div className="text-xs font-mono text-zinc-600">
                    COMPOSITE_SCORE: {totalScore}/100
                </div>
            </div>

            {/* Trigger Breakdown */}
            <div className="mb-8">
               <h4 className="text-[10px] text-zinc-500 uppercase font-mono mb-3 text-left">Specific Triggers (0-10)</h4>
               <div className="space-y-3">
                   {[
                       { l: 'Mechanical/Repetitive', v: triggerScores.repetitive },
                       { l: 'High Frequency', v: triggerScores['high-freq'] },
                       { l: 'Organic (Mouth Sounds)', v: triggerScores.organic }
                   ].map((t, i) => (
                       <div key={i} className="flex items-center gap-4 text-xs">
                           <span className="w-32 text-left text-zinc-400">{t.l}</span>
                           <div className="flex-1 h-2 bg-zinc-900 rounded-full overflow-hidden">
                               <div className={`h-full ${t.v > 7 ? 'bg-red-500' : t.v > 4 ? 'bg-yellow-500' : 'bg-emerald-500'}`} style={{ width: `${t.v * 10}%` }}></div>
                           </div>
                           <span className="w-6 font-mono text-white">{t.v}</span>
                       </div>
                   ))}
               </div>
            </div>

            <div className="bg-zinc-900/50 p-4 border border-zinc-800 text-left mb-8">
                <div className="flex gap-2 items-start">
                    <ShieldAlert className="text-primary-500 shrink-0 mt-0.5" size={16}/>
                    <div>
                        <h4 className="text-white text-sm font-bold mb-1">Misophonia Test Insights</h4>
                        <p className="text-xs text-zinc-400">
                           Based on your <strong>Misophonia Test</strong> score, {totalScore > 60 
                             ? "your high sensitivity to organic/repetitive triggers suggests that 'Brown Noise' masking (which you tested) or active noise-cancelling headphones are essential coping tools."
                             : "you have manageable sensitivity. Background masking may help during periods of high stress, but is not critically required."}
                        </p>
                    </div>
                </div>
            </div>

            <button onClick={() => { setPhase('intro'); setTriggerScores({repetitive:0,'high-freq':0,organic:0}); setSurveyScore(0); setStep(1); setCurrentQ(0); }} className="btn-secondary w-full">
                Re-Calibrate
            </button>
        </div>

        {/* SEO Context */}
        <div className="mt-12 border-t border-zinc-800 pt-6 text-left">
            <h4 className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-2 flex items-center gap-2">
                <Activity size={12} /> Clinical Context: Understanding Your Misophonia Test
            </h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
                This <strong>Misophonia Test</strong> evaluates Selective Sound Sensitivity Syndrome. Unlike general annoyance, the triggers identified in this <strong>Misophonia Test</strong> (like chewing, tapping, or breathing) bypass the logical brain and activate the amygdala, causing an instant physiological stress response. Taking a <strong>Misophonia Test</strong> is the first step toward effective management and desensitization therapies.
            </p>
        </div>
    </div>
  );
};

export default MisophoniaTest;