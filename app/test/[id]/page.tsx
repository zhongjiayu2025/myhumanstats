
import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { TESTS } from '@/lib/data';
import { BLOG_POSTS } from '@/lib/blogData'; // Point 4: Import Blog posts
import TestRunnerClient from '@/components/TestRunnerClient';
import RecommendedTests from '@/components/RecommendedTests';
import Link from 'next/link';
import { FileText, ChevronRight } from 'lucide-react';

interface Props {
  params: { id: string };
}

// Generate Dynamic SEO Metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const testDef = TESTS.find(t => t.id === params.id);
  if (!testDef) return { title: "Test Not Found" };
  
  return {
    title: `${testDef.title} - Online Benchmark | MyHumanStats`,
    description: testDef.description,
    alternates: {
      canonical: `/test/${testDef.id}`,
    },
    openGraph: {
        title: `${testDef.title} | Online Benchmark`,
        description: testDef.description,
        url: `https://myhumanstats.org/test/${testDef.id}`,
        images: [
          {
            url: '/logo.svg', // Point 1: Static fallback
            width: 512,
            height: 512,
            alt: testDef.title
          }
        ]
    },
    twitter: {
      card: 'summary',
      title: testDef.title,
      description: testDef.description,
      images: ['/logo.svg'],
    }
  };
}

// Generate Static Params for SSG
export async function generateStaticParams() {
  return TESTS.map((test) => ({
    id: test.id,
  }));
}

// Server Component
export default function TestPage({ params }: Props) {
  const testDef = TESTS.find(t => t.id === params.id);

  if (!testDef) {
    notFound();
  }

  // Point 4: Find related blog posts
  const relatedPosts = BLOG_POSTS.filter(p => p.relatedTestId === testDef.id);

  // Inject JSON-LD Schema on server side
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
    "screenshot": `https://myhumanstats.org/logo.svg`,
    "datePublished": "2026-01-01",
    "dateModified": new Date().toISOString().split('T')[0],
    // Point 3: Removed aggregateRating to avoid Google Manual Action penalty
  };

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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      {howToSchema && (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
        />
      )}
      {faqSchema && (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      
      <TestRunnerClient id={params.id} />
      
      <div className="max-w-6xl mx-auto px-4 md:px-6 pb-12">
         
         {/* Point 4: Related Research Section */}
         {relatedPosts.length > 0 && (
            <div className="mb-12">
               <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <FileText size={20} className="text-emerald-500" />
                  Related Research
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {relatedPosts.map(post => (
                     <Link 
                        key={post.slug}
                        href={`/blog/${post.slug}`}
                        className="group bg-zinc-900/30 border border-zinc-800 p-6 rounded-lg hover:bg-zinc-900 transition-colors"
                     >
                        <h4 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors mb-2">
                           {post.title}
                        </h4>
                        <p className="text-sm text-zinc-400 line-clamp-2 mb-4">
                           {post.excerpt}
                        </p>
                        <div className="flex items-center text-xs font-mono text-emerald-500 gap-1">
                           READ_FULL_LOG <ChevronRight size={12} />
                        </div>
                     </Link>
                  ))}
               </div>
            </div>
         )}

         <RecommendedTests currentTestId={testDef.id} category={testDef.category} />
      </div>
    </>
  );
}
