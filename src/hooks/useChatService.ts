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
  error: string | null;
}

export const useChatService = (): ChatServiceResult => {
  const { settings, isGeminiConfigured, isLlamaConfigured } = useSettings();
  const ollama = useOllama();
  const gemini = useGemini();
  const llama = useLlamaApi();

  const isGeminiAvailable = gemini.status.isConnected && isGeminiConfigured();
  const isOllamaAvailable = ollama.status.isConnected;
  const isLlamaAvailable = llama.status.isConnected && isLlamaConfigured();

  // Create an array of available providers for UI feedback
  const availableProviders = [
    isGeminiAvailable && 'gemini',
    isOllamaAvailable && 'ollama', 
    isLlamaAvailable && 'llama'
  ].filter(Boolean) as string[];

  // Get configuration status for debugging
  const getConfigurationStatus = () => {
    return {
      gemini: {
        configured: isGeminiConfigured(),
        connected: gemini.status.isConnected,
        error: gemini.status.error
      },
      ollama: {
        configured: true, // Ollama doesn't need API key configuration
        connected: ollama.status.isConnected,
        error: ollama.status.error
      },
      llama: {
        configured: isLlamaConfigured(),
        connected: llama.status.isConnected,
        error: llama.status.error
      }
    };
  };

  // Determine which provider to use based on settings and availability
  const getProvider = () => {
    const configStatus = getConfigurationStatus();
    console.log('ChatService: Configuration status:', configStatus);
    console.log('ChatService: Preferred provider:', settings.preferredChatProvider);
    console.log('ChatService: Available providers:', availableProviders);

    // First try the preferred provider if it's available
    if (settings.preferredChatProvider === 'gemini' && isGeminiAvailable) {
      console.log('ChatService: Using preferred provider - Gemini');
      return 'gemini';
    }
    
    if (settings.preferredChatProvider === 'llama' && isLlamaAvailable) {
      console.log('ChatService: Using preferred provider - Llama');
      return 'llama';
    }
    
    if (settings.preferredChatProvider === 'ollama' && isOllamaAvailable) {
      console.log('ChatService: Using preferred provider - Ollama');
      return 'ollama';
    }
    
    // Auto fallback in order of preference: Gemini, Ollama, Llama
    if (isGeminiAvailable) {
      console.log('ChatService: Fallback to Gemini');
      return 'gemini';
    }
    if (isOllamaAvailable) {
      console.log('ChatService: Fallback to Ollama');
      return 'ollama';
    }
    if (isLlamaAvailable) {
      console.log('ChatService: Fallback to Llama');
      return 'llama';
    }
    
    // No provider available
    console.warn('ChatService: No AI providers available');
    return null;
  };

  const activeProvider = getProvider();
  const isConnected = activeProvider !== null;

  // Get the current error if no providers are available
  const getError = () => {
    if (isConnected) return null;

    const errors = [];
    if (!isGeminiConfigured()) {
      errors.push('Gemini: API key not configured or invalid');
    } else if (!gemini.status.isConnected) {
      errors.push(`Gemini: ${gemini.status.error || 'Connection failed'}`);
    }

    if (!ollama.status.isConnected) {
      errors.push(`Ollama: ${ollama.status.error || 'Not running locally'}`);
    }

    if (!isLlamaConfigured()) {
      errors.push('Llama: API key not configured or invalid');
    } else if (!llama.status.isConnected) {
      errors.push(`Llama: ${llama.status.error || 'Connection failed'}`);
    }

    return errors.length > 0 ? errors.join('; ') : 'No AI services configured';
  };

  const sendMessage = useCallback(async (message: string): Promise<string> => {
    if (!isConnected) {
      const errorMessage = getError();
      console.error('ChatService: No AI services available:', errorMessage);
      throw new Error(`No AI services are configured. ${errorMessage}`);
    }

    console.log(`ChatService: Sending message via ${activeProvider}`);

    if (activeProvider === 'gemini') {
      try {
        const response = await gemini.sendMessage(message);
        console.log('ChatService: Gemini response received successfully');
        return response;
      } catch (error) {
        console.error('ChatService: Gemini error:', error);
        // Try fallback providers
        if (isOllamaAvailable) {
          console.log('ChatService: Falling back to Ollama');
          return await ollama.sendMessage(message);
        } else if (isLlamaAvailable) {
          console.log('ChatService: Falling back to Llama');
          return await llama.sendMessage(message);
        }
        throw new Error(`Gemini error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else if (activeProvider === 'ollama') {
      try {
        const response = await ollama.sendMessage(message);
        console.log('ChatService: Ollama response received successfully');
        return response;
      } catch (error) {
        console.error('ChatService: Ollama error:', error);
        // Try fallback providers
        if (isGeminiAvailable) {
          console.log('ChatService: Falling back to Gemini');
          return await gemini.sendMessage(message);
        } else if (isLlamaAvailable) {
          console.log('ChatService: Falling back to Llama');
          return await llama.sendMessage(message);
        }
        throw new Error(`Ollama error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else if (activeProvider === 'llama') {
      try {
        const response = await llama.sendMessage(message);
        console.log('ChatService: Llama response received successfully');
        return response;
      } catch (error) {
        console.error('ChatService: Llama error:', error);
        // Try fallback providers
        if (isGeminiAvailable) {
          console.log('ChatService: Falling back to Gemini');
          return await gemini.sendMessage(message);
        } else if (isOllamaAvailable) {
          console.log('ChatService: Falling back to Ollama');
          return await ollama.sendMessage(message);
        }
        throw new Error(`Llama error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    throw new Error('No AI service is connected');
  }, [activeProvider, gemini, ollama, llama, isGeminiAvailable, isOllamaAvailable, isLlamaAvailable, isConnected]);

  const testConnection = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    if (!isConnected) {
      const errorMessage = getError();
      return { success: false, message: `No AI services available. ${errorMessage}` };
    }

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
  }, [activeProvider, gemini, ollama, llama, isGeminiAvailable, isOllamaAvailable, isLlamaAvailable, isConnected]);

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
      return 'No AI service configured';
    }
  };

  return {
    isConnected,
    isLoading: ollama.isLoading,
    sendMessage,
    providerName: getProviderName(),
    testConnection,
    availableProviders,
    error: getError(),
  };
}; 