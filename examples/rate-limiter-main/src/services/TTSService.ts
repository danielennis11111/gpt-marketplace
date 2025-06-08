export interface TTSVoice {
  id: string;
  name: string;
  description: string;
  gender: 'male' | 'female' | 'neutral';
  accent: string;
}

export interface TTSOptions {
  voice?: string;
  model?: 'tts-1' | 'tts-1-hd';
  speed?: number; // 0.25 to 4.0
  format?: 'mp3' | 'opus' | 'aac' | 'flac' | 'wav' | 'pcm';
  quality?: 'standard' | 'hd';
}

export interface TTSResponse {
  audioUrl: string;
  audioBlob?: Blob;
  metadata: {
    voice: string;
    model: string;
    format: string;
    speed: number;
    textLength: number;
    estimatedDuration: number; // in seconds
  };
}

export class TTSService {
  private apiKey: string;
  private baseUrl: string;

  // 🎵 Available OpenAI voices with detailed descriptions
  private static readonly VOICES: TTSVoice[] = [
    {
      id: 'alloy',
      name: 'Alloy',
      description: 'Neutral, versatile voice suitable for most content',
      gender: 'neutral',
      accent: 'American'
    },
    {
      id: 'echo',
      name: 'Echo',
      description: 'Male voice with clear, professional tone',
      gender: 'male',
      accent: 'American'
    },
    {
      id: 'fable',
      name: 'Fable',
      description: 'Warm, storytelling voice perfect for narratives',
      gender: 'female',
      accent: 'British'
    },
    {
      id: 'onyx',
      name: 'Onyx',
      description: 'Deep, authoritative male voice',
      gender: 'male',
      accent: 'American'
    },
    {
      id: 'nova',
      name: 'Nova',
      description: 'Young, energetic female voice',
      gender: 'female',
      accent: 'American'
    },
    {
      id: 'shimmer',
      name: 'Shimmer',
      description: 'Soft, gentle female voice',
      gender: 'female',
      accent: 'American'
    }
  ];

  constructor(apiKey: string, baseUrl: string = 'https://api.openai.com/v1') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  /**
   * Get all available TTS voices
   */
  public static getAvailableVoices(): TTSVoice[] {
    return [...this.VOICES];
  }

  /**
   * Get voice information by ID
   */
  public static getVoiceById(voiceId: string): TTSVoice | undefined {
    return this.VOICES.find(voice => voice.id === voiceId);
  }

  /**
   * 🔊 Generate speech from text using OpenAI TTS
   */
  public async generateSpeech(
    text: string,
    options: TTSOptions = {}
  ): Promise<TTSResponse> {
    const {
      voice = 'alloy',
      model = 'tts-1',
      speed = 1.0,
      format = 'mp3',
      quality = 'standard'
    } = options;

    // Validate inputs
    this.validateTTSInputs(text, voice, model, speed);

    console.log(`🎵 TTS: Generating speech with ${model} voice "${voice}"`);

    try {
      const response = await fetch(`${this.baseUrl}/audio/speech`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: quality === 'hd' ? 'tts-1-hd' : model,
          input: text,
          voice: voice,
          response_format: format,
          speed: speed
        })
      });

      if (!response.ok) {
        throw new Error(`TTS API error: ${response.status} ${response.statusText}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Estimate duration (rough calculation: ~150 words per minute)
      const wordCount = text.split(/\s+/).length;
      const estimatedDuration = (wordCount / 150) * 60 / speed;

      console.log(`✅ TTS: Generated ${(audioBlob.size / 1024).toFixed(1)}KB audio file`);

      return {
        audioUrl,
        audioBlob,
        metadata: {
          voice,
          model: quality === 'hd' ? 'tts-1-hd' : model,
          format,
          speed,
          textLength: text.length,
          estimatedDuration
        }
      };

    } catch (error: any) {
      console.error('❌ TTS Error:', error);
      throw this.handleTTSError(error);
    }
  }

  /**
   * 🎵 Stream speech generation (for real-time playback)
   */
  public async *streamSpeech(
    text: string,
    options: TTSOptions = {}
  ): AsyncGenerator<Uint8Array, void, unknown> {
    const {
      voice = 'alloy',
      model = 'tts-1',
      speed = 1.0,
      format = 'mp3',
      quality = 'standard'
    } = options;

    this.validateTTSInputs(text, voice, model, speed);

    console.log(`🎵 TTS Streaming: Starting with ${model} voice "${voice}"`);

    try {
      const response = await fetch(`${this.baseUrl}/audio/speech`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: quality === 'hd' ? 'tts-1-hd' : model,
          input: text,
          voice: voice,
          response_format: format,
          speed: speed
        })
      });

      if (!response.ok) {
        throw new Error(`TTS streaming error: ${response.status} ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          yield value;
        }
      } finally {
        reader.releaseLock();
      }

      console.log(`✅ TTS Streaming: Completed`);

    } catch (error: any) {
      console.error('❌ TTS Streaming Error:', error);
      throw this.handleTTSError(error);
    }
  }

  /**
   * 🎯 Convert chat response to speech in real-time
   */
  public async generateChatSpeech(
    chatResponse: string,
    voicePreference?: string
  ): Promise<TTSResponse> {
    // Choose appropriate voice based on content type
    const voice = voicePreference || this.selectVoiceForContent(chatResponse);

    // Use high-quality model for important responses
    const model = chatResponse.length > 500 ? 'tts-1-hd' : 'tts-1';

    return this.generateSpeech(chatResponse, {
      voice,
      model,
      speed: 1.0,
      format: 'mp3'
    });
  }

  /**
   * 🎭 Intelligently select voice based on content
   */
  private selectVoiceForContent(text: string): string {
    const lowerText = text.toLowerCase();

    // Technical/professional content
    if (lowerText.includes('code') || lowerText.includes('technical') || 
        lowerText.includes('programming') || lowerText.includes('algorithm')) {
      return 'echo'; // Professional male voice
    }

    // Storytelling/narrative content
    if (lowerText.includes('story') || lowerText.includes('narrative') || 
        lowerText.includes('once upon') || lowerText.includes('imagine')) {
      return 'fable'; // Warm storytelling voice
    }

    // Authoritative/formal content
    if (lowerText.includes('important') || lowerText.includes('warning') || 
        lowerText.includes('critical') || lowerText.includes('attention')) {
      return 'onyx'; // Deep, authoritative voice
    }

    // Friendly/casual content
    if (lowerText.includes('hello') || lowerText.includes('welcome') || 
        lowerText.includes('thanks') || lowerText.includes('help')) {
      return 'nova'; // Energetic, friendly voice
    }

    // Default to neutral voice
    return 'alloy';
  }

  /**
   * Validate TTS inputs
   */
  private validateTTSInputs(
    text: string,
    voice: string,
    model: string,
    speed: number
  ): void {
    if (!text || text.trim().length === 0) {
      throw new Error('Text input cannot be empty');
    }

    if (text.length > 4096) {
      throw new Error('Text input cannot exceed 4096 characters');
    }

    if (!TTSService.VOICES.find((v: TTSVoice) => v.id === voice)) {
      throw new Error(`Invalid voice: ${voice}. Available voices: ${TTSService.VOICES.map((v: TTSVoice) => v.id).join(', ')}`);
    }

    if (!['tts-1', 'tts-1-hd'].includes(model)) {
      throw new Error('Invalid model. Use "tts-1" or "tts-1-hd"');
    }

    if (speed < 0.25 || speed > 4.0) {
      throw new Error('Speed must be between 0.25 and 4.0');
    }
  }

  /**
   * Handle TTS-specific errors
   */
  private handleTTSError(error: any): Error {
    if (error.status === 429) {
      return new Error('RATE_LIMITED:tts:Too many TTS requests. Please try again later.');
    } else if (error.status === 400) {
      return new Error('Invalid TTS request parameters');
    } else if (error.status === 401) {
      return new Error('Invalid API key for TTS service');
    } else if (error.status === 413) {
      return new Error('Text input too long for TTS (max 4096 characters)');
    } else {
      return new Error(`TTS service error: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * 🎧 Play generated audio
   */
  public static async playAudio(audioUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio(audioUrl);
      
      audio.onended = () => resolve();
      audio.onerror = () => reject(new Error('Failed to play audio'));
      
      audio.play().catch(reject);
    });
  }

  /**
   * 💾 Download generated audio
   */
  public static downloadAudio(audioUrl: string, filename: string = 'speech.mp3'): void {
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * 🧹 Clean up audio URLs
   */
  public static revokeAudioUrl(audioUrl: string): void {
    URL.revokeObjectURL(audioUrl);
  }
}

// Export default instance creator
export const createTTSService = (apiKey: string) => new TTSService(apiKey); 