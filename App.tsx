import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import TestPage from './pages/TestPage';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import BlogIndex from './pages/BlogIndex';
import BlogPost from './pages/BlogPost';
import SitemapHTML from './pages/SitemapHTML';
import NotFound from './pages/NotFound';

// Global styles for custom components
const GlobalStyles = () => (
  <style>{`
    .btn-primary {
      @apply relative overflow-hidden bg-white text-black font-semibold rounded-full px-8 py-3 transition-all duration-300 hover:bg-zinc-200 hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(255,255,255,0.1)];
    }
    .btn-secondary {
      @apply bg-transparent text-zinc-400 font-medium rounded-full px-8 py-3 border border-zinc-800 transition-colors hover:border-zinc-600 hover:text-white;
    }
    .text-gradient {
      @apply text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-500;
    }
    .text-gradient-accent {
      @apply text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400;
    }
    /* Typography Utilities for Blog */
    .prose h2 { margin-top: 2.5em; margin-bottom: 1em; font-size: 1.75em; }
    .prose h3 { margin-top: 2em; margin-bottom: 0.75em; font-size: 1.3em; }
    .prose p { margin-bottom: 1.5em; }
    .prose li { margin-bottom: 0.5em; }
    .prose .lead { font-size: 1.25em; color: #a1a1aa; font-weight: 300; margin-bottom: 2em; }
  `}</style>
);

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <GlobalStyles />
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/test/:id" element={<TestPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/blog" element={<BlogIndex />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/sitemap" element={<SitemapHTML />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </HashRouter>
    </HelmetProvider>
  );
};

export default App;