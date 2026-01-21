
"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Trophy, X, ArrowRight } from 'lucide-react';

const ToastContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState<{ score: string; user: string } | null>(null);

  useEffect(() => {
    // Guard clause for when searchParams hasn't loaded yet
    if (!searchParams) return;

    const score = searchParams.get('score');
    const user = searchParams.get('challenger') || 'A friend';
    
    // Only show if there is a score and we haven't dismissed it this session
    const hasSeen = sessionStorage.getItem('mhs_challenge_dismissed');

    if (score && !hasSeen) {
      setData({ score, user });
      // Small delay for dramatic effect
      setTimeout(() => setVisible(true), 1000);
    }
  }, [searchParams]);

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem('mhs_challenge_dismissed', 'true');
    // Optionally clear params from URL to clean it up
    // router.replace(window.location.pathname);
  };

  if (!visible || !data) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-10 fade-in duration-500">
      <div className="bg-black/90 border border-primary-500/50 p-1 rounded-xl shadow-[0_0_30px_rgba(6,182,212,0.3)] backdrop-blur-md max-w-sm">
        <div className="bg-zinc-900/50 rounded-lg p-4 relative overflow-hidden">
           {/* Shining effect */}
           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
           
           <button 
             onClick={dismiss}
             className="absolute top-2 right-2 text-zinc-500 hover:text-white transition-colors"
           >
             <X size={14} />
           </button>

           <div className="flex items-start gap-4 pr-6">
              <div className="bg-primary-900/30 p-3 rounded-full border border-primary-500/30 text-primary-400">
                 <Trophy size={20} />
              </div>
              <div>
                 <h4 className="text-sm font-bold text-white mb-1">New Challenger!</h4>
                 <p className="text-xs text-zinc-400 leading-relaxed mb-2">
                    {data.user} scored <strong className="text-primary-400 font-mono text-sm">{data.score}</strong>.
                    <br/>Can you beat their record?
                 </p>
                 <button 
                    onClick={dismiss}
                    className="text-[10px] bg-primary-600 hover:bg-primary-500 text-black font-bold px-3 py-1.5 rounded flex items-center gap-1 transition-colors"
                 >
                    ACCEPT CHALLENGE <ArrowRight size={10} />
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

// Wrap in Suspense because useSearchParams causes client-side de-opt
export default function SocialChallengeToast() {
  return (
    <Suspense fallback={null}>
      <ToastContent />
    </Suspense>
  );
}
