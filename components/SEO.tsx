
import React from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  type?: 'website' | 'article';
  image?: string;
  noIndex?: boolean;
  schema?: Record<string, any>;
}

const SEO: React.FC<SEOProps> = ({ schema }) => {
  // Metadata is now handled by Next.js generateMetadata in page.tsx files.
  // This component acts as a compatibility layer to inject JSON-LD Schema if needed via client components,
  // though optimally schema is also injected via page.tsx.
  
  if (!schema) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

export default SEO;
