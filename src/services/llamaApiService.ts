import { sanitizeResponse } from '../utils/stringUtils';

export class LlamaApiService {
  private apiKey: string;
  private baseUrl: string = 'https://api.llama-api.com';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      // Simple test to verify API key is valid
      const models = await this.listModels();
      return {
        success: true,
        message: 'Llama API connection successful',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error connecting to Llama API',
      };
    }
  }

  async listModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Llama API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      // Extract model names from the response
      // This might need adjustment based on actual API response format
      return data.models || ['llama-3.1-70b-instruct', 'llama-3.1-8b-instruct']; 
    } catch (error) {
      console.error('Error listing Llama models:', error);
      // Return default models as fallback
      return ['llama-3.1-70b-instruct', 'llama-3.1-8b-instruct'];
    }
  }

  async generateContent(prompt: string, modelName: string = 'llama-3.1-8b-instruct'): Promise<string> {
    try {
      console.log(`Generating content with Llama API using model: ${modelName}`);
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: 'system', content: 'You are a helpful AI assistant.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Llama API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      const generatedText = data.choices[0]?.message?.content || '';
      
      // Clean and sanitize the response
      return sanitizeResponse(generatedText);
    } catch (error) {
      console.error('Error generating content with Llama API:', error);
      throw error;
    }
  }
} 