import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { Book, ArrowLeft, ExternalLink } from 'lucide-react';
import { TESTS } from '@/lib/core';
import Breadcrumbs from '@/components/Breadcrumbs';

interface Props {
  params: { slug: string };
}

const getAllConcepts = () => {
  const concepts: { term: string; definition: string; testId: string; testTitle: string; slug: string }[] = [];
  TESTS.forEach(test => {
    if (test.concepts) {
      test.concepts.forEach(c => {
        concepts.push({
          term: c.term,
          definition: c.definition,
          testId: test.id,
          testTitle: test.title,
          slug: c.term.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        });
      });
    }
  });
  return concepts;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const concept = getAllConcepts().find(c => c.slug === params.slug);
  if (!concept) return { title: "Term Not Found" };

  return {
    title: `${concept.term}: Definition & Meaning | MyHumanStats Glossary`,
    description: `What is ${concept.term}? ${concept.definition}. Learn more about ${concept.term} in the context of the ${concept.testTitle}.`,
    openGraph: {
        title: `What is ${concept.term}?`,
        description: concept.definition
    }
  };
}

export async function generateStaticParams() {
  return getAllConcepts().map(c => ({
    slug: c.slug,
  }));
}

export default function GlossaryEntryPage({ params }: Props) {
  const concept = getAllConcepts().find(c => c.slug === params.slug);

  if (!concept) {
    notFound();
  }

  // Schema.org DefinedTerm
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "DefinedTerm",
    "name": concept.term,
    "description": concept.definition,
    "inDefinedTermSet": "https://myhumanstats.org/glossary",
    "termCode": concept.slug
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 animate-in fade-in">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <Breadcrumbs items={[
          { label: 'Glossary', path: '/glossary' },
          { label: concept.term }
      ]} />

      <div className="mt-8 bg-surface border border-zinc-800 p-12 clip-corner-lg relative overflow-hidden min-h-[400px] flex flex-col justify-center">
         <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none"></div>
         <div className="absolute -right-10 -top-10 text-zinc-800 opacity-20">
            <Book size={300} />
         </div>

         <div className="relative z-10">
             <div className="text-primary-500 font-mono text-sm uppercase tracking-widest mb-4">
                Definition
             </div>
             <h1 className="text-5xl md:text-6xl font-bold text-white mb-8 tracking-tight">
                {concept.term}
             </h1>
             <p className="text-xl md:text-2xl text-zinc-300 leading-relaxed font-light border-l-4 border-primary-500 pl-6 mb-12">
                {concept.definition}
             </p>

             <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-lg inline-block">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-2">Context</h3>
                <div className="flex items-center gap-2">
                    <span className="text-zinc-400 text-sm">This concept is evaluated in:</span>
                    <Link 
                        href={`/test/${concept.testId}`}
                        className="text-primary-400 hover:text-white font-bold flex items-center gap-1 transition-colors"
                    >
                        {concept.testTitle} <ExternalLink size={14} />
                    </Link>
                </div>
             </div>
         </div>
      </div>

      <div className="mt-8 text-center">
         <Link href="/glossary" className="text-zinc-500 hover:text-white flex items-center justify-center gap-2 transition-colors">
            <ArrowLeft size={16} /> Return to Index
         </Link>
      </div>
    </div>
  );
}