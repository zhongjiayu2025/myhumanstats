
export type SoundType = 'hover' | 'click' | 'success' | 'fail' | 'snap';

let audioCtx: AudioContext | null = null;

const getCtx = () => {
  if (typeof window === 'undefined') return null; // SSR Check
  
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  // Robust resume for Safari/Mobile
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(e => console.error("Audio resume failed", e));
  }
  return audioCtx;
};

// Global unlock function to be called on first user interaction if needed
export const unlockAudio = () => {
    const ctx = getCtx();
    if (!ctx) return;
    
    if (ctx.state === 'suspended') {
        ctx.resume();
    }
    // Create and play silent buffer to unlock iOS audio
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
};

export const playUiSound = (type: SoundType) => {
  try {
    const ctx = getCtx();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    switch (type) {
      case 'hover':
        // High frequency blip
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(1200, t + 0.05);
        gain.gain.setValueAtTime(0.05, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        osc.start(t);
        osc.stop(t + 0.05);
        break;

      case 'click':
        // Mechanical click
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, t);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.1);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        osc.start(t);
        osc.stop(t + 0.1);
        break;

      case 'success':
        // Major chord arpeggio effect
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, t); // C5
        osc.frequency.setValueAtTime(659.25, t + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, t + 0.2); // G5
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.linearRampToValueAtTime(0.1, t + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
        osc.start(t);
        osc.stop(t + 0.6);
        break;

      case 'fail':
        // Low buzz
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.linearRampToValueAtTime(100, t + 0.3);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        osc.start(t);
        osc.stop(t + 0.3);
        break;
        
      case 'snap':
        // Sharp noise burst
        const bufferSize = ctx.sampleRate * 0.01;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for(let i=0; i<bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.01);
        noise.connect(gain);
        noise.start(t);
        break;
    }
  } catch (e) {
    // Audio context might be blocked or not supported
  }
};
