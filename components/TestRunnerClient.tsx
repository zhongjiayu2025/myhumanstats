
"use client";

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Cpu, Info, FileText, ChevronRight, Loader2, HelpCircle, BookOpen, Microscope, CheckCircle2, Bookmark, BarChart3, History, Wrench, AlertTriangle } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';
import { TESTS, getHistory } from '@/lib/core';
import { BLOG_POSTS } from '@/lib/blogData';
import { TEST_REGISTRY } from '@/components/tests/registry';
import RecommendedTests from '@/components/RecommendedTests';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const TEST_TO_TOOL_MAP: Record<string, { id: string, name: string, desc: string, icon: any }[]> = {
    'hearing-age-test': [{ id: 'tone-generator', name: 'Tone Generator', desc: 'Verify speaker frequency response.', icon: Wrench }],
    'vocal-range-test': [{ id: 'mic-test', name: 'Mic Check', desc: 'Verify input clarity and volume.', icon: Wrench }],
    'rhythm-test': [{ id: 'bpm-counter', name: 'BPM Counter', desc: 'Manually tap tempo to calibrate.', icon: Wrench }],
    'stereo-test': [{ id: 'stereo-test', name: 'Left/Right Check', desc: 'Ensure channels are not flipped.', icon: Wrench }],
    'color-blind-test': [{ id: 'dead-pixel-test', name: 'Dead Pixel Check', desc: 'Ensure screen color accuracy.', icon: Wrench }],
    'contrast-test': [{ id: 'dead-pixel-test', name: 'Monitor Check', desc: 'Verify black levels.', icon: Wrench }],
    'reaction-time-test': [{ id: 'hz-test', name: 'Hz Checker', desc: 'Is your 60Hz monitor slowing you down?', icon: Wrench }],
    'aim-trainer-test': [{ id: 'hz-test', name: 'Hz Checker', desc: 'Frame rate affects tracking accuracy.', icon: Wrench }],
};

// Optimized Skeleton Loader to match Test Container height (CLS Fix)
const LoadingModule = () => (
  <div className="flex flex-col items-center justify-center w-full h-full min-h-[500px] text-zinc-500 bg-zinc-900/20">
     <Loader2 size={48} className="animate-spin text-primary-500 mb-4" />
     <div className="text-xs font-mono uppercase tracking-widest">Initializing Module...</div>
     <div className="text-[10px] font-mono mt-2 text-zinc-600">LOADING_ASSETS</div>
  </div>
);

const HistorySection = ({ testId }: { testId: string }) => {
  const [history, setHistory] = React.useState<any[]>([]);

  React.useEffect(() => {
    const load = () => {
      if (typeof window !== 'undefined') {
          const h = getHistory(testId);
          const chartData = h.map((entry, i) => ({
            index: i + 1,
            date: new Date(entry.timestamp).toLocaleDateString(),
            value: entry.raw !== undefined ? entry.raw : entry.score,
            score: entry.score 
          }));
          setHistory(chartData);
      }
    };
    load();
    window.addEventListener('storage-update', load);
    return () => window.removeEventListener('storage-update', load);
  }, [testId]);

  if (history.length < 2) return null;

  return (
    <section className="tech-border bg-black/50 p-6 mb-8 border border-zinc-800 rounded-lg animate-in fade-in slide-in-from-bottom-4">
       <div className="flex items-center gap-3 mb-6">
          <History className="text-purple-500" size={20} />
          <h3 className="text-lg font-bold text-white uppercase tracking-wide">Historical Data</h3>
       </div>
       <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
             <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="index" stroke="#555" fontSize={10} tickLine={false} axisLine={false} label={{ value: 'Attempts', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#555' }} />
                <YAxis stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', fontSize: '12px' }}
                    itemStyle={{ color: '#a855f7' }}
                    labelFormatter={(i) => `Attempt #${i}`}
                />
                <Line type="monotone" dataKey="value" stroke="#a855f7" strokeWidth={2} dot={{r: 3, fill: '#a855f7'}} activeDot={{r: 5}} />
             </LineChart>
          </ResponsiveContainer>
       </div>
       <div className="mt-4 text-center text-[10px] text-zinc-500 font-mono">
          TRACKING_SINCE: {history[0].date}
       </div>
    </section>
  );
};

export default function TestRunnerClient({ id }: { id: string }) {
  const router = useRouter();
  const testDef = TESTS.find(t => t.id === id);

  if (!testDef) {
    return <div className="text-center py-20 text-red-500 font-mono">ERR_MODULE_NOT_FOUND</div>;
  }

  const TestComponent = TEST_REGISTRY[id];
  const relatedPosts = BLOG_POSTS.filter(p => p.relatedTestId === id);
  const relatedTools = TEST_TO_TOOL_MAP[testDef.id] || [];

  return (
    <div className="max-w-6xl mx-auto min-h-[60vh] flex flex-col gap-8 pb-12">
      
      <div>
        <Breadcrumbs items={[
          { label: testDef.category, path: `/#module-${testDef.category}` },
          { label: testDef.title } 
        ]} />
      
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mt-2">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group"
            aria-label="Return to Dashboard"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-mono tracking-widest uppercase">ABORT_TEST / RETURN</span>
          </button>
          
          <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 bg-primary-500 animate-pulse"></div>
             <span className="text-xs font-mono text-primary-500">ACTIVE_SESSION</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Info Column */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="tech-border bg-surface p-6">
             <div className="text-[10px] text-zinc-500 font-mono mb-2 uppercase tracking-wider">Module Type</div>
             <div className="inline-block px-2 py-0.5 bg-white/5 border border-white/10 text-xs text-white mb-6">
                {testDef.category}
             </div>

             <h1 className="text-2xl font-bold text-white mb-4 leading-tight">{testDef.title}</h1>
             <p className="text-zinc-400 text-sm leading-relaxed mb-6">
               {testDef.description}
             </p>

             <div className="border-t border-dashed border-zinc-800 pt-4 mt-4 flex items-center justify-between text-xs text-zinc-500 font-mono">
                <span>EST_TIME</span>
                <span className="text-white">{testDef.estimatedTime}</span>
             </div>
          </div>

          {/* Hardware Check Cross-Sell */}
          {relatedTools.length > 0 && (
             <div className="bg-yellow-900/10 border border-yellow-700/30 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-500 mb-2 font-bold text-xs uppercase tracking-wider">
                   <AlertTriangle size={14} /> Hardware Check
                </div>
                <p className="text-[10px] text-yellow-200/70 mb-3 leading-relaxed">
                   Low score? It might be your device, not you.
                </p>
                <div className="space-y-2">
                   {relatedTools.map(tool => (
                      <Link 
                         key={tool.id} 
                         href={`/tools/${tool.id}`}
                         className="flex items-center gap-3 p-2 bg-black border border-yellow-900/30 hover:border-yellow-500/50 rounded transition-colors group"
                      >
                         <div className="bg-zinc-900 p-1.5 rounded text-zinc-400 group-hover:text-yellow-400">
                            <tool.icon size={14} />
                         </div>
                         <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-zinc-300 group-hover:text-white">{tool.name}</div>
                            <div className="text-[9px] text-zinc-600 truncate">{tool.desc}</div>
                         </div>
                         <ChevronRight size={12} className="text-zinc-700 group-hover:text-yellow-500" />
                      </Link>
                   ))}
                </div>
             </div>
          )}
        </aside>

        {/* Test Container */}
        <div className="lg:col-span-9">
          <div className="relative w-full min-h-[500px] bg-black border border-zinc-800 flex flex-col mb-8">
             <div className="h-8 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-center relative">
                <div className="absolute left-4 flex gap-1">
                   <div className="w-2 h-2 rounded-full bg-zinc-700"></div>
                   <div className="w-2 h-2 rounded-full bg-zinc-700"></div>
                   <div className="w-2 h-2 rounded-full bg-zinc-700"></div>
                </div>
                <span className="text-[10px] text-zinc-600 font-mono uppercase">{testDef.id}.EXE</span>
             </div>

             <div className="flex-grow relative flex items-center justify-center p-8 overflow-hidden min-h-[500px]">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
                
                <div className="relative z-10 w-full">
                  {TestComponent ? (
                    <Suspense fallback={<LoadingModule />}>
                       <TestComponent />
                    </Suspense>
                  ) : (
                    <div className="text-center">
                      <Cpu className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                      <h2 className="text-zinc-400 font-mono">MODULE_OFFLINE</h2>
                    </div>
                  )}
                </div>
             </div>

             <div className="h-6 border-t border-zinc-800 bg-black flex items-center px-4 justify-between">
                <span className="text-[9px] text-zinc-600 font-mono">MEMORY_USAGE: LOW</span>
                <span className="text-[9px] text-zinc-600 font-mono">LATENCY: 0ms</span>
             </div>
          </div>

          <HistorySection testId={testDef.id} />

          {/* Clinical Relevance */}
          {testDef.clinicalRelevance && testDef.clinicalRelevance.length > 0 && (
             <div className="tech-border bg-black/50 p-6 mb-8 border-l-4 border-l-primary-500">
                <div className="flex items-center gap-3 mb-4">
                   <Microscope className="text-primary-500" size={20} />
                   <h3 className="text-lg font-bold text-white uppercase tracking-wide">Clinical Relevance</h3>
                </div>
                <p className="text-sm text-zinc-400 mb-4">Why does this metric matter in a physiological context?</p>
                <ul className="space-y-3">
                   {testDef.clinicalRelevance.map((point, idx) => (
                      <li key={idx} className="flex gap-3 text-sm text-zinc-300">
                         <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                         <span>{point}</span>
                      </li>
                   ))}
                </ul>
             </div>
          )}

          {/* SEO Rich Content */}
          {testDef.seoContent && (
             <article className="tech-border bg-surface p-8 animate-in fade-in slide-in-from-bottom-8 mb-8">
                <div className="flex items-center gap-3 mb-6">
                   <Info className="text-primary-500" />
                   <h2 className="text-xl font-bold text-white">About This Test</h2>
                </div>
                <div 
                   className="prose prose-invert prose-sm max-w-none prose-headings:text-zinc-200 prose-p:text-zinc-400 prose-li:text-zinc-400"
                   dangerouslySetInnerHTML={{ __html: testDef.seoContent }}
                />
             </article>
          )}

          {/* Global Benchmarks */}
          {testDef.benchmarks && (
             <section className="tech-border bg-zinc-900/30 p-8 mb-8 overflow-hidden">
                <div className="flex items-center gap-3 mb-6">
                   <BarChart3 className="text-primary-500" size={20} />
                   <h3 className="text-xl font-bold text-white">Global Statistics</h3>
                </div>
                
                <p className="text-sm text-zinc-400 mb-6">
                   How do you compare? See the global average scores for the <strong>{testDef.title}</strong> below.
                </p>

                <div className="overflow-x-auto">
                   <table className="w-full text-left border-collapse font-mono text-xs md:text-sm">
                      <thead>
                         <tr>
                            {testDef.benchmarks.columns.map((col, idx) => (
                               <th key={idx} className="p-3 border border-zinc-800 bg-black/50 text-primary-400 uppercase tracking-wider">{col}</th>
                            ))}
                         </tr>
                      </thead>
                      <tbody>
                         {testDef.benchmarks.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-white/5 transition-colors">
                               {row.map((cell, cIdx) => (
                                  <td key={cIdx} className="p-3 border border-zinc-800 text-zinc-300">{cell}</td>
                               ))}
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
                
                <div className="mt-4 text-[10px] text-zinc-600 font-mono text-right">
                   SOURCE: INTERNAL_AGGREGATE_DATA_2026
                </div>
             </section>
          )}

          {/* Key Concepts */}
          {testDef.concepts && testDef.concepts.length > 0 && (
             <section className="tech-border bg-zinc-900/30 p-8 mb-8">
                <div className="flex items-center gap-3 mb-6">
                   <Bookmark className="text-amber-500" size={20} />
                   <h3 className="text-xl font-bold text-white">Key Concepts</h3>
                </div>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {testDef.concepts.map((item, idx) => (
                      <div key={idx} className="bg-black/50 p-4 border border-zinc-800/50 rounded hover:border-zinc-700 transition-colors">
                         <dt className="text-sm font-bold text-white font-mono mb-2 text-primary-400">{item.term}</dt>
                         <dd className="text-xs text-zinc-400 leading-relaxed">{item.definition}</dd>
                      </div>
                   ))}
                </dl>
             </section>
          )}

          {/* FAQ */}
          {testDef.faqs && testDef.faqs.length > 0 && (
             <section className="tech-border bg-surface p-8 mb-8">
                <div className="flex items-center gap-3 mb-6">
                   <HelpCircle className="text-emerald-500" />
                   <h3 className="text-xl font-bold text-white">Common Questions</h3>
                </div>
                <div className="space-y-4">
                   {testDef.faqs.map((faq, idx) => (
                      <details key={idx} className="group bg-zinc-900/50 border border-zinc-800 open:border-primary-500/30 open:bg-zinc-900 transition-all rounded">
                         <summary className="p-4 cursor-pointer font-bold text-sm text-zinc-200 flex justify-between items-center select-none">
                            {faq.question}
                            <ChevronRight size={16} className="text-zinc-500 group-open:rotate-90 transition-transform" />
                         </summary>
                         <div className="px-4 pb-4 text-sm text-zinc-400 leading-relaxed border-t border-zinc-800/50 pt-4">
                            {faq.answer}
                         </div>
                      </details>
                   ))}
                </div>
             </section>
          )}

          {/* Citations */}
          {testDef.citations && testDef.citations.length > 0 && (
             <div className="mb-8 border-t border-zinc-800 pt-8">
                <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <BookOpen size={12} /> Scientific Methodology & References
                </h4>
                <ul className="space-y-2">
                   {testDef.citations.map((cite, idx) => (
                      <li key={idx} className="text-xs text-zinc-500 font-mono pl-4 border-l-2 border-zinc-800">
                         <cite>{cite}</cite>
                      </li>
                   ))}
                </ul>
             </div>
          )}

          {/* Related Articles & Recommended Tests */}
          <div className="space-y-8">
             
             {relatedPosts.length > 0 && (
                <aside>
                   <h3 className="text-sm font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                      <FileText size={14} /> Related Research Logs
                   </h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {relatedPosts.map(post => (
                         <Link 
                            key={post.slug} 
                            href={`/blog/${post.slug}`}
                            className="flex items-start gap-4 p-4 border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900 hover:border-primary-500/30 transition-all group clip-corner-sm"
                         >
                            <img 
                               src={post.coverImage} 
                               alt={post.title} 
                               className="w-16 h-16 object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                            />
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-white truncate group-hover:text-primary-400 transition-colors mb-1">{post.title}</h4>
                                <p className="text-xs text-zinc-500 line-clamp-2">{post.excerpt}</p>
                                <div className="mt-2 flex items-center gap-1 text-[10px] text-primary-500 font-mono">
                                  READ_ENTRY <ChevronRight size={10} />
                                </div>
                            </div>
                         </Link>
                      ))}
                   </div>
                </aside>
             )}

             <RecommendedTests currentTestId={testDef.id} category={testDef.category} />
          </div>

        </div>

      </div>
    </div>
  );
}
