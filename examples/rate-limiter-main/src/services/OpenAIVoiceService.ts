import OpenAI from 'openai';

export interface VoiceConfig {
  apiKey: string;
}

export type OpenAIVoice = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';

export interface VoiceSettings {
  voice: OpenAIVoice;
  speed: number; // 0.25 to 4.0
  model: 'tts-1' | 'tts-1-hd';
}

/**
 * 🎙️ OpenAI Voice Service
 * 
 * Provides magical, natural-sounding text-to-speech using OpenAI's advanced TTS models.
 * Creates delightful user experiences that showcase the incredible potential of AI.
 */
export class OpenAIVoiceService {
  private openai: OpenAI;
  private defaultSettings: VoiceSettings = {
    voice: 'nova', // Warm, engaging voice perfect for education
    speed: 1.0,
    model: 'tts-1-hd' // High-definition quality
  };

  // Voice persona mapping for ASU digital twins
  private personaVoices: Record<string, OpenAIVoice> = {
    'Michael Crow': 'onyx',        // Deep, authoritative voice for university president
    'Elizabeth Reilley': 'nova',   // Warm, innovative voice for AI acceleration leader
    'Zohair Zaidi': 'echo',        // Clear, technical voice for engineering expertise
    'Jennifer Werner': 'shimmer',  // Engaging, educational voice for learning strategist
    'default': 'alloy'             // Balanced, friendly voice for general use
  };

  constructor(config: VoiceConfig) {
    this.openai = new OpenAI({
      apiKey: config.apiKey,
      dangerouslyAllowBrowser: true
    });
  }

  /**
   * 🎵 Generate speech from text with magic and delight
   */
  async generateSpeech(
    text: string, 
    persona?: string,
    customSettings?: Partial<VoiceSettings>
  ): Promise<ArrayBuffer> {
    try {
      // Select voice based on persona or use custom settings
      const voice = customSettings?.voice || 
                   (persona ? this.personaVoices[persona] : undefined) ||
                   this.defaultSettings.voice;

      const settings = {
        ...this.defaultSettings,
        ...customSettings,
        voice
      };

      console.log(`🎙️ OpenAI TTS: Generating speech with ${voice} voice...`);

      // Clean text for better speech synthesis
      const cleanText = this.cleanTextForSpeech(text);

      const response = await this.openai.audio.speech.create({
        model: settings.model,
        voice: settings.voice,
        input: cleanText,
        speed: settings.speed,
        response_format: 'mp3'
      });

      const audioBuffer = await response.arrayBuffer();
      
      console.log(`✅ OpenAI TTS: Generated ${audioBuffer.byteLength} bytes of audio`);
      
      return audioBuffer;

    } catch (error: any) {
      console.error('❌ OpenAI TTS Error:', error);
      
      if (error?.status === 401) {
        throw new Error('OpenAI API key is invalid for Text-to-Speech');
      } else if (error?.status === 429) {
        throw new Error('OpenAI TTS rate limit exceeded. Please try again later.');
      } else if (error?.status === 400) {
        throw new Error('Invalid text provided for speech synthesis');
      } else {
        throw new Error(`OpenAI TTS error: ${error?.message || 'Unknown error'}`);
      }
    }
  }

  /**
   * 🎭 Play speech audio with magical user experience
   */
  async playText(
    text: string, 
    persona?: string,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    try {
      onStart?.();

      const audioBuffer = await this.generateSpeech(text, persona);
      
      // Create blob and URL for playback
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Create and configure audio element
      const audio = new Audio(audioUrl);
      audio.preload = 'auto';
      
      // Add magical audio experience
      return new Promise((resolve, reject) => {
        audio.oncanplaythrough = () => {
          console.log('🎵 OpenAI Voice: Audio ready to play');
          audio.play().catch(reject);
        };
        
        audio.onended = () => {
          console.log('✅ OpenAI Voice: Playback completed');
          URL.revokeObjectURL(audioUrl); // Clean up memory
          onEnd?.();
          resolve();
        };
        
        audio.onerror = (event) => {
          console.error('❌ Audio playback error:', event);
          URL.revokeObjectURL(audioUrl);
          const error = new Error('Audio playback failed');
          onError?.(error);
          reject(error);
        };
        
        audio.onloadstart = () => {
          console.log('🔄 OpenAI Voice: Loading audio...');
        };
      });

    } catch (error) {
      console.error('❌ OpenAI Voice Service Error:', error);
      const errorObj = error instanceof Error ? error : new Error('Speech generation failed');
      onError?.(errorObj);
      throw errorObj;
    }
  }

  /**
   * 🧹 Clean text for optimal speech synthesis
   */
  private cleanTextForSpeech(text: string): string {
    return text
      // Remove markdown formatting
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1')     // Remove italic
      .replace(/`(.*?)`/g, '$1')       // Remove code formatting
      .replace(/#{1,6}\s/g, '')        // Remove heading markers
      .replace(/>\s/g, '')             // Remove blockquote markers
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Convert links to just text
      .replace(/\n\s*\n/g, '. ')       // Convert double newlines to periods
      .replace(/\n/g, ' ')             // Convert single newlines to spaces
      .replace(/\s+/g, ' ')            // Collapse multiple spaces
      .trim();
  }

  /**
   * 🎨 Get available voices with descriptions
   */
  getAvailableVoices(): Array<{
    id: OpenAIVoice;
    name: string;
    description: string;
    personality: string;
    bestFor: string[];
  }> {
    return [
      {
        id: 'alloy',
        name: 'Alloy',
        description: 'Balanced and versatile voice',
        personality: 'Professional and approachable',
        bestFor: ['General conversation', 'Business communication', 'Tutorials']
      },
      {
        id: 'echo',
        name: 'Echo',
        description: 'Clear and articulate voice',
        personality: 'Technical and precise',
        bestFor: ['Technical explanations', 'Code reviews', 'Engineering content']
      },
      {
        id: 'fable',
        name: 'Fable',
        description: 'Expressive and engaging voice',
        personality: 'Creative and storytelling',
        bestFor: ['Creative writing', 'Stories', 'Entertainment content']
      },
      {
        id: 'onyx',
        name: 'Onyx',
        description: 'Deep and authoritative voice',
        personality: 'Leadership and gravitas',
        bestFor: ['Presentations', 'Leadership content', 'Formal announcements']
      },
      {
        id: 'nova',
        name: 'Nova',
        description: 'Warm and innovative voice',
        personality: 'Inspiring and forward-thinking',
        bestFor: ['Innovation discussions', 'AI content', 'Motivational content']
      },
      {
        id: 'shimmer',
        name: 'Shimmer',
        description: 'Bright and educational voice',
        personality: 'Enthusiastic and teaching-focused',
        bestFor: ['Educational content', 'Learning materials', 'Student engagement']
      }
    ];
  }

  /**
   * 🎯 Get persona-specific voice information
   */
  getPersonaVoice(persona: string): {
    voice: OpenAIVoice;
    description: string;
    rationale: string;
  } {
    const voice = this.personaVoices[persona] || this.personaVoices.default;
    const voiceInfo = this.getAvailableVoices().find(v => v.id === voice);
    
    const rationales: Record<string, string> = {
      'Michael Crow': 'Deep, authoritative voice that reflects university leadership and vision',
      'Elizabeth Reilley': 'Warm, innovative voice perfect for AI acceleration and future-thinking',
      'Zohair Zaidi': 'Clear, technical voice ideal for engineering expertise and precise communication',
      'Jennifer Werner': 'Engaging, educational voice that enhances learning and student connection',
      'default': 'Balanced, friendly voice suitable for general AI assistance'
    };

    return {
      voice,
      description: voiceInfo?.description || 'Versatile AI voice',
      rationale: rationales[persona] || rationales.default
    };
  }

  /**
   * 🧪 Test voice connection and capabilities
   */
  async testVoiceConnection(): Promise<boolean> {
    try {
      const testText = 'Hello from ASU GPT! This is a test of our magical voice capabilities.';
      await this.generateSpeech(testText, undefined, { 
        voice: 'alloy', 
        speed: 1.0, 
        model: 'tts-1' 
      });
      return true;
    } catch (error) {
      console.error('OpenAI Voice connection test failed:', error);
      return false;
    }
  }

  /**
   * 🎼 Generate voice preview for persona selection
   */
  async generatePersonaPreview(persona: string): Promise<ArrayBuffer> {
    const messages = {
      'Michael Crow': 'Welcome to Arizona State University, where innovation meets education. As your AI assistant, I\'m here to help you achieve extraordinary things.',
      'Elizabeth Reilley': 'Hello! I\'m excited to explore the incredible potential of AI with you. Let\'s discover how artificial intelligence can accelerate your learning and creativity.',
      'Zohair Zaidi': 'Greetings! Ready to dive into some technical problem-solving? I\'m here to help you build, debug, and optimize your projects with precision.',
      'Jennifer Werner': 'Hi there! I\'m delighted to be your learning strategist. Together, we\'ll create personalized approaches that make education both effective and enjoyable.',
      'default': 'Hello! I\'m your AI assistant, ready to help you explore the amazing possibilities of artificial intelligence.'
    };

    const previewText = messages[persona as keyof typeof messages] || messages.default;
    return this.generateSpeech(previewText, persona);
  }
} 