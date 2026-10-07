// Search Console-led navigation and concise search snippets.
// The focus order is based on the owner's observed landing-page clicks,
// not invented live GSC data or universal popularity claims.
import { TESTS } from './data';

export const FEATURED_TEST_IDS = [
  'rhythm-test',
  'contrast-test',
  'color-hue-test',
  'perfect-pitch-test',
  'peripheral-vision-test',
  'number-memory-test',
] as const;

export const FEATURED_TEST_DESCRIPTIONS: Record<string, string> = {
  'rhythm-test': 'Tap along with a beat and review your timing accuracy.',
  'contrast-test': 'Identify the direction of increasingly faint patterns.',
  'color-hue-test': 'Spot the differently colored tile in a timed challenge.',
  'perfect-pitch-test': 'Listen to a note, then choose its musical name.',
  'peripheral-vision-test': 'Notice brief targets while focusing on the screen center.',
  'number-memory-test': 'Remember longer digit sequences and track your progress.',
};

export const SEARCH_SNIPPETS: Record<string, { title: string; description: string }> = {
  'rhythm-test': {
    title: 'Rhythm Test Online – Check Your Beat Timing',
    description: 'Take a free rhythm test: listen to a beat, keep tapping and review timing consistency. Choose a BPM and compare repeated attempts.',
  },
  'contrast-test': {
    title: 'Contrast Sensitivity Test – Online Pattern Exercise',
    description: 'Try a free online contrast sensitivity exercise using faint stripe patterns. See your responses by pattern scale; this is not a clinical eye exam.',
  },
  'color-hue-test': {
    title: 'Color Hue Test – Find the Different Color Online',
    description: 'Try the color hue test: find the odd tile in a timed color challenge. Explore your accuracy by color family on your own screen.',
  },
  'perfect-pitch-test': {
    title: 'Perfect Pitch Test – Identify Musical Notes Online',
    description: 'Try a free 10-round perfect pitch test. Identify piano notes by ear, review mistakes and compare attempts; an optional C reference changes the task.',
  },
  'peripheral-vision-test': {
    title: 'Peripheral Vision Test – Online Screen Awareness Exercise',
    description: 'Try a free peripheral vision awareness exercise. Focus on the center, respond to brief dots and review your detections. Not a medical visual-field test.',
  },
  'number-memory-test': {
    title: 'Number Memory Test – Free Online Digit Span Game',
    description: 'How many digits can you remember? Try a free number memory test, recall growing sequences and track your own longest successful span.',
  },
  'spacebar-speed-test': {
    title: 'Spacebar Speed Test – Tap Your Spacebar Online',
    description: 'Measure your spacebar speed in a free browser game. Try repeat attempts, see your score and compare your own results over time.',
  },
  'vocal-range-test': {
    title: 'Vocal Range Test – Check Your Sung Pitch Range',
    description: 'Explore your vocal range with a free microphone-based pitch exercise. Results depend on technique and microphone quality.',
  },
};

// Deliberately curated relationships based on adjacent search intent.
// No invented "popular" counts, ratings, user behavior or AI-only links.
const RELATED_TEST_IDS: Record<string, string[]> = {
  'rhythm-test': ['perfect-pitch-test', 'tone-deaf-test', 'vocal-range-test'],
  'perfect-pitch-test': ['tone-deaf-test', 'rhythm-test', 'vocal-range-test'],
  'tone-deaf-test': ['perfect-pitch-test', 'rhythm-test', 'vocal-range-test'],
  'vocal-range-test': ['perfect-pitch-test', 'tone-deaf-test', 'rhythm-test'],
  'hearing-age-test': ['tone-deaf-test', 'perfect-pitch-test', 'rhythm-test'],
  'contrast-test': ['color-hue-test', 'peripheral-vision-test', 'color-blind-test'],
  'color-hue-test': ['contrast-test', 'color-blind-test', 'peripheral-vision-test'],
  'peripheral-vision-test': ['contrast-test', 'color-hue-test', 'afterimage-test'],
  'color-blind-test': ['color-hue-test', 'contrast-test', 'peripheral-vision-test'],
  'afterimage-test': ['color-hue-test', 'contrast-test', 'peripheral-vision-test'],
  'number-memory-test': ['verbal-memory-test', 'visual-memory-test', 'reaction-time-test'],
  'verbal-memory-test': ['number-memory-test', 'visual-memory-test', 'reaction-time-test'],
  'visual-memory-test': ['number-memory-test', 'verbal-memory-test', 'chimp-test'],
  'reaction-time-test': ['aim-trainer-test', 'spacebar-speed-test', 'number-memory-test'],
  'spacebar-speed-test': ['cps-test', 'reaction-time-test', 'aim-trainer-test'],
  'cps-test': ['spacebar-speed-test', 'reaction-time-test', 'aim-trainer-test'],
  'aim-trainer-test': ['reaction-time-test', 'spacebar-speed-test', 'cps-test'],
};

export const getFeaturedTests = () =>
  FEATURED_TEST_IDS.map(id => TESTS.find(test => test.id === id)).filter(
    (test): test is (typeof TESTS)[number] => Boolean(test?.isImplemented)
  );

export const getRelatedTests = (currentId: string, category: string, limit = 3) => {
  const byId = new Map(TESTS.map(test => [test.id, test]));
  const selected = new Set<string>([currentId]);
  const results: (typeof TESTS)[number][] = [];

  const add = (id: string) => {
    if (selected.has(id) || results.length >= limit) return;
    const test = byId.get(id);
    if (!test?.isImplemented) return;
    selected.add(id);
    results.push(test);
  };

  (RELATED_TEST_IDS[currentId] ?? []).forEach(add);
  TESTS.filter(test => test.category === category).forEach(test => add(test.id));
  FEATURED_TEST_IDS.forEach(add);
  return results;
};
