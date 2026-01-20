import React, { useState, useEffect } from 'react';
import { ChevronRight, Keyboard, RefreshCcw } from 'lucide-react';
import { saveStat } from '../../lib/core';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export interface Question {
  id: number;
  text: string;
  options: { label: string; value: number }[];
  categoryId?: string; // Optional: For multi-axis tests (e.g. "Openness")
  reverse?: boolean; // If true, value is inverted
}

interface QuestionnaireProps {
  testId: string;
  questions: Question[];
  title: string;
  // Simple mode props
  resultTitle?: (score: number) => string;
  resultDescription?: (score: number) => string;
  // Multi-axis mode props
  categories?: Record<string, string>; // key -> Label (e.g. 'O' -> 'Openness')
  onFinish?: (scores: Record<string, number>) => void;
  maxScorePerQuestion?: number;
}

const Questionnaire: React.FC<QuestionnaireProps> = ({ 
  testId, 
  questions, 
  title,
  resultTitle, 
  resultDescription,
  categories,
  maxScorePerQuestion = 5
}) => {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  // Store raw answer values
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [finished, setFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [categoryScores, setCategoryScores] = useState<{subject: string, score: number, fullMark: number}[]>([]);

  const handleOptionSelect = (value: number) => {
    setAnswers(prev => ({ ...prev, [currentQIndex]: value }));

    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
    } else {
      processResults({ ...answers, [currentQIndex]: value });
    }
  };

  const processResults = (finalAnswers: Record<number, number>) => {
    // 1. Calculate Multi-Axis Scores if categories exist
    if (categories) {
        const catTotals: Record<string, {current: number, max: number}> = {};
        Object.keys(categories).forEach(k => catTotals[k] = { current: 0, max: 0 });

        questions.forEach((q, idx) => {
            const cat = q.categoryId || 'general';
            if (!catTotals[cat]) catTotals[cat] = { current: 0, max: 0 };
            
            const rawVal = finalAnswers[idx];
            // Handle max value normalization if needed, mostly assume generic 1-5 scale for now
            catTotals[cat].current += rawVal;
            catTotals[cat].max += maxScorePerQuestion;
        });

        const chartData = Object.entries(catTotals).map(([key, data]) => ({
            subject: categories[key] || key,
            score: Math.round((data.current / data.max) * 100),
            fullMark: 100
        }));
        
        setCategoryScores(chartData);
        // Save average as the main stat
        const avg = chartData.reduce((a, b) => a + b.score, 0) / chartData.length;
        setFinalScore(Math.round(avg));
        saveStat(testId, Math.round(avg));
    } 
    // 2. Calculate Simple Linear Score
    else {
        const total = Object.values(finalAnswers).reduce((a, b) => a + b, 0);
        const maxPossible = questions.length * maxScorePerQuestion;
        const normalized = Math.round((total / maxPossible) * 100);
        setFinalScore(normalized);
        saveStat(testId, normalized);
    }

    setFinished(true);
  };

  // Keyboard Support
  useEffect(() => {
      const handleKey = (e: KeyboardEvent) => {
          if (finished) return;
          const question = questions[currentQIndex];
          const num = parseInt(e.key);
          if (!isNaN(num) && num >= 1 && num <= question.options.length) {
              handleOptionSelect(question.options[num - 1].value);
          }
      };
      window.addEventListener('keydown', handleKey);
      return () => window.removeEventListener('keydown', handleKey);
  }, [currentQIndex, finished, questions]);

  const restart = () => {
      setFinished(false);
      setCurrentQIndex(0);
      setAnswers({});
      setCategoryScores([]);
  };

  // --- Result View ---
  if (finished) {
    return (
      <div className="max-w-3xl mx-auto animate-in fade-in zoom-in duration-500">
        <div className="tech-border bg-black p-8 md:p-12 clip-corner-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-primary-500/5 bg-grid pointer-events-none"></div>
          
          <div className="relative z-10 text-center">
              <h2 className="text-xl text-zinc-400 font-mono uppercase tracking-widest mb-6">Assessment Complete</h2>
              
              {categories ? (
                  // Multi-Axis Visualization
                  <div className="mb-12">
                      <div className="h-[300px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={categoryScores} layout="vertical" margin={{ left: 40, right: 40 }}>
                                  <XAxis type="number" domain={[0, 100]} hide />
                                  <YAxis dataKey="subject" type="category" width={100} stroke="#a1a1aa" fontSize={11} fontWeight={700} />
                                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a' }} />
                                  <Bar dataKey="score" fill="#06b6d4" radius={[0, 4, 4, 0]} barSize={20} animationDuration={1500} />
                              </BarChart>
                          </ResponsiveContainer>
                      </div>
                      <div className="mt-6 text-sm text-zinc-400 max-w-lg mx-auto">
                          Your personality profile indicates a dominance in <strong>{categoryScores.sort((a,b) => b.score - a.score)[0].subject}</strong>.
                      </div>
                  </div>
              ) : (
                  // Simple Linear Visualization
                  <div className="mb-12">
                      <div className="text-6xl font-bold text-white mb-4 text-glow">{finalScore}</div>
                      <h3 className="text-2xl font-bold text-primary-400 mb-6">{resultTitle ? resultTitle(finalScore) : 'Score'}</h3>
                      <p className="text-zinc-300 leading-relaxed max-w-lg mx-auto">
                          {resultDescription ? resultDescription(finalScore) : ''}
                      </p>
                  </div>
              )}

              <button 
                onClick={restart}
                className="btn-secondary flex items-center gap-2 mx-auto"
              >
                <RefreshCcw size={16} /> Re-Initialize Protocol
              </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Question View ---
  const question = questions[currentQIndex];
  const progress = ((currentQIndex) / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8 relative">
        <div className="flex justify-between text-[10px] text-zinc-500 font-mono mb-2 uppercase">
           <span>{title}</span>
           <span>Q.{currentQIndex + 1} / {questions.length}</span>
        </div>
        <div className="h-1 bg-zinc-900 w-full rounded-full overflow-hidden">
           <div className="h-full bg-primary-500 transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="tech-border bg-surface p-8 md:p-12 clip-corner-lg min-h-[400px] flex flex-col justify-center relative">
        <div className="absolute top-0 right-0 p-4 opacity-10 text-zinc-600">
           <span className="font-mono text-6xl font-bold">0{currentQIndex + 1}</span>
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
                <span className="text-zinc-400 group-hover:text-white transition-colors">
                    <span className="inline-block w-6 text-zinc-600 font-mono text-xs group-hover:text-primary-500">{idx + 1}.</span> 
                    {opt.label}
                </span>
                <ChevronRight size={16} className="text-zinc-700 group-hover:text-primary-500 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900/50 rounded-full text-[10px] text-zinc-600 font-mono">
                <Keyboard size={12} />
                <span>Use keys 1-{question.options.length}</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;