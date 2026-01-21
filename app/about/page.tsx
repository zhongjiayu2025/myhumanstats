
import React from 'react';
import { Activity, Shield, Cpu, Globe, Users, CheckCircle } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "About Us | MyHumanStats",
  description: "Learn about MyHumanStats, a privacy-first platform for quantifying human perception and cognition using local-first browser technologies."
};

const About = () => {
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "MyHumanStats",
    "url": "https://myhumanstats.org",
    "logo": "https://myhumanstats.org/logo.svg",
    "description": "MyHumanStats is a digital laboratory dedicated to the measurement of human perception, cognition, and personality using local-first browser technologies.",
    "foundingDate": "2024",
    "knowsAbout": [
      "Psychometrics",
      "Audiometry",
      "Cognitive Science",
      "Reaction Time",
      "Color Vision Deficiency",
      "Web Audio API"
    ],
    "sameAs": [
      "https://github.com/myhumanstats",
      "https://twitter.com/myhumanstats"
    ]
  };

  return (
    <div className="max-w-4xl mx-auto py-12 animate-in fade-in duration-500">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
          Quantify Your <span className="text-primary-400">Existence</span>
        </h1>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          MyHumanStats is a digital laboratory dedicated to the measurement of human perception, cognition, and personality. We turn biological traits into actionable data.
        </p>
      </div>

      {/* Mission Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
        <div className="bg-surface border border-zinc-800 p-8 clip-corner-sm">
          <Activity className="text-primary-500 mb-4" size={32} />
          <h3 className="text-xl font-bold text-white mb-3">The Quantified Self</h3>
          <p className="text-zinc-400 text-sm leading-relaxed">
            In an age of data, knowing your own hardware is essential. From reaction times measured in milliseconds to auditory frequency thresholds, we provide the tools to benchmark your biological performance against global standards.
          </p>
        </div>
        
        <div className="bg-surface border border-zinc-800 p-8 clip-corner-sm">
          <Shield className="text-emerald-500 mb-4" size={32} />
          <h3 className="text-xl font-bold text-white mb-3">Privacy by Architecture</h3>
          <p className="text-zinc-400 text-sm leading-relaxed">
            We believe your biological data belongs to you. That's why MyHumanStats operates on a <strong>Local-First</strong> architecture. Your test results are stored in your browser's local storage and are never transmitted to our servers.
          </p>
        </div>

        <div className="bg-surface border border-zinc-800 p-8 clip-corner-sm">
          <Cpu className="text-amber-500 mb-4" size={32} />
          <h3 className="text-xl font-bold text-white mb-3">Algorithmic Precision</h3>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Our tests utilize standard web APIs (Web Audio, Canvas) to deliver precise stimuli. Whether it's the exact Hertz of a tone or the millisecond timing of a reflex, we strive for the highest accuracy a browser can provide.
          </p>
        </div>

        <div className="bg-surface border border-zinc-800 p-8 clip-corner-sm">
          <Globe className="text-purple-500 mb-4" size={32} />
          <h3 className="text-xl font-bold text-white mb-3">Universal Access</h3>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Self-knowledge should be free. MyHumanStats is committed to keeping our core assessment tools open and accessible to anyone with an internet connection, regardless of device or location.
          </p>
        </div>
      </div>

      {/* Methodology & E-E-A-T */}
      <div className="prose prose-invert max-w-none border-t border-zinc-800 pt-12 mb-16">
        <h2 className="text-2xl font-bold text-white mb-4">Our Methodology</h2>
        <div className="text-zinc-400 space-y-4 text-sm leading-7">
          <p>
            Established in the digital era, MyHumanStats (MHS) bridges the gap between clinical-style assessments and casual internet quizzes. While traditional medical tests require appointments and specialized equipment, MHS leverages modern browser capabilities to offer immediate screening tools.
          </p>
          <p>
            All tests are developed based on established scientific paradigms:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-zinc-300 font-mono text-xs">
            <li><strong>AUDITORY:</strong> Tests adhere to ISO 7029:2017 standards for audiometric thresholds.</li>
            <li><strong>VISUAL:</strong> Color vision modules utilize standard Ishihara pseudoisochromatic plate generation algorithms.</li>
            <li><strong>COGNITIVE:</strong> Reaction time and memory tasks are modeled after the Corsi Block-Tapping Task and Simple Reaction Time (SRT) protocols used in neuropsychology.</li>
            <li><strong>PERSONALITY:</strong> Psychometric profiling is based on the IPIP-NEO (Big Five) and ASRS-v1.1 (WHO) constructs.</li>
          </ul>
        </div>
      </div>

      {/* Review Board / Trust */}
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-8">
          <h3 className="text-white font-bold mb-6 flex items-center gap-2">
              <Users size={20} className="text-primary-500"/> Scientific Review
          </h3>
          <p className="text-sm text-zinc-400 mb-6">
              Our content is regularly reviewed to ensure alignment with current scientific consensus. While MyHumanStats is an educational tool and not a medical device, we strive for academic rigor.
          </p>
          <div className="flex flex-col md:flex-row gap-6">
              <div className="flex items-start gap-3">
                  <CheckCircle size={16} className="text-emerald-500 mt-1" />
                  <div>
                      <strong className="text-white text-sm block">Reference-Based</strong>
                      <span className="text-xs text-zinc-500">Every module cites its academic sources (e.g., Ishihara, 1917; Miller, 1956).</span>
                  </div>
              </div>
              <div className="flex items-start gap-3">
                  <CheckCircle size={16} className="text-emerald-500 mt-1" />
                  <div>
                      <strong className="text-white text-sm block">Transparent Algorithms</strong>
                      <span className="text-xs text-zinc-500">We publish the exact parameters used in our generators (e.g., millisecond timing, frequency steps).</span>
                  </div>
              </div>
          </div>
      </div>

    </div>
  );
};

export default About;
