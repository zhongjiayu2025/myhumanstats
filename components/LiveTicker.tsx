import React, { useEffect, useState } from 'react';
import { Globe, Activity } from 'lucide-react';

const COUNTRIES = ['USA', 'GBR', 'DEU', 'JPN', 'FRA', 'CAN', 'BRA', 'AUS', 'IND', 'KOR'];
const EVENTS = [
  { test: 'Reaction Time', unit: 'ms', min: 150, max: 350 },
  { test: 'Typing Speed', unit: 'WPM', min: 40, max: 110 },
  { test: 'Hearing Age', unit: 'Hz', min: 12000, max: 19000 },
  { test: 'Visual Memory', unit: 'Lvl', min: 5, max: 14 },
  { test: 'Rhythm Test', unit: 'pts', min: 70, max: 98 },
];

const LiveTicker: React.FC = () => {
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    // Hydrate initial list
    const initial = Array.from({ length: 10 }).map(generateEvent);
    setItems(initial);

    // Add new event every 2-4 seconds
    const interval = setInterval(() => {
      setItems(prev => [...prev.slice(1), generateEvent()]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const generateEvent = () => {
    const country = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
    const event = EVENTS[Math.floor(Math.random() * EVENTS.length)];
    const score = Math.floor(Math.random() * (event.max - event.min + 1)) + event.min;
    return `[${country}] User logged ${score}${event.unit} on ${event.test}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-black/90 border-t border-zinc-800 h-8 flex items-center overflow-hidden select-none pointer-events-none print:hidden">
      <div className="flex items-center px-3 bg-primary-900/20 h-full border-r border-zinc-800 z-10">
        <Activity size={12} className="text-primary-500 animate-pulse mr-2" />
        <span className="text-[10px] font-mono font-bold text-primary-400 uppercase tracking-wider whitespace-nowrap">Live Feed</span>
      </div>
      
      <div className="flex whitespace-nowrap animate-ticker">
        {items.map((item, i) => (
          <div key={i} className="flex items-center mx-6 text-[10px] font-mono text-zinc-500">
            <Globe size={10} className="mr-2 text-zinc-700" />
            {item}
          </div>
        ))}
        {/* Duplicate for seamless loop */}
        {items.map((item, i) => (
          <div key={`dup-${i}`} className="flex items-center mx-6 text-[10px] font-mono text-zinc-500">
            <Globe size={10} className="mr-2 text-zinc-700" />
            {item}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          animation: ticker 60s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default LiveTicker;