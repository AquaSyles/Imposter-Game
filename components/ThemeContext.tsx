"use client";

import React, { createContext, useContext, useState } from "react";

type ThemeContextType = {
  selectedThemes: Set<string>;
  toggleTheme: (themeId: string) => void;
  clearThemes: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [selectedThemes, setSelectedThemes] = useState<Set<string>>(new Set());

  const toggleTheme = (themeId: string) => {
    const next = new Set(selectedThemes);
    if (next.has(themeId)) {
      next.delete(themeId);
    } else {
      next.add(themeId);
    }
    setSelectedThemes(next);
  };

  const clearThemes = () => setSelectedThemes(new Set());

  return (
    <ThemeContext.Provider value={{ selectedThemes, toggleTheme, clearThemes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}