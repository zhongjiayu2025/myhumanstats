
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Play, Volume2, AlertCircle, RefreshCw, Settings2, Activity, Waves } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';
import { setupHiDPICanvas } from '@/lib/core';

export default function MicTestClient() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [volume, setVolume] = useState(0);
  const [isClipping, setIsClipping] = useState(false);
  
  // Settings
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [vizMode, setVizMode] = useState<'frequency' | 'waveform'>('waveform');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Check for devices initially if permission already granted
    enumerateDevices();
    return () => stopAll();
  }, []);

  const enumerateDevices = async () => {
      try {
          const devs = await navigator.mediaDevices.enumerateDevices();
          const audioInputs = devs.filter(d => d.kind === 'audioinput');
          setDevices(audioInputs);
          if (audioInputs.length > 0 && !selectedDeviceId) {
              setSelectedDeviceId(audioInputs[0].deviceId);
          }
      } catch (e) {
          console.error("Device enumeration failed", e);
      }
  };

  const startMic = async () => {
    try {
      setError('');
      stopAll(); // Clear previous stream

      // Request with specific device if selected
      const constraints = selectedDeviceId ? { audio: { deviceId: { exact: selectedDeviceId } } } : { audio: true };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      // Update device list after permission grant (labels become available)
      enumerateDevices();
      
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyzer = ctx.createAnalyser();
      analyzer.fftSize = 2048; 
      source.connect(analyzer);
      analyzerRef.current = analyzer;
      
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
      setError('Microphone access denied. Please check browser permissions.');
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
     setIsClipping(false);
  };

  const stopAll = () => {
     stopRecording();
     if (audioCtxRef.current) audioCtxRef.current.close();
  };

  const drawVisualizer = () => {
     const canvas = canvasRef.current;
     const analyzer = analyzerRef.current;
     if (!canvas || !analyzer) return;

     const rect = canvas.getBoundingClientRect();
     const ctx = setupHiDPICanvas(canvas, rect.width, rect.height);
     if (!ctx) return;

     const bufferLength = analyzer.frequencyBinCount;
     const dataArray = new Uint8Array(bufferLength);
     const timeArray = new Uint8Array(bufferLength);

     const draw = () => {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, rect.width, rect.height);

        // Volume & Clipping Calculation (RMS)
        analyzer.getByteTimeDomainData(timeArray);
        let sum = 0;
        let peak = 0;
        for(let i=0; i<bufferLength; i++) {
            const val = (timeArray[i] - 128) / 128;
            sum += val * val;
            if (Math.abs(val) > peak) peak = Math.abs(val);
        }
        const rms = Math.sqrt(sum / bufferLength);
        const db = 20 * Math.log10(rms);
        // Normalize roughly -60dB to 0dB range to 0-100%
        const vol = Math.max(0, (db + 60) / 60 * 100); 
        
        setVolume(vol);
        setIsClipping(peak > 0.95);

        if (vizMode === 'frequency') {
            analyzer.getByteFrequencyData(dataArray);
            const barWidth = (rect.width / bufferLength) * 2.5;
            let x = 0;
            for(let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * rect.height;
                ctx.fillStyle = `hsl(${i/bufferLength * 260 + 180}, 100%, 50%)`; 
                ctx.fillRect(x, rect.height - barHeight, barWidth, barHeight);
                x += barWidth + 1;
            }
        } else {
            // Oscilloscope
            ctx.lineWidth = 2;
            ctx.strokeStyle = peak > 0.95 ? '#ef4444' : '#22d3ee'; // Red if clipping
            ctx.beginPath();
            const sliceWidth = rect.width / bufferLength;
            let x = 0;
            for(let i = 0; i < bufferLength; i++) {
                const v = timeArray[i] / 128.0;
                const y = v * (rect.height / 2);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
                x += sliceWidth;
            }
            ctx.lineTo(canvas.width, canvas.height / 2);
            ctx.stroke();
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
       <Breadcrumbs items={[{ label: 'Tools', path: '/tools' }, { label: 'Mic Test' }]} />

       <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          <div className="space-y-8">
             <div>
                 <h1 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
                    <Mic className="text-primary-500" /> Mic Check
                 </h1>
                 <p className="text-zinc-400 text-sm leading-relaxed">
                    Professional input monitoring. Check gain levels, detect clipping distortion, and record playback loops.
                 </p>
             </div>

             {/* Device Selector */}
             <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
                 <label className="text-xs text-zinc-500 uppercase font-bold mb-2 block">Input Source</label>
                 <select 
                    value={selectedDeviceId}
                    onChange={(e) => { setSelectedDeviceId(e.target.value); if(isRecording) startMic(); }}
                    className="w-full bg-black border border-zinc-700 rounded p-2 text-sm text-white focus:border-primary-500 outline-none"
                    disabled={devices.length === 0}
                 >
                     {devices.length === 0 && <option>Default Microphone (Grant Permission first)</option>}
                     {devices.map(d => (
                         <option key={d.deviceId} value={d.deviceId}>{d.label || `Microphone ${d.deviceId.slice(0,5)}...`}</option>
                     ))}
                 </select>
             </div>

             <div className="flex gap-4">
                {!isRecording ? (
                   <button onClick={startMic} className="btn-primary flex-1 flex items-center justify-center gap-2">
                      <Mic size={18} /> Start Monitoring
                   </button>
                ) : (
                   <button onClick={stopRecording} className="btn-secondary border-red-500 text-red-500 hover:bg-red-900/20 flex-1 flex items-center justify-center gap-2 animate-pulse">
                      <Square size={18} fill="currentColor" /> Stop
                   </button>
                )}
             </div>

             {/* Volume Meter */}
             <div>
                <div className="flex justify-between text-xs text-zinc-500 uppercase tracking-widest mb-2">
                   <span>Gain Level</span>
                   <span className={isClipping ? "text-red-500 font-bold" : ""}>{isClipping ? "CLIPPING!" : `${Math.round(volume)}%`}</span>
                </div>
                <div className="h-4 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800 relative">
                   {/* Clipping Marker */}
                   <div className="absolute right-0 top-0 bottom-0 w-1 bg-red-900 z-0"></div>
                   
                   <div 
                      className={`h-full relative z-10 transition-all duration-75 ${volume > 95 ? 'bg-red-500' : volume > 70 ? 'bg-yellow-500' : 'bg-primary-500'}`} 
                      style={{ width: `${Math.min(100, volume)}%` }}
                   ></div>
                </div>
                {isClipping && <p className="text-[10px] text-red-400 mt-1">⚠️ Signal is too hot. Lower your mic gain.</p>}
             </div>

             {/* Playback */}
             {audioURL && (
                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded flex items-center justify-between animate-in slide-in-from-left">
                   <div className="text-sm text-zinc-400">Loopback Ready</div>
                   <div className="flex gap-2">
                      <button onClick={togglePlayback} className="p-2 bg-primary-600 hover:bg-primary-500 rounded-full text-black transition-colors">
                         {isPlaying ? <Square size={16} fill="black"/> : <Play size={16} fill="black"/>}
                      </button>
                      <button onClick={() => setAudioURL(null)} className="p-2 border border-zinc-700 hover:bg-zinc-800 rounded-full text-zinc-400 transition-colors">
                         <RefreshCw size={16} />
                      </button>
                   </div>
                   <audio ref={audioElRef} src={audioURL} onEnded={() => setIsPlaying(false)} className="hidden" />
                </div>
             )}
          </div>

          {/* Visualizer Area */}
          <div className="flex flex-col h-full">
              <div className="flex justify-end mb-2 gap-2">
                  <button onClick={() => setVizMode('waveform')} className={`p-2 rounded ${vizMode === 'waveform' ? 'bg-zinc-800 text-primary-400' : 'text-zinc-600 hover:text-zinc-400'}`} title="Oscilloscope">
                      <Activity size={16} />
                  </button>
                  <button onClick={() => setVizMode('frequency')} className={`p-2 rounded ${vizMode === 'frequency' ? 'bg-zinc-800 text-primary-400' : 'text-zinc-600 hover:text-zinc-400'}`} title="Spectrum">
                      <Waves size={16} />
                  </button>
              </div>
              
              <div className="bg-black border border-zinc-800 rounded-xl p-4 flex-grow relative overflow-hidden min-h-[300px] shadow-inner">
                 <canvas ref={canvasRef} className="w-full h-full object-contain" />
                 
                 {!isRecording && !audioURL && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-700 pointer-events-none">
                       <Volume2 size={64} className="mb-4 opacity-50" />
                       <p className="font-mono text-sm">AWAITING_INPUT_STREAM</p>
                    </div>
                 )}
              </div>
          </div>

       </div>
    </div>
  );
}
