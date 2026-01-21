
import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  type?: 'website' | 'article';
  image?: string;
  noIndex?: boolean;
  schema?: Record<string, any>; // Allow passing custom schema
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
  const siteTitle = 'MyHumanStats';
  const fullTitle = title === siteTitle ? siteTitle : `${title} | ${siteTitle}`;
  
  const baseUrl = 'https://myhumanstats.org';
  const currentPath = window.location.pathname;
  const canonicalUrl = canonical || `${baseUrl}${currentPath === '/' ? '' : currentPath}`;

  // Default Schema if none provided
  const defaultSchema = {
    "@context": "https://schema.org",
    "@type": type === 'article' ? 'BlogPosting' : 'WebApplication',
    "name": fullTitle,
    "description": description,
    "url": canonicalUrl,
    "applicationCategory": "HealthApplication",
    "operatingSystem": "Browser",
    "browserRequirements": "Requires JavaScript",
    "author": {
      "@type": "Organization",
      "name": "MyHumanStats"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="author" content="MyHumanStats" />
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}
      
      {!noIndex && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="MyHumanStats" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@myhumanstats" />
      <meta name="twitter:creator" content="@myhumanstats" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Schema.org JSON-LD */}
      {!noIndex && (
        <script type="application/ld+json">
          {JSON.stringify(schema || defaultSchema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
