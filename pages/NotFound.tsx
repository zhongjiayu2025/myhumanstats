import React from 'react';
import { Link } from 'react-router-dom';
import { WifiOff, Home, Database } from 'lucide-react';
import SEO from '../components/SEO';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
      <SEO 
        title="404 Not Found"
        description="Signal Lost. The page you are looking for does not exist."
        noIndex={true}
      />
      
      <div className="relative mb-8">
         <WifiOff size={80} className="text-zinc-800" />
         <div className="absolute inset-0 flex items-center justify-center">
            <WifiOff size={80} className="text-primary-500 animate-pulse opacity-50" />
         </div>
      </div>

      <h1 className="text-6xl font-black text-white tracking-tighter mb-2 glitch-text">404</h1>
      <h2 className="text-xl font-mono text-primary-500 uppercase tracking-widest mb-6">Signal Lost</h2>
      
      <p className="text-zinc-400 max-w-md mx-auto mb-10 leading-relaxed">
         The requested sector could not be located in the neural link. The path may be corrupted or restricted.
      </p>

      <div className="flex gap-4">
         <Link to="/" className="btn-primary flex items-center gap-2">
            <Home size={18} /> Return to Dashboard
         </Link>
         <Link to="/statistics" className="btn-secondary flex items-center gap-2">
            <Database size={18} /> View Statistics
         </Link>
      </div>
    </div>
  );
};

export default NotFound;