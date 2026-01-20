import React from 'react';
import Questionnaire from './Questionnaire';

const QUESTIONS = [
  { id: 1, text: "I can tell how someone is feeling just by looking at their face.", options: [{label: "Always", value: 5}, {label: "Often", value: 4}, {label: "Sometimes", value: 3}, {label: "Rarely", value: 2}, {label: "Never", value: 1}] },
  { id: 2, text: "When I am upset, I know exactly why.", options: [{label: "Always", value: 5}, {label: "Often", value: 4}, {label: "Sometimes", value: 3}, {label: "Rarely", value: 2}, {label: "Never", value: 1}] },
  { id: 3, text: "I help others feel better when they are down.", options: [{label: "Always", value: 5}, {label: "Often", value: 4}, {label: "Sometimes", value: 3}, {label: "Rarely", value: 2}, {label: "Never", value: 1}] },
  { id: 4, text: "I can control my temper in stressful situations.", options: [{label: "Always", value: 5}, {label: "Often", value: 4}, {label: "Sometimes", value: 3}, {label: "Rarely", value: 2}, {label: "Never", value: 1}] },
  { id: 5, text: "I find it hard to understand why people react the way they do.", options: [{label: "Strongly Agree", value: 1}, {label: "Agree", value: 2}, {label: "Neutral", value: 3}, {label: "Disagree", value: 4}, {label: "Strongly Disagree", value: 5}] }
];

const EQTest: React.FC = () => {
  return (
    <Questionnaire
       testId="eq-test"
       questions={QUESTIONS}
       title="Emotional Intelligence (EQ)"
       resultTitle={(score) => score > 80 ? "High EQ" : score > 50 ? "Average EQ" : "Low EQ"}
       resultDescription={(score) => 
          score > 80 ? "You possess excellent self-awareness and empathy. You navigate social complexities with ease." :
          score > 50 ? "You have a solid grasp of emotions but may struggle in highly stressful or complex social situations." :
          "You may have difficulty reading social cues or managing your own emotions."
       }
    />
  );
};

export default EQTest;