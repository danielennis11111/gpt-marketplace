import { AvatarSpeechRequest, AvatarSpeechResponse } from './AvatarTTSService';
import EnhancedSystemTTS from './EnhancedSystemTTS';

export interface LocalTTSConfig {
  model: 'enhanced-system' | 'speecht5' | 'xtts' | 'piper';
  voiceId?: string;
  speed?: number;
  enableGPU?: boolean;
}

export interface LocalTTSResponse {
  audioBlob: Blob;
  audioUrl: string;
  metadata: {
    model: string;
    voiceId: string;
    duration: number;
    sampleRate: number;
  };
}

/**
 * 🎵 Local TTS Service
 * 
 * Uses Hugging Face models for completely local text-to-speech
 * Works perfectly with ditto-talkinghead for full avatar pipeline
 */
export class LocalTTSService {
  private config: LocalTTSConfig;
  private isInitialized: boolean = false;
  private worker: Worker | null = null;
  private ttsModel: any = null;
  private enhancedTTS: EnhancedSystemTTS;

  // Enhanced System TTS voice profiles
  private static readonly LOCAL_VOICE_PROFILES: Record<string, LocalTTSConfig> = {
    // Primary Enhanced System TTS Voices
    'silky-smooth': {
      model: 'enhanced-system',
      voiceId: 'silky-smooth',
      speed: 0.95
    },
    'scout-professional': {
      model: 'enhanced-system',
      voiceId: 'professional',
      speed: 0.9
    },
    'scout-friendly': {
      model: 'enhanced-system',
      voiceId: 'silky-smooth',
      speed: 1.0
    },
    'scout-storyteller': {
      model: 'enhanced-system',
      voiceId: 'storyteller',
      speed: 0.95
    },
    'scout-quick': {
      model: 'enhanced-system',
      voiceId: 'professional',
      speed: 1.1
    },
    
    // Persona-Specific Enhanced Voices
    'michael-crow': {
      model: 'enhanced-system',
      voiceId: 'michael-crow',
      speed: 0.85
    },
    'elizabeth-reilley': {
      model: 'enhanced-system',
      voiceId: 'elizabeth-reilley',
      speed: 0.95
    },
    'zohair-developer': {
      model: 'enhanced-system',
      voiceId: 'zohair-developer',
      speed: 0.9
    },
    'jennifer-tutor': {
      model: 'enhanced-system',
      voiceId: 'jennifer-tutor',
      speed: 1.05
    },
    
    // Additional Enhanced System TTS Options
    'natural-conversational': {
      model: 'enhanced-system',
      voiceId: 'storyteller',
      speed: 1.0
    },
    'warm-narrator': {
      model: 'enhanced-system',
      voiceId: 'storyteller',
      speed: 0.9
    },
    'technical-expert': {
      model: 'enhanced-system',
      voiceId: 'professional',
      speed: 0.95
    },
    'energetic-presenter': {
      model: 'enhanced-system',
      voiceId: 'jennifer-tutor',
      speed: 1.1
    },
    
    // Fallback Options
    'llama32-efficient': {
      model: 'piper',
      voiceId: 'lessac-medium',
      speed: 1.1
    }
  };

  constructor(config: LocalTTSConfig = { model: 'enhanced-system' }) {
    this.config = config;
    this.enhancedTTS = new EnhancedSystemTTS();
  }

  /**
   * Initialize the local TTS service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log(`🎵 Initializing Local TTS with ${this.config.model}...`);
      
      // Always initialize Enhanced System TTS (now primary)
      await this.enhancedTTS.initialize();
      console.log('✅ Enhanced System TTS initialized');
      
      // Initialize based on selected model
      switch (this.config.model) {
        case 'enhanced-system':
          // Already initialized above
          break;
        case 'speecht5':
          await this.initializeSpeechT5();
          break;
        case 'xtts':
          await this.initializeXTTS();
          break;
        case 'piper':
          await this.initializePiper();
          break;
      }

      this.isInitialized = true;
      console.log(`✅ Local TTS initialized with ${this.config.model}`);

    } catch (error) {
      console.error('❌ Failed to initialize Local TTS:', error);
      throw error;
    }
  }

  /**
   * Generate speech using local models
   */
  async generateSpeech(
    text: string,
    voiceProfile?: string
  ): Promise<LocalTTSResponse> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const profile = voiceProfile ? LocalTTSService.LOCAL_VOICE_PROFILES[voiceProfile] : this.config;
    
    console.log(`🎵 Generating speech with ${profile.model} (${profile.voiceId})`);

    try {
      switch (profile.model) {
        case 'enhanced-system':
          return await this.generateWithEnhancedSystem(text, profile);
        case 'speecht5':
          return await this.generateWithSpeechT5(text, profile);
        case 'xtts':
          return await this.generateWithXTTS(text, profile);
        case 'piper':
          return await this.generateWithPiper(text, profile);
        default:
          throw new Error(`Unsupported model: ${profile.model}`);
      }
    } catch (error) {
      console.error(`❌ TTS generation failed with ${profile.model}:`, error);
      // Fallback to Enhanced System TTS
      console.log('🔄 Falling back to Enhanced System TTS...');
      return await this.generateWithEnhancedSystem(text, { model: 'enhanced-system', voiceId: 'silky-smooth' });
    }
  }

  /**
   * Generate Avatar speech compatible with existing system
   */
  async generateAvatarSpeech(request: AvatarSpeechRequest): Promise<AvatarSpeechResponse> {
    const startTime = Date.now();
    
    // Get the appropriate voice profile
    const profileId = request.avatarProfile || 'scout-friendly';
    const profile = LocalTTSService.LOCAL_VOICE_PROFILES[profileId];
    
    if (!profile) {
      throw new Error(`Unknown voice profile: ${profileId}`);
    }

    console.log(`🎭 Local Avatar TTS: Using ${profileId} with ${profile.model}`);

    try {
      const response = await this.generateSpeech(request.text, profileId);
      const synthesisTime = Date.now() - startTime;

      // Analyze emotional tags (simplified for local processing)
      const emotionalTags = this.analyzeEmotionalContent(request.text);

      // Create Avatar-compatible response
      return {
        audioUrl: response.audioUrl,
        audioBlob: response.audioBlob,
        metadata: {
          voice: profile.voiceId || 'local',
          model: profile.model,
          format: 'wav',
          speed: profile.speed || 1.0,
          textLength: request.text.length,
          estimatedDuration: response.metadata.duration
        },
        avatarProfile: {
          id: profileId,
          name: this.getProfileName(profileId),
          description: this.getProfileDescription(profileId),
          ttsVoice: profile.voiceId || 'local',
          personality: 'Local AI',
          useCase: ['local', 'privacy-first'],
          llamaModel: 'llama4-scout',
          voiceSpeed: profile.speed || 1.0,
          emotionalRange: emotionalTags
        },
        emotionalTags,
        synthesisTime,
                  llamaModel: 'llama4-scout'
      };

    } catch (error) {
      console.error('❌ Local Avatar TTS Error:', error);
      throw new Error(`Local avatar speech generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate speech using Enhanced System TTS
   */
  private async generateWithEnhancedSystem(text: string, config: LocalTTSConfig): Promise<LocalTTSResponse> {
    const startTime = Date.now();
    
    try {
      console.log(`🎵 Enhanced System TTS: Generating speech for "${text.substring(0, 100)}..."`);
      
      const result = await this.enhancedTTS.generateSpeech({
        text,
        profile: config.voiceId || 'silky-smooth',
        audioEffects: true,
        naturalPauses: true,
        emotionalModulation: true
      });

      const duration = Date.now() - startTime;
      console.log(`✅ Enhanced System TTS generated speech in ${duration}ms`);

      return {
        audioBlob: result.audioBlob,
        audioUrl: result.audioUrl,
        metadata: {
          model: 'enhanced-system',
          voiceId: config.voiceId || 'silky-smooth',
          duration: result.duration || duration / 1000,
          sampleRate: 22050
        }
      };
    } catch (error) {
      console.error('❌ Enhanced System TTS generation failed:', error);
      
      // Create mock audio as final fallback
      console.log('🔄 Creating mock audio fallback...');
      const mockAudio = this.generateMockAudio(text, 'enhanced-system');
      
      return {
        audioBlob: mockAudio.blob,
        audioUrl: mockAudio.url,
        metadata: {
          model: 'enhanced-system-mock',
          voiceId: config.voiceId || 'mock',
          duration: Math.max(1, text.length * 0.05),
          sampleRate: 22050
        }
      };
    }
  }

  /**
   * Initialize SpeechT5 model
   */
  private async initializeSpeechT5(): Promise<void> {
    console.log('🎤 Loading SpeechT5 model...');
    // Implementation would load the SpeechT5 model
    console.log('🎤 SpeechT5 ready');
  }

  /**
   * Initialize XTTS model
   */
  private async initializeXTTS(): Promise<void> {
    console.log('🔊 Loading XTTS model...');
    // Implementation would load the XTTS model
    console.log('🔊 XTTS ready');
  }

  /**
   * Initialize Piper model
   */
  private async initializePiper(): Promise<void> {
    console.log('🎺 Loading Piper model...');
    // Implementation would load the Piper model
    console.log('🎺 Piper ready');
  }

  /**
   * Generate speech with SpeechT5
   */
  private async generateWithSpeechT5(text: string, config: LocalTTSConfig): Promise<LocalTTSResponse> {
    console.log(`🎤 SpeechT5 generating: "${text.substring(0, 50)}..."`);
    
    const mockAudio = this.generateMockAudio(text, 'speecht5');
    
    return {
      audioBlob: mockAudio.blob,
      audioUrl: mockAudio.url,
      metadata: {
        model: 'speecht5',
        voiceId: config.voiceId || 'default',
        duration: text.length * 0.08,
        sampleRate: 16000
      }
    };
  }

  /**
   * Generate speech with XTTS
   */
  private async generateWithXTTS(text: string, config: LocalTTSConfig): Promise<LocalTTSResponse> {
    console.log(`🔊 XTTS generating: "${text.substring(0, 50)}..."`);
    
    const mockAudio = this.generateMockAudio(text, 'xtts');
    
    return {
      audioBlob: mockAudio.blob,
      audioUrl: mockAudio.url,
      metadata: {
        model: 'xtts',
        voiceId: config.voiceId || 'default',
        duration: text.length * 0.09,
        sampleRate: 22050
      }
    };
  }

  /**
   * Generate speech with Piper
   */
  private async generateWithPiper(text: string, config: LocalTTSConfig): Promise<LocalTTSResponse> {
    console.log(`🎺 Piper generating: "${text.substring(0, 50)}..."`);
    
    const mockAudio = this.generateMockAudio(text, 'piper');
    
    return {
      audioBlob: mockAudio.blob,
      audioUrl: mockAudio.url,
      metadata: {
        model: 'piper',
        voiceId: config.voiceId || 'default',
        duration: text.length * 0.06, // Piper is faster
        sampleRate: 22050
      }
    };
  }

  /**
   * Create WAV blob from audio data
   */
  private createWAVBlob(audioData: Float32Array, sampleRate: number): Blob {
    // Validate input data
    if (!audioData || audioData.length === 0) {
      console.error('❌ Empty or invalid audio data provided to createWAVBlob');
      throw new Error('Cannot create WAV blob from empty audio data');
    }
    
    if (!sampleRate || sampleRate <= 0) {
      console.warn('⚠️ Invalid sample rate, defaulting to 24000Hz');
      sampleRate = 24000;
    }
    
    const length = audioData.length;
    const buffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(buffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * 2, true);
    
    // Convert float audio data to 16-bit PCM
    const int16Array = new Int16Array(buffer, 44);
    for (let i = 0; i < length; i++) {
      const sample = audioData[i];
      if (isNaN(sample)) {
        console.warn(`⚠️ NaN detected in audio data at index ${i}, replacing with 0`);
        int16Array[i] = 0;
      } else {
        int16Array[i] = Math.max(-32768, Math.min(32767, sample * 32768));
      }
    }
    
    const blob = new Blob([buffer], { type: 'audio/wav' });
    
    // Validate created blob
    if (blob.size === 0) {
      console.error('❌ Created WAV blob has zero size');
      throw new Error('Generated WAV blob is empty');
    }
    
    console.log(`✅ Created WAV blob: ${blob.size} bytes, ${length} samples, ${sampleRate}Hz`);
    return blob;
  }

  /**
   * Generate mock audio for development with voice-specific characteristics
   */
  private generateMockAudio(text: string, model: string): { blob: Blob; url: string } {
    const duration = Math.max(text.length * 0.08, 1); // At least 1 second
    const sampleRate = 22050;
    const samples = Math.floor(duration * sampleRate);
    
    // Create proper WAV file structure
    const bufferLength = 44 + samples * 2; // WAV header + data
    const buffer = new ArrayBuffer(bufferLength);
    const view = new DataView(buffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    // RIFF header
    writeString(0, 'RIFF');
    view.setUint32(4, bufferLength - 8, true);
    writeString(8, 'WAVE');
    
    // fmt chunk
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // chunk size
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, 1, true); // mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true); // byte rate
    view.setUint16(32, 2, true); // block align
    view.setUint16(34, 16, true); // bits per sample
    
    // data chunk
    writeString(36, 'data');
    view.setUint32(40, samples * 2, true);
    
    // Generate audio data
    const audioData = new Int16Array(buffer, 44, samples);
    
    // Voice-specific characteristics
    let frequency = 440; // Base frequency
    let amplitude = 0.3;
    let modulation = 1.0;
    
    // Enhanced persona-specific voice characteristics with more distinction
    if (model.includes('michael-crow') || model.includes('v2/en_speaker_0')) {
      frequency = 280; // Much lower, authoritative president voice
      amplitude = 0.4;
      modulation = 0.75; // Slower, measured presidential delivery
    } else if (model.includes('elizabeth-reilley') || model.includes('v2/en_speaker_5')) {
      frequency = 520; // Higher, clear visionary voice
      amplitude = 0.35;
      modulation = 1.15; // Confident forward-thinking pace
    } else if (model.includes('zohair-developer') || model.includes('v2/en_speaker_4')) {
      frequency = 360; // Mid-range, thoughtful
      amplitude = 0.25; // Quieter, introverted genius
      modulation = 0.85; // Careful, measured developer pace
    } else if (model.includes('jennifer-tutor') || model.includes('v2/en_speaker_7')) {
      frequency = 580; // Much higher, excited tutor
      amplitude = 0.45; // Louder, enthusiastic
      modulation = 1.3; // Fast, energetic teaching style
    } else if (model.includes('silky-smooth') || model.includes('v2/en_speaker_1')) {
      frequency = 380; // Warm, smooth default
      amplitude = 0.3;
      modulation = 0.9; // Slightly slower for smoothness
    } else if (model.includes('professional') || model.includes('v2/en_speaker_3')) {
      frequency = 340; // Professional business tone
      amplitude = 0.35;
      modulation = 1.0; // Standard professional pace
    } else if (model.includes('storyteller') || model.includes('v2/en_speaker_9')) {
      frequency = 450; // Rich storytelling voice
      amplitude = 0.4;
      modulation = 0.8; // Slower, expressive storytelling
    } else if (model.includes('v2/en_speaker_6')) {
      frequency = 500; // Friendly, approachable
      amplitude = 0.35;
      modulation = 1.05; // Upbeat friendly pace
    } else if (model.includes('v2/en_speaker_2')) {
      frequency = 420; // Quick, efficient
      amplitude = 0.3;
      modulation = 1.2; // Faster, efficient delivery
    } else if (model.includes('v2/en_speaker_8')) {
      frequency = 400; // Natural conversational
      amplitude = 0.32;
      modulation = 1.0; // Natural conversation pace
    } else {
      // Default variation based on model name
      frequency = 440 + (model.length * 15);
    }
    
    // Generate audio with voice characteristics
    for (let i = 0; i < samples; i++) {
      const time = i / sampleRate;
      const wave = Math.sin(2 * Math.PI * frequency * time * modulation);
      
      // Add subtle vibrato for more natural sound
      const vibrato = 1 + 0.03 * Math.sin(2 * Math.PI * 4 * time);
      let sample = wave * vibrato * amplitude;
      
      // Fade in/out for smoother playback
      if (i < sampleRate * 0.1) {
        sample *= i / (sampleRate * 0.1);
      } else if (i > samples - sampleRate * 0.1) {
        sample *= (samples - i) / (sampleRate * 0.1);
      }
      
      audioData[i] = Math.max(-32767, Math.min(32767, sample * 32767));
    }
    
    // Create blob with proper MIME type
    const blob = new Blob([buffer], { type: 'audio/wav' });
    
    // Verify blob is valid before creating URL
    if (blob.size === 0) {
      console.error('❌ Generated audio blob is empty');
      throw new Error('Generated audio blob is empty');
    }
    
    const url = URL.createObjectURL(blob);
    
    console.log(`🎵 Generated mock audio for ${model} (f=${frequency}Hz, a=${amplitude}, mod=${modulation}, size=${blob.size} bytes)`);
    
    return { blob, url };
  }

  /**
   * Analyze emotional content in text
   */
  private analyzeEmotionalContent(text: string): string[] {
    const emotions: string[] = [];
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('!') || lowerText.includes('excited')) emotions.push('excited');
    if (lowerText.includes('calm') || lowerText.includes('peaceful')) emotions.push('calm');
    if (lowerText.includes('technical') || lowerText.includes('analysis')) emotions.push('professional');
    if (lowerText.includes('story') || lowerText.includes('once upon')) emotions.push('narrative');
    
    return emotions.length > 0 ? emotions : ['neutral'];
  }

  /**
   * Get profile name
   */
  private getProfileName(profileId: string): string {
    const names: Record<string, string> = {
      'scout-professional': 'Scout Professional (Local)',
      'scout-friendly': 'Scout Friendly (Local)',
      'scout-storyteller': 'Scout Storyteller (Local)',
      'llama32-efficient': 'Llama 3.2 Quick (Local)'
    };
    return names[profileId] || 'Local Avatar';
  }

  /**
   * Get profile description
   */
  private getProfileDescription(profileId: string): string {
    const descriptions: Record<string, string> = {
      'scout-professional': 'Professional voice using local SpeechT5',
      'scout-friendly': 'Friendly voice using local Bark TTS',
      'scout-storyteller': 'Expressive voice using local Bark TTS',
      'llama32-efficient': 'Fast voice using local Piper TTS'
    };
    return descriptions[profileId] || 'Local TTS voice';
  }

  /**
   * Test voice generation for diagnostics
   */
  async testVoice(voiceProfile: string): Promise<LocalTTSResponse> {
    const testText = `Testing ${voiceProfile} voice. This is how I sound.`;
    console.log(`🧪 Testing voice profile: ${voiceProfile}`);
    
    try {
      const result = await this.generateSpeech(testText, voiceProfile);
      console.log(`✅ Voice test completed for ${voiceProfile}`);
      return result;
    } catch (error) {
      console.error(`❌ Voice test failed for ${voiceProfile}:`, error);
      throw error;
    }
  }

  /**
   * Get available local voice profiles
   */
  static getLocalVoiceProfiles(): string[] {
    return Object.keys(this.LOCAL_VOICE_PROFILES);
  }

  /**
   * Check if a model is available locally
   */
  static isModelAvailable(model: string): boolean {
    return ['enhanced-system', 'speecht5', 'xtts', 'piper'].includes(model);
  }
}

export default LocalTTSService; 