
import React from 'react';
import { Fingerprint, Activity, HelpCircle } from 'lucide-react';
import { TESTS } from '@/lib/data'; // Import from data
import TypingTitle from '@/components/TypingTitle';
import DashboardRadar from '@/components/DashboardRadar';
import TestCard from '@/components/TestCard';
import DashboardStatsOverview from '@/components/DashboardStatsOverview';

// Data for Server Rendering
const categories = Array.from(new Set(TESTS.map(t => t.category)));

const faqs = [
  {
    q: "Are these tests scientifically accurate?",
    a: "Our tests are based on established psychological and physiological paradigms. However, browser hardware latency and screen calibration mean these results should be treated as high-quality estimates, not medical diagnoses."
  },
  {
    q: "Does MyHumanStats save my data?",
    a: "No. MyHumanStats uses a 'Local-First' architecture. All your test scores are stored in your browser's LocalStorage. We do not have a backend database."
  },
  {
    q: "How can I improve my reaction time?",
    a: "Reaction time can be improved through regular training, adequate sleep, and physical exercise. Our Reaction Time Test allows you to track your progress over time."
  }
];

export default function Dashboard() {
  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      
      {/* Top Section: Identity & Radar */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6" aria-label="User Statistics Overview">
        
        {/* Identity Module (Left) */}
        <aside className="lg:col-span-4 flex flex-col h-full min-h-[400px]">
          <div className="bg-surface border border-border clip-corner-lg p-8 h-full relative overflow-hidden group flex flex-col justify-between">
             {/* Tech Decor Lines */}
             <div className="absolute top-0 right-0 w-24 h-24 border-r border-t border-white/10 rounded-tr-3xl pointer-events-none"></div>
             <div className="absolute bottom-0 left-0 w-8 h-8 border-l border-b border-primary-500/30 pointer-events-none"></div>
             
             {/* Scanner Animation */}
             <div className="absolute top-0 left-0 w-full h-[2px] bg-primary-500/50 shadow-[0_0_15px_rgba(34,211,238,0.5)] animate-scan opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"></div>

             <header className="flex items-start justify-between mb-8">
                <div>
                   <h2 className="text-[10px] text-primary-500 font-mono uppercase tracking-[0.3em] mb-2">Subject Identity</h2>
                   <h1 className="text-3xl md:text-4xl font-bold text-white font-sans tracking-tight leading-none min-h-[40px]">
                      <span className="sr-only">HUMAN DATA DASHBOARD</span>
                      <TypingTitle text="HUMAN_DATA" />
                   </h1>
                </div>
                <Fingerprint size={48} className="text-zinc-800 group-hover:text-primary-500/20 transition-colors shrink-0" />
             </header>

             {/* Client Component for Dynamic Stats */}
             <DashboardStatsOverview />
          </div>
        </aside>

        {/* Radar Visualization (Right) */}
        <figure className="lg:col-span-8 bg-surface border border-border clip-corner-lg relative overflow-hidden h-[400px] lg:h-auto min-h-[400px]">
          {/* Grid Overlay - Rendered immediately on server */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
          
          <figcaption className="absolute top-4 left-6 z-10">
             <div className="flex items-center gap-2 mb-1">
                <Activity size={14} className="text-primary-500" />
                <span className="text-xs font-mono font-bold text-white tracking-widest">PHENOTYPE_MATRIX</span>
             </div>
             <p className="text-[10px] text-zinc-400 font-mono">Multi-axial capability assessment</p>
          </figcaption>

          <div className="w-full h-full flex items-center justify-center p-6">
            {/* Client Component: Fetches Data & Renders Chart */}
            <DashboardRadar />
          </div>

          <div className="absolute bottom-4 right-6 text-right hidden md:block" aria-hidden="true">
             <div className="text-[9px] text-zinc-600 font-mono">X-AXIS: CATEGORY</div>
             <div className="text-[9px] text-zinc-600 font-mono">Y-AXIS: PROFICIENCY</div>
          </div>
        </figure>
      </section>

      {/* Test Modules Grid */}
      <h2 className="sr-only">Test Categories and Modules</h2>
      
      <div className="space-y-16 pb-12">
        {categories.map((category, catIdx) => {
          const catTests = TESTS.filter(t => t.category === category);
          
          return (
            <section key={category} className="relative" aria-labelledby={`cat-${catIdx}`}>
              <header className="flex items-center gap-4 mb-8">
                 <div className="w-12 h-12 bg-surface border border-zinc-800 flex items-center justify-center text-zinc-500 font-mono font-bold text-xl clip-corner-sm">
                    0{catIdx + 1}
                 </div>
                 <div className="flex flex-col">
                    <h3 id={`cat-${catIdx}`} className="text-xl font-bold text-white uppercase tracking-wider">{category}</h3>
                    <div className="flex items-center gap-2">
                       <div className="w-16 h-0.5 bg-primary-500"></div>
                       <span className="text-[10px] text-primary-500 font-mono tracking-widest">SECTOR_UNLOCKED</span>
                    </div>
                 </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {catTests.map((test, i) => (
                  <TestCard key={test.id} test={test} index={i} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* SEO: Scientific Context Section (Static - Server Rendered) */}
      <article className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-zinc-800 pt-12">
         <div className="prose prose-invert prose-sm text-zinc-400">
            <h2 className="text-white text-2xl font-bold mb-4">The Science of Human Benchmarking</h2>
            <p>
               <strong>MyHumanStats</strong> is a comprehensive digital platform designed to measure the limits of human perception and cognition. In the modern era, "knowing yourself" involves more than introspection; it requires quantifiable data. Our suite of 30+ tests provides a standardized way to benchmark your biological hardware against the global population.
            </p>
            <p>
               From detecting the early signs of <strong>Presbycusis</strong> via our <em>Hearing Age Test</em> to analyzing synaptic efficiency with the <em>Reaction Time Test</em>, every module uses Web Audio API and high-performance canvas rendering to ensure millisecond precision.
            </p>
         </div>
         <div className="prose prose-invert prose-sm text-zinc-400">
            <h3 className="text-white text-lg font-bold mb-4">Why Measure Cognitive & Sensory Traits?</h3>
            <ul className="list-disc pl-4 space-y-2">
               <li><strong>Neuroplasticity Monitoring:</strong> Track improvements in cognitive processing speed (WPM, CPS) over time.</li>
               <li><strong>Early Detection:</strong> Identify potential visual anomalies like <em>Color Blindness</em> or <em>Astigmatism</em> before they impact daily life.</li>
               <li><strong>Performance Optimization:</strong> Gamers and athletes use our <em>Aim Trainer</em> and <em>Rhythm Test</em> to fine-tune motor cortex reflexes.</li>
               <li><strong>Self-Awareness:</strong> Personality assessments based on the Big Five and ASRS-v1.1 models help navigate social dynamics.</li>
            </ul>
         </div>
      </article>

      {/* SEO FAQ Section (Static - Server Rendered) */}
      <section className="border-t border-zinc-800 pt-12 pb-8">
         <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
            <HelpCircle className="text-zinc-500" size={20} /> 
            <span>Common Queries</span>
         </h2>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {faqs.map((faq, i) => (
               <div key={i} className="bg-zinc-900/30 border border-zinc-800/50 p-6 rounded hover:border-zinc-700 transition-colors">
                  <h3 className="text-sm font-bold text-white mb-2">{faq.q}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{faq.a}</p>
               </div>
            ))}
         </div>
      </section>
    </div>
  );
}
