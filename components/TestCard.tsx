
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Circle } from 'lucide-react';
import { TestDefinition } from '@/types';
import { getStats } from '@/lib/core';
import { iconMap } from '@/lib/iconMap';

interface TestCardProps {
  test: TestDefinition;
  index: number;
}

const TestCard: React.FC<TestCardProps> = ({ test, index }) => {
  const router = useRouter();
  const [score, setScore] = useState<number | undefined>(undefined);
  const [isHovered, setIsHovered] = useState(false);
  
  // Resolve icon from map, fallback to Circle if not found
  const IconComponent = iconMap[test.iconName] || Circle;

  useEffect(() => {
    const loadScore = () => {
        const stats = getStats();
        setScore(stats[test.id]);
    };
    loadScore();
    // Listen for updates in case user completes test in another tab or returns
    window.addEventListener('storage-update', loadScore);
    return () => window.removeEventListener('storage-update', loadScore);
  }, [test.id]);

  const hasScore = score !== undefined;

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => router.push(`/test/${test.id}`)}
      className={`
        relative min-h-[180px] p-6 cursor-pointer transition-all duration-300 group
        clip-corner-sm border
        ${hasScore 
           ? 'bg-primary-900/10 border-primary-500/40' 
           : 'bg-surface border-border hover:border-primary-500/30 hover:bg-zinc-900'}
      `}
    >
      <div className={`absolute top-0 left-0 w-2 h-2 border-t border-l transition-colors duration-300 ${isHovered ? 'border-primary-400' : 'border-transparent'}`}></div>
      <div className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r transition-colors duration-300 ${isHovered ? 'border-primary-400' : 'border-transparent'}`}></div>

      <div className="flex justify-between items-start mb-6">
        <div className={`p-2 rounded-none clip-corner-sm transition-all duration-300 ${hasScore ? 'bg-primary-500 text-black' : 'bg-black border border-zinc-800 text-zinc-400 group-hover:text-primary-400 group-hover:border-primary-500/50'}`}>
          <IconComponent size={20} strokeWidth={2} />
        </div>
        <span className="text-[9px] font-mono text-zinc-600 group-hover:text-primary-500/50">ID.{String(index + 1).padStart(3, '0')}</span>
      </div>

      <div className="relative z-10">
        <h4 className={`text-sm font-bold uppercase tracking-wide mb-2 transition-colors ${hasScore ? 'text-white' : 'text-zinc-300 group-hover:text-white'}`}>
          {test.title}
        </h4>
        
        {hasScore ? (
          <div className="flex items-end gap-2 animate-in fade-in zoom-in duration-300">
             <span className="text-3xl font-mono font-bold text-primary-400 text-glow">{score}</span>
             <span className="text-[10px] text-zinc-500 font-mono mb-1">/100</span>
          </div>
        ) : (
          <div className="text-[10px] text-zinc-500 font-mono group-hover:text-primary-500 transition-colors flex items-center gap-1">
             <span>INITIATE_TEST</span>
             <ChevronRight size={10} />
          </div>
        )}
      </div>

      {!test.isImplemented && (
         <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px] flex items-center justify-center z-20 border border-zinc-800/50">
            <div className="border border-zinc-700 bg-zinc-900 px-3 py-1">
               <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest">Offline</span>
            </div>
         </div>
      )}
    </div>
  );
};

export default TestCard;
