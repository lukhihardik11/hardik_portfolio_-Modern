/**
 * JellyModeContext — Manages the "Jelly Mode" toggle state.
 *
 * Behavioral contract:
 * - Default: ON (jelly is the signature feature — new visitors see it first).
 * - ON: Enhanced jelly-like spring physics on all interactive elements,
 *   translucent glassmorphism surfaces, wobbly hover effects, bouncy transitions.
 * - DOM: adds/removes "jelly-mode" class on document.documentElement.
 * - Flash prevention: index.html inline script applies stored jelly state before React mounts.
 * - Persists user preference in localStorage with try/catch for private browsing.
 * - No WebGPU dependency. Uses CSS spring animations — works on ALL devices.
 */
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface JellyModeContextType {
  jellyMode: boolean;
  toggleJellyMode: () => void;
}

const JellyModeContext = createContext<JellyModeContextType | undefined>(undefined);

const JELLY_MODE_KEY = 'jelly-mode';

export function JellyModeProvider({ children }: { children: React.ReactNode }) {
  const [jellyMode, setJellyMode] = useState(() => {
    try {
      const stored = localStorage.getItem(JELLY_MODE_KEY);
      // Default to ON for new visitors — jelly is the signature feature
      if (stored === null) return true;
      return stored === 'true';
    } catch {
      return true;
    }
  });

  // Update html class and persist
  useEffect(() => {
    if (jellyMode) {
      document.documentElement.classList.add('jelly-mode');
    } else {
      document.documentElement.classList.remove('jelly-mode');
    }
    try {
      localStorage.setItem(JELLY_MODE_KEY, String(jellyMode));
    } catch {
      // ignore
    }
  }, [jellyMode]);

  const toggleJellyMode = useCallback(() => {
    setJellyMode(prev => !prev);
  }, []);

  return (
    <JellyModeContext.Provider value={{ jellyMode, toggleJellyMode }}>
      {children}
    </JellyModeContext.Provider>
  );
}

export function useJellyMode() {
  const context = useContext(JellyModeContext);
  if (!context) {
    throw new Error('useJellyMode must be used within JellyModeProvider');
  }
  return context;
}
