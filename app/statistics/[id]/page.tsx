
import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { BarChart3, ArrowLeft, ArrowUpRight, Database, Activity } from 'lucide-react';
import { TESTS } from '@/lib/data';
import Breadcrumbs from '@/components/Breadcrumbs';

interface Props {
  params: Promise<{ id: string }>;
}

// Get all tests that have benchmark data
const getBenchmarkTests = () => {
  return TESTS.filter(t => t.benchmarks);
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const test = getBenchmarkTests().find(t => t.id === id);
  if (!test || !test.benchmarks) return { title: "Statistics Not Found" };

  return {
    title: `${test.benchmarks.title} | Reference Table`,
    description: `Illustrative reference values for ${test.title}. Not a verified global dataset or clinical norms.`,
    robots: { index: false, follow: true },
    alternates: { canonical: `/statistics/${test.id}/` },
    openGraph: {
        title: test.benchmarks.title,
        description: `Statistical breakdown for ${test.title}.`
    }
  };
}

export async function generateStaticParams() {
  return getBenchmarkTests().map(t => ({
    id: t.id,
  }));
}

export default async function StatDetailPage({ params }: Props) {
  const { id } = await params;
  const test = getBenchmarkTests().find(t => t.id === id);

  if (!test || !test.benchmarks) {
    notFound();
  }

  const { title, columns, rows } = test.benchmarks;


  return (
    <div className="max-w-5xl mx-auto py-12 px-4 animate-in fade-in">
      
      <Breadcrumbs items={[
          { label: 'Statistics', path: '/statistics' },
          { label: test.title }
      ]} />

      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-zinc-800 pb-8">
         <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-primary-500 mb-4">
                <Database size={24} />
                <span className="font-mono text-sm uppercase tracking-widest">Illustrative Reference · Unverified</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{title}</h1>
            <p className="text-zinc-400 text-lg leading-relaxed">
                This dataset aggregates performance metrics for the <strong>{test.title}</strong>. 
                Use this table to understand the distribution of scores across different percentiles or demographics.
            </p>
         </div>
         
         <div className="flex flex-col gap-3">
             <Link 
                href={`/test/${test.id}`}
                className="btn-primary flex items-center justify-center gap-2 text-sm"
             >
                Test Yourself <ArrowUpRight size={16} />
             </Link>
             <Link 
                href="/statistics" 
                className="btn-secondary flex items-center justify-center gap-2 text-sm"
             >
                <ArrowLeft size={16} /> All Stats
             </Link>
         </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-surface border border-zinc-800 rounded-xl overflow-hidden shadow-2xl mb-12">
          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse font-mono text-sm">
                <thead>
                   <tr>
                      {columns.map((col, idx) => (
                         <th key={idx} className="p-5 border-b border-zinc-800 bg-black/50 text-primary-400 font-bold uppercase text-xs tracking-wider">
                            {col}
                         </th>
                      ))}
                   </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                   {rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-white/5 transition-colors group">
                         {row.map((cell, cIdx) => (
                            <td key={cIdx} className={`p-5 text-zinc-300 ${cIdx === 0 ? 'font-bold text-white' : ''}`}>
                               {cell}
                            </td>
                         ))}
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
          <div className="bg-black/80 p-4 border-t border-zinc-800 flex justify-between items-center text-xs text-zinc-500 font-mono">
             <span>DATA_ID: {test.id.toUpperCase()}_BM</span>
             <span>STATUS: SOURCE REVIEW REQUIRED</span>
          </div>
      </div>

      {/* Analysis Content (Programmatic filler for SEO context) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-lg">
              <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                  <BarChart3 size={18} className="text-zinc-500" /> Important Limitations
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                  The values shown are illustrative and must not be treated as statistically representative. Browser, display and audio hardware differences can materially affect individual results. No universal margin of error is asserted.
              </p>
          </div>
          <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-lg">
              <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                  <Activity size={18} className="text-zinc-500" /> Improving Your Score
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                  Practice can improve performance on familiar tasks, but scores are also influenced by fatigue, practice effects and hardware. Repeating the <strong>{test.title}</strong> may help you track your own results; it cannot establish a diagnosis.
              </p>
          </div>
      </div>

    </div>
  );
}
