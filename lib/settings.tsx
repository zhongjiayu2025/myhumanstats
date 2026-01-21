
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SettingsContextType {
  reducedMotion: boolean;
  setReducedMotion: (v: boolean) => void;
  highContrast: boolean;
  setHighContrast: (v: boolean) => void;
  showScanlines: boolean;
  setShowScanlines: (v: boolean) => void;
  mounted: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  
  // Default values for SSR (Server Side Rendering)
  const [reducedMotion, setReducedMotionState] = useState(false);
  const [highContrast, setHighContrastState] = useState(false);
  const [showScanlines, setShowScanlinesState] = useState(true);

  // Initialize from LocalStorage only on client side
  useEffect(() => {
    setReducedMotionState(localStorage.getItem('mhs_reduced_motion') === 'true');
    setHighContrastState(localStorage.getItem('mhs_high_contrast') === 'true');
    const scanlines = localStorage.getItem('mhs_scanlines');
    setShowScanlinesState(scanlines === null ? true : scanlines === 'true');
    setMounted(true);
  }, []);

  // Wrappers to update state and localStorage
  const setReducedMotion = (v: boolean) => {
    setReducedMotionState(v);
    localStorage.setItem('mhs_reduced_motion', String(v));
  };

  const setHighContrast = (v: boolean) => {
    setHighContrastState(v);
    localStorage.setItem('mhs_high_contrast', String(v));
  };

  const setShowScanlines = (v: boolean) => {
    setShowScanlinesState(v);
    localStorage.setItem('mhs_scanlines', String(v));
  };

  return (
    <SettingsContext.Provider value={{
      reducedMotion, setReducedMotion,
      highContrast, setHighContrast,
      showScanlines, setShowScanlines,
      mounted
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettings must be used within a SettingsProvider");
  return context;
};
