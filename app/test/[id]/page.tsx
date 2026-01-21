
import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { TESTS } from '@/lib/core';
import TestRunnerClient from '@/components/TestRunnerClient';

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
    openGraph: {
        title: `${testDef.title} | Online Benchmark`,
        description: testDef.description
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
    "screenshot": "https://myhumanstats.org/og-image-default.png",
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
    </>
  );
}
