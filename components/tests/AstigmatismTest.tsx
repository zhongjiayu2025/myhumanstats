import React, { useRef, useEffect, useState } from 'react';
import { Eye, Check, X } from 'lucide-react';
import { saveStat } from '../../lib/core';

const AstigmatismTest: React.FC = () => {
  const [phase, setPhase] = useState<'intro' | 'test' | 'result'>('intro');
  const [hasAstigmatism, setHasAstigmatism] = useState<boolean | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (phase === 'test') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) * 0.4;

      // Draw background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);

      // Draw Lines
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#000000';

      for (let i = 0; i < 12; i++) {
        const angle = (i * 30) * (Math.PI / 180);
        const startX = cx + Math.cos(angle) * (radius * 0.1);
        const startY = cy + Math.sin(angle) * (radius * 0.1);
        const endX = cx + Math.cos(angle) * radius;
        const endY = cy + Math.sin(angle) * radius;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        // Labels
        const labelX = cx + Math.cos(angle) * (radius * 1.15);
        const labelY = cy + Math.sin(angle) * (radius * 1.15);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Clock numbers
        let num = (i + 3) % 12;
        if (num === 0) num = 12;
        ctx.fillText(num.toString(), labelX, labelY);
      }
    }
  }, [phase]);

  const handleResult = (val: boolean) => {
      setHasAstigmatism(val);
      setPhase('result');
      // If they have astigmatism, we can't really "score" it well online, 
      // but for dashboard consistency, "Healthy" = 100, "Issue" = 50?
      saveStat('astigmatism-test', val ? 60 : 100); 
  };

  return (
    <div className="max-w-xl mx-auto text-center">
       {phase === 'intro' && (
          <div className="py-12 animate-in fade-in">
             <Eye size={64} className="mx-auto text-zinc-600 mb-6" />
             <h2 className="text-3xl font-bold text-white mb-2">Astigmatism Test</h2>
             <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                Do you see some lines darker or thicker than others?
                <br/>Cover one eye at a time and look at the center of the image.
             </p>
             <button onClick={() => setPhase('test')} className="btn-primary">Start Screening</button>
          </div>
       )}

       {phase === 'test' && (
          <div className="animate-in fade-in">
             <div className="bg-white rounded-full p-4 w-[350px] h-[350px] mx-auto mb-8 shadow-2xl flex items-center justify-center overflow-hidden">
                <canvas ref={canvasRef} width={350} height={350} />
             </div>
             
             <h3 className="text-xl text-white font-bold mb-4">What do you see?</h3>
             <div className="grid grid-cols-2 gap-4">
                <button onClick={() => handleResult(false)} className="p-4 border border-zinc-700 hover:border-emerald-500 hover:bg-emerald-900/20 bg-zinc-900 rounded-lg transition-all text-left group">
                    <div className="flex items-center gap-2 mb-2 text-emerald-400 font-bold"><Check size={20}/> All Lines Equal</div>
                    <p className="text-xs text-zinc-500 group-hover:text-zinc-400">Lines appear equally dark and thick.</p>
                </button>
                <button onClick={() => handleResult(true)} className="p-4 border border-zinc-700 hover:border-yellow-500 hover:bg-yellow-900/20 bg-zinc-900 rounded-lg transition-all text-left group">
                    <div className="flex items-center gap-2 mb-2 text-yellow-400 font-bold"><X size={20}/> Some Darker</div>
                    <p className="text-xs text-zinc-500 group-hover:text-zinc-400">Some lines look sharper or darker than others.</p>
                </button>
             </div>
             <p className="mt-6 text-xs text-zinc-600 font-mono uppercase">Please test both eyes independently</p>
          </div>
       )}

       {phase === 'result' && (
          <div className="py-12 animate-in zoom-in">
             <h2 className="text-3xl font-bold text-white mb-4">{hasAstigmatism ? "Possible Astigmatism" : "Normal Vision"}</h2>
             <p className="text-zinc-400 mb-8 max-w-md mx-auto leading-relaxed">
                {hasAstigmatism 
                   ? "Seeing some lines darker or clearer than others is a classic sign of Astigmatism. Your cornea may be shaped more like a football than a basketball, causing refractive errors along specific axes."
                   : "If all radiating lines appeared equally black and sharp, you likely do not have significant astigmatism."
                }
             </p>
             <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded text-xs text-zinc-500 mb-8 text-left">
                <strong>Disclaimer:</strong> This is a screening tool, not a medical diagnosis. Please consult an optometrist for a comprehensive eye exam.
             </div>
             <button onClick={() => setPhase('intro')} className="btn-secondary">Restart</button>
          </div>
       )}
    </div>
  );
};

export default AstigmatismTest;