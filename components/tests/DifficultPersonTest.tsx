import React from 'react';
import Questionnaire from './Questionnaire';

const QUESTIONS = [
  { id: 1, text: "I often suspect that others have hidden motives.", options: [{label: "Strongly Agree", value: 5}, {label: "Neutral", value: 3}, {label: "Disagree", value: 1}] },
  { id: 2, text: "I consider myself superior to most people.", options: [{label: "True", value: 5}, {label: "Partially True", value: 3}, {label: "False", value: 1}] },
  { id: 3, text: "It is easy to make me angry.", options: [{label: "Yes", value: 5}, {label: "Sometimes", value: 3}, {label: "No", value: 1}] },
  { id: 4, text: "I enjoy taking risks, even if it affects others.", options: [{label: "Often", value: 5}, {label: "Sometimes", value: 3}, {label: "Never", value: 1}] },
  { id: 5, text: "I find it hard to feel sympathy for people who make mistakes.", options: [{label: "True", value: 5}, {label: "Neutral", value: 3}, {label: "False", value: 1}] },
];

const DifficultPersonTest: React.FC = () => {
  return (
    <Questionnaire
       testId="difficult-person-test"
       questions={QUESTIONS}
       title="Difficult Person Test"
       resultTitle={(score) => score > 70 ? "High Difficulty Score" : score > 40 ? "Moderate" : "Easy Going"}
       resultDescription={(score) => 
          score > 70 ? "Your results suggest a higher likelihood of traits associated with a 'Difficult Person', such as lower Agreeableness. This matches patterns seen in the viral IDRlabs Difficult Person Test." :
          score > 40 ? "You have a balanced personality. You can be firm when needed but generally get along well with others." :
          "You are very agreeable and easy to get along with. Your Toxic Personality traits are minimal."
       }
    />
  );
};

export default DifficultPersonTest;