
import React, { useState, useEffect, useRef } from 'react';
import { Palette, Play, AlertCircle, PieChart } from 'lucide-react';
import { saveStat } from '../../lib/core';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const ColorHueTest: React.FC = () => {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [phase, setPhase] = useState<'start' | 'play' | 'end'>('start');
  const [shake, setShake] = useState(false);
  
  // Game Data
  const [gridSize, setGridSize] = useState(2);
  const [colors, setColors] = useState({ base: '', diff: '' });
  const [diffIndex, setDiffIndex] = useState(0);
  const [currentSpectrum, setCurrentSpectrum] = useState(''); // Red, Green, Blue, etc.

  // Stats Tracking (Total correct per spectrum)
  const [spectrumStats, setSpectrumStats] = useState<Record<string, {hits: number, total: number}>>({
      'Red': {hits: 0, total: 0},
      'Yellow': {hits: 0, total: 0},
      'Green': {hits: 0, total: 0},
      'Cyan': {hits: 0, total: 0},
      'Blue': {hits: 0, total: 0},
      'Magenta': {hits: 0, total: 0},
  });

  const timerRef = useRef<number | null>(null);

  // Timer Logic
  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
       timerRef.current = window.setTimeout(() => setTimeLeft(t => t - 1), 1000);
    } else if (isPlaying && timeLeft <= 0) {
       endGame();
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isPlaying, timeLeft]);

  // Level Gen
  useEffect(() => {
    if (isPlaying) generateLevel();
  }, [level, isPlaying]);

  const generateLevel = () => {
    // Grid: 2x2 -> 8x8 max
    const size = Math.min(8, Math.floor(Math.sqrt(level + 3)));
    setGridSize(size);

    // Cycle spectrums to ensure balanced data
    const hues = [0, 60, 120, 180, 240, 300]; // R, Y, G, C, B, M
    const names = ['Red', 'Yellow', 'Green', 'Cyan', 'Blue', 'Magenta'];
    
    // Pick based on level to cycle through
    const typeIdx = (level - 1) % 6;
    const baseHue = hues[typeIdx] + (Math.random() * 20 - 10); // Jitter +-10
    const catName = names[typeIdx];
    setCurrentSpectrum(catName);

    // Difficulty: Hue difference (Degrees)
    // Starts at 40deg, decays to ~2deg
    const hueDiff = Math.max(2, 40 * Math.pow(0.85, level - 1)); 
    
    const isClockwise = Math.random() > 0.5;
    const targetHue = isClockwise ? baseHue + hueDiff : baseHue - hueDiff;

    // ISO-LUMINANT COLORS: Fixed Saturation and Lightness
    // Saturation 70-80%, Lightness 50% (Peak chroma)
    const sat = 75;
    const light = 50;

    const baseColor = `hsl(${baseHue}, ${sat}%, ${light}%)`;
    const diffColor = `hsl(${targetHue}, ${sat}%, ${light}%)`;

    setColors({ base: baseColor, diff: diffColor });
    setDiffIndex(Math.floor(Math.random() * (size * size)));
  };

  const handleTileClick = (index: number) => {
    if (index === diffIndex) {
      // Correct
      setSpectrumStats(prev => ({
          ...prev,
          [currentSpectrum]: { hits: prev[currentSpectrum].hits + 1, total: prev[currentSpectrum].total + 1 }
      }));
      
      setLevel(l => l + 1);
      setScore(s => s + 1);
      setTimeLeft(t => Math.min(60, t + 1)); 
    } else {
      // Penalty
      setSpectrumStats(prev => ({
          ...prev,
          [currentSpectrum]: { hits: prev[currentSpectrum].hits, total: prev[currentSpectrum].total + 1 }
      }));
      
      setShake(true);
      setTimeout(() => setShake(false), 400);
      setTimeLeft(t => Math.max(0, t - 3));
    }
  };

  const endGame = () => {
    setIsPlaying(false);
    setPhase('end');
    const finalScore = Math.min(100, Math.round((score / 40) * 100)); // ~40 levels is pro
    saveStat('color-hue', finalScore);
  };

  const startGame = () => {
    setLevel(1);
    setScore(0);
    setTimeLeft(60);
    setSpectrumStats({
        'Red': {hits: 0, total: 0},
        'Yellow': {hits: 0, total: 0},
        'Green': {hits: 0, total: 0},
        'Cyan': {hits: 0, total: 0},
        'Blue': {hits: 0, total: 0},
        'Magenta': {hits: 0, total: 0},
    });
    setPhase('play');
    setIsPlaying(true);
  };

  const getRadarData = () => {
      return Object.entries(spectrumStats).map(([key, val]: [string, { hits: number, total: number }]) => ({
          subject: key,
          A: val.total === 0 ? 100 : Math.round((val.hits / val.total) * 100), // Default 100 if untestable
          fullMark: 100
      }));
  };

  return (
    <div className="max-w-xl mx-auto flex flex-col items-center select-none">
      
      {phase === 'start' && (
          <div className="text-center py-12 animate-in fade-in">
             <div className="w-24 h-24 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Palette size={40} className="text-pink-500" />
             </div>
             <h2 className="text-3xl font-bold text-white mb-2">Farnsworth Hue Test</h2>
             <p className="text-zinc-400 mb-8 max-w-sm mx-auto">
                Find the odd colored tile. 
                <br/>This test maintains <strong>Iso-luminance</strong> to test pure chromatic sensitivity across the spectrum.
             </p>
             <button onClick={startGame} className="btn-primary flex items-center gap-2 mx-auto">
                <Play size={18} /> Start Discrimination
             </button>
          </div>
      )}

      {phase === 'play' && (
          <div className="w-full">
             <div className="flex justify-between items-center mb-6 px-4">
                <div className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-full font-mono text-xl text-white font-bold">
                   Score: {score}
                </div>
                <div className="relative w-12 h-12 flex items-center justify-center">
                    {/* SVG Timer Ring */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle cx="24" cy="24" r="20" fill="none" stroke="#27272a" strokeWidth="4" />
                        <circle 
                            cx="24" cy="24" r="20" fill="none" stroke={timeLeft < 10 ? '#ef4444' : '#06b6d4'} strokeWidth="4"
                            strokeDasharray="125.6"
                            strokeDashoffset={125.6 - ((timeLeft/60) * 125.6)}
                            className="transition-all duration-1000 ease-linear"
                        />
                    </svg>
                    <span className={`text-xs font-bold ${timeLeft < 10 ? 'text-red-500' : 'text-white'}`}>{timeLeft}</span>
                </div>
             </div>

             <div 
               className={`grid gap-2 p-4 bg-zinc-900 rounded-lg shadow-2xl aspect-square w-full max-w-[400px] mx-auto border border-zinc-800 transition-transform duration-100 ${shake ? 'translate-x-2' : ''}`}
               style={{ 
                 gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                 gridTemplateRows: `repeat(${gridSize}, 1fr)`
               }}
             >
               {Array.from({ length: gridSize * gridSize }).map((_, i) => (
                 <button
                   key={i}
                   onMouseDown={() => handleTileClick(i)} // Faster response than onClick
                   className="rounded-md transition-transform active:scale-95 duration-75 shadow-sm hover:brightness-110"
                   style={{ 
                     backgroundColor: i === diffIndex ? colors.diff : colors.base 
                   }}
                 />
               ))}
             </div>
          </div>
      )}

      {phase === 'end' && (
          <div className="text-center py-12 animate-in zoom-in w-full">
             <AlertCircle size={64} className="mx-auto text-zinc-600 mb-6" />
             <div className="text-6xl font-bold text-white mb-2">{score}</div>
             <p className="text-zinc-500 uppercase font-mono tracking-widest mb-8">Final Score</p>
             
             {/* Radar Chart */}
             <div className="h-64 w-full relative mb-8">
                 <div className="absolute top-0 right-0 text-[10px] text-zinc-500 flex items-center gap-1 font-mono"><PieChart size={12}/> SPECTRAL_SENSITIVITY</div>
                 <ResponsiveContainer width="100%" height="100%">
                     <RadarChart cx="50%" cy="50%" outerRadius="70%" data={getRadarData()}>
                         <PolarGrid stroke="#333" />
                         <PolarAngleAxis dataKey="subject" tick={{ fill: '#71717a', fontSize: 10 }} />
                         <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                         <Radar name="Accuracy" dataKey="A" stroke="#a855f7" strokeWidth={2} fill="#a855f7" fillOpacity={0.3} />
                     </RadarChart>
                 </ResponsiveContainer>
             </div>

             <div className="bg-zinc-900/50 p-4 rounded border border-zinc-800 mb-8 max-w-sm mx-auto text-sm text-zinc-400">
                {score > 45 ? "Superior Color Vision. You can detect hue shifts of < 2 degrees." : 
                 score > 30 ? "High Average. Suitable for design work." : 
                 "Average. Color sensitivity is within normal range."}
             </div>

             <button onClick={startGame} className="btn-primary">Try Again</button>
          </div>
      )}

    </div>
  );
};

export default ColorHueTest;
