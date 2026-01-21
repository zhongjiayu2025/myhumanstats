import React from 'react';
import {
  Ear, Mic, Music, Music2, Activity, VolumeX, 
  Eye, Contrast, ScanFace, Palette, Sun, Grid, Crosshair, 
  Zap, Book, Keyboard, BookOpen, Brain, Hash, Focus, MousePointer, Minus, 
  PieChart, Heart, AlertCircle, Moon, Users, Clock, UserX, Battery, Split,
  Circle, HelpCircle, Fingerprint, Layers, ChevronRight
} from 'lucide-react';

// Map string names from database/constants to actual React components
export const iconMap: Record<string, React.ComponentType<any>> = {
  Ear, Mic, Music, Music2, Activity, VolumeX,
  Eye, Contrast, ScanFace, Palette, Sun, Grid, Crosshair,
  Zap, Book, Keyboard, BookOpen, Brain, Hash, Focus, MousePointer, Minus,
  PieChart, Heart, AlertCircle, Moon, Users, Clock, UserX, Battery, Split,
  Circle, HelpCircle, Fingerprint, Layers, ChevronRight
};