
import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbsProps {
  items: { label: string; path?: string }[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  const baseUrl = 'https://myhumanstats.org'; // Production URL

  // Generate Schema.org JSON-LD
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": baseUrl
      },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 2,
        "name": item.label,
        "item": item.path ? `${baseUrl}${item.path}` : undefined
      }))
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      
      <nav className="flex items-center text-[10px] md:text-xs font-mono text-zinc-400 mb-6 overflow-x-auto whitespace-nowrap pb-2 md:pb-0">
        <Link href="/" className="flex items-center gap-1 hover:text-primary-400 transition-colors">
          <Home size={12} />
          <span>HOME</span>
        </Link>
        
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <ChevronRight size={10} className="mx-2 text-zinc-600" />
            {item.path ? (
              <Link href={item.path} className="hover:text-primary-400 transition-colors uppercase tracking-wider">
                {item.label}
              </Link>
            ) : (
              <span className="text-zinc-300 uppercase tracking-wider font-bold">
                {item.label}
              </span>
            )}
          </React.Fragment>
        ))}
      </nav>
    </>
  );
};

export default Breadcrumbs;
