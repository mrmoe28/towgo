import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { UserSettings } from '@/types';

// Default settings
const defaultSettings: UserSettings = {
  highContrastMode: false,
  largerTextMode: false,
  defaultRadius: 20,
  defaultView: 'list',
};

// Create context
interface SettingsContextProps {
  settings: UserSettings;
  updateSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
  toggleHighContrast: () => void;
  toggleLargerText: () => void;
}

const SettingsContext = createContext<SettingsContextProps | undefined>(undefined);

// Provider component
export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load settings from localStorage or use defaults
  const [settings, setSettings] = useState<UserSettings>(() => {
    const savedSettings = localStorage.getItem('towGoSettings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

  // Apply settings effects whenever they change
  useEffect(() => {
    // High contrast mode
    if (settings.highContrastMode) {
      document.body.classList.add('high-contrast-mode');
    } else {
      document.body.classList.remove('high-contrast-mode');
    }

    // Larger text mode
    if (settings.largerTextMode) {
      document.documentElement.classList.add('text-lg');
    } else {
      document.documentElement.classList.remove('text-lg');
    }

    // Save settings to localStorage
    localStorage.setItem('towGoSettings', JSON.stringify(settings));
  }, [settings]);

  // Update a specific setting
  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // Toggle high contrast mode
  const toggleHighContrast = () => {
    updateSetting('highContrastMode', !settings.highContrastMode);
  };

  // Toggle larger text mode
  const toggleLargerText = () => {
    updateSetting('largerTextMode', !settings.largerTextMode);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, toggleHighContrast, toggleLargerText }}>
      {children}
    </SettingsContext.Provider>
  );
};

// Hook for using the settings context
export const useSettings = (): SettingsContextProps => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};