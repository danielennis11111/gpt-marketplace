import { useState, useCallback } from 'react';
import {
  getPrimaryModel,
  generateLlamaResponse,
  generateGeminiResponse,
  generateOllamaResponse,
  ApiResponse
} from '../lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface UseChatReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    const primaryModel = getPrimaryModel();
    if (!primaryModel) {
      setError('No model selected. Please select a model in settings.');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Add user message
    const userMessage: Message = { role: 'user', content };
    setMessages(prev => [...prev, userMessage]);

    try {
      let response: ApiResponse;

      // Generate response based on selected model type
      switch (primaryModel.type) {
        case 'llama':
          response = await generateLlamaResponse(content, primaryModel.model);
          break;
        case 'gemini':
          response = await generateGeminiResponse(content);
          break;
        case 'ollama':
          response = await generateOllamaResponse(content, primaryModel.model);
          break;
        default:
          throw new Error('Unsupported model type');
      }

      if (!response.success) {
        throw new Error(response.message || 'Failed to generate response');
      }

      // Add assistant message
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data?.choices?.[0]?.message?.content || 
                response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
                response.data?.response ||
                'No response generated'
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages
  };
} 