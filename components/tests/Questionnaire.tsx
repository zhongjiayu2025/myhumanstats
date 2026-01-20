import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { saveStat } from '../../lib/core';

interface Question {
  id: number;
  text: string;
  options: { label: string; value: number }[];
}

interface QuestionnaireProps {
  testId: string;
  questions: Question[];
  title: string;
  resultTitle: (score: number) => string;
  resultDescription: (score: number) => string;
  maxScorePerQuestion?: number;
}

const Questionnaire: React.FC<QuestionnaireProps> = ({ 
  testId, 
  questions, 
  resultTitle, 
  resultDescription,
  maxScorePerQuestion = 5
}) => {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);

  const handleOptionSelect = (value: number) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);

    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
    } else {
      finishTest(newAnswers);
    }
  };

  const finishTest = (finalAnswers: number[]) => {
    const total = finalAnswers.reduce((a, b) => a + b, 0);
    const maxPossible = questions.length * maxScorePerQuestion;
    const normalizedScore = Math.round((total / maxPossible) * 100);
    
    setScore(normalizedScore);
    setFinished(true);
    saveStat(testId, normalizedScore);
  };

  if (finished) {
    return (
      <div className="max-w-2xl mx-auto text-center animate-in fade-in zoom-in duration-500">
        <div className="tech-border bg-black p-10 clip-corner-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-primary-500/5 bg-grid"></div>
          
          <h2 className="text-xl text-zinc-400 font-mono uppercase tracking-widest mb-4">Assessment Complete</h2>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 text-glow">{resultTitle(score)}</h1>
          
          <div className="h-px w-24 bg-primary-500 mx-auto mb-6"></div>
          
          <p className="text-zinc-300 leading-relaxed mb-8 max-w-lg mx-auto">
            {resultDescription(score)}
          </p>

          <div className="inline-block border border-zinc-800 bg-zinc-900/50 px-6 py-2 rounded-full">
             <span className="text-xs text-zinc-500 font-mono">INDEX_SCORE: <span className="text-white">{score}/100</span></span>
          </div>
          
          <button 
            onClick={() => { setFinished(false); setCurrentQIndex(0); setAnswers([]); }}
            className="block w-full mt-12 text-xs text-zinc-600 hover:text-primary-400 font-mono uppercase tracking-widest transition-colors"
          >
            Re-Initialize Protocol
          </button>
        </div>
      </div>
    );
  }

  const question = questions[currentQIndex];
  const progress = ((currentQIndex) / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8 relative">
        <div className="flex justify-between text-[10px] text-zinc-500 font-mono mb-2 uppercase">
           <span>Progress</span>
           <span>Q.{currentQIndex + 1} / {questions.length}</span>
        </div>
        <div className="h-1 bg-zinc-900 w-full">
           <div className="h-full bg-primary-500 transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="tech-border bg-surface p-8 md:p-12 clip-corner-lg min-h-[400px] flex flex-col justify-center relative">
        {/* Decor */}
        <div className="absolute top-0 right-0 p-4 opacity-20 text-zinc-600">
           <span className="font-mono text-6xl font-bold opacity-20">0{currentQIndex + 1}</span>
        </div>

        <h3 className="text-2xl md:text-3xl font-medium text-white mb-12 leading-tight">
          {question.text}
        </h3>

        <div className="space-y-3">
          {question.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleOptionSelect(opt.value)}
              className="w-full text-left group relative p-4 border border-zinc-800 hover:border-primary-500/50 hover:bg-zinc-900 transition-all duration-200 clip-corner-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 group-hover:text-white transition-colors">{opt.label}</span>
                <ChevronRight size={16} className="text-zinc-700 group-hover:text-primary-500 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;