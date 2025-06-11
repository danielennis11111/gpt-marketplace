import { sanitizeResponse } from '../utils/stringUtils';

export interface LlamaModel {
  id: string;
  name: string;
  contextLength: number;
  description: string;
  capabilities: string[];
  version: string;
  provider: string;
}

export class LlamaApiService {
  private apiKey: string;
  private baseUrl: string = 'https://api.llama.com/v1';  // Updated base URL to match documentation

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      // First try to list models
      const models = await this.listModels();
      
      if (models.length === 0) {
        return {
          success: false,
          message: 'No models found in Llama API response',
        };
      }

      // Try to generate a simple test message
      try {
        const testPrompt = 'Hello, this is a test message. Please respond with "Connection test successful."';
        const response = await this.generateContent(testPrompt, models[0].id);
        
        if (response && response.length > 0) {
          return {
            success: true,
            message: `Llama API connection successful - found ${models.length} models and verified content generation`,
          };
        } else {
          return {
            success: false,
            message: 'Could not generate content with Llama API',
          };
        }
      } catch (genError) {
        console.error('Error testing content generation:', genError);
        return {
          success: false,
          message: `Could not generate content: ${genError instanceof Error ? genError.message : 'Unknown error'}`,
        };
      }
    } catch (error) {
      console.error('Llama API connection test failed:', error);
      
      // If we have a network error, check if it's a DNS resolution issue
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        return {
          success: false,
          message: 'Could not connect to Llama API. Please check your internet connection and API endpoint configuration.',
        };
      }
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error connecting to Llama API',
      };
    }
  }

  async listModels(): Promise<LlamaModel[]> {
    try {
      console.log('Fetching models from Llama API...');
      const response = await fetch(`${this.baseUrl}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Llama API error (${response.status}): ${errorText}`);
        
        // If we get a 404, the endpoint might be wrong
        if (response.status === 404) {
          throw new Error('Llama API endpoint not found. Please check the API configuration.');
        }
        
        throw new Error(`Llama API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Llama API models response:', data);
      
      // If we get here but have no data, use fallback models
      if (!data || !data.data || !Array.isArray(data.data)) {
        console.warn('No valid models data received from Llama API, using fallback models');
        return this.getFallbackModels();
      }
      
      // Parse the API response to extract model information
      const models: LlamaModel[] = data.data.map((model: any) => ({
        id: model.id,
        name: this.formatModelName(model.id),
        contextLength: this.getContextLength(model.id),
        description: this.getModelDescription(model.id),
        capabilities: this.getModelCapabilities(model.id),
        version: this.extractVersionFromId(model.id),
        provider: 'llama'
      }));
      
      return models;
    } catch (error) {
      console.error('Error listing Llama models:', error);
      
      // Use fallback models if the API call fails
      return this.getFallbackModels();
    }
  }

  async generateContent(prompt: string, modelName: string = 'meta/Llama-4-Scout-17B-16E-Instruct-FP8'): Promise<string> {
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

  // Helper methods
  private formatModelName(modelId: string): string {
    // Convert model ID to a more readable format
    return modelId
      .replace('meta/', '')
      .replace(/-/g, ' ')
      .replace(/Instruct/g, '')
      .replace(/FP8/g, '')
      .trim();
  }

  private getContextLength(modelId: string): number {
    if (modelId.includes('Llama-4-Scout')) return 128000;
    if (modelId.includes('Llama-4-Maverick')) return 128000;
    if (modelId.includes('llama-3')) return 8192;
    return 4096; // Default context length
  }

  private getModelDescription(modelId: string): string {
    if (modelId.includes('Llama-4-Scout')) {
      return 'Llama 4 Scout is a high-performance model optimized for speed and efficiency.';
    }
    if (modelId.includes('Llama-4-Maverick')) {
      return 'Llama 4 Maverick is a powerful model with extended context window.';
    }
    if (modelId.includes('llama-3')) {
      return 'Llama 3 is a versatile model with good performance across various tasks.';
    }
    return 'A capable language model for various tasks.';
  }

  private getModelCapabilities(modelId: string): string[] {
    const capabilities = ['text-generation', 'chat'];
    if (modelId.includes('Llama-4')) {
      capabilities.push('code-generation', 'reasoning');
    }
    return capabilities;
  }

  private extractVersionFromId(modelId: string): string {
    if (modelId.includes('Llama-4')) return '4.0';
    if (modelId.includes('llama-3.1')) return '3.1';
    if (modelId.includes('llama-3')) return '3.0';
    return '1.0';
  }

  private getFallbackModels(): LlamaModel[] {
    return [
      {
        id: 'meta/Llama-4-Scout-17B-16E-Instruct-FP8',
        name: 'Llama 4 Scout 17B 16E Instruct',
        contextLength: 128000,
        description: 'Llama 4 Scout is a high-performance model optimized for speed and efficiency.',
        capabilities: ['text-generation', 'chat', 'code-generation', 'reasoning'],
        version: '4.0',
        provider: 'llama'
      },
      {
        id: 'meta/Llama-4-Maverick-17B-128E-Instruct-FP8',
        name: 'Llama 4 Maverick 17B 128E Instruct',
        contextLength: 128000,
        description: 'Llama 4 Maverick is a powerful model with extended context window.',
        capabilities: ['text-generation', 'chat', 'code-generation', 'reasoning'],
        version: '4.0',
        provider: 'llama'
      },
      {
        id: 'meta/llama-3-8b-instruct',
        name: 'Llama 3 8B Instruct',
        contextLength: 8192,
        description: 'Llama 3 is a versatile model with good performance across various tasks.',
        capabilities: ['text-generation', 'chat'],
        version: '3.0',
        provider: 'llama'
      },
      {
        id: 'meta/llama-3-70b-instruct',
        name: 'Llama 3 70B Instruct',
        contextLength: 8192,
        description: 'Llama 3 is a versatile model with good performance across various tasks.',
        capabilities: ['text-generation', 'chat'],
        version: '3.0',
        provider: 'llama'
      },
      {
        id: 'meta/llama-3.1-8b-instruct',
        name: 'Llama 3.1 8B Instruct',
        contextLength: 8192,
        description: 'Llama 3.1 is an improved version of Llama 3 with better performance.',
        capabilities: ['text-generation', 'chat'],
        version: '3.1',
        provider: 'llama'
      },
      {
        id: 'meta/llama-3.1-70b-instruct',
        name: 'Llama 3.1 70B Instruct',
        contextLength: 8192,
        description: 'Llama 3.1 is an improved version of Llama 3 with better performance.',
        capabilities: ['text-generation', 'chat'],
        version: '3.1',
        provider: 'llama'
      }
    ];
  }
} 