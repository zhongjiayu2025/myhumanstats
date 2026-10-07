
import React from 'react';
import type { Metadata } from 'next';
import { Fingerprint, Activity, HelpCircle, ArrowUpRight, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { TESTS } from '@/lib/data';
import { getFeaturedTests, FEATURED_TEST_DESCRIPTIONS } from '@/lib/seoGrowth';
import TypingTitle from '@/components/TypingTitle';
import DashboardRadar from '@/components/DashboardRadar';
import TestCard from '@/components/TestCard';
import DashboardStatsOverview from '@/components/DashboardStatsOverview';
import WorkoutSection from '@/components/WorkoutSection';

export const metadata: Metadata = {
  title: 'Free Online Human Ability Tests',
  description: 'Try 35 free browser-based tests for rhythm, contrast, color hue, perfect pitch, memory and more. No account required; scores stay in your browser.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Free Online Human Ability Tests | MyHumanStats',
    description: 'Explore perception, timing and memory with free interactive browser tests.',
    url: 'https://myhumanstats.org/',
  },
};

const categories = Array.from(new Set(TESTS.map(t => t.category)));
const featuredTests = getFeaturedTests();

const faqs = [
  {
    q: "Are these tests scientifically accurate?",
    a: "These are educational browser exercises, not standardized clinical exams. Screen calibration, audio hardware, practice and input latency can change results; do not use them to make medical decisions."
  },
  {
    q: "Where are my test scores saved?",
    a: "Your scores and history are saved in this browser's local storage. No account or shared population-score database is required."
  },
  {
    q: "How can I improve my reaction time?",
    a: "Reaction time can be improved through regular training, adequate sleep, and physical exercise. Our Reaction Time Test allows you to track your progress over time."
  }
];

export default function Dashboard() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.a
      }
    }))
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      
      {/* Search-first entry points for new visitors; returning users retain the dashboard below. */}
      <section aria-labelledby="home-test-heading" className="border border-zinc-800 bg-zinc-950 p-5 sm:p-8 lg:p-10">
        <div className="max-w-4xl mb-7">
          <p className="text-[11px] font-mono tracking-[0.18em] uppercase text-primary-400 mb-3">35 free interactive tests · no signup</p>
          <h1 id="home-test-heading" className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight mb-4">Free Online Human Ability Tests</h1>
          <p className="text-sm sm:text-base leading-relaxed text-zinc-400 max-w-3xl">
            Explore rhythm, visual perception, pitch and memory with free browser exercises.
            Start a test immediately, then keep your results in this browser to compare future attempts.
          </p>
          <p className="text-xs text-zinc-500 mt-3">Educational games and demonstrations, not medical or clinical assessments.</p>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-white">Start with a test</h2>
          <a href="#all-tests" className="inline-flex items-center gap-2 text-sm text-primary-400 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400">
            Browse all 35 tests <ArrowRight size={15} />
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {featuredTests.map(test => (
            <Link key={test.id} href={`/test/${test.id}/`}
              className="group block border border-zinc-800 bg-zinc-950/80 p-5 hover:border-primary-500/60 hover:bg-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400 transition-colors">
              <span className="block text-[10px] uppercase tracking-wider font-mono text-zinc-500 mb-2">{test.category} · {test.estimatedTime}</span>
              <h3 className="text-base font-bold text-white group-hover:text-primary-400 transition-colors">{test.title}</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mt-2 min-h-[2.5rem]">{FEATURED_TEST_DESCRIPTIONS[test.id]}</p>
              <span className="inline-flex items-center gap-1 mt-4 text-sm font-semibold text-primary-400">Start free test <ArrowUpRight size={16} /></span>
            </Link>
          ))}
        </div>
      </section>

      {/* Top Section: Identity & Radar */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6" aria-label="User Statistics Overview">
        
        {/* Identity Module (Left) */}
        <aside className="lg:col-span-4 flex flex-col h-full min-h-[400px]">
          <div className="bg-surface border border-border clip-corner-lg p-8 h-full relative overflow-hidden group flex flex-col justify-between">
             <div className="absolute top-0 right-0 w-24 h-24 border-r border-t border-white/10 rounded-tr-3xl pointer-events-none"></div>
             <div className="absolute bottom-0 left-0 w-8 h-8 border-l border-b border-primary-500/30 pointer-events-none"></div>
             <div className="absolute top-0 left-0 w-full h-[2px] bg-primary-500/50 shadow-[0_0_15px_rgba(34,211,238,0.5)] animate-scan opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"></div>

             <header className="flex items-start justify-between mb-8">
                <div>
                   <h2 className="text-[10px] text-primary-500 font-mono uppercase tracking-[0.3em] mb-2">Subject Identity</h2>
                   <h2 className="text-3xl md:text-4xl font-bold text-white font-sans tracking-tight leading-none min-h-[40px]">
                      <span className="sr-only">Personal results dashboard</span>
                      <TypingTitle text="HUMAN_DATA" />
                   </h2>
                </div>
                <Fingerprint size={48} className="text-zinc-800 group-hover:text-primary-500/20 transition-colors shrink-0" />
             </header>

             <DashboardStatsOverview />
          </div>
        </aside>

        {/* Radar Visualization (Right) */}
        <figure className="lg:col-span-8 bg-surface border border-border clip-corner-lg relative overflow-hidden h-[400px] lg:h-auto min-h-[400px]">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
          
          <figcaption className="absolute top-4 left-6 z-10">
             <div className="flex items-center gap-2 mb-1">
                <Activity size={14} className="text-primary-500" />
                <span className="text-xs font-mono font-bold text-white tracking-widest">PHENOTYPE_MATRIX</span>
             </div>
             <p className="text-[10px] text-zinc-400 font-mono">Multi-axial capability assessment</p>
          </figcaption>

          <div className="w-full h-full flex items-center justify-center p-6">
            <DashboardRadar />
          </div>

          <div className="absolute bottom-4 right-6 text-right hidden md:block" aria-hidden="true">
             <div className="text-[9px] text-zinc-600 font-mono">X-AXIS: CATEGORY</div>
             <div className="text-[9px] text-zinc-600 font-mono">Y-AXIS: PROFICIENCY</div>
          </div>
        </figure>
      </section>

      {/* New Workouts Section */}
      <WorkoutSection />

      {/* Test Modules Grid */}
      <h2 className="sr-only">Test Categories and Modules</h2>
      
      <div id="all-tests" className="space-y-16 pb-12 scroll-mt-24">
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

      {/* SEO: Scientific Context Section */}
      <article className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-zinc-800 pt-12">
         <div className="prose prose-invert prose-sm text-zinc-400">
            <h2 className="text-white text-2xl font-bold mb-4">The Science of Human Benchmarking</h2>
            <p>
               <strong>MyHumanStats</strong> is a comprehensive digital platform designed to measure the limits of human perception and cognition. In the modern era, "knowing yourself" involves more than introspection; it requires quantifiable data. Our suite of 30+ tests provides a consistent way to explore your own performance over time without implying global clinical norms.
            </p>
            <p>
               From the <em>Hearing Age Test</em> that explores audible frequencies to the <em>Reaction Time Test</em> that times simple responses, these browser exercises are designed for personal exploration. Devices, listening levels and input latency can change results.
            </p>
         </div>
         <div className="prose prose-invert prose-sm text-zinc-400">
            <h3 className="text-white text-lg font-bold mb-4">Why Measure Cognitive & Sensory Traits?</h3>
            <ul className="list-disc pl-4 space-y-2">
               <li><strong>Personal Progress:</strong> Keep a local history of WPM, click speed and reaction time while remembering that practice and hardware influence results.</li>
               <li><strong>Visual Exploration:</strong> Explore color and contrast perception; browser-based exercises do not replace vision examinations.</li>
               <li><strong>Practice Games:</strong> Try our <em>Aim Trainer</em> and <em>Rhythm Test</em> to practice timing, attention and coordination.</li>
               <li><strong>Self-Reflection:</strong> Informal personality and attention exercises can prompt reflection but do not provide validated clinical screening or diagnosis.</li>
            </ul>
         </div>
      </article>

      {/* SEO FAQ Section */}
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
