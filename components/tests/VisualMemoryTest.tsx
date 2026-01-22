
import React, { useState, useEffect, useRef } from 'react';
import { LayoutGrid, Heart, RotateCcw, Volume2, VolumeX, FastForward } from 'lucide-react';
import { saveStat } from '../../lib/core';

const VisualMemoryTest: React.FC = () => {
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [gridSize, setGridSize] = useState(3);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Sequence Logic
  const [sequence, setSequence] = useState<number[]>([]);
  const [userStep, setUserStep] = useState(0); 
  
  const [phase, setPhase] = useState<'intro' | 'demo' | 'input' | 'result'>('intro');
  const [tileStatus, setTileStatus] = useState<Record<number, 'idle'|'active'|'success'|'error'>>({});

  const audioCtxRef = useRef<AudioContext | null>(null);

  // --- Audio Engine (Melodic Mapping) ---
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
      
      // Scale Mapping (C Major Pentatonic across the grid)
      // C, D, E, G, A
      const notes = [
          261.63, 293.66, 329.63, // C4 D4 E4
          392.00, 440.00, 523.25, // G4 A4 C5
          587.33, 659.25, 783.99, // D5 E5 G5
          880.00, 1046.50, 1174.66, // A5 C6 D6 ... (for larger grids)
          1318.51, 1567.98, 1760.00
      ];
      
      // Map grid index to note.
      let freq = notes[idx % notes.length];
      
      if (type === 'error') {
          osc.type = 'sawtooth';
          freq = 110; // Low A2 buzz
      } else if (type === 'success') {
          osc.type = 'sine';
          freq = 880; // High ping
          // Little chord effect
          const osc2 = ctx.createOscillator();
          osc2.frequency.value = 1108; // C#6
          osc2.connect(gain);
          osc2.start();
          osc2.stop(ctx.currentTime + 0.4);
      } else {
          osc.type = 'triangle'; // Pleasant tone
      }

      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3); // Short notes

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
  };

  // Dynamic config based on level (Speed Ramp)
  const getConfig = (lvl: number) => {
      const size = lvl <= 3 ? 3 : lvl <= 8 ? 4 : 5;
      const length = lvl + 2;
      // Speed Ramp: Start at 800ms, decreases by 60ms per level, clamp at 300ms minimum
      const speed = Math.max(300, 800 - ((lvl - 1) * 60));
      return { size, length, speed };
  };

  // Start Level
  useEffect(() => {
    if (phase === 'demo') {
       const { size, length, speed } = getConfig(level);
       setGridSize(size);
       setUserStep(0);
       setTileStatus({});
       
       const newSeq: number[] = [];
       for(let i=0; i<length; i++) {
           newSeq.push(Math.floor(Math.random() * (size * size)));
       }
       setSequence(newSeq);
       
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
           
           // Flash OFF faster than the interval to allow gap
           setTimeout(() => {
               setTileStatus(prev => ({ ...prev, [targetTile]: 'idle' }));
           }, speed * 0.7);

           i++;
       }, speed); 

       return () => clearInterval(interval);
    }
  }, [phase, level]);

  const handleTileClick = (index: number) => {
     if (phase !== 'input') return;
     
     // Correct Step
     if (index === sequence[userStep]) {
         // Play the melodic note for this tile
         playTone(index, 'normal');
         
         const nextStep = userStep + 1;
         setUserStep(nextStep);
         
         setTileStatus(prev => ({...prev, [index]: 'active'}));
         setTimeout(() => setTileStatus(prev => ({...prev, [index]: 'idle'})), 150);
         
         if (nextStep >= sequence.length) {
             // Level Complete
             setTimeout(() => {
                 playTone(0, 'success');
                 setTileStatus(prev => ({...prev, [index]: 'success'}));
                 setTimeout(() => {
                     setLevel(l => l + 1);
                     setPhase('demo');
                 }, 800);
             }, 200);
         }
     } 
     // Wrong Step
     else {
         playTone(index, 'error');
         setLives(l => l - 1);
         setTileStatus(prev => ({...prev, [index]: 'error'}));
         
         const correctTile = sequence[userStep];
         
         setTimeout(() => {
             // Show Correct
             setTileStatus(prev => ({...prev, [index]: 'idle', [correctTile]: 'active'}));
             setTimeout(() => {
                 if (lives - 1 <= 0) {
                     finishGame();
                 } else {
                     // Repeat same level
                     setPhase('demo'); 
                 }
             }, 1000);
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

  const currentSpeed = getConfig(level).speed;

  return (
    <div className="max-w-xl mx-auto text-center select-none min-h-[500px] flex flex-col justify-center relative perspective-1000">
      
      {/* HUD */}
      {phase !== 'intro' && phase !== 'result' && (
          <div className="flex justify-between items-end border-b border-zinc-800 pb-4 mb-8">
             <div className="text-left">
                <div className="text-[10px] text-zinc-500 font-mono uppercase">Sequence</div>
                <div className="text-3xl font-bold text-white font-mono">{sequence.length || getConfig(level).length}</div>
             </div>
             
             <div className="flex flex-col items-center">
                 <div className="flex items-center gap-1 text-[10px] text-zinc-600 font-mono mb-1">
                     <FastForward size={10} /> {currentSpeed}ms
                 </div>
                 <button 
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="p-2 text-zinc-600 hover:text-white transition-colors"
                 >
                    {soundEnabled ? <Volume2 size={16}/> : <VolumeX size={16}/>}
                 </button>
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
                  <br/>Pattern length and speed increase with every level. 
                  <br/>Use auditory cues to help memorize the melody.
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
                         onTouchStart={(e) => { e.preventDefault(); handleTileClick(i); }}
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
                  Max Speed Reached: {getConfig(level).speed}ms / note.
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
