import React, { useState, useEffect } from 'react';
import { Book, RotateCcw, Brain } from 'lucide-react';
import { saveStat } from '../../lib/core';

const WORD_BANK = [
  "House", "Time", "Person", "Year", "Way", "Day", "Thing", "Man", "World", "Life",
  "Hand", "Part", "Child", "Eye", "Woman", "Place", "Work", "Week", "Case", "Point",
  "Government", "Company", "Number", "Group", "Problem", "Fact", "Idea", "Water", "Money",
  "Month", "Book", "Level", "Side", "Feet", "System", "Story", "Power", "City", "Line",
  "Game", "Law", "Car", "End", "Member", "Name", "House", "School", "Body", "Food",
  "Family", "Light", "President", "History", "Result", "Morning", "Evening", "Girl", "Boy",
  "Door", "Word", "Sense", "Policy", "Changes", "Table", "Room", "Force", "Service",
  "Market", "Art", "Father", "Mother", "Party", "Information", "Office", "Tree", "Power"
];

const VerbalMemoryTest: React.FC = () => {
  const [phase, setPhase] = useState<'intro' | 'play' | 'result'>('intro');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [currentWord, setCurrentWord] = useState('');
  const [seenWords, setSeenWords] = useState<Set<string>>(new Set());
  
  // Weights: higher chance to show SEEN word as pool grows
  useEffect(() => {
    if (phase === 'play') {
       nextTurn();
    }
  }, [phase]);

  const nextTurn = () => {
      // Logic: 
      // If seenWords is empty, must show new.
      // If seenWords has items, ~40% chance to show seen, 60% new?
      // We want to scale difficulty.
      
      const showSeen = seenWords.size > 0 && Math.random() > 0.6;
      
      if (showSeen) {
          const words = Array.from(seenWords);
          const randomSeen = words[Math.floor(Math.random() * words.length)];
          setCurrentWord(randomSeen);
      } else {
          // Pick a word NOT in seenWords
          let newWord = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
          while (seenWords.has(newWord)) {
             newWord = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
          }
          setCurrentWord(newWord);
      }
  };

  const handleGuess = (guess: 'seen' | 'new') => {
      const isActuallySeen = seenWords.has(currentWord);
      
      let correct = false;
      if (guess === 'seen' && isActuallySeen) correct = true;
      if (guess === 'new' && !isActuallySeen) correct = true;

      if (correct) {
          setScore(s => s + 1);
          if (!isActuallySeen) {
              setSeenWords(prev => new Set(prev).add(currentWord));
          }
          nextTurn();
      } else {
          const newLives = lives - 1;
          setLives(newLives);
          if (newLives <= 0) {
              finish();
          } else {
              // Still add it to seen if it was new, effectively
              if (!isActuallySeen) setSeenWords(prev => new Set(prev).add(currentWord));
              nextTurn();
          }
      }
  };

  const finish = () => {
      setPhase('result');
      // Score: >50 is usually expert. 
      const normalized = Math.min(100, Math.round((score / 50) * 100));
      saveStat('verbal-memory', normalized);
  };

  const restart = () => {
      setScore(0);
      setLives(3);
      setSeenWords(new Set());
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
                   <br/>Click <strong>NEW</strong> if you haven't seen the word yet.
                   <br/>Click <strong>SEEN</strong> if the word has appeared before.
                   <br/>You have 3 lives.
               </p>
               <button onClick={() => setPhase('play')} className="btn-primary">Start Test</button>
           </div>
       )}

       {phase === 'play' && (
           <div className="py-12 animate-in slide-in-from-right duration-300">
               <div className="flex justify-between items-center mb-12 px-8">
                   <div className="text-left">
                       <div className="text-xs text-zinc-500 font-mono uppercase">Lives</div>
                       <div className="flex gap-1">
                           {[...Array(3)].map((_, i) => (
                               <div key={i} className={`w-3 h-3 rounded-full ${i < lives ? 'bg-primary-500' : 'bg-zinc-800'}`}></div>
                           ))}
                       </div>
                   </div>
                   <div className="text-right">
                       <div className="text-xs text-zinc-500 font-mono uppercase">Score</div>
                       <div className="text-2xl font-bold text-white font-mono">{score}</div>
                   </div>
               </div>

               <div className="text-5xl md:text-6xl font-bold text-white mb-16 h-20 flex items-center justify-center">
                   {currentWord}
               </div>

               <div className="flex gap-4 justify-center">
                   <button 
                      onClick={() => handleGuess('seen')} 
                      className="px-8 py-4 bg-yellow-600 hover:bg-yellow-500 text-black font-bold text-xl rounded-lg w-40 transition-transform active:scale-95"
                   >
                       SEEN
                   </button>
                   <button 
                      onClick={() => handleGuess('new')} 
                      className="px-8 py-4 bg-primary-600 hover:bg-primary-500 text-black font-bold text-xl rounded-lg w-40 transition-transform active:scale-95"
                   >
                       NEW
                   </button>
               </div>
           </div>
       )}

       {phase === 'result' && (
           <div className="py-12 animate-in zoom-in">
               <Brain size={64} className="mx-auto text-primary-500 mb-6" />
               <h2 className="text-xl text-zinc-500 font-mono uppercase tracking-widest mb-2">Word Retention</h2>
               <div className="text-6xl font-bold text-white mb-6">{score} <span className="text-2xl text-zinc-600">words</span></div>
               
               <p className="text-zinc-400 mb-8 max-w-sm mx-auto">
                   {score > 50 ? "Superior verbal memory. You can hold complex lists easily." :
                    score > 25 ? "Above average. Good short-term retention." :
                    "Average. Keep practicing to improve working memory."}
               </p>
               <button onClick={restart} className="btn-secondary flex items-center gap-2 mx-auto">
                   <RotateCcw size={16} /> Try Again
               </button>
           </div>
       )}
    </div>
  );
};

export default VerbalMemoryTest;