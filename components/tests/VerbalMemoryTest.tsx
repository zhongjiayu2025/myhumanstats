
import React, { useState, useEffect, useCallback } from 'react';
import { Book, RotateCcw, Brain, Zap, ArrowLeft, ArrowRight, Heart, HeartCrack, Info } from 'lucide-react';
import { saveStat } from '../../lib/core';

// Categorized Word Banks for Dynamic Difficulty
const EASY_WORDS = [
  "House", "Time", "Way", "Day", "Man", "Life", "Hand", "Eye", "Place", "Work", 
  "Week", "Case", "Point", "Group", "Fact", "Idea", "Water", "Book", "Side", "Feet", 
  "Game", "Car", "Door", "Word", "Room", "Art", "Tree", "Fish", "Bird", "Road",
  "Sun", "Moon", "Star", "Fire", "Ice", "Wind", "Rain", "Snow", "Love", "Hope"
];

const HARD_WORDS = [
  "Government", "Information", "Development", "Relationship", "Environment", "University", "Management", "Organization", "Technology", "Individual",
  "Opportunity", "Performance", "Population", "Structure", "Conclusion", "Definition", "Difference", "Everything", "Literature", "Philosophy",
  "Psychology", "Revolution", "Significant", "Traditional", "Understanding", "Communication", "Discussion", "Experience", "Generation", "Investment"
];

const VerbalMemoryTest: React.FC = () => {
  const [phase, setPhase] = useState<'intro' | 'play' | 'result'>('intro');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [currentWord, setCurrentWord] = useState('');
  
  // Refactor seenWords to Map for turn tracking: Word -> Turn Index
  const [seenWords, setSeenWords] = useState<Map<string, number>>(new Map());
  const [turn, setTurn] = useState(0);
  
  // UX State
  const [combo, setCombo] = useState(0);
  const [animClass, setAnimClass] = useState(''); 
  const [failureReason, setFailureReason] = useState<string | null>(null);

  useEffect(() => {
    if (phase === 'play') {
       nextTurn();
    }
  }, [phase]);

  const nextTurn = () => {
      setTurn(t => t + 1);
      
      // Dynamic Difficulty: >20 score mixes in Hard Words
      const pool = score > 20 ? [...EASY_WORDS, ...HARD_WORDS] : EASY_WORDS;
      
      // 40% chance to show seen word IF we have seen words
      const showSeen = seenWords.size > 0 && Math.random() > 0.6;
      
      if (showSeen) {
          const words = Array.from(seenWords.keys());
          const randomSeen = words[Math.floor(Math.random() * words.length)];
          setCurrentWord(randomSeen);
      } else {
          let newWord = pool[Math.floor(Math.random() * pool.length)];
          let safety = 0;
          while (seenWords.has(newWord) && safety < 50) {
             newWord = pool[Math.floor(Math.random() * pool.length)];
             safety++;
          }
          setCurrentWord(newWord);
      }
      setAnimClass('animate-in zoom-in duration-300'); 
  };

  const handleGuess = useCallback((guess: 'seen' | 'new') => {
      if (phase !== 'play') return;

      const isActuallySeen = seenWords.has(currentWord);
      
      let correct = false;
      if (guess === 'seen' && isActuallySeen) correct = true;
      if (guess === 'new' && !isActuallySeen) correct = true;

      // Animate OUT
      setAnimClass(guess === 'seen' ? 'animate-out slide-out-to-left opacity-0 duration-200' : 'animate-out slide-out-to-right opacity-0 duration-200');

      setTimeout(() => {
          if (correct) {
              setScore(s => s + 1);
              setCombo(c => c + 1);
              if (!isActuallySeen) {
                  setSeenWords(prev => new Map(prev).set(currentWord, turn));
              }
              nextTurn();
          } else {
              setCombo(0);
              
              // Generate Failure Context
              let reason = "";
              if (guess === 'seen' && !isActuallySeen) {
                  reason = `"${currentWord}" was NEW. You haven't seen it yet.`;
              } else if (guess === 'new' && isActuallySeen) {
                  const seenTurn = seenWords.get(currentWord);
                  const turnsAgo = turn - (seenTurn || 0);
                  reason = `"${currentWord}" was SEEN. It appeared ${turnsAgo} turns ago.`;
              }
              setFailureReason(reason);

              const newLives = lives - 1;
              setLives(newLives);
              
              if (newLives <= 0) {
                  finish();
              } else {
                  if (!isActuallySeen) setSeenWords(prev => new Map(prev).set(currentWord, turn));
                  nextTurn();
              }
          }
      }, 200); 
  }, [phase, currentWord, seenWords, lives, turn]);

  // Keyboard Shortcuts
  useEffect(() => {
      const handleKey = (e: KeyboardEvent) => {
          if (phase === 'play') {
              if (e.key === 'ArrowLeft') handleGuess('seen');
              if (e.key === 'ArrowRight') handleGuess('new');
          } else if (phase === 'intro' || phase === 'result') {
              if (e.code === 'Space' || e.key === 'Enter') {
                  if (phase === 'result') restart();
                  else setPhase('play');
              }
          }
      };
      window.addEventListener('keydown', handleKey);
      return () => window.removeEventListener('keydown', handleKey);
  }, [phase, handleGuess]);

  const finish = () => {
      setPhase('result');
      const normalized = Math.min(100, Math.round((score / 50) * 100));
      saveStat('verbal-memory', normalized);
  };

  const restart = () => {
      setScore(0);
      setLives(3);
      setCombo(0);
      setSeenWords(new Map());
      setTurn(0);
      setFailureReason(null);
      setPhase('play');
  };

  return (
    <div className="max-w-xl mx-auto text-center select-none">
       {phase === 'intro' && (
           <div className="py-12 animate-in fade-in">
               <Book size={64} className="mx-auto text-zinc-600 mb-6" />
               <h2 className="text-3xl font-bold text-white mb-2">Verbal Memory Test</h2>
               <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                   You will see a stream of words. 
                   <br/>Click <strong>SEEN</strong> if the word has appeared before.
                   <br/>Click <strong>NEW</strong> if it's the first time appearing.
               </p>
               
               <div className="flex justify-center gap-4 text-xs font-mono text-zinc-500 mb-8">
                   <div className="flex items-center gap-1"><span className="border border-zinc-700 px-2 py-1 rounded bg-zinc-900">←</span> SEEN</div>
                   <div className="flex items-center gap-1"><span className="border border-zinc-700 px-2 py-1 rounded bg-zinc-900">→</span> NEW</div>
               </div>

               <button onClick={() => setPhase('play')} className="btn-primary">Start Test</button>
           </div>
       )}

       {phase === 'play' && (
           <div className="py-12">
               <div className="flex justify-between items-end mb-12 px-4 border-b border-zinc-800 pb-4">
                   <div className="text-left">
                       <div className="text-[10px] text-zinc-500 font-mono uppercase">Lives</div>
                       <div className="flex gap-1">
                           {[...Array(3)].map((_, i) => (
                               <div key={i} className="text-red-500 transition-all">
                                   {i < lives ? <Heart size={20} fill="currentColor" /> : <HeartCrack size={20} className="opacity-20" />}
                               </div>
                           ))}
                       </div>
                   </div>
                   
                   <div className="flex flex-col items-center">
                       {combo > 5 && (
                           <div className="text-amber-500 text-xs font-bold animate-bounce flex items-center gap-1">
                               <Zap size={12} fill="currentColor" /> {combo} COMBO
                           </div>
                       )}
                   </div>

                   <div className="text-right">
                       <div className="text-[10px] text-zinc-500 font-mono uppercase">Score</div>
                       <div className="text-2xl font-bold text-white font-mono">{score}</div>
                   </div>
               </div>

               {/* Failure Feedback Toast */}
               {failureReason && (
                   <div className="absolute top-24 left-0 right-0 flex justify-center pointer-events-none z-20">
                       <div className="bg-red-900/90 text-white px-4 py-2 rounded-full text-xs font-bold shadow-xl animate-in slide-in-from-top-4 fade-out duration-2000">
                           {failureReason}
                       </div>
                   </div>
               )}

               <div className="relative mb-16 min-h-[140px] flex items-center justify-center">
                   <div className={`
                        text-4xl md:text-6xl font-bold py-12 px-8 rounded-xl border-2 bg-black border-zinc-800 shadow-2xl
                        ${animClass}
                   `}>
                       {currentWord}
                   </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                   <button 
                      onClick={() => handleGuess('seen')} 
                      className="group h-20 bg-zinc-900 hover:bg-yellow-600/20 border border-zinc-800 hover:border-yellow-500 text-zinc-300 hover:text-yellow-400 font-bold text-xl rounded-lg transition-all active:scale-95 flex flex-col items-center justify-center relative"
                   >
                       SEEN
                       <div className="absolute bottom-2 text-[10px] opacity-30 font-mono group-hover:opacity-100 transition-opacity flex items-center gap-1"><ArrowLeft size={10}/> KEY</div>
                   </button>
                   <button 
                      onClick={() => handleGuess('new')} 
                      className="group h-20 bg-zinc-900 hover:bg-primary-600/20 border border-zinc-800 hover:border-primary-500 text-zinc-300 hover:text-primary-400 font-bold text-xl rounded-lg transition-all active:scale-95 flex flex-col items-center justify-center relative"
                   >
                       NEW
                       <div className="absolute bottom-2 text-[10px] opacity-30 font-mono group-hover:opacity-100 transition-opacity flex items-center gap-1">KEY <ArrowRight size={10}/></div>
                   </button>
               </div>
           </div>
       )}

       {phase === 'result' && (
           <div className="py-12 animate-in zoom-in">
               <Brain size={64} className="mx-auto text-primary-500 mb-6" />
               <h2 className="text-xl text-zinc-500 font-mono uppercase tracking-widest mb-2">Word Retention</h2>
               <div className="text-6xl font-bold text-white mb-6">{score} <span className="text-2xl text-zinc-600">words</span></div>
               
               {/* Final Analysis */}
               <div className="bg-zinc-900/50 p-6 border border-zinc-800 rounded-xl mb-8 max-w-sm mx-auto text-left">
                   <div className="flex items-start gap-3">
                       <Info size={18} className="text-zinc-500 mt-1 shrink-0" />
                       <div>
                           <h4 className="text-white font-bold text-sm mb-1">Performance Analysis</h4>
                           <p className="text-zinc-400 text-xs leading-relaxed">
                               {score > 50 ? "Superior verbal memory. You successfully encoded complex vocabulary into working memory." :
                                score > 25 ? "Above average. You have good short-term retention for varying word lengths." :
                                "Average. Try connecting the words into a story to improve retention (Mnemonic linking)."}
                           </p>
                       </div>
                   </div>
               </div>

               <button onClick={restart} className="btn-secondary flex items-center gap-2 mx-auto">
                   <RotateCcw size={16} /> Try Again
               </button>
           </div>
       )}
    </div>
  );
};

export default VerbalMemoryTest;
