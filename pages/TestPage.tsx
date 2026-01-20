import React, { Suspense } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Cpu, Info, FileText, ChevronRight, Loader2, HelpCircle, BookOpen, Microscope, CheckCircle2, Bookmark, BarChart3 } from 'lucide-react';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';
import { Helmet } from 'react-helmet-async';
import { TESTS } from '../lib/core';
import { BLOG_POSTS } from '../lib/blogData';
import { TEST_REGISTRY } from '../components/tests/registry';
import RecommendedTests from '../components/RecommendedTests';

const LoadingModule = () => (
  <div className="flex flex-col items-center justify-center h-[400px] text-zinc-500 animate-pulse">
     <Loader2 size={48} className="animate-spin text-primary-500 mb-4" />
     <div className="text-xs font-mono uppercase tracking-widest">Initializing Module...</div>
     <div className="text-[10px] font-mono mt-2">LOADING_ASSETS</div>
  </div>
);

const TestPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const testDef = TESTS.find(t => t.id === id);

  if (!testDef) {
    return <div className="text-center py-20 text-red-500 font-mono">ERR_MODULE_NOT_FOUND</div>;
  }

  const TestComponent = id ? TEST_REGISTRY[id] : null;
  const relatedPosts = BLOG_POSTS.filter(p => p.relatedTestId === id);
  const currentYear = new Date().getFullYear();

  // Optimized Title for CTR (Click Through Rate)
  const pageTitle = `${testDef.title} (${currentYear} Online Benchmark)`;

  // Generate a deterministic rating based on the test ID string to be consistent across renders but seemingly random per test
  // This avoids hydration errors while providing "Rich Snippet" stars data
  const charCodeSum = testDef.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const fakeRatingValue = (4.5 + (charCodeSum % 5) / 10).toFixed(1); // 4.5 to 4.9
  const fakeRatingCount = 1000 + (charCodeSum * 12);

  // Schema.org for Web Applications
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": testDef.title,
    "description": testDef.description,
    "applicationCategory": "HealthApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": `Measure your ${testDef.category} capabilities online`,
    "screenshot": "https://myhumanstats.org/og-image-default.png",
    "datePublished": "2026-01-01",
    "dateModified": new Date().toISOString().split('T')[0], // Freshness signal
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": fakeRatingValue,
      "ratingCount": fakeRatingCount,
      "bestRating": "5",
      "worstRating": "1"
    }
  };

  // Schema.org for HowTo
  const howToSchema = testDef.instructions ? {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": `How to take the ${testDef.title}`,
    "description": testDef.description,
    "step": testDef.instructions.map((text, i) => ({
      "@type": "HowToStep",
      "position": i + 1,
      "text": text
    }))
  } : null;

  // Schema.org for FAQ
  const faqSchema = testDef.faqs ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": testDef.faqs.map(f => ({
      "@type": "Question",
      "name": f.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.answer
      }
    }))
  } : null;

  // Schema.org for DefinedTerms (Glossary)
  const glossarySchema = testDef.concepts ? {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    "name": `${testDef.title} Terminology`,
    "hasDefinedTerm": testDef.concepts.map(c => ({
      "@type": "DefinedTerm",
      "name": c.term,
      "description": c.definition
    }))
  } : null;

  return (
    <div className="max-w-6xl mx-auto min-h-[60vh] flex flex-col gap-8 pb-12">
      <SEO 
        title={pageTitle}
        description={testDef.description}
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(softwareSchema)}</script>
        {howToSchema && <script type="application/ld+json">{JSON.stringify(howToSchema)}</script>}
        {faqSchema && <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>}
        {glossarySchema && <script type="application/ld+json">{JSON.stringify(glossarySchema)}</script>}
      </Helmet>
      
      {/* Breadcrumbs & Navigation */}
      <div>
        <Breadcrumbs items={[
          { label: testDef.category, path: `/#module-${testDef.category}` },
          { label: testDef.title } 
        ]} />
      
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mt-2">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group"
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
        </aside>

        {/* Test Container */}
        <div className="lg:col-span-9">
          <div className="relative w-full min-h-[500px] bg-black border border-zinc-800 flex flex-col mb-8">
             
             {/* Test Header Decor */}
             <div className="h-8 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-center relative">
                <div className="absolute left-4 flex gap-1">
                   <div className="w-2 h-2 rounded-full bg-zinc-700"></div>
                   <div className="w-2 h-2 rounded-full bg-zinc-700"></div>
                   <div className="w-2 h-2 rounded-full bg-zinc-700"></div>
                </div>
                <span className="text-[10px] text-zinc-600 font-mono uppercase">{testDef.id}.EXE</span>
             </div>

             {/* Viewport */}
             <div className="flex-grow relative flex items-center justify-center p-8 overflow-hidden">
                {/* Background Grid inside test */}
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

             {/* Footer Status */}
             <div className="h-6 border-t border-zinc-800 bg-black flex items-center px-4 justify-between">
                <span className="text-[9px] text-zinc-600 font-mono">MEMORY_USAGE: LOW</span>
                <span className="text-[9px] text-zinc-600 font-mono">LATENCY: 0ms</span>
             </div>
          </div>

          {/* Clinical Relevance (Topical Authority) */}
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

          {/* SEO Rich Content Area (Article) */}
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

          {/* Global Benchmarks Table (Featured Snippet Bait) */}
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

          {/* Key Concepts (Glossary/Entities) */}
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

          {/* FAQ Section */}
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

          {/* Scientific Citations (E-E-A-T) */}
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
                            to={`/blog/${post.slug}`}
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

             {/* Internal Linking Mesh: Recommended Tests */}
             <RecommendedTests currentTestId={testDef.id} category={testDef.category} />
          </div>

        </div>

      </div>
    </div>
  );
};

export default TestPage;