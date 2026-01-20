import React from 'react';
import { Mail, MessageSquare, ExternalLink } from 'lucide-react';
import SEO from '../components/SEO';

const Contact: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto py-20 animate-in fade-in zoom-in duration-500">
      <SEO 
        title="Contact Us"
        description="Get in touch with the MyHumanStats team for feedback, bug reports, or partnership inquiries."
      />
      
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Initialize Connection</h1>
        <p className="text-zinc-400">
          Have a feature request, bug report, or partnership inquiry?
        </p>
      </div>

      <div className="bg-surface border border-zinc-800 p-10 clip-corner-lg relative overflow-hidden group">
        <div className="absolute inset-0 bg-grid opacity-10"></div>
        
        <div className="relative z-10 flex flex-col items-center gap-8">
           
           <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-700 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
              <Mail size={32} className="text-primary-400" />
           </div>

           <div className="text-center space-y-2">
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Official Channel</span>
              <a 
                href="mailto:info@myhumanstats.org" 
                className="block text-2xl md:text-3xl font-mono font-bold text-white hover:text-primary-400 transition-colors border-b-2 border-transparent hover:border-primary-500 pb-1"
              >
                info@myhumanstats.org
              </a>
           </div>

           <div className="w-full h-px bg-zinc-800 my-2"></div>

           <div className="text-sm text-zinc-500 leading-relaxed text-center max-w-md">
              <p>
                We aim to respond to all valid signal transmissions within 48 hours. 
                For bug reports, please include your browser version and device type.
              </p>
           </div>

        </div>
      </div>

      <div className="mt-12 grid grid-cols-2 gap-4">
         <a href="#" className="flex items-center justify-center gap-3 p-4 bg-zinc-900 border border-zinc-800 hover:border-primary-500/50 transition-all group rounded">
            <MessageSquare size={18} className="text-zinc-500 group-hover:text-white" />
            <span className="text-zinc-400 group-hover:text-white text-sm">Feedback Form</span>
         </a>
         <a href="#" className="flex items-center justify-center gap-3 p-4 bg-zinc-900 border border-zinc-800 hover:border-primary-500/50 transition-all group rounded">
            <ExternalLink size={18} className="text-zinc-500 group-hover:text-white" />
            <span className="text-zinc-400 group-hover:text-white text-sm">Twitter / X</span>
         </a>
      </div>
    </div>
  );
};

export default Contact;