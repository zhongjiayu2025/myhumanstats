
import { TestCategory } from '../types';

interface CategoryMeta {
  title: string;
  description: string;
  seoContent: string; // Rich HTML
  keywords: string[];
  faqs: { question: string, answer: string }[]; // New: FAQ Data
}

export const CATEGORY_DATA: Record<TestCategory, CategoryMeta> = {
  [TestCategory.AUDITORY]: {
    title: "Auditory Perception Tests & Hearing Benchmarks",
    description: "Measure your hearing range, pitch discrimination, and rhythmic precision. Professional-grade online audio tools.",
    keywords: ["hearing test online", "pitch test", "frequency hearing test", "musical ear test"],
    faqs: [
        {
            question: "What is an auditory perception test?",
            answer: "Auditory perception tests measure how the brain interprets sound, not just the ear's ability to hear volume. They assess pitch discrimination, rhythmic timing, and sound pattern recognition."
        },
        {
            question: "Can I test my hearing online?",
            answer: "Yes, online hearing tests like the 'Hearing Age Test' can effectively screen for high-frequency hearing loss (Presbycusis) using calibrated frequency sweeps, though they do not replace a clinical diagnosis."
        },
        {
            question: "What is the frequency range of human hearing?",
            answer: "The standard human hearing range is 20 Hz to 20,000 Hz. This upper limit naturally decreases with age, often dropping to 15,000 Hz or lower by age 40."
        }
    ],
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
    faqs: [
        {
            question: "How do online color blindness tests work?",
            answer: "Online tests use pseudoisochromatic plates (like the Ishihara test) where dots of specific colors form numbers that are invisible to people with certain types of color vision deficiency (Protanopia/Deuteranopia)."
        },
        {
            question: "What is visual memory?",
            answer: "Visual memory describes the relationship between perceptual processing and the encoding, storage, and retrieval of the resulting neural representations. It is tested using pattern recall tasks."
        },
        {
            question: "What is contrast sensitivity?",
            answer: "Contrast sensitivity measures your ability to distinguish between an object and its background. Unlike visual acuity (20/20 vision), it assesses the quality of vision in low-contrast situations."
        }
    ],
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
    faqs: [
        {
            question: "What is the average human reaction time?",
            answer: "The average visual reaction time to a simple stimulus is approximately 250 milliseconds. Elite athletes and gamers may achieve speeds between 150-200ms."
        },
        {
            question: "Can I improve my cognitive processing speed?",
            answer: "Yes, neuroplasticity allows the brain to adapt. Regular practice with reaction time tasks and n-back memory training can improve synaptic efficiency and processing speed."
        },
        {
            question: "What is the Stroop Effect?",
            answer: "The Stroop Effect is a demonstration of interference in the reaction time of a task. It shows that processing the meaning of a word (e.g., reading 'RED') is faster and more automatic than identifying the ink color (e.g., green ink)."
        }
    ],
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
    faqs: [
        {
            question: "What are the Big Five personality traits?",
            answer: "The Big Five (OCEAN) are Openness, Conscientiousness, Extraversion, Agreeableness, and Neuroticism. They are considered the gold standard in modern psychology for describing human personality."
        },
        {
            question: "Is the ADHD test a diagnosis?",
            answer: "No. Our ADHD screener is based on the ASRS-v1.1 checklist used by clinicians, but an online test cannot provide a medical diagnosis. It acts as a tool to identify symptoms worth discussing with a professional."
        },
        {
            question: "What is Emotional Intelligence (EQ)?",
            answer: "EQ is the ability to understand, use, and manage your own emotions in positive ways to relieve stress, communicate effectively, empathize with others, and defuse conflict."
        }
    ],
    seoContent: `
      <h2>Modern Psychometrics</h2>
      <p>Understanding your software is as important as understanding your hardware. Our personality modules use standardized self-report scales to help you visualize your behavioral patterns.</p>
      <p>While these tools are for educational purposes, they are based on robust psychological constructs such as the <strong>Five Factor Model (Big 5)</strong> and the <strong>Adult ADHD Self-Report Scale</strong>.</p>
    `
  }
};
