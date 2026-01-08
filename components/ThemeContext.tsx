// components/ThemeContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

interface ThemeContextType {
  selectedThemes: Set<string>;
  toggleTheme: (theme: string, categoryItems: string[]) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [selectedThemes, setSelectedThemes] = useState<Set<string>>(new Set());

  const toggleTheme = (theme: string, categoryItems: string[]) => {
    setSelectedThemes(prev => {
      const newThemes = new Set(prev);
      
      if (theme.startsWith('All ')) {
        const allSelected = categoryItems.every(item => 
          item === theme || newThemes.has(item)
        );
        
        if (allSelected) {
          categoryItems.forEach(item => newThemes.delete(item));
        } else {
          categoryItems.forEach(item => newThemes.add(item));
        }
      } else {
        if (newThemes.has(theme)) {
          newThemes.delete(theme);
        } else {
          newThemes.add(theme);
        }
      }
      
      return newThemes;
    });
  };

  return (
    <ThemeContext.Provider value={{ selectedThemes, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}