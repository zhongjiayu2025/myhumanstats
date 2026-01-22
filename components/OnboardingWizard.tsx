
"use client";

import React, { useState, useEffect } from 'react';
import { Shield, Headphones, Monitor, ArrowRight, CheckCircle2, Terminal, Power, RefreshCcw } from 'lucide-react';
import { playUiSound, unlockAudio } from '@/lib/sounds';

const OnboardingWizard = () => {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // 1. Auto-trigger on first visit
    const hasVisited = localStorage.getItem('mhs_onboarded');
    if (!hasVisited) {
        setTimeout(() => setVisible(true), 500);
    }

    // 2. Listen for manual trigger (Replay)
    const handleReplay = () => {
        setStep(0);
        setIsExiting(false);
        setVisible(true);
    };
    window.addEventListener('mhs-replay-onboarding', handleReplay);
    return () => window.removeEventListener('mhs-replay-onboarding', handleReplay);
  }, []);

  const handleStart = () => {
      // Critical: Unlock AudioContext on first user interaction
      unlockAudio(); 
      playUiSound('click');
      setStep(s => s + 1);
  };

  const handleNext = () => {
      playUiSound('click');
      setStep(s => s + 1);
  };

  const handleFinish = () => {
      playUiSound('success');
      localStorage.setItem('mhs_onboarded', 'true');
      setIsExiting(true);
      setTimeout(() => setVisible(false), 800);
  };

  const testAudio = () => {
      playUiSound('success');
  };

  if (!visible) return null;

  return (
    <div className={`fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-xl transition-opacity duration-700 ${isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        
        {/* Background Grid Animation */}
        <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black pointer-events-none"></div>

        <div className="relative z-10 max-w-lg w-full p-8 border border-zinc-800 bg-zinc-900/80 rounded-2xl shadow-2xl clip-corner-lg">
            
            {/* Step 0: Welcome */}
            {step === 0 && (
                <div className="animate-in fade-in zoom-in duration-500 text-center">
                    <div className="w-20 h-20 bg-black border border-zinc-700 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                        <Power size={32} className="text-white animate-pulse" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-4">Initialize Profile?</h1>
                    <p className="text-zinc-400 text-sm leading-relaxed mb-8">
                        Welcome to <strong>MyHumanStats</strong>. 
                        <br/>We are about to quantify your biological hardware.
                    </p>
                    <button onClick={handleStart} className="btn-primary w-full flex items-center justify-center gap-2">
                        Start Calibration <ArrowRight size={16} />
                    </button>
                </div>
            )}

            {/* Step 1: Privacy (Trust) */}
            {step === 1 && (
                <div className="animate-in slide-in-from-right duration-300 text-left">
                    <div className="flex items-center gap-3 mb-6 text-emerald-500">
                        <Shield size={32} />
                        <span className="font-mono text-sm uppercase tracking-widest">Protocol: Local-First</span>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-4">Your Data is Yours.</h2>
                    <div className="bg-black/50 p-4 rounded border border-zinc-700 mb-8 text-sm text-zinc-300 space-y-3">
                        <p>Unlike other platforms, we operate on a <strong>Serverless Architecture</strong>.</p>
                        <ul className="space-y-2">
                            <li className="flex gap-2"><CheckCircle2 size={16} className="text-emerald-500 mt-0.5"/> <span>Results are stored in <strong>Local Storage</strong>.</span></li>
                            <li className="flex gap-2"><CheckCircle2 size={16} className="text-emerald-500 mt-0.5"/> <span>No data is sent to the cloud.</span></li>
                            <li className="flex gap-2"><CheckCircle2 size={16} className="text-emerald-500 mt-0.5"/> <span>Total privacy and anonymity.</span></li>
                        </ul>
                    </div>
                    <button onClick={handleNext} className="btn-secondary w-full">
                        Acknowledge
                    </button>
                </div>
            )}

            {/* Step 2: Hardware Setup */}
            {step === 2 && (
                <div className="animate-in slide-in-from-right duration-300 text-left">
                    <div className="flex items-center gap-3 mb-6 text-primary-500">
                        <Terminal size={32} />
                        <span className="font-mono text-sm uppercase tracking-widest">Environment Check</span>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-6">Optimizing Sensors</h2>
                    
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div 
                            onClick={testAudio}
                            className="p-4 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 hover:border-primary-500 cursor-pointer transition-all rounded flex flex-col items-center text-center group"
                        >
                            <Headphones size={24} className="text-zinc-300 group-hover:text-white mb-2 transition-colors" />
                            <span className="text-xs font-bold text-white">Audio Check</span>
                            <span className="text-[10px] text-zinc-500 group-hover:text-primary-400">Click to test sound</span>
                        </div>
                        <div className="p-4 bg-zinc-800/50 border border-zinc-700 rounded flex flex-col items-center text-center opacity-80 cursor-default">
                            <Monitor size={24} className="text-zinc-300 mb-2" />
                            <span className="text-xs font-bold text-white">Display</span>
                            <span className="text-[10px] text-zinc-500">Max brightness advised</span>
                        </div>
                    </div>

                    <button onClick={handleFinish} className="btn-primary w-full">
                        Enter Dashboard
                    </button>
                </div>
            )}

            {/* Progress Dots */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {[0, 1, 2].map(i => (
                    <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${step === i ? 'bg-white' : 'bg-zinc-700'}`}></div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default OnboardingWizard;
