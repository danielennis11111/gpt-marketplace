import { useCallback } from 'react';
import { useOllama } from './useOllama';
import { useGemini } from './useGemini';
import { useSettings } from '../contexts/SettingsContext';

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
  const gemini = useGemini();

  const isGeminiAvailable = gemini.status.isConnected;
  const shouldUseGemini = settings.preferredChatProvider === 'gemini' && isGeminiAvailable;

  const sendMessage = useCallback(async (message: string): Promise<string> => {
    if (shouldUseGemini) {
      try {
        return await gemini.sendMessage(message);
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
  }, [shouldUseGemini, gemini, ollama]);

  const testConnection = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    if (shouldUseGemini) {
      try {
        if (gemini.status.isConnected) {
          await gemini.sendMessage('Test message');
          return { success: true, message: `Gemini ${gemini.status.currentModel} connection successful` };
        } else {
          return { success: false, message: gemini.status.error || 'Gemini is not connected' };
        }
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
          const modelName = ollama.status.currentModel || 'Default';
          return { success: true, message: `Ollama (${modelName}) connection successful` };
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
  }, [shouldUseGemini, gemini, ollama]);

  // Determine provider name
  const getProviderName = () => {
    if (shouldUseGemini) {
      return `Gemini ${gemini.status.currentModel || ''}`;
    } else {
      if (ollama.status.currentModel) {
        return `Ollama (${ollama.status.currentModel})`;
      } else {
        return 'Ollama';
      }
    }
  };

  return {
    isConnected: shouldUseGemini ? isGeminiAvailable : ollama.status.isConnected,
    isLoading: ollama.isLoading,
    sendMessage,
    providerName: getProviderName(),
    testConnection,
  };
}; 