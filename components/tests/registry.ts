
import dynamic from 'next/dynamic';
import React from 'react';

// Using next/dynamic for Code Splitting.
const HearingAgeTest = dynamic(() => import('./HearingAgeTest'), { ssr: false });
const VocalRangeTest = dynamic(() => import('./VocalRangeTest'), { ssr: false });
const ToneDeafTest = dynamic(() => import('./ToneDeafTest'), { ssr: false });
const RhythmTest = dynamic(() => import('./RhythmTest'), { ssr: false });
const MisophoniaTest = dynamic(() => import('./MisophoniaTest'), { ssr: false });
const PerfectPitchTest = dynamic(() => import('./PerfectPitchTest'), { ssr: false });

const ColorHueTest = dynamic(() => import('./ColorHueTest'), { ssr: false });
const ColorBlindTest = dynamic(() => import('./ColorBlindTest'), { ssr: false });
const AfterimageTest = dynamic(() => import('./AfterimageTest'), { ssr: false });
const VisualMemoryTest = dynamic(() => import('./VisualMemoryTest'), { ssr: false });
const AimTrainerTest = dynamic(() => import('./AimTrainerTest'), { ssr: false });
const AstigmatismTest = dynamic(() => import('./AstigmatismTest'), { ssr: false });
const FaceBlindnessTest = dynamic(() => import('./FaceBlindnessTest'), { ssr: false });
const PeripheralVisionTest = dynamic(() => import('./PeripheralVisionTest'), { ssr: false });
const ContrastTest = dynamic(() => import('./ContrastTest'), { ssr: false });

const ReactionTimeTest = dynamic(() => import('./ReactionTimeTest'), { ssr: false });
const CpsTest = dynamic(() => import('./CpsTest'), { ssr: false });
const StroopTest = dynamic(() => import('./StroopTest'), { ssr: false });
const ChimpTest = dynamic(() => import('./ChimpTest'), { ssr: false });
const TypingSpeedTest = dynamic(() => import('./TypingSpeedTest'), { ssr: false });
const NumberMemoryTest = dynamic(() => import('./NumberMemoryTest'), { ssr: false });
const SpacebarSpeedTest = dynamic(() => import('./SpacebarSpeedTest'), { ssr: false });
const AttentionSpanTest = dynamic(() => import('./AttentionSpanTest'), { ssr: false });
const ReadingSpeedTest = dynamic(() => import('./ReadingSpeedTest'), { ssr: false });
const VerbalMemoryTest = dynamic(() => import('./VerbalMemoryTest'), { ssr: false });

const BigFiveTest = dynamic(() => import('./BigFiveTest'), { ssr: false });
const ProcrastinationTest = dynamic(() => import('./ProcrastinationTest'), { ssr: false });
const SocialBatteryTest = dynamic(() => import('./SocialBatteryTest'), { ssr: false });
const LeftRightBrainTest = dynamic(() => import('./LeftRightBrainTest'), { ssr: false });
const DifficultPersonTest = dynamic(() => import('./DifficultPersonTest'), { ssr: false });
const ADHDTest = dynamic(() => import('./ADHDTest'), { ssr: false });
const EQTest = dynamic(() => import('./EQTest'), { ssr: false });
const AnxietyTest = dynamic(() => import('./AnxietyTest'), { ssr: false });
const ChronotypeTest = dynamic(() => import('./ChronotypeTest'), { ssr: false });
const EmpathyTest = dynamic(() => import('./EmpathyTest'), { ssr: false });

export const TEST_REGISTRY: Record<string, React.ComponentType> = {
  'hearing-age-test': HearingAgeTest,
  'vocal-range-test': VocalRangeTest,
  'tone-deaf-test': ToneDeafTest,
  'rhythm-test': RhythmTest,
  'misophonia-test': MisophoniaTest,
  'perfect-pitch-test': PerfectPitchTest,
  'color-hue-test': ColorHueTest,
  'color-blind-test': ColorBlindTest,
  'afterimage-test': AfterimageTest,
  'visual-memory-test': VisualMemoryTest,
  'aim-trainer-test': AimTrainerTest,
  'astigmatism-test': AstigmatismTest,
  'face-blindness-test': FaceBlindnessTest,
  'peripheral-vision-test': PeripheralVisionTest,
  'contrast-test': ContrastTest,
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
