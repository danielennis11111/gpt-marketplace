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
    currentModel: 'meta/Llama-4-Scout-17B-16E-Instruct-FP8', // Set default to Llama 4 Scout
  });

  // Initialize Llama API service when API key changes
  useEffect(() => {
    if (settings.llamaApiKey) {
      console.log('Initializing Llama API service with API key');
      const service = new LlamaApiService(settings.llamaApiKey);
      setLlamaService(service);
      
      // Test connection and fetch available models
      const testConnection = async () => {
        try {
          const result = await service.testConnection();
          if (result.success) {
            console.log('Llama API connection test successful');
            const models = await service.listModels();
            console.log('Llama API models:', models);
            
            // Get model IDs for the dropdown
            const modelIds = models.map(model => model.id);
            
            // Ensure we prioritize the Llama 4 models
            const defaultModel = modelIds.find(id => id.includes('Llama-4-Scout')) || 
                               modelIds.find(id => id.includes('Llama-4-Maverick')) || 
                               modelIds[0] || 
                               'meta/Llama-4-Scout-17B-16E-Instruct-FP8';
            
            setStatus({
              isConnected: true,
              error: null,
              models: modelIds,
              currentModel: defaultModel,
            });
          } else {
            console.error('Llama API connection test failed:', result.message);
            setStatus({
              isConnected: false,
              error: result.message,
              models: [],
              currentModel: 'meta/Llama-4-Scout-17B-16E-Instruct-FP8',
            });
          }
        } catch (error) {
          console.error('Error testing Llama API connection:', error);
          setStatus({
            isConnected: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            models: [],
            currentModel: 'meta/Llama-4-Scout-17B-16E-Instruct-FP8',
          });
        }
      };
      
      testConnection();
    } else {
      console.log('No Llama API key configured');
      setLlamaService(null);
      setStatus({
        isConnected: false,
        error: 'Llama API key not configured',
        models: [],
        currentModel: 'meta/Llama-4-Scout-17B-16E-Instruct-FP8',
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
    if (status.models.includes(modelName) || 
        modelName === 'meta/Llama-4-Scout-17B-16E-Instruct-FP8' || 
        modelName === 'meta/Llama-4-Maverick-17B-128E-Instruct-FP8') {
      console.log(`Setting current Llama model to: ${modelName}`);
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