
import { TestCategory } from '../types';
import { Activity, FileText, Command } from 'lucide-react';

// Lightweight interface to avoid heavy text fields
interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
  type: 'test' | 'blog' | 'page';
  path: string;
  // Note: We can't store the icon Component directly here if we want this to be pure JSON-like data,
  // but for a React app, storing the icon component reference is fine as long as we import them.
  // Ideally, we'd map string names to icons in the component to save bundle size, but for now
  // let's stick to the current pattern but remove the heavy 'description' and 'content'.
}

// Manually curated or generated index.
// In a real build step, this could be generated from TESTS.
// For this architecture, we duplicate the minimal data to break the dependency chain.

export const TEST_INDEX = [
  { id: 'hearing-age-test', title: 'Hearing Age Test', category: TestCategory.AUDITORY },
  { id: 'vocal-range-test', title: 'Vocal Range Test', category: TestCategory.AUDITORY },
  { id: 'perfect-pitch-test', title: 'Perfect Pitch Test', category: TestCategory.AUDITORY },
  { id: 'tone-deaf-test', title: 'Tone Deaf Test', category: TestCategory.AUDITORY },
  { id: 'rhythm-test', title: 'Rhythm Test', category: TestCategory.AUDITORY },
  { id: 'misophonia-test', title: 'Misophonia Test', category: TestCategory.AUDITORY },
  
  { id: 'color-blind-test', title: 'Color Blind Test', category: TestCategory.VISUAL },
  { id: 'contrast-test', title: 'Contrast Sensitivity', category: TestCategory.VISUAL },
  { id: 'astigmatism-test', title: 'Astigmatism Test', category: TestCategory.VISUAL },
  { id: 'peripheral-vision-test', title: 'Peripheral Vision', category: TestCategory.VISUAL },
  { id: 'face-blindness-test', title: 'Face Blindness Test', category: TestCategory.VISUAL },
  { id: 'color-hue-test', title: 'Color Hue Test', category: TestCategory.VISUAL },
  { id: 'afterimage-test', title: 'Afterimage Test', category: TestCategory.VISUAL },
  { id: 'visual-memory-test', title: 'Sequence Memory Test', category: TestCategory.VISUAL },
  { id: 'aim-trainer-test', title: 'Aim Trainer', category: TestCategory.VISUAL },

  { id: 'reaction-time-test', title: 'Reaction Time Test', category: TestCategory.COGNITIVE },
  { id: 'verbal-memory-test', title: 'Verbal Memory Test', category: TestCategory.COGNITIVE },
  { id: 'typing-speed-test', title: 'Typing Speed Test', category: TestCategory.COGNITIVE },
  { id: 'reading-speed-test', title: 'Reading Speed Test', category: TestCategory.COGNITIVE },
  { id: 'chimp-test', title: 'Chimp Test', category: TestCategory.COGNITIVE },
  { id: 'number-memory-test', title: 'Number Memory Test', category: TestCategory.COGNITIVE },
  { id: 'attention-span-test', title: 'Attention Span Test', category: TestCategory.COGNITIVE },
  { id: 'cps-test', title: 'CPS Test', category: TestCategory.COGNITIVE },
  { id: 'spacebar-speed-test', title: 'Spacebar Speed Test', category: TestCategory.COGNITIVE },
  { id: 'stroop-effect-test', title: 'Stroop Test', category: TestCategory.COGNITIVE },

  { id: 'big-five-test', title: 'Big 5 Personality', category: TestCategory.PERSONALITY },
  { id: 'adhd-test', title: 'ADHD Screener', category: TestCategory.PERSONALITY },
  { id: 'eq-test', title: 'EQ Test', category: TestCategory.PERSONALITY },
  { id: 'anxiety-test', title: 'Anxiety Test', category: TestCategory.PERSONALITY },
  { id: 'chronotype-test', title: 'Chronotype Test', category: TestCategory.PERSONALITY },
  { id: 'empathy-test', title: 'Empathy Test', category: TestCategory.PERSONALITY },
  { id: 'procrastination-test', title: 'Procrastination Test', category: TestCategory.PERSONALITY },
  { id: 'difficult-person-test', title: 'Difficult Person Test', category: TestCategory.PERSONALITY },
  { id: 'social-battery-test', title: 'Social Battery Test', category: TestCategory.PERSONALITY },
  { id: 'left-right-brain-test', title: 'Left Brain Right Brain Test', category: TestCategory.PERSONALITY },
];

export const BLOG_INDEX = [
  { slug: "science-behind-hearing-age-test-high-frequency-loss", title: "The Science Behind the Hearing Age Test", category: "Auditory Science" },
  { slug: "reaction-time-and-cognitive-decline", title: "Reaction Time as a Biomarker", category: "Cognitive Performance" },
  { slug: "understanding-color-blindness-types", title: "Beyond Black and White: Color Vision Deficiency", category: "Visual Health" },
];

export const STATIC_PAGES = [
    { type: 'page', title: 'Dashboard', subtitle: 'Home', id: 'home', path: '/' },
    { type: 'page', title: 'About Methodology', subtitle: 'System Info', id: 'about', path: '/about' },
    { type: 'page', title: 'Research Log', subtitle: 'Blog Index', id: 'blog', path: '/blog' },
];
