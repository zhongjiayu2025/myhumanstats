import React, { useState } from 'react';
import { ScanFace } from 'lucide-react';
import { saveStat } from '../../lib/core';

interface FaceParams {
  id: number;
  eyeSpacing: number; // 0.8 - 1.2
  eyeSize: number;    // 3 - 6
  noseLength: number; // 10 - 20
  mouthWidth: number; // 10 - 25
  mouthCurve: number; // -10 (frown) to 20 (smile)
  faceShape: number;  // 0 (round) - 10 (square-ish)
}

const FaceBlindnessTest: React.FC = () => {
  const [phase, setPhase] = useState<'intro' | 'memorize' | 'identify' | 'result'>('intro');
  const [level, setLevel] = useState(1);
  const [targetFace, setTargetFace] = useState<FaceParams | null>(null);
  const [options, setOptions] = useState<FaceParams[]>([]);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('');

  const generateFace = (id: number): FaceParams => {
     return {
        id,
        eyeSpacing: 0.8 + Math.random() * 0.4,
        eyeSize: 3 + Math.random() * 3,
        noseLength: 10 + Math.random() * 10,
        mouthWidth: 10 + Math.random() * 15,
        mouthCurve: -5 + Math.random() * 20,
        faceShape: Math.random() * 10
     };
  };

  // Mutate a face slightly for higher levels, or generate distinct for lower
  const generateVariant = (base: FaceParams, id: number, variance: number): FaceParams => {
      const v = (val: number) => val + (Math.random() - 0.5) * variance;
      return {
          id,
          eyeSpacing: v(base.eyeSpacing),
          eyeSize: v(base.eyeSize),
          noseLength: v(base.noseLength),
          mouthWidth: v(base.mouthWidth),
          mouthCurve: v(base.mouthCurve),
          faceShape: v(base.faceShape)
      };
  };

  const startLevel = (lvl: number) => {
      // Create target
      const target = generateFace(0);
      setTargetFace(target);
      setPhase('memorize');
  };

  const startIdentify = () => {
      if (!targetFace) return;
      
      const variance = 10 - (level * 0.8); // Large variance at level 1, small at level 10
      
      const distractors = [];
      const numOptions = 3;
      
      for(let i=1; i<numOptions; i++) {
         // At high levels, distractors are mutated versions of target
         // At low levels, completely random
         if (level > 3) {
             distractors.push(generateVariant(targetFace, i, variance));
         } else {
             distractors.push(generateFace(i));
         }
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
      if (face.id === 0) { // ID 0 is always target
          setScore(s => s + 1);
          if (level < 10) {
              setLevel(l => l + 1);
              startLevel(level + 1);
          } else {
              finish(true);
          }
      } else {
          finish(false);
      }
  };

  const finish = (win: boolean) => {
      setPhase('result');
      const finalScore = win ? 100 : Math.round(((level - 1) / 10) * 100);
      saveStat('face-blindness', finalScore);
      setMessage(win ? "Perfect Recognition." : "Identification Failed.");
  };

  const RenderFace = ({ face, size = 150 }: { face: FaceParams, size?: number }) => {
      return (
          <svg width={size} height={size} viewBox="0 0 100 100" className="bg-zinc-200 rounded-lg shadow-inner">
             {/* Head Shape - varied by faceShape */}
             <rect x="10" y="10" width="80" height="80" rx={20 + face.faceShape * 2} ry={25} fill="#e4e4e7" />
             
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
          </svg>
      );
  };

  return (
    <div className="max-w-xl mx-auto text-center select-none">
       {phase === 'intro' && (
           <div className="py-12 animate-in fade-in">
               <ScanFace size={64} className="mx-auto text-zinc-600 mb-6" />
               <h2 className="text-3xl font-bold text-white mb-2">Face Blindness Test</h2>
               <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                   Test your ability to recognize facial features (Prosopagnosia).
                   <br/>You will see a target face, then identify it among similar lookalikes.
               </p>
               <button onClick={() => startLevel(1)} className="btn-primary">Start Identification</button>
           </div>
       )}

       {phase === 'memorize' && targetFace && (
           <div className="py-12">
               <h3 className="text-xl text-primary-400 font-bold mb-6 animate-pulse">MEMORIZE THIS FACE</h3>
               <div className="mb-8 flex justify-center">
                   <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
                      <RenderFace face={targetFace} size={200} />
                   </div>
               </div>
               <button onClick={startIdentify} className="btn-primary w-full max-w-xs">I'm Ready</button>
           </div>
       )}

       {phase === 'identify' && (
           <div className="py-8">
               <h3 className="text-xl text-white font-bold mb-6">Which one is it?</h3>
               <div className="grid grid-cols-3 gap-4 mb-8">
                   {options.map((opt, i) => (
                       <div 
                          key={i} 
                          onClick={() => handleGuess(opt)}
                          className="cursor-pointer hover:scale-105 transition-transform p-2 bg-zinc-800 border border-zinc-700 hover:border-primary-500 rounded-xl"
                       >
                           <RenderFace face={opt} size={100} />
                       </div>
                   ))}
               </div>
           </div>
       )}

       {phase === 'result' && (
           <div className="py-12 animate-in zoom-in">
               <div className={`text-5xl font-bold mb-4 ${score > 8 ? 'text-emerald-500' : 'text-zinc-200'}`}>
                   {score > 8 ? "Excellent" : `Level ${level}`}
               </div>
               <p className="text-zinc-400 mb-8">{message}</p>
               
               <div className="bg-zinc-900/50 p-4 border border-zinc-800 text-sm text-zinc-500 mb-8 max-w-sm mx-auto">
                   People with <strong>Prosopagnosia</strong> (Face Blindness) struggle to identify familiar faces. This test simulates the cognitive load of feature matching.
               </div>
               
               <button onClick={() => { setScore(0); setLevel(1); setPhase('intro'); }} className="btn-secondary">
                   Restart Test
               </button>
           </div>
       )}
    </div>
  );
};

export default FaceBlindnessTest;