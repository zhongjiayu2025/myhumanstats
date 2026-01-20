
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Layout from './components/Layout';
import { SettingsProvider } from './lib/settings'; // Import Provider
import Dashboard from './pages/Dashboard';
import TestPage from './pages/TestPage';
import CategoryPage from './pages/CategoryPage';
import Glossary from './pages/Glossary';
import Statistics from './pages/Statistics';
import ToolsIndex from './pages/ToolsIndex';
import ToneGenPage from './pages/tools/ToneGenPage';
import BPMPage from './pages/tools/BPMPage';
import DeadPixelPage from './pages/tools/DeadPixelPage';
import StereoTestPage from './pages/tools/StereoTestPage';
import RefreshRatePage from './pages/tools/RefreshRatePage';
import MicTestPage from './pages/tools/MicTestPage';
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
    
    /* Scroll Margin for Anchor Links */
    .scroll-mt-32 { scroll-margin-top: 8rem; }
  `}</style>
);

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <SettingsProvider>
        <GlobalStyles />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/test/:id" element={<TestPage />} />
              <Route path="/category/:categoryId" element={<CategoryPage />} />
              <Route path="/glossary" element={<Glossary />} />
              <Route path="/statistics" element={<Statistics />} />
              
              {/* Tools Routes */}
              <Route path="/tools" element={<ToolsIndex />} />
              <Route path="/tools/tone-generator" element={<ToneGenPage />} />
              <Route path="/tools/bpm-counter" element={<BPMPage />} />
              <Route path="/tools/dead-pixel-test" element={<DeadPixelPage />} />
              <Route path="/tools/stereo-test" element={<StereoTestPage />} />
              <Route path="/tools/hz-test" element={<RefreshRatePage />} />
              <Route path="/tools/mic-test" element={<MicTestPage />} />

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
        </BrowserRouter>
      </SettingsProvider>
    </HelmetProvider>
  );
};

export default App;
