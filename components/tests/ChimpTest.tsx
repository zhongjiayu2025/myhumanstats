
import React, { useState } from 'react';
import { Brain, Trophy, RotateCcw, Banana, Volume2, VolumeX, Eye, Heart, HeartCrack } from 'lucide-react';
import { saveStat } from '../../lib/core';
import { playUiSound } from '../../lib/sounds';
import CountdownOverlay from '../CountdownOverlay';

interface Node {
  id: number;
  val: number;
  col: number;
  row: number;
}

const ChimpTest: React.FC = () => {
  const [phase, setPhase] = useState<'intro' | 'countdown' | 'play' | 'result'>('intro');
  const [level, setLevel] = useState(4);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [allNodes, setAllNodes] = useState<Node[]>([]);
  
  const [nextNum, setNextNum] = useState(1);
  const [isMasked, setIsMasked] = useState(false);
  const [strikes, setStrikes] = useState(0); // New: 3 Strikes per game (or level logic)
  const MAX_STRIKES = 3;
  
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const [isRevealing, setIsRevealing] = useState(false);
  const [wrongClickId, setWrongClickId] = useState<number | null>(null);
  
  // New: Track user's actual click path for replay
  const [userPath, setUserPath] = useState<number[]>([]); // Array of node IDs clicked

  const [gridConfig, setGridConfig] = useState({ rows: 5, cols: 8 });

  const initiateTest = () => {
      setStrikes(0);
      setLevel(4);
      prepareLevel(4);
      setPhase('countdown');
  };

  const getGridSizeForLevel = (lvl: number) => {
      if (lvl <= 6) return { rows: 4, cols: 5 }; 
      if (lvl <= 10) return { rows: 5, cols: 6 }; 
      return { rows: 6, cols: 8 }; 
  };

  const prepareLevel = (numCount: number) => {
      setNextNum(1);
      setIsMasked(false);
      setIsRevealing(false);
      setWrongClickId(null);
      setUserPath([]);
      
      const dims = getGridSizeForLevel(numCount);
      setGridConfig(dims);

      const positions = new Set<string>();
      const newNodes: Node[] = [];
      
      for(let i=1; i<=numCount; i++) {
          let r, c, key;
          do {
              r = Math.floor(Math.random() * dims.rows);
              c = Math.floor(Math.random() * dims.cols);
              key = `${r}-${c}`;
          } while(positions.has(key));
          
          positions.add(key);
          newNodes.push({ id: i, val: i, row: r, col: c });
      }
      setNodes(newNodes);
      setAllNodes(newNodes);
  };

  const startLevelPlay = () => {
      setPhase('play');
  };

  const nextLevel = () => {
      const nextLvl = level + 1;
      setLevel(nextLvl);
      prepareLevel(nextLvl);
      setPhase('play'); 
  };

  // Retry the SAME level (new pattern)
  const retryLevel = () => {
      prepareLevel(level);
      setPhase('play');
  };

  const handleNodeClick = (clickedNode: Node) => {
      if (isRevealing) return;

      setUserPath(prev => [...prev, clickedNode.val]);

      // Correct Click
      if (clickedNode.val === nextNum) {
          if (soundEnabled) playUiSound('click');
          
          if (clickedNode.val === 1) {
              setIsMasked(true);
          }

          setNextNum(n => n + 1);
          setNodes(prev => prev.filter(n => n.val !== clickedNode.val));

          if (nodes.length === 1) {
              if (soundEnabled) playUiSound('success');
              setTimeout(nextLevel, 500);
          }
      } 
      // Incorrect Click
      else {
          if (soundEnabled) playUiSound('fail');
          
          // Non-linear difficulty: Give them another chance at this level if strikes remain
          const newStrikes = strikes + 1;
          setStrikes(newStrikes);
          setWrongClickId(clickedNode.val);
          setIsRevealing(true); 
          
          setTimeout(() => {
              if (newStrikes >= MAX_STRIKES) {
                  finish();
              } else {
                  retryLevel();
              }
          }, 4000); 
      }
  };

  const finish = () => {
      setPhase('result');
      const raw = Math.max(0, level - 4);
      const score = Math.min(100, Math.round((raw / 16) * 100));
      saveStat('chimp-test', score);
  };

  // Correct Path (Green)
  const getCorrectPathPoints = () => {
      if (!isRevealing) return '';
      const sorted = [...allNodes].sort((a,b) => a.val - b.val);
      return sorted.map(n => {
          const x = (n.col / gridConfig.cols) * 100 + (1/gridConfig.cols)*50; 
          const y = (n.row / gridConfig.rows) * 100 + (1/gridConfig.rows)*50;
          return `${x},${y}`;
      }).join(' ');
  };

  // User Error Path (Red)
  const getUserPathPoints = () => {
      if (!isRevealing || userPath.length === 0) return '';
      // Map user clicked values back to node positions
      const points = userPath.map(val => {
          const n = allNodes.find(node => node.val === val);
          if(!n) return null;
          const x = (n.col / gridConfig.cols) * 100 + (1/gridConfig.cols)*50; 
          const y = (n.row / gridConfig.rows) * 100 + (1/gridConfig.rows)*50;
          return `${x},${y}`;
      }).filter(p => p !== null);
      
      return points.join(' ');
  }

  const getRank = () => {
      if (level > 15) return "AI Supercomputer";
      if (level > 10) return "Silverback";
      if (level > 7) return "Chimpanzee";
      if (level > 5) return "Macaque";
      return "Human";
  }

  return (
    <div className="max-w-4xl mx-auto select-none relative">
       
       <CountdownOverlay isActive={phase === 'countdown'} onComplete={startLevelPlay} />

       {phase === 'intro' && (
           <div className="text-center py-16 animate-in fade-in zoom-in">
               <div className="w-24 h-24 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
                   <Brain size={48} className="text-primary-500" />
               </div>
               <h1 className="text-4xl font-bold text-white mb-4">Are You Smarter Than a Chimp?</h1>
               <p className="text-zinc-400 text-lg max-w-lg mx-auto mb-8 leading-relaxed">
                   Based on research by Tetsuro Matsuzawa. 
                   <br/>Click numbers in order (1, 2, 3...). 
                   <br/>After clicking '1', numbers are masked.
               </p>
               <button onClick={initiateTest} className="btn-primary">Start Challenge</button>
           </div>
       )}

       {(phase === 'play' || phase === 'countdown') && (
           <div className="animate-in fade-in">
               {/* HUD */}
               <div className="flex justify-between items-end mb-6 px-4 border-b border-zinc-800 pb-4">
                   <div>
                       <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Numbers</div>
                       <div className="text-3xl font-bold text-white font-mono">{level}</div>
                   </div>
                   <div className="flex items-center gap-4">
                       <button onClick={() => setSoundEnabled(!soundEnabled)} className="text-zinc-500 hover:text-white transition-colors">
                           {soundEnabled ? <Volume2 size={20}/> : <VolumeX size={20}/>}
                       </button>
                       <div className="flex gap-2">
                           {[...Array(MAX_STRIKES)].map((_, i) => (
                               <div key={i} className="text-red-500 transition-all">
                                   {i < (MAX_STRIKES - strikes) ? <Heart size={24} fill="currentColor" /> : <HeartCrack size={24} className="opacity-20" />}
                               </div>
                           ))}
                       </div>
                   </div>
               </div>

               {/* Game Board */}
               <div 
                  className="relative w-full bg-[#0c0c0e] border border-zinc-800 rounded-xl shadow-2xl mx-auto max-w-[800px] overflow-hidden transition-all duration-500"
                  style={{ aspectRatio: `${gridConfig.cols}/${gridConfig.rows}` }}
                >
                   <div className="absolute inset-0 bg-grid opacity-5 pointer-events-none"></div>

                   {/* Reveal Path Overlay */}
                   {isRevealing && (
                       <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 animate-in fade-in duration-1000" preserveAspectRatio="none" viewBox="0 0 100 100">
                           {/* Correct Path (Green) */}
                           <polyline 
                               points={getCorrectPathPoints()}
                               fill="none"
                               stroke="#10b981"
                               strokeWidth="0.5"
                               strokeOpacity="0.6"
                               strokeDasharray="1 1"
                           />
                           
                           {/* User Error Path (Red) */}
                           <polyline 
                               points={getUserPathPoints()}
                               fill="none"
                               stroke="#ef4444"
                               strokeWidth="0.8"
                               strokeOpacity="0.8"
                           />
                           
                           {/* Ghost Animation Pulse along Correct Path */}
                           <circle r="1" fill="#10b981">
                               <animateMotion dur="2s" repeatCount="indefinite" path={`M ${getCorrectPathPoints().replace(/ /g, ' L ')}`} />
                           </circle>
                       </svg>
                   )}

                   {/* Normal Play Nodes */}
                   {!isRevealing && nodes.map((node) => (
                       <div
                          key={node.val}
                          onMouseDown={(e) => { e.preventDefault(); handleNodeClick(node); }}
                          onTouchStart={(e) => { e.preventDefault(); handleNodeClick(node); }}
                          className={`
                              absolute flex items-center justify-center rounded-lg cursor-pointer transition-all duration-100 active:scale-90 z-20
                              ${isMasked 
                                  ? 'bg-white/10 backdrop-blur-sm border border-white/40 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:bg-white/20' 
                                  : 'bg-white border-2 border-white text-black shadow-[0_4px_0_#ccc] active:shadow-none active:translate-y-[4px]'}
                          `}
                          style={{
                              left: `${(node.col / gridConfig.cols) * 100}%`,
                              top: `${(node.row / gridConfig.rows) * 100}%`,
                              width: `${(1/gridConfig.cols)*85}%`,
                              height: `${(1/gridConfig.rows)*85}%`,
                              marginLeft: `${(1/gridConfig.cols)*7.5}%`,
                              marginTop: `${(1/gridConfig.rows)*7.5}%`,
                          }}
                       >
                           {!isMasked && (
                               <span className="text-2xl md:text-4xl font-black font-sans select-none">{node.val}</span>
                           )}
                       </div>
                   ))}

                   {/* Reveal Mode Nodes (Ghost Replay) */}
                   {isRevealing && (
                       <>
                           {allNodes.map((node) => (
                               <div
                                  key={node.val}
                                  className={`
                                      absolute flex items-center justify-center rounded-lg border-2 z-20 transition-all duration-500
                                      ${node.val < nextNum ? 'bg-emerald-900/50 border-emerald-700 text-emerald-500 opacity-50' : ''}
                                      ${node.val === nextNum ? 'bg-emerald-500 text-black border-emerald-500' : ''}
                                      ${node.val === wrongClickId ? 'bg-red-500 text-white border-red-500 animate-shake' : ''}
                                      ${node.val > nextNum ? 'bg-zinc-800/50 border-zinc-600 text-zinc-500' : ''}
                                  `}
                                  style={{
                                      left: `${(node.col / gridConfig.cols) * 100}%`,
                                      top: `${(node.row / gridConfig.rows) * 100}%`,
                                      width: `${(1/gridConfig.cols)*85}%`,
                                      height: `${(1/gridConfig.rows)*85}%`,
                                      marginLeft: `${(1/gridConfig.cols)*7.5}%`,
                                      marginTop: `${(1/gridConfig.rows)*7.5}%`,
                                  }}
                               >
                                   <span className="text-2xl md:text-4xl font-bold">{node.val}</span>
                               </div>
                           ))}
                           <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                               <div className="bg-black/90 px-6 py-4 rounded-xl border border-red-500/50 text-red-500 font-bold text-xl uppercase tracking-widest animate-in zoom-in flex flex-col items-center gap-2">
                                   <Eye size={24} />
                                   <span>Memory Breach</span>
                                   <span className="text-xs text-zinc-500 font-mono">Retrying level...</span>
                               </div>
                           </div>
                       </>
                   )}
               </div>
           </div>
       )}

       {phase === 'result' && (
           <div className="text-center py-16 animate-in zoom-in">
               <Trophy size={64} className="mx-auto text-yellow-500 mb-6" />
               <h2 className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-2">Working Memory Capacity</h2>
               <div className="text-6xl font-bold text-white mb-2">{level} <span className="text-2xl text-zinc-600">Items</span></div>
               <div className="text-xl font-bold text-primary-400 mb-6 uppercase tracking-widest">Rank: {getRank()}</div>
               
               <p className="text-zinc-400 mb-8 max-w-sm mx-auto">
                   {level > 9 ? "Superhuman. You rival Ayumu the chimp." :
                    level > 6 ? "Excellent. Well above human average." :
                    "Average human range (5-7)."}
               </p>
               
               <button onClick={initiateTest} className="btn-secondary flex items-center justify-center gap-2 mx-auto">
                   <RotateCcw size={16} /> Try Again
               </button>
           </div>
       )}

    </div>
  );
};

export default ChimpTest;
