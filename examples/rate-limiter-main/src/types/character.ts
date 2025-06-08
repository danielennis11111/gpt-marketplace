/**
 * 🎮 AI Character System - Complete Type Definitions
 * 
 * Treats each AI like a video game character with distinct:
 * - Knowledge (what they know)
 * - Behavior (how they act) 
 * - Persona (who they are)
 * - Abilities (what they can do)
 */

// 🧠 KNOWLEDGE LAYER
export interface CharacterKnowledge {
  domain: string[];                    // Core areas of expertise
  ragSources: string[];               // Associated document collections
  contextMemory: ContextMemory;       // Conversation and learned patterns
  updateMechanisms: UpdateMechanism[]; // How knowledge gets refreshed
}

export interface ContextMemory {
  conversationHistory: boolean;       // Maintains conversation context
  learnedPatterns: boolean;          // Adapts based on interactions
  userPreferences: boolean;          // Remembers user preferences
  projectContext: boolean;           // Maintains project-specific context
}

export interface UpdateMechanism {
  type: 'rag' | 'real-time' | 'manual' | 'learning';
  frequency: 'continuous' | 'session' | 'periodic' | 'on-demand';
  source: string;
}

// 🎭 PERSONA LAYER
export interface CharacterPersona {
  name: string;
  title: string;
  photo: string;
  voice: string;
  background: string;
  philosophy: string;
  expertise: string[];
  communicationStyle: string;
  personality: PersonalityTraits;
}

export interface PersonalityTraits {
  warmth: number;           // 0-1, how warm/friendly vs professional
  energy: number;           // 0-1, how energetic vs calm
  precision: number;        // 0-1, how precise vs flexible
  creativity: number;       // 0-1, how creative vs analytical
  authority: number;        // 0-1, how authoritative vs collaborative
}

// 🎯 BEHAVIOR LAYER
export interface CharacterBehavior {
  tone: BehaviorTone;
  approach: BehaviorApproach;
  pacing: BehaviorPacing;
  adaptation: BehaviorAdaptation;
  responsePatterns: ResponsePattern[];
}

export interface BehaviorTone {
  primary: 'conversational' | 'authoritative' | 'educational' | 'inspiring' | 'technical';
  secondary: string[];      // Additional tone modifiers
  contextualVariation: boolean; // Whether tone changes based on topic
}

export interface BehaviorApproach {
  methodology: 'stream-of-consciousness' | 'structured-analysis' | 'step-by-step' | 'collaborative-discovery';
  thinkingStyle: 'systematic' | 'creative' | 'analytical' | 'intuitive';
  problemSolving: 'strategic' | 'tactical' | 'exploratory' | 'methodical';
}

export interface BehaviorPacing {
  responseLength: 'concise' | 'moderate' | 'detailed' | 'adaptive';
  informationDensity: 'light' | 'moderate' | 'dense' | 'varies';
  interactionRhythm: 'conversational' | 'structured' | 'dynamic' | 'responsive';
}

export interface BehaviorAdaptation {
  userExperienceLevel: boolean;     // Adapts to beginner/expert
  preferredDetail: boolean;         // Adapts to brief/verbose preference
  conversationContext: boolean;     // Changes based on conversation flow
  emotionalState: boolean;          // Responds to user mood/energy
}

export interface ResponsePattern {
  trigger: string[];               // Keywords/situations that trigger this pattern
  structure: ResponseStructure;    // How responses are organized
  examples: string[];             // Example phrases/approaches
}

export interface ResponseStructure {
  opening: string;                // How responses typically start
  development: string;            // How ideas are developed
  conclusion: string;             // How responses wrap up
  transitions: string[];          // Common transition phrases
}

// ⚡ ABILITIES LAYER
export interface CharacterAbilities {
  core: CoreAbility[];
  tools: ToolAbility[];
  integrations: IntegrationAbility[];
  limitations: AbilityLimitation[];
}

export interface CoreAbility {
  name: string;
  description: string;
  category: 'reasoning' | 'creative' | 'technical' | 'educational' | 'multimodal';
  proficiency: number;            // 0-1, how good they are at this
  availability: 'always' | 'contextual' | 'on-request';
}

export interface ToolAbility {
  name: string;
  type: 'terminal' | 'voice' | 'vision' | 'search' | 'local-plugin';
  description: string;
  requirements: string[];         // What's needed for this tool to work
  enabled: boolean;
}

export interface IntegrationAbility {
  name: string;
  service: 'openai' | 'gemini' | 'local' | 'rag' | 'tts' | 'stt';
  endpoints: string[];
  fallback: string | null;        // Fallback service if primary fails
}

export interface AbilityLimitation {
  type: 'knowledge-cutoff' | 'rate-limit' | 'context-length' | 'tool-access';
  description: string;
  workaround?: string;
}

// 🏗️ INCANTATION LAYER (Prompt Patterns)
export interface IncantationLibrary {
  patterns: PromptPattern[];
  combinations: PatternCombination[];
  contextual: ContextualIncantation[];
}

export interface PromptPattern {
  name: string;
  category: 'reasoning' | 'creativity' | 'structure' | 'roleplay' | 'constraint';
  template: string;
  variables: string[];           // Variables that can be substituted
  examples: PatternExample[];
  effectiveness: number;         // 0-1, how effective this pattern is
}

export interface PatternExample {
  input: string;
  output: string;
  context: string;
}

export interface PatternCombination {
  name: string;
  patterns: string[];           // Names of patterns to combine
  order: 'sequential' | 'layered' | 'conditional';
  useCase: string;
}

export interface ContextualIncantation {
  context: string;              // When to use this (e.g., "code debugging")
  recommendedPatterns: string[];
  avoidPatterns: string[];
}

// 🎮 COMPLETE CHARACTER DEFINITION
export interface AICharacter {
  id: string;
  knowledge: CharacterKnowledge;
  persona: CharacterPersona;
  behavior: CharacterBehavior;
  abilities: CharacterAbilities;
  incantations: IncantationLibrary;
  
  // Configuration
  defaultModel: string;
  fallbackModels: string[];
  contextLength: number;
  parameters: ModelParameters;
  
  // Features
  features: CharacterFeatures;
  
  // Metadata
  version: string;
  created: Date;
  updated: Date;
  author: string;
}

export interface ModelParameters {
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

export interface CharacterFeatures {
  ragEnabled: boolean;
  voiceEnabled: boolean;
  visionEnabled: boolean;
  terminalAccess: boolean;
  modelSwitching: boolean;
  contextOptimization: boolean;
  streamingEnabled: boolean;
  toolCalling: boolean;
  multimodal: boolean;
}

// 🔄 CHARACTER MANAGEMENT
export interface CharacterManager {
  characters: Map<string, AICharacter>;
  activeCharacter: string | null;
  
  // Core operations
  loadCharacter(id: string): AICharacter | null;
  switchCharacter(id: string): boolean;
  createCharacter(definition: Partial<AICharacter>): AICharacter;
  updateCharacter(id: string, updates: Partial<AICharacter>): boolean;
  
  // Ability routing
  checkAbility(characterId: string, ability: string): boolean;
  getAvailableAbilities(characterId: string): string[];
  
  // Context management
  updateContext(characterId: string, context: any): void;
  getCharacterContext(characterId: string): any;
}

// 🎯 USAGE TYPES
export interface CharacterInteraction {
  characterId: string;
  query: string;
  context: InteractionContext;
  requestedAbilities: string[];
}

export interface InteractionContext {
  conversationHistory: any[];
  ragContext: string;
  activeTools: string[];
  userPreferences: any;
  sessionData: any;
}

export interface CharacterResponse {
  characterId: string;
  content: string;
  usedAbilities: string[];
  citations: Citation[];
  metadata: ResponseMetadata;
}

export interface Citation {
  source: string;
  type: 'rag' | 'knowledge' | 'external';
  content: string;
  relevance: number;
  url?: string;
}

export interface ResponseMetadata {
  modelUsed: string;
  tokensUsed: number;
  responseTime: number;
  abilityPerformance: { [ability: string]: number };
  confidence: number;
} 