
import { TestCategory, TestDefinition } from '../types';

export const TESTS: TestDefinition[] = [
  // --- AUDITORY STATS ---
  {
    id: 'hearing-age-test',
    title: 'Hearing Age Test',
    category: TestCategory.AUDITORY,
    description: 'How old are your ears? Measure your high-frequency hearing limit (8kHz - 22kHz) and compare it to global age benchmarks.',
    iconName: 'Ear',
    estimatedTime: '2 min',
    isImplemented: true,
    instructions: [
      "Wear high-quality headphones for the most accurate result.",
      "Set your device volume to 50% to avoid ear damage.",
      "Press the 'Start Generator' button to begin the frequency sweep.",
      "The sound will start at a very high pitch (22,000 Hz) and slowly lower.",
      "Press the 'I HEAR IT' button or Spacebar the exact moment you hear the tone."
    ],
    clinicalRelevance: [
      "Presbycusis Indicator: High-frequency loss is often the first sign of age-related hearing decline.",
      "Noise Exposure Tracking: Early loss of frequencies >16kHz may indicate damage from loud music or industrial noise.",
      "Cochlear Health: Specifically tests the function of stereocilia at the basal turn of the cochlea."
    ],
    benchmarks: {
      title: "Average High-Frequency Hearing Limit by Age",
      columns: ["Age Group", "Frequency Limit", "Status"],
      rows: [
        ["Under 20", "> 19,000 Hz", "Excellent"],
        ["20 - 29", "17,000 - 19,000 Hz", "Normal"],
        ["30 - 39", "15,000 - 17,000 Hz", "Normal"],
        ["40 - 49", "12,000 - 15,000 Hz", "Mild Decline"],
        ["50 - 59", "10,000 - 12,000 Hz", "Moderate Decline"],
        ["60+", "< 10,000 Hz", "Expected Decline"]
      ]
    },
    concepts: [
      { term: "Presbycusis", definition: "The cumulative effect of aging on hearing, characterized by the progressive loss of high-frequency sensitivity due to hair cell degradation in the cochlea." },
      { term: "Hertz (Hz)", definition: "The unit of frequency in the International System of Units (SI), equal to one cycle per second. Humans typically hear between 20 Hz and 20,000 Hz." },
      { term: "Stereocilia", definition: "Microscopic hair-like projections on the hair cells within the inner ear that transform mechanical sound vibrations into electrical nerve impulses." }
    ],
    citations: [
      "ISO 7029:2017 Acoustics — Statistical distribution of hearing thresholds as a function of age and gender.",
      "Stelmachowicz, P. G., et al. (1989). High-frequency audiometry: test reliability and procedural considerations. The Journal of the Acoustical Society of America.",
      "National Institute on Deafness and Other Communication Disorders (NIDCD). Age-Related Hearing Loss (Presbycusis)."
    ],
    faqs: [
      {
        question: "Is this online hearing test accurate?",
        answer: "This test is a high-quality screening tool, but its accuracy depends heavily on your hardware. Most standard speakers cannot reproduce frequencies above 16kHz. For precise medical diagnosis, consult an audiologist."
      },
      {
        question: "Why can't I hear 18,000 Hz?",
        answer: "The ability to hear frequencies above 17-18kHz typically diminishes by age 18-20 due to a natural process called presbycusis, where the tiny hair cells in the cochlea degrade over time."
      },
      {
        question: "What is the Mosquito Tone?",
        answer: "The 'Mosquito Tone' is a sound at 17.4 kHz. It is famously used as a ringtone by teenagers because most adults over 25 cannot hear it."
      }
    ],
    seoContent: `
      <h2>What is a Hearing Age Test?</h2>
      <p>A Hearing Age Test measures your ability to hear high-frequency sounds, specifically those above 8,000 Hertz. As we age, the microscopic hair cells (stereocilia) in our inner ear that are responsible for detecting high-pitched sounds naturally degrade. This condition is known as Presbycusis.</p>
      
      <h3>How This Test Works</h3>
      <p>This online tool generates a pure sine wave that sweeps from 22,000 Hz down to 8,000 Hz. By pausing the generator the moment you can hear the sound, we can estimate the physiological age of your cochlea. Note that hardware limitations (cheap speakers/headphones) may affect results above 16kHz.</p>
    `
  },
  {
    id: 'vocal-range-test',
    title: 'Vocal Range Test',
    category: TestCategory.AUDITORY,
    description: 'What is your voice type? Real-time pitch detection to find your range (Bass, Tenor, Alto, Soprano) using your microphone.',
    iconName: 'Mic',
    estimatedTime: '3 min',
    isImplemented: true,
    instructions: [
      "Allow microphone access when prompted.",
      "Find a quiet room to reduce background noise.",
      "Press 'Start Analysis' and begin singing.",
      "Sing your lowest comfortable note, then slide up to your highest comfortable note.",
      "The system will automatically detect your range (e.g., C3 - A5) and classify your voice type."
    ],
    clinicalRelevance: [
      "Laryngeal Health: A sudden reduction in range can indicate vocal nodule formation or inflammation.",
      "Hormonal Changes: Vocal range shifts often accompany puberty, menopause, or testosterone therapy.",
      "Classification: Determines Tessitura (comfortable range) vs. absolute physiological limits."
    ],
    concepts: [
      { term: "Fundamental Frequency (F0)", definition: "The lowest frequency of a periodic waveform, perceived as the pitch of the voice." },
      { term: "Tessitura", definition: "The most comfortable vocal range for a singer, where the voice has the best timbre and is easiest to produce." },
      { term: "FFT (Fast Fourier Transform)", definition: "A mathematical algorithm used by this test to convert the microphone's audio signal from time domain to frequency domain to detect pitch." }
    ],
    seoContent: `
      <h2>Discover Your Voice Type</h2>
      <p>Understanding your vocal range is the first step in vocal training. This tool uses your microphone and a Fast Fourier Transform (FFT) algorithm to detect the fundamental frequency (F0) of your voice in real-time.</p>
      <h3>Common Voice Classifications</h3>
      <ul class="list-disc pl-5 space-y-2 text-zinc-400">
        <li><strong>Soprano:</strong> The highest female voice type (C4 – C6).</li>
        <li><strong>Mezzo-Soprano:</strong> The middle female voice type (A3 – A5).</li>
        <li><strong>Contralto:</strong> The lowest female voice type (F3 – F5).</li>
        <li><strong>Tenor:</strong> The highest male voice type (C3 – C5).</li>
        <li><strong>Baritone:</strong> The most common male voice type (A2 – A4).</li>
        <li><strong>Bass:</strong> The lowest male voice type (E2 – E4).</li>
      </ul>
    `
  },
  {
    id: 'perfect-pitch-test',
    title: 'Perfect Pitch Test',
    category: TestCategory.AUDITORY,
    description: 'Do you have Absolute Pitch? Challenge your ear to identify musical notes (C, D, E...) without any reference tone.',
    iconName: 'Music',
    estimatedTime: '2 min',
    isImplemented: true,
    citations: [
        "Deutsch, D. (2013). Absolute pitch. In D. Deutsch (Ed.), The psychology of music (3rd ed., pp. 141–182). Elsevier.",
        "Miyazaki, K. (1988). Musical pitch identification by absolute pitch possessors. Perception & Psychophysics."
    ]
  },
  {
    id: 'tone-deaf-test',
    title: 'Tone Deaf Test',
    category: TestCategory.AUDITORY,
    description: 'Am I Tone Deaf? A scientific relative pitch test to measure your frequency discrimination ability (JND) in Hz.',
    iconName: 'Music2',
    estimatedTime: '4 min',
    isImplemented: true,
    citations: [
        "Peretz, I., et al. (2002). Congenital amusia: A disorder of fine-grained pitch discrimination. Neuron.",
        "Montreal Battery of Evaluation of Amusia (MBEA)."
    ],
    concepts: [
      { term: "Amusia", definition: "A musical disorder that appears mainly as a defect in processing pitch, but also encompasses musical memory and recognition. Often called 'Tone Deafness'." },
      { term: "JND (Just Noticeable Difference)", definition: "The minimum difference in stimulation that a person can detect 50% of the time. In this test, it is the smallest Hz difference between two tones." },
      { term: "Cent", definition: "A logarithmic unit of measure for musical intervals. There are 100 cents in a semitone." }
    ],
    benchmarks: {
      title: "Frequency Discrimination Thresholds",
      columns: ["Sensitivity Level", "JND (Hz at 440Hz)", "Musical Ability"],
      rows: [
        ["Elite", "< 2 Hz", "Professional Musician"],
        ["High", "2 - 5 Hz", "Trained Ear"],
        ["Average", "6 - 15 Hz", "Normal"],
        ["Low", "16 - 25 Hz", "Untrained"],
        ["Deficient", "> 26 Hz", "Possible Amusia"]
      ]
    },
    seoContent: `
      <h2>Understanding Tone Deafness (Amusia)</h2>
      <p>Tone deafness, or <strong>congenital amusia</strong>, is a biological condition that affects approximately 4% of the population. It is characterized by an inability to distinguish between musical pitches.</p>
      <h3>How the Tone Deaf Test Works</h3>
      <p>This test measures your <strong>Just Noticeable Difference (JND)</strong> in frequency. We play two tones back-to-back. One is a reference tone (e.g., 440Hz), and the other is slightly detuned. Your task is to determine if the second tone is higher or lower.</p>
    `
  },
  {
    id: 'rhythm-test',
    title: 'Rhythm Test',
    category: TestCategory.AUDITORY,
    description: 'Test your internal clock. Listen to a beat, then continue tapping to measure your millisecond drift.',
    iconName: 'Activity',
    estimatedTime: '2 min',
    isImplemented: true,
    seoContent: `
      <h2>Synchronization-Continuation Task</h2>
      <p>This <strong>Rhythm Test</strong> is based on the Synchronization-Continuation paradigm used in neuroscience. It measures sensorimotor synchronization—essentially, how well your brain can maintain a temporal grid without external cues.</p>
      
      <h3>Why Rhythm Matters</h3>
      <p>Rhythm is not just for musicians. Good rhythmic ability correlates with:</p>
      <ul class="list-disc pl-5 space-y-1 text-zinc-400">
        <li>Reading readiness in children</li>
        <li>Attention span stability</li>
        <li>Motor coordination in sports</li>
      </ul>
      
      <h3>Interpreting Your Score</h3>
      <p>We measure your <strong>Standard Deviation (Stability)</strong> and your <strong>Mean Deviation (Drift)</strong>. A standard deviation under 20ms is considered excellent, comparable to professional drummers.</p>
    `
  },
  {
    id: 'misophonia-test',
    title: 'Misophonia Test',
    category: TestCategory.AUDITORY,
    description: 'Do chewing sounds trigger you? Assess your selective sound sensitivity to common triggers (organic vs mechanical).',
    iconName: 'VolumeX',
    estimatedTime: '3 min',
    isImplemented: true,
    citations: [
        "Wu, M. S., et al. (2014). Misophonia: Incidence, phenomenology, and clinical correlates in an undergraduate student sample. Journal of Clinical Psychology.",
        "Schröder, A., et al. (2013). Misophonia: Diagnostic criteria for a new psychiatric disorder. PloS one."
    ]
  },
  
  // --- VISUAL STATS ---
  {
    id: 'color-blind-test',
    title: 'Color Blind Test',
    category: TestCategory.VISUAL,
    description: 'Ishihara Plate Test. Screen for Red-Green (Protan/Deutan) and Blue-Yellow (Tritan) color vision deficiencies.',
    iconName: 'Eye',
    estimatedTime: '3 min',
    isImplemented: true,
    clinicalRelevance: [
      "Genetic Screening: 8% of males have Red-Green blindness (X-linked recessive).",
      "Occupational Safety: Critical for pilots, electricians, and drivers.",
      "Acquired CVD: Changes in color perception can indicate retinal disease or toxicity."
    ],
    concepts: [
      { term: "Protanopia", definition: "A type of color blindness characterized by the absence of red retinal photoreceptors. Red appears dark." },
      { term: "Deuteranopia", definition: "The most common form of color blindness, caused by missing green photoreceptors. Green is often confused with red." },
      { term: "Ishihara Test", definition: "A color perception test for red-green color deficiencies, consisting of pseudoisochromatic plates." }
    ],
    citations: [
        "Ishihara, S. (1917). Tests for colour-blindness. Handaya, Tokyo.",
        "Birch, J. (1997). Efficiency of the Ishihara test for identifying red-green colour deficiency. Ophthalmic and Physiological Optics."
    ],
    seoContent: `
      <h2>The Science of Color Blindness Tests</h2>
      <p>This <strong>Color Blind Test</strong> uses pseudoisochromatic plates, widely known as the <strong>Ishihara Test</strong>. It is designed to detect Color Vision Deficiency (CVD) by using dots of varying sizes and brightness, arranged to form a number that is only visible if you can distinguish specific colors.</p>
      <h3>How Reliable is this Online Test?</h3>
      <p>While this tool uses the same principles as a clinical examination, screen calibration can affect results. If you struggle with these plates, we recommend seeing an optometrist for a formal diagnosis.</p>
    `
  },
  {
    id: 'contrast-test',
    title: 'Contrast Sensitivity',
    category: TestCategory.VISUAL,
    description: 'Can you see the hidden letters? Measure your ability to distinguish faint objects from their background.',
    iconName: 'Contrast',
    estimatedTime: '2 min',
    isImplemented: true,
    citations: [
        "Pelli, D. G., & Robson, J. G. (1988). The design of a new letter chart for measuring contrast sensitivity. Clinical Vision Sciences."
    ]
  },
  {
    id: 'astigmatism-test',
    title: 'Astigmatism Test',
    category: TestCategory.VISUAL,
    description: 'Do lines look blurry? A quick fan-chart screening tool for refractive errors in your cornea.',
    iconName: 'Eye',
    estimatedTime: '1 min',
    isImplemented: true
  },
  {
    id: 'peripheral-vision-test',
    title: 'Peripheral Vision',
    category: TestCategory.VISUAL,
    description: 'Test your side vision field awareness. Detect flashing targets while maintaining central focus.',
    iconName: 'Eye',
    estimatedTime: '1 min',
    isImplemented: true
  },
  {
    id: 'face-blindness-test',
    title: 'Face Blindness Test',
    category: TestCategory.VISUAL,
    description: 'Do you struggle to recognize faces? A prosopagnosia screening test using feature matching.',
    iconName: 'ScanFace',
    estimatedTime: '3 min',
    isImplemented: true,
    citations: [
        "Duchaine, B., & Nakayama, K. (2006). The Cambridge Face Memory Test: Results for neurologically intact individuals and an investigation of its validity using inverted face stimuli and prosopagnosic participants. Neuropsychologia."
    ]
  },
  {
    id: 'color-hue-test',
    title: 'Color Hue Test',
    category: TestCategory.VISUAL,
    description: 'Find the odd color out. A gamified Farnsworth Munsell test for designers and artists.',
    iconName: 'Palette',
    estimatedTime: '2 min',
    isImplemented: true,
    citations: [
        "Farnsworth, D. (1943). The Farnsworth-Munsell 100-hue and dichotomous tests for color vision. JOSA."
    ]
  },
  {
    id: 'afterimage-test',
    title: 'Afterimage Test',
    category: TestCategory.VISUAL,
    description: 'Experience the Negative Afterimage Illusion. See how your retina adapts to constant stimulation.',
    iconName: 'Sun',
    estimatedTime: '1 min',
    isImplemented: true
  },
  {
    id: 'visual-memory-test',
    title: 'Sequence Memory Test',
    category: TestCategory.VISUAL,
    description: 'Photographic memory challenge. Recall the pattern of lighting grids in the correct order.',
    iconName: 'Grid',
    estimatedTime: '3 min',
    isImplemented: true,
    seoContent: `
      <h2>The Limits of Spatial Working Memory</h2>
      <p>This <strong>Visual Memory Test</strong>, sometimes called a Spatial Span Test or the Corsi Block-Tapping Task, measures the capacity of your visuo-spatial sketchpad.</p>
      
      <h3>Strategies for Improvement</h3>
      <p>High scorers on this test often use "chunking." Instead of memorizing 7 individual tiles, they memorize a shape (e.g., "a triangle pointing left" or "the letter T"). This compresses the information, allowing the brain to store more data in the same working memory slots.</p>
    `
  },
  {
    id: 'aim-trainer-test',
    title: 'Aim Trainer',
    category: TestCategory.VISUAL,
    description: 'FPS Training. Measure your hand-eye coordination, reflex speed, and mouse accuracy.',
    iconName: 'Crosshair',
    estimatedTime: '30 sec',
    isImplemented: true,
    benchmarks: {
      title: "Aim Speed & Accuracy Benchmarks",
      columns: ["Skill Level", "Targets Hit (30s)", "Accuracy"],
      rows: [
        ["Pro Gamer", "60+", "> 95%"],
        ["Advanced", "45 - 60", "90 - 95%"],
        ["Average", "30 - 45", "85 - 90%"],
        ["Beginner", "15 - 30", "< 85%"],
        ["Novice", "< 15", "Variable"]
      ]
    },
    seoContent: `
      <h2>The Science of Hand-Eye Coordination</h2>
      <p>An <strong>Aim Trainer</strong> is more than just a tool for FPS gamers. It is a psychomotor assessment that measures the efficiency of your occulomotor loop—the connection between what your eyes see and how your hand muscles respond.</p>
      <h3>Key Metrics Measured</h3>
      <ul class="list-disc pl-5 space-y-2 text-zinc-400">
        <li><strong>Flick Shots (Saccades):</strong> Fast, ballistic movements of the eyes and hands to a new target.</li>
        <li><strong>Tracking:</strong> Maintaining focus on a moving object (Smooth Pursuit).</li>
      </ul>
    `
  },

  // --- COGNITIVE STATS ---
  {
    id: 'reaction-time-test',
    title: 'Reaction Time Test',
    category: TestCategory.COGNITIVE,
    description: 'Measure your visual reflex speed in milliseconds. Compare your result to the human average (215ms).',
    iconName: 'Zap',
    estimatedTime: '1 min',
    isImplemented: true,
    instructions: [
      "Click the 'Start' button to prime the test.",
      "Wait for the red background to turn GREEN.",
      "Click immediately once the color changes.",
      "Repeat 5 times for an accurate average."
    ],
    clinicalRelevance: [
      "Neural Processing Speed: Measures the speed of signal transmission from retina to visual cortex to motor cortex.",
      "Cognitive Fatigue: Slower times often correlate with sleep deprivation or mental exhaustion.",
      "Age-Related Decline: Reaction time is one of the most reliable biomarkers for cognitive aging."
    ],
    benchmarks: {
      title: "Average Visual Reaction Time by Age",
      columns: ["Age Group", "Average (ms)", "Pro Athlete"],
      rows: [
        ["18 - 25", "215 ms", "150 - 180 ms"],
        ["26 - 35", "240 ms", "180 - 200 ms"],
        ["36 - 45", "270 ms", "200 - 230 ms"],
        ["46 - 55", "320 ms", "230 - 260 ms"],
        ["56 - 65", "370 ms", "260+ ms"],
        ["65+", "400+ ms", "Variable"]
      ]
    },
    concepts: [
      { term: "Simple Reaction Time (SRT)", definition: "The time required for an observer to detect the presence of a stimulus." },
      { term: "Myelination", definition: "The process of coating the axon of each neuron with a fatty coating called myelin, which protects the neuron and helps it conduct signals more efficiently." }
    ],
    citations: [
        "Woods, D. L., et al. (2015). Factors influencing the latency of simple reaction time. Frontiers in Human Neuroscience.",
        "Luce, R. D. (1986). Response Times: Their Role in Inferring Elementary Mental Organization. Oxford University Press."
    ],
    faqs: [
      {
        question: "What is a good reaction time?",
        answer: "The average human visual reaction time is around 250ms. A score below 200ms is considered fast, and elite athletes or pro gamers often achieve scores below 150ms."
      },
      {
        question: "Does reaction time slow down with age?",
        answer: "Yes. Reaction time typically peaks around age 24 and then begins a slow, steady decline. However, regular practice and physical exercise can mitigate this decline."
      },
      {
        question: "Why is my reaction time slow on this test?",
        answer: "Factors include display latency (60Hz vs 144Hz monitors), input lag (wireless vs wired mice), and your current state of alertness (fatigue/caffeine)."
      }
    ],
    seoContent: `
      <h2>Why Measure Reaction Time?</h2>
      <p>Reaction time (RT) is the elapsed time between the presentation of a sensory stimulus and the subsequent behavioral response. It is a critical indicator of central nervous system processing speed.</p>
      <h3>Factors Affecting Reaction Time</h3>
      <p>Several variables impact your score on this <strong>Reaction Time Test</strong>:</p>
      <ul class="list-disc pl-5 space-y-1 text-zinc-400">
        <li><strong>Age:</strong> RT naturally slows as we age due to the gradual loss of neurons and reduced myelination.</li>
        <li><strong>Hardware Latency:</strong> Wireless mice and 60Hz monitors can add 10-30ms of input lag compared to wired peripherals and 144Hz+ displays.</li>
        <li><strong>Alertness:</strong> Caffeine and adrenaline can temporarily decrease reaction time (improve speed).</li>
      </ul>
    `
  },
  {
    id: 'verbal-memory-test',
    title: 'Verbal Memory Test',
    category: TestCategory.COGNITIVE,
    description: 'Short-term memory challenge. Keep track of seen vs. new words as the list grows longer.',
    iconName: 'Book',
    estimatedTime: '2 min',
    isImplemented: true
  },
  {
    id: 'typing-speed-test',
    title: 'Typing Speed Test',
    category: TestCategory.COGNITIVE,
    description: 'WPM Test. Calculate your Words Per Minute and keyboard accuracy in a 60-second sprint.',
    iconName: 'Keyboard',
    estimatedTime: '1 min',
    isImplemented: true,
    benchmarks: {
      title: "Typing Speed Percentiles",
      columns: ["Skill Level", "Speed (WPM)", "Percentile"],
      rows: [
        ["Elite", "100+ WPM", "Top 1%"],
        ["Pro / Advanced", "80 - 100 WPM", "Top 10%"],
        ["Fluent", "60 - 80 WPM", "Top 25%"],
        ["Average", "40 - 60 WPM", "Top 50%"],
        ["Beginner", "< 40 WPM", "Bottom 50%"]
      ]
    },
    seoContent: `
      <h2>What is a Good Typing Speed?</h2>
      <p>Typing speed is measured in <strong>Words Per Minute (WPM)</strong>. It is a measure of both cognitive processing speed (reading and translating thought to action) and fine motor skills (muscle memory).</p>
      <h3>Touch Typing vs. Hunt and Peck</h3>
      <p>The biggest factor in increasing your WPM is learning <strong>Touch Typing</strong>—using all ten fingers without looking at the keyboard. This relies on muscle memory (proprioception) rather than visual feedback, drastically reducing the cognitive load required to find keys.</p>
    `
  },
  {
    id: 'reading-speed-test',
    title: 'Reading Speed Test',
    category: TestCategory.COGNITIVE,
    description: 'How fast do you read? Measure your WPM and comprehension level with a standard passage.',
    iconName: 'BookOpen',
    estimatedTime: '2 min',
    isImplemented: true
  },
  {
    id: 'chimp-test',
    title: 'Chimp Test',
    category: TestCategory.COGNITIVE,
    description: 'Are you smarter than a chimpanzee? Test your working memory and iconic memory span.',
    iconName: 'Brain',
    estimatedTime: '3 min',
    isImplemented: true,
    citations: [
        "Inoue, S., & Matsuzawa, T. (2007). Working memory of numerals in a chimpanzee. Current Biology."
    ],
    seoContent: `
      <h2>The Story of Ayumu the Chimpanzee</h2>
      <p>This test is based on a famous experiment conducted at Kyoto University's Primate Research Institute. A young chimpanzee named <strong>Ayumu</strong> shocked the world by memorizing the positions of numbers 1-9 on a screen in less than 60 milliseconds—faster than the blink of a human eye.</p>
      <h3>Working Memory vs. Eidetic Memory</h3>
      <p>The <strong>Chimp Test</strong> challenges your working memory and iconic memory (visual sensory memory). While humans generally outperform chimpanzees in language and complex reasoning, some primates appear to have superior immediate visual recall.</p>
    `
  },
  {
    id: 'number-memory-test',
    title: 'Number Memory Test',
    category: TestCategory.COGNITIVE,
    description: 'Digit Span Test. How many numbers can you hold in your head at once? Average is 7.',
    iconName: 'Hash',
    estimatedTime: '3 min',
    isImplemented: true,
    citations: [
        "Miller, G. A. (1956). The magical number seven, plus or minus two: Some limits on our capacity for processing information. Psychological Review."
    ],
    seoContent: `
      <h2>The Magic Number 7</h2>
      <p>This test is known in psychology as the <strong>Digit Span Test</strong>. In 1956, cognitive psychologist George Miller published a famous paper arguing that the capacity of human short-term memory is approximately 7 items, plus or minus 2.</p>
      <h3>Improving Your Score with Chunking</h3>
      <p>If you find it hard to remember more than 7 digits, try <strong>chunking</strong>. This is the process of breaking a long string of numbers into smaller groups.</p>
    `
  },
  {
    id: 'attention-span-test',
    title: 'Attention Span Test',
    category: TestCategory.COGNITIVE,
    description: 'Vigilance Test. Measure your ability to maintain focus on a monotonous task without spacing out.',
    iconName: 'Focus',
    estimatedTime: '1 min',
    isImplemented: true,
    citations: [
        "Mackworth, N. H. (1948). The breakdown of vigilance during prolonged visual search. Quarterly Journal of Experimental Psychology."
    ],
    seoContent: `
      <h2>Vigilance and Sustained Attention</h2>
      <p>This <strong>Attention Span Test</strong> is a simplified version of a Psychomotor Vigilance Task (PVT). It measures your ability to remain alert to a visual stimulus over a period of time.</p>
    `
  },
  {
    id: 'cps-test',
    title: 'CPS Test',
    category: TestCategory.COGNITIVE,
    description: 'Clicks Per Second. Test your finger speed and mouse clicking stamina.',
    iconName: 'MousePointer',
    estimatedTime: '10 sec',
    isImplemented: true,
    seoContent: `
      <h2>What is the CPS Test?</h2>
      <p>The <strong>CPS Test</strong> (Clicks Per Second) measures the speed at which you can click your mouse button in a given timeframe, usually 10 seconds. It is a popular benchmark in the gaming community, particularly for Minecraft PvP.</p>
    `
  },
  {
    id: 'spacebar-speed-test',
    title: 'Spacebar Speed Test',
    category: TestCategory.COGNITIVE,
    description: 'Spacebar Counter. Measure thumb velocity and keyboard latency.',
    iconName: 'Minus',
    estimatedTime: '10 sec',
    isImplemented: true,
    seoContent: `
      <h2>The Spacebar Counter Challenge</h2>
      <p>Also known as the <strong>Spacebar Clicker</strong>, this test isolates the speed of your thumb. While index fingers are used for mouse clicking, the thumb is heavier and often slower, yet crucial for movement (jumping) in gaming.</p>
    `
  },
  {
    id: 'stroop-effect-test',
    title: 'Stroop Test',
    category: TestCategory.COGNITIVE,
    description: 'Cognitive flexibility challenge. Say the color of the word, not the word itself.',
    iconName: 'Brain',
    estimatedTime: '2 min',
    isImplemented: true,
    citations: [
        "Stroop, J. R. (1935). Studies of interference in serial verbal reactions. Journal of Experimental Psychology."
    ],
    seoContent: `
      <h2>What is the Stroop Effect?</h2>
      <p>The <strong>Stroop Effect</strong> demonstrates the delay in reaction time between congruent and incongruent stimuli. It is one of the most famous experiments in cognitive psychology.</p>
    `
  },

  // --- PERSONALITY STATS ---
  {
    id: 'big-five-test',
    title: 'Big 5 Personality',
    category: TestCategory.PERSONALITY,
    description: 'The Gold Standard. Measure your Openness, Conscientiousness, Extraversion, Agreeableness, and Neuroticism.',
    iconName: 'PieChart',
    estimatedTime: '5 min',
    isImplemented: true,
    seoContent: `
      <h2>The Five-Factor Model</h2>
      <p>The Big Five personality traits are the best accepted and most commonly used model of personality in academic psychology. The traits are often remembered by the acronym OCEAN.</p>
    `
  },
  {
    id: 'adhd-test',
    title: 'ADHD Screener',
    category: TestCategory.PERSONALITY,
    description: 'Based on ASRS-v1.1. A 6-question screening tool for adult ADHD symptoms.',
    iconName: 'Activity',
    estimatedTime: '3 min',
    isImplemented: true,
    citations: [
        "Kessler, R. C., et al. (2005). The World Health Organization Adult ADHD Self-Report Scale (ASRS): a short screening scale for use in the general population. Psychological Medicine."
    ],
    seoContent: `
      <h2>Adult ADHD Self-Report Scale (ASRS-v1.1)</h2>
      <p>This <strong>ADHD Test</strong> utilizes the 6-question screening checklist developed by the World Health Organization. It focuses on the frequency of symptoms related to inattention, impulsivity, and hyperactivity in adults.</p>
    `
  },
  {
    id: 'eq-test',
    title: 'EQ Test',
    category: TestCategory.PERSONALITY,
    description: 'Emotional Intelligence assessment. Evaluate your empathy and social awareness.',
    iconName: 'Heart',
    estimatedTime: '3 min',
    isImplemented: true,
    seoContent: `
      <h2>Emotional Intelligence Quotient (EQ)</h2>
      <p>Unlike IQ, which measures cognitive intelligence, EQ measures your ability to identify, evaluate, control, and express emotions. High EQ is strongly correlated with leadership ability and relationship satisfaction.</p>
    `
  },
  {
    id: 'anxiety-test',
    title: 'Anxiety Test',
    category: TestCategory.PERSONALITY,
    description: 'GAD-7 Anxiety Screener. Check the severity of generalized anxiety symptoms.',
    iconName: 'AlertCircle',
    estimatedTime: '2 min',
    isImplemented: true,
    citations: [
        "Spitzer, R. L., et al. (2006). A brief measure for assessing generalized anxiety disorder: the GAD-7. Archives of Internal Medicine."
    ]
  },
  {
    id: 'chronotype-test',
    title: 'Chronotype Test',
    category: TestCategory.PERSONALITY,
    description: 'Are you a Lion, Bear, Wolf, or Dolphin? Find your optimal sleep and productivity window.',
    iconName: 'Moon',
    estimatedTime: '2 min',
    isImplemented: true,
    citations: [
        "Breus, M. J. (2016). The Power of When. Little, Brown Spark."
    ]
  },
  {
    id: 'empathy-test',
    title: 'Empathy Test',
    category: TestCategory.PERSONALITY,
    description: 'Measure your Affective and Cognitive Empathy levels.',
    iconName: 'Users',
    estimatedTime: '3 min',
    isImplemented: true
  },
  {
    id: 'procrastination-test',
    title: 'Procrastination Test',
    category: TestCategory.PERSONALITY,
    description: 'Analyze your time management habits and procrastination triggers.',
    iconName: 'Clock',
    estimatedTime: '5 min',
    isImplemented: true
  },
  {
    id: 'difficult-person-test',
    title: 'Difficult Person Test',
    category: TestCategory.PERSONALITY,
    description: 'Based on the IDRlabs concept. Measure agreeableness and potential toxic traits.',
    iconName: 'UserX',
    estimatedTime: '4 min',
    isImplemented: true
  },
  {
    id: 'social-battery-test',
    title: 'Social Battery Test',
    category: TestCategory.PERSONALITY,
    description: 'Introvert, Extrovert, or Ambivert? Check your social energy drain rate.',
    iconName: 'Battery',
    estimatedTime: '3 min',
    isImplemented: true
  },
  {
    id: 'left-right-brain-test',
    title: 'Left Brain Right Brain Test',
    category: TestCategory.PERSONALITY,
    description: 'Are you logical (Left) or creative (Right)? A fun hemisphere dominance quiz.',
    iconName: 'Split',
    estimatedTime: '4 min',
    isImplemented: true
  }
];
