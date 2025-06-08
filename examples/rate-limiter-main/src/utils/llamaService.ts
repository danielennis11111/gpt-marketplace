// Llama Stack Integration Service
// This service connects to the llama-stack server for actual AI responses

interface LlamaResponse {
  content: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
}

// Ollama API interfaces - removed unused OllamaRequest interface

export class LlamaService {
  private baseUrl: string;
  private backendUrl: string;
  private availableModels: string[] = [];

  constructor(baseUrl: string = 'http://localhost:11434') {
    this.baseUrl = baseUrl;
    this.backendUrl = 'http://localhost:3001'; // Our custom backend server
  }

  // Check if our backend server is running
  async isServerRunning(): Promise<boolean> {
    try {
      const response = await fetch(`${this.backendUrl}/api/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.ok;
    } catch (error) {
      console.log('Backend server not running:', error);
      return false;
    }
  }

  // Send a chat completion request
  async sendMessage(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    model: string = 'Llama3.2-3B-Instruct',
    options: {
      maxTokens?: number;
      temperature?: number;
      topP?: number;
      ragContext?: string;
      systemPrompt?: string;
    } = {}
  ): Promise<LlamaResponse> {
    
    const serverRunning = await this.isServerRunning();
    
    if (!serverRunning) {
      // Return simulated response when server isn't running
      return this.getSimulatedResponse(messages, model, options);
    }

    try {
      // Prepare the request with system prompt and RAG context if provided
      let processedMessages = [...messages];
      
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
          systemContent += `\n\n## 📚 DOCUMENT CONTEXT

The user has uploaded documents with relevant information. Here is the most relevant content for this query:

${options.ragContext}

**IMPORTANT INSTRUCTIONS:**
- Use this document context to provide accurate, specific answers
- Reference specific information from the documents when relevant
- If the documents contain exact answers, quote them
- If the question can't be answered from the documents, say so clearly
- Combine document information with your general knowledge appropriately`;
        }
        
        const systemMessage = {
          role: 'system' as const,
          content: systemContent
        };
        
        // Replace existing system message or add new one
        const hasSystemMessage = processedMessages.some(msg => msg.role === 'system');
        if (hasSystemMessage) {
          processedMessages = processedMessages.map(msg => 
            msg.role === 'system' ? systemMessage : msg
          );
        } else {
          processedMessages = [systemMessage, ...processedMessages];
        }
      }

      // Use our backend server with OpenAI-compatible API
      const response = await fetch(`${this.backendUrl}/api/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model, // Pass the model ID directly
          messages: processedMessages,
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 1000
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Backend API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      // Extract response from OpenAI-compatible format
      return {
        content: data.choices[0]?.message?.content || 'No response generated',
        usage: data.usage || {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0
        },
        model: data.model || model
      };

    } catch (error) {
      console.error('Backend API request failed:', error);
      // Fallback to simulated response
      return this.getSimulatedResponse(messages, model, options);
    }
  }

  // Simulated response for when Llama Stack isn't available
  private getSimulatedResponse(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    model: string,
    options: { ragContext?: string } = {}
  ): LlamaResponse {
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
    
    let simulatedContent = '';
    
    if (options.ragContext) {
      simulatedContent = `## 📚 Based on Your Documents

I found relevant information in your uploaded documents for: "${lastUserMessage}"

**Document Context:**
${options.ragContext.substring(0, 500)}${options.ragContext.length > 500 ? '...' : ''}

**Analysis:**
Based on the content in your documents, I can see specific information that directly relates to your question. When the Ollama server is running, I would provide a detailed analysis combining this document context with AI reasoning to give you comprehensive, accurate answers.

**Note:** This is a simulated response because the backend server is not currently running. Start the backend server with \`cd backend && npm start\` to get real AI-powered responses from the Llama 4 Scout model.`;
    } else {
      simulatedContent = `I understand you're asking about "${lastUserMessage}". 

This is a simulated response because the Llama Stack server isn't currently running. To help you work through mental blockers and maintain focus, I would typically:

1. Analyze the specific challenge you're facing
2. Suggest evidence-based strategies for overcoming the blocker
3. Provide actionable steps you can take immediately
4. Help you break down complex problems into manageable parts

To get real AI-powered responses, please start the backend server with \`cd backend && npm start\`.

[Note: Start backend server for real Llama 4 Scout responses]`;
    }

    // Estimate tokens (rough approximation)
    const promptTokens = messages.reduce((sum, msg) => sum + Math.ceil(msg.content.length / 4), 0);
    const completionTokens = Math.ceil(simulatedContent.length / 4);

    return {
      content: simulatedContent,
      usage: {
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: promptTokens + completionTokens
      },
      model: model + ' (simulated)'
    };
  }

  // Get model info for the UI
  getModelInfo(modelName: string): {
    name: string;
    displayName: string;
    contextWindow: number;
    description: string;
    capabilities: string[];
  } {
    const modelInfo: Record<string, any> = {
      'Llama3.2-3B-Instruct': {
        name: 'Llama3.2-3B-Instruct',
        displayName: 'Llama 3.2 (3B) via Ollama',
        contextWindow: 128000, // Official: 128K tokens
        description: 'Fast, efficient model running locally via Ollama',
        capabilities: ['text', 'conversation', 'fast-response', 'local']
      },
      'Llama3.2-11B-Vision-Instruct': {
        name: 'Llama3.2-11B-Vision-Instruct',
        displayName: 'Llama 3.2 Vision (11B) via Ollama',
        contextWindow: 128000, // Official: 128K tokens
        description: 'Multimodal model (requires download via Ollama)',
        capabilities: ['text', 'vision', 'multimodal', 'image-analysis', 'local']
      },
      'llama4-scout': {
        name: 'llama4-scout',
        displayName: 'Llama 4 Scout (CLI)',
        contextWindow: 10485760, // Official: 10M tokens (10,485,760)
        description: 'Official Llama 4 Scout via CLI - 10M token context window',
        capabilities: ['text', 'reasoning', 'analysis', 'local', 'cli']
      },
      'llama4-maverick': {
        name: 'llama4-maverick',
        displayName: 'Llama 4 Maverick (Ollama API)',
        contextWindow: 1048576, // Official: 1M tokens (1,048,576)
        description: 'Official Llama 4 Maverick via Ollama API - 1M token context window',
        capabilities: ['text', 'reasoning', 'analysis', 'local', 'api']
      }
    };

    return modelInfo[modelName] || {
      name: modelName,
      displayName: modelName,
      contextWindow: 128000,
      description: 'Unknown model',
      capabilities: ['text']
    };
  }
} 