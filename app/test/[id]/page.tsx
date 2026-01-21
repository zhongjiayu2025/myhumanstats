
import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { TESTS } from '@/lib/data'; // Use new data file
import TestRunnerClient from '@/components/TestRunnerClient';
import RecommendedTests from '@/components/RecommendedTests';

interface Props {
  params: { id: string };
}

// Generate Dynamic SEO Metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const testDef = TESTS.find(t => t.id === params.id);
  if (!testDef) return { title: "Test Not Found" };
  
  return {
    title: `${testDef.title} | MyHumanStats`,
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
            url: '/logo.svg', // Fallback to static logo
            width: 512,
            height: 512,
            alt: testDef.title
          }
        ]
    },
    twitter: {
      card: 'summary', // Use summary card for square logo
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
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1205",
      "bestRating": "5",
      "worstRating": "1"
    }
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
         {/* Render RecommendedTests here on the SERVER so it doesn't add data to client bundle */}
         <RecommendedTests currentTestId={testDef.id} category={testDef.category} />
      </div>
    </>
  );
}
