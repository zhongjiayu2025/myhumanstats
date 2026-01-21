
"use client";

import React, { useState, useEffect } from 'react';

const TypingTitle = ({ text }: { text: string }) => {
  const [display, setDisplay] = useState('');
  
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplay(text.substring(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, 50); 
    return () => clearInterval(interval);
  }, [text]);

  return (
    <span className="relative inline-block">
      <span className="opacity-0 select-none pointer-events-none" aria-hidden="true">{text}_</span>
      <span className="absolute top-0 left-0">
        {display}<span className="animate-pulse text-primary-500">_</span>
      </span>
    </span>
  );
};

export default TypingTitle;
