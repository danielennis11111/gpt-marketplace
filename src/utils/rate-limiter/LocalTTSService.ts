/**
 * Local TTS Service Adapter
 * 
 * This is a minimal implementation to satisfy the imports in the rate-limiter project
 */

class LocalTTSService {
  private isInitialized: boolean = false;
  private options: any;
  
  constructor(options: any = {}) {
    this.options = options;
  }
  
  /**
   * Initialize the TTS service
   */
  async initialize(): Promise<boolean> {
    try {
      // Check if browser supports speech synthesis
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        this.isInitialized = true;
        console.log('Browser TTS initialized successfully');
        return true;
      }
      
      console.warn('Speech synthesis not supported in this browser');
      return false;
    } catch (error) {
      console.error('Error initializing TTS service:', error);
      return false;
    }
  }
  
  /**
   * Convert text to speech
   */
  async speak(text: string, voiceId: string = 'default'): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        // Simple browser-based speech synthesis
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Get available voices
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          // Try to find the requested voice or use the first one
          const voice = voices.find(v => v.name.toLowerCase().includes(voiceId.toLowerCase())) || voices[0];
          utterance.voice = voice;
        }
        
        window.speechSynthesis.speak(utterance);
        return true;
      } catch (error) {
        console.error('Error in TTS service:', error);
        return false;
      }
    }
    
    return false;
  }
  
  /**
   * Stop any ongoing speech
   */
  stop(): void {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }
  
  /**
   * Check if the service is speaking
   */
  isSpeaking(): boolean {
    return typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.speaking;
  }
}

export default LocalTTSService; 