
import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Zap, FileText, History, Rocket, Brain, RotateCcw, Eye, Settings2 } from 'lucide-react';
import { saveStat } from '../../lib/core';

const TEXT_OPTIONS = [
  {
    id: 'history',
    icon: History,
    title: "The Cognitive Revolution",
    genre: "History",
    content: `The Cognitive Revolution was an intellectual movement that began in the 1950s as an interdisciplinary study of the mind and its processes. It became known collectively as cognitive science. The relevant fields of interchange were between psychology, linguistics, and computer science. This approach centered on the idea that the mind is a complex system that receives, stores, retrieves, and processes information. Before this revolution, behaviorism was the dominant school in psychology, focusing solely on observable behavior and ignoring internal mental states. The cognitive revolution reintroduced the study of thoughts, feelings, and beliefs, arguing that these internal processes were essential to understanding behavior. Key figures like Noam Chomsky and George Miller played pivotal roles, challenging behaviorist assumptions about language and memory. The development of the digital computer provided a new metaphor for the mind. Psychologists began to view the brain as a hardware and the mind as software, processing inputs to generate outputs. This computational theory of mind remains a cornerstone of cognitive psychology today, influencing artificial intelligence and neuroscience.`,
    questions: [
      { q: "What was the dominant school before the Cognitive Revolution?", options: ["Psychoanalysis", "Behaviorism", "Humanism", "Structuralism"], correct: 1 },
      { q: "Which invention provided a new metaphor for the mind?", options: ["The Steam Engine", "The Telephone", "The Digital Computer", "The Printing Press"], correct: 2 },
      { q: "The revolution reintroduced the study of:", options: ["Observable behavior", "Biological reflexes", "Internal mental states", "Social conditioning"], correct: 2 }
    ]
  },
  {
    id: 'scifi',
    icon: Rocket,
    title: "The Fermi Paradox",
    genre: "Science",
    content: `The Fermi Paradox refers to the apparent contradiction between the lack of evidence for extraterrestrial civilizations and various high estimates for their probability. The universe is incredibly vast and old. There are billions of stars in our galaxy alone, many of which are older than our sun. High probability suggests that if Earth is typical, some of these civilizations should have developed interstellar travel, a step humans are investigating now. Even at the slow pace of currently envisioned interstellar travel, the Milky Way galaxy could be completely traversed in a few million years. Since many of the stars similar to the Sun are billions of years older, the Earth should have already been visited by extraterrestrial civilizations, or at least their probes. However, there is no convincing evidence that this has happened. Attempts to resolve the Fermi paradox have ranged from suggesting that intelligent extraterrestrial life is extremely rare or short-lived, to proposing that alien species simply stay quiet to avoid detection by hostile super-civilizations.`,
    questions: [
      { q: "The Fermi Paradox highlights a contradiction regarding:", options: ["Time travel", "Extraterrestrial life", "Black holes", "Quantum mechanics"], correct: 1 },
      { q: "How long would it theoretically take to traverse the Milky Way?", options: ["A few thousand years", "A few million years", "A billion years", "It is impossible"], correct: 1 },
      { q: "One proposed solution suggests aliens stay quiet to:", options: ["Save energy", "Meditate", "Avoid detection", "Sleep"], correct: 2 }
    ]
  },
  {
    id: 'philosophy',
    icon: Brain,
    title: "Allegory of the Cave",
    genre: "Philosophy",
    content: `Plato's Allegory of the Cave is presented by the Greek philosopher Plato in his work Republic. It imagines a group of people who have lived chained to the wall of a cave all their lives, facing a blank wall. The people watch shadows projected on the wall from objects passing in front of a fire behind them and give names to these shadows. The shadows are the prisoners' reality, but are not accurate representations of the real world. Three stages of liberation are described. First, a prisoner is freed and forced to turn and look at the fire. The light would hurt his eyes and make it hard for him to see the objects casting the shadows. If he is then dragged out of the cave into the sunlight, he would be blinded and unable to see anything. Eventually, he would adjust and see the world as it is. If he returned to the cave to tell the others, they would not believe him and might even kill him for trying to free them.`,
    questions: [
      { q: "In the cave, what do the prisoners see?", options: ["Real objects", "Shadows", "The fire", "Sunlight"], correct: 1 },
      { q: "What happens when a prisoner is first freed?", options: ["He is happy", "The light hurts his eyes", "He runs away", "He fights the guards"], correct: 1 },
      { q: "How would the other prisoners react to the truth?", options: ["With curiosity", "With belief", "With disbelief/hostility", "With joy"], correct: 2 }
    ]
  }
];

const ReadingSpeedTest: React.FC = () => {
  const [selectedTextId, setSelectedTextId] = useState<string>('history');
  const [mode, setMode] = useState<'standard' | 'rsvp'>('standard');
  const [phase, setPhase] = useState<'intro' | 'reading' | 'quiz' | 'result'>('intro');
  const [startTime, setStartTime] = useState(0);
  const [duration, setDuration] = useState(0); 
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [wpm, setWpm] = useState(0);
  const [comprehensionScore, setComprehensionScore] = useState(0);

  // Pacer State
  const [usePacer, setUsePacer] = useState(false);
  const [pacerSpeed, setPacerSpeed] = useState(250); // WPM target for pacer
  const [pacerProgress, setPacerProgress] = useState(0);

  // RSVP State
  const [targetRsvpWpm, setTargetRsvpWpm] = useState(300);
  const [rsvpIndex, setRsvpIndex] = useState(0);
  const [rsvpIsPlaying, setRsvpIsPlaying] = useState(false);
  
  const activeText = TEXT_OPTIONS.find(t => t.id === selectedTextId) || TEXT_OPTIONS[0];
  const words = activeText.content.split(/\s+/);
  
  const rsvpIntervalRef = useRef<number | null>(null);
  const pacerIntervalRef = useRef<number | null>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);

  // Standard Logic
  const handleStartStandard = () => {
    setMode('standard');
    setPhase('reading');
    setStartTime(Date.now());
    
    // Pacer Logic
    if (usePacer) {
        const totalWords = words.length;
        const totalTimeMin = totalWords / pacerSpeed;
        const totalTimeMs = totalTimeMin * 60 * 1000;
        const startTime = Date.now();
        
        pacerIntervalRef.current = window.setInterval(() => {
            const elapsed = Date.now() - startTime;
            const prog = Math.min(100, (elapsed / totalTimeMs) * 100);
            setPacerProgress(prog);
            if (prog >= 100) {
               if (pacerIntervalRef.current) clearInterval(pacerIntervalRef.current);
            }
        }, 50);
    }
  };

  const handleFinishReading = () => {
    const timeInSeconds = (Date.now() - startTime) / 1000;
    if (timeInSeconds < 2) return; 
    setDuration(timeInSeconds);
    if (pacerIntervalRef.current) clearInterval(pacerIntervalRef.current);
    setPhase('quiz');
  };

  // RSVP Logic
  const handleStartRSVP = () => {
      setMode('rsvp');
      setPhase('reading');
      setRsvpIndex(0);
      setRsvpIsPlaying(true);
  };

  useEffect(() => {
      if (mode === 'rsvp' && phase === 'reading' && rsvpIsPlaying) {
          const msPerWord = 60000 / targetRsvpWpm;
          rsvpIntervalRef.current = window.setInterval(() => {
              setRsvpIndex(prev => {
                  if (prev >= words.length - 1) {
                      if (rsvpIntervalRef.current) clearInterval(rsvpIntervalRef.current);
                      setDuration((words.length / targetRsvpWpm) * 60);
                      setTimeout(() => setPhase('quiz'), 500);
                      return prev;
                  }
                  return prev + 1;
              });
          }, msPerWord);
      }
      return () => { if (rsvpIntervalRef.current) clearInterval(rsvpIntervalRef.current); };
  }, [mode, phase, rsvpIsPlaying, targetRsvpWpm]);

  // Quiz Logic
  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...quizAnswers, optionIndex];
    setQuizAnswers(newAnswers);
    
    if (newAnswers.length === activeText.questions.length) {
      calculateResult(duration, newAnswers);
    }
  };

  const calculateResult = (finalDuration: number, finalAnswers: number[]) => {
    // Standard WPM calculation
    const calculatedWpm = mode === 'rsvp' ? targetRsvpWpm : Math.round((words.length / finalDuration) * 60);
    
    let correctCount = 0;
    finalAnswers.forEach((ans, idx) => {
       if (ans === activeText.questions[idx].correct) correctCount++;
    });
    
    const accuracy = Math.round((correctCount / activeText.questions.length) * 100);
    setComprehensionScore(accuracy);

    // Effective WPM penalty for low comprehension
    let finalWpm = calculatedWpm;
    if (accuracy < 50) finalWpm = Math.round(calculatedWpm * 0.5); 
    else if (accuracy < 100) finalWpm = Math.round(calculatedWpm * 0.8);
    
    setWpm(finalWpm);
    setPhase('result');
    const score = Math.min(100, Math.round((finalWpm / 600) * 100));
    saveStat('reading-speed', score);
  };

  const renderRsvpWord = () => {
      const word = words[rsvpIndex];
      const pivot = word.length > 1 ? Math.floor((word.length - 1) / 2) : 0;
      
      const start = word.slice(0, pivot);
      const center = word[pivot];
      const end = word.slice(pivot + 1);

      return (
          <div className="font-mono text-5xl flex items-baseline h-24 relative">
              {/* Optical Anchor Lines (Focus Reticle) */}
              <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-primary-500/30 -translate-x-1/2"></div>
              <div className="absolute left-0 right-0 top-[60%] h-0.5 bg-primary-500/30 -translate-y-1/2"></div>
              
              <span className="text-right w-48 text-zinc-500">{start}</span>
              <span className="text-red-500 font-bold w-10 text-center relative z-10">{center}</span>
              <span className="text-left w-48 text-zinc-500">{end}</span>
          </div>
      );
  };

  const restart = () => {
      setPhase('intro');
      setQuizAnswers([]);
      setDuration(0);
      setPacerProgress(0);
  };

  return (
    <div className="max-w-4xl mx-auto select-none">
      {phase === 'intro' && (
        <div className="text-center py-12 animate-in fade-in">
          <BookOpen size={64} className="mx-auto text-zinc-600 mb-6" />
          <h2 className="text-3xl font-bold text-white mb-2">Reading Speed Protocol</h2>
          <p className="text-zinc-400 mb-12 max-w-md mx-auto">
            Measure your WPM (Words Per Minute) and retention rate. Select a data source to begin.
          </p>
          
          {/* Text Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-12">
              {TEXT_OPTIONS.map((t) => (
                  <button 
                    key={t.id}
                    onClick={() => setSelectedTextId(t.id)}
                    className={`
                        flex flex-col items-center p-6 border rounded-xl transition-all
                        ${selectedTextId === t.id 
                            ? 'bg-primary-900/20 border-primary-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.1)]' 
                            : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800'}
                    `}
                  >
                      <t.icon size={24} className={`mb-3 ${selectedTextId === t.id ? 'text-primary-400' : 'text-zinc-600'}`} />
                      <span className="text-sm font-bold">{t.genre}</span>
                      <span className="text-[10px] uppercase tracking-wider opacity-70 mt-1">{t.title}</span>
                  </button>
              ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-xl mx-auto">
              {/* Standard Mode Config */}
              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg hover:border-zinc-600 transition-all">
                  <FileText className="mx-auto mb-4 text-zinc-400" size={32} />
                  <h3 className="font-bold text-white mb-2">Standard Mode</h3>
                  <p className="text-xs text-zinc-500 mb-4">Natural reading flow.</p>
                  
                  {/* Pacer Toggle */}
                  <div className="flex flex-col gap-2 items-center mb-4 bg-black/40 p-3 rounded">
                      <button onClick={() => setUsePacer(!usePacer)} className={`text-xs flex items-center gap-2 ${usePacer ? 'text-primary-400' : 'text-zinc-500'}`}>
                          <Eye size={12}/> Visual Pacer {usePacer ? 'ON' : 'OFF'}
                      </button>
                      {usePacer && (
                          <div className="flex items-center gap-2">
                              <span className="text-[10px] text-zinc-500">Target:</span>
                              <input type="number" value={pacerSpeed} onChange={e => setPacerSpeed(Number(e.target.value))} className="w-12 bg-zinc-800 text-white text-xs text-center rounded border border-zinc-700"/>
                              <span className="text-[10px] text-zinc-500">WPM</span>
                          </div>
                      )}
                  </div>

                  <button className="btn-secondary w-full text-xs" onClick={handleStartStandard}>Start Reading</button>
              </div>

              {/* RSVP Mode Config */}
              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg hover:border-primary-500 transition-all relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-2 bg-primary-600 text-black text-[10px] font-bold">EXPERIMENTAL</div>
                  <Zap className="mx-auto mb-4 text-primary-500 group-hover:animate-pulse" size={32} />
                  <h3 className="font-bold text-white mb-2">RSVP Mode</h3>
                  <p className="text-xs text-zinc-500">Rapid Serial Visual Presentation.</p>
                  
                  <div className="mt-4 flex items-center justify-center gap-2 mb-4">
                      <span className="text-xs text-zinc-400">Speed:</span>
                      <input 
                         type="number" 
                         className="w-16 bg-black border border-zinc-700 text-white text-xs px-2 py-1 rounded text-center focus:border-primary-500 outline-none"
                         value={targetRsvpWpm}
                         onChange={(e) => setTargetRsvpWpm(Number(e.target.value))}
                         step={50} min={100} max={1000}
                      />
                      <span className="text-xs text-zinc-600">WPM</span>
                  </div>
                  <button className="btn-primary w-full text-xs" onClick={handleStartRSVP}>Start RSVP</button>
              </div>
          </div>
      </div>
      )}

      {phase === 'reading' && mode === 'standard' && (
        <div className="animate-in fade-in max-w-xl mx-auto">
           <div 
              ref={textContainerRef}
              className="bg-[#fdfbf7] text-black p-8 md:p-12 rounded-lg shadow-2xl border-l-4 border-primary-500 mb-8 font-serif leading-relaxed text-lg relative overflow-hidden"
           >
               <h3 className="font-bold text-2xl mb-4">{activeText.title}</h3>
               
               {/* Visual Pacer Line */}
               {usePacer && (
                   <div 
                      className="absolute left-0 w-full h-1 bg-primary-500/50 pointer-events-none transition-all duration-100 ease-linear shadow-[0_0_10px_#06b6d4]"
                      style={{ top: `${Math.min(100, pacerProgress)}%` }}
                   ></div>
               )}
               
               <p>{activeText.content}</p>
           </div>
           <button onClick={handleFinishReading} className="btn-primary w-full shadow-lg">
               I Have Finished Reading
           </button>
        </div>
      )}

      {phase === 'reading' && mode === 'rsvp' && (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-full max-w-md bg-black border border-zinc-700 rounded-lg p-12 text-center relative overflow-hidden">
                  <div className="relative z-10 flex justify-center">
                      {renderRsvpWord()}
                  </div>
                  {/* Progress Bar */}
                  <div className="absolute bottom-0 left-0 h-1 bg-primary-500 transition-all duration-100 ease-linear" style={{ width: `${(rsvpIndex / words.length) * 100}%` }}></div>
              </div>
              <div className="mt-8 text-zinc-500 font-mono text-xs">
                  {Math.round((rsvpIndex / words.length) * 100)}% COMPLETE
              </div>
          </div>
      )}

      {phase === 'quiz' && (
          <div className="max-w-xl mx-auto animate-in slide-in-from-right">
              <div className="text-xs font-mono text-zinc-500 mb-8 uppercase tracking-widest">
                  Comprehension Check {quizAnswers.length + 1} / {activeText.questions.length}
              </div>
              
              <h3 className="text-2xl font-medium text-white mb-8">
                  {activeText.questions[quizAnswers.length].q}
              </h3>
              
              <div className="space-y-3">
                  {activeText.questions[quizAnswers.length].options.map((opt, i) => (
                      <button 
                         key={i}
                         onClick={() => handleAnswer(i)}
                         className="w-full text-left p-4 bg-zinc-900 border border-zinc-800 hover:border-primary-500 hover:bg-zinc-800 transition-all rounded text-zinc-300 hover:text-white"
                      >
                          {opt}
                      </button>
                  ))}
              </div>
          </div>
      )}

      {phase === 'result' && (
          <div className="py-12 text-center animate-in zoom-in">
              <div className="mb-12">
                  <h2 className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-2">Effective Reading Speed</h2>
                  <div className="text-7xl font-bold text-white mb-2">{wpm} <span className="text-2xl text-zinc-600">WPM</span></div>
                  <div className={`inline-block px-3 py-1 rounded text-xs font-bold ${comprehensionScore === 100 ? 'bg-emerald-900/30 text-emerald-400' : 'bg-yellow-900/30 text-yellow-400'}`}>
                      {comprehensionScore}% Retention
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-12">
                  <div className="bg-zinc-900 border border-zinc-800 p-4 rounded text-center">
                      <div className="text-xs text-zinc-500 uppercase mb-1">Raw Speed</div>
                      <div className="text-xl font-bold text-white">
                          {mode === 'rsvp' ? targetRsvpWpm : Math.round((words.length / duration) * 60)} WPM
                      </div>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 p-4 rounded text-center">
                      <div className="text-xs text-zinc-500 uppercase mb-1">Time</div>
                      <div className="text-xl font-bold text-white">{duration.toFixed(1)}s</div>
                  </div>
              </div>

              <button onClick={restart} className="btn-secondary flex items-center justify-center gap-2 mx-auto">
                  <RotateCcw size={16} /> New Test
              </button>
          </div>
      )}
    </div>
  );
};

export default ReadingSpeedTest;
