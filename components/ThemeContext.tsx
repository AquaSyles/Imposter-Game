"use client";
import React, { createContext, useContext, useState } from "react";

type ThemeContextType = {
  selectedThemeId: string | null;
  setTheme: (themeId: string) => void;
  clearTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);

  const setTheme = (themeId: string) => setSelectedThemeId(themeId);
  const clearTheme = () => setSelectedThemeId(null);

  return (
    <ThemeContext.Provider value={{ selectedThemeId, setTheme, clearTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
