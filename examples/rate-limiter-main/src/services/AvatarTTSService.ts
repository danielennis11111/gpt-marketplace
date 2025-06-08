import { TTSService, TTSOptions, TTSResponse, TTSVoice } from './TTSService';

export interface AvatarVoiceProfile {
  id: string;
  name: string;
  description: string;
  ttsVoice: string;
  personality: string;
  useCase: string[];
  llamaModel: string;
  voiceSpeed: number;
  emotionalRange: string[];
}

export interface AvatarSpeechRequest {
  text: string;
  context?: string;
  emotion?: 'neutral' | 'excited' | 'calm' | 'professional' | 'friendly' | 'authoritative';
  avatarProfile?: string;
  streaming?: boolean;
}

export interface AvatarSpeechResponse extends TTSResponse {
  avatarProfile: AvatarVoiceProfile;
  emotionalTags: string[];
  synthesisTime: number;
  llamaModel: string;
}

/**
 * 🎭 Avatar TTS Service
 * 
 * Enhanced TTS service specifically designed for Virtual Avatar Builder
 * Integrates with Llama 4 Scout responses and provides intelligent voice selection
 */
export class AvatarTTSService {
  private ttsService: TTSService;
  private llamaBackendUrl: string;

  // 🎭 Predefined avatar voice profiles optimized for different use cases
  private static readonly AVATAR_PROFILES: AvatarVoiceProfile[] = [
    {
      id: 'scout-professional',
      name: 'Scout Professional',
      description: 'Authoritative voice for business and professional content',
      ttsVoice: 'onyx',
      personality: 'Professional, confident, analytical',
      useCase: ['business', 'analysis', 'technical', 'reasoning'],
      llamaModel: 'llama4-scout',
      voiceSpeed: 0.9,
      emotionalRange: ['professional', 'authoritative', 'calm']
    },
    {
      id: 'scout-friendly',
      name: 'Scout Friendly',
      description: 'Warm, approachable voice for conversational content',
      ttsVoice: 'alloy',
      personality: 'Friendly, helpful, engaging',
      useCase: ['conversation', 'teaching', 'guidance', 'support'],
      llamaModel: 'llama4-scout',
      voiceSpeed: 1.0,
      emotionalRange: ['friendly', 'excited', 'calm', 'neutral']
    },
    {
      id: 'scout-storyteller',
      name: 'Scout Storyteller',
      description: 'Engaging narrative voice for stories and explanations',
      ttsVoice: 'fable',
      personality: 'Narrative, expressive, captivating',
      useCase: ['storytelling', 'explanations', 'creative', 'educational'],
      llamaModel: 'llama4-scout',
      voiceSpeed: 0.95,
      emotionalRange: ['excited', 'friendly', 'neutral']
    },
    {
      id: 'llama32-efficient',
      name: 'Llama 3.2 Quick',
      description: 'Fast, efficient voice for quick responses',
      ttsVoice: 'nova',
      personality: 'Quick, energetic, to-the-point',
      useCase: ['quick-answers', 'simple-tasks', 'lightweight'],
      llamaModel: 'Llama3.2-3B-Instruct',
      voiceSpeed: 1.1,
      emotionalRange: ['excited', 'friendly', 'neutral']
    }
  ];

  constructor(openaiApiKey: string, llamaBackendUrl: string = 'http://localhost:3001') {
    this.ttsService = new TTSService(openaiApiKey);
    this.llamaBackendUrl = llamaBackendUrl;
  }

  /**
   * Get all available avatar voice profiles
   */
  public static getAvatarProfiles(): AvatarVoiceProfile[] {
    return [...this.AVATAR_PROFILES];
  }

  /**
   * Get avatar profile by ID
   */
  public static getAvatarProfile(profileId: string): AvatarVoiceProfile | undefined {
    return this.AVATAR_PROFILES.find(profile => profile.id === profileId);
  }

  /**
   * 🎭 Generate avatar speech from Llama response
   */
  public async generateAvatarSpeech(
    request: AvatarSpeechRequest
  ): Promise<AvatarSpeechResponse> {
    const startTime = Date.now();
    
    // Select optimal avatar profile
    const profile = this.selectOptimalProfile(request);
    
    console.log(`🎭 Avatar TTS: Using ${profile.name} (${profile.ttsVoice}) for ${profile.llamaModel}`);

    // Prepare TTS options based on avatar profile and emotion
    const ttsOptions: TTSOptions = {
      voice: profile.ttsVoice,
      model: 'tts-1-hd', // Use HD for better avatar quality
      speed: this.adjustSpeedForEmotion(profile.voiceSpeed, request.emotion || 'neutral'),
      format: 'mp3',
      quality: 'hd'
    };

    try {
      // Generate speech using the TTS service
      const ttsResponse = await this.ttsService.generateSpeech(request.text, ttsOptions);
      
      const synthesisTime = Date.now() - startTime;
      
      // Analyze text for emotional tags
      const emotionalTags = this.analyzeEmotionalContent(request.text);
      
      console.log(`✅ Avatar Speech: Generated in ${synthesisTime}ms with ${emotionalTags.join(', ')} emotions`);

      return {
        ...ttsResponse,
        avatarProfile: profile,
        emotionalTags,
        synthesisTime,
        llamaModel: profile.llamaModel
      };

    } catch (error) {
      console.error('❌ Avatar TTS Error:', error);
      throw new Error(`Avatar speech generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 🎵 Stream avatar speech for real-time playback
   */
  public async *streamAvatarSpeech(
    request: AvatarSpeechRequest
  ): AsyncGenerator<Uint8Array, AvatarSpeechResponse, unknown> {
    const profile = this.selectOptimalProfile(request);
    
    const ttsOptions: TTSOptions = {
      voice: profile.ttsVoice,
      model: 'tts-1-hd',
      speed: this.adjustSpeedForEmotion(profile.voiceSpeed, request.emotion || 'neutral'),
      format: 'mp3',
      quality: 'hd'
    };

    console.log(`🎵 Avatar Streaming: ${profile.name} for real-time playback`);

    const startTime = Date.now();
    let totalBytes = 0;

    try {
      for await (const chunk of this.ttsService.streamSpeech(request.text, ttsOptions)) {
        totalBytes += chunk.length;
        yield chunk;
      }

      const synthesisTime = Date.now() - startTime;
      const emotionalTags = this.analyzeEmotionalContent(request.text);

      return {
        audioUrl: '', // Will be constructed from stream
        metadata: {
          voice: profile.ttsVoice,
          model: 'tts-1-hd',
          format: 'mp3',
          speed: ttsOptions.speed || 1.0,
          textLength: request.text.length,
          estimatedDuration: (request.text.split(/\s+/).length / 150) * 60 / (ttsOptions.speed || 1.0)
        },
        avatarProfile: profile,
        emotionalTags,
        synthesisTime,
        llamaModel: profile.llamaModel
      };

    } catch (error) {
      console.error('❌ Avatar Streaming Error:', error);
      throw error;
    }
  }

  /**
   * 🧠 Generate Llama response and immediately convert to speech
   */
  public async generateAndSpeak(
    userMessage: string,
    systemPrompt?: string,
    avatarProfileId?: string
  ): Promise<{ textResponse: string; audioResponse: AvatarSpeechResponse }> {
    
    // Determine which model to use based on avatar profile
    const profile = avatarProfileId 
      ? AvatarTTSService.getAvatarProfile(avatarProfileId) || AvatarTTSService.AVATAR_PROFILES[0]
      : AvatarTTSService.AVATAR_PROFILES[0];

    console.log(`🧠➡️🎭 Full Pipeline: ${profile.llamaModel} → ${profile.name}`);

    try {
      // 1. Generate response from Llama model
      const llamaResponse = await this.callLlamaBackend(userMessage, profile.llamaModel, systemPrompt);
      
      // 2. Convert response to speech
      const speechRequest: AvatarSpeechRequest = {
        text: llamaResponse,
        context: userMessage,
        avatarProfile: profile.id,
        emotion: this.detectEmotionFromText(llamaResponse)
      };

      const audioResponse = await this.generateAvatarSpeech(speechRequest);

      return {
        textResponse: llamaResponse,
        audioResponse
      };

    } catch (error) {
      console.error('❌ Full Pipeline Error:', error);
      throw error;
    }
  }

  /**
   * Select optimal avatar profile based on request context
   */
  private selectOptimalProfile(request: AvatarSpeechRequest): AvatarVoiceProfile {
    // If specific profile requested, use it
    if (request.avatarProfile) {
      const profile = AvatarTTSService.getAvatarProfile(request.avatarProfile);
      if (profile) return profile;
    }

    // Auto-select based on content analysis
    const text = request.text.toLowerCase();
    
    // Check for business/technical content
    if (text.includes('analysis') || text.includes('business') || text.includes('technical') || 
        text.includes('data') || text.includes('strategy')) {
      return AvatarTTSService.AVATAR_PROFILES.find((p: AvatarVoiceProfile) => p.id === 'scout-professional') || AvatarTTSService.AVATAR_PROFILES[0];
    }
    
    // Check for storytelling content
    if (text.includes('story') || text.includes('imagine') || text.includes('once upon') ||
        text.includes('narrative') || text.includes('chapter')) {
      return AvatarTTSService.AVATAR_PROFILES.find((p: AvatarVoiceProfile) => p.id === 'scout-storyteller') || AvatarTTSService.AVATAR_PROFILES[0];
    }
    
    // Default to friendly Scout
    return AvatarTTSService.AVATAR_PROFILES.find((p: AvatarVoiceProfile) => p.id === 'scout-friendly') || AvatarTTSService.AVATAR_PROFILES[0];
  }

  /**
   * Adjust voice speed based on emotional context
   */
  private adjustSpeedForEmotion(baseSpeed: number, emotion: string): number {
    const speedModifiers = {
      'excited': 1.1,
      'calm': 0.9,
      'professional': 0.95,
      'friendly': 1.0,
      'authoritative': 0.9,
      'neutral': 1.0
    };

    return baseSpeed * (speedModifiers[emotion as keyof typeof speedModifiers] || 1.0);
  }

  /**
   * Analyze text for emotional content
   */
  private analyzeEmotionalContent(text: string): string[] {
    const emotions: string[] = [];
    const lowercaseText = text.toLowerCase();

    if (lowercaseText.includes('excited') || lowercaseText.includes('!')) emotions.push('excited');
    if (lowercaseText.includes('calm') || lowercaseText.includes('peaceful')) emotions.push('calm');
    if (lowercaseText.includes('professional') || lowercaseText.includes('business')) emotions.push('professional');
    if (lowercaseText.includes('friendly') || lowercaseText.includes('welcome')) emotions.push('friendly');
    if (lowercaseText.includes('important') || lowercaseText.includes('must')) emotions.push('authoritative');
    
    return emotions.length > 0 ? emotions : ['neutral'];
  }

  /**
   * Detect emotion from generated text
   */
  private detectEmotionFromText(text: string): AvatarSpeechRequest['emotion'] {
    const lowercaseText = text.toLowerCase();
    
    if (lowercaseText.includes('exciting') || text.includes('!')) return 'excited';
    if (lowercaseText.includes('analysis') || lowercaseText.includes('data')) return 'professional';
    if (lowercaseText.includes('welcome') || lowercaseText.includes('help')) return 'friendly';
    if (lowercaseText.includes('important') || lowercaseText.includes('critical')) return 'authoritative';
    if (lowercaseText.includes('peaceful') || lowercaseText.includes('slow')) return 'calm';
    
    return 'neutral';
  }

  /**
   * Call the Llama backend service
   */
  private async callLlamaBackend(message: string, modelId: string, systemPrompt?: string): Promise<string> {
    const messages = [];
    
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: message });

    const response = await fetch(`${this.llamaBackendUrl}/api/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        model: modelId,
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`Llama backend error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }
}

// Export convenience function
export const createAvatarTTSService = (openaiApiKey: string, llamaBackendUrl?: string) => 
  new AvatarTTSService(openaiApiKey, llamaBackendUrl); 