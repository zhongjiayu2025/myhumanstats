
import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Clock, Check, X } from 'lucide-react';
import { saveStat } from '../../lib/core';

// --- Phase 1: Micro-Expressions ---
type Emotion = 'happy' | 'sad' | 'angry' | 'surprise' | 'disgust' | 'fear';

const EXPRESSIONS: { id: number, type: Emotion, eyebrows: number, mouthCurve: number, mouthWidth: number, eyeShape: 'circle' | 'ellipse', eyeWidth: number }[] = [
    { id: 1, type: 'happy', eyebrows: -5, mouthCurve: 20, mouthWidth: 20, eyeShape: 'circle', eyeWidth: 5 },
    { id: 2, type: 'angry', eyebrows: 15, mouthCurve: -10, mouthWidth: 15, eyeShape: 'ellipse', eyeWidth: 5 },
    { id: 3, type: 'sad', eyebrows: -10, mouthCurve: -15, mouthWidth: 15, eyeShape: 'circle', eyeWidth: 5 },
    { id: 4, type: 'surprise', eyebrows: -15, mouthCurve: 0, mouthWidth: 10, eyeShape: 'circle', eyeWidth: 6 },
    { id: 5, type: 'fear', eyebrows: -10, mouthCurve: -5, mouthWidth: 20, eyeShape: 'circle', eyeWidth: 6 },
    { id: 6, type: 'disgust', eyebrows: 10, mouthCurve: -10, mouthWidth: 10, eyeShape: 'ellipse', eyeWidth: 3 }
];

const SCENARIOS = [
    {
        text: "Your colleague presents an idea that you know won't work. They are excited.",
        options: [
            { text: "Point out the flaws immediately to save time.", score: 0 },
            { text: "Validate their excitement first, then ask guiding questions about potential issues.", score: 2 },
            { text: "Say nothing and let them fail.", score: 0 }
        ]
    },
    {
        text: "A friend cancels plans last minute for the third time this month.",
        options: [
            { text: "Tell them it's fine, but secretly resent it.", score: 0 },
            { text: "Express your disappointment calmly and ask if everything is okay.", score: 2 },
            { text: "Stop inviting them to things.", score: 1 }
        ]
    }
];

const RenderFace = ({ exp }: { exp: typeof EXPRESSIONS[0] }) => {
    return (
        <svg width="200" height="200" viewBox="0 0 100 100" className="bg-zinc-200 rounded-full shadow-lg mx-auto">
            {/* Head */}
            <circle cx="50" cy="50" r="45" fill="#e4e4e7" stroke="#d4d4d8" strokeWidth="2" />
            
            {/* Eyes */}
            {exp.eyeShape === 'circle' ? (
                <>
                    <circle cx="35" cy="40" r={exp.eyeWidth} fill="#18181b" />
                    <circle cx="65" cy="40" r={exp.eyeWidth} fill="#18181b" />
                </>
            ) : (
                <>
                    <ellipse cx="35" cy="40" rx={exp.eyeWidth} ry="3" fill="#18181b" />
                    <ellipse cx="65" cy="40" rx={exp.eyeWidth} ry="3" fill="#18181b" />
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

const EQTest: React.FC = () => {
  const [phase, setPhase] = useState<'intro' | 'flash-prep' | 'flash-show' | 'flash-guess' | 'scenarios' | 'result'>('intro');
  const [faceScore, setFaceScore] = useState(0);
  const [scenarioScore, setScenarioScore] = useState(0);
  const [currentFaceIdx, setCurrentFaceIdx] = useState(0);
  const [currentScenarioIdx, setCurrentScenarioIdx] = useState(0);
  
  // Shuffle faces for test (Take 5 random)
  const [testFaces] = useState(() => [...EXPRESSIONS].sort(() => Math.random() - 0.5).slice(0, 5));

  // --- FLASH LOGIC ---
  const startFlashRound = () => {
      setPhase('flash-show');
      // Show for 200ms
      setTimeout(() => {
          setPhase('flash-guess');
      }, 200); 
  };

  const handleFaceGuess = (guess: Emotion) => {
      if (testFaces[currentFaceIdx].type === guess) {
          setFaceScore(s => s + 1);
      }
      
      if (currentFaceIdx < testFaces.length - 1) {
          setCurrentFaceIdx(c => c + 1);
          setPhase('flash-prep');
      } else {
          setPhase('scenarios');
      }
  };

  // --- SCENARIO LOGIC ---
  const handleScenarioChoice = (points: number) => {
      setScenarioScore(s => s + points);
      if (currentScenarioIdx < SCENARIOS.length - 1) {
          setCurrentScenarioIdx(c => c + 1);
      } else {
          finishTest(points); // Pass last points to trigger calc
      }
  };

  const finishTest = (lastPoints: number) => {
      // Calc:
      // Face: Max 5 points.
      // Scenarios: Max 4 points (2 scenarios * 2 pts).
      // Total Max = 9.
      const totalPoints = faceScore + scenarioScore + lastPoints;
      const normalized = Math.round((totalPoints / 9) * 100);
      
      saveStat('eq-test', normalized);
      setPhase('result');
  };

  return (
    <div className="max-w-2xl mx-auto text-center select-none">
       {phase === 'intro' && (
           <div className="py-12 animate-in fade-in">
               <Heart size={64} className="mx-auto text-pink-500 mb-6" />
               <h2 className="text-3xl font-bold text-white mb-2">Emotional Intelligence (EQ)</h2>
               <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                   <strong>Part 1: Micro-Expressions.</strong> Faces will flash for 200ms. Can you read the emotion?<br/>
                   <strong>Part 2: Social Dynamics.</strong> Choose the most emotionally intelligent response.
               </p>
               <button onClick={() => setPhase('flash-prep')} className="btn-primary">Start Assessment</button>
           </div>
       )}

       {phase === 'flash-prep' && (
           <div className="py-20 animate-in zoom-in">
               <h3 className="text-xl text-white font-bold mb-4">Face #{currentFaceIdx + 1}</h3>
               <p className="text-zinc-400 mb-8">Get ready. It will be fast.</p>
               <button onClick={startFlashRound} className="w-24 h-24 rounded-full bg-white text-black font-bold text-lg hover:scale-110 transition-transform shadow-[0_0_30px_white]">
                   READY
               </button>
           </div>
       )}

       {phase === 'flash-show' && (
           <div className="py-12">
               <div className="scale-125">
                   <RenderFace exp={testFaces[currentFaceIdx]} />
               </div>
           </div>
       )}

       {phase === 'flash-guess' && (
           <div className="py-12 animate-in fade-in duration-75">
               <h3 className="text-white font-bold mb-8">What did you see?</h3>
               <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                   {['Happy', 'Sad', 'Angry', 'Surprise', 'Fear', 'Disgust'].map(emo => (
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

       {phase === 'scenarios' && (
           <div className="py-12 animate-in slide-in-from-right">
               <div className="flex justify-between items-center px-8 mb-8">
                   <span className="text-xs font-mono text-zinc-500">PART 2: SOCIAL LAB</span>
                   <span className="text-xs font-mono text-pink-500">SCENARIO {currentScenarioIdx + 1}</span>
               </div>

               <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-xl mb-8 text-left">
                   <MessageCircle size={24} className="text-zinc-500 mb-4" />
                   <p className="text-lg text-white leading-relaxed">
                       {SCENARIOS[currentScenarioIdx].text}
                   </p>
               </div>

               <div className="space-y-3">
                   {SCENARIOS[currentScenarioIdx].options.map((opt, i) => (
                       <button 
                          key={i}
                          onClick={() => handleScenarioChoice(opt.score)}
                          className="w-full text-left p-4 border border-zinc-800 bg-black/50 hover:bg-zinc-900 hover:border-pink-500/50 text-zinc-400 hover:text-white transition-all rounded"
                       >
                           {opt.text}
                       </button>
                   ))}
               </div>
           </div>
       )}

       {phase === 'result' && (
           <div className="py-12 animate-in zoom-in">
               <div className="mb-8">
                   <h2 className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-2">Total EQ Score</h2>
                   <div className="text-6xl font-bold text-white mb-2">
                       {Math.round(((faceScore + scenarioScore) / 9) * 100)}
                   </div>
               </div>

               <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8">
                   <div className="bg-zinc-900 border border-zinc-800 p-4 rounded text-center">
                       <div className="text-xs text-zinc-500 uppercase mb-1">Perception</div>
                       <div className="text-xl font-bold text-white">
                           {faceScore}/5
                       </div>
                       <div className="text-[10px] text-zinc-600 mt-1">MICRO-EXPRESSIONS</div>
                   </div>
                   <div className="bg-zinc-900 border border-zinc-800 p-4 rounded text-center">
                       <div className="text-xs text-zinc-500 uppercase mb-1">Strategy</div>
                       <div className="text-xl font-bold text-white">
                           {scenarioScore}/4
                       </div>
                       <div className="text-[10px] text-zinc-600 mt-1">SOCIAL DYNAMICS</div>
                   </div>
               </div>

               <button onClick={() => window.location.reload()} className="btn-secondary">Restart Assessment</button>
           </div>
       )}
    </div>
  );
};

export default EQTest;
