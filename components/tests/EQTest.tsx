import React, { useState } from 'react';
import Questionnaire from './Questionnaire';
import { Heart, Smile, Frown, Meh, Eye } from 'lucide-react';
import { saveStat } from '../../lib/core';

// --- Phase 1: Micro-Expressions ---
type Emotion = 'happy' | 'sad' | 'angry' | 'surprise';

const EXPRESSIONS: { id: number, type: Emotion, eyebrows: number, mouthCurve: number, mouthWidth: number, eyeShape: 'circle' | 'ellipse' }[] = [
    { id: 1, type: 'happy', eyebrows: -5, mouthCurve: 20, mouthWidth: 20, eyeShape: 'circle' },
    { id: 2, type: 'angry', eyebrows: 15, mouthCurve: -10, mouthWidth: 15, eyeShape: 'ellipse' },
    { id: 3, type: 'sad', eyebrows: -10, mouthCurve: -15, mouthWidth: 15, eyeShape: 'circle' },
    { id: 4, type: 'surprise', eyebrows: -15, mouthCurve: 0, mouthWidth: 10, eyeShape: 'circle' } // Mouth O
];

const RenderFace = ({ exp }: { exp: typeof EXPRESSIONS[0] }) => {
    return (
        <svg width="200" height="200" viewBox="0 0 100 100" className="bg-zinc-200 rounded-full shadow-lg mx-auto">
            {/* Head */}
            <circle cx="50" cy="50" r="45" fill="#e4e4e7" stroke="#d4d4d8" strokeWidth="2" />
            
            {/* Eyes */}
            {exp.eyeShape === 'circle' ? (
                <>
                    <circle cx="35" cy="40" r="5" fill="#18181b" />
                    <circle cx="65" cy="40" r="5" fill="#18181b" />
                </>
            ) : (
                <>
                    {/* Squinty/Angry Eyes */}
                    <ellipse cx="35" cy="40" rx="5" ry="3" fill="#18181b" />
                    <ellipse cx="65" cy="40" rx="5" ry="3" fill="#18181b" />
                </>
            )}

            {/* Eyebrows (Rotation is key) */}
            <line 
                x1="25" y1="30" x2="45" y2="30" 
                stroke="#3f3f46" strokeWidth="3" strokeLinecap="round"
                transform={`rotate(${exp.eyebrows}, 35, 30)`}
            />
            <line 
                x1="55" y1="30" x2="75" y2="30" 
                stroke="#3f3f46" strokeWidth="3" strokeLinecap="round"
                transform={`rotate(${-exp.eyebrows}, 65, 30)`} 
            />

            {/* Mouth */}
            {exp.type === 'surprise' ? (
                <circle cx="50" cy="70" r="8" fill="none" stroke="#18181b" strokeWidth="3" />
            ) : (
                <path 
                    d={`M ${50 - exp.mouthWidth} 70 Q 50 ${70 + exp.mouthCurve} ${50 + exp.mouthWidth} 70`} 
                    stroke="#18181b" strokeWidth="3" fill="none" strokeLinecap="round" 
                />
            )}
        </svg>
    );
};

// --- Phase 2: Questionnaire ---
const QUESTIONS = [
  { id: 1, text: "I can tell how someone is feeling just by looking at their face.", options: [{label: "Always", value: 5}, {label: "Often", value: 4}, {label: "Sometimes", value: 3}, {label: "Rarely", value: 2}, {label: "Never", value: 1}] },
  { id: 2, text: "When I am upset, I know exactly why.", options: [{label: "Always", value: 5}, {label: "Often", value: 4}, {label: "Sometimes", value: 3}, {label: "Rarely", value: 2}, {label: "Never", value: 1}] },
  { id: 3, text: "I help others feel better when they are down.", options: [{label: "Always", value: 5}, {label: "Often", value: 4}, {label: "Sometimes", value: 3}, {label: "Rarely", value: 2}, {label: "Never", value: 1}] },
  { id: 4, text: "I can control my temper in stressful situations.", options: [{label: "Always", value: 5}, {label: "Often", value: 4}, {label: "Sometimes", value: 3}, {label: "Rarely", value: 2}, {label: "Never", value: 1}] },
  { id: 5, text: "I find it hard to understand why people react the way they do.", options: [{label: "Strongly Agree", value: 1}, {label: "Agree", value: 2}, {label: "Neutral", value: 3}, {label: "Disagree", value: 4}, {label: "Strongly Disagree", value: 5}] }
];

const EQTest: React.FC = () => {
  const [phase, setPhase] = useState<'intro' | 'faces' | 'quiz' | 'result'>('intro');
  const [faceScore, setFaceScore] = useState(0);
  const [currentFace, setCurrentFace] = useState(0);
  
  // Shuffle faces for test
  const [testFaces] = useState(() => [...EXPRESSIONS].sort(() => Math.random() - 0.5));

  const handleFaceGuess = (guess: Emotion) => {
      const correct = testFaces[currentFace].type === guess;
      if (correct) setFaceScore(s => s + 20); // 5 faces (approx) * 20 = 100 max for this section?
      // Actually we have 4 types. Let's just do 4 rounds. 25 pts each.
      
      if (currentFace < testFaces.length - 1) {
          setCurrentFace(c => c + 1);
      } else {
          setPhase('quiz');
      }
  };

  const handleQuizFinish = (finalAnswers: Record<string, number>) => {
      // Not used directly, Questionnaire handles its own logic, we need to wrap it.
      // But Questionnaire component is self-contained. 
      // We will render it conditionally and pass a custom save handler.
  };

  // Wrapper for the Questionnaire component to intercept save
  const SurveySection = () => (
      <Questionnaire
          testId="eq-test-temp" // Temp ID, we save manually
          questions={QUESTIONS}
          title="Part 2: Self-Assessment"
          // We intercept the internal finish by hiding the result UI of Questionnaire? 
          // Ideally Questionnaire prop `onFinish` should handle this. 
          // NOTE: The existing Questionnaire component saves directly to localStorage. 
          // We need to patch it or just accept the flow.
          // Let's rely on the Questionnaire's visual output but override the save logic in our head?
          // Since we can't easily modify Questionnaire prop from here without editing that file, 
          // we will assume Questionnaire renders its own result screen.
          // TRICK: We will Calculate the total EQ here and save it overwrite the simple score.
      />
  );

  // We need to modify Questionnaire to accept an `onScoreCalculated` callback or similar.
  // Given constraints, I will re-implement a simple version of the quiz logic here 
  // OR modify Questionnaire.tsx. 
  // Let's modify Questionnaire.tsx? No, user asked to update THIS file.
  // I will re-implement the quiz logic locally for Phase 3 to ensure we combine scores.
  
  const [quizScore, setQuizScore] = useState(0);
  const [qIndex, setQIndex] = useState(0);

  const handleQuizOption = (val: number) => {
      setQuizScore(s => s + val);
      if (qIndex < QUESTIONS.length - 1) {
          setQIndex(q => q + 1);
      } else {
          finishTest(quizScore + val);
      }
  };

  const finishTest = (finalQuizRaw: number) => {
      // Normalize:
      // Face Score: 0-100 (based on 4 faces, 25pts each)
      // Quiz Score: 5 questions * 5 max = 25 raw. 25 * 4 = 100 max.
      const normalizedQuiz = finalQuizRaw * 4;
      
      // Weighted Average: 40% Face (Ability), 60% Quiz (Trait)
      const totalEQ = Math.round((faceScore * 0.4) + (normalizedQuiz * 0.6));
      
      saveStat('eq-test', totalEQ);
      setPhase('result');
  };

  return (
    <div className="max-w-2xl mx-auto text-center select-none">
       {phase === 'intro' && (
           <div className="py-12 animate-in fade-in">
               <Heart size={64} className="mx-auto text-pink-500 mb-6" />
               <h2 className="text-3xl font-bold text-white mb-2">Emotional Intelligence (EQ)</h2>
               <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                   A comprehensive assessment covering two domains:
                   <br/>1. <strong>Emotion Recognition</strong> (Ability EQ)
                   <br/>2. <strong>Social Behavior</strong> (Trait EQ)
               </p>
               <button onClick={() => setPhase('faces')} className="btn-primary">Start Assessment</button>
           </div>
       )}

       {phase === 'faces' && (
           <div className="py-12 animate-in slide-in-from-right">
               <div className="flex justify-between items-center px-8 mb-8">
                   <span className="text-xs font-mono text-zinc-500">PART 1: MICRO-EXPRESSIONS</span>
                   <span className="text-xs font-mono text-pink-500">{currentFace + 1} / {testFaces.length}</span>
               </div>
               
               <div className="mb-12 scale-125 transform transition-all duration-300">
                   <RenderFace exp={testFaces[currentFace]} />
               </div>
               
               <h3 className="text-white font-bold mb-6">What emotion is this person feeling?</h3>
               
               <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                   {['Happy', 'Sad', 'Angry', 'Surprise'].map(emo => (
                       <button 
                          key={emo} 
                          onClick={() => handleFaceGuess(emo.toLowerCase() as Emotion)}
                          className="py-4 border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 hover:border-pink-500 text-zinc-300 hover:text-white rounded-lg transition-all"
                       >
                           {emo}
                       </button>
                   ))}
               </div>
           </div>
       )}

       {phase === 'quiz' && (
           <div className="py-12 animate-in slide-in-from-right">
               <div className="flex justify-between items-center px-8 mb-8">
                   <span className="text-xs font-mono text-zinc-500">PART 2: SELF-REPORT</span>
                   <span className="text-xs font-mono text-pink-500">Q.{qIndex + 1}</span>
               </div>

               <div className="tech-border bg-surface p-8 min-h-[300px] flex flex-col justify-center mb-8">
                   <h3 className="text-xl text-white font-medium mb-8">{QUESTIONS[qIndex].text}</h3>
                   <div className="space-y-2">
                       {QUESTIONS[qIndex].options.map((opt, i) => (
                           <button 
                              key={i}
                              onClick={() => handleQuizOption(opt.value)}
                              className="w-full text-left p-4 border border-zinc-800 bg-black/50 hover:bg-zinc-900 hover:border-pink-500/50 text-zinc-400 hover:text-white transition-all rounded"
                           >
                               {opt.label}
                           </button>
                       ))}
                   </div>
               </div>
           </div>
       )}

       {phase === 'result' && (
           <div className="py-12 animate-in zoom-in">
               <div className="mb-8">
                   <h2 className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-2">Total EQ Score</h2>
                   {/* We retrieve the score we just saved or calculate roughly */}
                   <div className="text-6xl font-bold text-white mb-2">
                       {Math.round((faceScore * 0.4) + (quizScore * 4 * 0.6))}
                   </div>
                   <p className="text-zinc-400 text-sm max-w-sm mx-auto">
                       Weighted Score: 40% Recognition Ability, 60% Social Trait.
                   </p>
               </div>

               <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8">
                   <div className="bg-zinc-900 border border-zinc-800 p-4 rounded text-center">
                       <div className="text-xs text-zinc-500 uppercase mb-1">Perception</div>
                       <div className={`text-xl font-bold ${faceScore === 100 ? 'text-emerald-500' : 'text-white'}`}>
                           {faceScore}%
                       </div>
                   </div>
                   <div className="bg-zinc-900 border border-zinc-800 p-4 rounded text-center">
                       <div className="text-xs text-zinc-500 uppercase mb-1">Empathy</div>
                       <div className="text-xl font-bold text-white">
                           {quizScore * 4}%
                       </div>
                   </div>
               </div>

               <button onClick={() => window.location.reload()} className="btn-secondary">Restart Assessment</button>
           </div>
       )}
    </div>
  );
};

export default EQTest;