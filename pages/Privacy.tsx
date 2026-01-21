import React from 'react';
import { Lock } from 'lucide-react';
import SEO from '../components/SEO';

const Privacy: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto py-12 animate-in slide-in-from-bottom-4 duration-500">
      <SEO 
        title="Privacy Policy"
        description="We prioritize your privacy. MyHumanStats uses a local-first architecture, meaning your test data stays on your device and is never sent to our servers."
      />
      
      <div className="mb-12 border-b border-zinc-800 pb-8">
        <div className="flex items-center gap-3 mb-4">
           <Lock className="text-primary-500" size={24} />
           <span className="text-primary-500 font-mono text-xs uppercase tracking-widest">Legal Document</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-zinc-500 text-sm font-mono">Last Updated: January 20, 2026</p>
      </div>

      <div className="space-y-10 text-zinc-300 leading-relaxed font-sans text-sm md:text-base">
        
        <section>
          <h2 className="text-xl font-bold text-white mb-4">1. Introduction</h2>
          <p>
            Welcome to MyHumanStats ("we," "our," or "us"). We are committed to protecting your privacy. This Privacy Policy explains how we handle your information when you visit <strong>https://myhumanstats.org</strong>.
          </p>
          <p className="mt-4 p-4 bg-emerald-900/10 border border-emerald-900/50 rounded text-emerald-400 text-sm">
            <strong>TL;DR:</strong> We are a Local-First application. The data you generate from tests (scores, stats, history) is stored directly on your device. We do not have access to your individual test results.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-4">2. Information We Collect</h2>
          <h3 className="text-lg font-semibold text-white mt-6 mb-2">a. Personal Test Data</h3>
          <p>
            All inputs provided during tests (e.g., reaction times, answers to questionnaires, microphone input) are processed locally within your browser using JavaScript. The resulting scores are stored in your browser's <code>localStorage</code>. This data remains on your device until you clear your browser cache. <strong>We do not transmit this data to any backend server.</strong>
          </p>

          <h3 className="text-lg font-semibold text-white mt-6 mb-2">b. Automatically Collected Data</h3>
          <p>
            Like most websites, we may collect standard log information and use third-party analytics services (such as Google Analytics) to understand how visitors interact with our site. This data is anonymized and may include:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-zinc-400">
            <li>Browser type and version</li>
            <li>Operating system</li>
            <li>Referring website</li>
            <li>Pages visited and time spent</li>
            <li>General geographic location (country/city level)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-4">3. Use of Microphone</h2>
          <p>
            Certain tests (e.g., Vocal Range Test) require access to your device's microphone.
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-zinc-400">
            <li><strong>Permission:</strong> The browser will ask for your explicit permission before accessing the microphone.</li>
            <li><strong>Processing:</strong> Audio data is processed in real-time (using the Web Audio API) solely to detect pitch/frequency.</li>
            <li><strong>No Recording:</strong> No audio is recorded, saved, or uploaded to any server. The audio stream is discarded immediately after processing.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-4">4. Cookies and Tracking Technologies</h2>
          <p>
            We use local storage to save your test progress. We may also use cookies from third-party partners (like Google AdSense or Analytics) to serve relevant ads or analyze traffic. You can choose to disable cookies through your browser settings, though this may affect site functionality.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-4">5. Third-Party Links</h2>
          <p>
            Our website may contain links to other websites. We are not responsible for the privacy practices of other sites. We encourage users to read the privacy statements of any other site that collects personally identifiable information.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-4">6. Changes to This Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-4">7. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
            <br />
            <a href="mailto:info@myhumanstats.org" className="text-primary-400 hover:underline mt-2 inline-block">info@myhumanstats.org</a>
          </p>
        </section>

      </div>
    </div>
  );
};

export default Privacy;