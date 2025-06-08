/**
 * Unified TTS Service Adapter
 * 
 * This is a minimal implementation to satisfy the imports in the rate-limiter project
 */

import LocalTTSService from './LocalTTSService';

// Cache the service instance
let ttsService: LocalTTSService | null = null;

/**
 * Get a unified TTS service - in this implementation, it's just the LocalTTSService
 */
export const getUnifiedTTS = (): LocalTTSService => {
  if (!ttsService) {
    ttsService = new LocalTTSService();
    
    // Initialize the service
    ttsService.initialize().catch(error => {
      console.warn('Failed to initialize TTS service:', error);
    });
  }
  
  return ttsService;
}; 