
import React, { useState, useEffect, useRef } from 'react';
import { LayoutGrid, Heart, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { saveStat } from '../../lib/core';

const VisualMemoryTest: React.FC = () => {
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [gridSize, setGridSize] = useState(3);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Sequence Logic
  const [sequence, setSequence] = useState<number[]>([]);
  // playbackIdx removed as it was unused in render
  const [userStep, setUserStep] = useState(0); 
  
  const [phase, setPhase] = useState<'intro' | 'demo' | 'input' | 'result'>('intro');
  const [tileStatus, setTileStatus] = useState<Record<number, 'idle'|'active'|'success'|'error'>>({});

  const audioCtxRef = useRef<AudioContext | null>(null);

  // --- Audio Engine ---
  const initAudio = () => {
      if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
      return audioCtxRef.current;
  };

  const playTone = (idx: number, type: 'normal'|'error'|'success') => {
      if (!soundEnabled) return;
      const ctx = initAudio();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      // Frequencies based on index to create melody
      // Base C4 (261) + pentatonic steps
      const baseFreq = 261.63;
      const steps = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26, 28, 31, 33, 36];
      let freq = baseFreq * Math.pow(2, steps[idx % steps.length] / 12);
      
      if (type === 'error') {
          osc.type = 'sawtooth';
          freq = 150; // Low buzz
      } else if (type === 'success') {
          osc.type = 'sine';
          freq = 880; // High ping
      } else {
          osc.type = 'triangle';
      }

      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
  };

  // Dynamic config based on level
  const getConfig = (lvl: number) => {
      const size = lvl <= 3 ? 3 : lvl <= 8 ? 4 : 5;
      const length = lvl + 2;
      return { size, length };
  };

  // Start Level
  useEffect(() => {
    if (phase === 'demo') {
       const { size, length } = getConfig(level);
       setGridSize(size);
       setUserStep(0);
       setTileStatus({});
       
       // Generate sequence with explicit type
       const newSeq: number[] = [];
       // Avoid immediate repeats? No, Simon allows repeats.
       for(let i=0; i<length; i++) {
           newSeq.push(Math.floor(Math.random() * (size * size)));
       }
       setSequence(newSeq);
       
       // Play sequence
       let i = 0;
       const interval = setInterval(() => {
           if (i >= newSeq.length) {
               clearInterval(interval);
               setTileStatus({});
               setPhase('input');
               return;
           }
           
           const targetTile = newSeq[i];
           setTileStatus(prev => ({ ...prev, [targetTile]: 'active' }));
           playTone(targetTile, 'normal');
           
           // Flash OFF
           setTimeout(() => {
               setTileStatus(prev => ({ ...prev, [targetTile]: 'idle' }));
           }, 400);

           i++;
       }, 800); 

       return () => clearInterval(interval);
    }
  }, [phase, level]);

  const handleTileClick = (index: number) => {
     if (phase !== 'input') return;
     
     // Animation trigger
     playTone(index, index === sequence[userStep] ? 'normal' : 'error');

     // Correct Step
     if (index === sequence[userStep]) {
         const nextStep = userStep + 1;
         setUserStep(nextStep);
         
         // Flash visual
         setTileStatus(prev => ({...prev, [index]: 'active'}));
         setTimeout(() => setTileStatus(prev => ({...prev, [index]: 'idle'})), 200);
         
         if (nextStep >= sequence.length) {
             // Level Complete
             playTone(0, 'success');
             setTileStatus(prev => ({...prev, [index]: 'success'}));
             setTimeout(() => {
                 setLevel(l => l + 1);
                 setPhase('demo');
             }, 800);
         }
     } 
     // Wrong Step
     else {
         setLives(l => l - 1);
         setTileStatus(prev => ({...prev, [index]: 'error'}));
         
         // Show correct tile
         const correctTile = sequence[userStep];
         
         setTimeout(() => {
             // Briefly flash the CORRECT tile so user learns
             setTileStatus(prev => ({...prev, [index]: 'idle', [correctTile]: 'active'}));
             setTimeout(() => {
                 if (lives - 1 <= 0) {
                     finishGame();
                 } else {
                     setPhase('demo'); 
                 }
             }, 800);
         }, 400);
     }
  };

  const finishGame = () => {
     setPhase('result');
     const score = Math.min(100, Math.round((level / 12) * 100));
     saveStat('visual-memory', score);
  };

  const restart = () => {
     setLevel(1);
     setLives(3);
     setPhase('demo');
  };

  return (
    <div className="max-w-xl mx-auto text-center select-none min-h-[500px] flex flex-col justify-center relative perspective-1000">
      
      {/* Audio Toggle */}
      <button 
         onClick={() => setSoundEnabled(!soundEnabled)}
         className="absolute top-0 right-0 p-2 text-zinc-600 hover:text-white transition-colors"
      >
         {soundEnabled ? <Volume2 size={16}/> : <VolumeX size={16}/>}
      </button>

      {/* HUD */}
      {phase !== 'intro' && phase !== 'result' && (
          <div className="flex justify-between items-end border-b border-zinc-800 pb-4 mb-8">
             <div className="text-left">
                <div className="text-[10px] text-zinc-500 font-mono uppercase">Sequence</div>
                <div className="text-3xl font-bold text-white font-mono">{sequence.length || getConfig(level).length}</div>
             </div>
             
             <div className="flex gap-1">
                 {[1, 2, 3].map(i => (
                     <Heart 
                        key={i} 
                        size={24} 
                        className={`transition-all duration-300 ${i <= lives ? 'fill-red-500 text-red-500' : 'fill-zinc-900 text-zinc-800'}`} 
                     />
                 ))}
             </div>
          </div>
      )}

      {phase === 'intro' && (
          <div className="animate-in fade-in zoom-in">
              <LayoutGrid size={64} className="mx-auto text-primary-500 mb-6" />
              <h2 className="text-3xl font-bold text-white mb-2">Sequence Memory</h2>
              <p className="text-zinc-400 text-sm max-w-sm mx-auto mb-8">
                  The <strong>Corsi Block-Tapping Task</strong>.
                  <br/>Memorize the pattern. Replay it exactly.
              </p>
              <button onClick={() => setPhase('demo')} className="btn-primary">Start Memory Test</button>
          </div>
      )}

      {(phase === 'demo' || phase === 'input') && (
          <div className="flex flex-col items-center" style={{ perspective: '1000px' }}>
             
             <div className="mb-4 h-6 text-sm font-mono font-bold tracking-widest uppercase">
                 {phase === 'demo' ? <span className="text-yellow-500 animate-pulse">Scanning...</span> : <span className="text-emerald-500">Input Active</span>}
             </div>

             <div 
               className="grid gap-3 bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500 transform rotateX(10deg)"
               style={{ 
                  gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                  width: 'min(100%, 380px)',
                  aspectRatio: '1/1',
               }}
             >
                {Array.from({ length: gridSize * gridSize }).map((_, i) => {
                   const status = tileStatus[i] || 'idle';
                   
                   let bg = 'bg-zinc-800 border-zinc-700'; 
                   let shadow = '';
                   let transform = '';

                   if (status === 'active') {
                       bg = 'bg-white border-white';
                       shadow = 'shadow-[0_0_30px_white] z-10';
                       transform = 'scale(1.05) translateZ(10px)';
                   } else if (status === 'success') {
                       bg = 'bg-emerald-500 border-emerald-400';
                       shadow = 'shadow-[0_0_30px_#10b981] z-10';
                   } else if (status === 'error') {
                       bg = 'bg-red-500 border-red-400';
                       shadow = 'shadow-[0_0_30px_#ef4444] z-10';
                       transform = 'scale(0.95)';
                   } else if (phase === 'input') {
                       bg = 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 hover:border-primary-500/50 cursor-pointer';
                   }

                   return (
                      <div 
                         key={i}
                         onMouseDown={() => handleTileClick(i)}
                         className={`rounded-lg border-2 transition-all duration-150 ${bg} ${shadow}`}
                         style={{ transform }}
                      ></div>
                   );
                })}
             </div>
          </div>
      )}

      {phase === 'result' && (
          <div className="animate-in slide-in-from-bottom-4">
              <div className="text-zinc-500 font-mono text-xs uppercase mb-2">Max Sequence</div>
              <div className="text-6xl font-bold text-white mb-6">{level + 1} <span className="text-xl text-zinc-600">Steps</span></div>
              
              <div className="bg-zinc-900/50 p-4 border border-zinc-800 text-sm text-zinc-400 max-w-xs mx-auto mb-8 rounded">
                  Average human working memory (Miller's Law) is around 7 items.
                  <br/>
                  {level + 1 > 9 ? "You have exceptional serial memory." : "You are within the normal range."}
              </div>

              <button onClick={restart} className="btn-secondary flex items-center gap-2 mx-auto">
                  <RotateCcw size={16} /> Try Again
              </button>
          </div>
      )}

    </div>
  );
};

export default VisualMemoryTest;
