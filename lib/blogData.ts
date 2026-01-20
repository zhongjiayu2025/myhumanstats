export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  date: string;
  readTime: string;
  category: string;
  tags: string[];
  content: string; // HTML string for rich formatting
  relatedTestId: string; // ID of the test to link to
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "science-behind-hearing-age-test-high-frequency-loss",
    title: "The Science Behind the Hearing Age Test: Why High Frequencies Fade First",
    excerpt: "Discover the biological mechanisms of Presbycusis, why we lose the ability to hear 17kHz+ tones as we age, and how digital audiometry measures your biological ear age.",
    coverImage: "https://images.unsplash.com/photo-1516280440614-6697288d5d38?auto=format&fit=crop&q=80&w=1200",
    date: "January 20, 2026",
    readTime: "12 min read",
    category: "Auditory Science",
    tags: ["Hearing Age Test", "Presbycusis", "Audio Frequency", "Health"],
    relatedTestId: "hearing-age-test",
    content: `
      <p class="lead">We often take our hearing for granted until we notice we're missing parts of the conversation. But long before we struggle to hear speech, our ears lose the ability to detect the "shimmer" of high-frequency sounds. This phenomenon is the basis of the <strong>Hearing Age Test</strong>.</p>

      <h2>The Biology of Sound Perception</h2>
      <p>To understand how a <a href="https://myhumanstats.org/#/test/hearing-age-test" class="text-primary-400 hover:underline">Hearing Age Test</a> works, we must first look inside the cochlea. The human ear is a marvel of biological engineering, capable of detecting pressure variations as small as one-billionth of an atmosphere.</p>
      
      <p>Inside the cochlea, sound waves travel through fluid, stimulating thousands of tiny hair cells (stereocilia). These cells are tonotopically organized, meaning they are mapped like a piano keyboard:</p>
      <ul class="list-disc pl-6 space-y-2 my-4 text-zinc-300">
        <li><strong>Base of Cochlea:</strong> Detects high frequencies (up to 20,000 Hz). These hair cells are stiff and sensitive to rapid vibrations.</li>
        <li><strong>Apex of Cochlea:</strong> Detects low frequencies (down to 20 Hz). These are more flexible.</li>
      </ul>
      
      <p>Because the high-frequency hair cells are located at the very entrance of the cochlea, they are subjected to the most mechanical stress over a lifetime. Every sound wave that enters your ear must pass over them. This makes them the first to degrade, a condition scientifically known as <em>Presbycusis</em>.</p>

      <h2>What is a Hearing Age Test?</h2>
      <p>A <strong>Hearing Age Test</strong> is a form of high-frequency audiometry. Unlike a standard medical hearing exam—which typically tests frequencies between 250 Hz and 8,000 Hz (the range of human speech)—a hearing age test explores the "upper atmosphere" of human hearing, typically from 8,000 Hz up to 22,000 Hz.</p>
      
      <p>By determining the highest frequency you can reliably detect, we can correlate your upper threshold with statistical population data. For example:</p>
      <div class="bg-zinc-900 border-l-4 border-primary-500 p-4 my-6">
        <h4 class="text-white font-bold mb-2">Frequency Benchmarks by Age</h4>
        <ul class="text-sm font-mono space-y-1">
          <li><strong>8,000 Hz:</strong> Detectable by almost everyone (Standard Speech).</li>
          <li><strong>12,000 Hz:</strong> The average limit for someone aged 50.</li>
          <li><strong>15,000 Hz:</strong> The average limit for someone aged 40.</li>
          <li><strong>17,400 Hz:</strong> The "Mosquito Tone," typically only audible to those under 24.</li>
        </ul>
      </div>
      
      <p>You can verify your own threshold immediately using our <a href="https://myhumanstats.org/#/test/hearing-age-test" class="text-primary-400 hover:underline font-bold">free online Hearing Age Test</a>. This tool generates a precise sine wave to pinpoint your exact cutoff frequency.</p>

      <h2>Why Do We Lose High Frequencies?</h2>
      <p>The degradation of high-frequency hearing is natural, but the rate at which it happens varies wildly based on lifestyle and genetics. According to the <a href="https://www.nidcd.nih.gov/health/age-related-hearing-loss" target="_blank" rel="noopener noreferrer" class="text-zinc-400 underline decoration-zinc-600 hover:text-white">National Institute on Deafness and Other Communication Disorders (NIDCD)</a>, approximately one in three people in the United States between the ages of 65 and 74 has hearing loss.</p>

      <h3>1. Noise-Induced Hearing Loss (NIHL)</h3>
      <p>In the modern world, our ears are under constant assault. The widespread use of high-fidelity in-ear monitors (IEMs) and noise-canceling headphones has led to a rise in "hidden hearing loss." Listening to music at volumes exceeding 85 dB for extended periods can permanently damage the stereocilia.</p>

      <h3>2. Ototoxic Medications</h3>
      <p>Certain classes of drugs, including aminoglycoside antibiotics and some chemotherapy agents (like cisplatin), are known to be ototoxic. Research published in the <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3102156/" target="_blank" rel="noopener noreferrer" class="text-zinc-400 underline decoration-zinc-600 hover:text-white">Journal of Cellular and Molecular Medicine</a> indicates that these drugs often target the basal turn of the cochlea first—exactly where high-frequency hearing resides.</p>

      <h2>The Clinical Significance of High Frequencies</h2>
      <p>You might ask, "If speech is below 8,000 Hz, why does it matter if I can't hear 16,000 Hz?"</p>
      <p>While you don't need 16 kHz to understand a word, these ultra-high frequencies contribute to the "brilliance" and localization of sound. They help you distinguish where a sound is coming from in a crowded room (the "Cocktail Party Effect"). Furthermore, a decline in high-frequency sensitivity is often the "canary in the coal mine"—an early warning sign of auditory system stress before it affects speech comprehension.</p>

      <h2>How to Protect Your Hearing Age</h2>
      <p>Once hair cells die, they do not regenerate in humans. However, you can slow the rate of decline:</p>
      <ol class="list-decimal pl-6 space-y-4 my-4 text-zinc-300">
        <li><strong>Use the 60/60 Rule:</strong> When using headphones, listen at no more than 60% volume for no more than 60 minutes at a time.</li>
        <li><strong>Wear High-Fidelity Earplugs:</strong> If you attend concerts, standard foam earplugs muffle sound. High-fidelity plugs reduce decibels evenly, preserving the music quality while protecting your <strong>hearing age</strong>.</li>
        <li><strong>Regular Screening:</strong> Track your hearing annually. Using a digital tool like the <a href="https://myhumanstats.org" class="text-primary-400 hover:underline">MyHumanStats Dashboard</a> allows you to monitor changes in your auditory, visual, and cognitive performance over time.</li>
      </ol>

      <h2>Conclusion</h2>
      <p>Your "Hearing Age" is more than just a party trick or a number on a screen. It is a biometric marker of your cumulative noise exposure and auditory health. By understanding the science behind the frequency response of the cochlea, we can take better steps to preserve the fidelity of our world.</p>
      
      <p>Ready to benchmark your ears? <a href="https://myhumanstats.org/#/test/hearing-age-test" class="text-primary-400 hover:underline font-bold">Start the Hearing Age Test now</a> and see how you compare to the global average.</p>
    `
  },
  {
    slug: "reaction-time-and-cognitive-decline",
    title: "Reaction Time as a Biomarker: What Your Reflexes Say About Your Brain",
    excerpt: "Reaction time is more than just gaming skill. It is a direct measure of processing speed and synaptic efficiency. Learn how to benchmark and improve your cognitive throughput.",
    coverImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200",
    date: "January 18, 2026",
    readTime: "10 min read",
    category: "Cognitive Performance",
    tags: ["Reaction Time", "Neuroscience", "Gaming", "Cognition"],
    relatedTestId: "reaction-time-test",
    content: `
      <p class="lead">From braking a car to catching a falling glass, reaction time is the fundamental unit of interaction with the physical world. But in the realm of neuroscience, it serves as a critical window into the efficiency of your central nervous system.</p>
      
      <h2>The Anatomy of a Reflex</h2>
      <p>When you take a <a href="https://myhumanstats.org/#/test/reaction-time-test" class="text-primary-400 hover:underline">Reaction Time Test</a>, you aren't just clicking a mouse. You are initiating a complex neural loop:</p>
      <ol class="list-decimal pl-6 space-y-2 text-zinc-300">
        <li><strong>Visual Transduction:</strong> The retina detects the color change (stimulus).</li>
        <li><strong>Transmission:</strong> The optic nerve sends the signal to the visual cortex.</li>
        <li><strong>Processing:</strong> The brain recognizes the signal as "Go."</li>
        <li><strong>Motor Command:</strong> The motor cortex fires a signal down the spinal cord to your hand muscles.</li>
        <li><strong>Action:</strong> Your finger depresses the switch.</li>
      </ol>
      <p>The average human completes this loop in approximately 215 to 250 milliseconds. However, elite athletes and professional gamers often achieve speeds below 150ms.</p>

      <h2>Measuring Mental Processing Speed</h2>
      <p>Reaction time is heavily correlated with "g" (general intelligence) because it reflects the myelination of neurons—essentially, the insulation that allows electrical signals to move quickly. Slower reaction times can be an early indicator of cognitive fatigue, sleep deprivation, or systemic inflammation.</p>
      
      <p>Regular benchmarking via the <a href="https://myhumanstats.org/#/test/reaction-time-test" class="text-primary-400 hover:underline">MyHumanStats Reaction Time module</a> allows you to establish a baseline. Sudden deviations from this baseline are often more telling than the raw number itself.</p>
      
      <!-- Content truncated for architectural demo, but this would continue for 2000+ words covering Factors affecting RT, Training methods, and Clinical correlations. -->
      <p>To get a precise measurement of your current neural latency, ensure you are using a low-latency display and a wired mouse, then <a href="https://myhumanstats.org/#/test/reaction-time-test" class="text-primary-400 hover:underline font-bold">test your reaction time here</a>.</p>
    `
  },
  {
    slug: "understanding-color-blindness-types",
    title: "Beyond Black and White: A Deep Dive into Color Vision Deficiency",
    excerpt: "Protanopia, Deuteranopia, Tritanopia. We break down the genetics of Color Blindness and how digital Ishihara plates function to detect these ocular anomalies.",
    coverImage: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=1200",
    date: "January 15, 2026",
    readTime: "15 min read",
    category: "Visual Health",
    tags: ["Color Blindness", "Ishihara", "Genetics", "Vision"],
    relatedTestId: "color-blind-test",
    content: `
      <p class="lead">Color is not an inherent property of matter; it is a sensation created by the brain. When the machinery of the eye fails to capture specific wavelengths, entire spectrums of reality disappear. This is the world of Color Vision Deficiency (CVD).</p>
      
      <h2>The Cone Mosaic</h2>
      <p>The human retina contains three types of cone cells, each tuned to a specific wavelength peak:</p>
      <ul class="list-disc pl-6 space-y-2 text-zinc-300">
        <li><strong>L-Cones:</strong> Long wavelengths (Red).</li>
        <li><strong>M-Cones:</strong> Medium wavelengths (Green).</li>
        <li><strong>S-Cones:</strong> Short wavelengths (Blue).</li>
      </ul>
      <p>Our brain compares the signals from these three cones (Trichromacy) to perceive millions of colors. When one type of cone is missing or anomalous, the brain loses the ability to distinguish between certain hues.</p>

      <h2>Types of Color Blindness</h2>
      <p>Using our <a href="https://myhumanstats.org/#/test/color-blind-test" class="text-primary-400 hover:underline">Color Blind Test</a>, users can screen for the following conditions:</p>
      <h3>Deuteranomal (Green-Weak)</h3>
      <p>The most common form, affecting roughly 6% of males. The green cone is present but shifted toward the red spectrum, creating a "confusion line" where red and green look identical.</p>
      
      <h3>Protanopia (Red-Blind)</h3>
      <p>The complete absence of L-cones. Red looks dark or black, and purple is indistinguishable from blue.</p>

      <h2>The Ishihara Mechanism</h2>
      <p>Developed by Dr. Shinobu Ishihara in 1917, the pseudoisochromatic plates used in our test work on the principle of "confusion colors." Dots are arranged such that a trichromat (normal vision) sees a pattern based on hue, while a color-blind person sees a random field of brightness noise.</p>
      
      <!-- Content truncated -->
      <p>Curious about your own spectral sensitivity? Take the <a href="https://myhumanstats.org/#/test/color-blind-test" class="text-primary-400 hover:underline font-bold">Ishihara Color Blind Test</a> now.</p>
    `
  }
];
