/**
 * GeminiService - Adapter for Google Gemini integration
 * 
 * This service provides methods to interact with Google Gemini models
 * and is designed to be compatible with the rate-limiter components.
 */

import { useSettings } from '../../contexts/SettingsContext';

// The model ID for Gemini 2.0 Flash
const GEMINI_MODEL_ID = 'gemini-2.0-flash';

class GeminiService {
  private apiKey: string = '';
  private isReady: boolean = false;
  
  /**
   * Set the API key from settings
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    this.isReady = !!apiKey && apiKey.trim() !== '';
  }
  
  /**
   * Check if the service is ready to use (has API key)
   */
  isConnected(): boolean {
    return this.isReady;
  }
  
  /**
   * Generate a chat completion using Gemini API
   */
  async generateChatCompletion(
    messages: Array<{ role: string; content: string }>,
    modelName: string = GEMINI_MODEL_ID,
    options: any = {}
  ): Promise<{ text: string; usage: any }> {
    if (!this.isReady) {
      throw new Error('Gemini API key not set');
    }
    
    try {
      // Map roles to Gemini format
      const geminiMessages = messages.map(msg => {
        // Gemini uses 'user' and 'model' roles instead of 'user' and 'assistant'
        const role = msg.role === 'assistant' ? 'model' : msg.role;
        return {
          role: role === 'system' ? 'user' : role, // Gemini doesn't have system role, so use user
          parts: [{ text: msg.content }]
        };
      });
      
      // Prepare the request
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL_ID}:generateContent`;
      const requestUrl = `${apiUrl}?key=${this.apiKey}`;
      const requestBody = {
        contents: geminiMessages,
        generationConfig: {
          temperature: options.temperature || 0.7,
          topK: options.topK || 40,
          topP: options.topP || 0.95,
          maxOutputTokens: options.max_tokens || 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      };
      
      // Make the API call
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`);
      }
      
      const data = await response.json();
      
      // Extract the text from the response
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Estimate token usage (Gemini doesn't return this directly)
      const promptText = messages.map(m => m.content).join(' ');
      const estimatedPromptTokens = Math.ceil(promptText.length / 4);
      const estimatedCompletionTokens = Math.ceil(textResponse.length / 4);
      
      return {
        text: textResponse,
        usage: {
          prompt_tokens: estimatedPromptTokens,
          completion_tokens: estimatedCompletionTokens,
          total_tokens: estimatedPromptTokens + estimatedCompletionTokens
        }
      };
    } catch (error) {
      console.error('Error generating Gemini completion:', error);
      throw error;
    }
  }
  
  /**
   * Get the current model name
   */
  getCurrentModel(): string {
    return GEMINI_MODEL_ID;
  }
}

// Create singleton instance
export const geminiService = new GeminiService(); 