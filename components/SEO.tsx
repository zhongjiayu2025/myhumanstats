
import React from 'react';
import { Helmet } from 'react-helmet-async';

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
  // This component is kept for compatibility with legacy components.
  // We render null to avoid duplicating tags managed by Next.js head.
  // If you need client-side dynamic title updates, uncomment the Helmet block.
  
  /* 
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
    </Helmet>
  );
  */

  return null;
};

export default SEO;
