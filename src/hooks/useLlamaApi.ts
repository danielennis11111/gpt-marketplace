import { useState, useCallback, useEffect } from 'react';
import { LlamaApiService } from '../services/llamaApiService';
import { useSettings } from '../contexts/SettingsContext';

export interface LlamaApiStatus {
  isConnected: boolean;
  error: string | null;
  models: string[];
  currentModel: string;
}

export const useLlamaApi = () => {
  const { settings, updateSettings } = useSettings();
  const [llamaService, setLlamaService] = useState<LlamaApiService | null>(null);
  const [status, setStatus] = useState<LlamaApiStatus>({
    isConnected: false,
    error: null,
    models: [],
    currentModel: 'llama-3.1-8b-instruct',
  });

  // Initialize Llama API service when API key changes
  useEffect(() => {
    if (settings.llamaApiKey) {
      const service = new LlamaApiService(settings.llamaApiKey);
      setLlamaService(service);
      
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
              currentModel: models[0] || 'llama-3.1-8b-instruct',
            });
          } else {
            setStatus({
              isConnected: false,
              error: result.message,
              models: [],
              currentModel: 'llama-3.1-8b-instruct',
            });
          }
        } catch (error) {
          setStatus({
            isConnected: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            models: [],
            currentModel: 'llama-3.1-8b-instruct',
          });
        }
      };
      
      testConnection();
    } else {
      setLlamaService(null);
      setStatus({
        isConnected: false,
        error: 'Llama API key not configured',
        models: [],
        currentModel: 'llama-3.1-8b-instruct',
      });
    }
  }, [settings.llamaApiKey]);

  // Function to send a message to Llama API
  const sendMessage = useCallback(async (message: string, model?: string) => {
    if (!llamaService) {
      throw new Error('Llama API service is not initialized');
    }

    if (!status.isConnected) {
      throw new Error('Llama API is not connected');
    }

    try {
      const modelToUse = model || status.currentModel;
      console.log(`Sending message to Llama API using model: ${modelToUse}`);
      return await llamaService.generateContent(message, modelToUse);
    } catch (error) {
      console.error('Error sending message to Llama API:', error);
      throw error;
    }
  }, [llamaService, status.isConnected, status.currentModel]);
  
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
    setCurrentModel
  };
}; 