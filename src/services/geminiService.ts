export class GeminiService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';

  constructor(apiKey: string) {
    console.log('GeminiService: Initializing with API key length:', apiKey.length);
    if (!apiKey || !apiKey.startsWith('AIza')) {
      console.warn('GeminiService: Invalid API key format. Gemini API keys should start with "AIza"');
    }
    this.apiKey = apiKey;
  }

  async generateContent(prompt: string, model: string = 'gemini-2.0-flash'): Promise<string> {
    console.log('GeminiService: Generating content with model:', model);
    
    if (!this.apiKey) {
      console.error('GeminiService: No API key available');
      throw new Error('Gemini API key not configured');
    }

    if (!this.apiKey.startsWith('AIza')) {
      console.error('GeminiService: Invalid API key format');
      throw new Error('Invalid Gemini API key format. API keys should start with "AIza"');
    }

    // Validate model name
    const validModels = ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'];
    if (!validModels.includes(model)) {
      console.warn(`GeminiService: Unknown model "${model}", using default "gemini-2.0-flash"`);
      model = 'gemini-2.0-flash';
    }

    try {
      const requestBody = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      };

      console.log('GeminiService: Making API request to:', `${this.baseUrl}/${model}:generateContent`);

      const response = await fetch(`${this.baseUrl}/${model}:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('GeminiService: API error:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });

        // Handle specific error cases based on the troubleshooting guide
        switch (response.status) {
          case 400:
            if (errorData.includes('FAILED_PRECONDITION')) {
              throw new Error('Gemini API free tier is not available in your region. Please enable billing in Google AI Studio.');
            }
            throw new Error(`Invalid request: ${errorData}`);
          case 403:
            throw new Error('API key does not have the required permissions. Please check your API key in Google AI Studio.');
          case 404:
            throw new Error(`Model "${model}" not found. Please use a valid model name.`);
          case 429:
            throw new Error('Rate limit exceeded. Please wait a moment and try again, or upgrade your quota.');
          case 500:
            throw new Error('Internal server error. Please try again or switch to a different model.');
          case 503:
            throw new Error('Service temporarily unavailable. Please try again in a moment.');
          case 504:
            throw new Error('Request timeout. Your prompt may be too large. Try reducing the input size.');
          default:
            throw new Error(`Gemini API error: ${response.status} - ${errorData}`);
        }
      }

      const data = await response.json();
      console.log('GeminiService: Content generated successfully');
      
      if (!data.candidates || data.candidates.length === 0) {
        if (data.promptFeedback?.blockReason) {
          throw new Error(`Content was blocked due to: ${data.promptFeedback.blockReason}. Please modify your prompt and try again.`);
        }
        throw new Error('No response generated from Gemini. The content may have been filtered.');
      }

      const candidate = data.candidates[0];
      if (candidate.finishReason === 'SAFETY') {
        throw new Error('Response was blocked due to safety filters. Please modify your prompt and try again.');
      }
      
      if (candidate.finishReason === 'RECITATION') {
        throw new Error('Response was blocked due to recitation concerns. Try making your prompt more unique or use a higher temperature.');
      }

      const generatedText = candidate?.content?.parts?.[0]?.text;
      if (!generatedText) {
        throw new Error('Invalid response format from Gemini');
      }

      return generatedText;
    } catch (error) {
      console.error('GeminiService: Error generating content:', error);
      throw error;
    }
  }

  async *generateContentStream(prompt: string, model: string = 'gemini-2.0-flash'): AsyncGenerator<string, void, unknown> {
    console.log('GeminiService: Starting streaming content generation with model:', model);
    
    if (!this.apiKey) {
      console.error('GeminiService: No API key available');
      throw new Error('Gemini API key not configured');
    }

    if (!this.apiKey.startsWith('AIza')) {
      console.error('GeminiService: Invalid API key format');
      throw new Error('Invalid Gemini API key format. API keys should start with "AIza"');
    }

    // Validate model name
    const validModels = ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'];
    if (!validModels.includes(model)) {
      console.warn(`GeminiService: Unknown model "${model}", using default "gemini-2.0-flash"`);
      model = 'gemini-2.0-flash';
    }

    try {
      const requestBody = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      };

      console.log('GeminiService: Making streaming API request to:', `${this.baseUrl}/${model}:streamGenerateContent`);

      const response = await fetch(`${this.baseUrl}/${model}:streamGenerateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('GeminiService: Streaming API error:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(`Gemini streaming error: ${response.status} - ${errorData}`);
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

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim() && line.startsWith('data: ')) {
              try {
                const jsonStr = line.slice(6); // Remove "data: " prefix
                const data = JSON.parse(jsonStr);
                
                if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                  yield data.candidates[0].content.parts[0].text;
                }
              } catch (parseError) {
                console.warn('Failed to parse streaming data:', line);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('GeminiService: Error in streaming generation:', error);
      throw error;
    }
  }

  isStreamingSupported(): boolean {
    return true;
  }

  async listModels(): Promise<string[]> {
    console.log('GeminiService: Listing available models');
    
    if (!this.apiKey) {
      console.error('GeminiService: No API key available');
      throw new Error('Gemini API key not configured');
    }

    if (!this.apiKey.startsWith('AIza')) {
      console.error('GeminiService: Invalid API key format');
      throw new Error('Invalid Gemini API key format');
    }

    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('GeminiService: API error listing models:', errorData);
        
        // Handle specific error cases
        switch (response.status) {
          case 403:
            throw new Error('API key does not have permission to list models');
          case 429:
            throw new Error('Rate limit exceeded while listing models');
          default:
            throw new Error(`Failed to fetch models: ${response.status} - ${errorData}`);
        }
      }

      const data = await response.json();
      console.log('GeminiService: Models retrieved successfully:', data);
      
      const models = data.models?.map((model: any) => model.name.replace('models/', '')) || [];
      
      // Filter to only include supported modern models (exclude old versions)
      const supportedModels = models.filter((model: string) => 
        model.includes('gemini') && 
        !model.includes('embedding') &&
        !model.includes('1.0-pro') &&  // Exclude old 1.0 models
        !model.includes('vision-latest') // Exclude old vision models
      );
      
      // Always prioritize Gemini 2.0 Flash as the primary model
      const modernModels = supportedModels.length > 0 ? supportedModels : ['gemini-2.0-flash'];
      
      // Ensure gemini-2.0-flash is first in the list
      const orderedModels = modernModels.includes('gemini-2.0-flash') 
        ? ['gemini-2.0-flash', ...modernModels.filter((m: string) => m !== 'gemini-2.0-flash')]
        : ['gemini-2.0-flash', ...modernModels];
        
      return orderedModels;
    } catch (error) {
      console.error('GeminiService: Error listing models:', error);
      // Return fallback models
      return ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'];
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    console.log('GeminiService: Testing connection');
    
    if (!this.apiKey) {
      console.error('GeminiService: No API key available');
      return { success: false, message: 'Gemini API key not configured' };
    }

    if (!this.apiKey.startsWith('AIza')) {
      console.error('GeminiService: Invalid API key format');
      return { success: false, message: 'Invalid API key format. Gemini API keys should start with "AIza"' };
    }

    try {
      // Test with a simple prompt instead of just listing models
      const testPrompt = 'Hello, this is a connection test.';
      await this.generateContent(testPrompt, 'gemini-2.0-flash');
      
      console.log('GeminiService: Connection test successful');
      return { success: true, message: 'Gemini API connection successful' };
    } catch (error) {
      console.error('GeminiService: Connection test error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect to Gemini API';
      return { 
        success: false, 
        message: errorMessage
      };
    }
  }
} 