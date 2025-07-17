import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [customTheme, setCustomTheme] = useState(null);

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('designer-theme');
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // Detect system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  // Save theme to localStorage
  useEffect(() => {
    localStorage.setItem('designer-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const applyCustomTheme = (themeConfig) => {
    setCustomTheme(themeConfig);
    setTheme('custom');
  };

  const value = {
    theme,
    customTheme,
    setTheme,
    toggleTheme,
    applyCustomTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
