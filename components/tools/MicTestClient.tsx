"use client";
import React, { useEffect, useRef, useState } from 'react';
import { Mic, Square, Play, Volume2, AlertCircle, RefreshCw, Activity, Waves } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';

/**
 * Private microphone diagnostic: capture, visualization and optional local
 * playback all stay within the browser. No audio is uploaded to a server.
 */
export default function MicTestClient() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [volume, setVolume] = useState(0);
  const [isClipping, setIsClipping] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [vizMode, setVizMode] = useState<'frequency' | 'waveform'>('waveform');
  const [recorderSupported, setRecorderSupported] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioElRef = useRef<HTMLAudioElement>(null);
  const urlRef = useRef<string | null>(null);
  const sessionRef = useRef(0);
  const mountedRef = useRef(true);
  const vizModeRef = useRef(vizMode);
  const startingRef = useRef(false);

  const clearPlayback = () => {
    audioElRef.current?.pause();
    setIsPlaying(false);
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
    setAudioURL(null);
  };

  const stopCapture = (keepClip: boolean) => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;

    const recorder = mediaRecorderRef.current;
    mediaRecorderRef.current = null;
    if (recorder?.state === 'recording') {
      if (!keepClip) recorder.onstop = null;
      try { recorder.stop(); } catch (_) { /* already stopped */ }
    }
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    analyserRef.current = null;
    const ctx = audioCtxRef.current;
    audioCtxRef.current = null;
    if (ctx && ctx.state !== 'closed') void ctx.close().catch(() => {});
    if (mountedRef.current) {
      setIsRecording(false);
      setVolume(0);
      setIsClipping(false);
    }
  };

  const enumerateDevices = async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    try {
      const all = await navigator.mediaDevices.enumerateDevices();
      if (!mountedRef.current) return;
      setDevices(all.filter(device => device.kind === 'audioinput'));
    } catch (_) {
      // Device enumeration may be blocked until microphone permission is granted.
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    void enumerateDevices();
    return () => {
      mountedRef.current = false;
      sessionRef.current++;
      stopCapture(false);
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    };
  }, []);

  useEffect(() => { vizModeRef.current = vizMode; }, [vizMode]);

  const drawVisualizer = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;
    const size = canvas.getBoundingClientRect();
    const width = Math.max(1, size.width);
    const height = Math.max(1, size.height);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    const context = canvas.getContext('2d');
    if (!context) return;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);

    const sizeBytes = analyser.frequencyBinCount;
    const spectrum = new Uint8Array(sizeBytes);
    const waveform = new Uint8Array(sizeBytes);
    let frame = 0;
    const draw = () => {
      if (!streamRef.current?.active || !analyserRef.current) return;
      context.clearRect(0, 0, width, height);
      context.fillStyle = '#050505';
      context.fillRect(0, 0, width, height);

      analyser.getByteTimeDomainData(waveform);
      let energy = 0, peak = 0;
      for (let i = 0; i < sizeBytes; i++) {
        const value = (waveform[i] - 128) / 128;
        energy += value * value;
        peak = Math.max(peak, Math.abs(value));
      }
      if (frame++ % 4 === 0) {
        const rms = Math.sqrt(energy / sizeBytes);
        const db = 20 * Math.log10(Math.max(rms, 0.000001));
        setVolume(Math.max(0, Math.min(100, (db + 60) * 100 / 60)));
        setIsClipping(peak > 0.95);
      }
      if (vizModeRef.current === 'frequency') {
        analyser.getByteFrequencyData(spectrum);
        const bars = 96;
        const barWidth = width / bars;
        for (let i = 0; i < bars; i++) {
          const value = spectrum[Math.floor(i * sizeBytes / bars)];
          const barHeight = value / 255 * height;
          context.fillStyle = '#22d3ee';
          context.fillRect(i * barWidth, height - barHeight, Math.max(1, barWidth - 1), barHeight);
        }
      } else {
        context.strokeStyle = peak > 0.95 ? '#f87171' : '#22d3ee';
        context.lineWidth = 2;
        context.beginPath();
        for (let i = 0; i < sizeBytes; i++) {
          const x = i * width / (sizeBytes - 1);
          const y = waveform[i] * height / 256;
          if (i === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        context.stroke();
      }
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
  };

  const startMic = async (deviceId = selectedDeviceId) => {
    if (startingRef.current) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Microphone capture requires HTTPS and a supported browser.');
      return;
    }
    startingRef.current = true;
    sessionRef.current++;
    const token = sessionRef.current;
    stopCapture(false);
    clearPlayback();
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: deviceId ? { deviceId: { ideal: deviceId } } : true
      });
      if (!mountedRef.current || token !== sessionRef.current) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }
      streamRef.current = stream;
      void enumerateDevices();
      const AudioContextType = window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextType) throw new Error('Web Audio is not supported');
      const ctx = new AudioContextType();
      audioCtxRef.current = ctx;
      if (ctx.state === 'suspended') await ctx.resume();
      if (token !== sessionRef.current || !mountedRef.current) return;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser); // Never connect microphone input to speakers.
      analyserRef.current = analyser;
      setRecorderSupported(typeof MediaRecorder !== 'undefined');
      if (typeof MediaRecorder !== 'undefined') {
        const candidates = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm', 'audio/ogg;codecs=opus'];
        const mime = candidates.find(type => MediaRecorder.isTypeSupported(type));
        const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
        mediaRecorderRef.current = recorder;
        chunksRef.current = [];
        recorder.ondataavailable = event => {
          if (event.data.size && token === sessionRef.current) chunksRef.current.push(event.data);
        };
        recorder.onstop = () => {
          if (!mountedRef.current || token !== sessionRef.current || !chunksRef.current.length) return;
          const blob = new Blob(chunksRef.current, { type: recorder.mimeType || chunksRef.current[0].type });
          const url = URL.createObjectURL(blob);
          if (urlRef.current) URL.revokeObjectURL(urlRef.current);
          urlRef.current = url;
          setAudioURL(url);
        };
        recorder.start();
      }
      setIsRecording(true);
      drawVisualizer();
    } catch (err) {
      const name = err instanceof DOMException ? err.name : '';
      setError(
        name === 'NotAllowedError' ? 'Microphone permission was denied. Allow microphone access in the browser and retry.' :
        name === 'NotFoundError' ? 'No microphone was detected. Connect a microphone and retry.' :
        name === 'NotReadableError' ? 'The microphone is in use by another application.' :
        'Could not initialize microphone capture. Try the default input or another browser.'
      );
      stopCapture(false);
    } finally {
      startingRef.current = false;
    }
  };

  const stopRecording = () => { stopCapture(true); };
  const togglePlayback = async () => {
    const el = audioElRef.current;
    if (!el || !audioURL) return;
    if (!el.paused) {
      el.pause();
      el.currentTime = 0;
      setIsPlaying(false);
      return;
    }
    try {
      await el.play();
      setIsPlaying(true);
    } catch (_) {
      setError('Playback was blocked. Tap the play button again or check browser audio settings.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <Breadcrumbs items={[{ label: 'Tools', path: '/tools' }, { label: 'Mic Test' }]} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3"><Mic className="text-primary-500" /> Microphone Test</h1>
          <p className="text-sm leading-relaxed text-zinc-400">Check input levels and play back a short recording. Audio stays on your device and is never uploaded.</p>
          <label htmlFor="mic-source" className="block text-xs font-bold text-zinc-400 uppercase">Input Source</label>
          <select id="mic-source" className="w-full bg-black border border-zinc-700 rounded p-3 text-sm text-white"
            value={selectedDeviceId}
            onChange={e => {
              setSelectedDeviceId(e.target.value);
              if (isRecording) {
                sessionRef.current++;
                stopCapture(false);
                setError('Input changed. Press Start Monitoring to use the selected microphone.');
              }
            }}>
            <option value="">Default microphone</option>
            {devices.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || 'Microphone (permission required)'}</option>)}
          </select>
          <div className="flex gap-3">
            {!isRecording ? (
              <button type="button" onClick={() => void startMic()} className="btn-primary flex-1 flex items-center justify-center gap-2"><Mic size={18}/> Start Monitoring</button>
            ) : (
              <button type="button" onClick={stopRecording} className="btn-secondary flex-1 border-red-500 text-red-400 flex items-center justify-center gap-2"><Square size={18}/> Stop</button>
            )}
          </div>
          {error && <p role="alert" className="text-sm text-amber-300 flex gap-2 items-start"><AlertCircle size={18} className="shrink-0"/>{error}</p>}
          {!recorderSupported && <p className="text-xs text-zinc-400">Your browser supports live monitoring but not local audio recording.</p>}
          <div>
            <div className="flex justify-between mb-2 text-xs text-zinc-400"><span>Estimated Input Level</span><span>{isClipping ? 'POSSIBLE CLIPPING' : `${Math.round(volume)}%`}</span></div>
            <div className="h-4 rounded bg-zinc-900 overflow-hidden border border-zinc-800" aria-label="Input volume">
              <div className={`h-full ${isClipping ? 'bg-red-500' : 'bg-primary-500'}`} style={{width: `${volume}%`}} />
            </div>
          </div>
          {audioURL && <div className="bg-zinc-900 border border-zinc-800 p-4 rounded flex items-center justify-between gap-3">
            <div className="text-sm text-zinc-300">Local recording ready</div>
            <div className="flex gap-2">
              <button type="button" onClick={() => void togglePlayback()} aria-label={isPlaying ? 'Stop playback' : 'Play recording'} className="p-3 bg-primary-500 text-black rounded-full">
                {isPlaying ? <Square size={17}/> : <Play size={17}/>}
              </button>
              <button type="button" onClick={clearPlayback} aria-label="Discard recording" className="p-3 border border-zinc-700 text-zinc-300 rounded-full"><RefreshCw size={17}/></button>
            </div>
            <audio ref={audioElRef} src={audioURL} onEnded={() => setIsPlaying(false)} />
          </div>}
          <p className="text-xs text-zinc-500">This utility is not a calibrated sound-level meter. Grant microphone permission only when you want to test.</p>
        </div>
        <div className="flex flex-col">
          <div className="flex justify-end gap-2 mb-3" role="group" aria-label="Visualizer mode">
            <button type="button" aria-pressed={vizMode === 'waveform'} onClick={() => setVizMode('waveform')} title="Waveform" className="p-3 rounded bg-zinc-900 text-primary-400"><Activity size={18}/></button>
            <button type="button" aria-pressed={vizMode === 'frequency'} onClick={() => setVizMode('frequency')} title="Frequency spectrum" className="p-3 rounded bg-zinc-900 text-primary-400"><Waves size={18}/></button>
          </div>
          <div className="relative bg-black border border-zinc-800 rounded-xl flex-1 min-h-[300px] overflow-hidden p-3">
            <canvas ref={canvasRef} className="w-full h-full min-h-[260px]" aria-label="Live microphone waveform or frequency spectrum" role="img"/>
            {!isRecording && !audioURL && <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none text-zinc-600">
              <Volume2 size={48}/><p className="font-mono text-xs mt-4">AWAITING_MICROPHONE</p>
            </div>}
          </div>
        </div>
      </div>
    </div>
  );
}
