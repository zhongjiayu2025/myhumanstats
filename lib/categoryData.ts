import { TestCategory } from '../types';

interface CategoryMeta {
  title: string;
  description: string;
  seoContent: string; // Rich HTML
  keywords: string[];
}

export const CATEGORY_DATA: Record<TestCategory, CategoryMeta> = {
  [TestCategory.AUDITORY]: {
    title: "Auditory Perception Tests & Hearing Benchmarks",
    description: "Measure your hearing range, pitch discrimination, and rhythmic precision. Professional-grade online audio tools.",
    keywords: ["hearing test online", "pitch test", "frequency hearing test", "musical ear test"],
    seoContent: `
      <h2>The Science of Auditory Analysis</h2>
      <p>Your auditory system is more than just "hearing volume". It is a complex signal processing chain involving frequency analysis (pitch), temporal resolution (rhythm), and pattern recognition.</p>
      <p>Our <strong>Auditory Tests</strong> are designed to isolate specific variables of this chain:</p>
      <ul class="list-disc pl-5 space-y-2 text-zinc-400">
        <li><strong>Frequency Range:</strong> Measuring the physical limits of the cochlea (e.g., 20Hz - 20kHz).</li>
        <li><strong>Pitch Discrimination:</strong> The ability to distinguish minute differences in Hertz (Hz), critical for musicians.</li>
        <li><strong>Temporal Processing:</strong> How accurately the brain can track time intervals and rhythm.</li>
      </ul>
    `
  },
  [TestCategory.VISUAL]: {
    title: "Visual Acuity & Color Perception Tests",
    description: "Assess color blindness, contrast sensitivity, and visual processing speed. Digital Ishihara and Snellen-based screeners.",
    keywords: ["color blind test", "visual memory test", "contrast sensitivity", "eye test online"],
    seoContent: `
      <h2>Digital Optometry & Vision Science</h2>
      <p>Visual processing accounts for a massive portion of the human brain's computational power. Our visual suite moves beyond standard acuity charts to test the <em>quality</em> of your vision.</p>
      <p>Key areas of assessment include:</p>
      <ul class="list-disc pl-5 space-y-2 text-zinc-400">
        <li><strong>Color Vision:</strong> Detecting Protanopia, Deuteranopia, and Tritanopia using digital pseudoisochromatic plates.</li>
        <li><strong>Contrast Sensitivity:</strong> The ability to distinguish objects from their background, a key indicator of retinal health.</li>
        <li><strong>Visual Memory:</strong> The capacity of the visuo-spatial sketchpad component of working memory.</li>
      </ul>
    `
  },
  [TestCategory.COGNITIVE]: {
    title: "Cognitive Performance & Brain Training Benchmarks",
    description: "Quantify your reaction time, working memory, and attention span. Neuro-psychological assessments for the digital age.",
    keywords: ["reaction time test", "memory test", "iq test alternatives", "brain training benchmarks"],
    seoContent: `
      <h2>Quantifying Mental Throughput</h2>
      <p>Cognition is not a single trait but a collection of executive functions. Our cognitive battery is derived from established psychological paradigms used in clinical and research settings.</p>
      <p>We measure:</p>
      <ul class="list-disc pl-5 space-y-2 text-zinc-400">
        <li><strong>Processing Speed:</strong> Measured via simple and choice reaction time tasks (SRT/CRT).</li>
        <li><strong>Inhibitory Control:</strong> Tested using the Stroop Effect to measure the ability to suppress automatic responses.</li>
        <li><strong>Working Memory:</strong> Assessed via Digit Span and spatial recall tasks (Chimp Test).</li>
      </ul>
    `
  },
  [TestCategory.PERSONALITY]: {
    title: "Psychometric Profiling & Personality Assessments",
    description: "Explore your traits with tools based on the Big Five and ASRS-v1.1 models. Self-knowledge through data.",
    keywords: ["personality test", "adhd screener", "eq test", "psychometrics"],
    seoContent: `
      <h2>Modern Psychometrics</h2>
      <p>Understanding your software is as important as understanding your hardware. Our personality modules use standardized self-report scales to help you visualize your behavioral patterns.</p>
      <p>While these tools are for educational purposes, they are based on robust psychological constructs such as the <strong>Five Factor Model (Big 5)</strong> and the <strong>Adult ADHD Self-Report Scale</strong>.</p>
    `
  }
};