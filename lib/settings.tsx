
import React, { createContext, useContext, useState, useEffect } from 'react';

interface SettingsContextType {
  reducedMotion: boolean;
  setReducedMotion: (v: boolean) => void;
  highContrast: boolean;
  setHighContrast: (v: boolean) => void;
  showScanlines: boolean;
  setShowScanlines: (v: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize from localStorage or defaults
  const [reducedMotion, setReducedMotion] = useState(() => {
    return localStorage.getItem('mhs_reduced_motion') === 'true';
  });
  
  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem('mhs_high_contrast') === 'true';
  });

  const [showScanlines, setShowScanlines] = useState(() => {
    const stored = localStorage.getItem('mhs_scanlines');
    return stored === null ? true : stored === 'true';
  });

  // Persist changes
  useEffect(() => { localStorage.setItem('mhs_reduced_motion', String(reducedMotion)); }, [reducedMotion]);
  useEffect(() => { localStorage.setItem('mhs_high_contrast', String(highContrast)); }, [highContrast]);
  useEffect(() => { localStorage.setItem('mhs_scanlines', String(showScanlines)); }, [showScanlines]);

  return (
    <SettingsContext.Provider value={{
      reducedMotion, setReducedMotion,
      highContrast, setHighContrast,
      showScanlines, setShowScanlines
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
