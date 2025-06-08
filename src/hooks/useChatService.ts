import { useCallback } from 'react';
import { useOllama } from './useOllama';
import { useSettings } from '../contexts/SettingsContext';
import { GeminiService } from '../services/geminiService';

export interface ChatServiceResult {
  isConnected: boolean;
  isLoading: boolean;
  sendMessage: (message: string) => Promise<string>;
  providerName: string;
  testConnection: () => Promise<{ success: boolean; message: string }>;
}

export const useChatService = (): ChatServiceResult => {
  const { settings } = useSettings();
  const ollama = useOllama();

  const isGeminiAvailable = settings.geminiApiKey.trim().length > 0;
  const shouldUseGemini = settings.preferredChatProvider === 'gemini' && isGeminiAvailable;
  const shouldUseLlama4Scout = settings.preferredChatProvider === 'llama4scout';

  const sendMessage = useCallback(async (message: string): Promise<string> => {
    if (shouldUseGemini) {
      try {
        const geminiService = new GeminiService(settings.geminiApiKey);
        return await geminiService.generateContent(message);
      } catch (error) {
        console.error('Gemini error, falling back to Ollama:', error);
        if (ollama.status.isConnected) {
          return await ollama.sendMessage(message);
        }
        throw new Error('Neither Gemini nor Ollama is available');
      }
    } else if (shouldUseLlama4Scout) {
      if (ollama.status.isConnected) {
        return await ollama.sendMessageToLlama4Scout(message);
      }
      throw new Error('Ollama is not connected for Llama 4 Scout');
    } else {
      if (ollama.status.isConnected) {
        return await ollama.sendMessage(message);
      }
      throw new Error('Ollama is not connected');
    }
  }, [shouldUseGemini, shouldUseLlama4Scout, settings.geminiApiKey, ollama]);

  const testConnection = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    if (shouldUseGemini) {
      try {
        const geminiService = new GeminiService(settings.geminiApiKey);
        return await geminiService.testConnection();
      } catch (error) {
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Gemini connection failed'
        };
      }
    } else if (shouldUseLlama4Scout) {
      try {
        if (ollama.status.isConnected) {
          await ollama.sendMessageToLlama4Scout('Test message');
          return { success: true, message: 'Llama 4 Scout connection successful' };
        } else {
          return { success: false, message: 'Ollama is not connected for Llama 4 Scout' };
        }
      } catch (error) {
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Llama 4 Scout connection failed'
        };
      }
    } else {
      try {
        if (ollama.status.isConnected) {
          await ollama.sendMessage('Test message');
          return { success: true, message: 'Ollama connection successful' };
        } else {
          return { success: false, message: 'Ollama is not connected' };
        }
      } catch (error) {
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Ollama connection failed'
        };
      }
    }
  }, [shouldUseGemini, shouldUseLlama4Scout, settings.geminiApiKey, ollama]);

  return {
    isConnected: shouldUseGemini ? isGeminiAvailable : ollama.status.isConnected,
    isLoading: ollama.isLoading,
    sendMessage,
    providerName: shouldUseGemini ? 'Gemini 2.0 Flash' : 
                shouldUseLlama4Scout ? 
                  (ollama.status.models.find(m => m.name === 'llama4scout') ? 'Llama 4 Scout' : 
                   ollama.status.models.find(m => m.name === 'llama3.3:8b') ? 'Llama 3.3 8B' : 
                   ollama.status.models.find(m => m.name === 'gemma3:4b') ? 'Gemma 3 4B' : 'Ollama') : 
                'Ollama',
    testConnection,
  };
}; 