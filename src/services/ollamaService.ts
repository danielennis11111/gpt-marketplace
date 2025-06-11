import { sanitizeResponse } from '../utils/stringUtils';

export interface OllamaModel {
  id: string;
  name: string;
  contextLength: number;
  description: string;
  capabilities: string[];
  version: string;
  provider: string;
}

export class OllamaService {
  private baseUrl: string = 'http://localhost:11434';
  private isConnected: boolean = false;
  private connectionCheckInterval: NodeJS.Timeout | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 5000; // 5 seconds

  constructor() {
    this.startConnectionCheck();
  }

  private startConnectionCheck() {
    // Check connection every 30 seconds
    this.connectionCheckInterval = setInterval(async () => {
      try {
        await this.testConnection();
        this.isConnected = true;
        this.reconnectAttempts = 0;
      } catch (error) {
        console.warn('Ollama connection check failed:', error);
        this.isConnected = false;
        
        // Attempt to reconnect if we're not already trying
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`Attempting to reconnect to Ollama (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
          await this.attemptReconnect();
        }
      }
    }, 30000);
  }

  private async attemptReconnect() {
    try {
      await this.testConnection();
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log('Successfully reconnected to Ollama');
    } catch (error) {
      console.error('Failed to reconnect to Ollama:', error);
      this.isConnected = false;
    }
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        message: `Ollama connection successful - found ${data.models?.length || 0} models`,
      };
    } catch (error) {
      console.error('Ollama connection test failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error connecting to Ollama',
      };
    }
  }

  async listModels(): Promise<OllamaModel[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.models || !Array.isArray(data.models)) {
        return this.getFallbackModels();
      }

      return data.models.map((model: any) => ({
        id: model.name,
        name: this.formatModelName(model.name),
        contextLength: this.getContextLength(model.name),
        description: this.getModelDescription(model.name),
        capabilities: this.getModelCapabilities(model.name),
        version: this.extractVersionFromName(model.name),
        provider: 'ollama'
      }));
    } catch (error) {
      console.error('Error listing Ollama models:', error);
      return this.getFallbackModels();
    }
  }

  private getFallbackModels(): OllamaModel[] {
    return [
      {
        id: 'llama2',
        name: 'Llama 2',
        contextLength: 4096,
        description: 'Meta\'s Llama 2 model for general purpose text generation',
        capabilities: ['text generation', 'chat', 'instruction following'],
        version: '2',
        provider: 'ollama'
      },
      {
        id: 'llama2:13b',
        name: 'Llama 2 13B',
        contextLength: 4096,
        description: 'Larger Llama 2 model with 13B parameters',
        capabilities: ['text generation', 'chat', 'instruction following', 'complex reasoning'],
        version: '2',
        provider: 'ollama'
      },
      {
        id: 'llama2:70b',
        name: 'Llama 2 70B',
        contextLength: 4096,
        description: 'Largest Llama 2 model with 70B parameters',
        capabilities: ['text generation', 'chat', 'instruction following', 'complex reasoning', 'long-form content'],
        version: '2',
        provider: 'ollama'
      }
    ];
  }

  private formatModelName(name: string): string {
    return name.split(':')[0].replace(/([A-Z])/g, ' $1').trim();
  }

  private getContextLength(name: string): number {
    if (name.includes('70b')) return 4096;
    if (name.includes('13b')) return 4096;
    return 4096; // Default context length
  }

  private getModelCapabilities(name: string): string[] {
    const capabilities = ['text generation', 'chat'];
    
    if (name.includes('70b')) {
      capabilities.push('complex reasoning', 'long-form content');
    } else if (name.includes('13b')) {
      capabilities.push('complex reasoning');
    }
    
    return capabilities;
  }

  private extractVersionFromName(name: string): string {
    const versionMatch = name.match(/llama(\d+)/i);
    return versionMatch ? versionMatch[1] : '';
  }

  private getModelDescription(name: string): string {
    if (name.includes('70b')) {
      return 'Largest Llama model with 70B parameters, excellent for complex reasoning';
    } else if (name.includes('13b')) {
      return 'Medium-sized Llama model with 13B parameters, good balance of performance and speed';
    } else {
      return 'Base Llama model for general purpose text generation';
    }
  }

  async generateContent(prompt: string, modelName: string = 'llama2'): Promise<string> {
    if (!this.isConnected) {
      throw new Error('Ollama is not connected. Please check if the Ollama server is running.');
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelName,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            max_tokens: 2048,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const generatedText = data.response || '';
      
      return sanitizeResponse(generatedText);
    } catch (error) {
      console.error('Error generating content with Ollama:', error);
      throw error;
    }
  }

  dispose() {
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
    }
  }
} 