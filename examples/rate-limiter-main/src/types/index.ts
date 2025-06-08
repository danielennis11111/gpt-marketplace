export interface AIModel {
  id: string;
  name: string;
  description: string;
  status: 'online' | 'offline' | 'loading' | 'limited';
  capabilities: string[];
  maxTokens: number;
  isMultimodal?: boolean;
}

export interface ConversationTemplate {
  id: string;
  name: string;
  persona: string;
  description: string;
  modelId: string;
  systemPrompt: string;
  icon: string;
  color: string;
  capabilities: string[];
  suggestedQuestions: string[];
  parameters: {
    temperature: number;
    maxTokens: number;
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;
  };
  features: {
    ragEnabled: boolean;
    contextOptimization: boolean;
    rateLimiting: boolean;
    multimodal: boolean;
    toolCalling: boolean;
    streamingEnabled: boolean;
    contextLength: number;
    supportedImageFormats?: string[];
    maxImageSize?: string;
    imageTokenRatio?: string;
    edgeOptimized?: boolean;
    privacyFocused?: boolean;
    ultraLongContext?: boolean;
    beatsGPT4o?: boolean;
    industryLeading?: boolean;
    safetyFocused?: boolean;
    contentModeration?: boolean;
    researchFocused?: boolean;
    scientificRigor?: boolean;
    professionalVision?: boolean;
    scientificImaging?: boolean;
    thinkingMode?: boolean;
    hybridReasoning?: boolean;
    worldKnowledge?: boolean;
    codeExecution?: boolean;
    supportedFormats?: string[];
    imageGeneration?: boolean;
    imageEditing?: boolean;
    realTimeStreaming?: boolean;
    liveAPI?: boolean;
    nextGenFeatures?: boolean;
    highFrequency?: boolean;
    costEfficient?: boolean;
    fastProcessing?: boolean;
    educationalOptimized?: boolean;
    bulkProcessing?: boolean;
    googleSearchGrounding?: boolean;
    realTimeInformation?: boolean;
    sourceCitation?: boolean;
    factChecking?: boolean;
    currentResearch?: boolean;
    multiLanguageSupport?: boolean;
    iterativeDevelopment?: boolean;
    dataAnalysis?: boolean;
    algorithmTesting?: boolean;
    voicePersona?: string;
    modelSwitching?: boolean;
    availableModels?: string[];
  };
}

export interface Conversation {
  id: string;
  templateId: string;
  messages: Message[];
  title: string;
  lastUpdated: Date;
  isActive: boolean;
}

export interface Citation {
  id: string;
  source: string;
  type: 'rag' | 'knowledge' | 'external' | 'document' | 'web' | 'pdf';
  content: string;
  relevance: number;
  url?: string;
  page?: number;
  timestamp?: Date;
  documentId?: string;
  incantationUsed?: string;
  highlightedText?: string;
  confidence?: number;
  quality?: number;
  // Additional properties for CitationTooltip
  title?: string;
  excerpt?: string;
  documentName?: string;
  pageNumber?: number;
  relevanceScore?: number;
}

export interface CitationReference {
  citationId: string;
  inlineText: string;
  position: number;
  highlightStart?: number;
  highlightEnd?: number;
}

export interface HighlightedText {
  text: string;
  isHighlighted: boolean;
  citationId?: string;
}

export interface RAGDiscovery {
  query: string;
  incantationUsed: string;
  timestamp: Date;
  results: Citation[];
  confidence: number;
  context: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  tokens?: number;
  modelUsed?: string;
  citations?: Citation[];
  citationReferences?: CitationReference[];
  fallbackInfo?: {
    originalModel: string;
    fallbackModel: string;
    reason: string;
  };
  attachments?: any[];
}

export interface ModelStatus {
  modelId: string;
  isRunning: boolean;
  lastChecked: Date;
  responseTime?: number;
  error?: string;
  additionalInfo?: string;
}

export interface UserPreferences {
  id: string;
  userId?: string; // For future user accounts
  
  // Response Style Preferences
  responseStyle: 'verbose' | 'direct' | 'adaptive';
  showThoughtProcess: boolean;
  preferredLanguage: string;
  
  // Learning Preferences
  learningMode: 'guided' | 'exploratory' | 'challenge';
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  feedbackStyle: 'encouraging' | 'detailed' | 'minimal';
  
  // Model Preferences
  defaultModel: string;
  preferredTemperature: number;
  maxTokens: number;
  
  // UI Preferences
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  compactMode: boolean;
  
  // Educational Settings
  enableProgressTracking: boolean;
  studyGoals: string[];
  subjectAreas: string[];
  
  // Accessibility
  highContrast: boolean;
  reducedMotion: boolean;
  
  // Privacy & Data
  saveConversationHistory: boolean;
  enableAnalytics: boolean;
  
  lastUpdated: Date;
  createdAt: Date;
}

export interface LearningProgress {
  id: string;
  userId: string;
  
  // Subject Progress
  subjectAreas: {
    [subject: string]: {
      level: number; // 0-100
      conceptsMastered: string[];
      areasNeedingWork: string[];
      lastActivity: Date;
      timeSpent: number; // minutes
    };
  };
  
  // Language Learning Progress
  languages: {
    [language: string]: {
      proficiencyLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
      vocabularyCount: number;
      grammarConcepts: string[];
      conversationHours: number;
      lastPractice: Date;
    };
  };
  
  // General Learning Metrics
  totalInteractions: number;
  streakDays: number;
  achievementsUnlocked: string[];
  
  lastUpdated: Date;
}

export interface ConfigurationTemplate {
  id: string;
  name: string;
  description: string;
  category: 'academic' | 'creative' | 'technical' | 'language' | 'research';
  
  // Template Settings
  preferredModels: string[];
  systemPromptOverride?: string;
  defaultParameters: {
    temperature: number;
    maxTokens: number;
    topP: number;
  };
  
  // Behavioral Configuration
  responseStyle: 'verbose' | 'direct';
  showReasoningProcess: boolean;
  adaptiveDifficulty: boolean;
  
  // Subject-Specific Settings
  subjectFocus?: string;
  vocabularyLevel?: 'basic' | 'intermediate' | 'advanced' | 'expert';
  includeCulturalContext?: boolean;
  
  isCustom: boolean;
  createdBy?: string;
  createdAt: Date;
} 