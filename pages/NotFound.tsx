
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { WifiOff, Home, Database, Search } from 'lucide-react';
import SEO from '../components/SEO';
import { Helmet } from 'react-helmet-async';

const NotFound: React.FC = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // In a real app this would route to /search, here we could open the command palette 
      // or redirect to sitemap. For now, let's redirect to Tools which is a likely intent
      // or simply prevent action since we rely on CommandPalette.
      // Let's emulate "Command Palette" opening logic or a dedicated search route if we had one.
      // Simulating search by redirecting to tools/blog if keywords match is a hack.
      // Best UX: Just open home or sitemap.
      navigate('/sitemap');
    }
  };

  const searchSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://myhumanstats.org/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
      <SEO 
        title="404 Not Found"
        description="Signal Lost. The page you are looking for does not exist."
        noIndex={true} // Critical for SEO to prevent soft 404 indexing
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(searchSchema)}</script>
      </Helmet>
      
      <div className="relative mb-8">
         <WifiOff size={80} className="text-zinc-800" />
         <div className="absolute inset-0 flex items-center justify-center">
            <WifiOff size={80} className="text-primary-500 animate-pulse opacity-50" />
         </div>
      </div>

      <h1 className="text-6xl font-black text-white tracking-tighter mb-2 glitch-text">404</h1>
      <h2 className="text-xl font-mono text-primary-500 uppercase tracking-widest mb-6">Signal Lost</h2>
      
      <p className="text-zinc-400 max-w-md mx-auto mb-8 leading-relaxed">
         The requested sector could not be located in the neural link. The path may be corrupted or restricted.
      </p>

      {/* Retention Search Bar */}
      <form onSubmit={handleSearch} className="relative max-w-xs w-full mx-auto mb-10">
         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-zinc-500" />
         </div>
         <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for tests..." 
            className="w-full bg-zinc-900 border border-zinc-700 text-white text-sm rounded-full py-2 pl-10 pr-4 focus:outline-none focus:border-primary-500 transition-colors"
         />
      </form>

      <div className="flex gap-4">
         <Link to="/" className="btn-primary flex items-center gap-2">
            <Home size={18} /> Return to Dashboard
         </Link>
         <Link to="/sitemap" className="btn-secondary flex items-center gap-2">
            <Database size={18} /> View Sitemap
         </Link>
      </div>
    </div>
  );
};

export default NotFound;
