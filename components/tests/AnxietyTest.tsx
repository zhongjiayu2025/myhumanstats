import React from 'react';
import Questionnaire from './Questionnaire';

const QUESTIONS = [
  { id: 1, text: "Feeling nervous, anxious, or on edge", options: [{label: "Not at all", value: 0}, {label: "Several days", value: 1}, {label: "Over half the days", value: 2}, {label: "Nearly every day", value: 3}] },
  { id: 2, text: "Not being able to stop or control worrying", options: [{label: "Not at all", value: 0}, {label: "Several days", value: 1}, {label: "Over half the days", value: 2}, {label: "Nearly every day", value: 3}] },
  { id: 3, text: "Worrying too much about different things", options: [{label: "Not at all", value: 0}, {label: "Several days", value: 1}, {label: "Over half the days", value: 2}, {label: "Nearly every day", value: 3}] },
  { id: 4, text: "Trouble relaxing", options: [{label: "Not at all", value: 0}, {label: "Several days", value: 1}, {label: "Over half the days", value: 2}, {label: "Nearly every day", value: 3}] },
  { id: 5, text: "Being so restless that it is hard to sit still", options: [{label: "Not at all", value: 0}, {label: "Several days", value: 1}, {label: "Over half the days", value: 2}, {label: "Nearly every day", value: 3}] },
  { id: 6, text: "Becoming easily annoyed or irritable", options: [{label: "Not at all", value: 0}, {label: "Several days", value: 1}, {label: "Over half the days", value: 2}, {label: "Nearly every day", value: 3}] },
  { id: 7, text: "Feeling afraid, as if something awful might happen", options: [{label: "Not at all", value: 0}, {label: "Several days", value: 1}, {label: "Over half the days", value: 2}, {label: "Nearly every day", value: 3}] }
];

const AnxietyTest: React.FC = () => {
  return (
    <div className="relative">
       <Questionnaire
          testId="anxiety-test"
          questions={QUESTIONS}
          maxScorePerQuestion={3}
          title="Anxiety Screener (GAD-7)"
          resultTitle={(score) => score > 70 ? "Severe Anxiety" : score > 45 ? "Moderate Anxiety" : score > 20 ? "Mild Anxiety" : "Minimal Anxiety"}
          resultDescription={(score) => 
             score > 70 ? "Your score indicates potential severe anxiety. It is highly recommended to seek professional support." :
             score > 45 ? "You are experiencing significant anxiety symptoms that may be impacting your daily life." :
             score > 20 ? "You have some anxiety, but it is likely manageable." :
             "You appear to be relatively free of anxiety symptoms."
          }
       />
       <div className="mt-8 text-center text-[10px] text-zinc-600 font-mono">
          DISCLAIMER: Scores derived from the GAD-7. Not a diagnosis.
       </div>
    </div>
  );
};

export default AnxietyTest;