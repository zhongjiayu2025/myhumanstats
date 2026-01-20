import React from 'react';
import Questionnaire from './Questionnaire';

const QUESTIONS = [
  { id: 1, text: "If you had no schedule, what time would you wake up?", options: [{label: "Before 6:30 AM", value: 1}, {label: "7:00 AM - 9:00 AM", value: 2}, {label: "After 9:00 AM", value: 3}, {label: "It varies wildly / I have insomnia", value: 4}] },
  { id: 2, text: "When do you feel most productive?", options: [{label: "Morning", value: 1}, {label: "Mid-day (10am - 2pm)", value: 2}, {label: "Late Night", value: 3}, {label: "Spurts throughout the day", value: 4}] },
  { id: 3, text: "How is your appetite in the morning?", options: [{label: "Starving", value: 1}, {label: "Normal", value: 2}, {label: "Not hungry at all", value: 3}, {label: "I forget to eat", value: 4}] },
  { id: 4, text: "How easy is it for you to fall asleep?", options: [{label: "Very easy (9-10pm)", value: 1}, {label: "Normal (11pm)", value: 2}, {label: "Hard, I'm wired at night", value: 3}, {label: "I struggle with light sleeping", value: 4}] }
];

const ChronotypeTest: React.FC = () => {
  // Note: This is a simplified mapping. Real scoring is complex.
  // 1=Lion, 2=Bear, 3=Wolf, 4=Dolphin. 
  // We'll normalize to 0-100 for the dashboard but display the Type clearly.
  
  return (
    <Questionnaire
       testId="chronotype-test"
       questions={QUESTIONS}
       maxScorePerQuestion={4}
       title="Sleep Chronotype"
       resultTitle={(score) => 
          score < 35 ? "LION (Early Riser)" : 
          score < 60 ? "BEAR (Solar Sleeper)" : 
          score < 85 ? "WOLF (Night Owl)" : 
          "DOLPHIN (Insomniac)"
       }
       resultDescription={(score) => 
          score < 35 ? "Lions are morning hunters. You wake up early with high energy but crash in the evening." :
          score < 60 ? "Bears follow the sun. You have steady energy and need a full 8 hours of sleep." :
          score < 85 ? "Wolves are nocturnal creative engines. You struggle with mornings but thrive late at night." :
          "Dolphins are light sleepers with irregular energy bursts. You often struggle with insomnia."
       }
    />
  );
};

export default ChronotypeTest;