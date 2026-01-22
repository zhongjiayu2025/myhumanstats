
"use client";

import React, { useEffect, useState } from 'react';
import { BADGES } from '@/lib/gamification';
import { getStats } from '@/lib/core';
import { Lock } from 'lucide-react';

export default function BadgesModule() {
  const [stats, setStats] = useState<Record<string, number>>({});

  useEffect(() => {
    const load = () => setStats(getStats());
    load();
    window.addEventListener('storage-update', load);
    return () => window.removeEventListener('storage-update', load);
  }, []);

  return (
    <div className="mt-8 border-t border-zinc-800 pt-6">
        <h3 className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-4">Achievements</h3>
        <div className="grid grid-cols-3 gap-3">
            {BADGES.map(badge => {
                const userScore = stats[badge.testId] || 0;
                const isUnlocked = userScore >= badge.threshold;
                const Icon = badge.icon;

                return (
                    <div 
                       key={badge.id} 
                       className={`
                          group relative flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-300
                          ${isUnlocked ? 'bg-zinc-900 border-zinc-700 hover:border-primary-500/50' : 'bg-black border-zinc-900 opacity-50'}
                       `}
                    >
                       <div className={`mb-2 ${isUnlocked ? badge.color : 'text-zinc-600'}`}>
                           {isUnlocked ? <Icon size={20} /> : <Lock size={20} />}
                       </div>
                       
                       {/* Tooltip */}
                       <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-32 bg-black border border-zinc-700 p-2 rounded text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl">
                           <div className={`text-xs font-bold mb-1 ${isUnlocked ? 'text-white' : 'text-zinc-500'}`}>{badge.title}</div>
                           <div className="text-[9px] text-zinc-400 font-mono leading-tight">{badge.desc}</div>
                           {!isUnlocked && (
                               <div className="mt-1 pt-1 border-t border-zinc-800 text-[9px] text-red-400 font-mono">
                                   REQ: {badge.threshold}+
                               </div>
                           )}
                       </div>
                    </div>
                );
            })}
        </div>
    </div>
  );
}
