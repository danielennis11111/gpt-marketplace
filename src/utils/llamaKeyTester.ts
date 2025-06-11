import { LlamaApiService } from '../services/llamaApiService';

/**
 * Utility to test if the Llama API key is configured and working properly
 * @param apiKey The Llama API key to test
 */
export const testLlamaKey = async (apiKey: string): Promise<{
  success: boolean;
  message: string;
  models?: string[];
}> => {
  console.log('Testing Llama API key integration...');
  
  if (!apiKey || apiKey.trim() === '') {
    return {
      success: false,
      message: 'No Llama API key provided'
    };
  }
  
  try {
    const llamaService = new LlamaApiService(apiKey);
    const connectionResult = await llamaService.testConnection();
    
    if (!connectionResult.success) {
      return connectionResult;
    }
    
    // If connected, try to list models
    const models = await llamaService.listModels();
    const modelIds = models.map(model => model.id);
    
    return {
      success: true,
      message: `Llama API connection successful. Found ${models.length} models.`,
      models: modelIds
    };
  } catch (error) {
    console.error('Error testing Llama API key:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error testing Llama API key'
    };
  }
};

/**
 * Use this function to test if your Llama API key is being used properly throughout the application
 */
export const checkLlamaIntegration = async (settings: any): Promise<string> => {
  console.log('Checking Llama API integration across the application...');
  
  const results: string[] = [];
  
  // Check if the key exists in settings
  if (!settings.llamaApiKey || settings.llamaApiKey.trim() === '') {
    return 'Llama API key is not configured in settings. Please add your key in the Settings page.';
  }
  
  // Test the key
  try {
    const keyTest = await testLlamaKey(settings.llamaApiKey);
    results.push(`API Key Test: ${keyTest.success ? 'PASSED' : 'FAILED'}`);
    results.push(`Message: ${keyTest.message}`);
    
    if (keyTest.models && keyTest.models.length > 0) {
      results.push(`Available models: ${keyTest.models.slice(0, 3).join(', ')}${keyTest.models.length > 3 ? '...' : ''}`);
    }
  } catch (error) {
    results.push(`API Key Test: FAILED - ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  return results.join('\n');
}; 