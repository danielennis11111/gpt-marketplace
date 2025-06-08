import OpenAI from 'openai';

export interface OpenAIConfig {
  apiKey: string;
  baseURL?: string;
}

export interface OpenAIChatOptions {
  model?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  ragContext?: string;
}

export interface OpenAIUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface OpenAIResponse {
  content: string;
  usage?: OpenAIUsage;
  model: string;
  finishReason?: string;
}

export class OpenAIService {
  private openai: OpenAI;
  private supportedModels = [
    // 🔥 Latest 2025 Models
    'o3',
    'o4-mini',
    'gpt-4.1',
    'gpt-4.1-mini',
    'gpt-4.1-nano',
    // 📈 Current Generation Models
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-4-turbo',
    'gpt-3.5-turbo'
  ];

  constructor(config: OpenAIConfig) {
    this.openai = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
      dangerouslyAllowBrowser: true // Allow in browser for React apps
    });
  }

  /**
   * Check if a model ID is supported by OpenAI
   */
  public isSupportedModel(modelId: string): boolean {
    return this.supportedModels.includes(modelId);
  }

  /**
   * Get list of available OpenAI models
   */
  public getAvailableModels(): string[] {
    return [...this.supportedModels];
  }

  /**
   * Test connection to OpenAI API
   */
  public async testConnection(): Promise<boolean> {
    try {
      await this.openai.models.list();
      return true;
    } catch (error) {
      console.error('OpenAI connection test failed:', error);
      return false;
    }
  }

  /**
   * Send a chat completion request to OpenAI
   */
  public async chat(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options: OpenAIChatOptions = {}
  ): Promise<OpenAIResponse> {
    try {
      const {
        model = 'gpt-4o',
        systemPrompt,
        temperature = 0.7,
        maxTokens = 4000,
        ragContext
      } = options;

      // Build the messages array
      const apiMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

      // Add system prompt with RAG context and formatting instructions
      if (systemPrompt || ragContext) {
        let systemContent = systemPrompt || 'You are a helpful AI assistant.';
        
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

Make your responses visually appealing and easy to scan.`;

        if (ragContext) {
          systemContent += `\n\n## Context Information\n${ragContext}`;
        }

        apiMessages.push({
          role: 'system',
          content: systemContent
        });
      }

      // Add conversation messages
      apiMessages.push(...messages);

      console.log(`🤖 OpenAI: Sending request to ${model}...`);

      const response = await this.openai.chat.completions.create({
        model,
        messages: apiMessages,
        temperature,
        max_tokens: maxTokens,
        stream: false // Explicitly set to false for non-streaming
      }) as OpenAI.Chat.Completions.ChatCompletion;

      if (!response.choices || response.choices.length === 0) {
        throw new Error('No response choices returned from OpenAI');
      }

      const choice = response.choices[0];
      const content = choice.message?.content || '';
      
      const usage = response.usage ? {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens
      } : undefined;

      console.log(`✅ OpenAI: Response received from ${model}`);
      if (usage) {
        console.log(`📊 OpenAI Usage: ${usage.totalTokens} tokens (${usage.promptTokens} prompt + ${usage.completionTokens} completion)`);
      }

      return {
        content,
        usage,
        model,
        finishReason: choice.finish_reason || undefined
      };

    } catch (error: any) {
      console.error('❌ OpenAI Error:', error);
      
      // Enhanced error handling with specific OpenAI error types
      if (error?.status === 401) {
        throw new Error('OpenAI API key is invalid or missing');
      } else if (error?.status === 429) {
        throw new Error('OpenAI rate limit exceeded. Please try again later.');
      } else if (error?.status === 403) {
        throw new Error('OpenAI API access denied. Check your subscription.');
      } else if (error?.status === 404) {
        throw new Error(`OpenAI model "${options.model}" not found or not accessible`);
      } else {
        throw new Error(`OpenAI API error: ${error?.message || 'Unknown error'}`);
      }
    }
  }

  /**
   * 🌊 Stream chat completion with proper SSE handling
   */
  public async *streamChat(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options: OpenAIChatOptions = {}
  ): AsyncGenerator<string, void, unknown> {
    try {
      const {
        model = 'gpt-4o',
        systemPrompt,
        temperature = 0.7,
        maxTokens = 4000,
        ragContext
      } = options;

      // Build messages array with enhanced system prompt
      const apiMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

      if (systemPrompt || ragContext) {
        let systemContent = systemPrompt || 'You are a helpful AI assistant.';
        
        // Add enhanced formatting instructions for better readability
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

Make your responses visually appealing and easy to scan.`;

        if (ragContext) {
          systemContent += `\n\n## Context Information\n${ragContext}`;
        }

        apiMessages.push({
          role: 'system',
          content: systemContent
        });
      }

      // Add conversation messages
      apiMessages.push(...messages);

      console.log(`🌊 OpenAI Streaming: Starting ${model} stream...`);

      // Use optimized parameters for the specific model
      const optimizedParams = this.getOptimizedParams(model);

      const response = await fetch(`${this.openai.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openai.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: apiMessages,
          temperature: optimizedParams.temperature,
          max_tokens: optimizedParams.max_tokens,
          stream: true, // Enable streaming
          stream_options: {
            include_usage: true // Get token usage in stream
          }
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI streaming error: ${response.status} ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // Decode the chunk and add to buffer
          buffer += decoder.decode(value, { stream: true });

          // Process complete lines from buffer
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line in buffer

          for (const line of lines) {
            const trimmedLine = line.trim();
            
            // Skip empty lines and comments
            if (!trimmedLine || trimmedLine.startsWith(':')) {
              continue;
            }

            // Process data lines
            if (trimmedLine.startsWith('data: ')) {
              const data = trimmedLine.slice(6); // Remove 'data: ' prefix
              
              // Check for completion signal
              if (data === '[DONE]') {
                console.log('✅ OpenAI Streaming: Completed');
                return;
              }

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                
                if (content) {
                  yield content;
                }

                // Handle usage information if available
                if (parsed.usage) {
                  console.log(`📊 OpenAI Streaming Usage: ${parsed.usage.total_tokens} tokens`);
                }

              } catch (parseError) {
                // Skip malformed JSON chunks
                console.warn('Failed to parse streaming chunk:', parseError);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

    } catch (error: any) {
      console.error('❌ OpenAI Streaming Error:', error);
      
      // Enhanced error handling for streaming
      if (error?.status === 429) {
        throw new Error('RATE_LIMITED:openai-stream:Streaming rate limit exceeded');
      } else if (error?.status === 401) {
        throw new Error('OpenAI streaming authentication failed');
      } else {
        throw new Error(`OpenAI streaming error: ${error?.message || 'Unknown error'}`);
      }
    }
  }

  /**
   * Get optimized parameters for specific models to reduce rate limiting
   */
  private getOptimizedParams(modelId: string) {
    const baseParams = {
      temperature: 0.7,
      max_tokens: 2048, // Conservative default to minimize rate limiting
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    };

    // Model-specific optimizations based on 2025 capabilities
    switch (modelId) {
      // 🔥 2025 Reasoning Models - Higher tokens for complex tasks
      case 'o3':
        return { ...baseParams, max_tokens: 8192, temperature: 0.3 }; // Lower temp for reasoning
      case 'o4-mini':
        return { ...baseParams, max_tokens: 4096, temperature: 0.4 }; // Balanced for efficiency
      
      // 🚀 2025 Agentic Models - Optimized for execution
      case 'gpt-4.1':
        return { ...baseParams, max_tokens: 6144, temperature: 0.5 }; // Mid-range for execution
      case 'gpt-4.1-mini':
        return { ...baseParams, max_tokens: 3072, temperature: 0.6 }; // Faster response
      case 'gpt-4.1-nano':
        return { ...baseParams, max_tokens: 1024, temperature: 0.8 }; // Ultra-fast, minimal tokens
      
      // 📈 Current Generation Models
      case 'gpt-4o':
        return { ...baseParams, max_tokens: 4096, temperature: 0.7 }; // Standard flagship
      case 'gpt-4o-mini':
        return { ...baseParams, max_tokens: 2048, temperature: 0.8 }; // Cost-effective
      case 'gpt-4-turbo':
        return { ...baseParams, max_tokens: 3072, temperature: 0.6 }; // Legacy support
      
      default:
        return baseParams;
    }
  }

  /**
   * 🎵 Enhanced streaming with progressive loading states
   */
  public async *streamChatWithProgress(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options: OpenAIChatOptions = {},
    onProgress?: (state: 'connecting' | 'streaming' | 'thinking' | 'complete') => void
  ): AsyncGenerator<string, void, unknown> {
    onProgress?.('connecting');
    
    try {
      let hasStartedStreaming = false;
      let thinkingTimeout: NodeJS.Timeout | undefined;

      // Set up thinking indicator for delays
      const startThinkingIndicator = () => {
        thinkingTimeout = setTimeout(() => {
          onProgress?.('thinking');
        }, 2000); // Show thinking after 2 seconds of no content
      };

      const stopThinkingIndicator = () => {
        if (thinkingTimeout) {
          clearTimeout(thinkingTimeout);
          thinkingTimeout = undefined;
        }
      };

      startThinkingIndicator();

      for await (const chunk of this.streamChat(messages, options)) {
        if (!hasStartedStreaming) {
          hasStartedStreaming = true;
          stopThinkingIndicator();
          onProgress?.('streaming');
        }

        yield chunk;
        
        // Reset thinking timer on each chunk
        stopThinkingIndicator();
        startThinkingIndicator();
      }

      stopThinkingIndicator();
      onProgress?.('complete');

    } catch (error) {
      onProgress?.('complete');
      throw error;
    }
  }

  /**
   * Code execution capabilities (for future features)
   */
  public async executeCode(code: string, language: string = 'python'): Promise<string> {
    // Note: OpenAI doesn't have built-in code execution like Gemini
    // This would require a separate code execution service
    console.warn('⚠️ OpenAI Service: Code execution not directly supported. Consider using Code Interpreter via ChatGPT API.');
    return `Code execution not available in OpenAI service. Code provided:\n\`\`\`${language}\n${code}\n\`\`\``;
  }

  /**
   * Check model availability and status
   */
  public async getModelStatus(): Promise<{ [key: string]: boolean }> {
    const status: { [key: string]: boolean } = {};
    
    try {
      const models = await this.openai.models.list();
      const availableModelIds = models.data.map(m => m.id);
      
      for (const model of this.supportedModels) {
        status[model] = availableModelIds.includes(model);
      }
    } catch (error) {
      console.error('Error checking OpenAI model status:', error);
      // Mark all as offline if we can't connect
      for (const model of this.supportedModels) {
        status[model] = false;
      }
    }
    
    return status;
  }
} 