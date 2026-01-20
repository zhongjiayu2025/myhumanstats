import React from 'react';
import Questionnaire from './Questionnaire';

// ASRS-v1.1 Part A (The 6 critical screening questions)
const QUESTIONS = [
  { id: 1, text: "How often do you have trouble wrapping up the final details of a project, once the challenging parts have been done?", options: [{label: "Never", value: 0}, {label: "Rarely", value: 1}, {label: "Sometimes", value: 2}, {label: "Often", value: 3}, {label: "Very Often", value: 4}] },
  { id: 2, text: "How often do you have difficulty getting things in order when you have to do a task that requires organization?", options: [{label: "Never", value: 0}, {label: "Rarely", value: 1}, {label: "Sometimes", value: 2}, {label: "Often", value: 3}, {label: "Very Often", value: 4}] },
  { id: 3, text: "How often do you have problems remembering appointments or obligations?", options: [{label: "Never", value: 0}, {label: "Rarely", value: 1}, {label: "Sometimes", value: 2}, {label: "Often", value: 3}, {label: "Very Often", value: 4}] },
  { id: 4, text: "When you have a task that requires a lot of thought, how often do you avoid or delay getting started?", options: [{label: "Never", value: 0}, {label: "Rarely", value: 1}, {label: "Sometimes", value: 2}, {label: "Often", value: 3}, {label: "Very Often", value: 4}] },
  { id: 5, text: "How often do you fidget or squirm with your hands or feet when you have to sit down for a long time?", options: [{label: "Never", value: 0}, {label: "Rarely", value: 1}, {label: "Sometimes", value: 2}, {label: "Often", value: 3}, {label: "Very Often", value: 4}] },
  { id: 6, text: "How often do you feel overly active and compelled to do things, like you were driven by a motor?", options: [{label: "Never", value: 0}, {label: "Rarely", value: 1}, {label: "Sometimes", value: 2}, {label: "Often", value: 3}, {label: "Very Often", value: 4}] }
];

const ADHDTest: React.FC = () => {
  return (
    <div className="relative">
       <Questionnaire
          testId="adhd-test"
          questions={QUESTIONS}
          maxScorePerQuestion={4}
          title="ADHD Screener (ASRS-v1.1)"
          resultTitle={(score) => score > 65 ? "High Likelihood" : score > 45 ? "Possible Indication" : "Unlikely"}
          resultDescription={(score) => 
             score > 65 ? "Your responses are consistent with adults who have ADHD. This result is NOT a medical diagnosis. Please consult a psychiatrist for a formal evaluation." :
             score > 45 ? "You show some symptoms of inattention or hyperactivity, but they may be situational." :
             "Your symptoms are not consistent with ADHD. You appear to have good executive function."
          }
       />
       <div className="mt-8 text-center text-[10px] text-zinc-600 font-mono">
          DISCLAIMER: This tool is for educational purposes only and does not replace professional medical advice.
       </div>
    </div>
  );
};

export default ADHDTest;