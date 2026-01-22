
import { Ear, Activity, Crosshair, Zap, Grid, Music } from 'lucide-react';

export interface Badge {
  id: string;
  title: string;
  testId: string;
  threshold: number; // Score required (0-100)
  icon: any;
  color: string;
  desc: string;
}

export const BADGES: Badge[] = [
  { 
    id: 'golden-ears', 
    title: 'Golden Ears', 
    testId: 'hearing-age-test', 
    threshold: 85, 
    icon: Ear, 
    color: 'text-amber-400', 
    desc: 'Hearing Age > 18kHz' 
  },
  { 
    id: 'metronome', 
    title: 'Human Metronome', 
    testId: 'rhythm-test', 
    threshold: 80, 
    icon: Activity, 
    color: 'text-emerald-400', 
    desc: 'Rhythm Stability > 80' 
  },
  { 
    id: 'aim-god', 
    title: 'Aim God', 
    testId: 'aim-trainer-test', 
    threshold: 90, 
    icon: Crosshair, 
    color: 'text-red-500', 
    desc: 'Elite Accuracy & Speed' 
  },
  { 
    id: 'speedster', 
    title: 'Synaptic Speedster', 
    testId: 'reaction-time-test', 
    threshold: 90, 
    icon: Zap, 
    color: 'text-blue-400', 
    desc: 'Reaction Time < 185ms' 
  },
  { 
    id: 'eidetic', 
    title: 'Eidetic Memory', 
    testId: 'visual-memory-test', 
    threshold: 85, 
    icon: Grid, 
    color: 'text-purple-400', 
    desc: 'Visual Memory Lvl 10+' 
  },
  { 
    id: 'pitch-perfect', 
    title: 'Pitch Perfect', 
    testId: 'tone-deaf-test', 
    threshold: 90, 
    icon: Music, 
    color: 'text-pink-400', 
    desc: 'Freq. Discrimination < 2Hz' 
  },
];
