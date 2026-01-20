import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ChevronRight } from 'lucide-react';
import SEO from '../components/SEO';
import { BLOG_POSTS } from '../lib/blogData';

const BlogIndex: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto py-12 animate-in fade-in duration-500">
      <SEO 
        title="Research Log"
        description="Deep dives into the science of human performance. Read articles about hearing loss, reaction time science, color blindness types, and more."
      />
      
      {/* Header */}
      <div className="mb-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
          Research <span className="text-primary-400">Log</span>
        </h1>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Deep dives into the science of human performance. Analysis on auditory thresholds, visual anomalies, and cognitive reaction times.
        </p>
      </div>

      {/* Featured Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {BLOG_POSTS.map((post) => (
          <Link 
            to={`/blog/${post.slug}`} 
            key={post.slug}
            className="group flex flex-col bg-surface border border-zinc-800 clip-corner-sm hover:border-primary-500/50 transition-all duration-300 hover:transform hover:-translate-y-1"
          >
            {/* Image Container - Aspect Ratio Fix for CLS */}
            <div className="relative aspect-video w-full overflow-hidden border-b border-zinc-800 bg-zinc-900">
               <img 
                 src={post.coverImage} 
                 alt={post.title}
                 loading="lazy"
                 width="600"
                 height="338"
                 className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
               />
               <div className="absolute top-4 left-4 bg-black/80 backdrop-blur px-3 py-1 border border-zinc-700">
                  <span className="text-[10px] font-mono text-primary-400 uppercase tracking-wider">{post.category}</span>
               </div>
            </div>

            {/* Content */}
            <div className="p-6 flex-1 flex flex-col">
               <div className="flex items-center gap-4 text-[10px] text-zinc-500 font-mono mb-4">
                  <div className="flex items-center gap-1">
                     <Calendar size={12} />
                     <span>{post.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                     <Clock size={12} />
                     <span>{post.readTime}</span>
                  </div>
               </div>

               <h2 className="text-xl font-bold text-white mb-3 group-hover:text-primary-400 transition-colors leading-tight">
                  {post.title}
               </h2>
               
               <p className="text-sm text-zinc-400 leading-relaxed mb-6 line-clamp-3">
                  {post.excerpt}
               </p>

               <div className="mt-auto pt-6 border-t border-zinc-800/50 flex justify-between items-center">
                  <div className="flex gap-2">
                     {post.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-[10px] text-zinc-600 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">#{tag}</span>
                     ))}
                  </div>
                  <span className="text-primary-500 text-xs font-mono flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                     READ_FILE <ChevronRight size={12} />
                  </span>
               </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Newsletter / CTA */}
      <div className="mt-24 bg-gradient-to-r from-zinc-900 to-black border border-zinc-800 p-8 md:p-12 clip-corner-lg text-center relative overflow-hidden">
         <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none"></div>
         <div className="relative z-10">
            <h3 className="text-2xl font-bold text-white mb-4">Stay Updated</h3>
            <p className="text-zinc-400 max-w-lg mx-auto mb-8">
               New tests and research articles are released monthly. Join our data-driven community.
            </p>
            <div className="flex justify-center gap-4">
               <a href="https://twitter.com" target="_blank" rel="noreferrer" className="btn-secondary">Follow on X</a>
               <Link to="/contact" className="btn-primary">Contact Us</Link>
            </div>
         </div>
      </div>

    </div>
  );
};

export default BlogIndex;