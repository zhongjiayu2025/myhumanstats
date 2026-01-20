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
  
  // Construct clean canonical URL (strip query params)
  const currentUrl = window.location.href.split('?')[0]; 

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
      
      {!noIndex && <link rel="canonical" href={canonical || currentUrl} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical || currentUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

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
            "url": currentUrl,
            "applicationCategory": "HealthApplication",
            "operatingSystem": "Browser"
          })}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;