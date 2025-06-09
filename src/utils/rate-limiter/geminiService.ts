/**
 * GeminiService - Adapter for Google Gemini integration
 * 
 * This service provides methods to interact with Google Gemini models
 * and is designed to be compatible with the rate-limiter components.
 */

import { useSettings } from '../../contexts/SettingsContext';

// The model ID for Gemini 2.0 Flash
const GEMINI_MODEL_ID = 'gemini-2.0-flash';

class GeminiService {
  private apiKey: string = '';
  private isReady: boolean = false;
  
  /**
   * Set the API key from settings
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    this.isReady = !!apiKey && apiKey.trim() !== '';
  }
  
  /**
   * Check if the service is ready to use (has API key)
   */
  isConnected(): boolean {
    return this.isReady;
  }
  
  /**
   * Generate a chat completion using Gemini API
   */
  async generateChatCompletion(
    messages: Array<{ role: string; content: string }>,
    modelName: string = GEMINI_MODEL_ID
  ) {
    if (!this.isReady) {
      console.error('Gemini API key not set or empty');
      throw new Error('Gemini API key not set');
    }
    
    try {
      // Map roles to Gemini format
      const geminiMessages = messages.map(msg => {
        // Gemini uses 'user' and 'model' roles instead of 'user' and 'assistant'
        const role = msg.role === 'assistant' ? 'model' : msg.role;
        return {
          role: role === 'system' ? 'user' : role, // Gemini doesn't have system role, so use user
          parts: [{ text: msg.content }]
        };
      });
      
      // Prepare the request
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL_ID}:generateContent`;
      const requestUrl = `${apiUrl}?key=${this.apiKey}`;
      
      const requestBody = {
        contents: geminiMessages,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      };
      
      // Make the API call
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response from Gemini API');
      }
      
      // Extract the response text
      let responseText = '';
      for (const candidate of data.candidates) {
        if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
          for (const part of candidate.content.parts) {
            if (part.text) {
              responseText += part.text;
            }
          }
        }
      }
      
      // Estimate token usage
      const promptText = messages.map(m => m.content).join(' ');
      const estimatedPromptTokens = Math.ceil(promptText.length / 4);
      const estimatedCompletionTokens = Math.ceil(responseText.length / 4);
      
      return {
        text: responseText,
        usage: {
          prompt_tokens: estimatedPromptTokens,
          completion_tokens: estimatedCompletionTokens,
          total_tokens: estimatedPromptTokens + estimatedCompletionTokens
        }
      };
    } catch (error) {
      console.error('Error generating Gemini completion:', error);
      throw error;
    }
  }
  
  /**
   * Generate a chat completion with streaming using Gemini API
   */
  async *generateChatCompletionStream(
    messages: Array<{ role: string; content: string }>,
    modelName: string = GEMINI_MODEL_ID,
    options: any = {}
  ): AsyncGenerator<string, { text: string; usage: any }, unknown> {
    if (!this.isReady) {
      console.error('Gemini API key not set or empty');
      throw new Error('Gemini API key not set');
    }
    
    try {
      console.log('Starting Gemini streaming request with messages:', messages.length);
      console.log('Message content sample:', messages.map(m => ({ role: m.role, contentLength: m.content.length })));
      
      // Map roles to Gemini format
      const geminiMessages = messages.map(msg => {
        // Gemini uses 'user' and 'model' roles instead of 'user' and 'assistant'
        const role = msg.role === 'assistant' ? 'model' : msg.role;
        return {
          role: role === 'system' ? 'user' : role, // Gemini doesn't have system role, so use user
          parts: [{ text: msg.content }]
        };
      });
      
      // Initialize fallback response
      let fallbackResponse = '';
      
      // First, try the normal non-streaming endpoint as fallback in case streaming fails
      try {
        // Prepare the regular API request
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL_ID}:generateContent`;
        const requestUrl = `${apiUrl}?key=${this.apiKey}`;
        
        const requestBody = {
          contents: geminiMessages,
          generationConfig: {
            temperature: options.temperature || 0.7,
            topK: options.topK || 40,
            topP: options.topP || 0.95,
            maxOutputTokens: options.max_tokens || 1024,
          }
        };
        
        console.log('Making regular Gemini API request as backup...');
        
        // Make the API call
        const response = await fetch(requestUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
          console.warn(`Regular API call failed with status: ${response.status} ${response.statusText}`);
        } else {
          // Save the response for potential fallback
          const data = await response.json();
          
          if (data.candidates && data.candidates.length > 0) {
            for (const candidate of data.candidates) {
              if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
                for (const part of candidate.content.parts) {
                  if (part.text) {
                    fallbackResponse += part.text;
                  }
                }
              }
            }
          }
          
          console.log('Successfully got fallback response of length:', fallbackResponse.length);
        }
      } catch (fallbackError) {
        console.warn('Error getting fallback response:', fallbackError);
      }
      
      // Now try the streaming API
      try {
        // Prepare the request with streaming enabled
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL_ID}:streamGenerateContent`;
        const requestUrl = `${apiUrl}?key=${this.apiKey}`;
        console.log('Using Gemini streaming API endpoint:', apiUrl);
        
        const requestBody = {
          contents: geminiMessages,
          generationConfig: {
            temperature: options.temperature || 0.7,
            topK: options.topK || 40,
            topP: options.topP || 0.95,
            maxOutputTokens: options.max_tokens || 1024,
          }
        };
        
        // Make the streaming API call
        console.log('Sending Gemini streaming request...');
        
        const response = await fetch(requestUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });
        
        console.log('Gemini streaming response status:', response.status, response.statusText);
        
        if (!response.ok) {
          let errorText = '';
          try {
            const errorData = await response.json();
            errorText = JSON.stringify(errorData);
            console.error('Gemini API error response:', errorData);
            
            // If we have a fallback response, use it instead of throwing
            if (fallbackResponse && fallbackResponse.length > 0) {
              console.log('Using fallback response instead of throwing error');
              yield fallbackResponse;
              return {
                text: fallbackResponse,
                usage: {
                  prompt_tokens: Math.ceil(messages.map(m => m.content).join(' ').length / 4),
                  completion_tokens: Math.ceil(fallbackResponse.length / 4),
                  total_tokens: Math.ceil((messages.map(m => m.content).join(' ').length + fallbackResponse.length) / 4)
                }
              };
            }
            
            throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`);
          } catch (parseError) {
            console.error('Failed to parse error response:', parseError);
            
            // If we have a fallback response, use it instead of throwing
            if (fallbackResponse && fallbackResponse.length > 0) {
              console.log('Using fallback response instead of throwing error');
              yield fallbackResponse;
              return {
                text: fallbackResponse,
                usage: {
                  prompt_tokens: Math.ceil(messages.map(m => m.content).join(' ').length / 4),
                  completion_tokens: Math.ceil(fallbackResponse.length / 4),
                  total_tokens: Math.ceil((messages.map(m => m.content).join(' ').length + fallbackResponse.length) / 4)
                }
              };
            }
            
            throw new Error(`Gemini API error: ${response.statusText} (${errorText || 'No error details'})`);
          }
        }
        
        if (!response.body) {
          console.error('ReadableStream not supported in this browser.');
          
          // If we have a fallback response, use it instead of throwing
          if (fallbackResponse && fallbackResponse.length > 0) {
            console.log('Using fallback response due to lack of ReadableStream support');
            yield fallbackResponse;
            return {
              text: fallbackResponse,
              usage: {
                prompt_tokens: Math.ceil(messages.map(m => m.content).join(' ').length / 4),
                completion_tokens: Math.ceil(fallbackResponse.length / 4),
                total_tokens: Math.ceil((messages.map(m => m.content).join(' ').length + fallbackResponse.length) / 4)
              }
            };
          }
          
          throw new Error('ReadableStream not supported in this browser.');
        }
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let completeText = '';
        let chunkCounter = 0;
        let buffer = '';
        
        try {
          console.log('Starting to read Gemini stream...');
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              console.log('Gemini stream reading complete');
              break;
            }
            
            const chunk = decoder.decode(value, { stream: true });
            console.log(`Received raw chunk #${++chunkCounter}:`, chunk.substring(0, 100) + (chunk.length > 100 ? '...' : ''));
            
            // Add this chunk to our buffer
            buffer += chunk;
            
            try {
              // Try to parse the complete response or find complete objects in the buffer
              const response = JSON.parse(buffer);
              console.log('Successfully parsed complete JSON response');
              
              // Check if we have a full response object
              if (response.candidates && response.candidates.length > 0) {
                console.log(`Found ${response.candidates.length} candidates in response`);
                
                for (const candidate of response.candidates) {
                  if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
                    console.log(`Found ${candidate.content.parts.length} parts in candidate`);
                    
                    for (const part of candidate.content.parts) {
                      if (part.text) {
                        const responseChunk = part.text;
                        console.log('Extracted text from complete response, length:', responseChunk.length);
                        completeText += responseChunk;
                        
                        // Yield the text
                        yield responseChunk;
                      } else {
                        console.warn('Part has no text property:', part);
                      }
                    }
                  } else {
                    console.warn('Candidate has no content/parts:', candidate);
                  }
                }
                
                // Clear the buffer after successful parsing
                buffer = '';
              } else {
                console.warn('Response has no candidates or empty candidates array:', response);
              }
            } catch (parseError) {
              // Not a complete JSON object yet, let's try to find any complete JSON objects
              console.warn('Error parsing complete buffer as JSON, trying line-by-line approach');
              
              try {
                // Check if we have any complete objects denoted by newlines
                const lines = buffer.split('\n').filter(line => line.trim());
                
                if (lines.length > 1) {
                  console.log(`Buffer contains ${lines.length} lines, trying to process`);
                  
                  // Process each line that might be a complete JSON object
                  for (let i = 0; i < lines.length - 1; i++) {
                    try {
                      const data = JSON.parse(lines[i]);
                      console.log('Parsed line as JSON');
                      
                      if (data.candidates && data.candidates.length > 0) {
                        for (const candidate of data.candidates) {
                          if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
                            for (const part of candidate.content.parts) {
                              if (part.text) {
                                const responseChunk = part.text;
                                console.log('Extracted text from line, length:', responseChunk.length);
                                completeText += responseChunk;
                                
                                // Yield the text
                                yield responseChunk;
                              }
                            }
                          }
                        }
                      }
                      
                      // Remove this processed line from the buffer
                      buffer = buffer.substring(lines[i].length + 1);
                    } catch (lineError) {
                      console.warn('Error parsing line as JSON');
                      // Keep the buffer as is and wait for more data
                    }
                  }
                }
              } catch (streamError) {
                console.warn('Error processing stream buffer:', streamError);
                // Keep accumulating data in the buffer
              }
            }
          }
          
          // If we've reached the end of the stream with no text yielded, and we have a fallback,
          // use the fallback
          if (completeText.length === 0 && fallbackResponse && fallbackResponse.length > 0) {
            console.log('Stream completed with no text, using fallback response');
            yield fallbackResponse;
            return {
              text: fallbackResponse,
              usage: {
                prompt_tokens: Math.ceil(messages.map(m => m.content).join(' ').length / 4),
                completion_tokens: Math.ceil(fallbackResponse.length / 4),
                total_tokens: Math.ceil((messages.map(m => m.content).join(' ').length + fallbackResponse.length) / 4)
              }
            };
          }
          
          // Estimate token usage at the end
          const promptText = messages.map(m => m.content).join(' ');
          const estimatedPromptTokens = Math.ceil(promptText.length / 4);
          const estimatedCompletionTokens = Math.ceil(completeText.length / 4);
          
          return {
            text: completeText || fallbackResponse || '',
            usage: {
              prompt_tokens: estimatedPromptTokens,
              completion_tokens: estimatedCompletionTokens,
              total_tokens: estimatedPromptTokens + estimatedCompletionTokens
            }
          };
        } finally {
          reader.releaseLock();
          console.log('Gemini reader released');
        }
      } catch (fetchError) {
        console.error('Error making fetch request to Gemini API:', fetchError);
        
        // If we have a fallback response, use it instead of throwing
        if (fallbackResponse && fallbackResponse.length > 0) {
          console.log('Using fallback response due to fetch error');
          yield fallbackResponse;
          return {
            text: fallbackResponse,
            usage: {
              prompt_tokens: Math.ceil(messages.map(m => m.content).join(' ').length / 4),
              completion_tokens: Math.ceil(fallbackResponse.length / 4),
              total_tokens: Math.ceil((messages.map(m => m.content).join(' ').length + fallbackResponse.length) / 4)
            }
          };
        }
        
        throw new Error(`Fetch error with Gemini API: ${(fetchError as Error).message}`);
      }
    } catch (error) {
      console.error('Error streaming Gemini completion:', error);
      throw error;
    }
  }
  
  /**
   * Get the current model name
   */
  getCurrentModel(): string {
    return GEMINI_MODEL_ID;
  }
  
  /**
   * Check if streaming is supported by the current model
   */
  isStreamingSupported(): boolean {
    return true; // Gemini supports streaming
  }
}

// Create singleton instance
export const geminiService = new GeminiService(); 