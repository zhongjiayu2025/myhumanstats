import React from 'react';

// Using React.lazy for Code Splitting.
// This ensures that the user only downloads the code for the test they are actually taking,
// drastically reducing the initial bundle size and improving SEO 'Performance' score.

// Auditory
const HearingAgeTest = React.lazy(() => import('./HearingAgeTest'));
const VocalRangeTest = React.lazy(() => import('./VocalRangeTest'));
const ToneDeafTest = React.lazy(() => import('./ToneDeafTest'));
const RhythmTest = React.lazy(() => import('./RhythmTest'));
const MisophoniaTest = React.lazy(() => import('./MisophoniaTest'));
const PerfectPitchTest = React.lazy(() => import('./PerfectPitchTest'));

// Visual
const ColorHueTest = React.lazy(() => import('./ColorHueTest'));
const ColorBlindTest = React.lazy(() => import('./ColorBlindTest'));
const AfterimageTest = React.lazy(() => import('./AfterimageTest'));
const VisualMemoryTest = React.lazy(() => import('./VisualMemoryTest'));
const AimTrainerTest = React.lazy(() => import('./AimTrainerTest'));
const AstigmatismTest = React.lazy(() => import('./AstigmatismTest'));
const FaceBlindnessTest = React.lazy(() => import('./FaceBlindnessTest'));
const PeripheralVisionTest = React.lazy(() => import('./PeripheralVisionTest'));
const ContrastTest = React.lazy(() => import('./ContrastTest'));

// Cognitive
const ReactionTimeTest = React.lazy(() => import('./ReactionTimeTest'));
const CpsTest = React.lazy(() => import('./CpsTest'));
const StroopTest = React.lazy(() => import('./StroopTest'));
const ChimpTest = React.lazy(() => import('./ChimpTest'));
const TypingSpeedTest = React.lazy(() => import('./TypingSpeedTest'));
const NumberMemoryTest = React.lazy(() => import('./NumberMemoryTest'));
const SpacebarSpeedTest = React.lazy(() => import('./SpacebarSpeedTest'));
const AttentionSpanTest = React.lazy(() => import('./AttentionSpanTest'));
const ReadingSpeedTest = React.lazy(() => import('./ReadingSpeedTest'));
const VerbalMemoryTest = React.lazy(() => import('./VerbalMemoryTest'));

// Personality
const BigFiveTest = React.lazy(() => import('./BigFiveTest'));
const ProcrastinationTest = React.lazy(() => import('./ProcrastinationTest'));
const SocialBatteryTest = React.lazy(() => import('./SocialBatteryTest'));
const LeftRightBrainTest = React.lazy(() => import('./LeftRightBrainTest'));
const DifficultPersonTest = React.lazy(() => import('./DifficultPersonTest'));
const ADHDTest = React.lazy(() => import('./ADHDTest'));
const EQTest = React.lazy(() => import('./EQTest'));
const AnxietyTest = React.lazy(() => import('./AnxietyTest'));
const ChronotypeTest = React.lazy(() => import('./ChronotypeTest'));
const EmpathyTest = React.lazy(() => import('./EmpathyTest'));

export const TEST_REGISTRY: Record<string, React.LazyExoticComponent<React.FC>> = {
  // Auditory
  'hearing-age-test': HearingAgeTest,
  'vocal-range-test': VocalRangeTest,
  'tone-deaf-test': ToneDeafTest,
  'rhythm-test': RhythmTest,
  'misophonia-test': MisophoniaTest,
  'perfect-pitch-test': PerfectPitchTest,

  // Visual
  'color-hue-test': ColorHueTest,
  'color-blind-test': ColorBlindTest,
  'afterimage-test': AfterimageTest,
  'visual-memory-test': VisualMemoryTest,
  'aim-trainer-test': AimTrainerTest,
  'astigmatism-test': AstigmatismTest,
  'face-blindness-test': FaceBlindnessTest,
  'peripheral-vision-test': PeripheralVisionTest,
  'contrast-test': ContrastTest,

  // Cognitive
  'reaction-time-test': ReactionTimeTest,
  'cps-test': CpsTest,
  'stroop-effect-test': StroopTest,
  'chimp-test': ChimpTest,
  'typing-speed-test': TypingSpeedTest,
  'number-memory-test': NumberMemoryTest,
  'spacebar-speed-test': SpacebarSpeedTest,
  'attention-span-test': AttentionSpanTest,
  'reading-speed-test': ReadingSpeedTest,
  'verbal-memory-test': VerbalMemoryTest,

  // Personality
  'big-five-test': BigFiveTest,
  'procrastination-test': ProcrastinationTest,
  'difficult-person-test': DifficultPersonTest,
  'social-battery-test': SocialBatteryTest,
  'left-right-brain-test': LeftRightBrainTest,
  'adhd-test': ADHDTest,
  'eq-test': EQTest,
  'anxiety-test': AnxietyTest,
  'chronotype-test': ChronotypeTest,
  'empathy-test': EmpathyTest,
};