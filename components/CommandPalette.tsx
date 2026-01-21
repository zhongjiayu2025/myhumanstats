
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronRight, Activity, FileText, Command } from 'lucide-react';
import { TEST_INDEX, BLOG_INDEX, STATIC_PAGES } from '@/lib/searchIndex';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Combine Data Sources
  const allTests = TEST_INDEX.map(t => ({
    type: 'test',
    title: t.title,
    subtitle: t.category,
    id: t.id,
    path: `/test/${t.id}`,
    icon: Activity
  }));

  const allBlogs = BLOG_INDEX.map(b => ({
    type: 'blog',
    title: b.title,
    subtitle: b.category,
    id: b.slug,
    path: `/blog/${b.slug}`,
    icon: FileText
  }));

  const staticPages = STATIC_PAGES.map(p => ({
    ...p,
    icon: Command
  }));

  const allItems = [...staticPages, ...allTests, ...allBlogs];

  // Filter
  const filteredItems = allItems.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) || 
    item.subtitle.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 8); // Limit results

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    setQuery('');
    setSelectedIndex(0);
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          router.push(filteredItems[selectedIndex].path);
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, router, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-black border border-zinc-700 shadow-2xl rounded-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Search Input */}
        <div className="flex items-center px-4 py-4 border-b border-zinc-800">
          <Search className="text-zinc-500 mr-3" size={20} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search modules, logs, or commands..."
            className="w-full bg-transparent text-lg text-white placeholder-zinc-600 focus:outline-none font-mono"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="hidden md:flex gap-2">
             <kbd className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-[10px] text-zinc-500 font-mono">ESC</kbd>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-zinc-600 font-mono text-sm">
              NO_DATA_FOUND
            </div>
          ) : (
            <ul className="space-y-1">
              {filteredItems.map((item, index) => {
                const Icon = item.icon;
                const isSelected = index === selectedIndex;
                return (
                  <li 
                    key={`${item.type}-${item.id}`}
                    onClick={() => { router.push(item.path); onClose(); }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`
                      flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-colors group
                      ${isSelected ? 'bg-primary-500/10' : 'hover:bg-zinc-900'}
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded ${isSelected ? 'bg-primary-500 text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                        <Icon size={16} />
                      </div>
                      <div>
                        <div className={`text-sm font-bold ${isSelected ? 'text-primary-400' : 'text-white'}`}>
                          {item.title}
                        </div>
                        <div className="text-xs text-zinc-500 font-mono uppercase">
                          {item.type} • {item.subtitle}
                        </div>
                      </div>
                    </div>
                    {isSelected && <ChevronRight size={16} className="text-primary-500" />}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="bg-zinc-950 border-t border-zinc-800 px-4 py-2 flex justify-between items-center text-[10px] text-zinc-600 font-mono">
           <span>MYHUMANSTATS_INDEX_V2</span>
           <div className="flex gap-4">
              <span>⇅ NAVIGATE</span>
              <span>↵ SELECT</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
