
import React from 'react';
import Link from 'next/link';
import { Dumbbell, ArrowRight, CheckCircle2 } from 'lucide-react';
import { WORKOUTS } from '@/lib/workouts';
import { TESTS } from '@/lib/data';

export default function WorkoutSection() {
  const getTestTitle = (id: string) => TESTS.find(t => t.id === id)?.title || id;

  const getThemeStyles = (theme: string) => {
      switch(theme) {
          case 'red': return 'border-red-900/30 bg-red-900/5 hover:bg-red-900/10 hover:border-red-500/50';
          case 'emerald': return 'border-emerald-900/30 bg-emerald-900/5 hover:bg-emerald-900/10 hover:border-emerald-500/50';
          case 'purple': return 'border-purple-900/30 bg-purple-900/5 hover:bg-purple-900/10 hover:border-purple-500/50';
          default: return 'border-blue-900/30 bg-blue-900/5 hover:bg-blue-900/10 hover:border-blue-500/50';
      }
  };

  const getIconColor = (theme: string) => {
      switch(theme) {
          case 'red': return 'text-red-500';
          case 'emerald': return 'text-emerald-500';
          case 'purple': return 'text-purple-500';
          default: return 'text-blue-500';
      }
  };

  return (
    <section className="border-t border-zinc-800 pt-12 pb-8">
        <div className="flex items-center gap-2 mb-8">
            <div className="p-2 bg-zinc-900 rounded border border-zinc-800 text-zinc-400">
                <Dumbbell size={20} />
            </div>
            <div>
                <h2 className="text-lg font-bold text-white uppercase tracking-wider">Curated Protocols</h2>
                <p className="text-xs text-zinc-500 font-mono">Specialized test batteries for specific goals.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {WORKOUTS.map(workout => (
                <div key={workout.id} className={`p-6 border rounded-xl transition-all group ${getThemeStyles(workout.theme)}`}>
                    <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                        {workout.title}
                    </h3>
                    <p className="text-xs text-zinc-400 mb-6 min-h-[32px] leading-relaxed">
                        {workout.description}
                    </p>
                    
                    <ul className="space-y-2 mb-6">
                        {workout.tests.map(tid => (
                            <li key={tid} className="flex items-center gap-2 text-xs text-zinc-300">
                                <CheckCircle2 size={12} className={`opacity-50 ${getIconColor(workout.theme)}`} />
                                <span className="truncate">{getTestTitle(tid)}</span>
                            </li>
                        ))}
                    </ul>

                    <Link 
                        href={`/test/${workout.tests[0]}`} 
                        className={`inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wide ${getIconColor(workout.theme)} opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-all`}
                    >
                        Start Protocol <ArrowRight size={12} />
                    </Link>
                </div>
            ))}
        </div>
    </section>
  );
}
