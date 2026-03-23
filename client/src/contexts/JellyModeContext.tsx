import React, { createContext, useContext, useState, useCallback } from "react";

interface JellyModeContextType {
  jellyOn: boolean;
  toggleJelly: () => void;
}

const JellyModeContext = createContext<JellyModeContextType | undefined>(undefined);

export function JellyModeProvider({ children }: { children: React.ReactNode }) {
  const [jellyOn, setJellyOn] = useState(false);

  const toggleJelly = useCallback(() => {
    setJellyOn((prev) => !prev);
  }, []);

  return (
    <JellyModeContext.Provider value={{ jellyOn, toggleJelly }}>
      {children}
    </JellyModeContext.Provider>
  );
}

export function useJellyMode() {
  const context = useContext(JellyModeContext);
  if (!context) {
    throw new Error("useJellyMode must be used within JellyModeProvider");
  }
  return context;
}
