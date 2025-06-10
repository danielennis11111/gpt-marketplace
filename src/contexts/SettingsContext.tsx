import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { secureStore, secureRetrieve } from '../utils/secureStorage';

export interface UserSettings {
  preferredChatProvider: 'ollama' | 'gemini' | 'llama';
  ollamaModel: string;
  geminiApiKey: string;
  llamaApiKey: string;
  theme: 'light' | 'dark';
  notificationsEnabled: boolean;
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
  ollamaModel: '',
  geminiApiKey: '',
  llamaApiKey: '',
  theme: 'light',
  notificationsEnabled: true,
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

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('userSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        
        // Handle migration from old format with llama4scout
        if (parsedSettings.preferredChatProvider === 'llama4scout') {
          parsedSettings.preferredChatProvider = 'ollama';
        }
        
        // Load the securely stored API keys if available
        const secureGeminiApiKey = secureRetrieve('gemini_api_key');
        if (secureGeminiApiKey) {
          parsedSettings.geminiApiKey = secureGeminiApiKey;
        }

        const secureLlamaApiKey = secureRetrieve('llama_api_key');
        if (secureLlamaApiKey) {
          parsedSettings.llamaApiKey = secureLlamaApiKey;
        }
        
        setSettings({ ...defaultSettings, ...parsedSettings });
      } else {
        // Check if we have securely stored API keys even if no settings are saved
        const secureGeminiApiKey = secureRetrieve('gemini_api_key');
        const secureLlamaApiKey = secureRetrieve('llama_api_key');
        
        if (secureGeminiApiKey || secureLlamaApiKey) {
          const newSettings = { ...defaultSettings };
          if (secureGeminiApiKey) {
            newSettings.geminiApiKey = secureGeminiApiKey;
          }
          if (secureLlamaApiKey) {
            newSettings.llamaApiKey = secureLlamaApiKey;
          }
          setSettings(newSettings);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      // Create a copy of settings without the API keys for regular localStorage
      const settingsForStorage = { ...settings };
      
      // Store the API keys securely
      if (settings.geminiApiKey) {
        secureStore('gemini_api_key', settings.geminiApiKey);
        // Remove the API key from the regular settings storage
        settingsForStorage.geminiApiKey = '';
      }
      
      if (settings.llamaApiKey) {
        secureStore('llama_api_key', settings.llamaApiKey);
        // Remove the API key from the regular settings storage
        settingsForStorage.llamaApiKey = '';
      }
      
      localStorage.setItem('userSettings', JSON.stringify(settingsForStorage));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('userSettings');
    secureStore('gemini_api_key', ''); // Clear the securely stored Gemini API key
    secureStore('llama_api_key', ''); // Clear the securely stored Llama API key
  };

  const isGeminiConfigured = () => {
    return settings.geminiApiKey.trim().length > 0;
  };

  const isLlamaConfigured = () => {
    return settings.llamaApiKey.trim().length > 0;
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