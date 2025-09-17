import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { updateButtonSoundSettings, initializeButtonSoundHandler, cleanupButtonSoundHandler } from '../utils/buttonSoundHandler';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const hasLoadedRef = useRef(false);

  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await window.settingsAPI?.get();
      if (result?.success) {
        const newSettings = result.data || null;
        setSettings(newSettings);
        // Update button sound handler with new settings
        updateButtonSoundSettings(newSettings);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
      hasLoadedRef.current = true;
    }
  }, []);

  // Initial load once when provider mounts
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const value = {
    settings,
    isLoading,
    hasLoaded: hasLoadedRef.current,
    reloadSettings: loadSettings,
  };

  // Expose a minimal global to allow imperative reloads from places like login/settings page
  useEffect(() => {
    window.appSettings = {
      reloadSettings: loadSettings,
      get current() {
        return settings;
      },
    };
  }, [loadSettings, settings]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return ctx;
};


