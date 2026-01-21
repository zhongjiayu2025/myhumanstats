
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

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <SettingsProvider>
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
