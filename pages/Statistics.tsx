import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart2, Table, Database, ArrowUpRight } from 'lucide-react';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';
import { TESTS } from '../lib/core';

const Statistics: React.FC = () => {
  // Filter tests that have benchmark data
  const dataPoints = TESTS.filter(t => t.benchmarks);

  const statsSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": "Global Human Performance Benchmarks 2026",
    "description": "Aggregated statistical data on human auditory frequency limits, visual reaction times, and cognitive processing speeds by age group.",
    "url": "https://myhumanstats.org/statistics",
    "isAccessibleForFree": true,
    "creator": {
      "@type": "Organization",
      "name": "MyHumanStats"
    },
    "keywords": ["human benchmarks", "average reaction time", "hearing loss statistics", "typing speed averages"]
  };

  return (
    <div className="max-w-6xl mx-auto py-12 animate-in fade-in duration-500">
      <SEO 
        title="Global Statistics & Human Benchmarks"
        description="Comprehensive dataset of human performance averages. Data tables for reaction time, hearing frequency, and typing speed by age and skill level."
      />
      <script type="application/ld+json">{JSON.stringify(statsSchema)}</script>

      <Breadcrumbs items={[{ label: 'Global Statistics' }]} />

      {/* Header */}
      <div className="mb-16 border-b border-zinc-800 pb-12">
        <div className="flex items-center gap-3 text-primary-500 mb-4">
           <Database size={32} />
           <span className="font-mono text-sm uppercase tracking-widest">Open Data Initiative</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 max-w-4xl tracking-tight">
           Human Performance <span className="text-primary-400">Index</span>
        </h1>
        <p className="text-xl text-zinc-400 max-w-3xl leading-relaxed">
           A collection of aggregated benchmarks establishing the baseline for human sensory and cognitive capabilities. Data derived from standardized browser-based assessments.
        </p>
      </div>

      {/* Table of Contents / Jump Links */}
      <div className="bg-zinc-900/30 border border-zinc-800 p-6 mb-16 rounded-lg">
         <h3 className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-4">Quick Navigation</h3>
         <div className="flex flex-wrap gap-3">
            {dataPoints.map(t => (
               <a 
                  key={t.id} 
                  href={`#stat-${t.id}`}
                  className="px-3 py-1 bg-black border border-zinc-700 text-xs text-zinc-300 hover:text-white hover:border-primary-500 transition-colors rounded-full"
               >
                  {t.title}
               </a>
            ))}
         </div>
      </div>

      {/* Data Grids */}
      <div className="space-y-20">
         {dataPoints.map((test, idx) => (
            <section key={test.id} id={`stat-${test.id}`} className="scroll-mt-32">
               <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
                  <div>
                     <div className="flex items-center gap-2 text-primary-500 mb-2">
                        <BarChart2 size={20} />
                        <span className="text-xs font-mono uppercase tracking-widest">Dataset #{idx + 1}</span>
                     </div>
                     <h2 className="text-2xl font-bold text-white">{test.benchmarks?.title}</h2>
                     <p className="text-sm text-zinc-500 mt-2 max-w-2xl">
                        Reference data for the <Link to={`/test/${test.id}`} className="text-zinc-300 hover:text-primary-400 underline decoration-zinc-700 underline-offset-4">{test.title}</Link>.
                     </p>
                  </div>
                  <Link 
                     to={`/test/${test.id}`}
                     className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-mono uppercase border border-zinc-700 transition-colors rounded"
                  >
                     Take This Test <ArrowUpRight size={14} />
                  </Link>
               </div>

               <div className="bg-surface border border-zinc-800 clip-corner-sm overflow-hidden">
                  <div className="overflow-x-auto">
                     <table className="w-full text-left border-collapse font-mono text-sm">
                        <thead>
                           <tr>
                              {test.benchmarks?.columns.map((col, cIdx) => (
                                 <th key={cIdx} className="p-4 border-b border-zinc-800 bg-black/50 text-zinc-400 font-bold uppercase text-xs tracking-wider">
                                    {col}
                                 </th>
                              ))}
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                           {test.benchmarks?.rows.map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-white/5 transition-colors">
                                 {row.map((cell, cIdx) => (
                                    <td key={cIdx} className="p-4 text-zinc-300">
                                       {cIdx === 0 ? <span className="text-white font-bold">{cell}</span> : cell}
                                    </td>
                                 ))}
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
                  <div className="bg-black/50 p-3 border-t border-zinc-800 flex justify-between items-center">
                     <span className="text-[10px] text-zinc-600 font-mono">SOURCE: MHS_INTERNAL_AGGREGATE</span>
                     <span className="text-[10px] text-zinc-600 font-mono">UPDATED: {new Date().getFullYear()}</span>
                  </div>
               </div>
            </section>
         ))}
      </div>

      {/* CTA Footer */}
      <div className="mt-24 text-center border-t border-zinc-800 pt-12">
         <h3 className="text-2xl font-bold text-white mb-4">Contribute Your Data</h3>
         <p className="text-zinc-400 max-w-lg mx-auto mb-8">
            These statistics are refined by every user who completes a benchmark. Your data is processed locally to generate your percentile score.
         </p>
         <Link to="/" className="btn-primary">
            Go to Dashboard
         </Link>
      </div>

    </div>
  );
};

export default Statistics;