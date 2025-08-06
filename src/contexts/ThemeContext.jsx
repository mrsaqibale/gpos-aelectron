import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

// Theme definitions with primary color mappings
export const themes = {
  default: {
    background: '#003C58',
    logo: '#176B87',
    logo_border: '#0D445E',
    keypad: '#176b87',
    keypad_end: '#00bcd4',
    keypadBorder: '#1976d2',
    buttonHover: '#06A9C2',
    loginBg: '#005A9C',
    // Primary color mapping for dashboard
    primary: '#032d81',
    primaryLight: '#20407f',
    primaryExtraLight: '#20407f1b',
  },
  blue: {
    background: '#00428C',
    logo: '#004687',
    logo_border: '#0C4789',
    keypad: '#00428c',
    keypad_end: '#4f8cff',
    keypadBorder: '#34A0A4',
    buttonHover: '#3B79E2',
    loginBg: '#34A0A4',
    // Primary color mapping for dashboard
    primary: '#00428C',
    primaryLight: '#4f8cff',
    primaryExtraLight: '#4f8cff1b',
  },
  green: {
    background: '#25A18E',
    logo: '#34A0A4',
    logo_border: '#2FA391',
    keypad: '#25a18e',
    keypad_end: '#86efac',
    keypadBorder: '#2d5a87',
    buttonHover: '#6AD9A4',
    loginBg: '#2d5a87',
    // Primary color mapping for dashboard
    primary: '#25A18E',
    primaryLight: '#34A0A4',
    primaryExtraLight: '#34A0A41b',
  },
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('default');
  const [themeColors, setThemeColors] = useState(themes.default);

  // Load saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('posTheme');
    if (savedTheme && themes[savedTheme]) {
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