
import React from 'react';

const RadarSkeleton = () => {
  return (
    <div className="w-full h-full flex items-center justify-center relative bg-surface/50">
      <svg viewBox="0 0 400 400" className="w-full h-full text-zinc-800" style={{ maxWidth: '100%', maxHeight: '100%' }}>
        {/* Center Point */}
        <circle cx="200" cy="200" r="2" fill="currentColor" />
        
        {/* Concentric Grid Lines (assuming 4 axes for square/diamond shape or generic circles) */}
        <path d="M 200 60 L 340 200 L 200 340 L 60 200 Z" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M 200 95 L 305 200 L 200 305 L 95 200 Z" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M 200 130 L 270 200 L 200 270 L 130 200 Z" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M 200 165 L 235 200 L 200 235 L 165 200 Z" fill="none" stroke="currentColor" strokeWidth="1" />

        {/* Axes */}
        <line x1="200" y1="60" x2="200" y2="340" stroke="currentColor" strokeWidth="1" />
        <line x1="60" y1="200" x2="340" y2="200" stroke="currentColor" strokeWidth="1" />
        
        {/* Loading Text */}
        <text x="200" y="200" textAnchor="middle" dy="5" fill="#52525b" fontSize="10" fontFamily="monospace" letterSpacing="0.1em">
          LOADING_MODULE
        </text>
      </svg>
      
      {/* Scanline Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-500/5 to-transparent h-[20%] animate-scan pointer-events-none"></div>
    </div>
  );
};

export default RadarSkeleton;
