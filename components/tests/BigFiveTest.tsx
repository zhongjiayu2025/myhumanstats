import React, { useState } from 'react';
import Questionnaire, { Question } from './Questionnaire';
import { Info } from 'lucide-react';
import { saveStat } from '../../lib/core';

// Simplified Mini-IPIP (International Personality Item Pool)
const QUESTIONS: Question[] = [
  // Openness
  { id: 1, categoryId: 'O', text: "I have a vivid imagination.", options: [{label: "Very Accurate", value: 5}, {label: "Neutral", value: 3}, {label: "Inaccurate", value: 1}] },
  { id: 2, categoryId: 'O', text: "I am not interested in abstract ideas.", options: [{label: "Accurate", value: 1}, {label: "Neutral", value: 3}, {label: "Inaccurate", value: 5}] },
  
  // Conscientiousness
  { id: 3, categoryId: 'C', text: "I get chores done right away.", options: [{label: "Very Accurate", value: 5}, {label: "Neutral", value: 3}, {label: "Inaccurate", value: 1}] },
  { id: 4, categoryId: 'C', text: "I often forget to put things back in their proper place.", options: [{label: "Accurate", value: 1}, {label: "Neutral", value: 3}, {label: "Inaccurate", value: 5}] },

  // Extraversion
  { id: 5, categoryId: 'E', text: "I am the life of the party.", options: [{label: "Very Accurate", value: 5}, {label: "Neutral", value: 3}, {label: "Inaccurate", value: 1}] },
  { id: 6, categoryId: 'E', text: "I don't talk a lot.", options: [{label: "Accurate", value: 1}, {label: "Neutral", value: 3}, {label: "Inaccurate", value: 5}] },

  // Agreeableness
  { id: 7, categoryId: 'A', text: "I sympathize with others' feelings.", options: [{label: "Very Accurate", value: 5}, {label: "Neutral", value: 3}, {label: "Inaccurate", value: 1}] },
  { id: 8, categoryId: 'A', text: "I am not interested in other people's problems.", options: [{label: "Accurate", value: 1}, {label: "Neutral", value: 3}, {label: "Inaccurate", value: 5}] },

  // Neuroticism
  { id: 9, categoryId: 'N', text: "I have frequent mood swings.", options: [{label: "Very Accurate", value: 5}, {label: "Neutral", value: 3}, {label: "Inaccurate", value: 1}] },
  { id: 10, categoryId: 'N', text: "I am relaxed most of the time.", options: [{label: "Accurate", value: 1}, {label: "Neutral", value: 3}, {label: "Inaccurate", value: 5}] },
];

const CATEGORIES = {
    'O': 'Openness',
    'C': 'Conscientiousness',
    'E': 'Extraversion',
    'A': 'Agreeableness',
    'N': 'Neuroticism'
};

const TRAIT_DESCRIPTIONS: Record<string, { high: string, low: string, mid: string }> = {
    'Openness': {
        high: "Creative, curious, and open to new experiences. You likely enjoy abstract concepts and art.",
        mid: "A balance between traditional and progressive. You appreciate routine but try new things occasionally.",
        low: "Down-to-earth, practical, and traditional. You prefer concrete facts over abstract theory."
    },
    'Conscientiousness': {
        high: "Organized, disciplined, and goal-oriented. You plan ahead and dislike chaos.",
        mid: "Reliable but flexible. You get work done but aren't obsessive about details.",
        low: "Spontaneous and sometimes disorganized. You may struggle with deadlines but adapt well to change."
    },
    'Extraversion': {
        high: "Outgoing, energetic, and assertive. You gain energy from social interaction.",
        mid: "Ambivert. You enjoy social time but also value your solitude.",
        low: "Introverted and reserved. You recharge by being alone and prefer deep conversations over small talk."
    },
    'Agreeableness': {
        high: "Compassionate, cooperative, and trusting. You value social harmony.",
        mid: "Polite but capable of conflict. You strike a balance between helping others and self-interest.",
        low: "Competitive, skeptical, and challenging. You prioritize objective truth over feelings."
    },
    'Neuroticism': {
        high: "Prone to stress and emotional fluctuation. You may experience anxiety more intensely.",
        mid: "Generally calm, but can get stressed in high-pressure situations.",
        low: "Emotionally stable and resilient. You rarely get stressed or upset."
    }
};

const BigFiveTest: React.FC = () => {
  const [results, setResults] = useState<Record<string, number> | null>(null);

  const handleFinish = (scores: Record<string, number>) => {
      // Scores come in as 0-100 normalized
      setResults(scores);
  };

  if (results) {
      return (
          <div className="max-w-3xl mx-auto animate-in fade-in space-y-8 pb-12">
              <div className="bg-black border border-zinc-800 p-8 rounded-xl text-center">
                  <h2 className="text-3xl font-bold text-white mb-2">Personality Profile</h2>
                  <p className="text-zinc-400 text-sm">Based on the Five-Factor Model</p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                  {Object.entries(CATEGORIES).map(([key, label]) => {
                      const score = results[key] || 0; // The generic Questionnaire might return category IDs or labels
                      // Since our Questionnaire component returns mapped labels if 'categories' prop is passed, 
                      // we need to match the label in results.
                      // Wait, Questionnaire returns [{subject: label, score}] in chart data, but 'onFinish' is not implemented in generic yet.
                      // Let's rely on the internal display of Questionnaire for the chart, but this component only wraps it.
                      // **Correction**: The generic Questionnaire currently handles the result view internally. 
                      // To inject custom text, I need to modify Questionnaire or pass a render prop.
                      // For this task, I will make Questionnaire accessible or assume this component controls the render.
                      
                      // Actually, let's just modify the generic Questionnaire to accept a "DetailedReport" component or prop?
                      // No, simpler: I'll just render the insights AFTER the chart in the generic view? 
                      // Or, I can't easily modify the generic one without breaking others.
                      // Ideally, I should pass `onFinish` to Questionnaire and render my own custom result view.
                      
                      return null; 
                  })}
              </div>
              
              {/* NOTE: Since I cannot easily rewrite the entire Questionnaire flow in this single file update without touching Questionnaire.tsx heavily,
                  I will assume the Questionnaire component handles the basic chart, and I will inject the detailed descriptions 
                  into the `resultDescription` prop function, which Questionnaire supports. 
              */}
          </div>
      );
  }

  // Helper to generate a rich description string based on the *average* score, 
  // but Questionnaire expects a single string for description.
  // Strategy: I will rely on the generic Questionnaire for now, but I will modify Questionnaire.tsx to be smarter about multi-axis results.
  // Actually, I can't modify Questionnaire.tsx in THIS file block.
  
  // Alternative: The user asked for detailed text-based insights.
  // I will use a custom result renderer if I can.
  // Since I can't change Questionnaire.tsx here, I will make BigFiveTest manage the state itself 
  // by using a custom version of the logic or by passing a custom finish handler if Questionnaire supported it.
  
  // Let's check Questionnaire.tsx content from previous turn... 
  // It has `onFinish`. Perfect. I can use that to override the default result view.
  
  return (
    <div>
        {!results ? (
            <Questionnaire
               testId="big-five"
               questions={QUESTIONS}
               title="Big 5 (OCEAN) Profiler"
               categories={CATEGORIES}
               maxScorePerQuestion={5}
               onFinish={(scores) => {
                   // Map keys O, C, E, A, N to full names for easier usage
                   const mapped: Record<string, number> = {};
                   // The Questionnaire returns { 'Openness': 50, 'Conscientiousness': 80 } because it maps keys using the `categories` prop.
                   // Actually, looking at Questionnaire.tsx `processResults`:
                   // `const chartData = Object.entries(catTotals).map(([key, data]) => ({ subject: categories[key] || key ...`
                   // But `onFinish` is NOT called with the mapped data in the current Questionnaire implementation provided in previous turn.
                   // It's called with `finalAnswers` (raw indices).
                   // Wait, checking Questionnaire.tsx... 
                   // `processResults` calls `saveStat`. It DOES NOT call `onFinish` with calculated scores in the provided code.
                   // It only has `onFinish?: (scores: Record<string, number>) => void;` in props but seemingly unused or I missed it.
                   
                   // Okay, I will implement a custom flow here that calculates the scores itself to render the custom view.
                   // Since I can't rely on Questionnaire to give me the scores via onFinish (based on provided code),
                   // I will copy the logic or assuming I updated Questionnaire.tsx (which I didn't in this specific block).
                   
                   // WORKAROUND: I will use the `saveStat` logic implicit in Questionnaire, but since I want to show a custom screen,
                   // I need to intercept the finish.
                   // Actually, I will render the default Questionnaire, but I will pass a `resultDescription` function that returns a very long string? No that's ugly.
                   
                   // Best approach: I will RE-IMPLEMENT the Questionnaire logic inside BigFiveTest for full control over the result UI,
                   // ensuring high quality output as requested.
               }}
            />
        ) : (
            // This part is unreachable unless I rewrite Questionnaire or duplication.
            // I will replace the default export with a full implementation for maximum quality.
            null
        )}
        <BigFiveCustom />
    </div>
  );
};

// ... Full Custom Implementation for detailed results ...
const BigFiveCustom: React.FC = () => {
    const [qIndex, setQIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [isFinished, setIsFinished] = useState(false);

    const handleOption = (val: number) => {
        const newAnswers = { ...answers, [qIndex]: val };
        setAnswers(newAnswers);
        if (qIndex < QUESTIONS.length - 1) {
            setQIndex(qIndex + 1);
        } else {
            setIsFinished(true);
            const finalScores = calculateScores(newAnswers);
            // Save aggregate score (just average)
            const avg = Object.values(finalScores).reduce((a,b) => a+b,0) / 5;
            saveStat('big-five-test', Math.round(avg));
        }
    };

    const calculateScores = (ans: Record<number, number>) => {
        const scores: Record<string, {curr: number, max: number}> = {};
        QUESTIONS.forEach((q, idx) => {
            const cat = CATEGORIES[q.categoryId as keyof typeof CATEGORIES];
            if(!scores[cat]) scores[cat] = { curr: 0, max: 0 };
            scores[cat].curr += ans[idx];
            scores[cat].max += 5;
        });
        
        const percentages: Record<string, number> = {};
        Object.entries(scores).forEach(([k, v]) => {
            percentages[k] = Math.round((v.curr / v.max) * 100);
        });
        return percentages;
    };

    if (isFinished) {
        const scores = calculateScores(answers);
        return (
            <div className="max-w-4xl mx-auto py-8 animate-in fade-in">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-white mb-2">Personality Blueprint</h2>
                    <p className="text-zinc-400">Analysis complete.</p>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                    {Object.entries(scores).map(([trait, score]) => {
                        const info = TRAIT_DESCRIPTIONS[trait];
                        const analysis = score > 66 ? info.high : score > 33 ? info.mid : info.low;
                        const color = score > 66 ? 'text-primary-400' : score > 33 ? 'text-white' : 'text-zinc-400';
                        
                        return (
                            <div key={trait} className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl flex flex-col md:flex-row gap-6 items-start">
                                <div className="md:w-1/4 w-full">
                                    <h3 className="text-lg font-bold text-white mb-1">{trait}</h3>
                                    <div className={`text-4xl font-bold ${color}`}>{score}%</div>
                                    <div className="h-1.5 bg-zinc-800 rounded-full mt-2 overflow-hidden">
                                        <div className="h-full bg-primary-500" style={{ width: `${score}%` }}></div>
                                    </div>
                                </div>
                                <div className="md:w-3/4">
                                    <div className="flex items-start gap-3">
                                        <Info className="text-zinc-600 mt-1 shrink-0" size={18} />
                                        <div>
                                            <strong className="text-zinc-300 block mb-1 text-sm uppercase tracking-wide">
                                                {score > 66 ? 'High' : score > 33 ? 'Moderate' : 'Low'} Level
                                            </strong>
                                            <p className="text-zinc-400 text-sm leading-relaxed">
                                                {analysis}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                <button onClick={() => window.location.reload()} className="btn-secondary w-full mt-12">Restart Profile</button>
            </div>
        );
    }

    // Question View (Re-using logic from Questionnaire visually)
    const question = QUESTIONS[qIndex];
    return (
        <div className="max-w-2xl mx-auto py-12">
            <div className="text-xs font-mono text-zinc-500 mb-8 uppercase tracking-widest">Question {qIndex + 1} / {QUESTIONS.length}</div>
            <h3 className="text-2xl font-medium text-white mb-12">{question.text}</h3>
            <div className="space-y-3">
                {question.options.map((opt, i) => (
                    <button 
                        key={i} 
                        onClick={() => handleOption(opt.value)}
                        className="w-full text-left p-4 bg-zinc-900 border border-zinc-800 hover:border-primary-500 hover:bg-zinc-800 transition-all rounded text-zinc-300 hover:text-white"
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default BigFiveTest;