import React, { useRef, useEffect, useState } from 'react';
import { Download, Share2, Loader2 } from 'lucide-react';

interface ShareCardProps {
  testName: string;
  scoreDisplay: string; // e.g. "17,400 Hz"
  resultLabel: string;  // e.g. "Hearing Age: < 20 Yrs"
  color?: string;       // Hex code for accent
}

const ShareCard: React.FC<ShareCardProps> = ({ 
  testName, 
  scoreDisplay, 
  resultLabel,
  color = '#06b6d4' 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerated, setIsGenerated] = useState(false);

  useEffect(() => {
    generateCard();
  }, [testName, scoreDisplay, resultLabel]);

  const generateCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Setup Canvas (Open Graph Size: 1200x630)
    const width = 1200;
    const height = 630;
    canvas.width = width;
    canvas.height = height;

    // 2. Background
    ctx.fillStyle = '#050505'; // Zinc-950
    ctx.fillRect(0, 0, width, height);

    // 3. Grid Pattern
    ctx.strokeStyle = '#18181b'; // Zinc-900
    ctx.lineWidth = 2;
    const gridSize = 60;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    // 4. Accent Glow (Top Right & Bottom Left)
    const grad1 = ctx.createRadialGradient(width, 0, 0, width, 0, 600);
    grad1.addColorStop(0, `${color}33`); // 20% opacity
    grad1.addColorStop(1, 'transparent');
    ctx.fillStyle = grad1;
    ctx.fillRect(0, 0, width, height);

    // 5. Text Drawing
    ctx.textAlign = 'center';
    
    // "VERIFIED RESULT" Badge
    ctx.fillStyle = '#27272a';
    ctx.roundRect(width/2 - 100, 60, 200, 40, 20);
    ctx.fill();
    ctx.strokeStyle = '#3f3f46';
    ctx.stroke();
    ctx.fillStyle = '#a1a1aa';
    ctx.font = 'bold 16px "Courier New", monospace';
    ctx.fillText('VERIFIED RESULT', width/2, 86);

    // Main Score
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 140px "Inter", sans-serif';
    ctx.shadowColor = color;
    ctx.shadowBlur = 30;
    ctx.fillText(scoreDisplay, width/2, height/2 + 20);
    ctx.shadowBlur = 0;

    // Result Label
    ctx.fillStyle = color;
    ctx.font = 'bold 40px "Inter", sans-serif';
    ctx.fillText(resultLabel.toUpperCase(), width/2, height/2 + 90);

    // Test Name
    ctx.fillStyle = '#71717a';
    ctx.font = '30px "Courier New", monospace';
    ctx.fillText(`// MODULE: ${testName.toUpperCase()}`, width/2, height/2 - 100);

    // Footer / Branding
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px "Inter", sans-serif';
    ctx.fillText('MyHumanStats.org', width/2, height - 50);
    
    ctx.fillStyle = '#52525b';
    ctx.font = '20px "Inter", sans-serif';
    ctx.fillText('Quantify Your Existence', width/2, height - 25);

    // Tech corners
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    const cornerSize = 40;
    const pad = 30;
    // TL
    ctx.beginPath(); ctx.moveTo(pad, pad + cornerSize); ctx.lineTo(pad, pad); ctx.lineTo(pad + cornerSize, pad); ctx.stroke();
    // BR
    ctx.beginPath(); ctx.moveTo(width-pad, height-pad-cornerSize); ctx.lineTo(width-pad, height-pad); ctx.lineTo(width-pad-cornerSize, height-pad); ctx.stroke();

    setIsGenerated(true);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `MHS-${testName.replace(/\s+/g, '-')}-Result.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="mt-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-black/50 border border-zinc-800 p-6 rounded-lg clip-corner-lg text-center">
        <h3 className="text-zinc-400 text-xs font-mono uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
           <Share2 size={14} /> Social Asset Generator
        </h3>
        
        {/* Hidden Canvas for generation, Image for display */}
        <div className="relative w-full aspect-[1.91/1] bg-black mb-6 border border-zinc-800 rounded overflow-hidden group">
           <canvas ref={canvasRef} className="w-full h-full object-contain" />
           <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={handleDownload}
                className="btn-primary flex items-center gap-2 transform scale-90 group-hover:scale-100 transition-transform"
              >
                 <Download size={18} /> Download Image
              </button>
           </div>
        </div>

        <p className="text-[10px] text-zinc-600 font-mono mb-4">
           GENERATED_ON_CLIENT // {new Date().toISOString().split('T')[0]}
        </p>
      </div>
    </div>
  );
};

export default ShareCard;