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
    } else {
      if (ollama.status.isConnected) {
        return await ollama.sendMessage(message);
      }
      throw new Error('Ollama is not connected');
    }
  }, [shouldUseGemini, settings.geminiApiKey, ollama]);

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
  }, [shouldUseGemini, settings.geminiApiKey, ollama]);

  return {
    isConnected: shouldUseGemini ? isGeminiAvailable : ollama.status.isConnected,
    isLoading: ollama.isLoading,
    sendMessage,
    providerName: shouldUseGemini ? 'Gemini' : 'Ollama',
    testConnection,
  };
}; 