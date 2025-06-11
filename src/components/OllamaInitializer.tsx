import React, { useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { OllamaService } from '../services/ollamaService';

// Create a singleton instance
const ollamaService = new OllamaService();

/**
 * OllamaInitializer - Component to initialize Ollama service
 * 
 * This component initializes the ollamaService with the model from settings.
 * It should be rendered once at the app level.
 */
const OllamaInitializer: React.FC = () => {
  const { settings } = useSettings();

  useEffect(() => {
    // Test the connection to Ollama
    ollamaService.testConnection().then(result => {
      if (result.success) {
        console.log('Ollama service initialized successfully');
        if (settings.ollamaModel) {
          console.log('Using Ollama model:', settings.ollamaModel);
        } else {
          console.log('No specific Ollama model selected in settings');
        }
      } else {
        console.error('Failed to initialize Ollama service:', result.message);
      }
    });
  }, [settings.ollamaModel]);

  // This component doesn't render anything visible
  return null;
};

export default OllamaInitializer; 