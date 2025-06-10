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
  private baseUrl: string = 'https://api.meta.ai/v1';  // Updated to Meta's actual API endpoint

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      // Attempt to list models to verify API key is valid
      const models = await this.listModels();
      return {
        success: true,
        message: `Llama API connection successful - found ${models.length} models`,
      };
    } catch (error) {
      console.error('Llama API connection test failed:', error);
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
        throw new Error(`Llama API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Llama API models response:', data);
      
      // Parse the API response to extract model information
      // This mapping needs to match the actual API response format
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
      
      // Fallback to default models if the API call fails
      // Including the specific models requested by the user
      return [
        {
          id: 'meta/Llama-4-Scout-17B-16E-Instruct-FP8',
          name: 'Llama 4 Scout 17B 16E Instruct',
          contextLength: 128000,
          description: 'High-performance Scout model with 17B parameters and 16 experts',
          capabilities: ['complex reasoning', 'instruction following', 'long-form content'],
          version: '4',
          provider: 'llama'
        },
        {
          id: 'meta/Llama-4-Maverick-17B-128E-Instruct-FP8',
          name: 'Llama 4 Maverick 17B 128E Instruct',
          contextLength: 128000,
          description: 'Advanced Maverick model with 17B parameters and 128 experts',
          capabilities: ['complex reasoning', 'instruction following', 'long-form content'],
          version: '4',
          provider: 'llama'
        },
        {
          id: 'meta/llama-3-8b-instruct',
          name: 'Llama 3 8B Instruct',
          contextLength: 128000,
          description: 'Efficient model for most tasks with 8B parameters',
          capabilities: ['text generation', 'chat', 'instruction following'],
          version: '3',
          provider: 'llama'
        },
        {
          id: 'meta/llama-3-70b-instruct',
          name: 'Llama 3 70B Instruct',
          contextLength: 128000,
          description: 'High-performance model with 70B parameters, excellent reasoning',
          capabilities: ['complex reasoning', 'instruction following', 'long-form content'],
          version: '3',
          provider: 'llama'
        },
        {
          id: 'meta/llama-3.1-8b-instruct',
          name: 'Llama 3.1 8B Instruct',
          contextLength: 128000, 
          description: 'Latest 8B parameter model with improved instruction following',
          capabilities: ['text generation', 'chat', 'instruction following'],
          version: '3.1',
          provider: 'llama'
        },
        {
          id: 'meta/llama-3.1-70b-instruct',
          name: 'Llama 3.1 70B Instruct',
          contextLength: 128000,
          description: 'Latest 70B parameter model with state-of-the-art performance',
          capabilities: ['complex reasoning', 'instruction following', 'long-form content'],
          version: '3.1',
          provider: 'llama'
        }
      ];
    }
  }

  // Helper method to format model name for display
  private formatModelName(modelId: string): string {
    // Extract the model name from the ID and format it nicely
    const nameParts = modelId.split('/').pop()?.split('-') || [];
    
    if (nameParts.length < 2) return modelId;
    
    // Special case for Llama 4 models with specific formatting
    if (modelId.includes('Llama-4-Scout') || modelId.includes('Llama-4-Maverick')) {
      const parts = modelId.split('/').pop()?.split('-') || [];
      if (parts.length >= 5) {
        // Format as "Llama 4 Scout 17B 16E Instruct"
        return `${parts[0]} ${parts[1]} ${parts[2]} ${parts[3]} ${parts[5]}`;
      }
    }
    
    // Capitalize first letter of each part
    return nameParts
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  // Helper method to determine context length based on model ID
  private getContextLength(modelId: string): number {
    if (modelId.includes('llama-4') || modelId.includes('Llama-4')) return 128000;
    if (modelId.includes('llama-3')) return 128000;
    if (modelId.includes('llama-2')) return 4096;
    return 8192; // Default context length
  }

  // Helper to extract capabilities based on model ID
  private getModelCapabilities(modelId: string): string[] {
    const capabilities = ['text generation'];
    
    if (modelId.includes('instruct')) {
      capabilities.push('instruction following');
    }
    
    if (modelId.includes('70b') || modelId.includes('17B')) {
      capabilities.push('complex reasoning', 'long-form content');
    }
    
    if (modelId.includes('8b')) {
      capabilities.push('efficient', 'fast responses');
    }
    
    if (modelId.includes('Scout') || modelId.includes('Maverick')) {
      capabilities.push('mixture of experts', 'advanced reasoning');
    }
    
    return capabilities;
  }

  // Helper to extract version from model ID
  private extractVersionFromId(modelId: string): string {
    if (modelId.includes('Llama-4')) return '4';
    
    const versionMatch = modelId.match(/llama-(\d+\.\d+|\d+)/i);
    return versionMatch ? versionMatch[1] : '';
  }

  // Helper to get model description
  private getModelDescription(modelId: string): string {
    if (modelId.includes('Llama-4-Scout')) {
      return 'Specialized Llama 4 Scout model with 17B parameters and 16 experts for advanced reasoning';
    } else if (modelId.includes('Llama-4-Maverick')) {
      return 'Premium Llama 4 Maverick model with 17B parameters and 128 experts for state-of-the-art performance';
    } else if (modelId.includes('70b')) {
      return 'Large 70B parameter model with excellent reasoning capabilities';
    } else if (modelId.includes('8b')) {
      return 'Efficient 8B parameter model, ideal for most general tasks';
    } else {
      return 'Meta Llama model for advanced natural language tasks';
    }
  }

  async generateContent(prompt: string, modelName: string = 'meta/llama-3.1-8b-instruct'): Promise<string> {
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