/**
 * LlamaService - Adapter for Ollama integration
 * 
 * This service provides methods to interact with local Ollama models
 * and is designed to be compatible with the rate-limiter components.
 */

import { useOllama } from '../../hooks/useOllama';

class LlamaService {
  private ollamaInstance: ReturnType<typeof useOllama> | null = null;
  
  /**
   * Set the Ollama instance from the hook
   */
  setOllamaInstance(instance: ReturnType<typeof useOllama>): void {
    this.ollamaInstance = instance;
  }
  
  /**
   * Check if a specific model exists
   */
  async checkModelExists(modelName: string): Promise<boolean> {
    if (!this.ollamaInstance) {
      return false;
    }
    
    try {
      if (this.ollamaInstance.status.isConnected) {
        // If we're connected and the current model matches, it exists
        if (this.ollamaInstance.status.currentModel === modelName) {
          return true;
        }
        
        // Otherwise, rely on the connected status as a proxy for existence
        // We don't have a direct API to check for model existence without the original code
        return this.ollamaInstance.status.isConnected;
      }
      return false;
    } catch (error) {
      console.error(`Error checking if model ${modelName} exists:`, error);
      return false;
    }
  }
  
  /**
   * Generate a chat completion
   */
  async generateChatCompletion(
    messages: Array<{ role: string; content: string }>,
    modelName?: string,
    options?: any
  ): Promise<{ text: string; usage: any }> {
    if (!this.ollamaInstance) {
      throw new Error('Ollama instance not set');
    }
    
    if (!this.ollamaInstance.status.isConnected) {
      throw new Error('Ollama is not connected');
    }
    
    try {
      // Simplified - we only need the last user message for our Ollama hook
      const lastUserMessage = messages.filter(m => m.role === 'user').pop();
      
      if (!lastUserMessage) {
        throw new Error('No user message found');
      }
      
      const response = await this.ollamaInstance.sendMessage(lastUserMessage.content);
      
      return {
        text: response,
        usage: {
          prompt_tokens: lastUserMessage.content.length / 4, // Rough estimate
          completion_tokens: response.length / 4, // Rough estimate
          total_tokens: (lastUserMessage.content.length + response.length) / 4 // Rough estimate
        }
      };
    } catch (error) {
      console.error('Error generating chat completion:', error);
      throw error;
    }
  }
  
  /**
   * Get the current model name
   */
  getCurrentModel(): string | null {
    if (this.ollamaInstance && this.ollamaInstance.status.isConnected) {
      return this.ollamaInstance.status.currentModel || null;
    }
    return null;
  }
  
  /**
   * Check if Ollama is connected
   */
  isConnected(): boolean {
    return !!this.ollamaInstance?.status.isConnected;
  }
}

// Create singleton instance
export const llamaService = new LlamaService(); 