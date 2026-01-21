
"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Book, Search, ExternalLink } from 'lucide-react';
import { TestDefinition } from '@/types';

interface TermEntry {
  term: string;
  definition: string;
  sourceTestId: string;
  sourceTestTitle: string;
}

export default function GlossaryClient({ tests }: { tests: TestDefinition[] }) {
  const [filter, setFilter] = useState('');

  const allTerms: TermEntry[] = useMemo(() => {
    const terms: TermEntry[] = [];
    tests.forEach(test => {
      if (test.concepts) {
        test.concepts.forEach(c => {
          terms.push({
            term: c.term,
            definition: c.definition,
            sourceTestId: test.id,
            sourceTestTitle: test.title
          });
        });
      }
    });
    return terms.sort((a, b) => a.term.localeCompare(b.term));
  }, [tests]);

  const filteredTerms = allTerms.filter(t => 
    t.term.toLowerCase().includes(filter.toLowerCase()) || 
    t.definition.toLowerCase().includes(filter.toLowerCase())
  );

  const groupedTerms = filteredTerms.reduce((acc, term) => {
    const letter = term.term[0].toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(term);
    return acc;
  }, {} as Record<string, TermEntry[]>);

  const letters = Object.keys(groupedTerms).sort();

  return (
    <div className="max-w-4xl mx-auto py-12 animate-in fade-in duration-500">
      <div className="text-center mb-16">
        <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-zinc-800">
           <Book size={32} className="text-primary-500" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
          System <span className="text-primary-400">Codex</span>
        </h1>
        <p className="text-zinc-400 max-w-xl mx-auto">
          The central knowledge graph of MyHumanStats. Definitions of biological, psychological, and acoustic terminology used in our modules.
        </p>
      </div>

      <div className="max-w-md mx-auto mb-16 relative">
         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={18} className="text-zinc-500" />
         </div>
         <input 
            type="text" 
            placeholder="Search terminology..." 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-black border border-zinc-800 rounded-full py-3 pl-12 pr-6 text-white focus:border-primary-500 focus:outline-none transition-colors font-mono text-sm"
         />
      </div>

      <div className="space-y-12">
         {filteredTerms.length === 0 && (
            <div className="text-center text-zinc-500 font-mono py-12">NO_ENTRIES_FOUND</div>
         )}

         {letters.map(letter => (
            <div key={letter} className="relative">
               <div className="sticky top-20 z-10 bg-background/95 backdrop-blur py-2 border-b border-zinc-800 mb-6 flex items-center">
                  <span className="text-4xl font-black text-zinc-800 select-none mr-4">{letter}</span>
                  <div className="h-px bg-zinc-800 flex-grow"></div>
               </div>
               
               <div className="grid grid-cols-1 gap-6">
                  {groupedTerms[letter].map((entry, idx) => (
                     <div key={idx} className="group bg-surface border border-zinc-800/50 hover:border-zinc-700 p-6 rounded transition-colors">
                        <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4 mb-2">
                           <h3 className="text-xl font-bold text-white group-hover:text-primary-400 transition-colors">
                              {entry.term}
                           </h3>
                           <Link 
                              href={`/test/${entry.sourceTestId}`} 
                              className="text-xs font-mono text-zinc-500 hover:text-white flex items-center gap-1 transition-colors"
                           >
                              <ExternalLink size={10} />
                              REF: {entry.sourceTestTitle}
                           </Link>
                        </div>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                           {entry.definition}
                        </p>
                     </div>
                  ))}
               </div>
            </div>
         ))}
      </div>
    </div>
  );
}
