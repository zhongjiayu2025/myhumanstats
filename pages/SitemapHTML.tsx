import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Activity, Layers, Book } from 'lucide-react';
import SEO from '../components/SEO';
import { TESTS } from '../lib/core';
import { BLOG_POSTS } from '../lib/blogData';
import { TestCategory } from '../types';

const SitemapHTML: React.FC = () => {
  const categories = Object.values(TestCategory);

  return (
    <div className="max-w-4xl mx-auto py-12 animate-in fade-in">
      <SEO 
        title="Sitemap"
        description="Complete list of all cognitive, auditory, and visual tests available on MyHumanStats, along with research articles."
      />

      <div className="mb-12 border-b border-zinc-800 pb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Site Index</h1>
        <p className="text-zinc-500 font-mono text-sm">Directory Listing of All Modules</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        
        {/* Tests Column */}
        <div className="space-y-10">
          <div className="flex items-center gap-2 text-primary-400 mb-6">
             <Activity size={20} />
             <h2 className="text-xl font-bold uppercase tracking-widest">Interactive Tests</h2>
          </div>

          {categories.map(cat => {
             const catTests = TESTS.filter(t => t.category === cat);
             if (catTests.length === 0) return null;

             return (
               <div key={cat} className="mb-8">
                 <h3 className="text-sm font-bold text-white bg-zinc-900/50 p-2 border-l-2 border-primary-500 mb-4">{cat} Module</h3>
                 <ul className="space-y-2 pl-4 border-l border-zinc-800 ml-1">
                   {catTests.map(test => (
                     <li key={test.id}>
                       <Link to={`/test/${test.id}`} className="text-zinc-400 hover:text-white hover:underline decoration-zinc-700 underline-offset-4 text-sm block py-1 transition-colors">
                         {test.title}
                       </Link>
                     </li>
                   ))}
                 </ul>
               </div>
             );
          })}
        </div>

        {/* Content Column */}
        <div className="space-y-10">
           
           {/* Blog Section */}
           <div>
              <div className="flex items-center gap-2 text-emerald-400 mb-6">
                 <Book size={20} />
                 <h2 className="text-xl font-bold uppercase tracking-widest">Research Log</h2>
              </div>
              <ul className="space-y-4">
                 {BLOG_POSTS.map(post => (
                    <li key={post.slug} className="group">
                       <Link to={`/blog/${post.slug}`} className="block">
                          <span className="text-zinc-300 font-bold text-sm group-hover:text-emerald-400 transition-colors block mb-1">
                             {post.title}
                          </span>
                          <span className="text-[10px] text-zinc-600 font-mono uppercase">
                             {post.date} • {post.category}
                          </span>
                       </Link>
                    </li>
                 ))}
              </ul>
           </div>

           {/* Static Pages */}
           <div>
              <div className="flex items-center gap-2 text-zinc-400 mb-6">
                 <Layers size={20} />
                 <h2 className="text-xl font-bold uppercase tracking-widest">System Pages</h2>
              </div>
              <ul className="space-y-2">
                 <li><Link to="/" className="text-zinc-400 hover:text-white text-sm">Dashboard / Home</Link></li>
                 <li><Link to="/about" className="text-zinc-400 hover:text-white text-sm">About Methodology</Link></li>
                 <li><Link to="/contact" className="text-zinc-400 hover:text-white text-sm">Contact Support</Link></li>
                 <li><Link to="/privacy" className="text-zinc-400 hover:text-white text-sm">Privacy Policy</Link></li>
                 <li><Link to="/terms" className="text-zinc-400 hover:text-white text-sm">Terms of Service</Link></li>
              </ul>
           </div>

        </div>
      </div>
    </div>
  );
};

export default SitemapHTML;