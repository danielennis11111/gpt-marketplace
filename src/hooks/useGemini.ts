import { useState, useCallback, useEffect } from 'react';
import { GeminiService } from '../services/geminiService';
import { useSettings } from '../contexts/SettingsContext';

export interface GeminiStatus {
  isConnected: boolean;
  error: string | null;
  models: string[];
  currentModel: string;
}

export const useGemini = () => {
  const { settings } = useSettings();
  const [geminiService, setGeminiService] = useState<GeminiService | null>(null);
  const [status, setStatus] = useState<GeminiStatus>({
    isConnected: false,
    error: null,
    models: [],
    currentModel: 'gemini-2.0-flash-exp',
  });

  // Initialize Gemini service when API key changes
  useEffect(() => {
    if (settings.geminiApiKey) {
      const service = new GeminiService(settings.geminiApiKey);
      setGeminiService(service);
      
      // Test connection and fetch available models
      const testConnection = async () => {
        try {
          const result = await service.testConnection();
          if (result.success) {
            const models = await service.listModels();
            setStatus({
              isConnected: true,
              error: null,
              models,
              currentModel: models[0] || 'gemini-2.0-flash-exp',
            });
          } else {
            setStatus({
              isConnected: false,
              error: result.message,
              models: [],
              currentModel: 'gemini-2.0-flash-exp',
            });
          }
        } catch (error) {
          setStatus({
            isConnected: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            models: [],
            currentModel: 'gemini-2.0-flash-exp',
          });
        }
      };
      
      testConnection();
    } else {
      setGeminiService(null);
      setStatus({
        isConnected: false,
        error: 'Gemini API key not configured',
        models: [],
        currentModel: 'gemini-2.0-flash-exp',
      });
    }
  }, [settings.geminiApiKey]);

  // Function to send a message to Gemini
  const sendMessage = useCallback(async (message: string, model?: string) => {
    if (!geminiService) {
      throw new Error('Gemini service is not initialized');
    }

    if (!status.isConnected) {
      throw new Error('Gemini is not connected');
    }

    try {
      console.log(`Sending message to Gemini using model: ${model || status.currentModel}`);
      return await geminiService.generateContent(message, model || status.currentModel);
    } catch (error) {
      console.error('Error sending message to Gemini:', error);
      throw error;
    }
  }, [geminiService, status.isConnected, status.currentModel]);

  return {
    status,
    sendMessage,
  };
}; 