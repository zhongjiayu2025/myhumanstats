
import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, Activity, Layers, HelpCircle, Circle } from 'lucide-react';
import { TESTS } from '@/lib/data';
import { CATEGORY_DATA } from '@/lib/categoryData';
import { TestCategory } from '@/types';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Metadata } from 'next';
import { iconMap } from '@/lib/iconMap';

interface Props {
  params: { categoryId: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const categoryEnum = Object.values(TestCategory).find(
    c => c.toLowerCase() === params.categoryId?.toLowerCase()
  );
  if (!categoryEnum) return { title: "Category Not Found" };
  
  const meta = CATEGORY_DATA[categoryEnum];
  return {
    title: `${meta.title} | MyHumanStats`,
    description: meta.description,
    alternates: {
      canonical: `/category/${params.categoryId}`,
    }
  };
}

export async function generateStaticParams() {
  return Object.values(TestCategory).map((cat) => ({
    categoryId: cat.toLowerCase(),
  }));
}

export default function CategoryPage({ params }: Props) {
  const categoryEnum = Object.values(TestCategory).find(
    c => c.toLowerCase() === params.categoryId?.toLowerCase()
  );

  if (!categoryEnum) {
    notFound();
  }

  const meta = CATEGORY_DATA[categoryEnum];
  const categoryTests = TESTS.filter(t => t.category === categoryEnum);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": meta.faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <div className="max-w-6xl mx-auto py-12 animate-in fade-in duration-500">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      
      <Breadcrumbs items={[
         { label: 'Categories', path: '/sitemap' },
         { label: categoryEnum }
      ]} />

      {/* Hero Header */}
      <div className="mb-16 border-b border-zinc-800 pb-12">
         <div className="flex items-center gap-3 text-primary-500 mb-4">
            <Layers size={32} />
            <span className="font-mono text-sm uppercase tracking-widest">Sector: {categoryEnum}</span>
         </div>
         <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 max-w-4xl tracking-tight">
            {meta.title}
         </h1>
         <p className="text-xl text-zinc-400 max-w-2xl leading-relaxed">
            {meta.description}
         </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
         
         {/* Main Content (Tests Grid) */}
         <div className="lg:col-span-8">
            <h2 className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
               <Activity size={16} /> Available Modules
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
               {categoryTests.map(test => {
                  const IconComponent = iconMap[test.iconName] || Circle;
                  return (
                     <Link 
                        key={test.id} 
                        href={`/test/${test.id}`}
                        className="group flex flex-col bg-surface border border-zinc-800 p-6 clip-corner-sm hover:border-primary-500/50 transition-all hover:bg-zinc-900"
                     >
                        <div className="flex items-start justify-between mb-4">
                           <div className="p-3 bg-black border border-zinc-800 text-zinc-400 group-hover:text-primary-400 group-hover:border-primary-500/30 transition-colors">
                              <IconComponent size={24} />
                           </div>
                           <ChevronRight className="text-zinc-700 group-hover:text-white transition-colors" />
                        </div>
                        <h3 className="text-lg font-bold text-white group-hover:text-primary-400 transition-colors mb-2">
                           {test.title}
                        </h3>
                        <p className="text-sm text-zinc-500 leading-relaxed mb-4 flex-grow">
                           {test.description}
                        </p>
                        <div className="mt-auto pt-4 border-t border-zinc-800/50 flex items-center gap-2 text-[10px] text-zinc-600 font-mono uppercase">
                           <span>Est. Time: {test.estimatedTime}</span>
                        </div>
                     </Link>
                  );
               })}
            </div>

            {/* Visual FAQ Section */}
            <div className="border-t border-zinc-800 pt-12">
                <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
                    <HelpCircle size={20} className="text-zinc-500" />
                    <span>Common Questions</span>
                </h2>
                <div className="space-y-4">
                    {meta.faqs.map((faq, idx) => (
                        <div key={idx} className="bg-zinc-900/30 border border-zinc-800/50 p-6 rounded hover:border-zinc-700 transition-colors">
                            <h3 className="text-white font-bold mb-2">{faq.question}</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed">{faq.answer}</p>
                        </div>
                    ))}
                </div>
            </div>
         </div>

         {/* Sidebar (SEO Rich Text) */}
         <div className="lg:col-span-4">
            <div className="bg-zinc-900/30 border border-zinc-800 p-8 clip-corner-lg sticky top-24">
               <article 
                  className="prose prose-invert prose-sm max-w-none prose-headings:text-zinc-200 prose-p:text-zinc-400"
                  dangerouslySetInnerHTML={{ __html: meta.seoContent }}
               />
               
               <div className="mt-8 pt-8 border-t border-zinc-800">
                  <h4 className="text-xs font-bold text-white mb-3">Related Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                     {meta.keywords.map(kw => (
                        <span key={kw} className="text-[10px] bg-black border border-zinc-800 px-2 py-1 rounded text-zinc-500">
                           #{kw}
                        </span>
                     ))}
                  </div>
               </div>
            </div>
         </div>

      </div>
    </div>
  );
}
