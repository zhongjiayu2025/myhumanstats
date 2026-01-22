
import React, { useState } from 'react';
import { ScanFace, UserCheck, UserX, SunMoon } from 'lucide-react';
import { saveStat } from '../../lib/core';

interface FaceParams {
  id: number;
  eyeSpacing: number; 
  eyeSize: number;    
  noseLength: number; 
  mouthWidth: number; 
  mouthCurve: number; 
  faceShape: number;  
  hairStyle: number;  
  eyebrowTilt: number; 
}

const FaceBlindnessTest: React.FC = () => {
  const [phase, setPhase] = useState<'intro' | 'memorize' | 'identify' | 'result'>('intro');
  const [level, setLevel] = useState(1);
  const [targetFace, setTargetFace] = useState<FaceParams | null>(null);
  const [options, setOptions] = useState<FaceParams[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);

  // Constants
  const TOTAL_LEVELS = 6;

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
          hairStyle: base.hairStyle, // Hair stays same to force feature recognition
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
      
      const variance = 12 - (level * 1.5); 
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
              startLevel();
          }
      }
  };

  const finish = () => {
      setPhase('result');
      const finalScore = Math.round((score / TOTAL_LEVELS) * 100);
      saveStat('face-blindness', finalScore);
  };

  const RenderFace = ({ face, size = 150, angle = 'front', lighting = 'flat' }: { face: FaceParams, size?: number, angle?: 'front' | 'left' | 'right', lighting?: 'flat' | 'side' | 'dark' }) => {
      // Angle Logic
      const shift = angle === 'front' ? 0 : angle === 'left' ? -10 : 10;
      
      // Lighting Logic (Color filters)
      let faceColor = "#e4e4e7"; // zinc-200
      let shadowOpacity = 0;
      
      if (lighting === 'side') {
          shadowOpacity = 0.3;
      } else if (lighting === 'dark') {
          faceColor = "#71717a"; // zinc-500
          shadowOpacity = 0.5;
      }

      return (
          <div className="relative overflow-hidden rounded-lg shadow-inner bg-zinc-200" style={{ width: size, height: size }}>
              {/* Noise Overlay for higher levels */}
              {level > 3 && (
                  <div className="absolute inset-0 opacity-20 pointer-events-none z-20" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")` }}></div>
              )}
              
              {/* Shadow Overlay */}
              {shadowOpacity > 0 && (
                  <div 
                    className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-r from-black to-transparent" 
                    style={{ opacity: shadowOpacity }}
                  ></div>
              )}

              <svg width="100%" height="100%" viewBox="0 0 100 100">
                 {/* Hair Back */}
                 {face.hairStyle === 1 && <path d="M 10 30 Q 50 -10 90 30 L 90 80 L 10 80 Z" fill="#27272a" />}
                 
                 {/* Head Shape */}
                 <rect x="15" y="15" width="70" height="75" rx={20 + face.faceShape * 2} ry={30} fill={faceColor} />
                 
                 {/* Hair Front */}
                 {face.hairStyle === 0 && <path d="M 15 25 Q 50 5 85 25 Z" fill="#3f3f46" />}
                 {face.hairStyle === 2 && <path d="M 15 20 Q 50 40 85 20 L 85 15 L 15 15 Z" fill="#a1a1aa" />}
                 {face.hairStyle === 3 && <path d="M 15 15 Q 50 5 85 15 L 85 30 Q 50 20 15 30 Z" fill="#52525b" />}

                 {/* Features Group */}
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
          </div>
      );
  };

  return (
    <div className="max-w-3xl mx-auto text-center select-none">
       {phase === 'intro' && (
           <div className="py-12 animate-in fade-in">
               <ScanFace size={64} className="mx-auto text-zinc-600 mb-6" />
               <h2 className="text-3xl font-bold text-white mb-2">Advanced Face Memory</h2>
               <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                   Test your ability to recognize faces under varying conditions.
                   <br/>Difficulty increases with angle changes, lighting shadows, and visual noise.
               </p>
               <button onClick={() => startLevel()} className="btn-primary">Start Assessment</button>
           </div>
       )}

       {phase === 'memorize' && targetFace && (
           <div className="py-8 animate-in zoom-in">
               <h3 className="text-sm font-mono text-primary-400 uppercase tracking-widest mb-6">Study Subject - Level {level}</h3>
               
               <div className="flex justify-center gap-8 mb-12">
                   <div className="text-center scale-110">
                       <RenderFace face={targetFace} size={180} angle="front" lighting={level > 4 ? 'side' : 'flat'} />
                       <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-zinc-500 font-mono">
                           {level > 2 && <SunMoon size={12}/>}
                           {level > 4 ? 'LIGHTING: SIDE' : 'LIGHTING: FLAT'}
                       </div>
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
                          className="cursor-pointer hover:-translate-y-2 transition-transform p-2 bg-zinc-800 border border-zinc-700 hover:border-primary-500 rounded-xl group relative"
                       >
                           {/* Identify phase has different angle/lighting than memorize to test 3D processing */}
                           <RenderFace 
                                face={opt} 
                                size={140} 
                                angle={level % 2 === 0 ? 'left' : 'right'} 
                                lighting={level > 4 ? 'dark' : 'flat'} 
                           />
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
                       {score === TOTAL_LEVELS ? "Super-Recognizer. You can identify faces despite lighting changes and noise." : 
                        score >= 3 ? "Average Face Memory. You rely partly on feature matching." :
                        "Low Score. Difficulty with invariant facial representation. You may rely heavily on hair or context."}
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
