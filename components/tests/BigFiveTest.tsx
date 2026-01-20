import React from 'react';
import Questionnaire from './Questionnaire';

const QUESTIONS = [
  { id: 1, text: "I am the life of the party.", options: [{label: "Agree", value: 5}, {label: "Neutral", value: 3}, {label: "Disagree", value: 1}] },
  { id: 2, text: "I sympathize with others' feelings.", options: [{label: "Agree", value: 5}, {label: "Neutral", value: 3}, {label: "Disagree", value: 1}] },
  { id: 3, text: "I get chores done right away.", options: [{label: "Agree", value: 5}, {label: "Neutral", value: 3}, {label: "Disagree", value: 1}] },
  { id: 4, text: "I have frequent mood swings.", options: [{label: "Agree", value: 1}, {label: "Neutral", value: 3}, {label: "Disagree", value: 5}] }, // Reverse coded for stability
  { id: 5, text: "I have a vivid imagination.", options: [{label: "Agree", value: 5}, {label: "Neutral", value: 3}, {label: "Disagree", value: 1}] },
];

const BigFiveTest: React.FC = () => {
  return (
    <Questionnaire
       testId="big-five"
       questions={QUESTIONS}
       title="Big 5 Traits"
       resultTitle={(score) => score > 70 ? "Balanced Personality" : "Distinct Personality"}
       resultDescription={() => 
          "This simplified test aggregates your Openness, Conscientiousness, Extraversion, Agreeableness, and Neuroticism into a single stability score. A comprehensive profile requires a 60+ question assessment."
       }
    />
  );
};

export default BigFiveTest;