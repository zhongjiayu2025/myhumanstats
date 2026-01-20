import React from 'react';
import Questionnaire from './Questionnaire';

// High value = Right Brain (Creative), Low value = Left Brain (Logical)
const QUESTIONS = [
  { id: 1, text: "When solving a problem, you rely on...", options: [{label: "Gut feeling", value: 5}, {label: "Logic & Data", value: 1}] },
  { id: 2, text: "You remember faces better than names.", options: [{label: "True", value: 5}, {label: "False", value: 1}] },
  { id: 3, text: "In class, you preferred...", options: [{label: "Art/Music", value: 5}, {label: "Math/Science", value: 1}] },
  { id: 4, text: "Your desk is usually...", options: [{label: "Chaotic/Messy", value: 5}, {label: "Organized/Tidy", value: 1}] },
  { id: 5, text: "You prefer questions with...", options: [{label: "Open-ended answers", value: 5}, {label: "Definite answers", value: 1}] },
];

const LeftRightBrainTest: React.FC = () => {
  return (
    <Questionnaire
       testId="left-right-brain"
       questions={QUESTIONS}
       title="Hemisphere Dominance"
       resultTitle={(score) => score > 60 ? "Right-Brain Dominant" : score > 40 ? "Balanced" : "Left-Brain Dominant"}
       resultDescription={(score) => 
          score > 60 ? "You are creative, intuitive, and a big-picture thinker. You likely excel in arts and innovation." :
          score > 40 ? "You have a healthy balance of logic and intuition." :
          "You are analytical, logical, and detail-oriented. You likely excel in math, programming, and sciences."
       }
    />
  );
};

export default LeftRightBrainTest;