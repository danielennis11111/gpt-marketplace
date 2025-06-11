import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { secureStore, secureRetrieve, secureRemove } from '../utils/secureStorage';

export interface UserSettings {
  preferredChatProvider: 'gemini' | 'llama' | 'ollama';
  geminiApiKey: string;
  llamaApiKey: string;
  theme: 'light' | 'dark';
  notifications: boolean;
}

interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  resetSettings: () => void;
  isGeminiConfigured: () => boolean;
  isLlamaConfigured: () => boolean;
}

const defaultSettings: UserSettings = {
  preferredChatProvider: 'gemini',
  geminiApiKey: '',
  llamaApiKey: '',
  theme: 'light',
  notifications: true,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

// Validate API key format
const validateGeminiApiKey = (key: string): boolean => {
  // Gemini API keys start with 'AIza' and are typically 39 characters long
  return key.startsWith('AIza') && key.length >= 35 && key.length <= 45;
};

const validateLlamaApiKey = (key: string): boolean => {
  // Basic validation for Llama API keys - adjust based on actual format
  return key.length >= 20 && /^[A-Za-z0-9_-]+$/.test(key);
};

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);

  useEffect(() => {
    console.log('SettingsContext: Loading settings from localStorage');
    const loadSettings = () => {
      try {
        const storedSettings = localStorage.getItem('userSettings');
        if (storedSettings) {
          const parsedSettings = JSON.parse(storedSettings);
          console.log('SettingsContext: Found stored settings');
          
          // Load API keys from secure storage
          const geminiKey = secureRetrieve('geminiApiKey');
          const llamaKey = secureRetrieve('llamaApiKey');
          
          console.log('SettingsContext: API keys loaded from secure storage', {
            hasGeminiKey: !!geminiKey,
            geminiKeyValid: geminiKey ? validateGeminiApiKey(geminiKey) : false,
            hasLlamaKey: !!llamaKey,
            llamaKeyValid: llamaKey ? validateLlamaApiKey(llamaKey) : false
          });

          setSettings({
            ...parsedSettings,
            geminiApiKey: geminiKey || '',
            llamaApiKey: llamaKey || '',
          });
        } else {
          console.log('SettingsContext: No stored settings found, using defaults');
        }
      } catch (error) {
        console.error('SettingsContext: Error loading settings:', error);
        // Reset to defaults if there's an error
        setSettings(defaultSettings);
      }
    };

    loadSettings();
  }, []);

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    console.log('SettingsContext: Updating settings', newSettings);
    try {
      const updatedSettings = { ...settings, ...newSettings };
      
      // Validate and store API keys in secure storage
      if (newSettings.geminiApiKey !== undefined) {
        if (newSettings.geminiApiKey && !validateGeminiApiKey(newSettings.geminiApiKey)) {
          console.warn('SettingsContext: Invalid Gemini API key format');
        }
        console.log('SettingsContext: Storing Gemini API key');
        secureStore('geminiApiKey', newSettings.geminiApiKey);
      }
      
      if (newSettings.llamaApiKey !== undefined) {
        if (newSettings.llamaApiKey && !validateLlamaApiKey(newSettings.llamaApiKey)) {
          console.warn('SettingsContext: Invalid Llama API key format');
        }
        console.log('SettingsContext: Storing Llama API key');
        secureStore('llamaApiKey', newSettings.llamaApiKey);
      }

      // Store non-sensitive settings in localStorage
      const { geminiApiKey, llamaApiKey, ...publicSettings } = updatedSettings;
      localStorage.setItem('userSettings', JSON.stringify(publicSettings));
      
      setSettings(updatedSettings);
      console.log('SettingsContext: Settings updated successfully');
    } catch (error) {
      console.error('SettingsContext: Error updating settings:', error);
    }
  };

  const resetSettings = () => {
    console.log('SettingsContext: Resetting settings');
    try {
      // Clear secure storage
      secureRemove('geminiApiKey');
      secureRemove('llamaApiKey');
      
      // Clear localStorage
      localStorage.removeItem('userSettings');
      
      setSettings(defaultSettings);
      console.log('SettingsContext: Settings reset successfully');
    } catch (error) {
      console.error('SettingsContext: Error resetting settings:', error);
    }
  };

  const isGeminiConfigured = () => {
    const configured = !!settings.geminiApiKey && validateGeminiApiKey(settings.geminiApiKey);
    console.log('SettingsContext: Checking Gemini configuration:', {
      hasKey: !!settings.geminiApiKey,
      isValid: configured,
      keyLength: settings.geminiApiKey?.length || 0
    });
    return configured;
  };

  const isLlamaConfigured = () => {
    const configured = !!settings.llamaApiKey && validateLlamaApiKey(settings.llamaApiKey);
    console.log('SettingsContext: Checking Llama configuration:', {
      hasKey: !!settings.llamaApiKey,
      isValid: configured,
      keyLength: settings.llamaApiKey?.length || 0
    });
    return configured;
  };

  const value: SettingsContextType = {
    settings,
    updateSettings,
    resetSettings,
    isGeminiConfigured,
    isLlamaConfigured,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}; 