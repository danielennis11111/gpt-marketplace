import React, { useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { geminiService } from '../utils/rate-limiter/geminiService';

/**
 * GeminiInitializer - Component to initialize Gemini API service
 * 
 * This component initializes the geminiService with the API key from settings.
 * It should be rendered once at the app level.
 */
const GeminiInitializer: React.FC = () => {
  const { settings } = useSettings();

  useEffect(() => {
    // Initialize gemini service with API key from settings
    if (settings.geminiApiKey) {
      geminiService.setApiKey(settings.geminiApiKey);
      console.log('Gemini service initialized with API key');
    } else {
      console.log('No Gemini API key found in settings');
    }
  }, [settings.geminiApiKey]);

  // This component doesn't render anything visible
  return null;
};

export default GeminiInitializer; 