export interface ImageGenerationOptions {
  model?: 'dall-e-3' | 'gpt-4o' | 'gpt-4.1';
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
  n?: number; // Number of images (1-10 for DALL-E)
}

export interface VisionOptions {
  model?: 'gpt-4o' | 'gpt-4.1' | 'llama-vision' | 'llava';
  maxTokens?: number;
  detail?: 'low' | 'high' | 'auto';
}

export interface ImageGenerationResponse {
  imageUrl: string;
  imageBlob?: Blob;
  revisedPrompt?: string; // DALL-E 3 often revises prompts
  metadata: {
    model: string;
    size: string;
    quality: string;
    style?: string;
    generationTime: number;
    estimatedCost: number;
  };
}

export interface VisionAnalysisResponse {
  analysis: string;
  confidence?: number;
  detectedObjects?: string[];
  metadata: {
    model: string;
    imageSize?: string;
    processingTime: number;
    tokenUsage?: {
      input: number;
      output: number;
    };
  };
}

export class ImageService {
  private openaiApiKey: string;
  private ollamaBaseUrl: string;
  private openaiBaseUrl: string;

  constructor(
    openaiApiKey: string, 
    ollamaBaseUrl: string = 'http://localhost:11434',
    openaiBaseUrl: string = 'https://api.openai.com/v1'
  ) {
    this.openaiApiKey = openaiApiKey;
    this.ollamaBaseUrl = ollamaBaseUrl;
    this.openaiBaseUrl = openaiBaseUrl;
  }

  // 🎨 IMAGE GENERATION METHODS

  /**
   * 🎨 Generate image using DALL-E 3 (most reliable for image generation)
   */
  public async generateWithDallE3(
    prompt: string,
    options: ImageGenerationOptions = {}
  ): Promise<ImageGenerationResponse> {
    const {
      size = '1024x1024',
      quality = 'standard',
      style = 'vivid',
      n = 1
    } = options;

    console.log(`🎨 DALL-E 3: Generating ${n} image(s) - ${size} ${quality}`);
    const startTime = Date.now();

    try {
      const response = await fetch(`${this.openaiBaseUrl}/images/generations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: prompt,
          n: Math.min(n, 1), // DALL-E 3 only supports n=1
          size: size,
          quality: quality,
          style: style,
          response_format: 'url'
        })
      });

      if (!response.ok) {
        throw await this.handleImageError(response, 'DALL-E 3');
      }

      const data = await response.json();
      const imageData = data.data[0];
      const generationTime = Date.now() - startTime;

      // Download the image blob for local storage
      const imageBlob = await this.downloadImageBlob(imageData.url);

      console.log(`✅ DALL-E 3: Generated image in ${generationTime}ms`);

      return {
        imageUrl: imageData.url,
        imageBlob,
        revisedPrompt: imageData.revised_prompt,
        metadata: {
          model: 'dall-e-3',
          size,
          quality,
          style,
          generationTime,
          estimatedCost: this.calculateDallECost(size, quality)
        }
      };

    } catch (error: any) {
      console.error('❌ DALL-E 3 Error:', error);
      throw error;
    }
  }

  /**
   * 🚀 Generate image using GPT-4o (better understanding, newer)
   */
  public async generateWithGPT4o(
    prompt: string,
    options: ImageGenerationOptions = {}
  ): Promise<ImageGenerationResponse> {
    const {
      size = '1024x1024',
      quality = 'standard'
    } = options;

    console.log(`🚀 GPT-4o: Generating image - ${size} ${quality}`);
    const startTime = Date.now();

    try {
      const response = await fetch(`${this.openaiBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: `Generate a high-quality image of: ${prompt}. Make it detailed and visually appealing.`
            }
          ],
          tools: [
            {
              type: 'function',
              function: {
                name: 'generate_image',
                description: 'Generate an image based on the text prompt',
                parameters: {
                  type: 'object',
                  properties: {
                    prompt: {
                      type: 'string',
                      description: 'The prompt to generate an image from'
                    },
                    size: {
                      type: 'string',
                      enum: ['1024x1024', '1792x1024', '1024x1792'],
                      description: 'The size of the image to generate'
                    }
                  },
                  required: ['prompt']
                }
              }
            }
          ],
          tool_choice: 'auto'
        })
      });

      if (!response.ok) {
        throw await this.handleImageError(response, 'GPT-4o');
      }

      const data = await response.json();
      const toolCall = data.choices[0].message.tool_calls?.[0];
      
      if (!toolCall) {
        throw new Error('GPT-4o did not generate an image');
      }

      const imageArgs = JSON.parse(toolCall.function.arguments);
      const imageUrl = imageArgs.image_url || imageArgs.url;
      const generationTime = Date.now() - startTime;

      // Download the image blob
      const imageBlob = await this.downloadImageBlob(imageUrl);

      console.log(`✅ GPT-4o: Generated image in ${generationTime}ms`);

      return {
        imageUrl,
        imageBlob,
        metadata: {
          model: 'gpt-4o',
          size,
          quality,
          generationTime,
          estimatedCost: this.calculateGPT4oCost(data.usage)
        }
      };

    } catch (error: any) {
      console.error('❌ GPT-4o Error:', error);
      throw error;
    }
  }

  /**
   * 🎯 Smart image generation - automatically chooses best model
   */
  public async generateImage(
    prompt: string,
    options: ImageGenerationOptions = {}
  ): Promise<ImageGenerationResponse> {
    const model = options.model || this.selectBestGenerationModel(prompt);

    console.log(`🎯 Smart Generation: Using ${model} for prompt`);

    switch (model) {
      case 'gpt-4o':
      case 'gpt-4.1':
        return this.generateWithGPT4o(prompt, options);
      case 'dall-e-3':
      default:
        return this.generateWithDallE3(prompt, options);
    }
  }

  // 👁️ VISION ANALYSIS METHODS

  /**
   * 👁️ Analyze image using OpenAI Vision models
   */
  public async analyzeWithOpenAI(
    imageUrl: string,
    prompt: string = 'Describe this image in detail',
    options: VisionOptions = {}
  ): Promise<VisionAnalysisResponse> {
    const {
      model = 'gpt-4o',
      maxTokens = 1000,
      detail = 'auto'
    } = options;

    console.log(`👁️ OpenAI Vision: Analyzing with ${model}`);
    const startTime = Date.now();

    try {
      const response = await fetch(`${this.openaiBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageUrl,
                    detail: detail
                  }
                }
              ]
            }
          ],
          max_tokens: maxTokens
        })
      });

      if (!response.ok) {
        throw await this.handleImageError(response, `OpenAI Vision ${model}`);
      }

      const data = await response.json();
      const analysis = data.choices[0].message.content;
      const processingTime = Date.now() - startTime;

      console.log(`✅ OpenAI Vision: Analyzed in ${processingTime}ms`);

      return {
        analysis,
        metadata: {
          model,
          processingTime,
          tokenUsage: {
            input: data.usage?.prompt_tokens || 0,
            output: data.usage?.completion_tokens || 0
          }
        }
      };

    } catch (error: any) {
      console.error(`❌ OpenAI Vision Error:`, error);
      throw error;
    }
  }

  /**
   * 🦙 Analyze image using Llama vision models
   */
  public async analyzeWithLlama(
    imageUrl: string,
    prompt: string = 'Describe this image in detail',
    options: VisionOptions = {}
  ): Promise<VisionAnalysisResponse> {
    const {
      model = 'llava:latest',
      maxTokens = 1000
    } = options;

    console.log(`🦙 Llama Vision: Analyzing with ${model}`);
    const startTime = Date.now();

    try {
      // Convert image URL to base64 for Ollama
      const imageBase64 = await this.imageUrlToBase64(imageUrl);

      const response = await fetch(`${this.ollamaBaseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          prompt: prompt,
          images: [imageBase64],
          stream: false,
          options: {
            num_predict: maxTokens
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Llama vision error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const analysis = data.response;
      const processingTime = Date.now() - startTime;

      console.log(`✅ Llama Vision: Analyzed in ${processingTime}ms`);

      return {
        analysis,
        metadata: {
          model,
          processingTime
        }
      };

    } catch (error: any) {
      console.error('❌ Llama Vision Error:', error);
      throw error;
    }
  }

  /**
   * 🎯 Smart vision analysis - chooses best model based on requirements
   */
  public async analyzeImage(
    imageUrl: string,
    prompt: string = 'Describe this image in detail',
    options: VisionOptions = {}
  ): Promise<VisionAnalysisResponse> {
    const model = options.model || await this.selectBestVisionModel();

    console.log(`🎯 Smart Vision: Using ${model} for analysis`);

    if (model.includes('llama') || model.includes('llava')) {
      return this.analyzeWithLlama(imageUrl, prompt, { ...options, model: model as 'llama-vision' | 'llava' });
    } else {
      return this.analyzeWithOpenAI(imageUrl, prompt, { ...options, model: model as 'gpt-4o' | 'gpt-4.1' });
    }
  }

  // 🛠️ UTILITY METHODS

  /**
   * Select best model for image generation based on prompt characteristics
   */
  private selectBestGenerationModel(prompt: string): 'dall-e-3' | 'gpt-4o' {
    const lowerPrompt = prompt.toLowerCase();

    // GPT-4o is better for complex understanding and text in images
    if (lowerPrompt.includes('text') || lowerPrompt.includes('writing') ||
        lowerPrompt.includes('sign') || lowerPrompt.includes('chart') ||
        lowerPrompt.includes('diagram') || lowerPrompt.includes('complex')) {
      return 'gpt-4o';
    }

    // DALL-E 3 is better for artistic and creative images
    if (lowerPrompt.includes('artistic') || lowerPrompt.includes('painting') ||
        lowerPrompt.includes('style') || lowerPrompt.includes('creative')) {
      return 'dall-e-3';
    }

    // Default to DALL-E 3 for general use (more cost-effective)
    return 'dall-e-3';
  }

  /**
   * Select best model for vision analysis
   */
  private async selectBestVisionModel(): Promise<string> {
    // Check if Llama vision models are available (for cost efficiency)
    try {
      const llamaResponse = await fetch(`${this.ollamaBaseUrl}/api/tags`);
      if (llamaResponse.ok) {
        const data = await llamaResponse.json();
        const visionModels = data.models?.filter((m: any) => 
          m.name.includes('llava') || m.name.includes('vision')
        );
        if (visionModels?.length > 0) {
          return visionModels[0].name; // Use first available Llama vision model
        }
      }
    } catch (error) {
      console.log('Llama not available, using OpenAI vision');
    }

    // Fallback to OpenAI vision
    return 'gpt-4o';
  }

  /**
   * Convert image URL to base64 for Ollama
   */
  private async imageUrlToBase64(imageUrl: string): Promise<string> {
    try {
      const response = await fetch(imageUrl);
      const arrayBuffer = await response.arrayBuffer();
      const base64 = btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(arrayBuffer))));
      return base64;
    } catch (error) {
      throw new Error(`Failed to convert image to base64: ${error}`);
    }
  }

  /**
   * Download image blob from URL
   */
  private async downloadImageBlob(imageUrl: string): Promise<Blob> {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.status}`);
      }
      return await response.blob();
    } catch (error) {
      console.error('Failed to download image blob:', error);
      throw error;
    }
  }

  /**
   * Calculate estimated cost for DALL-E operations
   */
  private calculateDallECost(size: string, quality: string): number {
    const costs = {
      '1024x1024': quality === 'hd' ? 0.080 : 0.040,
      '1792x1024': quality === 'hd' ? 0.120 : 0.080,
      '1024x1792': quality === 'hd' ? 0.120 : 0.080
    };
    return costs[size as keyof typeof costs] || 0.040;
  }

  /**
   * Calculate estimated cost for GPT-4o operations
   */
  private calculateGPT4oCost(usage: any): number {
    if (!usage) return 0.030; // Base image generation cost

    const inputCost = (usage.prompt_tokens || 0) * 0.000005; // $5/1M tokens
    const outputCost = (usage.completion_tokens || 0) * 0.000015; // $15/1M tokens
    const imageCost = 0.030; // Base image generation cost

    return inputCost + outputCost + imageCost;
  }

  /**
   * Enhanced error handling for image operations
   */
  private async handleImageError(response: Response, service: string): Promise<Error> {
    try {
      const errorData = await response.json();
      const errorMessage = errorData.error?.message || response.statusText;

      if (response.status === 429) {
        return new Error(`RATE_LIMITED:${service.toLowerCase()}:${errorMessage}`);
      } else if (response.status === 400) {
        return new Error(`Invalid request to ${service}: ${errorMessage}`);
      } else if (response.status === 401) {
        return new Error(`Authentication failed for ${service}: Check API key`);
      } else if (response.status === 403) {
        return new Error(`Access forbidden for ${service}: ${errorMessage}`);
      } else {
        return new Error(`${service} error: ${errorMessage}`);
      }
    } catch (parseError) {
      return new Error(`${service} error: ${response.status} ${response.statusText}`);
    }
  }

  // 🎨 STATIC UTILITY METHODS

  /**
   * Create object URL for displaying images
   */
  public static createObjectURL(blob: Blob): string {
    return URL.createObjectURL(blob);
  }

  /**
   * Download image to user's device
   */
  public static downloadImage(imageUrl: string, filename: string = 'generated-image.png'): void {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Clean up object URLs
   */
  public static revokeObjectURL(objectUrl: string): void {
    URL.revokeObjectURL(objectUrl);
  }

  /**
   * Validate image URL
   */
  public static isValidImageUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }
}

// Export default instance creator
export const createImageService = (
  openaiApiKey: string, 
  ollamaBaseUrl?: string
) => new ImageService(openaiApiKey, ollamaBaseUrl); 