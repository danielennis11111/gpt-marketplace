import React, { useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { LlamaApiService } from '../services/llamaApiService';

// Create a singleton instance
const llamaApiService = new LlamaApiService('');

/**
 * LlamaInitializer - Component to initialize Llama API service
 * 
 * This component initializes the llamaApiService with the API key from settings.
 * It should be rendered once at the app level.
 */
const LlamaInitializer: React.FC = () => {
  const { settings } = useSettings();

  useEffect(() => {
    // Initialize llama service with API key from settings
    if (settings.llamaApiKey) {
      // Create a new instance with the API key
      const service = new LlamaApiService(settings.llamaApiKey);
      // Test the connection
      service.testConnection().then(result => {
        if (result.success) {
          console.log('Llama API service initialized successfully');
        } else {
          console.error('Failed to initialize Llama API service:', result.message);
        }
      });
    } else {
      console.log('No Llama API key found in settings');
    }
  }, [settings.llamaApiKey]);

  // This component doesn't render anything visible
  return null;
};

export default LlamaInitializer; 