
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
    description: "Explore hearing-frequency perception, pitch recognition and rhythm timing using browser audio. Not a clinical hearing exam.",
    keywords: ["hearing test online", "pitch test", "frequency hearing test", "musical ear test"],
    faqs: [
        {
            question: "What is an auditory perception test?",
            answer: "Auditory perception tests measure how the brain interprets sound, not just the ear's ability to hear volume. They assess pitch discrimination, rhythmic timing, and sound pattern recognition."
        },
        {
            question: "Can I test my hearing online?",
            answer: "Online frequency exercises can help you explore which synthesized tones are audible on your device. They are not calibrated medical screens and cannot detect or rule out hearing loss."
        },
        {
            question: "What is the frequency range of human hearing?",
            answer: "Human hearing is often described as roughly 20 Hz to 20 kHz, but individual hearing and device output vary. A browser tone does not establish an age-based threshold."
        }
    ],
    seoContent: `
      <h2>The Science of Auditory Analysis</h2>
      <p>Your auditory system is more than just "hearing volume". It is a complex signal processing chain involving frequency analysis (pitch), temporal resolution (rhythm), and pattern recognition.</p>
      <p>Our <strong>Auditory Tests</strong> are designed to isolate specific variables of this chain:</p>
      <ul class="list-disc pl-5 space-y-2 text-zinc-400">
        <li><strong>Frequency Range:</strong> Exploring audibility on the current headphones, speakers and listening volume.</li>
        <li><strong>Pitch Discrimination:</strong> The ability to distinguish minute differences in Hertz (Hz), critical for musicians.</li>
        <li><strong>Temporal Processing:</strong> How accurately the brain can track time intervals and rhythm.</li>
      </ul>
    `
  },
  [TestCategory.VISUAL]: {
    title: "Visual Acuity & Color Perception Tests",
    description: "Explore color patterns, contrast and visual memory with browser exercises. These are not clinically calibrated vision screeners.",
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
      <h2>Visual Perception in the Browser</h2>
      <p>Visual processing accounts for a massive portion of the human brain's computational power. Our visual tasks explore perception under ordinary display conditions. They cannot measure the medical quality of your vision.</p>
      <p>Key areas of assessment include:</p>
      <ul class="list-disc pl-5 space-y-2 text-zinc-400">
        <li><strong>Color Patterns:</strong> Exploring recognition of colored shapes on your display; not diagnosing color-vision deficiencies.</li>
        <li><strong>Contrast Perception:</strong> Exploring differences between patterns and backgrounds without clinical calibration.</li>
        <li><strong>Visual Memory:</strong> The capacity of the visuo-spatial sketchpad component of working memory.</li>
      </ul>
    `
  },
  [TestCategory.COGNITIVE]: {
    title: "Cognitive Performance & Brain Training Benchmarks",
    description: "Try browser-based reaction time, memory and attention games; results are for personal practice, not neuropsychological diagnosis.",
    keywords: ["reaction time test", "memory test", "iq test alternatives", "brain training benchmarks"],
    faqs: [
        {
            question: "What is the average human reaction time?",
            answer: "Reaction times depend on the task, input device, refresh rate, and person. Compare repeat attempts on similar hardware instead of relying on a single population average."
        },
        {
            question: "Can I improve my cognitive processing speed?",
            answer: "Practicing a specific test can improve familiarity and performance on that task. Improvement on a game does not by itself demonstrate broad cognitive gains."
        },
        {
            question: "What is the Stroop Effect?",
            answer: "The Stroop Effect is a demonstration of interference in the reaction time of a task. It shows that processing the meaning of a word (e.g., reading 'RED') is faster and more automatic than identifying the ink color (e.g., green ink)."
        }
    ],
    seoContent: `
      <h2>Quantifying Mental Throughput</h2>
      <p>Cognition is not a single trait but a collection of executive functions. Some tasks are inspired by familiar research paradigms, but this site does not provide standardized clinical assessments.</p>
      <p>We measure:</p>
      <ul class="list-disc pl-5 space-y-2 text-zinc-400">
        <li><strong>Processing Speed:</strong> Measured via simple and choice reaction time tasks (SRT/CRT).</li>
        <li><strong>Inhibitory Control:</strong> Practiced in a browser Stroop-style exercise that is not clinically standardized.</li>
        <li><strong>Working Memory:</strong> Assessed via Digit Span and spatial recall tasks (Chimp Test).</li>
      </ul>
    `
  },
  [TestCategory.PERSONALITY]: {
    title: "Psychometric Profiling & Personality Assessments",
    description: "Explore personality traits and attention exercises. These educational tools are not medical diagnoses.",
    keywords: ["personality test", "adhd screener", "eq test", "psychometrics"],
    faqs: [
        {
            question: "What are the Big Five personality traits?",
            answer: "The Big Five commonly refers to Openness, Conscientiousness, Extraversion, Agreeableness, and Neuroticism. This website's short questionnaire is informal rather than a validated inventory."
        },
        {
            question: "Is the ADHD test a diagnosis?",
            answer: "No. The attention exercise on MyHumanStats is not a validated ASRS-v1.1 screener and cannot diagnose, confirm, or rule out ADHD. A qualified clinician can help assess persistent symptoms."
        },
        {
            question: "What is Emotional Intelligence (EQ)?",
            answer: "EQ is the ability to understand, use, and manage your own emotions in positive ways to relieve stress, communicate effectively, empathize with others, and defuse conflict."
        }
    ],
    seoContent: `
      <h2>Modern Psychometrics</h2>
      <p>Understanding your software is as important as understanding your hardware. Our personality modules use informal prompts for self-reflection; they should not be interpreted as standardized psychological scales.</p>
      <p>These tools are for educational self-reflection only. The browser attention exercise is not the official Adult ADHD Self-Report Scale and does not provide medical screening or diagnosis.</p>
    `
  }
};
