import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface JellyModeContextType {
  jellyMode: boolean;
  toggleJellyMode: () => void;
}

const JellyModeContext = createContext<JellyModeContextType | undefined>(undefined);

export function JellyModeProvider({ children }: { children: ReactNode }) {
  const [jellyMode, setJellyMode] = useState(false);

  const toggleJellyMode = useCallback(() => {
    setJellyMode((prev) => !prev);
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
    throw new Error('useJellyMode must be used within a JellyModeProvider');
  }
  return context;
}
