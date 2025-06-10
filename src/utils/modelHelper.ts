import { LlamaApiService } from '../services/llamaApiService';

/**
 * Helper utility to debug and fetch models from different providers
 */

interface ModelDebugInfo {
  provider: string;
  modelCount: number;
  models: any[];
  error?: string;
  apiKeyConfigured: boolean;
}

/**
 * Fetches all available models from configured providers
 * @param apiKeys Object containing API keys for different providers
 * @returns Debug information for all providers
 */
export const fetchAllAvailableModels = async (apiKeys: {
  llamaApiKey?: string;
  geminiApiKey?: string;
}): Promise<ModelDebugInfo[]> => {
  const results: ModelDebugInfo[] = [];
  
  // Fetch Llama models if API key is configured
  if (apiKeys.llamaApiKey) {
    try {
      console.log('Fetching Llama models...');
      const llamaService = new LlamaApiService(apiKeys.llamaApiKey);
      const models = await llamaService.listModels();
      
      results.push({
        provider: 'llama',
        modelCount: models.length,
        models,
        apiKeyConfigured: true
      });
      
      console.log(`Successfully fetched ${models.length} Llama models`);
    } catch (error) {
      console.error('Error fetching Llama models:', error);
      results.push({
        provider: 'llama',
        modelCount: 0,
        models: [],
        error: error instanceof Error ? error.message : 'Unknown error',
        apiKeyConfigured: true
      });
    }
  } else {
    results.push({
      provider: 'llama',
      modelCount: 0,
      models: [],
      error: 'API key not configured',
      apiKeyConfigured: false
    });
  }
  
  // You can add more providers here as needed
  
  return results;
};

/**
 * Returns the correct model IDs for a specific provider
 * @param provider The provider name
 * @returns Array of default model IDs
 */
export const getDefaultModelIds = (provider: string): string[] => {
  switch (provider) {
    case 'llama':
      return [
        'meta/llama-3-70b-instruct',
        'meta/llama-3-8b-instruct',
        'meta/llama-3.1-70b-instruct',
        'meta/llama-3.1-8b-instruct'
      ];
    case 'gemini':
      return [
        'gemini-flash',
        'gemini-pro',
        'gemini-ultra'
      ];
    case 'ollama':
      return ['ollama-local'];
    default:
      return [];
  }
};

/**
 * Gets the correct model ID format based on provider and model name
 * Useful for converting between different formats
 */
export const normalizeModelId = (modelId: string, provider: string): string => {
  if (provider === 'llama') {
    if (!modelId.includes('/')) {
      return `meta/${modelId}`;
    }
    return modelId;
  }
  return modelId;
};

/**
 * Helper method to debug model loading issues
 */
export const debugModelLoading = (modelList: any[], settings: any) => {
  console.log('=== MODEL LOADING DEBUG INFO ===');
  console.log('Total models loaded:', modelList.length);
  console.log('Models by provider:');
  
  const providers = {} as Record<string, number>;
  modelList.forEach(model => {
    providers[model.provider] = (providers[model.provider] || 0) + 1;
  });
  
  Object.entries(providers).forEach(([provider, count]) => {
    console.log(`- ${provider}: ${count} models`);
  });
  
  console.log('Settings:');
  console.log('- Llama API key configured:', !!settings.llamaApiKey);
  console.log('- Gemini API key configured:', !!settings.geminiApiKey);
  console.log('- Preferred provider:', settings.preferredChatProvider);
  console.log('=============================');
  
  return { 
    modelCount: modelList.length, 
    providers,
    hasLlamaModels: providers['llama'] > 0,
    hasGeminiModels: providers['gemini'] > 0,
    hasOllamaModels: providers['ollama'] > 0
  };
}; 