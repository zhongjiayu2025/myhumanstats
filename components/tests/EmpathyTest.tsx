import React from 'react';
import Questionnaire from './Questionnaire';

const QUESTIONS = [
  { id: 1, text: "I can easily tell if someone else wants to enter a conversation.", options: [{label: "Yes", value: 5}, {label: "Sometimes", value: 3}, {label: "No", value: 1}] },
  { id: 2, text: "I find it hard to know what to do in a social situation.", options: [{label: "Yes", value: 1}, {label: "Sometimes", value: 3}, {label: "No", value: 5}] }, // Reverse
  { id: 3, text: "I really enjoy caring for other people.", options: [{label: "Yes", value: 5}, {label: "Sometimes", value: 3}, {label: "No", value: 1}] },
  { id: 4, text: "I tend to get emotionally involved with a friend's problems.", options: [{label: "Yes", value: 5}, {label: "Sometimes", value: 3}, {label: "No", value: 1}] },
  { id: 5, text: "I am good at predicting how someone will feel.", options: [{label: "Yes", value: 5}, {label: "Sometimes", value: 3}, {label: "No", value: 1}] }
];

const EmpathyTest: React.FC = () => {
  return (
    <Questionnaire
       testId="empathy-test"
       questions={QUESTIONS}
       title="Empathy Test"
       resultTitle={(score) => score > 70 ? "High Empathy" : score > 40 ? "Average Empathy" : "Low Empathy"}
       resultDescription={(score) => 
          score > 70 ? "You have a deep capacity to feel what others feel (Affective Empathy) and understand their perspective (Cognitive Empathy)." :
          score > 40 ? "You have a normal range of empathy. You can connect with others but maintain healthy boundaries." :
          "You may prefer logic over emotion and might struggle to intuitively understand emotional reactions."
       }
    />
  );
};

export default EmpathyTest;