import React from 'react';
import Questionnaire from './Questionnaire';

const QUESTIONS = [
  { id: 1, text: "After a party, you feel...", options: [{label: "Energized", value: 5}, {label: "Neutral", value: 3}, {label: "Drained", value: 1}] },
  { id: 2, text: "Your ideal Friday night is...", options: [{label: "Clubbing", value: 5}, {label: "Dinner with friends", value: 3}, {label: "Reading/Gaming alone", value: 1}] },
  { id: 3, text: "You can hold a conversation for 3 hours straight.", options: [{label: "Easy", value: 5}, {label: "Depends on person", value: 3}, {label: "Impossible", value: 1}] },
  { id: 4, text: "Small talk is...", options: [{label: "Fun", value: 5}, {label: "Necessary evil", value: 3}, {label: "Torture", value: 1}] },
  { id: 5, text: "You prefer to work...", options: [{label: "In a team", value: 5}, {label: "Alone", value: 1}] },
];

const SocialBatteryTest: React.FC = () => {
  return (
    <Questionnaire
       testId="social-battery"
       questions={QUESTIONS}
       title="Social Battery Test"
       resultTitle={(score) => score > 70 ? "Social Powerhouse" : score > 40 ? "Ambivert" : "Lone Wolf"}
       resultDescription={(score) => 
          score > 70 ? "You are an Extrovert. You gain energy from interacting with others." :
          score > 40 ? "You are an Ambivert. You enjoy socializing but need time to recharge." :
          "You are an Introvert. Solitude is your sanctuary and where you do your best thinking."
       }
    />
  );
};

export default SocialBatteryTest;