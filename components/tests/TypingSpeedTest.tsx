import React, { useState, useEffect, useRef } from 'react';
import { Keyboard, RotateCcw, Terminal } from 'lucide-react';
import { saveStat } from '../../lib/core';

const WORDS = [
  "system", "data", "human", "interface", "neural", "network", "protocol", "access",
  "bandwidth", "latency", "cipher", "matrix", "algorithm", "binary", "quantum",
  "logic", "visual", "audio", "cognitive", "status", "online", "buffer", "cache",
  "daemon", "encrypt", "firewall", "grid", "hacker", "input", "kernel", "linux",
  "module", "node", "output", "pixel", "query", "root", "server", "token", "user",
  "vector", "widget", "xenon", "yield", "zero", "abort", "block", "click", "drive"
];

const generateText = (count: number) => {
  const selection = [];
  for(let i=0; i<count; i++) {
    selection.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
  }
  return selection.join(' ');
};

const TypingSpeedTest: React.FC = () => {
  const [phase, setPhase] = useState<'idle' | 'typing' | 'result'>('idle');
  const [text, setText] = useState('');
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [timer, setTimer] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const timerInterval = useRef<number | null>(null);

  useEffect(() => {
    setText(generateText(20)); // Generate 20 words batch
  }, []);

  useEffect(() => {
    if (phase === 'typing') {
      timerInterval.current = window.setInterval