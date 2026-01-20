import React, { useState, useEffect, useRef } from 'react';
import { Monitor, Zap, Info, Activity } from 'lucide-react';
import SEO from '../../components/SEO';
import Breadcrumbs from '../../components/Breadcrumbs';

const RefreshRatePage: React.FC = () => {
  const [fps, setFps] = useState(0);
  const [frames, setFrames] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [motionBlur, setMotionBlur] = useState(false);
  
  const requestRef = useRef<number>();
  const movingBoxRef = useRef<HTMLDivElement>(null);

  const animate = (time: number) => {
    if (!startTime) setStartTime(time);
    
    setFrames(prev => {
        const count = prev + 1;
        // Update FPS every second roughly
        if (time - startTime > 1000) {
            const calculatedFps = Math.round((count * 1000) / (time - startTime));
            setFps(calculatedFps);
            setStartTime(time);
            return 0;
        }
        return count;
    });

    // Move box for visual confirmation
    if (movingBoxRef.current) {
        const speed = 0.5; // pixels per ms
        const pos = (time * speed) % (window.innerWidth - 100);
        movingBoxRef.current.style.transform = `translateX(${pos}px)`;
    }

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isRunning) {
        setStartTime(performance.now());
        setFrames(0);
        requestRef.current = requestAnimationFrame(animate);
    } else {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isRunning]);

  // Auto-start on mount
  useEffect(() => {
      setIsRunning(true);
      return () => setIsRunning(false);
  }, []);

  const frameTime = fps > 0 ? (1000 / fps).toFixed(1) : '--';

  return (
    <div className="w-full">
       <div className="max-w-4xl mx-auto pt-12 px-4 animate-in fade-in">
          <SEO 
             title="Refresh Rate Test (Hz Checker)"
             description="Check your monitor's refresh rate (Hz) and frame time online. See the difference between 60Hz, 120Hz, and 144Hz."
          />
          <Breadcrumbs items={[{ label: 'Tools', path: '/tools' }, { label: 'Hz Checker' }]} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
             <div>
                <h1 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
                   <Monitor className="text-primary-500" /> Screen Refresh Rate
                </h1>
                <p className="text-zinc-400 leading-relaxed mb-6">
                   This tool measures your browser's <strong>frames per second (FPS)</strong>, which typically syncs with your monitor's refresh rate (Hz).
                </p>
                
                <div className="flex gap-4 mb-8">
                   <div className="bg-black border border-zinc-800 p-6 rounded-lg text-center flex-1">
                      <div className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Current Rate</div>
                      <div className="text-5xl font-mono font-bold text-white text-glow">{fps > 0 ? fps : '--'} <span className="text-xl text-zinc-600">Hz</span></div>
                   </div>
                   <div className="bg-black border border-zinc-800 p-6 rounded-lg text-center flex-1">
                      <div className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Frame Time</div>
                      <div className="text-5xl font-mono font-bold text-primary-400">{frameTime} <span className="text-xl text-zinc-600">ms</span></div>
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="flex items-start gap-3 p-4 bg-zinc-900/50 border border-zinc-800 rounded">
                      <Zap className="text-yellow-500 shrink-0 mt-1" size={18} />
                      <div>
                         <h3 className="text-sm font-bold text-white">Impact on Reaction Time</h3>
                         <p className="text-xs text-zinc-400 mt-1">
                            A 60Hz screen updates every 16.7ms. A 144Hz screen updates every 6.9ms. 
                            Upgrading to a higher Hz monitor can instantly improve your <a href="/test/reaction-time-test" className="text-primary-400 hover:underline">Reaction Time Test</a> score by ~10ms.
                         </p>
                      </div>
                   </div>
                </div>
             </div>

             <div className="bg-black border border-zinc-800 rounded-xl p-8 flex flex-col justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none"></div>
                
                <div className="relative z-10 text-center space-y-6">
                   <div className="inline-block p-4 rounded-full bg-zinc-900 border border-zinc-700 mb-2">
                      <Activity size={32} className={`text-zinc-400 ${isRunning ? 'animate-pulse' : ''}`} />
                   </div>
                   <div>
                      <h3 className="text-xl font-bold text-white">Motion Test</h3>
                      <p className="text-xs text-zinc-500 mt-2">Observe the UFO below. Higher Hz = Smoother Motion.</p>
                   </div>
                   
                   <div className="flex justify-center gap-2">
                      <button 
                         onClick={() => setMotionBlur(!motionBlur)} 
                         className={`px-4 py-2 text-xs border rounded ${motionBlur ? 'bg-primary-900/30 border-primary-500 text-primary-400' : 'bg-zinc-900 border-zinc-700 text-zinc-400'}`}
                      >
                         Simulate Motion Blur: {motionBlur ? 'ON' : 'OFF'}
                      </button>
                   </div>
                </div>
             </div>
          </div>
       </div>

       {/* Moving Test Track */}
       <div className="w-full bg-zinc-900 border-y border-zinc-800 h-32 relative overflow-hidden flex items-center mb-12">
          <div className="absolute inset-0 flex justify-between px-4 pointer-events-none">
             {Array.from({length: 20}).map((_, i) => (
                <div key={i} className="w-px h-full bg-zinc-800"></div>
             ))}
          </div>
          
          <div 
             ref={movingBoxRef}
             className="w-16 h-16 bg-primary-500 rounded-lg shadow-[0_0_20px_#06b6d4] flex items-center justify-center text-black font-bold text-xs z-10 will-change-transform"
             style={{ filter: motionBlur ? 'blur(4px)' : 'none' }}
          >
             {fps}Hz
          </div>
       </div>

       <div className="max-w-4xl mx-auto px-4 pb-12">
          <div className="border-t border-zinc-800 pt-8">
             <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                <Info size={16} /> Interpretation
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-zinc-900/30 p-4 border border-zinc-800 rounded">
                   <strong className="block text-white mb-1 text-sm">60 Hz</strong>
                   <span className="text-zinc-500">Standard Office / Laptop</span>
                   <br/>Update every 16.7ms. Fine for work, slow for gaming.
                </div>
                <div className="bg-zinc-900/30 p-4 border border-zinc-800 rounded">
                   <strong className="block text-white mb-1 text-sm">120-144 Hz</strong>
                   <span className="text-zinc-500">Gaming Standard</span>
                   <br/>Update every ~7ms. Significantly smoother motion clarity.
                </div>
                <div className="bg-zinc-900/30 p-4 border border-zinc-800 rounded">
                   <strong className="block text-white mb-1 text-sm">240+ Hz</strong>
                   <span className="text-zinc-500">Esports Grade</span>
                   <br/>Update every <4ms. Diminishing returns but elite responsiveness.
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

export default RefreshRatePage;