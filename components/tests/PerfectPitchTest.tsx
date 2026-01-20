import React, { useState, useRef, useEffect } from 'react';
import { Music, Volume2, Trophy, Settings, RefreshCcw, CheckCircle2, XCircle } from 'lucide-react';
import { saveStat } from '../../lib/core';

interface NoteDef {
  name: string;
  type: 'white' | 'black';
  freq: number;
}

const OCTAVE: NoteDef[] = [
  { name: "C", type: "white", freq: 261.63 },
  { name: "C#", type: "black", freq: 277.18 },
  { name: "D", type: "white", freq: 293.66 },
  { name: "D#", type: "black", freq: 311.13 },
  { name: "E", type: "white", freq: 329.63 },
  { name: "F", type: "white", freq: 349.23 },
  { name: "F#", type: "black", freq: 369.99 },
  { name: "G", type: "white", freq: 392.00 },
  { name: "G#", type: "black", freq: 415.30 },
  { name: "A", type: "white", freq: 440.00 },
  { name: "A#", type: "black", freq: 466.16 },
  { name: "B", type: "white", freq: 493.88 }
];

type Difficulty = 'easy' | 'hard'; // Easy = White keys only, Hard = Chromatic

// --- UI Components ---
interface PianoKeyProps {
  note: NoteDef;
  difficulty: Difficulty;
  isWaiting: boolean;
  lastGuess: string | null;
  currentNote: NoteDef | null;
  isCorrect: boolean | null;
  onGuess: (noteName: string) => void;
}

const PianoKey: React.FC<PianoKeyProps> = ({ 
  note, difficulty, isWaiting, lastGuess, currentNote, isCorrect, onGuess 
}) => {
  const isWhite = note.type === 'white';
  
  // Interaction State
  const isWrongGuess = isWaiting && lastGuess === note.name && !isCorrect;
  const isRightAnswer = isWaiting && currentNote?.name === note.name;
  
  let bgClass = isWhite ? 'bg-white text-zinc-400' : 'bg-black text-zinc-600';
  
  if (isRightAnswer) {
      bgClass = 'bg-emerald-500 !text-black shadow-[0_0_20px_#10b981] z-20';
  } else if (isWrongGuess) {
      bgClass = 'bg-red-500 !text-white z-20';
  } else if (!isWhite) {
      // Default black key
      bgClass = 'bg-zinc-900 border border-zinc-700 text-zinc-600';
  } else {
      // Default white key
      bgClass = 'bg-zinc-100 hover:bg-zinc-200 text-zinc-400';
  }

  // Disable interaction if not in pool for Easy mode? 
  // No, usually easy mode hides black keys or makes them unclickable.
  // Let's dim them in Easy mode if they are black keys.
  const isDisabled = difficulty === 'easy' && !isWhite;

  return (
      <button
          disabled={isWaiting || isDisabled}
          onClick={() => onGuess(note.name)}
          className={`
              relative flex flex-col justify-end items-center pb-2 transition-all duration-150
              ${isWhite ? 'h-48 w-12 rounded-b-md border border-t-0 border-zinc-300 z-0 active:scale-[0.98]' : 'h-28 w-8 -mx-4 z-10 rounded-b-md active:scale-[0.98]'}
              ${bgClass}
              ${isDisabled ? 'opacity-20 pointer-events-none' : 'cursor-pointer'}
          `}
      >
          <span className="text-xs font-bold font-mono pointer-events-none select-none">{note.name}</span>
      </button>
  );
};

const PerfectPitchTest: React.FC = () => {
  const [phase, setPhase] = useState<'intro' | 'play' | 'result'>('intro');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  
  // Game State
  const [currentNote, setCurrentNote] = useState<NoteDef | null>(null);
  const [score, setScore] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  
  // Feedback State
  const [lastGuess, setLastGuess] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isWaiting, setIsWaiting] = useState(false); // Waiting for next round
  
  const TOTAL_ROUNDS = 10;
  const audioCtxRef = useRef<AudioContext | null>(null);

  // --- Audio Engine ---
  const initAudio = () => {
    if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
    return audioCtxRef.current;
  };

  const playTone = (freq: number) => {
     const ctx = initAudio();
     const now = ctx.currentTime;

     // Master Gain
     const masterGain = ctx.createGain();
     masterGain.connect(ctx.destination);
     masterGain.gain.setValueAtTime(0, now);
     masterGain.gain.linearRampToValueAtTime(0.4, now + 0.02);
     masterGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

     // Oscillator 1: Fundamental (Triangle for body)
     const osc1 = ctx.createOscillator();
     osc1.type = 'triangle';
     osc1.frequency.value = freq;
     osc1.connect(masterGain);

     // Oscillator 2: Harmonic (Sine for glassiness/bell tone)
     const osc2 = ctx.createOscillator();
     osc2.type = 'sine';
     osc2.frequency.value = freq * 2; // Octave up
     const gain2 = ctx.createGain();
     gain2.gain.value = 0.3;
     osc2.connect(gain2);
     gain2.connect(masterGain);

     // Start
     osc1.start(now);
     osc2.start(now);
     
     // Stop
     osc1.stop(now + 1.5);
     osc2.stop(now + 1.5);
  };

  // --- Game Logic ---
  const startRound = () => {
     if (rounds >= TOTAL_ROUNDS) {
         finish();
         return;
     }
     
     setIsWaiting(false);
     setLastGuess(null);
     setIsCorrect(null);

     // Filter notes based on difficulty
     const pool = difficulty === 'easy' ? OCTAVE.filter(n => n.type === 'white') : OCTAVE;
     
     // Ensure we don't pick the exact same note twice in a row to keep it interesting? 
     // Actually, randomness is better for testing.
     const randomNote = pool[Math.floor(Math.random() * pool.length)];
     
     setCurrentNote(randomNote);
     playTone(randomNote.freq);
  };

  const startGame = (diff: Difficulty) => {
     setDifficulty(diff);
     setScore(0);
     setRounds(0);
     setStreak(0);
     setMaxStreak(0);
     setPhase('play');
     // Small delay to let UI settle
     setTimeout(() => startRound(), 100);
  };

  const handleGuess = (noteName: string) => {
      if (isWaiting || !currentNote) return;
      
      setLastGuess(noteName);
      setIsWaiting(true);
      setRounds(r => r + 1);

      if (noteName === currentNote.name) {
          setIsCorrect(true);
          setScore(s => s + 1);
          setStreak(s => {
              const newS = s + 1;
              setMaxStreak(m => Math.max(m, newS));
              return newS;
          });
          playTone(currentNote.freq * 2); // High ping for correct? Or just visual?
      } else {
          setIsCorrect(false);
          setStreak(0);
      }

      // Auto advance
      setTimeout(() => {
          if (rounds + 1 < TOTAL_ROUNDS) {
              startRound();
          } else {
              finish();
          }
      }, 1500);
  };

  const finish = () => {
      setPhase('result');
      // Normalize score based on difficulty? 
      // Hard mode is worth more conceptually, but for 0-100 stats, just raw percentage is standard.
      // Maybe boost hard mode score slightly if perfect?
      const baseScore = Math.round((score / TOTAL_ROUNDS) * 100);
      saveStat('perfect-pitch', baseScore);
  };

  return (
    <div className="max-w-3xl mx-auto text-center select-none min-h-[500px] flex flex-col justify-center">
       
       {phase === 'intro' && (
          <div className="animate-in fade-in zoom-in">
             <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-zinc-800 shadow-inner">
                 <Music size={32} className="text-primary-500" />
             </div>
             <h2 className="text-3xl font-bold text-white mb-2">Perfect Pitch Trainer</h2>
             <p className="text-zinc-400 mb-8 max-w-md mx-auto leading-relaxed">
                Test your ability to identify musical notes without a reference tone (Absolute Pitch).
             </p>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                 <button 
                    onClick={() => startGame('easy')}
                    className="p-6 bg-zinc-900 border border-zinc-800 hover:border-emerald-500 hover:bg-emerald-900/10 rounded-xl transition-all group text-left"
                 >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-bold">C Major (Easy)</span>
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    </div>
                    <p className="text-xs text-zinc-500 group-hover:text-zinc-400">White keys only. Good for beginners.</p>
                 </button>

                 <button 
                    onClick={() => startGame('hard')}
                    className="p-6 bg-zinc-900 border border-zinc-800 hover:border-primary-500 hover:bg-primary-900/10 rounded-xl transition-all group text-left"
                 >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-bold">Chromatic (Hard)</span>
                        <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                    </div>
                    <p className="text-xs text-zinc-500 group-hover:text-zinc-400">All 12 notes (Black & White). The real deal.</p>
                 </button>
             </div>
          </div>
       )}

       {phase === 'play' && (
          <div className="animate-in slide-in-from-bottom-8">
             {/* HUD */}
             <div className="flex justify-between items-end mb-12 px-4 border-b border-zinc-800 pb-4">
                <div className="text-left">
                    <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Progress</div>
                    <div className="text-white font-mono text-xl">{rounds + 1}<span className="text-zinc-600 text-sm">/{TOTAL_ROUNDS}</span></div>
                </div>
                
                <div className="flex flex-col items-center">
                    {/* Status Message */}
                    <div className={`h-8 flex items-center gap-2 font-bold uppercase tracking-widest transition-all ${isCorrect === true ? 'text-emerald-500 scale-110' : isCorrect === false ? 'text-red-500' : 'text-transparent'}`}>
                        {isCorrect === true ? <><CheckCircle2 size={18}/> Correct</> : isCorrect === false ? <><XCircle size={18}/> Missed</> : '...'}
                    </div>
                </div>

                <div className="text-right">
                    <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Score</div>
                    <div className="text-primary-400 font-mono text-xl">{score}</div>
                </div>
             </div>

             {/* Replay Button */}
             <div className="mb-12">
                 <button 
                    onClick={() => currentNote && playTone(currentNote.freq)}
                    className="w-20 h-20 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-all shadow-[0_0_30px_rgba(0,0,0,0.3)] active:scale-95 group mx-auto border border-zinc-700"
                 >
                    <Volume2 size={32} className="text-zinc-400 group-hover:text-white transition-colors" />
                 </button>
                 <div className="text-[10px] text-zinc-600 font-mono mt-3 uppercase tracking-widest">Replay Tone</div>
             </div>

             {/* Piano UI */}
             <div className="relative flex justify-center items-start pt-4 pb-8 select-none overflow-x-auto">
                 {/* Render logic: White keys flow normally. Black keys are interleaved absolutely or via negative margins. */}
                 {/* Flex approach with negative margins for black keys is robust */}
                 <div className="flex relative bg-zinc-800 p-1 rounded-b-lg shadow-2xl">
                     {OCTAVE.map((note) => (
                         <PianoKey 
                            key={note.name} 
                            note={note} 
                            difficulty={difficulty}
                            isWaiting={isWaiting}
                            lastGuess={lastGuess}
                            currentNote={currentNote}
                            isCorrect={isCorrect}
                            onGuess={handleGuess}
                         />
                     ))}
                 </div>
             </div>
          </div>
       )}

       {phase === 'result' && (
          <div className="py-12 animate-in zoom-in">
             <Trophy size={64} className={`mx-auto mb-6 ${score === TOTAL_ROUNDS ? 'text-yellow-500' : 'text-zinc-700'}`} />
             
             <div className="text-6xl font-bold text-white mb-2">{score}<span className="text-zinc-600 text-3xl">/{TOTAL_ROUNDS}</span></div>
             <h2 className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-8">Identification Score</h2>
             
             <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto mb-8">
                 <div className="bg-zinc-900 border border-zinc-800 p-4 rounded text-center">
                     <div className="text-xs text-zinc-500 uppercase">Best Streak</div>
                     <div className="text-xl text-white font-mono">{maxStreak}</div>
                 </div>
                 <div className="bg-zinc-900 border border-zinc-800 p-4 rounded text-center">
                     <div className="text-xs text-zinc-500 uppercase">Mode</div>
                     <div className="text-xl text-white font-mono capitalize">{difficulty}</div>
                 </div>
             </div>

             <div className="bg-zinc-900/50 p-4 border border-zinc-800 text-sm text-zinc-400 mb-8 max-w-md mx-auto rounded">
                {score === 10 ? "Flawless. You show signs of Absolute Pitch." : 
                 score >= 7 ? "Excellent relative pitch. Keep training." : 
                 "Normal. Absolute pitch is rare (1 in 10,000), but relative pitch can be trained."}
             </div>
             
             <div className="flex gap-4 justify-center">
                 <button onClick={() => setPhase('intro')} className="btn-secondary flex items-center gap-2">
                     <Settings size={16} /> Change Mode
                 </button>
                 <button onClick={() => startGame(difficulty)} className="btn-primary flex items-center gap-2">
                     <RefreshCcw size={16} /> Retry
                 </button>
             </div>
          </div>
       )}
    </div>
  );
};

export default PerfectPitchTest;