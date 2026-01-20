export enum TestCategory {
  AUDITORY = 'Auditory',
  VISUAL = 'Visual',
  COGNITIVE = 'Cognitive',
  PERSONALITY = 'Personality'
}

export interface TestDefinition {
  id: string;
  title: string;
  category: TestCategory;
  description: string;
  iconName: string; // Lucide icon name
  estimatedTime: string;
  isImplemented: boolean;
  seoContent?: string; // HTML string for rich content below the test
  instructions?: string[]; // Step-by-step instructions for HowTo Schema
  faqs?: { question: string, answer: string }[]; // FAQ Schema data
  citations?: string[]; // Scientific references for E-E-A-T
  clinicalRelevance?: string[]; // Key takeaways for topical authority
  concepts?: { term: string, definition: string }[]; // For DefinedTerm Schema & Glossary
}

export interface UserStats {
  [testId: string]: number; // Score 0-100
}

export interface CategoryScore {
  category: TestCategory;
  score: number; // Average 0-100
  completed: number;
  total: number;
}