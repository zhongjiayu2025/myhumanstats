
import React, { useState } from 'react';
import { Info, RotateCcw, User, Share2 } from 'lucide-react';
import { saveStat } from '../../lib/core';
import { Question } from './Questionnaire';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

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
        high: "Visionary & Creative",
        mid: "Balanced",
        low: "Pragmatic & Traditional"
    },
    'Conscientiousness': {
        high: "Disciplined & Organized",
        mid: "Reliable",
        low: "Spontaneous & Flexible"
    },
    'Extraversion': {
        high: "Social & Energetic",
        mid: "Ambivert",
        low: "Reserved & Reflective"
    },
    'Agreeableness': {
        high: "Compassionate & Cooperative",
        mid: "Friendly",
        low: "Analytical & Skeptical"
    },
    'Neuroticism': {
        high: "Sensitive & Reactive",
        mid: "Responsive",
        low: "Resilient & Calm"
    }
};

const BigFiveTest: React.FC = () => {
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

    const getArchetype = (scores: Record<string, number>) => {
        // Simple logic: Find top 2 traits
        const sorted = Object.entries(scores).sort((a,b) => b[1] - a[1]);
        const top = sorted[0];
        const second = sorted[1];

        if (top[0] === 'Openness' && second[0] === 'Conscientiousness') return "The Architect";
        if (top[0] === 'Conscientiousness' && second[0] === 'Openness') return "The Strategist";
        
        if (top[0] === 'Extraversion' && second[0] === 'Agreeableness') return "The Diplomat";
        if (top[0] === 'Agreeableness' && second[0] === 'Extraversion') return "The Caregiver";
        
        if (top[0] === 'Neuroticism') return "The Sentinel"; 
        
        if (top[0] === 'Conscientiousness' && second[0] === 'Extraversion') return "The Executive";
        if (top[0] === 'Openness' && second[0] === 'Agreeableness') return "The Idealist";
        
        return "The Balancer";
    };

    if (isFinished) {
        const scores = calculateScores(answers);
        const archetype = getArchetype(scores);
        
        const radarData = Object.entries(scores).map(([k, v]) => ({
            subject: k,
            A: v,
            fullMark: 100
        }));

        return (
            <div className="max-w-4xl mx-auto py-8 animate-in fade-in">
                {/* Archetype Card */}
                <div className="bg-black border border-zinc-800 rounded-2xl p-8 mb-8 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-grid opacity-20"></div>
                    <div className="relative z-10">
                        <div className="w-20 h-20 bg-zinc-900 border border-zinc-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <User size={32} className="text-primary-500"/>
                        </div>
                        <h2 className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-2">Personality Archetype</h2>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-glow">{archetype}</h1>
                        <p className="text-zinc-400 max-w-lg mx-auto text-sm">
                            Your distinct combination of {radarData[0].subject} and {radarData[1].subject} creates a unique behavioral fingerprint.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Radar Chart */}
                    <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                <PolarGrid stroke="#333" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 10 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name="Personality" dataKey="A" stroke="#06b6d4" strokeWidth={2} fill="#06b6d4" fillOpacity={0.3} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Breakdown */}
                    <div className="space-y-4">
                        {Object.entries(scores).map(([trait, score]) => {
                            const info = TRAIT_DESCRIPTIONS[trait];
                            const desc = score > 66 ? info.high : score > 33 ? info.mid : info.low;
                            
                            return (
                                <div key={trait} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-lg">
                                    <div className="flex justify-between items-end mb-1">
                                        <h3 className="text-sm font-bold text-white">{trait}</h3>
                                        <span className="text-xs font-mono text-primary-400">{score}%</span>
                                    </div>
                                    <div className="w-full h-1 bg-zinc-800 rounded-full mb-2 overflow-hidden">
                                        <div className="h-full bg-primary-500" style={{ width: `${score}%` }}></div>
                                    </div>
                                    <p className="text-xs text-zinc-500">{desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
                
                <button onClick={() => window.location.reload()} className="btn-secondary w-full mt-12 flex items-center justify-center gap-2">
                    <RotateCcw size={16} /> Restart Profile
                </button>
            </div>
        );
    }

    // Question View
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
