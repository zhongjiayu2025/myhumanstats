import React from 'react';
import Questionnaire, { Question } from './Questionnaire';

// Simplified Mini-IPIP (International Personality Item Pool)
// 10 items, 2 per trait.
const QUESTIONS: Question[] = [
  // Openness
  { id: 1, categoryId: 'O', text: "I have a vivid imagination.", options: [{label: "Very Accurate", value: 5}, {label: "Neutral", value: 3}, {label: "Inaccurate", value: 1}] },
  { id: 2, categoryId: 'O', text: "I am not interested in abstract ideas.", options: [{label: "Accurate", value: 1}, {label: "Neutral", value: 3}, {label: "Inaccurate (I am interested)", value: 5}] },
  
  // Conscientiousness
  { id: 3, categoryId: 'C', text: "I get chores done right away.", options: [{label: "Very Accurate", value: 5}, {label: "Neutral", value: 3}, {label: "Inaccurate", value: 1}] },
  { id: 4, categoryId: 'C', text: "I often forget to put things back in their proper place.", options: [{label: "Accurate", value: 1}, {label: "Neutral", value: 3}, {label: "Inaccurate", value: 5}] },

  // Extraversion
  { id: 5, categoryId: 'E', text: "I am the life of the party.", options: [{label: "Very Accurate", value: 5}, {label: "Neutral", value: 3}, {label: "Inaccurate", value: 1}] },
  { id: 6, categoryId: 'E', text: "I don't talk a lot.", options: [{label: "Accurate", value: 1}, {label: "Neutral", value: 3}, {label: "Inaccurate (I talk a lot)", value: 5}] },

  // Agreeableness
  { id: 7, categoryId: 'A', text: "I sympathize with others' feelings.", options: [{label: "Very Accurate", value: 5}, {label: "Neutral", value: 3}, {label: "Inaccurate", value: 1}] },
  { id: 8, categoryId: 'A', text: "I am not interested in other people's problems.", options: [{label: "Accurate", value: 1}, {label: "Neutral", value: 3}, {label: "Inaccurate (I am interested)", value: 5}] },

  // Neuroticism
  { id: 9, categoryId: 'N', text: "I have frequent mood swings.", options: [{label: "Very Accurate", value: 5}, {label: "Neutral", value: 3}, {label: "Inaccurate", value: 1}] },
  { id: 10, categoryId: 'N', text: "I am relaxed most of the time.", options: [{label: "Accurate", value: 1}, {label: "Neutral", value: 3}, {label: "Inaccurate", value: 5}] },
];

const CATEGORIES = {
    'O': 'Openness',
    'C': 'Conscientiousness',
    'E': 'Extraversion',
    'A': 'Agreeableness',
    'N': 'Neuroticism'
};

const BigFiveTest: React.FC = () => {
  return (
    <Questionnaire
       testId="big-five"
       questions={QUESTIONS}
       title="Big 5 (OCEAN) Profiler"
       categories={CATEGORIES}
       maxScorePerQuestion={5}
    />
  );
};

export default BigFiveTest;