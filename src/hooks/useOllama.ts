import { useState, useEffect, useCallback } from 'react';
import { useSettings } from '../contexts/SettingsContext';

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
  const { settings, updateSettings } = useSettings();
  const [status, setStatus] = useState<OllamaStatus>({
    isRunning: false,
    isConnected: false,
    models: [],
    currentModel: settings.ollamaModel || null,
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
        // Sort models by name for better display
        const sortedModels = [...(data.models || [])].sort((a, b) => a.name.localeCompare(b.name));
        
        // Special case for llama4scout - if user had it selected before but now it's missing
        const wasUsingLlama4Scout = settings.ollamaModel === 'llama4scout';
        const hasLlama4Scout = sortedModels.some(model => model.name === 'llama4scout');
        
        if (wasUsingLlama4Scout && !hasLlama4Scout) {
          console.log('llama4scout model was previously selected but is no longer available');
        }
        
        // Use the model from settings if it exists and is available
        let modelToUse = settings.ollamaModel;
        const modelExists = sortedModels.some(model => model.name === modelToUse);
        
        if (!modelExists || !modelToUse) {
          // Try to find the best available model in order of preference
          const preferredModels = [
            'llama4:16x17b', 'devstral:24b',  // High-performance models first
            'llama3.3:8b', 'gemma3:4b', 'llama3', 'gemma3', 'mistral', 'llama2'
          ];
          for (const modelName of preferredModels) {
            const found = sortedModels.find(model => model.name.includes(modelName));
            if (found) {
              modelToUse = found.name;
              break;
            }
          }
          
          // If no preferred model is found, use the first one
          if (!modelToUse && sortedModels.length > 0) {
            modelToUse = sortedModels[0].name;
          }
          
          // Update settings with the selected model
          if (modelToUse) {
            updateSettings({ ollamaModel: modelToUse });
          }
        }
        
        setStatus({
          isRunning: true,
          isConnected: true,
          models: sortedModels,
          currentModel: modelToUse,
          error: null,
        });
      } else {
        setStatus({
          isRunning: false,
          isConnected: false,
          models: [],
          currentModel: null,
          error: 'Ollama server is not responding. Please start it with "ollama serve"',
        });
      }
    } catch (error) {
      setStatus({
        isRunning: false,
        isConnected: false,
        models: [],
        currentModel: null,
        error: error instanceof Error ? error.message : 'Unknown error connecting to Ollama',
      });
    } finally {
      setIsLoading(false);
    }
  }, [settings.ollamaModel, updateSettings]);

  // Start Ollama service
  const startOllama = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // First check if Ollama is already running
      try {
        const testResponse = await fetch('http://localhost:11434/api/tags', { 
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          // Set a short timeout since we're just checking
          signal: AbortSignal.timeout(1000)
        });
        
        if (testResponse.ok) {
          // Ollama is already running, refresh status
          await checkOllamaStatus();
          return {
            success: true,
            message: 'Ollama is already running',
          };
        }
      } catch (e) {
        // Expected if Ollama is not running
        console.log('Ollama not detected, will attempt to start it');
      }
      
      // Use OS detection to try different approaches
      const osName = typeof navigator !== 'undefined' ? navigator.platform.toLowerCase() : '';
      
      if (osName.includes('mac')) {
        // Try to open Terminal with the command on macOS
        if (typeof window !== 'undefined') {
          window.open('terminal:ollama serve');
          // Also open Terminal app as fallback
          window.open('file:///Applications/Utilities/Terminal.app');
        }
      } else if (osName.includes('win')) {
        // Try Windows command prompt
        if (typeof window !== 'undefined') {
          window.open('cmd:ollama serve');
        }
      }
      
      // Check if it started after a delay
      setTimeout(async () => {
        await checkOllamaStatus();
      }, 5000);
      
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

  // Set current model
  const setCurrentModel = useCallback((modelName: string) => {
    if (status.models.some(model => model.name === modelName)) {
      updateSettings({ ollamaModel: modelName });
      setStatus(prev => ({
        ...prev,
        currentModel: modelName
      }));
      return true;
    }
    return false;
  }, [status.models, updateSettings]);

  // Send message to Ollama
  const sendMessage = useCallback(async (message: string, model?: string) => {
    if (!status.isConnected) {
      console.error('Ollama is not connected');
      throw new Error('Ollama is not connected');
    }

    const modelToUse = model || status.currentModel || 'llama3.3:8b';

    try {
      console.log(`Sending message to Ollama using model: ${modelToUse}`);
      
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelToUse,
          prompt: message,
        }),
      });

      if (!response.ok) {
        let errorText = '';
        try {
          const errorData = await response.text();
          errorText = errorData;
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
        }
        throw new Error(`Ollama API error: ${response.statusText} (${errorText || 'No error details'})`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error sending message to Ollama:', error);
      throw new Error(`Failed to send message to Ollama: ${error}`);
    }
  }, [status.isConnected, status.currentModel]);

  // Send message with streaming
  const sendMessageStream = useCallback(async function* (
    message: string, 
    model?: string,
    onUpdate?: (chunk: string) => void
  ): AsyncGenerator<string, string, unknown> {
    if (!status.isConnected) {
      console.error('Ollama is not connected');
      throw new Error('Ollama is not connected');
    }

    const modelToUse = model || status.currentModel || 'llama3.3:8b';
    let fullResponse = '';

    try {
      console.log(`Streaming message from Ollama using model: ${modelToUse}`);
      
      const requestBody = {
        model: modelToUse,
        prompt: message,
        stream: true,
      };
      
      console.log('Sending Ollama streaming request with body:', JSON.stringify(requestBody));
      
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Ollama streaming response status:', response.status, response.statusText);
      
      if (!response.ok) {
        let errorText = '';
        try {
          const errorData = await response.text();
          errorText = errorData;
          console.error('Ollama API error response:', errorData);
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
        }
        throw new Error(`Ollama API error: ${response.statusText} (${errorText || 'No error details'})`);
      }

      if (!response.body) {
        console.error('ReadableStream not supported in this browser.');
        throw new Error('ReadableStream not supported in this browser.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let chunkCounter = 0;

      try {
        console.log('Starting to read Ollama stream...');
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log('Ollama stream reading complete');
            break;
          }
          
          const chunk = decoder.decode(value, { stream: true });
          console.log(`Received raw chunk #${++chunkCounter}:`, chunk.substring(0, 100) + (chunk.length > 100 ? '...' : ''));
          
          // Ollama sends JSON objects with a "response" field
          const lines = chunk.split('\n').filter(line => line.trim());
          console.log(`Chunk contains ${lines.length} lines`);
          
          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              console.log('Parsed Ollama data:', JSON.stringify(data).substring(0, 100) + '...');
              
              if (data.response) {
                const responseChunk = data.response;
                fullResponse += responseChunk;
                console.log('Extracted response text:', responseChunk || '(empty response)');
                
                // Yield each chunk
                yield responseChunk;
                
                // If done is true, we've reached the end
                if (data.done === true) {
                  console.log('Received done=true from Ollama, ending stream');
                  break;
                }
              } else {
                console.warn('No response field in Ollama data chunk:', data);
              }
            } catch (e) {
              console.warn('Error parsing JSON in Ollama stream:', e, 'Line:', line);
            }
          }
        }
      } finally {
        reader.releaseLock();
        console.log('Ollama reader released');
      }
      
      console.log('Ollama streaming complete, full response length:', fullResponse.length);
      return fullResponse;
    } catch (error) {
      console.error('Error streaming from Ollama:', error);
      throw new Error(`Failed to stream from Ollama: ${error}`);
    }
  }, [status.isConnected, status.currentModel]);

  // Check if streaming is supported
  const isStreamingSupported = useCallback(() => {
    return true; // Ollama always supports streaming
  }, []);

  // Send message specifically to Llama 4 Scout
  const sendMessageToLlama4Scout = useCallback(async (message: string) => {
    if (!status.isConnected) {
      console.error('Ollama is not connected');
      throw new Error('Ollama is not connected');
    }

    // Define the model names we can use (in order of preference)
    const modelOptions = [
      'llama4:16x17b', 'devstral:24b',  // High-performance models first
      'llama3.3:8b', 'gemma3:4b', 'llama3', 'gemma3', 'mistral', 'llama2'
    ];
    
    // Check if any of our preferred models are available
    const availableModel = status.models.find(model => 
      modelOptions.some(option => model.name.includes(option))
    )?.name || status.currentModel; // Fallback to current model
    
    try {
      console.log(`Using model: ${availableModel} for advanced request`);
      
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: availableModel,
          prompt: message,
          stream: false,
        }),
      });
      
      if (!response.ok) {
        let errorText = '';
        try {
          const errorData = await response.text();
          errorText = errorData;
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
        }
        throw new Error(`Ollama API error: ${response.statusText} (${errorText || 'No error details'})`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error sending message to Llama 4 Scout:', error);
      throw new Error(`Failed to send message using available model: ${error}`);
    }
  }, [status.isConnected, status.models, status.currentModel]);

  // Pull/download a model
  const pullModel = useCallback(async (modelName: string, onProgress?: (progress: number) => void) => {
    try {
      setIsLoading(true);
      console.log(`Attempting to pull model: ${modelName}`);
      
      // If we're in a browser environment, we have to guide the user
      if (typeof window !== 'undefined') {
        // Just return instructions without showing an error
        return { 
          success: false, 
          needsManualPull: true,
          message: `To install the ${modelName} model, please run this command in your terminal:\n\nollama pull ${modelName}` 
        };
      }
      
      // This would only execute in a Node.js environment
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
        console.error(`Failed to pull model: ${response.statusText}`);
        // Don't store failed download information
        return { success: false, message: `Failed to pull model. Please try again manually.` };
      }

      // Refresh models list after successful pull
      await checkOllamaStatus();
      
      return { success: true, message: `Model ${modelName} downloaded successfully` };
    } catch (error) {
      console.error(`Error pulling model: ${error}`);
      // Don't store failed download information
      return { success: false, message: `Failed to download model. Please try again manually.` };
    } finally {
      setIsLoading(false);
    }
  }, [checkOllamaStatus]);
  
  // Specialized function to pull llama4scout
  const pullLlama4Scout = useCallback(async (onProgress?: (progress: number) => void) => {
    return pullModel('llama4scout', onProgress);
  }, [pullModel]);
  
  // Check if a specific model exists
  const checkModelExists = useCallback((modelName: string) => {
    return status.models.some(model => model.name === modelName);
  }, [status.models]);
  
  // Helper function to suggest reinstalling llama4scout
  const suggestReinstallLlama4Scout = useCallback(() => {
    const hasLlama4Scout = checkModelExists('llama4scout');
    return !hasLlama4Scout && settings.ollamaModel === 'llama4scout';
  }, [checkModelExists, settings.ollamaModel]);

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
    sendMessageStream,
    isStreamingSupported,
    sendMessageToLlama4Scout,
    pullModel,
    pullLlama4Scout,
    setCurrentModel,
    checkModelExists,
    suggestReinstallLlama4Scout
  };
}; 