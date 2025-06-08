/**
 * AI Service Router Adapter
 * 
 * This is a minimal implementation to satisfy the imports in the rate-limiter project
 */

import { LlamaService } from './llamaService';

class AIServiceRouter {
  private llamaService: LlamaService;
  
  constructor() {
    this.llamaService = new LlamaService();
  }
  
  /**
   * Send a message to the appropriate AI service based on the model
   */
  async sendMessage(message: string, modelId: string, options: any = {}): Promise<string> {
    try {
      // Check if the model is an Ollama model
      if (modelId.includes('llama') || modelId.includes('mistral') || modelId.includes('gemma')) {
        return await this.llamaService.generateCompletion(modelId, message);
      }
      
      // For other services, return a placeholder message
      return `[${modelId}] This model is not available in the current implementation. Using Ollama models is recommended.`;
    } catch (error) {
      console.error('Error in AIServiceRouter:', error);
      return 'Sorry, there was an error communicating with the AI service. Please try again or check your connection to Ollama.';
    }
  }
  
  /**
   * Get available models
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      return await this.llamaService.getAvailableModels();
    } catch (error) {
      console.error('Error getting available models:', error);
      return [];
    }
  }
}

export default AIServiceRouter; 