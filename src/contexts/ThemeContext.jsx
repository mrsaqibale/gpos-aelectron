import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

// Theme definitions with primary color mappings
export const themes = {
  default: {
    background: '#003C58',
    logo: '#003C58',
    logo_border: '#002a3f',
    keypad: '#003C58',
    keypad_end: '#005a9c',
    keypadBorder: '#005a9c',
    buttonHover: '#005a9c',
    loginBg: '#005a9c',
    // Primary color mapping for dashboard
    primary: '#003C58',
    primaryLight: '#005a9c',
    primaryExtraLight: '#005a9c1b',
  },
  blue: {
    background: '#032D81',
    logo: '#032D81',
    logo_border: '#022a6b',
    keypad: '#032D81',
    keypad_end: '#4f8cff',
    keypadBorder: '#4f8cff',
    buttonHover: '#4f8cff',
    loginBg: '#4f8cff',
    // Primary color mapping for dashboard
    primary: '#032D81',
    primaryLight: '#4f8cff',
    primaryExtraLight: '#4f8cff1b',
  },
  green: {
    background: '#136F63',
    logo: '#136F63',
    logo_border: '#0f5a4f',
    keypad: '#136F63',
    keypad_end: '#1a8a7a',
    keypadBorder: '#1a8a7a',
    buttonHover: '#1a8a7a',
    loginBg: '#1a8a7a',
    // Primary color mapping for dashboard
    primary: '#136F63',
    primaryLight: '#1a8a7a',
    primaryExtraLight: '#1a8a7a1b',
  },
};

export const ThemeProvider = ({ children }) => {
  // Initialize with saved theme or default immediately to prevent flickering
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('posTheme');
    return savedTheme && themes[savedTheme] ? savedTheme : 'default';
  };
  
  const [currentTheme, setCurrentTheme] = useState(getInitialTheme);
  const [themeColors, setThemeColors] = useState(themes[getInitialTheme()]);

  // Load saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('posTheme');
    if (savedTheme && themes[savedTheme] && savedTheme !== currentTheme) {
      setCurrentTheme(savedTheme);
      setThemeColors(themes[savedTheme]);
    }
  }, []);

  // Update CSS custom properties when theme changes
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', themeColors.primary);
    root.style.setProperty('--color-primaryLight', themeColors.primaryLight);
    root.style.setProperty('--color-primaryExtraLight', themeColors.primaryExtraLight);
  }, [themeColors]);

  // Set initial CSS custom properties immediately
  useEffect(() => {
    const root = document.documentElement;
    const initialTheme = themes[getInitialTheme()];
    root.style.setProperty('--color-primary', initialTheme.primary);
    root.style.setProperty('--color-primaryLight', initialTheme.primaryLight);
    root.style.setProperty('--color-primaryExtraLight', initialTheme.primaryExtraLight);
  }, []);

  const changeTheme = (themeKey) => {
    if (themes[themeKey]) {
      setCurrentTheme(themeKey);
      setThemeColors(themes[themeKey]);
      localStorage.setItem('posTheme', themeKey);
      
      // Dispatch custom event for components that can't use context
      window.dispatchEvent(new CustomEvent('themeChanged', { detail: themeKey }));
    }
  };

  const value = {
    currentTheme,
    themeColors,
    changeTheme,
    themes,
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