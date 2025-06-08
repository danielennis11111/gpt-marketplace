/**
 * 🎮 Character Manager - AI Character System Controller
 * 
 * Manages the complete AI character ecosystem with knowledge, behavior, persona, and abilities.
 * Treats each AI like a video game character with distinct capabilities and personalities.
 */

import { 
  AICharacter, 
  CharacterManager as ICharacterManager,
  CharacterInteraction,
  CharacterResponse,
  Citation,
  InteractionContext
} from '../types/character';
import { incantationEngine } from './IncantationEngine';
import { EnhancedRAGProcessor } from '../utils/enhancedRAG';
import { personas } from '../data/coreExperiences';

export class CharacterManager implements ICharacterManager {
  public characters: Map<string, AICharacter> = new Map();
  public activeCharacter: string | null = null;
  private ragProcessor: EnhancedRAGProcessor;
  private contextMemory: Map<string, any> = new Map();

  constructor() {
    this.ragProcessor = new EnhancedRAGProcessor();
    this.initializeDefaultCharacters();
  }

  private initializeDefaultCharacters() {
    // Create Michael Crow character
    const michaelCrow: AICharacter = {
      id: 'michael-crow',
      knowledge: {
        domain: ['Institutional Design', 'Educational Innovation', 'Leadership Strategy', 'Social Impact'],
        ragSources: ['asu-documents', 'education-policy', 'leadership-philosophy'],
        contextMemory: {
          conversationHistory: true,
          learnedPatterns: true,
          userPreferences: true,
          projectContext: true
        },
        updateMechanisms: [
          { type: 'rag', frequency: 'continuous', source: 'uploaded-documents' },
          { type: 'learning', frequency: 'session', source: 'conversation-patterns' }
        ]
      },
      persona: {
        ...personas.michaelCrow,
        personality: {
          warmth: 0.8,      // Very warm and approachable
          energy: 0.7,      // High energy but thoughtful
          precision: 0.6,   // Precise but not rigid
          creativity: 0.8,  // Highly creative thinker
          authority: 0.9    // Strong authoritative presence
        }
      },
      behavior: {
        tone: {
          primary: 'inspiring',
          secondary: ['thoughtful', 'visionary'],
          contextualVariation: true
        },
        approach: {
          methodology: 'stream-of-consciousness',
          thinkingStyle: 'systematic',
          problemSolving: 'strategic'
        },
        pacing: {
          responseLength: 'adaptive',
          informationDensity: 'moderate',
          interactionRhythm: 'conversational'
        },
        adaptation: {
          userExperienceLevel: true,
          preferredDetail: true,
          conversationContext: true,
          emotionalState: true
        },
        responsePatterns: []
      },
      abilities: {
        core: [
          {
            name: 'Strategic Visioning',
            description: 'Ability to see long-term institutional possibilities',
            category: 'reasoning',
            proficiency: 0.95,
            availability: 'always'
          }
        ],
        tools: [
          {
            name: 'Voice Synthesis',
            type: 'voice',
            description: 'Text-to-speech with presidential voice',
            requirements: ['OpenAI TTS API'],
            enabled: true
          }
        ],
        integrations: [
          {
            name: 'GPT-4o Chat',
            service: 'openai',
            endpoints: ['/chat/completions'],
            fallback: 'gemini-2.0-flash'
          }
        ],
        limitations: []
      },
      incantations: incantationEngine.exportLibrary(),
      defaultModel: 'gpt-4o',
      fallbackModels: ['gpt-4o-mini', 'gemini-2.0-flash'],
      contextLength: 128000,
      parameters: {
        temperature: 0.7,
        maxTokens: 6000,
        topP: 0.9,
        frequencyPenalty: 0.1,
        presencePenalty: 0.2
      },
      features: {
        ragEnabled: true,
        voiceEnabled: true,
        visionEnabled: true,
        terminalAccess: false,
        modelSwitching: true,
        contextOptimization: true,
        streamingEnabled: true,
        toolCalling: true,
        multimodal: true
      },
      version: '1.0.0',
      created: new Date(),
      updated: new Date(),
      author: 'ASU GPT Team'
    };

    this.characters.set('michael-crow', michaelCrow);
    this.activeCharacter = 'michael-crow';
  }

  // Core operations
  loadCharacter(id: string): AICharacter | null {
    return this.characters.get(id) || null;
  }

  switchCharacter(id: string): boolean {
    if (this.characters.has(id)) {
      this.activeCharacter = id;
      return true;
    }
    return false;
  }

  createCharacter(definition: Partial<AICharacter>): AICharacter {
    const id = definition.id || `character-${Date.now()}`;
    
    const character: AICharacter = {
      id,
      knowledge: definition.knowledge || {
        domain: [],
        ragSources: [],
        contextMemory: {
          conversationHistory: true,
          learnedPatterns: false,
          userPreferences: false,
          projectContext: false
        },
        updateMechanisms: []
      },
      persona: definition.persona || {
        name: 'AI Assistant',
        title: 'General Assistant',
        photo: '',
        voice: 'alloy',
        background: 'General AI assistant',
        philosophy: 'Help users achieve their goals',
        expertise: [],
        communicationStyle: 'Helpful and informative',
        personality: {
          warmth: 0.5,
          energy: 0.5,
          precision: 0.5,
          creativity: 0.5,
          authority: 0.5
        }
      },
      behavior: definition.behavior || {
        tone: {
          primary: 'conversational',
          secondary: [],
          contextualVariation: false
        },
        approach: {
          methodology: 'structured-analysis',
          thinkingStyle: 'analytical',
          problemSolving: 'methodical'
        },
        pacing: {
          responseLength: 'moderate',
          informationDensity: 'moderate',
          interactionRhythm: 'responsive'
        },
        adaptation: {
          userExperienceLevel: false,
          preferredDetail: false,
          conversationContext: false,
          emotionalState: false
        },
        responsePatterns: []
      },
      abilities: definition.abilities || {
        core: [],
        tools: [],
        integrations: [],
        limitations: []
      },
      incantations: definition.incantations || incantationEngine.exportLibrary(),
      defaultModel: definition.defaultModel || 'gpt-4o',
      fallbackModels: definition.fallbackModels || ['gpt-4o-mini'],
      contextLength: definition.contextLength || 128000,
      parameters: definition.parameters || {
        temperature: 0.7,
        maxTokens: 4000,
        topP: 0.9,
        frequencyPenalty: 0.0,
        presencePenalty: 0.0
      },
      features: definition.features || {
        ragEnabled: false,
        voiceEnabled: false,
        visionEnabled: false,
        terminalAccess: false,
        modelSwitching: false,
        contextOptimization: false,
        streamingEnabled: true,
        toolCalling: false,
        multimodal: false
      },
      version: '1.0.0',
      created: new Date(),
      updated: new Date(),
      author: 'User'
    };

    this.characters.set(id, character);
    return character;
  }

  updateCharacter(id: string, updates: Partial<AICharacter>): boolean {
    const character = this.characters.get(id);
    if (!character) return false;

    const updatedCharacter = { ...character, ...updates, updated: new Date() };
    this.characters.set(id, updatedCharacter);
    return true;
  }

  // Ability routing
  checkAbility(characterId: string, ability: string): boolean {
    const character = this.loadCharacter(characterId);
    if (!character) return false;

    return character.abilities.core.some(a => a.name === ability) ||
           character.abilities.tools.some(a => a.name === ability && a.enabled);
  }

  getAvailableAbilities(characterId: string): string[] {
    const character = this.loadCharacter(characterId);
    if (!character) return [];

    const coreAbilities = character.abilities.core.map(a => a.name);
    const enabledTools = character.abilities.tools.filter(t => t.enabled).map(t => t.name);
    
    return [...coreAbilities, ...enabledTools];
  }

  // Context management
  updateContext(characterId: string, context: any): void {
    this.contextMemory.set(characterId, context);
  }

  getCharacterContext(characterId: string): any {
    return this.contextMemory.get(characterId) || {};
  }

  // Generate character response
  async generateResponse(interaction: CharacterInteraction): Promise<CharacterResponse> {
    const character = this.loadCharacter(interaction.characterId);
    if (!character) {
      throw new Error(`Character ${interaction.characterId} not found`);
    }

    const startTime = Date.now();
    
    // Determine context and recommended patterns
    const context = this.analyzeQueryContext(interaction.query);
    const recommendedPatterns = incantationEngine.recommendPatterns(context, interaction.query);
    
    // Enhance system prompt with character behavior and incantations
    const enhancedPrompt = this.buildEnhancedPrompt(character, interaction, recommendedPatterns);
    
    // Process RAG if enabled
    const ragResults = character.features.ragEnabled ? 
      await this.processRAG(interaction.query, interaction.context) : [];
    
    // Generate response (this would integrate with your AI service)
    const response = await this.callAIService(character, enhancedPrompt, interaction);
    
    const endTime = Date.now();
    
    return {
      characterId: interaction.characterId,
      content: response.content,
      usedAbilities: this.detectUsedAbilities(character, interaction.query),
      citations: ragResults.map(r => ({
        source: r.document.name,
        type: 'rag' as const,
        content: r.chunk.content,
        relevance: r.relevanceScore,
        url: undefined
      })),
      metadata: {
        modelUsed: character.defaultModel,
        tokensUsed: response.tokensUsed || 0,
        responseTime: endTime - startTime,
        abilityPerformance: {},
        confidence: 0.8
      }
    };
  }

  private analyzeQueryContext(query: string): string {
    const q = query.toLowerCase();
    
    if (q.includes('debug') || q.includes('error') || q.includes('bug')) return 'code-debugging';
    if (q.includes('plan') || q.includes('strategy') || q.includes('roadmap')) return 'project-planning';
    if (q.includes('creative') || q.includes('brainstorm') || q.includes('idea')) return 'creative-brainstorming';
    if (q.includes('explain') || q.includes('learn') || q.includes('understand')) return 'learning-conversation';
    if (q.includes('code') || q.includes('technical') || q.includes('architecture')) return 'technical-explanation';
    
    return 'general-conversation';
  }

  private buildEnhancedPrompt(
    character: AICharacter, 
    interaction: CharacterInteraction, 
    patterns: string[]
  ): string {
    let prompt = `You are ${character.persona.name}, ${character.persona.title}.\n\n`;
    prompt += `Background: ${character.persona.background}\n\n`;
    prompt += `Philosophy: ${character.persona.philosophy}\n\n`;
    prompt += `Communication Style: ${character.persona.communicationStyle}\n\n`;
    
    // Add behavior instructions
    prompt += `## Behavior Guidelines\n`;
    prompt += `- Tone: ${character.behavior.tone.primary}\n`;
    prompt += `- Approach: ${character.behavior.approach.methodology}\n`;
    prompt += `- Response Length: ${character.behavior.pacing.responseLength}\n\n`;
    
    // Add recommended incantation patterns
    if (patterns.length > 0) {
      const variables = this.extractVariablesFromQuery(interaction.query);
      prompt = incantationEngine.enhancePrompt(prompt, patterns, variables);
    }
    
    return prompt;
  }

  private extractVariablesFromQuery(query: string): Record<string, string> {
    // Simple variable extraction - could be enhanced with NLP
    return {
      topic: query,
      current_thought: 'analyzing the request',
      next_thought: 'considering the best approach'
    };
  }

  private async processRAG(query: string, context: InteractionContext): Promise<any[]> {
    try {
      return this.ragProcessor.searchDocuments({
        query,
        maxResults: 5,
        minRelevanceScore: 0.1,
        documentTypes: undefined
      });
    } catch (error) {
      console.error('RAG processing failed:', error);
      return [];
    }
  }

  private detectUsedAbilities(character: AICharacter, query: string): string[] {
    const abilities: string[] = [];
    const q = query.toLowerCase();
    
    character.abilities.core.forEach(ability => {
      if (ability.category === 'technical' && (q.includes('code') || q.includes('debug'))) {
        abilities.push(ability.name);
      }
      if (ability.category === 'reasoning' && (q.includes('plan') || q.includes('analyze'))) {
        abilities.push(ability.name);
      }
      if (ability.category === 'creative' && (q.includes('creative') || q.includes('idea'))) {
        abilities.push(ability.name);
      }
    });
    
    return abilities;
  }

  private async callAIService(character: AICharacter, prompt: string, interaction: CharacterInteraction): Promise<any> {
    // This would integrate with your actual AI service
    // For now, return a mock response
    return {
      content: `[${character.persona.name} would respond here with enhanced prompting and character behavior]`,
      tokensUsed: 150
    };
  }

  // Utility methods
  getAllCharacters(): AICharacter[] {
    return Array.from(this.characters.values());
  }

  getActiveCharacter(): AICharacter | null {
    return this.activeCharacter ? this.loadCharacter(this.activeCharacter) : null;
  }
}

// Singleton instance
export const characterManager = new CharacterManager(); 