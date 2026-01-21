
"use client";

import React, { useEffect, useState } from 'react';
import { TESTS, getStats } from '@/lib/core';

export default function DashboardStatsOverview() {
  const [completedCount, setCompletedCount] = useState(0);
  
  useEffect(() => {
    const calc = () => {
        const stats = getStats();
        setCompletedCount(Object.keys(stats).length);
    };
    calc();
    window.addEventListener('storage-update', calc);
    return () => window.removeEventListener('storage-update', calc);
  }, []);

  const progressPercent = Math.round((completedCount / TESTS.length) * 100);

  return (
     <div className="space-y-6">
        <div>
          <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] text-zinc-400 font-mono">DATA_INTEGRITY</span>
            <span className="text-2xl font-mono text-primary-400 text-glow">{progressPercent}%</span>
          </div>
          {/* Custom Progress Bar */}
          <div className="w-full h-2 bg-black border border-zinc-800 p-[1px]">
             <div className="h-full bg-primary-500/80 shadow-[0_0_10px_rgba(34,211,238,0.3)] transition-all duration-1000 ease-out" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div className="p-3 bg-black/50 border border-zinc-800">
              <div className="text-[9px] text-zinc-400 uppercase mb-1">Modules</div>
              <div className="text-lg text-white font-mono">{completedCount}/{TESTS.length}</div>
           </div>
           <div className="p-3 bg-black/50 border border-zinc-800">
              <div className="text-[9px] text-zinc-400 uppercase mb-1">Rank</div>
              <div className="text-lg text-white font-mono">{progressPercent > 80 ? 'ALPHA' : 'BETA'}</div>
           </div>
        </div>
     </div>
  );
}
