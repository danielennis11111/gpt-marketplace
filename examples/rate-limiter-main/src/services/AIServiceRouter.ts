import { LlamaService } from '../utils/llamaService';
import { LlamaStackService } from './LlamaStackService';
import { GeminiService } from './GeminiService';
import { OpenAIService } from './OpenAIService';

interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AIResponse {
  content: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
  fallbackInfo?: {
    originalModel: string;
    fallbackModel: string;
    reason: string;
  };
}

interface AIOptions {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  ragContext?: string;
  systemPrompt?: string;
}

/**
 * 🤖 AI Service Router
 * 
 * Routes conversations to the appropriate AI service based on model ID:
 * - OpenAI models (gpt-*, o1-*): Use OpenAI API with OPENAI_API_KEY
 * - Gemini models (gemini-*): Use Google Gemini API with GEMINI_API_KEY
 * - Llama models (llama*): Use local Ollama service
 */
export class AIServiceRouter {
  private llamaService: LlamaService;
  private llamaStackService: LlamaStackService;
  private geminiService: GeminiService | null = null;
  private openaiService: OpenAIService | null = null;

  constructor() {
    this.llamaService = new LlamaService();
    this.llamaStackService = new LlamaStackService();
    
    // API services are not initialized in GitHub Pages deployment
    // Users can access local Llama models which don't require API keys
    console.log('🏠 Running in GitHub Pages mode - API services disabled');
  }

  /**
   * Send message to appropriate AI service based on model ID
   */
  async sendMessage(
    messages: AIMessage[],
    modelId: string,
    options: AIOptions = {}
  ): Promise<AIResponse> {
    console.log(`🤖 Routing request to ${this.getServiceName(modelId)} for model: ${modelId}`);

    if (this.isOpenAIModel(modelId) && this.openaiService) {
      return this.sendToOpenAI(messages, modelId, options);
    } else if (this.isGeminiModel(modelId) && this.geminiService) {
      return this.sendToGemini(messages, modelId, options);
    } else if (this.isLlamaStackModel(modelId)) {
      return this.sendToLlamaStack(messages, modelId, options);
    } else {
      return this.sendToLlama(messages, modelId, options);
    }
  }

  /**
   * Stream message to appropriate AI service for real-time responses
   */
  async *streamMessage(
    messages: AIMessage[],
    modelId: string,
    options: AIOptions = {}
  ): AsyncGenerator<string, void, unknown> {
    console.log(`🤖 Streaming request to ${this.getServiceName(modelId)} for model: ${modelId}`);

    if (this.isOpenAIModel(modelId) && this.openaiService) {
      yield* this.streamFromOpenAI(messages, modelId, options);
    } else if (this.isGeminiModel(modelId) && this.geminiService) {
      yield* this.streamFromGemini(messages, modelId, options);
    } else if (this.isLlamaStackModel(modelId)) {
      yield* this.streamFromLlamaStack(messages, modelId, options);
    } else {
      yield* this.streamFromLlama(messages, modelId, options);
    }
  }

  /**
   * Get service name for logging
   */
  private getServiceName(modelId: string): string {
    if (this.isOpenAIModel(modelId)) return 'OpenAI';
    if (this.isGeminiModel(modelId)) return 'Gemini';
    return 'Llama';
  }

  /**
   * Check if model should use OpenAI API (including 2025 models)
   */
  private isOpenAIModel(modelId: string): boolean {
    return modelId.startsWith('gpt-') || 
           modelId.startsWith('o1-') || 
           modelId.startsWith('o3') ||
           modelId.startsWith('o4-') ||
           modelId === 'o3' ||
           modelId === 'o4-mini';
  }

  /**
   * Check if model should use Gemini API
   */
  private isGeminiModel(modelId: string): boolean {
    return modelId.startsWith('gemini');
  }

  /**
   * Check if model should use Llama Stack CLI (for downloaded Llama models)
   */
  private isLlamaStackModel(modelId: string): boolean {
    return this.llamaStackService.isModelAvailable(modelId);
  }

  /**
   * Send request to Gemini API
   */
  private async sendToGemini(
    messages: AIMessage[],
    modelId: string,
    options: AIOptions
  ): Promise<AIResponse> {
    if (!this.geminiService) {
      console.warn('🔄 Gemini service not available, falling back to Llama');
      const fallbackResponse = await this.sendToLlama(messages, modelId, options);
      return {
        ...fallbackResponse,
        fallbackInfo: {
          originalModel: modelId,
          fallbackModel: fallbackResponse.model,
          reason: 'Gemini service not configured'
        }
      };
    }

    try {
      // Convert messages to Gemini format
      const geminiMessages = messages.map(msg => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content
      }));

      // Add system prompt and RAG context if provided
      if (options.systemPrompt || options.ragContext) {
        let systemContent = options.systemPrompt || 'You are a helpful AI assistant.';
        
        // Add markdown formatting instructions to all AI responses
        systemContent += `\n\n## 📝 Response Formatting Guidelines

**ALWAYS format your responses using proper markdown:**
- Use **bold text** for emphasis and key points
- Use ## headings for main sections  
- Use ### subheadings for subsections
- Use numbered lists (1. 2. 3.) for step-by-step instructions
- Use bullet points (•) for feature lists and examples
- Use \`code formatting\` for technical terms and commands
- Use > blockquotes for important callouts
- Add line breaks between sections for readability

Make your responses visually appealing and easy to scan with proper formatting.`;
        
        if (options.ragContext) {
          systemContent += `\n\nUse the following context from the user's documents to provide relevant insights:\n\n${options.ragContext}\n\nBased on this context and your training, provide helpful, actionable advice.`;
        }

        // Find existing system message or add new one
        const hasSystemMessage = geminiMessages.some(msg => msg.role === 'system');
        if (hasSystemMessage) {
          geminiMessages.forEach(msg => {
            if (msg.role === 'system') {
              msg.content = systemContent;
            }
          });
        } else {
          geminiMessages.unshift({
            role: 'system',
            content: systemContent
          });
        }
      }

      console.log(`🧠 Sending request to Gemini model: ${modelId}`);
      
      const response = await this.geminiService.generateContent(geminiMessages, {
        model: modelId,
        temperature: options.temperature,
        maxTokens: options.maxTokens,
        topP: options.topP
      });

      return {
        content: response.text,
        usage: {
          prompt_tokens: response.usage?.inputTokens || 0,
          completion_tokens: response.usage?.outputTokens || 0,
          total_tokens: response.usage?.totalTokens || 0
        },
        model: modelId
      };

    } catch (error: any) {
      console.error('🚨 Gemini API error, falling back to Llama:', error);
      const fallbackResponse = await this.sendToLlama(messages, modelId, options);
      return {
        ...fallbackResponse,
        fallbackInfo: {
          originalModel: modelId,
          fallbackModel: fallbackResponse.model,
          reason: error?.message?.includes('rate limit') ? 'Rate limit exceeded' : 'API error'
        }
      };
    }
  }

  /**
   * Send request to OpenAI API
   */
  private async sendToOpenAI(
    messages: AIMessage[],
    modelId: string,
    options: AIOptions
  ): Promise<AIResponse> {
    if (!this.openaiService) {
      console.warn('🔄 OpenAI service not available, falling back to Llama');
      const fallbackResponse = await this.sendToLlama(messages, modelId, options);
      return {
        ...fallbackResponse,
        fallbackInfo: {
          originalModel: modelId,
          fallbackModel: fallbackResponse.model,
          reason: 'OpenAI service not configured'
        }
      };
    }

    try {
      // Convert messages to OpenAI format and ensure system prompt is first
      const openaiMessages = messages.map(msg => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content
      }));

      // Ensure system prompt is applied - this is critical for personas
      if (options.systemPrompt) {
        // Remove any existing system messages
        const filteredMessages = openaiMessages.filter(msg => msg.role !== 'system');
        
        // Add the proper system prompt with RAG context if available
        let systemContent = options.systemPrompt;
        if (options.ragContext) {
          systemContent += `\n\n## Document Context\n\nThe user has uploaded the following documents for context:\n\n${options.ragContext}\n\nUse this context to provide more relevant and informed responses when applicable.`;
        }
        
        // Add system message as first message
        filteredMessages.unshift({
          role: 'system',
          content: systemContent
        });
        
        openaiMessages.length = 0;
        openaiMessages.push(...filteredMessages);
      }

      console.log(`🧠 Sending request to OpenAI model: ${modelId} with system prompt applied`);
      
      const response = await this.openaiService.chat(openaiMessages, {
        model: modelId,
        temperature: options.temperature,
        maxTokens: options.maxTokens
      });

      return {
        content: response.content,
        usage: {
          prompt_tokens: response.usage?.promptTokens || 0,
          completion_tokens: response.usage?.completionTokens || 0,
          total_tokens: response.usage?.totalTokens || 0
        },
        model: response.model || modelId // Use actual model from response
      };

    } catch (error: any) {
      console.error('🚨 OpenAI API error, falling back to Llama:', error);
      
      // Check if it's a rate limit error
      if (error?.message?.includes('rate limit') || error?.status === 429) {
        // Throw a specific rate limit error that the UI can catch
        throw new Error(`RATE_LIMITED:${modelId}:${error.message}`);
      }
      
      // Return fallback response with actual model info
      const fallbackResponse = await this.sendToLlama(messages, modelId, options);
      return {
        ...fallbackResponse,
        model: `${fallbackResponse.model} (fallback from ${modelId})`,
        fallbackInfo: {
          originalModel: modelId,
          fallbackModel: fallbackResponse.model,
          reason: error?.message?.includes('rate limit') ? 'Rate limit exceeded' : 'API error'
        }
      };
    }
  }

  /**
   * Send request to Llama Stack CLI service (for Llama 4 models)
   */
  private async sendToLlamaStack(
    messages: AIMessage[],
    modelId: string,
    options: AIOptions
  ): Promise<AIResponse> {
    console.log(`🦙 Sending request to Llama Stack model: ${modelId}`);
    
    const stackMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const response = await this.llamaStackService.sendMessage(stackMessages, modelId, options);
    
    return {
      content: response.content,
      usage: response.usage,
      model: response.model
    };
  }

  /**
   * Send request to Llama service
   */
  private async sendToLlama(
    messages: AIMessage[],
    modelId: string,
    options: AIOptions
  ): Promise<AIResponse> {
    // Map OpenAI/Gemini models to available Llama models when falling back
    let llamaModelId = modelId;
    if (this.isOpenAIModel(modelId) || this.isGeminiModel(modelId)) {
      llamaModelId = 'llama3.1:8b'; // Default fallback model
      console.log(`🦙 Mapping ${modelId} to ${llamaModelId} for Llama fallback`);
    }
    
    console.log(`🦙 Sending request to Llama model: ${llamaModelId}`);
    
    return this.llamaService.sendMessage(messages, llamaModelId, options);
  }

  /**
   * Stream request to OpenAI API
   */
  private async *streamFromOpenAI(
    messages: AIMessage[],
    modelId: string,
    options: AIOptions
  ): AsyncGenerator<string, void, unknown> {
    if (!this.openaiService) {
      console.warn('🔄 OpenAI service not available, falling back to Llama');
      // For streaming, we can't return fallback info easily, but we can throw a special error
      throw new Error(`FALLBACK:${modelId}:OpenAI service not configured`);
    }

    try {
      // Convert messages to OpenAI format and ensure system prompt is first
      const openaiMessages = messages.map(msg => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content
      }));

      // Ensure system prompt is applied - this is critical for personas
      if (options.systemPrompt) {
        // Remove any existing system messages
        const filteredMessages = openaiMessages.filter(msg => msg.role !== 'system');
        
        // Add the proper system prompt with RAG context if available
        let systemContent = options.systemPrompt;
        if (options.ragContext) {
          systemContent += `\n\n## Document Context\n\nThe user has uploaded the following documents for context:\n\n${options.ragContext}\n\nUse this context to provide more relevant and informed responses when applicable.`;
        }
        
        // Add system message as first message
        filteredMessages.unshift({
          role: 'system',
          content: systemContent
        });
        
        openaiMessages.length = 0;
        openaiMessages.push(...filteredMessages);
      }

      console.log(`🧠 Streaming from OpenAI model: ${modelId} with system prompt applied`);
      
      const stream = this.openaiService.streamChat(openaiMessages, {
        model: modelId,
        temperature: options.temperature,
        maxTokens: options.maxTokens
      });

      for await (const chunk of stream) {
        yield chunk;
      }

    } catch (error: any) {
      console.error('🚨 OpenAI streaming error, falling back to Llama:', error);
      
      // Check if it's a rate limit error
      if (error?.message?.includes('rate limit') || error?.status === 429) {
        // Throw a specific rate limit error that the UI can catch
        throw new Error(`RATE_LIMITED:${modelId}:${error.message}`);
      }
      
      // For streaming fallbacks, throw a special error
      throw new Error(`FALLBACK:${modelId}:${error?.message?.includes('rate limit') ? 'Rate limit exceeded' : 'API error'}`);
    }
  }

  /**
   * Stream request to Gemini API
   */
  private async *streamFromGemini(
    messages: AIMessage[],
    modelId: string,
    options: AIOptions
  ): AsyncGenerator<string, void, unknown> {
    if (!this.geminiService) {
      console.warn('🔄 Gemini service not available, falling back to Llama');
      yield* this.streamFromLlama(messages, modelId, options);
      return;
    }

    try {
      // For now, fall back to regular response and yield it all at once
      // TODO: Implement actual Gemini streaming when available
      const response = await this.sendToGemini(messages, modelId, options);
      yield response.content;
    } catch (error) {
      console.error('🚨 Gemini streaming error, falling back to Llama:', error);
      yield* this.streamFromLlama(messages, modelId, options);
    }
  }

  /**
   * Stream request to Llama Stack CLI service (for Llama 4 models)
   */
  private async *streamFromLlamaStack(
    messages: AIMessage[],
    modelId: string,
    options: AIOptions
  ): AsyncGenerator<string, void, unknown> {
    try {
      console.log(`🦙 Streaming from Llama Stack model: ${modelId}`);
      
      const stackMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      yield* this.llamaStackService.streamMessage(stackMessages, modelId, options);
    } catch (error) {
      console.error('🚨 Llama Stack streaming error:', error);
      yield 'Sorry, I encountered an error with the Llama 4 model. Please try again.';
    }
  }

  /**
   * Stream request to Llama service
   */
  private async *streamFromLlama(
    messages: AIMessage[],
    modelId: string,
    options: AIOptions
  ): AsyncGenerator<string, void, unknown> {
    try {
      // Map OpenAI/Gemini models to available Llama models when falling back
      let llamaModelId = modelId;
      if (this.isOpenAIModel(modelId) || this.isGeminiModel(modelId)) {
        llamaModelId = 'llama3.1:8b'; // Default fallback model
        console.log(`🦙 Mapping ${modelId} to ${llamaModelId} for Llama fallback`);
      }
      
      console.log(`🦙 Streaming from Llama model: ${llamaModelId}`);
      
      // For now, fall back to regular response and yield it all at once
      // TODO: Implement actual Llama streaming when available
      const response = await this.sendToLlama(messages, llamaModelId, options);
      yield response.content;
    } catch (error) {
      console.error('🚨 Llama streaming error:', error);
      yield 'Sorry, I encountered an error processing your request. Please try again.';
    }
  }

  /**
   * Check if services are available
   */
  async checkAvailability(): Promise<{
    llama: boolean;
    gemini: boolean;
    openai: boolean;
  }> {
    const llamaAvailable = await this.llamaService.isServerRunning();
    const geminiAvailable = this.geminiService ? await this.geminiService.checkAvailability() : false;
    const openaiAvailable = this.openaiService ? await this.openaiService.testConnection() : false;

    return {
      llama: llamaAvailable,
      gemini: geminiAvailable,
      openai: openaiAvailable
    };
  }
}

export default AIServiceRouter; 