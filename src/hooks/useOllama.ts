import { useState, useEffect, useCallback } from 'react';

interface OllamaModel {
  name: string;
  size: string;
  parameter_size: string;
  quantization_level: string;
  modified_at: string;
}

interface OllamaStatus {
  isRunning: boolean;
  isConnected: boolean;
  models: OllamaModel[];
  currentModel: string | null;
  error: string | null;
}

export const useOllama = () => {
  const [status, setStatus] = useState<OllamaStatus>({
    isRunning: false,
    isConnected: false,
    models: [],
    currentModel: null,
    error: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Check if Ollama is running and connected
  const checkOllamaStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Try to connect to Ollama API
      const response = await fetch('http://localhost:11434/api/tags', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStatus({
          isRunning: true,
          isConnected: true,
          models: data.models || [],
          currentModel: data.models?.[0]?.name || null,
          error: null,
        });
      } else {
        setStatus({
          isRunning: false,
          isConnected: false,
          models: [],
          currentModel: null,
          error: 'Ollama API not responding',
        });
      }
    } catch (error) {
      setStatus({
        isRunning: false,
        isConnected: false,
        models: [],
        currentModel: null,
        error: 'Cannot connect to Ollama (not running or not installed)',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Start Ollama service
  const startOllama = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Attempt to start Ollama via system command
      // Note: This requires backend support or browser extension
      // For now, we'll provide instructions to the user
      
      // Check if it's already running after a delay
      setTimeout(async () => {
        await checkOllamaStatus();
      }, 2000);
      
      return {
        success: false,
        message: 'Please start Ollama manually by running "ollama serve" in your terminal',
      };
    } catch (error) {
      setIsLoading(false);
      return {
        success: false,
        message: 'Failed to start Ollama. Please start it manually.',
      };
    }
  }, [checkOllamaStatus]);

  // Send message to Ollama
  const sendMessage = useCallback(async (message: string, model?: string) => {
    if (!status.isConnected) {
      throw new Error('Ollama is not connected');
    }

    const modelToUse = model || status.currentModel || 'llama3.3:8b';

    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelToUse,
          prompt: message,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      throw new Error(`Failed to send message to Ollama: ${error}`);
    }
  }, [status.isConnected, status.currentModel]);

  // Pull/download a model
  const pullModel = useCallback(async (modelName: string) => {
    try {
      setIsLoading(true);
      
      const response = await fetch('http://localhost:11434/api/pull', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: modelName,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to pull model: ${response.statusText}`);
      }

      // Refresh models list after successful pull
      await checkOllamaStatus();
      
      return { success: true, message: `Model ${modelName} downloaded successfully` };
    } catch (error) {
      return { success: false, message: `Failed to download model: ${error}` };
    } finally {
      setIsLoading(false);
    }
  }, [checkOllamaStatus]);

  // Initialize on mount
  useEffect(() => {
    checkOllamaStatus();
    
    // Check status periodically
    const interval = setInterval(checkOllamaStatus, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [checkOllamaStatus]);

  return {
    status,
    isLoading,
    checkOllamaStatus,
    startOllama,
    sendMessage,
    pullModel,
  };
}; 