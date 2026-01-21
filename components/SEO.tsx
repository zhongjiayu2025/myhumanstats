
import React from 'react';

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  type?: 'website' | 'article';
  image?: string;
  noIndex?: boolean;
  schema?: Record<string, any>;
}

const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  canonical, 
  type = 'website',
  image = 'https://myhumanstats.org/og-image-default.png',
  noIndex = false,
  schema
}) => {
  // In Next.js App Router, metadata is handled by the page export.
  // This component is kept as a no-op for compatibility with shared components.
  return null;
};

export default SEO;
