import React, { useRef, useEffect, useState } from 'react';
import { Eye, Check, X, MousePointer2, RefreshCcw } from 'lucide-react';
import { saveStat } from '../../lib/core';

const AstigmatismTest: React.FC = () => {
  const [phase, setPhase] = useState<'intro' | 'test' | 'result'>('intro');
  const [selectedAxis, setSelectedAxis] = useState<number | null>(null); // 0-180 degrees
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (phase === 'test') {
      drawFanChart();
    }
  }, [phase, selectedAxis]);

  const drawFanChart = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) * 0.4;

      // Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);

      // Draw Lines
      ctx.lineCap = 'round';

      for (let i = 0; i < 12; i++) {
        const angleDeg = i * 30; // 0, 30, 60...
        const angleRad = angleDeg * (Math.PI / 180);
        
        // Highlight logic
        const isSelected = selectedAxis !== null && (angleDeg === selectedAxis || angleDeg === (selectedAxis + 180) % 360);
        
        ctx.strokeStyle = isSelected ? '#ef4444' : '#000000';
        ctx.lineWidth = isSelected ? 6 : 3;

        const startX = cx + Math.cos(angleRad) * (radius * 0.1);
        const startY = cy + Math.sin(angleRad) * (radius * 0.1);
        const endX = cx + Math.cos(angleRad) * radius;
        const endY = cy + Math.sin(angleRad) * radius;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        // Labels
        const labelX = cx + Math.cos(angleRad) * (radius * 1.15);
        const labelY = cy + Math.sin(angleRad) * (radius * 1.15);
        ctx.fillStyle = isSelected ? '#ef4444' : '#000000';
        ctx.font = isSelected ? 'bold 24px Arial' : 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Clock numbers
        let num = (i + 3) % 12;
        if (num === 0) num = 12;
        ctx.fillText(num.toString(), labelX, labelY);
      }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - (rect.width/2);
      const y = e.clientY - rect.top - (rect.height/2);
      
      // Calculate angle
      let angle = Math.atan2(y, x) * (180 / Math.PI);
      if (angle < 0) angle += 360;
      
      // Snap to nearest 30 deg
      const snapped = Math.round(angle / 30) * 30;
      const normalized = snapped % 180; // Astigmatism axis is 0-180 usually
      
      // Map back to 0-360 for drawing (just select one of the lines, e.g. 30 deg implies 30 and 210)
      // Visual feedback handles drawing both sides. We store the "Clock" angle basically.
      // Actually let's store 0-330 for exact clock line.
      const visualSnap = snapped % 360;
      
      setSelectedAxis(visualSnap);
  };

  const confirmResult = (hasIssue: boolean) => {
      if (!hasIssue) setSelectedAxis(null);
      setPhase('result');
      saveStat('astigmatism-test', hasIssue ? 60 : 100); 
  };

  return (
    <div className="max-w-xl mx-auto text-center select-none">
       {phase === 'intro' && (
          <div className="py-12 animate-in fade-in">
             <Eye size={64} className="mx-auto text-zinc-600 mb-6" />
             <h2 className="text-3xl font-bold text-white mb-2">Astigmatism Axis Finder</h2>
             <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                Screen for refractive errors.
                <br/>Cover one eye. If some lines appear <strong>darker</strong> or <strong>sharper</strong> than others, click them on the chart.
             </p>
             <button onClick={() => setPhase('test')} className="btn-primary">Start Screening</button>
          </div>
       )}

       {phase === 'test' && (
          <div className="animate-in fade-in">
             <div className="relative w-[350px] h-[350px] mx-auto mb-8 cursor-crosshair group">
                <canvas 
                    ref={canvasRef} 
                    width={350} height={350} 
                    onClick={handleCanvasClick}
                    className="rounded-full bg-white shadow-2xl"
                />
                {!selectedAxis && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="bg-black/80 text-white px-3 py-1 rounded text-xs">Click boldest line</span>
                    </div>
                )}
             </div>
             
             <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
                 <h3 className="text-lg text-white font-bold mb-4">What do you see?</h3>
                 
                 {selectedAxis !== null ? (
                     <div className="animate-in slide-in-from-bottom-2">
                         <div className="text-sm text-zinc-400 mb-4">
                             You selected the axis at <strong>{selectedAxis}°</strong>. 
                             <br/>This line appears darker/sharper to you?
                         </div>
                         <div className="flex gap-4 justify-center">
                             <button onClick={() => setSelectedAxis(null)} className="btn-secondary text-xs px-4 py-2">Reset</button>
                             <button onClick={() => confirmResult(true)} className="btn-primary text-xs px-6 py-2 border-red-500 bg-red-600 hover:bg-red-500 text-white">Yes, Confirm Issue</button>
                         </div>
                     </div>
                 ) : (
                     <div className="flex flex-col gap-3">
                         <button onClick={() => confirmResult(false)} className="p-4 bg-zinc-800 hover:bg-emerald-900/20 border border-zinc-700 hover:border-emerald-500 rounded transition-all flex items-center justify-center gap-2 group">
                             <Check className="text-zinc-500 group-hover:text-emerald-500" size={18}/>
                             <span className="text-zinc-300 group-hover:text-white">All lines look equal</span>
                         </button>
                         <div className="text-xs text-zinc-500 mt-2 flex items-center justify-center gap-2">
                             <MousePointer2 size={12}/>
                             <span>Click the chart if lines look uneven</span>
                         </div>
                     </div>
                 )}
             </div>
          </div>
       )}

       {phase === 'result' && (
          <div className="py-12 animate-in zoom-in">
             <h2 className="text-3xl font-bold text-white mb-4">{selectedAxis !== null ? "Astigmatism Detected" : "Normal Vision"}</h2>
             
             {selectedAxis !== null && (
                 <div className="mb-8">
                     <div className="text-6xl font-bold text-red-500 mb-2">{selectedAxis}°</div>
                     <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Estimated Axis</span>
                 </div>
             )}

             <p className="text-zinc-400 mb-8 max-w-md mx-auto leading-relaxed">
                {selectedAxis !== null
                   ? "You identified a specific axis where lines appear sharper or darker. This directional blur is the hallmark of astigmatism."
                   : "If all radiating lines appeared equally black and sharp, your cornea is likely spherical (no astigmatism)."
                }
             </p>
             
             <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded text-xs text-zinc-500 mb-8 text-left">
                <strong>Note:</strong> Repeat this test with your other eye. If you wear glasses, test with them ON to check your prescription accuracy.
             </div>
             
             <button onClick={() => { setPhase('intro'); setSelectedAxis(null); }} className="btn-secondary flex items-center justify-center gap-2 mx-auto">
                <RefreshCcw size={16}/> Restart
             </button>
          </div>
       )}
    </div>
  );
};

export default AstigmatismTest;