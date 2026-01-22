
import React, { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Clock, Check, X, Play, RotateCcw, AlertCircle, Eye, Info, Brain } from 'lucide-react';
import { saveStat } from '../../lib/core';
import { playUiSound } from '../../lib/sounds';

// --- Phase 1: Micro-Expressions Data ---
type Emotion = 'happy' | 'sad' | 'angry' | 'surprise' | 'disgust' | 'fear' | 'neutral';

interface ExpressionDef {
    id: number;
    type: Emotion;
    eyebrows: { rotate: number, y: number };
    eyes: { scaleY: number, pupilY: number };
    mouth: { curve: number, width: number, open: number };
    hint: string;
}

const EXPRESSIONS: ExpressionDef[] = [
    { 
        id: 1, type: 'happy', 
        eyebrows: { rotate: -10, y: -5 }, 
        eyes: { scaleY: 0.8, pupilY: 0 }, // Crow's feet squint
        mouth: { curve: 25, width: 25, open: 5 }, 
        hint: "Crow's feet at eyes, cheeks raised."
    },
    { 
        id: 2, type: 'angry', 
        eyebrows: { rotate: 20, y: 5 }, 
        eyes: { scaleY: 0.9, pupilY: 0 }, // Glare
        mouth: { curve: -10, width: 15, open: 2 }, 
        hint: "Eyebrows lowered and pulled together, lips tightened."
    },
    { 
        id: 3, type: 'sad', 
        eyebrows: { rotate: -15, y: -2 }, 
        eyes: { scaleY: 0.9, pupilY: 2 }, // Looking down slightly
        mouth: { curve: -20, width: 15, open: 0 }, 
        hint: "Inner corners of eyebrows raised, lip corners pulled down."
    },
    { 
        id: 4, type: 'surprise', 
        eyebrows: { rotate: -20, y: -10 }, 
        eyes: { scaleY: 1.2, pupilY: 0 }, // Widened eyes
        mouth: { curve: 0, width: 10, open: 20 }, // Jaw drop
        hint: "Eyebrows raised, eyes widened, jaw dropped open."
    },
    { 
        id: 5, type: 'fear', 
        eyebrows: { rotate: -5, y: -5 }, 
        eyes: { scaleY: 1.3, pupilY: 0 }, // Upper white visible
        mouth: { curve: -5, width: 25, open: 5 }, // Lips stretched
        hint: "Eyebrows raised and pulled together, lips stretched horizontally."
    },
    { 
        id: 6, type: 'disgust', 
        eyebrows: { rotate: 10, y: 5 }, 
        eyes: { scaleY: 0.8, pupilY: 0 }, // Squint
        mouth: { curve: -15, width: 15, open: 5 }, // Upper lip raised
        hint: "Nose wrinkled, upper lip raised."
    }
];

const NEUTRAL_EXP: ExpressionDef = {
    id: 0, type: 'neutral',
    eyebrows: { rotate: 0, y: 0 },
    eyes: { scaleY: 1, pupilY: 0 },
    mouth: { curve: 0, width: 15, open: 0 },
    hint: "Resting face."
};

const SCENARIOS = [
    {
        id: 1,
        category: "Social Awareness",
        text: "During a team meeting, a usually quiet colleague interrupts to propose an idea, but stutters and looks down. The manager frowns.",
        options: [
            { text: "Quickly move the conversation along to save them embarrassment.", score: 0, feedback: "This dismisses their contribution." },
            { text: "Smile, make eye contact, and ask a follow-up question to validate their input.", score: 2, feedback: "Validates the risk they took and encourages inclusion." },
            { text: "Wait for them to finish and see what happens.", score: 1, feedback: "Neutral, but misses an opportunity to support." }
        ]
    },
    {
        id: 2,
        category: "Relationship Management",
        text: "Your partner/friend claims they are 'fine' but is giving short, one-word answers and avoiding eye contact.",
        options: [
            { text: "Believe them and carry on with your day.", score: 0, feedback: "Ignores non-verbal cues of distress." },
            { text: "Demand to know what's wrong immediately.", score: 0, feedback: "Likely to cause defensiveness." },
            { text: "Gently note the behavior: 'You seem quiet today. I'm here if you want to talk.'", score: 2, feedback: "Observational and supportive without pressure." }
        ]
    },
    {
        id: 3,
        category: "Self-Management",
        text: "You receive critical feedback on a project you worked hard on. You feel a surge of anger and defensiveness.",
        options: [
            { text: "Explain immediately why the feedback is wrong.", score: 0, feedback: "Reactive behavior blocks learning." },
            { text: "Take a deep breath, write down the points, and ask for time to process before responding.", score: 2, feedback: "Demonstrates excellent emotional regulation." },
            { text: "Apologize profusely to end the conversation.", score: 1, feedback: "Avoids conflict but doesn't address the core issue." }
        ]
    }
];

const RenderFace = ({ targetExp, state }: { targetExp: ExpressionDef, state: 'neutral' | 'emotion' }) => {
    // Interpolate between neutral and emotion based on state
    // In a real app we might use spring physics, here we use CSS transitions
    const exp = state === 'emotion' ? targetExp : NEUTRAL_EXP;

    return (
        <svg width="240" height="240" viewBox="0 0 100 100" className="mx-auto drop-shadow-2xl transition-all duration-200 ease-out">
            {/* Face Base */}
            <circle cx="50" cy="50" r="45" fill="#e4e4e7" stroke="#d4d4d8" strokeWidth="2" />
            
            {/* Eyes Group */}
            <g className="transition-all duration-200" style={{ transform: `scaleY(${exp.eyes.scaleY})`, transformOrigin: '50% 40%' }}>
                {/* Left Eye */}
                <ellipse cx="35" cy="40" rx="6" ry="6" fill="#f4f4f5" stroke="#a1a1aa" strokeWidth="1" />
                <circle cx="35" cy={40 + exp.eyes.pupilY} r="3" fill="#18181b" />
                
                {/* Right Eye */}
                <ellipse cx="65" cy="40" rx="6" ry="6" fill="#f4f4f5" stroke="#a1a1aa" strokeWidth="1" />
                <circle cx="65" cy={40 + exp.eyes.pupilY} r="3" fill="#18181b" />
            </g>

            {/* Eyebrows */}
            <g className="transition-all duration-200">
                {/* Left Brow */}
                <path 
                    d="M 25 30 Q 35 30 45 30" 
                    stroke="#3f3f46" strokeWidth="3" strokeLinecap="round" fill="none"
                    style={{ 
                        transform: `translate(0, ${exp.eyebrows.y}px) rotate(${exp.eyebrows.rotate}deg)`, 
                        transformOrigin: '35px 30px' 
                    }}
                />
                {/* Right Brow */}
                <path 
                    d="M 55 30 Q 65 30 75 30" 
                    stroke="#3f3f46" strokeWidth="3" strokeLinecap="round" fill="none"
                    style={{ 
                        transform: `translate(0, ${exp.eyebrows.y}px) rotate(${-exp.eyebrows.rotate}deg)`, 
                        transformOrigin: '65px 30px' 
                    }}
                />
            </g>

            {/* Mouth */}
            <g className="transition-all duration-200">
                {exp.mouth.open > 2 ? (
                    // Open Mouth (Surprise/Fear)
                    <ellipse 
                        cx="50" cy="75" 
                        rx={exp.mouth.width / 2} ry={exp.mouth.open / 2} 
                        fill="#18181b" 
                    />
                ) : (
                    // Closed Mouth (Curve)
                    <path 
                        d={`M ${50 - exp.mouth.width/2} 75 Q 50 ${75 + exp.mouth.curve} ${50 + exp.mouth.width/2} 75`} 
                        stroke="#18181b" strokeWidth="3" fill="none" strokeLinecap="round" 
                    />
                )}
            </g>
            
            {/* Nose (Subtle) */}
            <path d="M 50 45 L 48 55 L 52 55 Z" fill="#d4d4d8" opacity="0.5" />
        </svg>
    );
};

const EQTest: React.FC = () => {
  const [phase, setPhase] = useState<'intro' | 'flash-prep' | 'flash-show' | 'flash-guess' | 'flash-feedback' | 'scenarios' | 'scenario-feedback' | 'result'>('intro');
  
  // Scores
  const [perceptionScore, setPerceptionScore] = useState(0);
  const [strategyScore, setStrategyScore] = useState(0);
  
  // Flash State
  const [currentFaceIdx, setCurrentFaceIdx] = useState(0);
  const [flashState, setFlashState] = useState<'neutral' | 'emotion'>('neutral');
  const [lastGuess, setLastGuess] = useState<Emotion | null>(null);
  const [replayCount, setReplayCount] = useState(2);
  
  // Scenario State
  const [currentScenarioIdx, setCurrentScenarioIdx] = useState(0);
  const [scenarioFeedback, setScenarioFeedback] = useState("");
  const [scenarioPoints, setScenarioPoints] = useState(0);

  // Data
  const [testFaces] = useState(() => [...EXPRESSIONS].sort(() => Math.random() - 0.5).slice(0, 5));

  // --- Logic: Micro Expressions ---
  const triggerFlash = () => {
      setFlashState('neutral');
      // Delay before flash
      setTimeout(() => {
          setFlashState('emotion');
          // Flash duration: 250ms (Micro-expression standard is <500ms)
          setTimeout(() => {
              setFlashState('neutral');
              setPhase('flash-guess');
          }, 400); 
      }, 1000);
  };

  const handleReplay = () => {
      if (replayCount > 0) {
          setReplayCount(r => r - 1);
          setPhase('flash-show');
          triggerFlash();
      }
  };

  const handleFaceGuess = (guess: Emotion) => {
      setLastGuess(guess);
      const isCorrect = testFaces[currentFaceIdx].type === guess;
      if (isCorrect) setPerceptionScore(s => s + 1);
      playUiSound(isCorrect ? 'success' : 'fail');
      setPhase('flash-feedback');
  };

  const nextFace = () => {
      if (currentFaceIdx < testFaces.length - 1) {
          setCurrentFaceIdx(c => c + 1);
          setReplayCount(2);
          setPhase('flash-prep');
      } else {
          setPhase('scenarios');
      }
  };

  // --- Logic: Scenarios ---
  const handleScenarioChoice = (points: number, feedback: string) => {
      setScenarioPoints(points);
      setScenarioFeedback(feedback);
      setStrategyScore(s => s + points);
      playUiSound('click');
      setPhase('scenario-feedback');
  };

  const nextScenario = () => {
      if (currentScenarioIdx < SCENARIOS.length - 1) {
          setCurrentScenarioIdx(c => c + 1);
          setPhase('scenarios');
      } else {
          finishTest();
      }
  };

  const finishTest = () => {
      // Max Scores:
      // Perception: 5 faces * 1 pt = 5
      // Strategy: 3 scenarios * 2 pts = 6
      // Total = 11
      const totalScore = Math.round(((perceptionScore + strategyScore) / 11) * 100);
      saveStat('eq-test', totalScore);
      setPhase('result');
  };

  return (
    <div className="max-w-3xl mx-auto text-center select-none">
       
       {phase === 'intro' && (
           <div className="py-12 animate-in fade-in zoom-in">
               <Heart size={64} className="mx-auto text-pink-500 mb-6" />
               <h2 className="text-3xl font-bold text-white mb-2">Emotional Intelligence (EQ)</h2>
               <p className="text-zinc-400 mb-8 max-w-md mx-auto leading-relaxed">
                   This assessment measures two pillars of EQ:
                   <br/><strong className="text-white">1. Perception:</strong> Detecting micro-expressions (200ms flashes).
                   <br/><strong className="text-white">2. Strategy:</strong> Applying emotional logic to social conflicts.
               </p>
               <button onClick={() => setPhase('flash-prep')} className="btn-primary">Begin Assessment</button>
           </div>
       )}

       {/* --- PERCEPTION PHASE --- */}

       {phase === 'flash-prep' && (
           <div className="py-20 animate-in zoom-in">
               <h3 className="text-xs text-zinc-500 font-mono uppercase tracking-widest mb-4">Module 1: Micro-Expressions</h3>
               <h2 className="text-2xl text-white font-bold mb-8">Subject {currentFaceIdx + 1} / 5</h2>
               <p className="text-zinc-400 mb-8 max-w-sm mx-auto">
                   The face will flash an emotion for <span className="text-white font-bold">0.4 seconds</span>.
                   <br/>Keep your eyes focused on the center.
               </p>
               <button onClick={() => { setPhase('flash-show'); triggerFlash(); }} className="w-24 h-24 rounded-full bg-white text-black font-bold text-lg hover:scale-110 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.3)] animate-pulse-fast">
                   START
               </button>
           </div>
       )}

       {(phase === 'flash-show' || phase === 'flash-guess' || phase === 'flash-feedback') && (
           <div className="py-8">
               {/* Replay Button */}
               {phase === 'flash-guess' && (
                   <div className="absolute top-0 right-0">
                       <button onClick={handleReplay} disabled={replayCount === 0} className="flex items-center gap-2 text-xs text-zinc-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                           <RotateCcw size={12}/> Replay ({replayCount})
                       </button>
                   </div>
               )}

               {/* Face Display */}
               <div className="mb-8 relative h-[260px] flex items-center justify-center">
                   {phase === 'flash-feedback' ? (
                       <div className="scale-110">
                           {/* Show full emotion in feedback */}
                           <RenderFace targetExp={testFaces[currentFaceIdx]} state="emotion" />
                       </div>
                   ) : (
                       <RenderFace targetExp={testFaces[currentFaceIdx]} state={flashState} />
                   )}
                   
                   {/* Focus Guide */}
                   {flashState === 'neutral' && phase === 'flash-show' && (
                       <div className="absolute w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                   )}
               </div>

               {/* Interaction Area */}
               {phase === 'flash-guess' && (
                   <div className="grid grid-cols-3 gap-3 max-w-md mx-auto animate-in slide-in-from-bottom-4">
                       {['Happy', 'Sad', 'Angry', 'Surprise', 'Fear', 'Disgust'].map(emo => (
                           <button 
                              key={emo} 
                              onClick={() => handleFaceGuess(emo.toLowerCase() as Emotion)}
                              className="py-3 px-2 border border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 hover:border-pink-500 text-zinc-300 hover:text-white rounded-lg transition-all text-sm font-medium"
                           >
                               {emo}
                           </button>
                       ))}
                   </div>
               )}

               {phase === 'flash-feedback' && (
                   <div className="max-w-md mx-auto animate-in zoom-in">
                       <div className={`text-lg font-bold mb-2 flex items-center justify-center gap-2 ${lastGuess === testFaces[currentFaceIdx].type ? 'text-emerald-500' : 'text-red-500'}`}>
                           {lastGuess === testFaces[currentFaceIdx].type ? <Check size={20}/> : <X size={20}/>}
                           {lastGuess === testFaces[currentFaceIdx].type ? "Correct Analysis" : "Misinterpretation"}
                       </div>
                       
                       <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl mb-8 text-left">
                           <div className="text-xs text-zinc-500 uppercase font-mono mb-2">TARGET EMOTION</div>
                           <div className="text-2xl text-white font-bold mb-4 capitalize">{testFaces[currentFaceIdx].type}</div>
                           <div className="text-xs text-zinc-500 uppercase font-mono mb-2">VISUAL CUES</div>
                           <p className="text-primary-400 text-sm">{testFaces[currentFaceIdx].hint}</p>
                       </div>

                       <button onClick={nextFace} className="btn-primary w-full">
                           Next Subject <Play size={16} className="inline ml-2" fill="currentColor"/>
                       </button>
                   </div>
               )}
           </div>
       )}

       {/* --- STRATEGY PHASE --- */}

       {phase === 'scenarios' && (
           <div className="py-8 animate-in slide-in-from-right">
               <div className="flex justify-between items-center px-4 mb-8 border-b border-zinc-800 pb-4">
                   <span className="text-xs font-mono text-zinc-500">MODULE 2: STRATEGY</span>
                   <span className="text-xs font-mono text-pink-500">CASE {currentScenarioIdx + 1}/{SCENARIOS.length}</span>
               </div>

               <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-xl mb-8 text-left relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-1 h-full bg-pink-500"></div>
                   <div className="flex items-center gap-2 mb-4 text-pink-400">
                       <MessageCircle size={20} />
                       <span className="text-xs font-bold uppercase">{SCENARIOS[currentScenarioIdx].category}</span>
                   </div>
                   <p className="text-lg text-white leading-relaxed font-medium">
                       {SCENARIOS[currentScenarioIdx].text}
                   </p>
               </div>

               <div className="space-y-3">
                   {SCENARIOS[currentScenarioIdx].options.map((opt, i) => (
                       <button 
                          key={i}
                          onClick={() => handleScenarioChoice(opt.score, opt.feedback)}
                          className="w-full text-left p-5 border border-zinc-800 bg-black/50 hover:bg-zinc-900 hover:border-pink-500/50 text-zinc-300 hover:text-white transition-all rounded-lg group"
                       >
                           <div className="flex items-start gap-3">
                               <div className="mt-1 w-4 h-4 rounded-full border border-zinc-600 group-hover:border-pink-500 shrink-0"></div>
                               <span className="text-sm">{opt.text}</span>
                           </div>
                       </button>
                   ))}
               </div>
           </div>
       )}

       {phase === 'scenario-feedback' && (
           <div className="py-12 animate-in fade-in">
               <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 ${scenarioPoints === 2 ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/30' : scenarioPoints === 1 ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30' : 'bg-red-900/30 text-red-400 border border-red-500/30'}`}>
                   {scenarioPoints === 2 ? <Check size={16}/> : scenarioPoints === 1 ? <Info size={16}/> : <X size={16}/>}
                   <span className="text-sm font-bold">{scenarioPoints === 2 ? "Optimal Response" : scenarioPoints === 1 ? "Sub-optimal" : "Counter-productive"} (+{scenarioPoints} pts)</span>
               </div>

               <div className="bg-zinc-900/50 p-8 rounded-xl border border-zinc-800 mb-8 max-w-lg mx-auto">
                   <p className="text-zinc-300 leading-relaxed text-sm">
                       {scenarioFeedback}
                   </p>
               </div>

               <button onClick={nextScenario} className="btn-primary">
                   Continue
               </button>
           </div>
       )}

       {/* --- RESULT PHASE --- */}

       {phase === 'result' && (
           <div className="py-12 animate-in zoom-in">
               <div className="mb-12">
                   <div className="inline-block p-4 rounded-full bg-zinc-900 border border-zinc-800 mb-4">
                       <Brain size={40} className="text-pink-500" />
                   </div>
                   <h2 className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-2">EQ Index</h2>
                   <div className="text-7xl font-bold text-white mb-2 tracking-tighter">
                       {Math.round(((perceptionScore + strategyScore) / 11) * 100)}
                   </div>
                   <p className="text-zinc-400 text-sm">Percentile Estimate</p>
               </div>

               <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-12">
                   <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl text-center">
                       <div className="text-xs text-zinc-500 uppercase mb-2 font-bold tracking-wider">Perception</div>
                       <div className="text-3xl font-bold text-white mb-1">
                           {Math.round((perceptionScore / 5) * 100)}%
                       </div>
                       <div className="text-[10px] text-zinc-600">Reading Emotions</div>
                   </div>
                   <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl text-center">
                       <div className="text-xs text-zinc-500 uppercase mb-2 font-bold tracking-wider">Strategy</div>
                       <div className="text-3xl font-bold text-white mb-1">
                           {Math.round((strategyScore / 6) * 100)}%
                       </div>
                       <div className="text-[10px] text-zinc-600">Social Response</div>
                   </div>
               </div>

               <div className="flex gap-4 justify-center">
                   <button onClick={() => window.location.reload()} className="btn-secondary flex items-center gap-2">
                       <RotateCcw size={16} /> Retake Assessment
                   </button>
               </div>
           </div>
       )}
    </div>
  );
};

export default EQTest;
