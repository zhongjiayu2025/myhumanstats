import React from 'react';
import Questionnaire from './Questionnaire';

const QUESTIONS = [
  { id: 1, text: "I often find myself doing tasks that aren't urgent just to avoid the important ones.", options: [{label: "Never", value: 5}, {label: "Sometimes", value: 3}, {label: "Always", value: 1}] },
  { id: 2, text: "When I have a deadline, I wait until the last minute to start.", options: [{label: "Never", value: 5}, {label: "Usually", value: 3}, {label: "Always", value: 1}] },
  { id: 3, text: "I check social media before starting work.", options: [{label: "Rarely", value: 5}, {label: "Often", value: 2}, {label: "Compulsively", value: 0}] },
  { id: 4, text: "I make to-do lists but rarely finish them.", options: [{label: "False", value: 5}, {label: "True", value: 1}] },
  { id: 5, text: "I feel guilty about how I spend my time.", options: [{label: "No", value: 5}, {label: "Sometimes", value: 3}, {label: "Yes", value: 1}] },
];

const ProcrastinationTest: React.FC = () => {
  return (
    <Questionnaire
       testId="procrastination"
       questions={QUESTIONS}
       title="Procrastination Scale"
       resultTitle={(score) => score > 80 ? "Master of Focus" : score > 50 ? "Occasional Delayer" : "Chronic Procrastinator"}
       resultDescription={(score) => 
          score > 80 ? "You have excellent time management skills and discipline. Your productivity is maximized." :
          score > 50 ? "You struggle occasionally but generally get things done. Try the Pomodoro technique to improve." :
          "You likely struggle with task paralysis. Start by breaking tasks into 5-minute micro-steps."
       }
    />
  );
};

export default ProcrastinationTest;