
import React, { useState, useEffect } from 'react';
import { Brain, Trophy, RotateCcw, Banana, Volume2, VolumeX } from 'lucide-react';
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
  // Keep a full copy for reveal phase
  const [allNodes, setAllNodes] = useState<Node[]>([]);
  
  const [nextNum, setNextNum] = useState(1);
  const [isMasked, setIsMasked] = useState(false);
  const [lives, setLives] = useState(3);
  
  // Audio state
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // New state for reveal logic
  const [isRevealing, setIsRevealing] = useState(false);
  const [wrongClickId, setWrongClickId] = useState<number | null>(null);

  const GRID_COLS = 8;
  const GRID_ROWS = 5;

  const initiateTest = () => {
      setLives(3);
      setLevel(4);
      prepareLevel(4);
      setPhase('countdown');
  };

  const prepareLevel = (numCount: number) => {
      setNextNum(1);
      setIsMasked(false);
      setIsRevealing(false);
      setWrongClickId(null);
      
      const positions = new Set<string>();
      const newNodes: Node[] = [];
      
      for(let i=1; i<=numCount; i++) {
          let r, c, key;
          do {
              r = Math.floor(Math.random() * GRID_ROWS);
              c = Math.floor(Math.random() * GRID_COLS);
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
      setPhase('play'); // No countdown between levels, keeps flow
  };

  const retryLevel = () => {
      prepareLevel(level);
      setPhase('play');
  };

  const handleNodeClick = (clickedNode: Node) => {
      if (isRevealing) return;

      // Correct Click
      if (clickedNode.val === nextNum) {
          if (soundEnabled) playUiSound('click');
          
          // Trigger Masking on first click
          if (clickedNode.val === 1) {
              setIsMasked(true);
          }

          setNextNum(n => n + 1);
          // Just visually hide/remove the node from playable set
          setNodes(prev => prev.filter(n => n.val !== clickedNode.val));

          // Level Complete
          if (nodes.length === 1) {
              if (soundEnabled) playUiSound('success');
              setTimeout(nextLevel, 500);
          }
      } 
      // Incorrect Click
      else {
          if (soundEnabled) playUiSound('fail');
          setLives(l => l - 1);
          setWrongClickId(clickedNode.val);
          setIsRevealing(true); // Trigger reveal mode
          
          setTimeout(() => {
              if (lives - 1 <= 0) {
                  finish();
              } else {
                  retryLevel();
              }
          }, 3000); // 3s to review mistakes
      }
  };

  const finish = () => {
      setPhase('result');
      const raw = Math.max(0, level - 4);
      const score = Math.min(100, Math.round((raw / 16) * 100));
      saveStat('chimp-test', score);
  };

  // Helper to generate SVG path points for the reveal line
  const getPathPoints = () => {
      if (!isRevealing) return '';
      // Sort nodes by val 1..N
      const sorted = [...allNodes].sort((a,b) => a.val - b.val);
      
      return sorted.map(n => {
          // Center X: col * 100 + 50 (if grid is 100 wide units)
          const x = (n.col / GRID_COLS) * 100 + (1/GRID_COLS)*50; 
          const y = (n.row / GRID_ROWS) * 100 + (1/GRID_ROWS)*50;
          return `${x},${y}`;
      }).join(' ');
  };

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
                   This test is based on the research of Tetsuro Matsuzawa. 
                   <br/>Click the numbers in order (1, 2, 3...). 
                   <br/><strong className="text-white">Crucial:</strong> After you click '1', all other numbers will be masked. You must remember their positions.
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
                           {[...Array(3)].map((_, i) => (
                               <Banana 
                                  key={i} 
                                  size={24} 
                                  className={`transition-all ${i < lives ? 'text-yellow-500 fill-yellow-500' : 'text-zinc-800 fill-zinc-800'}`} 
                               />
                           ))}
                       </div>
                   </div>
               </div>

               {/* Game Board - Responsive Aspect Ratio */}
               <div className="relative w-full aspect-[4/5] md:aspect-[8/5] bg-[#0c0c0e] border border-zinc-800 rounded-xl shadow-2xl mx-auto max-w-[800px] overflow-hidden">
                   <div className="absolute inset-0 bg-grid opacity-5 pointer-events-none"></div>

                   {/* Reveal Path Overlay */}
                   {isRevealing && (
                       <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" preserveAspectRatio="none" viewBox="0 0 100 100">
                           <polyline 
                               points={getPathPoints()}
                               fill="none"
                               stroke="#ef4444"
                               strokeWidth="0.5"
                               strokeOpacity="0.5"
                               strokeDasharray="2 1"
                           />
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
                              left: `${(node.col / GRID_COLS) * 100}%`,
                              top: `${(node.row / GRID_ROWS) * 100}%`,
                              width: `${(1/GRID_COLS)*85}%`,
                              height: `${(1/GRID_ROWS)*85}%`,
                              marginLeft: `${(1/GRID_COLS)*7.5}%`,
                              marginTop: `${(1/GRID_ROWS)*7.5}%`,
                          }}
                       >
                           {!isMasked && (
                               <span className="text-2xl md:text-4xl font-black font-sans select-none">{node.val}</span>
                           )}
                       </div>
                   ))}

                   {/* Reveal Mode Nodes (Re-render everything to show correct order) */}
                   {isRevealing && (
                       <>
                           {/* Show full sequence */}
                           {allNodes.map((node) => (
                               <div
                                  key={node.val}
                                  className={`
                                      absolute flex items-center justify-center rounded-lg border-2 z-20
                                      ${node.val < nextNum ? 'bg-emerald-900/50 border-emerald-700 text-emerald-500 opacity-50' : ''}
                                      ${node.val === nextNum ? 'bg-emerald-500 text-black border-emerald-500' : ''}
                                      ${node.val === wrongClickId ? 'bg-red-500 text-white border-red-500 animate-shake' : ''}
                                      ${node.val > nextNum ? 'bg-zinc-800/50 border-zinc-600 text-zinc-500' : ''}
                                  `}
                                  style={{
                                      left: `${(node.col / GRID_COLS) * 100}%`,
                                      top: `${(node.row / GRID_ROWS) * 100}%`,
                                      width: `${(1/GRID_COLS)*85}%`,
                                      height: `${(1/GRID_ROWS)*85}%`,
                                      marginLeft: `${(1/GRID_COLS)*7.5}%`,
                                      marginTop: `${(1/GRID_ROWS)*7.5}%`,
                                  }}
                               >
                                   <span className="text-2xl md:text-4xl font-bold">{node.val}</span>
                               </div>
                           ))}
                           <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                               <div className="bg-black/80 px-6 py-3 rounded-xl border border-red-500/50 text-red-500 font-bold text-xl uppercase tracking-widest animate-in zoom-in">
                                   Strike!
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
               <div className="text-6xl font-bold text-white mb-6">{level} <span className="text-2xl text-zinc-600">Items</span></div>
               
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
