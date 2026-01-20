import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  type?: 'website' | 'article';
  image?: string;
  noIndex?: boolean;
}

const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  canonical, 
  type = 'website',
  image = 'https://myhumanstats.org/og-image-default.png',
  noIndex = false
}) => {
  const siteTitle = 'MyHumanStats';
  const fullTitle = title === siteTitle ? siteTitle : `${title} | ${siteTitle}`;
  
  // SEO Best Practice: Enforce production domain and strip query parameters
  // This prevents ?fbclid=... or ?ref=... from creating duplicate content issues
  const baseUrl = 'https://myhumanstats.org';
  const currentPath = window.location.pathname;
  // If a specific canonical is passed, use it. Otherwise, construct it from base + path (no query params)
  const canonicalUrl = canonical || `${baseUrl}${currentPath === '/' ? '' : currentPath}`;

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
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
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Schema.org JSON-LD */}
      {!noIndex && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": type === 'article' ? 'BlogPosting' : 'WebApplication',
            "name": fullTitle,
            "description": description,
            "url": canonicalUrl,
            "applicationCategory": "HealthApplication",
            "operatingSystem": "Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            }
          })}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;