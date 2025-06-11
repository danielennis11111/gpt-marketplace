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
  const { settings, updateSettings } = useSettings();
  const [geminiService, setGeminiService] = useState<GeminiService | null>(null);
  const [status, setStatus] = useState<GeminiStatus>({
    isConnected: false,
    error: null,
    models: [],
    currentModel: 'gemini-2.0-flash',
  });

  // Initialize Gemini service when API key changes
  useEffect(() => {
    console.log('Gemini hook: Checking API key...', {
      hasApiKey: !!settings.geminiApiKey,
      keyLength: settings.geminiApiKey?.length || 0
    });

    if (settings.geminiApiKey) {
      console.log('Gemini hook: Initializing service with API key');
      const service = new GeminiService(settings.geminiApiKey);
      setGeminiService(service);
      
      // Test connection and fetch available models
      const testConnection = async () => {
        try {
          console.log('Gemini hook: Testing connection...');
          const result = await service.testConnection();
          console.log('Gemini hook: Connection test result:', result);
          
          if (result.success) {
            console.log('Gemini hook: Fetching available models...');
            const models = await service.listModels();
            console.log('Gemini hook: Available models:', models);
            
            setStatus({
              isConnected: true,
              error: null,
              models,
              currentModel: models[0] || 'gemini-2.0-flash',
            });
          } else {
            console.error('Gemini hook: Connection test failed:', result.message);
            setStatus({
              isConnected: false,
              error: result.message,
              models: [],
              currentModel: 'gemini-2.0-flash',
            });
          }
        } catch (error) {
          console.error('Gemini hook: Error during initialization:', error);
          setStatus({
            isConnected: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            models: [],
            currentModel: 'gemini-2.0-flash',
          });
        }
      };
      
      testConnection();
    } else {
      console.log('Gemini hook: No API key available');
      setGeminiService(null);
      setStatus({
        isConnected: false,
        error: 'Gemini API key not configured',
        models: [],
        currentModel: 'gemini-2.0-flash',
      });
    }
  }, [settings.geminiApiKey]);

  // Function to send a message to Gemini
  const sendMessage = useCallback(async (message: string, model?: string) => {
    if (!geminiService) {
      console.error('Gemini hook: Service not initialized');
      throw new Error('Gemini service is not initialized');
    }

    if (!status.isConnected) {
      console.error('Gemini hook: Not connected');
      throw new Error('Gemini is not connected');
    }

    try {
      const modelToUse = model || status.currentModel;
      console.log(`Gemini hook: Sending message using model: ${modelToUse}`);
      return await geminiService.generateContent(message, modelToUse);
    } catch (error) {
      console.error('Gemini hook: Error sending message:', error);
      throw error;
    }
  }, [geminiService, status.isConnected, status.currentModel]);
  
  // Function to send a streaming message to Gemini
  const sendMessageStream = useCallback(async function* (message: string, model?: string): AsyncGenerator<string, void, unknown> {
    if (!geminiService) {
      console.error('Gemini hook: Service not initialized');
      throw new Error('Gemini service is not initialized');
    }

    if (!status.isConnected) {
      console.error('Gemini hook: Not connected');
      throw new Error('Gemini is not connected');
    }

    try {
      const modelToUse = model || status.currentModel;
      console.log(`Gemini hook: Sending streaming message using model: ${modelToUse}`);
      
      const stream = geminiService.generateContentStream(message, modelToUse);
      for await (const chunk of stream) {
        yield chunk;
      }
    } catch (error) {
      console.error('Gemini hook: Error sending streaming message:', error);
      throw error;
    }
  }, [geminiService, status.isConnected, status.currentModel]);

  // Check if streaming is supported
  const isStreamingSupported = useCallback(() => {
    return geminiService ? geminiService.isStreamingSupported() : false;
  }, [geminiService]);
  
  // Set current model
  const setCurrentModel = useCallback((modelName: string) => {
    if (status.models.includes(modelName)) {
      setStatus(prev => ({
        ...prev,
        currentModel: modelName
      }));
      return true;
    }
    return false;
  }, [status.models]);

  return {
    status,
    sendMessage,
    sendMessageStream,
    isStreamingSupported,
    setCurrentModel
  };
}; 