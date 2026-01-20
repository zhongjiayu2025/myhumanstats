import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Timer, Check, X, FileText } from 'lucide-react';
import { saveStat } from '../../lib/core';

const TEXT_SOURCE = {
  title: "The Cognitive Revolution",
  content: `The Cognitive Revolution was an intellectual movement that began in the 1950s as an interdisciplinary study of the mind and its processes. It became known collectively as cognitive science. The relevant fields of interchange were between psychology, linguistics, and computer science. This approach centered on the idea that the mind is a complex system that receives, stores, retrieves, and processes information.

  Before this revolution, behaviorism was the dominant school in psychology, focusing solely on observable behavior and ignoring internal mental states. The cognitive revolution reintroduced the study of thoughts, feelings, and beliefs, arguing that these internal processes were essential to understanding behavior. Key figures like Noam Chomsky and George Miller played pivotal roles, challenging behaviorist assumptions about language and memory.

  The development of the digital computer provided a new metaphor for the mind. Psychologists began to view the brain as a hardware and the mind as software, processing inputs to generate outputs. This computational theory of mind remains a cornerstone of cognitive psychology today, influencing artificial intelligence and neuroscience.`,
  wordCount: 168,
  questions: [
    {
      q: "What was the dominant school of psychology before the Cognitive Revolution?",
      options: ["Psychoanalysis", "Behaviorism", "Humanism", "Structuralism"],
      correct: 1
    },
    {
      q: "Which invention provided a new metaphor for the mind?",
      options: ["The Steam Engine", "The Telephone", "The Digital Computer", "The Printing Press"],
      correct: 2
    },
    {
      q: "The Cognitive Revolution reintroduced the study of:",
      options: ["Observable behavior only", "Biological reflexes", "Internal mental states", "Social conditioning"],
      correct: 2
    }
  ]
};

const ReadingSpeedTest: React.FC = () => {
  const [phase, setPhase] = useState<'intro' | 'reading' | 'quiz' | 'result'>('intro');
  const [startTime, setStartTime] = useState(0);
  const [duration, setDuration] = useState(0); // seconds
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [wpm, setWpm] = useState(0);

  const handleStart = () => {
    setPhase('reading');
    setStartTime(Date.now());
  };

  const handleFinishReading = () => {
    const timeInSeconds = (Date.now() - startTime) / 1000;
    setDuration(timeInSeconds);
    setPhase('quiz');
  };

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...quizAnswers, optionIndex];
    setQuizAnswers(newAnswers);
    
    if (newAnswers.length === TEXT_SOURCE.questions.length) {
      calculateResult(duration, newAnswers);
    }
  };

  const calculateResult = (finalDuration: number, finalAnswers: number[]) => {
    // Calculate WPM
    // Standard formula: (Words / Seconds) * 60
    const rawWpm = Math.round((TEXT_SOURCE.wordCount / finalDuration) * 60);
    
    // Calculate Accuracy
    let correctCount = 0;
    finalAnswers.forEach((ans, idx) => {
       if (ans === TEXT_SOURCE.questions[idx].correct) correctCount++;
    });
    const accuracy = correctCount / TEXT_SOURCE.questions.length;

    // Adjusted WPM (Penalize for skimming/low comprehension)
    const finalWpm = Math.round(rawWpm * accuracy);
    
    setWpm(finalWpm);
    setPhase('result');
    
    // Save normalized score (Average reading speed is ~230 WPM. 500 WPM = 100 score)
    const score = Math.min(100, Math.round((finalWpm / 500) * 100));
    saveStat('reading-speed', score);
  };

  return (
    <div className="max-w-2xl mx-auto select-none">
      {phase === 'intro' && (
        <div className="text-center py-12 animate-in fade-in">
          <BookOpen size={64} className="mx-auto text-zinc-600 mb-6" />
          <h2 className="text-3xl font-bold text-white mb-2">Reading Speed Test</h2>
          <p className="text-zinc-400 mb-8 max-w-md mx-auto">
            Measure your Words Per Minute (WPM) and reading comprehension. 
            Read the passage at your normal pace, then answer 3 questions to verify understanding.
          </p>
          <button onClick={handleStart} className="btn-primary">Start Reading</button>
        </div>
      )}

      {phase === 'reading' && (
        <div className="animate-in fade-in">
           <div className="mb-6 flex justify-between items-center text-xs text-zinc-500 font-mono border-b border-zinc-800 pb-2">
              <span>TOPIC: {TEXT_SOURCE.title}</span>
              <span className="flex items-center gap-2"><Timer size={12} className="text-primary-500 animate-pulse"/> TIMING ACTIVE</span>
           </div>
           <div className="prose prose-invert prose-lg max-w-none mb-8 leading-relaxed font-serif text-zinc-300">
              {TEXT_SOURCE.content.split('\n\n').map((para, i) => (
                 <p key={i} className="mb-4">{para}</p>
              ))}
           </div>
           <button onClick={handleFinishReading} className="btn-primary w-full">I Have Finished Reading</button>
        </div>
      )}

      {phase === 'quiz' && (
        <div className="animate-in slide-in-from-right">
           <div className="mb-8">
              <h3 className="text-xl font-bold text-white mb-2">Comprehension Check</h3>
              <p className="text-zinc-500 text-sm">Question {quizAnswers.length + 1} of {TEXT_SOURCE.questions.length}</p>
           </div>
           
           <div className="bg-zinc-900/50 p-6 border border-zinc-800 rounded-lg mb-6">
              <p className="text-lg text-white mb-6 font-medium">{TEXT_SOURCE.questions[quizAnswers.length].q}</p>
              <div className="space-y-3">
                 {TEXT_SOURCE.questions[quizAnswers.length].options.map((opt, idx) => (
                    <button 
                       key={idx}
                       onClick={() => handleAnswer(idx)}
                       className="w-full text-left p-4 bg-black border border-zinc-800 hover:border-primary-500/50 hover:bg-zinc-800 transition-all rounded"
                    >
                       {opt}
                    </button>
                 ))}
              </div>
           </div>
        </div>
      )}

      {phase === 'result' && (
         <div className="text-center py-12 animate-in zoom-in">
            <FileText size={64} className="mx-auto text-primary-500 mb-6" />
            <h2 className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-2">Reading Analysis</h2>
            <div className="text-6xl font-bold text-white mb-2">{wpm} <span className="text-2xl text-zinc-600">WPM</span></div>
            
            <div className="mt-8 grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8">
               <div className="bg-zinc-900 border border-zinc-800 p-4 rounded">
                  <div className="text-xs text-zinc-500 uppercase">Raw Time</div>
                  <div className="text-xl text-white font-mono">{duration.toFixed(1)}s</div>
               </div>
               <div className="bg-zinc-900 border border-zinc-800 p-4 rounded">
                  <div className="text-xs text-zinc-500 uppercase">Comprehension</div>
                  <div className={`text-xl font-mono ${quizAnswers.filter((a,i) => a === TEXT_SOURCE.questions[i].correct).length === 3 ? 'text-emerald-500' : 'text-yellow-500'}`}>
                     {quizAnswers.filter((a,i) => a === TEXT_SOURCE.questions[i].correct).length}/{TEXT_SOURCE.questions.length}
                  </div>
               </div>
            </div>

            <p className="text-sm text-zinc-400 mb-8 max-w-md mx-auto">
               {wpm > 400 ? "You are a speed reader. You process text significantly faster than average." : 
                wpm > 250 ? "Above average reading speed." : 
                "Average reading speed. Focus on reducing sub-vocalization to improve."}
            </p>
            
            <button onClick={() => { setPhase('intro'); setQuizAnswers([]); }} className="btn-secondary">Retake Test</button>
         </div>
      )}
    </div>
  );
};

export default ReadingSpeedTest;