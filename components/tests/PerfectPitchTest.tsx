import React, { useState, useRef, useEffect } from 'react';
import { Music, Play, Volume2 } from 'lucide-react';
import { saveStat } from '../../lib/core';

const NOTES = [
  { name: "C", freq: 261.63 },
  { name: "C#", freq: 277.18 },
  { name: "D", freq: 293.66 },
  { name: "D#", freq: 311.13 },
  { name: "E", freq: 329.63 },
  { name: "F", freq: 349.23 },
  { name: "F#", freq: 369.99 },
  { name: "G", freq: 392.00 },
  { name: "G#", freq: 415.30 },
  { name: "A", freq: 440.00 },
  { name: "A#", freq: 466.16 },
  { name: "B", freq: 493.88 }
];

const PerfectPitchTest: React.FC = () => {
  const [phase, setPhase] = useState<'intro' | 'play' | 'result'>('intro');
  const [currentNote, setCurrentNote] = useState<typeof NOTES[0] | null>(null);
  const [score, setScore] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  
  const TOTAL_ROUNDS = 10;
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playNote = (note: typeof NOTES[0]) => {
     if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
     }
     const ctx = audioCtxRef.current;
     if (ctx.state === 'suspended') ctx.resume();

     const osc = ctx.createOscillator();
     const gain = ctx.createGain();
     
     // Use Triangle for a clearer "musical" tone than Sine
     osc.type = 'triangle';
     osc.frequency.value = note.freq;
     
     const now = ctx.currentTime;
     gain.gain.setValueAtTime(0, now);
     gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
     gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

     osc.connect(gain);
     gain.connect(ctx.destination);
     osc.start(now);
     osc.stop(now + 1.5);
  };

  const startRound = () => {
     if (rounds >= TOTAL_ROUNDS) {
         finish();
         return;
     }
     const randomNote = NOTES[Math.floor(Math.random() * NOTES.length)];
     setCurrentNote(randomNote);
     setFeedback(null);
     playNote(randomNote);
  };

  const startGame = () => {
     setScore(0);
     setRounds(0);
     setPhase('play');
     startRound();
  };

  const handleGuess = (noteName: string) => {
      if (!currentNote) return;
      
      const isCorrect = noteName === currentNote.name;
      if (isCorrect) setScore(s => s + 1);
      
      setFeedback(isCorrect ? "Correct!" : `Wrong. It was ${currentNote.name}`);
      setRounds(r => r + 1);

      setTimeout(() => {
          if (rounds + 1 < TOTAL_ROUNDS) {
              const nextNote = NOTES[Math.floor(Math.random() * NOTES.length)];
              setCurrentNote(nextNote);
              setFeedback(null);
              playNote(nextNote);
          } else {
              finish();
          }
      }, 1000);
  };

  const finish = () => {
      setPhase('result');
      // Normalize to 100
      const finalScore = Math.round((score / TOTAL_ROUNDS) * 100);
      saveStat('perfect-pitch', finalScore);
  };

  return (
    <div className="max-w-2xl mx-auto text-center select-none">
       {phase === 'intro' && (
          <div className="py-12 animate-in fade-in">
             <Music size={64} className="mx-auto text-zinc-600 mb-6" />
             <h2 className="text-3xl font-bold text-white mb-2">Perfect Pitch Test</h2>
             <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                Can you identify a musical note without any reference tone?
                <br/>This ability, known as Absolute Pitch, is rare (1 in 10,000).
             </p>
             <button onClick={startGame} className="btn-primary">Start Test</button>
          </div>
       )}

       {phase === 'play' && (
          <div className="animate-in fade-in">
             <div className="flex justify-between items-center mb-8 px-4 border-b border-zinc-800 pb-4">
                <span className="text-xs font-mono text-zinc-500">ROUND {rounds + 1}/{TOTAL_ROUNDS}</span>
                <span className="text-xs font-mono text-white">SCORE: {score}</span>
             </div>

             <div className="h-24 flex flex-col items-center justify-center mb-8">
                 {feedback ? (
                     <div className={`text-2xl font-bold ${feedback.includes('Correct') ? 'text-emerald-500' : 'text-red-500'}`}>
                        {feedback}
                     </div>
                 ) : (
                     <button 
                        onClick={() => currentNote && playNote(currentNote)}
                        className="w-16 h-16 rounded-full bg-zinc-800 hover:bg-primary-500 hover:text-black flex items-center justify-center transition-all shadow-lg group"
                     >
                        <Volume2 size={32} className="text-zinc-400 group-hover:text-black" />
                     </button>
                 )}
                 {!feedback && <span className="text-[10px] text-zinc-500 font-mono mt-2">REPLAY TONE</span>}
             </div>

             {/* Piano Keyboard UI */}
             <div className="flex justify-center gap-1 flex-wrap max-w-lg mx-auto">
                {NOTES.map(note => (
                   <button
                      key={note.name}
                      onClick={() => !feedback && handleGuess(note.name)}
                      disabled={!!feedback}
                      className={`
                         w-12 h-32 border border-zinc-700 rounded-b-md flex items-end justify-center pb-4 font-bold text-sm transition-all
                         ${note.name.includes('#') 
                            ? 'bg-zinc-900 text-zinc-400 h-24 -mx-3 z-10 hover:bg-zinc-800' 
                            : 'bg-white text-black hover:bg-zinc-200 z-0'}
                         active:scale-95 disabled:opacity-50
                      `}
                   >
                      {note.name}
                   </button>
                ))}
             </div>
          </div>
       )}

       {phase === 'result' && (
          <div className="py-12 animate-in zoom-in">
             <div className="text-6xl font-bold text-white mb-2">{score}/{TOTAL_ROUNDS}</div>
             <h2 className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-6">Notes Identified</h2>
             
             <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                {score === 10 ? "Incredible! You likely possess Absolute Pitch." : 
                 score >= 5 ? "Good relative pitch, but likely not absolute pitch." : 
                 "Normal. Most people cannot identify notes without a reference."}
             </p>
             <button onClick={startGame} className="btn-secondary">Try Again</button>
          </div>
       )}
    </div>
  );
};

export default PerfectPitchTest;