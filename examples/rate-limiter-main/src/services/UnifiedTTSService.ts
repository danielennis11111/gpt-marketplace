/**
 * 🎙️ Unified TTS Service
 * 
 * Provides the best possible text-to-speech experience by:
 * 1. Trying Bark TTS first (high quality, natural voices)
 * 2. Falling back to browser TTS if Bark unavailable
 * 3. Smart voice selection based on content and user preferences
 */

import LocalTTSService from './LocalTTSService';

export interface UnifiedTTSConfig {
  preferredVoice?: 'auto' | 'professional' | 'friendly' | 'storyteller' | 'quick';
  fallbackVoice?: string; // Browser voice name
  speed?: number;
  pitch?: number;
  forceMode?: 'bark' | 'browser' | 'auto';
}

export interface TTSResponse {
  success: boolean;
  audioUrl?: string;
  audioBlob?: Blob;
  method: 'bark' | 'browser' | 'failed';
  error?: string;
  metadata?: {
    duration: number;
    model: string;
    voiceId: string;
  };
}

export class UnifiedTTSService {
  private localTTSService: LocalTTSService | null = null;
  private isBarkAvailable: boolean = false;
  private isInitializing: boolean = false;
  private speechSynthesis: SpeechSynthesis;
  private voiceCache: SpeechSynthesisVoice[] = [];

  constructor() {
    this.speechSynthesis = window.speechSynthesis;
    this.initializeBarkTTS();
    this.loadBrowserVoices();
  }

  /**
   * Initialize Bark TTS in the background
   */
  private async initializeBarkTTS(): Promise<void> {
    if (this.isInitializing) return;
    
    this.isInitializing = true;
    
    try {
      console.log('🔊 Initializing Enhanced System TTS...');
      this.localTTSService = new LocalTTSService({ model: 'enhanced-system' });
      await this.localTTSService.initialize();
      this.isBarkAvailable = true;
      console.log('✅ Enhanced System TTS ready - high-quality voices available!');
    } catch (error) {
              console.warn('⚠️ Enhanced System TTS unavailable, using browser fallback:', error);
      this.isBarkAvailable = false;
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Load and cache browser voices
   */
  private loadBrowserVoices(): void {
    const updateVoices = () => {
      this.voiceCache = this.speechSynthesis.getVoices();
    };

    updateVoices();
    this.speechSynthesis.onvoiceschanged = updateVoices;
  }

  /**
   * Main TTS method - tries Bark first, falls back to browser
   */
  async speak(
    text: string, 
    config: UnifiedTTSConfig = {}
  ): Promise<TTSResponse> {
    
    // Handle force mode
    if (config.forceMode === 'browser') {
      return this.speakWithBrowser(text, config);
    }
    
    if (config.forceMode === 'bark') {
      return this.speakWithBark(text, config);
    }

    // Auto mode: Try Bark first, fallback to browser
    if (this.isBarkAvailable && this.localTTSService) {
      try {
        return await this.speakWithBark(text, config);
      } catch (error) {
        console.warn('🐕 Bark failed, falling back to browser TTS:', error);
        return this.speakWithBrowser(text, config);
      }
    } else {
      // Bark not available, use browser immediately
      return this.speakWithBrowser(text, config);
    }
  }

  /**
   * High-quality Bark TTS
   */
  private async speakWithBark(
    text: string, 
    config: UnifiedTTSConfig
  ): Promise<TTSResponse> {
    
    if (!this.localTTSService || !this.isBarkAvailable) {
      throw new Error('Bark TTS not available');
    }

    try {
      const voiceProfile = this.mapConfigToAvatarProfile(config.preferredVoice || 'auto', text);
      
      const result = await this.localTTSService.generateAvatarSpeech({
        text,
        avatarProfile: voiceProfile
      });

      // Play the audio immediately
      const audio = new Audio(result.audioUrl);
      audio.play();

      return {
        success: true,
        audioUrl: result.audioUrl,
        audioBlob: result.audioBlob,
        method: 'bark',
        metadata: {
          duration: result.metadata.estimatedDuration,
          model: 'bark',
          voiceId: voiceProfile
        }
      };

    } catch (error) {
      return {
        success: false,
        method: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Browser TTS fallback
   */
  private async speakWithBrowser(
    text: string, 
    config: UnifiedTTSConfig
  ): Promise<TTSResponse> {
    
    return new Promise((resolve) => {
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Configure voice
        const voice = this.selectBrowserVoice(config);
        if (voice) {
          utterance.voice = voice;
        }

        // Configure speech parameters
        utterance.rate = config.speed || 1.0;
        utterance.pitch = config.pitch || 1.0;
        utterance.volume = 1.0;

        // Set up event handlers
        utterance.onend = () => {
          resolve({
            success: true,
            method: 'browser',
            metadata: {
              duration: text.length * 0.1, // Rough estimate
              model: 'browser',
              voiceId: voice?.name || 'default'
            }
          });
        };

        utterance.onerror = (event) => {
          resolve({
            success: false,
            method: 'failed',
            error: `Browser TTS error: ${event.error}`
          });
        };

        // Speak
        this.speechSynthesis.speak(utterance);

      } catch (error) {
        resolve({
          success: false,
          method: 'failed',
          error: error instanceof Error ? error.message : 'Unknown browser TTS error'
        });
      }
    });
  }

  /**
   * Map config preferences to avatar profiles
   */
  private mapConfigToAvatarProfile(
    preference: string, 
    text: string
  ): 'scout-professional' | 'scout-friendly' | 'scout-storyteller' | 'llama-quick' {
    
    if (preference !== 'auto') {
      const profileMap: Record<string, any> = {
        'professional': 'scout-professional',
        'friendly': 'scout-friendly', 
        'storyteller': 'scout-storyteller',
        'quick': 'llama-quick'
      };
      return profileMap[preference] || 'scout-friendly';
    }

    // Auto-select based on content
    const lowerText = text.toLowerCase();
    
    // Professional for formal content
    if (lowerText.includes('install') || lowerText.includes('command') || 
        lowerText.includes('error') || lowerText.includes('configure')) {
      return 'scout-professional';
    }
    
    // Storyteller for explanations and narratives
    if (lowerText.includes('story') || lowerText.includes('explain') || 
        lowerText.includes('imagine') || text.length > 200) {
      return 'scout-storyteller';
    }
    
    // Quick for short responses
    if (text.length < 50) {
      return 'llama-quick';
    }
    
    // Default to friendly
    return 'scout-friendly';
  }

  /**
   * Select best browser voice based on preferences
   */
  private selectBrowserVoice(config: UnifiedTTSConfig): SpeechSynthesisVoice | null {
    if (this.voiceCache.length === 0) return null;

    // If specific fallback voice requested
    if (config.fallbackVoice) {
      const specificVoice = this.voiceCache.find(
        voice => voice.name.toLowerCase().includes(config.fallbackVoice!.toLowerCase())
      );
      if (specificVoice) return specificVoice;
    }

    // Prefer high-quality voices
    const preferredVoices = [
      'Google', 'Microsoft', 'Apple', 'Amazon'
    ];

    for (const preferred of preferredVoices) {
      const voice = this.voiceCache.find(v => 
        v.name.includes(preferred) && v.lang.startsWith('en')
      );
      if (voice) return voice;
    }

    // Fallback to any English voice
    return this.voiceCache.find(v => v.lang.startsWith('en')) || this.voiceCache[0];
  }

  /**
   * Stop any current speech
   */
  stopSpeaking(): void {
    this.speechSynthesis.cancel();
  }

  /**
   * Check if Bark TTS is available
   */
  isBarkReady(): boolean {
    return this.isBarkAvailable;
  }

  /**
   * Get status information
   */
  getStatus(): {
    barkAvailable: boolean;
    browserAvailable: boolean;
    isInitializing: boolean;
    voiceCount: number;
  } {
    return {
      barkAvailable: this.isBarkAvailable,
      browserAvailable: 'speechSynthesis' in window,
      isInitializing: this.isInitializing,
      voiceCount: this.voiceCache.length
    };
  }

  /**
   * Quick speak method for simple use cases
   */
  async quickSpeak(text: string, highQuality: boolean = true): Promise<boolean> {
    const config: UnifiedTTSConfig = {
      preferredVoice: 'auto',
      forceMode: highQuality ? 'auto' : 'browser'
    };

    const result = await this.speak(text, config);
    return result.success;
  }

  /**
   * AI response specific speaking (optimized for AI conversations)
   */
  async speakAIResponse(text: string): Promise<TTSResponse> {
    return this.speak(text, {
      preferredVoice: 'auto', // Smart selection based on content
      speed: 1.0,
      forceMode: 'auto' // Always try Bark first for AI responses
    });
  }

  /**
   * User feedback specific speaking (optimized for notifications/feedback)
   */
  async speakUserFeedback(text: string): Promise<TTSResponse> {
    return this.speak(text, {
      preferredVoice: 'friendly',
      speed: 1.1, // Slightly faster for quick feedback
      forceMode: 'auto'
    });
  }
}

// Global singleton instance
let unifiedTTSInstance: UnifiedTTSService | null = null;

export const getUnifiedTTS = (): UnifiedTTSService => {
  if (!unifiedTTSInstance) {
    unifiedTTSInstance = new UnifiedTTSService();
  }
  return unifiedTTSInstance;
};

export default UnifiedTTSService; 