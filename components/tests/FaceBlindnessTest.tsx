import React, { useState } from 'react';
import { ScanFace, UserCheck, UserX } from 'lucide-react';
import { saveStat } from '../../lib/core';

interface FaceParams {
  id: number;
  eyeSpacing: number; // 0.8 - 1.2
  eyeSize: number;    // 3 - 6
  noseLength: number; // 10 - 20
  mouthWidth: number; // 10 - 25
  mouthCurve: number; // -10 (frown) to 20 (smile)
  faceShape: number;  // 0 (round) - 10 (square-ish)
  hairStyle: number;  // 0-3
  eyebrowTilt: number; // -5 to 5
}

const FaceBlindnessTest: React.FC = () => {
  const [phase, setPhase] = useState<'intro' | 'memorize' | 'identify' | 'result'>('intro');
  const [level, setLevel] = useState(1);
  const [targetFace, setTargetFace] = useState<FaceParams | null>(null);
  const [options, setOptions] = useState<FaceParams[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);

  // Constants
  const TOTAL_LEVELS = 5;

  const generateFace = (id: number): FaceParams => {
     return {
        id,
        eyeSpacing: 0.8 + Math.random() * 0.4,
        eyeSize: 3 + Math.random() * 3,
        noseLength: 10 + Math.random() * 10,
        mouthWidth: 10 + Math.random() * 15,
        mouthCurve: -5 + Math.random() * 20,
        faceShape: Math.random() * 10,
        hairStyle: Math.floor(Math.random() * 4),
        eyebrowTilt: (Math.random() - 0.5) * 10
     };
  };

  const generateVariant = (base: FaceParams, id: number, variance: number): FaceParams => {
      const v = (val: number) => val + (Math.random() - 0.5) * variance;
      return {
          id,
          eyeSpacing: v(base.eyeSpacing),
          eyeSize: v(base.eyeSize),
          noseLength: v(base.noseLength),
          mouthWidth: v(base.mouthWidth),
          mouthCurve: v(base.mouthCurve),
          faceShape: v(base.faceShape),
          hairStyle: base.hairStyle, // Keep hair same to force facial feature recognition
          eyebrowTilt: v(base.eyebrowTilt)
      };
  };

  const startLevel = () => {
      const target = generateFace(0);
      setTargetFace(target);
      setPhase('memorize');
  };

  const startIdentify = () => {
      if (!targetFace) return;
      
      const variance = 12 - (level * 2); // Harder levels = similar faces
      const numOptions = 3;
      
      const distractors = [];
      for(let i=1; i<numOptions; i++) {
         distractors.push(generateVariant(targetFace, i, variance));
      }
      
      const all = [targetFace, ...distractors];
      // Shuffle
      for (let i = all.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [all[i], all[j]] = [all[j], all[i]];
      }
      
      setOptions(all);
      setPhase('identify');
  };

  const handleGuess = (face: FaceParams) => {
      if (face.id === 0) {
          setScore(s => s + 1);
          if (level < TOTAL_LEVELS) {
              setLevel(l => l + 1);
              startLevel();
          } else {
              finish();
          }
      } else {
          setLives(l => l - 1);
          if (lives <= 1) {
              finish();
          } else {
              // Let's restart level with new face
              startLevel();
          }
      }
  };

  const finish = () => {
      setPhase('result');
      const finalScore = Math.round((score / TOTAL_LEVELS) * 100);
      saveStat('face-blindness', finalScore);
  };

  const RenderFace = ({ face, size = 150, angle = 'front' }: { face: FaceParams, size?: number, angle?: 'front' | 'left' | 'right' }) => {
      // Angle Logic: Shift X coords
      const shift = angle === 'front' ? 0 : angle === 'left' ? -10 : 10;
      
      return (
          <svg width={size} height={size} viewBox="0 0 100 100" className="bg-zinc-200 rounded-lg shadow-inner overflow-hidden">
             {/* Hair Back */}
             {face.hairStyle === 1 && <path d="M 10 30 Q 50 -10 90 30 L 90 80 L 10 80 Z" fill="#27272a" />}
             
             {/* Head Shape */}
             <rect x="15" y="15" width="70" height="75" rx={20 + face.faceShape * 2} ry={30} fill="#e4e4e7" />
             
             {/* Hair Front */}
             {face.hairStyle === 0 && <path d="M 15 25 Q 50 5 85 25 Z" fill="#3f3f46" />}
             {face.hairStyle === 2 && <path d="M 15 20 Q 50 40 85 20 L 85 15 L 15 15 Z" fill="#a1a1aa" />}
             {face.hairStyle === 3 && <path d="M 15 15 Q 50 5 85 15 L 85 30 Q 50 20 15 30 Z" fill="#52525b" />}

             {/* Features Group (Shiftable) */}
             <g transform={`translate(${shift}, 0)`}>
                 {/* Eyebrows */}
                 <line x1={50 - (face.eyeSpacing * 15) - 8} y1={33 + face.eyebrowTilt} x2={50 - (face.eyeSpacing * 15) + 8} y2={33 - face.eyebrowTilt} stroke="#71717a" strokeWidth="2" strokeLinecap="round" />
                 <line x1={50 + (face.eyeSpacing * 15) - 8} y1={33 - face.eyebrowTilt} x2={50 + (face.eyeSpacing * 15) + 8} y2={33 + face.eyebrowTilt} stroke="#71717a" strokeWidth="2" strokeLinecap="round" />

                 {/* Eyes */}
                 <circle cx={50 - (face.eyeSpacing * 15)} cy="40" r={face.eyeSize} fill="#18181b" />
                 <circle cx={50 + (face.eyeSpacing * 15)} cy="40" r={face.eyeSize} fill="#18181b" />
                 
                 {/* Nose */}
                 <path d={`M 50 45 L 45 ${45 + face.noseLength} L 55 ${45 + face.noseLength} Z`} fill="#d4d4d8" />
                 
                 {/* Mouth */}
                 <path 
                    d={`M ${50 - face.mouthWidth} 75 Q 50 ${75 + face.mouthCurve} ${50 + face.mouthWidth} 75`} 
                    stroke="#18181b" 
                    strokeWidth="3" 
                    fill="none" 
                    strokeLinecap="round"
                 />
             </g>
          </svg>
      );
  };

  return (
    <div className="max-w-3xl mx-auto text-center select-none">
       {phase === 'intro' && (
           <div className="py-12 animate-in fade-in">
               <ScanFace size={64} className="mx-auto text-zinc-600 mb-6" />
               <h2 className="text-3xl font-bold text-white mb-2">Cambridge Face Memory Test (Lite)</h2>
               <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                   A simplified version of the clinical CFMT. 
                   <br/>You will see a target face from different angles. 
                   <br/>You must then identify it from a lineup of similar faces.
               </p>
               <button onClick={() => startLevel()} className="btn-primary">Start Assessment</button>
           </div>
       )}

       {phase === 'memorize' && targetFace && (
           <div className="py-8 animate-in zoom-in">
               <h3 className="text-sm font-mono text-primary-400 uppercase tracking-widest mb-6">Study Subject - Level {level}</h3>
               
               <div className="flex justify-center gap-8 mb-12">
                   <div className="text-center">
                       <RenderFace face={targetFace} size={160} angle="left" />
                       <span className="text-[10px] text-zinc-600 font-mono mt-2 block">PROFILE_L</span>
                   </div>
                   <div className="text-center scale-110">
                       <RenderFace face={targetFace} size={160} angle="front" />
                       <span className="text-[10px] text-zinc-600 font-mono mt-2 block">FRONTAL</span>
                   </div>
                   <div className="text-center">
                       <RenderFace face={targetFace} size={160} angle="right" />
                       <span className="text-[10px] text-zinc-600 font-mono mt-2 block">PROFILE_R</span>
                   </div>
               </div>
               
               <button onClick={startIdentify} className="btn-primary w-full max-w-xs">
                   I Have Memorized It
               </button>
           </div>
       )}

       {phase === 'identify' && (
           <div className="py-8 animate-in slide-in-from-right">
               <h3 className="text-xl text-white font-bold mb-8">Identify the Subject</h3>
               <div className="flex justify-center gap-4 mb-8 flex-wrap">
                   {options.map((opt, i) => (
                       <div 
                          key={i} 
                          onClick={() => handleGuess(opt)}
                          className="cursor-pointer hover:-translate-y-2 transition-transform p-3 bg-zinc-800 border border-zinc-700 hover:border-primary-500 rounded-xl group relative"
                       >
                           <RenderFace face={opt} size={140} angle="front" />
                           <div className="absolute inset-0 bg-primary-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
                       </div>
                   ))}
               </div>
               <div className="flex justify-center gap-2">
                   {[...Array(3)].map((_, i) => (
                       <div key={i} className={`w-2 h-2 rounded-full ${i < lives ? 'bg-red-500' : 'bg-zinc-800'}`}></div>
                   ))}
               </div>
           </div>
       )}

       {phase === 'result' && (
           <div className="py-12 animate-in zoom-in">
               {score > 4 ? <UserCheck size={64} className="mx-auto text-emerald-500 mb-6"/> : <UserX size={64} className="mx-auto text-red-500 mb-6"/>}
               
               <div className="text-5xl font-bold text-white mb-2">
                   {score}/{TOTAL_LEVELS}
               </div>
               <h2 className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-8">Prosopagnosia Score</h2>
               
               <div className="bg-zinc-900/50 p-6 border border-zinc-800 rounded max-w-md mx-auto text-left">
                   <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                       {score === 5 ? "Perfect Score. You have excellent facial recognition skills (Super-Recognizer potential)." : 
                        score >= 3 ? "Average Score. Normal facial processing ability." :
                        "Low Score. You may have mild Prosopagnosia (Face Blindness), finding it hard to distinguish features without hair/context cues."}
                   </p>
               </div>
               
               <div className="mt-8">
                   <button onClick={() => { setScore(0); setLives(3); setLevel(1); setPhase('intro'); }} className="btn-secondary">
                       Restart Assessment
                   </button>
               </div>
           </div>
       )}
    </div>
  );
};

export default FaceBlindnessTest;