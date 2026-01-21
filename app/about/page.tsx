
import React from 'react';
import { Activity, Shield, Cpu, Globe } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "About Us | MyHumanStats",
  description: "Learn about MyHumanStats, a privacy-first platform for quantifying human perception and cognition using local-first browser technologies."
};

const About = () => {
  // Enhanced Organization Schema
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

      {/* Story / Context */}
      <div className="prose prose-invert max-w-none border-t border-zinc-800 pt-12">
        <h2 className="text-2xl font-bold text-white mb-4">Our Methodology</h2>
        <div className="text-zinc-400 space-y-4 text-sm leading-7">
          <p>
            Established in the digital era, MyHumanStats (MHS) bridges the gap between clinical-style assessments and casual internet quizzes. While traditional medical tests require appointments and specialized equipment, MHS leverages modern browser capabilities to offer immediate screening tools.
          </p>
          <p>
            Our suite covers four main pillars:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-zinc-300 font-mono text-xs">
            <li><strong>AUDITORY:</strong> Frequency range and pitch discrimination.</li>
            <li><strong>VISUAL:</strong> Color sensitivity, acuity, and processing speed.</li>
            <li><strong>COGNITIVE:</strong> Memory retention, reaction time, and vigilance.</li>
            <li><strong>PERSONALITY:</strong> Psychometric profiling based on established models (Big Five, etc).</li>
          </ul>
          <p>
            We are constantly evolving. As browser technologies improve, so does the precision of our instruments.
          </p>
        </div>
      </div>

    </div>
  );
};

export default About;
