
import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Zap, FileText, History, Rocket, Brain, RotateCcw, Eye, Settings2, Edit3, Check } from 'lucide-react';
import { saveStat } from '../../lib/core';

const DEFAULT_TEXTS = [
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
  }
];

const ReadingSpeedTest: React.FC = () => {
  const [selectedTextId, setSelectedTextId] = useState<string>('history');
  const [customTextContent, setCustomTextContent] = useState('');
  const [isUsingCustom, setIsUsingCustom] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);

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
  
  // Content Resolution
  const activeText = isUsingCustom 
    ? { id: 'custom', title: 'Custom Text', content: customTextContent, questions: [], genre: 'User Input' }
    : DEFAULT_TEXTS.find(t => t.id === selectedTextId) || DEFAULT_TEXTS[0];
    
  const words = activeText.content.trim().split(/\s+/).filter(w => w.length > 0);
  
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
    
    // Skip quiz if custom text (we don't have questions)
    if (isUsingCustom) {
        calculateResult(timeInSeconds, []);
    } else {
        setPhase('quiz');
    }
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
                      const finalDur = (words.length / targetRsvpWpm) * 60;
                      setDuration(finalDur);
                      setTimeout(() => {
                          if(isUsingCustom) calculateResult(finalDur, []);
                          else setPhase('quiz');
                      }, 500);
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
    
    let accuracy = 100;
    if (!isUsingCustom && activeText.questions.length > 0) {
        let correctCount = 0;
        finalAnswers.forEach((ans, idx) => {
           if (ans === activeText.questions[idx].correct) correctCount++;
        });
        accuracy = Math.round((correctCount / activeText.questions.length) * 100);
    }
    
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
      const word = words[rsvpIndex] || "";
      
      // ORP Calculation (Optimal Recognition Point)
      // Usually around 35% into the word, slightly left of center
      const length = word.length;
      let pivot = Math.ceil((length - 1) * 0.35); // 0-based index
      if (length === 1) pivot = 0;

      const start = word.slice(0, pivot);
      const center = word[pivot];
      const end = word.slice(pivot + 1);

      return (
          <div className="flex items-baseline h-24 relative w-full max-w-xl mx-auto">
              {/* ORP Guidelines */}
              <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-primary-500/20 -translate-x-1/2 rounded-full"></div>
              <div className="absolute top-0 bottom-0 left-1/2 w-full h-[2px] bg-primary-500/20 top-[62%] -translate-y-1/2"></div>

              {/* Text Container aligned by flex basis to ORP */}
              <div className="flex w-full text-5xl md:text-6xl font-mono leading-none">
                  {/* Left Side (Right Aligned) */}
                  <div className="flex-1 text-right pr-[1px] text-zinc-400 font-medium">
                      {start}
                  </div>
                  
                  {/* Pivot (Centered) */}
                  <div className="text-red-500 font-bold w-[0.6em] text-center flex-shrink-0 relative z-10 -ml-[0.05em]">
                      {center}
                  </div>
                  
                  {/* Right Side (Left Aligned) */}
                  <div className="flex-1 text-left pl-[1px] text-zinc-400 font-medium">
                      {end}
                  </div>
              </div>
          </div>
      );
  };

  const restart = () => {
      setPhase('intro');
      setQuizAnswers([]);
      setDuration(0);
      setPacerProgress(0);
  };

  const handleCustomTextSubmit = () => {
      if (customTextContent.trim().length > 10) {
          setIsUsingCustom(true);
          setShowCustomInput(false);
          setSelectedTextId('custom');
      }
  };

  return (
    <div className="max-w-4xl mx-auto select-none">
      
      {/* Custom Text Modal */}
      {showCustomInput && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-lg shadow-2xl animate-in zoom-in">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Edit3 size={20}/> Paste Your Content</h3>
                  <textarea 
                      className="w-full h-48 bg-black border border-zinc-800 rounded p-4 text-sm text-zinc-300 focus:outline-none focus:border-primary-500 mb-4 font-serif"
                      placeholder="Paste article text here..."
                      value={customTextContent}
                      onChange={(e) => setCustomTextContent(e.target.value)}
                  />
                  <div className="flex justify-end gap-3">
                      <button onClick={() => setShowCustomInput(false)} className="btn-secondary text-xs px-4 py-2">Cancel</button>
                      <button onClick={handleCustomTextSubmit} className="btn-primary text-xs px-4 py-2">Load Text</button>
                  </div>
              </div>
          </div>
      )}

      {phase === 'intro' && (
        <div className="text-center py-12 animate-in fade-in">
          <BookOpen size={64} className="mx-auto text-zinc-600 mb-6" />
          <h2 className="text-3xl font-bold text-white mb-2">Reading Speed Protocol</h2>
          <p className="text-zinc-400 mb-12 max-w-md mx-auto">
            Measure your WPM (Words Per Minute) and retention rate. Select a data source to begin.
          </p>
          
          {/* Text Selection */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-12">
              {DEFAULT_TEXTS.map((t) => (
                  <button 
                    key={t.id}
                    onClick={() => { setSelectedTextId(t.id); setIsUsingCustom(false); }}
                    className={`
                        flex flex-col items-center p-4 border rounded-xl transition-all
                        ${selectedTextId === t.id && !isUsingCustom
                            ? 'bg-primary-900/20 border-primary-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.1)]' 
                            : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800'}
                    `}
                  >
                      <t.icon size={20} className={`mb-2 ${selectedTextId === t.id && !isUsingCustom ? 'text-primary-400' : 'text-zinc-600'}`} />
                      <span className="text-xs font-bold">{t.genre}</span>
                  </button>
              ))}
              <button 
                  onClick={() => setShowCustomInput(true)}
                  className={`
                        flex flex-col items-center p-4 border rounded-xl transition-all
                        ${isUsingCustom
                            ? 'bg-primary-900/20 border-primary-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.1)]' 
                            : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800'}
                    `}
              >
                  <Edit3 size={20} className={`mb-2 ${isUsingCustom ? 'text-primary-400' : 'text-zinc-600'}`} />
                  <span className="text-xs font-bold">Custom</span>
              </button>
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
                  <div className="absolute top-0 right-0 p-2 bg-primary-600 text-black text-[10px] font-bold">ORP ALIGNED</div>
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
               
               <p style={{ whiteSpace: 'pre-wrap' }}>{activeText.content}</p>
           </div>
           <button onClick={handleFinishReading} className="btn-primary w-full shadow-lg">
               I Have Finished Reading
           </button>
        </div>
      )}

      {phase === 'reading' && mode === 'rsvp' && (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-full max-w-2xl bg-black border border-zinc-700 rounded-lg p-12 text-center relative overflow-hidden">
                  <div className="relative z-10 flex justify-center w-full">
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
                  {activeText.questions[quizAnswers.length].options.map((opt: string, i: number) => (
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
                      {isUsingCustom ? 'Comprehension Not Tested' : `${comprehensionScore}% Retention`}
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
