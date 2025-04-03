import { useState, useEffect } from 'react';
import { UserSettings } from '@/types';

// Default settings
const defaultSettings: UserSettings = {
  highContrastMode: false,
  largerTextMode: false,
  defaultRadius: 19, // Default search radius in miles
  defaultView: 'map', // Default view type (map or list)
};

// Local storage key
const SETTINGS_STORAGE_KEY = 'towGoSettings';

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage on initial mount
  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings) as UserSettings;
        setSettings(parsedSettings);
      }
    } catch (error) {
      console.error('Failed to load settings from localStorage:', error);
      // Fall back to default settings
      setSettings(defaultSettings);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      } catch (error) {
        console.error('Failed to save settings to localStorage:', error);
      }
    }
  }, [settings, isLoaded]);

  // Apply settings to the app (high contrast mode, larger text, etc.)
  useEffect(() => {
    if (isLoaded) {
      // Apply high contrast mode
      if (settings.highContrastMode) {
        document.documentElement.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
      }

      // Apply larger text mode
      if (settings.largerTextMode) {
        document.documentElement.classList.add('larger-text');
      } else {
        document.documentElement.classList.remove('larger-text');
      }
    }
  }, [settings, isLoaded]);

  // Update settings
  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings
    }));
  };

  // Update a single setting
  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [key]: value
    }));
  };

  // Reset settings to defaults
  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return {
    settings,
    updateSettings,
    updateSetting,
    resetSettings,
    isLoaded
  };
}