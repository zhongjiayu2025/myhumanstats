import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Play, Volume2, AlertCircle, RefreshCw } from 'lucide-react';
import SEO from '../../components/SEO';
import Breadcrumbs from '../../components/Breadcrumbs';

const MicTestPage: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [volume, setVolume] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
       stopAll();
    };
  }, []);

  const startMic = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Setup Visualizer
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyzer = ctx.createAnalyser();
      analyzer.fftSize = 256;
      source.connect(analyzer);
      analyzerRef.current = analyzer;
      
      // Setup Recorder
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
         if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
         const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
         const url = URL.createObjectURL(blob);
         setAudioURL(url);
      };

      recorder.start();
      setIsRecording(true);
      setAudioURL(null);
      drawVisualizer();

    } catch (err) {
      setError('Microphone access denied. Check browser permissions.');
      console.error(err);
    }
  };

  const stopRecording = () => {
     if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
     }
     if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
     }
     if (rafRef.current) cancelAnimationFrame(rafRef.current);
     setVolume(0);
  };

  const stopAll = () => {
     stopRecording();
     if (audioCtxRef.current) audioCtxRef.current.close();
  };

  const drawVisualizer = () => {
     const canvas = canvasRef.current;
     const analyzer = analyzerRef.current;
     if (!canvas || !analyzer) return;

     const ctx = canvas.getContext('2d');
     if (!ctx) return;

     const bufferLength = analyzer.frequencyBinCount;
     const dataArray = new Uint8Array(bufferLength);

     const draw = () => {
        analyzer.getByteFrequencyData(dataArray);
        
        // Calculate average volume for meter
        let sum = 0;
        for(let i=0; i<bufferLength; i++) sum += dataArray[i];
        setVolume(sum / bufferLength);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;

        for(let i = 0; i < bufferLength; i++) {
           barHeight = dataArray[i] / 2;
           
           ctx.fillStyle = `rgb(${barHeight + 100}, 50, 200)`; // Purple/Pink gradient
           if (barHeight > 100) ctx.fillStyle = '#22d3ee'; // Cyan peak

           ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
           x += barWidth + 1;
        }

        if (mediaRecorderRef.current?.state === 'recording') {
           rafRef.current = requestAnimationFrame(draw);
        }
     };
     draw();
  };

  const togglePlayback = () => {
     if (!audioElRef.current || !audioURL) return;
     
     if (isPlaying) {
        audioElRef.current.pause();
        audioElRef.current.currentTime = 0;
        setIsPlaying(false);
     } else {
        audioElRef.current.play();
        setIsPlaying(true);
     }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 animate-in fade-in">
       <SEO 
          title="Online Microphone Test"
          description="Test your microphone online. Visualize audio input, check volume levels, and record a playback clip to ensure your mic is working."
       />
       <Breadcrumbs items={[{ label: 'Tools', path: '/tools' }, { label: 'Mic Test' }]} />

       <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          <div>
             <h1 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
                <Mic className="text-primary-500" /> Microphone Test
             </h1>
             <p className="text-zinc-400 leading-relaxed mb-8">
                Troubleshooting audio issues? Use this tool to verify your input device is capturing sound correctly. We visualize the waveform and allow a quick loopback recording.
             </p>

             {error && (
                <div className="bg-red-900/20 border border-red-500/50 p-4 rounded mb-6 flex items-start gap-3">
                   <AlertCircle className="text-red-500 shrink-0 mt-1" size={18} />
                   <div className="text-sm text-red-200">
                      <strong>Permission Error:</strong> {error}
                      <br/>Please allow microphone access in your browser settings bar (usually top left).
                   </div>
                </div>
             )}

             <div className="space-y-6">
                <div className="flex gap-4">
                   {!isRecording ? (
                      <button onClick={startMic} className="btn-primary flex items-center gap-2">
                         <Mic size={18} /> Test Microphone
                      </button>
                   ) : (
                      <button onClick={stopRecording} className="btn-secondary border-red-500 text-red-500 hover:bg-red-900/20 flex items-center gap-2 animate-pulse">
                         <Square size={18} fill="currentColor" /> Stop Test
                      </button>
                   )}
                </div>

                {audioURL && (
                   <div className="bg-zinc-900 border border-zinc-800 p-4 rounded flex items-center justify-between animate-in slide-in-from-left">
                      <div className="text-sm text-zinc-400">
                         Recording ready for playback
                      </div>
                      <div className="flex gap-2">
                         <button onClick={togglePlayback} className="p-2 bg-primary-600 hover:bg-primary-500 rounded-full text-black">
                            {isPlaying ? <Square size={16} fill="black"/> : <Play size={16} fill="black"/>}
                         </button>
                         <button onClick={() => setAudioURL(null)} className="p-2 border border-zinc-700 hover:bg-zinc-800 rounded-full text-zinc-400">
                            <RefreshCw size={16} />
                         </button>
                      </div>
                      <audio 
                         ref={audioElRef} 
                         src={audioURL} 
                         onEnded={() => setIsPlaying(false)} 
                         className="hidden"
                      />
                   </div>
                )}
             </div>
             
             {/* Volume Meter */}
             <div className="mt-8">
                <div className="flex justify-between text-xs text-zinc-500 uppercase tracking-widest mb-2">
                   <span>Input Level</span>
                   <span>{Math.round(volume)}%</span>
                </div>
                <div className="h-4 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                   <div 
                      className={`h-full transition-all duration-75 ${volume > 80 ? 'bg-red-500' : volume > 50 ? 'bg-green-500' : 'bg-primary-500'}`} 
                      style={{ width: `${Math.min(100, volume * 1.5)}%` }}
                   ></div>
                </div>
             </div>
          </div>

          <div className="bg-black border border-zinc-800 rounded-xl p-8 flex flex-col items-center justify-center relative overflow-hidden min-h-[300px]">
             {/* Visualizer Canvas */}
             <canvas 
                ref={canvasRef} 
                width={400} 
                height={200} 
                className="w-full h-full object-contain absolute inset-0 opacity-80"
             />
             
             {!isRecording && !audioURL && (
                <div className="relative z-10 text-center pointer-events-none opacity-50">
                   <Volume2 size={64} className="mx-auto text-zinc-700 mb-4" />
                   <p className="text-zinc-500 font-mono text-sm">WAITING FOR SIGNAL...</p>
                </div>
             )}
          </div>

       </div>

       {/* Cross Sell */}
       <div className="mt-12 border-t border-zinc-800 pt-8">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Microphone working? Next steps:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <a href="/test/vocal-range-test" className="p-4 bg-zinc-900/30 border border-zinc-800 hover:border-primary-500/50 transition-colors rounded block">
                <strong className="text-primary-400 block mb-1">Vocal Range Test</strong>
                <span className="text-xs text-zinc-500">Find out if you are a Tenor, Baritone, or Soprano using your mic.</span>
             </a>
             <a href="/test/perfect-pitch-test" className="p-4 bg-zinc-900/30 border border-zinc-800 hover:border-primary-500/50 transition-colors rounded block">
                <strong className="text-primary-400 block mb-1">Perfect Pitch Test</strong>
                <span className="text-xs text-zinc-500">Train your ear to identify musical notes.</span>
             </a>
          </div>
       </div>
    </div>
  );
};

export default MicTestPage;