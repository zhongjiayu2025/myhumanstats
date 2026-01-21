
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, Share2, Tag, ChevronRight, Activity, Volume2, StopCircle, List } from 'lucide-react';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';
import { BLOG_POSTS } from '../lib/blogData';
import { TESTS } from '../lib/core';
import { Helmet } from 'react-helmet-async';

const BlogPost: React.FC = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const post = BLOG_POSTS.find(p => p.slug === slug);
  const relatedTest = post ? TESTS.find(t => t.id === post.relatedTestId) : null;
  
  // TTS State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [toc, setToc] = useState<{id: string, text: string}[]>([]);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      setSpeechSupported(true);
    }
    
    // Generate ToC from H2/H3 tags in content string
    if (post) {
       const regex = /<h2.*?>(.*?)<\/h2>/g;
       const matches = [...post.content.matchAll(regex)];
       const generatedToc = matches.map((match) => {
          const text = match[1].replace(/<[^>]*>/g, ''); // strip inner html if any
          const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          return { id, text };
       });
       setToc(generatedToc);
    }

    return () => {
      window.speechSynthesis.cancel(); // Stop on unmount
    };
  }, [post]);

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      // Strip HTML tags for reading
      const div = document.createElement('div');
      div.innerHTML = post?.content || '';
      const text = div.textContent || div.innerText || '';
      
      const utterance = new SpeechSynthesisUtterance(`${post?.title}. ${post?.excerpt}. ${text}`);
      utterance.rate = 1;
      utterance.pitch = 1;
      
      // Attempt to find a good voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.lang === 'en-US' && v.name.includes('Google')) || voices[0];
      if(preferredVoice) utterance.voice = preferredVoice;

      utterance.onend = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  // Modify content to inject IDs for ToC
  // This is a lightweight way to add anchors without full parsing
  const processedContent = post?.content.replace(
     /<h2(.*?)>(.*?)<\/h2>/g, 
     (_, attrs, text) => {
        const id = text.replace(/<[^>]*>/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        return `<h2 id="${id}"${attrs}>${text}</h2>`;
     }
  );

  if (!post) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold text-white mb-4">404: DATA_NOT_FOUND</h1>
        <p className="text-zinc-400 mb-8">The requested article could not be retrieved from the archives.</p>
        <Link to="/blog" className="btn-primary">Return to Index</Link>
      </div>
    );
  }

  // Robust BlogPosting Schema
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "image": [post.coverImage],
    "datePublished": new Date(post.date).toISOString(),
    "dateModified": new Date(post.date).toISOString(), // Assume modified same as publish for now
    "author": {
      "@type": "Organization",
      "name": "MyHumanStats Research Team",
      "url": "https://myhumanstats.org"
    },
    "publisher": {
      "@type": "Organization",
      "name": "MyHumanStats",
      "logo": {
        "@type": "ImageObject",
        "url": "https://myhumanstats.org/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://myhumanstats.org/blog/${post.slug}`
    },
    "keywords": post.tags.join(", "),
    "articleSection": post.category,
    "wordCount": post.content.split(/\s+/).length
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <SEO 
        title={post.title}
        description={post.excerpt}
        image={post.coverImage}
        type="article"
      />
      <Helmet>
         <script type="application/ld+json">{JSON.stringify(blogSchema)}</script>
      </Helmet>
      
      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-30 pt-4 print:hidden">
         <Breadcrumbs items={[
            { label: 'Research Log', path: '/blog' },
            { label: post.title } 
         ]} />
      </div>

      {/* Hero Image */}
      <div className="w-full h-[400px] md:h-[500px] relative mb-12 -mt-10 print:h-[200px] print:mb-6">
         <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10 print:hidden"></div>
         <img 
            src={post.coverImage} 
            alt={post.title} 
            className="w-full h-full object-cover"
         />
         
         <div className="absolute bottom-0 left-0 w-full z-20 max-w-7xl mx-auto px-4 md:px-6 pb-12 print:relative print:pb-0 print:text-black">
            <Link to="/blog" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-6 text-sm font-mono uppercase tracking-widest transition-colors print:hidden">
               <ArrowLeft size={14} /> Back to Logs
            </Link>
            
            <div className="inline-block px-3 py-1 bg-primary-500/10 border border-primary-500/30 text-primary-400 text-xs font-mono uppercase tracking-wider mb-4 rounded print:border-black print:text-black">
               {post.category}
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white max-w-4xl leading-tight mb-6 text-shadow-lg print:text-black print:text-3xl print:text-shadow-none">
               {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-zinc-300 font-mono text-xs md:text-sm print:text-black">
               <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  <span>{post.date}</span>
               </div>
               <div className="flex items-center gap-2">
                  <Clock size={14} />
                  <span>{post.readTime}</span>
               </div>
               <div className="flex items-center gap-2 text-primary-400 print:text-black">
                  <Activity size={14} />
                  <span>Verified by MyHumanStats</span>
               </div>
            </div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
         
         {/* Main Content */}
         <div className="lg:col-span-8">
            
            {/* Audio Player Controls */}
            {speechSupported && (
               <div className="mb-8 p-4 bg-zinc-900/50 border border-zinc-800 rounded flex items-center justify-between print:hidden">
                  <div className="flex items-center gap-3">
                     <div className={`p-2 rounded-full ${isSpeaking ? 'bg-primary-500 text-black animate-pulse' : 'bg-zinc-800 text-zinc-400'}`}>
                        <Volume2 size={20} />
                     </div>
                     <div>
                        <div className="text-xs text-zinc-500 font-mono uppercase">Accessibility Audio</div>
                        <div className="text-sm font-bold text-white">{isSpeaking ? 'Reading Article...' : 'Listen to this article'}</div>
                     </div>
                  </div>
                  <button 
                     onClick={handleSpeak}
                     className="px-4 py-2 bg-white text-black text-xs font-bold uppercase rounded hover:bg-zinc-200 transition-colors flex items-center gap-2"
                  >
                     {isSpeaking ? <><StopCircle size={14}/> Stop</> : <><Volume2 size={14}/> Play</>}
                  </button>
               </div>
            )}

            <article 
               className="prose prose-invert prose-lg max-w-none prose-headings:font-bold prose-headings:text-white prose-p:text-zinc-300 prose-p:leading-relaxed prose-a:text-primary-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-white prose-li:text-zinc-300 prose-ul:list-disc prose-ol:list-decimal print:prose-black print:text-black scroll-mt-24"
               dangerouslySetInnerHTML={{ __html: processedContent || post.content }}
            />
            
            {/* Tags Footer */}
            <div className="mt-12 pt-8 border-t border-zinc-800 flex flex-wrap gap-2 print:hidden">
               <Tag size={16} className="text-zinc-500 mt-1" />
               {post.tags.map(tag => (
                  <span key={tag} className="text-xs bg-zinc-900 text-zinc-400 px-3 py-1 rounded-full border border-zinc-800">
                     #{tag}
                  </span>
               ))}
            </div>
         </div>

         {/* Sidebar */}
         <div className="lg:col-span-4 space-y-8 print:hidden">
            
            {/* CTA Card - Sticky */}
            <div className="sticky top-24 space-y-8">
               
               {/* Table of Contents */}
               {toc.length > 0 && (
                  <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded">
                     <h3 className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <List size={14} /> Contents
                     </h3>
                     <ul className="space-y-2 text-sm">
                        {toc.map((item, idx) => (
                           <li key={idx}>
                              <a 
                                 href={`#${item.id}`} 
                                 className="text-zinc-400 hover:text-primary-400 transition-colors block border-l-2 border-transparent hover:border-primary-500 pl-3 py-1"
                              >
                                 {item.text}
                              </a>
                           </li>
                        ))}
                     </ul>
                  </div>
               )}

               {/* Related Test Card */}
               {relatedTest && (
                  <div className="bg-surface border border-zinc-800 p-6 clip-corner-sm relative overflow-hidden group">
                     <div className="absolute top-0 left-0 w-full h-1 bg-primary-500"></div>
                     
                     <h3 className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-3">Related Module</h3>
                     <h4 className="text-xl font-bold text-white mb-2">{relatedTest.title}</h4>
                     <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
                        {relatedTest.description}
                     </p>
                     
                     <button 
                        onClick={() => navigate(`/test/${relatedTest.id}`)}
                        className="w-full btn-primary flex justify-center items-center gap-2 text-sm"
                     >
                        Run Diagnosis <ChevronRight size={14} />
                     </button>
                  </div>
               )}

               {/* Share Widget */}
               <div className="bg-black border border-zinc-800 p-6 rounded">
                  <h3 className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                     <Share2 size={14} /> Share Data
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                     <button className="py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs border border-zinc-700 transition-colors">
                        Twitter / X
                     </button>
                     <button className="py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs border border-zinc-700 transition-colors">
                        LinkedIn
                     </button>
                     <button className="py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs border border-zinc-700 transition-colors">
                        Facebook
                     </button>
                     <button className="py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs border border-zinc-700 transition-colors">
                        Copy Link
                     </button>
                  </div>
               </div>

            </div>
         </div>

      </div>
    </div>
  );
};

export default BlogPost;
