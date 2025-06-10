import { useCallback } from 'react';
import { useOllama } from './useOllama';
import { useGemini } from './useGemini';
import { useLlamaApi } from './useLlamaApi';
import { useSettings } from '../contexts/SettingsContext';

export interface ChatServiceResult {
  isConnected: boolean;
  isLoading: boolean;
  sendMessage: (message: string) => Promise<string>;
  providerName: string;
  testConnection: () => Promise<{ success: boolean; message: string }>;
  availableProviders: string[];
}

export const useChatService = (): ChatServiceResult => {
  const { settings } = useSettings();
  const ollama = useOllama();
  const gemini = useGemini();
  const llama = useLlamaApi();

  const isGeminiAvailable = gemini.status.isConnected;
  const isOllamaAvailable = ollama.status.isConnected;
  const isLlamaAvailable = llama.status.isConnected;

  // Create an array of available providers for UI feedback
  const availableProviders = [
    isGeminiAvailable && 'gemini',
    isOllamaAvailable && 'ollama',
    isLlamaAvailable && 'llama'
  ].filter(Boolean) as string[];

  // Determine which provider to use based on settings and availability
  const getProvider = () => {
    if (settings.preferredChatProvider === 'gemini' && isGeminiAvailable) {
      return 'gemini';
    }
    
    if (settings.preferredChatProvider === 'llama' && isLlamaAvailable) {
      return 'llama';
    }
    
    if (settings.preferredChatProvider === 'ollama' && isOllamaAvailable) {
      return 'ollama';
    }
    
    // Auto fallback in order of preference: Gemini, Ollama, Llama
    if (isGeminiAvailable) return 'gemini';
    if (isOllamaAvailable) return 'ollama';
    if (isLlamaAvailable) return 'llama';
    
    // No provider available
    return null;
  };

  const activeProvider = getProvider();
  const isConnected = activeProvider !== null;

  const sendMessage = useCallback(async (message: string): Promise<string> => {
    if (activeProvider === 'gemini') {
      try {
        return await gemini.sendMessage(message);
      } catch (error) {
        console.error('Gemini error, attempting fallback:', error);
        if (isOllamaAvailable) {
          return await ollama.sendMessage(message);
        } else if (isLlamaAvailable) {
          return await llama.sendMessage(message);
        }
        throw new Error('No available AI service');
      }
    } else if (activeProvider === 'ollama') {
      try {
        return await ollama.sendMessage(message);
      } catch (error) {
        console.error('Ollama error, attempting fallback:', error);
        if (isGeminiAvailable) {
          return await gemini.sendMessage(message);
        } else if (isLlamaAvailable) {
          return await llama.sendMessage(message);
        }
        throw new Error('No available AI service');
      }
    } else if (activeProvider === 'llama') {
      try {
        return await llama.sendMessage(message);
      } catch (error) {
        console.error('Llama API error, attempting fallback:', error);
        if (isGeminiAvailable) {
          return await gemini.sendMessage(message);
        } else if (isOllamaAvailable) {
          return await ollama.sendMessage(message);
        }
        throw new Error('No available AI service');
      }
    }
    
    throw new Error('No AI service is connected');
  }, [activeProvider, gemini, ollama, llama, isGeminiAvailable, isOllamaAvailable, isLlamaAvailable]);

  const testConnection = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    if (activeProvider === 'gemini') {
      try {
        if (isGeminiAvailable) {
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
    } else if (activeProvider === 'ollama') {
      try {
        if (isOllamaAvailable) {
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
    } else if (activeProvider === 'llama') {
      try {
        if (isLlamaAvailable) {
          await llama.sendMessage('Test message');
          return { success: true, message: `Llama API (${llama.status.currentModel}) connection successful` };
        } else {
          return { success: false, message: llama.status.error || 'Llama API is not connected' };
        }
      } catch (error) {
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Llama API connection failed'
        };
      }
    }
    
    return { success: false, message: 'No AI service is available' };
  }, [activeProvider, gemini, ollama, llama, isGeminiAvailable, isOllamaAvailable, isLlamaAvailable]);

  // Determine provider name
  const getProviderName = () => {
    if (activeProvider === 'gemini') {
      return `Gemini ${gemini.status.currentModel || ''}`;
    } else if (activeProvider === 'ollama') {
      if (ollama.status.currentModel) {
        return `Ollama (${ollama.status.currentModel})`;
      } else {
        return 'Ollama';
      }
    } else if (activeProvider === 'llama') {
      return `Llama API (${llama.status.currentModel || ''})`;
    } else {
      return 'Disconnected';
    }
  };

  return {
    isConnected,
    isLoading: ollama.isLoading,
    sendMessage,
    providerName: getProviderName(),
    testConnection,
    availableProviders,
  };
}; 