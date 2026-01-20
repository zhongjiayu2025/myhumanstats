
import React, { useEffect, useState } from 'react';
import { playUiSound } from '../lib/sounds';

interface CountdownOverlayProps {
  isActive: boolean;
  onComplete: () => void;
}

const CountdownOverlay: React.FC<CountdownOverlayProps> = ({ isActive, onComplete }) => {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (!isActive) {
        setCount(3);
        return;
    }

    let current = 3;
    setCount(3);
    playUiSound('hover'); // Initial beep

    const interval = setInterval(() => {
      current--;
      if (current > 0) {
          playUiSound('hover');
          setCount(current);
      } else if (current === 0) {
          playUiSound('success'); // Go sound
          setCount(0); // "GO"
      } else {
          clearInterval(interval);
          onComplete();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 rounded-xl overflow-hidden">
        <div className="relative">
            {/* Ping effect behind number */}
            <div className="absolute inset-0 bg-primary-500/20 rounded-full animate-ping blur-xl"></div>
            
            <div key={count} className="relative z-10 text-9xl font-black text-white font-mono animate-[ping_0.5s_cubic-bezier(0,0,0.2,1)] origin-center scale-150">
                {count > 0 ? count : <span className="text-emerald-500">GO</span>}
            </div>
        </div>
        
        <div className="absolute bottom-12 text-sm font-mono text-zinc-400 uppercase tracking-[0.3em] animate-pulse">
            Prepare Sequence
        </div>
    </div>
  );
};

export default CountdownOverlay;
