/**
 * 🔢 Token Counter Utility
 * 
 * Accurate token counting for different AI models with proper handling of:
 * - PDF content
 * - RAG context from multiple document types
 * - Model-specific tokenization
 * - Context window management
 * - Cumulative conversation history tracking
 */

interface ModelTokenLimits {
  contextWindow: number;
  maxOutput: number;
  pricing: {
    input: number; // per 1K tokens
    output: number; // per 1K tokens
  };
}

// Real token limits for supported models (as of 2024)
export const MODEL_LIMITS: Record<string, ModelTokenLimits> = {
  // OpenAI Models
  'gpt-4o': {
    contextWindow: 128000,
    maxOutput: 16384,
    pricing: { input: 0.005, output: 0.015 }
  },
  'gpt-4o-mini': {
    contextWindow: 128000,
    maxOutput: 16384,
    pricing: { input: 0.00015, output: 0.0006 }
  },
  'gpt-3.5-turbo': {
    contextWindow: 16385,
    maxOutput: 4096,
    pricing: { input: 0.0005, output: 0.0015 }
  },
  
  // Google Gemini Models
  'gemini-2.0-flash': {
    contextWindow: 1000000, // 1M tokens
    maxOutput: 8192,
    pricing: { input: 0.0005, output: 0.0015 }
  },
  'gemini-1.5-pro': {
    contextWindow: 2000000, // 2M tokens
    maxOutput: 8192,
    pricing: { input: 0.00125, output: 0.005 }
  },
  
  // Llama Models (local)
  'llama4-scout': {
    contextWindow: 10485760, // Official: 10M tokens - Enhanced reasoning model
    maxOutput: 8192, // Higher output for complex reasoning
    pricing: { input: 0, output: 0 } // Local = free
  },
  'llama3.2:3b': {
    contextWindow: 131072, // 128K tokens  
    maxOutput: 4096,
    pricing: { input: 0, output: 0 } // Local = free
  },
  'llama3.1:8b': {
    contextWindow: 131072, // 128K tokens
    maxOutput: 4096,
    pricing: { input: 0, output: 0 } // Local = free
  }
};

export interface TokenUsage {
  systemPrompt: number;
  conversationHistory: number;
  ragContext: number;
  currentMessage: number;
  total: number;
  remaining: number;
  percentage: number;
  estimatedCost: number;
}

export interface DetailedTokenUsage extends TokenUsage {
  breakdown: {
    systemTokens: number;
    inputTokensTotal: number;
    outputTokensTotal: number;
    ragTokens: number;
    currentInputTokens: number;
    expectedOutputTokens: number;
  };
  costs: {
    inputCost: number;
    outputCost: number;
    totalCost: number;
  };
  contextUtilization: {
    historyPercentage: number;
    ragPercentage: number;
    systemPercentage: number;
    availableForResponse: number;
  };
}

export interface ConversationTokenStats {
  totalMessages: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  averageInputTokens: number;
  averageOutputTokens: number;
  longestMessage: number;
  shortestMessage: number;
  cumulativeCost: number;
}

export interface DocumentContext {
  type: 'pdf' | 'docx' | 'txt' | 'md' | 'csv' | 'json' | 'xml';
  name: string;
  content: string;
  tokenCount: number;
  size: number;
  uploadedAt: Date;
}

/**
 * Estimate token count using GPT-4 tokenization approximation
 * This is more accurate than simple word counting
 */
export function estimateTokenCount(text: string): number {
  if (!text) return 0;
  
  // GPT-4 tokenization approximation:
  // - ~4 characters per token on average
  // - But punctuation, spaces, and special chars affect this
  // - Code and structured text tend to use more tokens
  
  const words = text.split(/\s+/).filter(word => word.length > 0);
  const characters = text.length;
  
  // Base estimation: average of word-based and character-based counting
  const wordBasedTokens = words.length * 1.3; // ~1.3 tokens per word
  const charBasedTokens = characters / 4; // ~4 chars per token
  
  // Weight toward character-based for structured content
  const hasStructuredContent = /[{}[\](),:;|<>]/.test(text);
  const weight = hasStructuredContent ? 0.3 : 0.7;
  
  const estimatedTokens = Math.ceil(
    wordBasedTokens * weight + charBasedTokens * (1 - weight)
  );
  
  return Math.max(estimatedTokens, Math.ceil(words.length * 0.75)); // Minimum bound
}

/**
 * Calculate comprehensive conversation token statistics
 */
export function calculateConversationStats(
  messages: Array<{ content: string; role: string; tokens?: number }>,
  modelId: string
): ConversationTokenStats {
  const modelLimits = MODEL_LIMITS[modelId] || MODEL_LIMITS['gpt-4o-mini'];
  
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let minTokens = Infinity;
  let maxTokens = 0;
  
  const messageTokens = messages.map(msg => {
    const tokens = msg.tokens || estimateTokenCount(msg.content);
    
    if (msg.role === 'user') {
      totalInputTokens += tokens;
    } else if (msg.role === 'assistant') {
      totalOutputTokens += tokens;
    }
    
    minTokens = Math.min(minTokens, tokens);
    maxTokens = Math.max(maxTokens, tokens);
    
    return tokens;
  });
  
  const totalTokens = totalInputTokens + totalOutputTokens;
  const totalCost = (totalInputTokens / 1000) * modelLimits.pricing.input + 
                   (totalOutputTokens / 1000) * modelLimits.pricing.output;
  
  return {
    totalMessages: messages.length,
    totalInputTokens,
    totalOutputTokens,
    totalTokens,
    averageInputTokens: Math.round(totalInputTokens / Math.max(1, messages.filter(m => m.role === 'user').length)),
    averageOutputTokens: Math.round(totalOutputTokens / Math.max(1, messages.filter(m => m.role === 'assistant').length)),
    longestMessage: maxTokens,
    shortestMessage: minTokens === Infinity ? 0 : minTokens,
    cumulativeCost: Math.round(totalCost * 10000) / 10000
  };
}

/**
 * Calculate comprehensive token usage including RAG context and detailed breakdown
 */
export function calculateDetailedTokenUsage(
  systemPrompt: string,
  messages: Array<{ content: string; role: string; tokens?: number }>,
  ragDocuments: DocumentContext[],
  currentMessage: string,
  modelId: string
): DetailedTokenUsage {
  const modelLimits = MODEL_LIMITS[modelId] || MODEL_LIMITS['gpt-4o-mini'];
  
  const systemTokens = estimateTokenCount(systemPrompt);
  const ragTokens = ragDocuments.reduce((sum, doc) => sum + doc.tokenCount, 0);
  const currentInputTokens = estimateTokenCount(currentMessage);
  const expectedOutputTokens = modelLimits.maxOutput || 2000;
  
  // Calculate conversation history tokens with proper input/output separation
  let historyInputTokens = 0;
  let historyOutputTokens = 0;
  
  messages.forEach(msg => {
    const tokens = msg.tokens || estimateTokenCount(msg.content);
    if (msg.role === 'user') {
      historyInputTokens += tokens;
    } else if (msg.role === 'assistant') {
      historyOutputTokens += tokens;
    }
  });
  
  const totalHistoryTokens = historyInputTokens + historyOutputTokens;
  const totalInputTokens = historyInputTokens + currentInputTokens;
  const totalOutputTokens = historyOutputTokens;
  
  // Total tokens in context window (excluding expected response)
  const totalContextTokens = systemTokens + totalHistoryTokens + ragTokens + currentInputTokens;
  
  // Total tokens including expected response
  const totalProjectedTokens = totalContextTokens + expectedOutputTokens;
  
  const remainingTokens = Math.max(0, modelLimits.contextWindow - totalContextTokens);
  const percentage = Math.min(100, (totalContextTokens / modelLimits.contextWindow) * 100);
  
  // Cost calculations
  const inputCost = (totalInputTokens / 1000) * modelLimits.pricing.input;
  const outputCost = (totalOutputTokens / 1000) * modelLimits.pricing.output;
  const totalCost = inputCost + outputCost;
  
  // Context utilization breakdown
  const contextUtilization = {
    historyPercentage: Math.round((totalHistoryTokens / modelLimits.contextWindow) * 100 * 10) / 10,
    ragPercentage: Math.round((ragTokens / modelLimits.contextWindow) * 100 * 10) / 10,
    systemPercentage: Math.round((systemTokens / modelLimits.contextWindow) * 100 * 10) / 10,
    availableForResponse: Math.max(0, modelLimits.contextWindow - totalContextTokens)
  };
  
  return {
    systemPrompt: systemTokens,
    conversationHistory: totalHistoryTokens,
    ragContext: ragTokens,
    currentMessage: currentInputTokens,
    total: totalContextTokens,
    remaining: remainingTokens,
    percentage: Math.round(percentage * 10) / 10,
    estimatedCost: Math.round(totalCost * 10000) / 10000,
    breakdown: {
      systemTokens,
      inputTokensTotal: totalInputTokens,
      outputTokensTotal: totalOutputTokens,
      ragTokens,
      currentInputTokens,
      expectedOutputTokens
    },
    costs: {
      inputCost: Math.round(inputCost * 10000) / 10000,
      outputCost: Math.round(outputCost * 10000) / 10000,
      totalCost: Math.round(totalCost * 10000) / 10000
    },
    contextUtilization
  };
}

/**
 * Calculate comprehensive token usage including RAG context
 */
export function calculateTokenUsage(
  systemPrompt: string,
  conversationHistory: string,
  ragDocuments: DocumentContext[],
  currentMessage: string,
  modelId: string
): TokenUsage {
  const modelLimits = MODEL_LIMITS[modelId] || MODEL_LIMITS['gpt-4o-mini'];
  
  const systemTokens = estimateTokenCount(systemPrompt);
  const historyTokens = estimateTokenCount(conversationHistory);
  const ragTokens = ragDocuments.reduce((sum, doc) => sum + doc.tokenCount, 0);
  const messageTokens = estimateTokenCount(currentMessage);
  
  const totalTokens = systemTokens + historyTokens + ragTokens + messageTokens;
  const remainingTokens = Math.max(0, modelLimits.contextWindow - totalTokens);
  const percentage = Math.min(100, (totalTokens / modelLimits.contextWindow) * 100);
  
  // Estimate cost (input tokens only for this calculation)
  const estimatedCost = (totalTokens / 1000) * modelLimits.pricing.input;
  
  return {
    systemPrompt: systemTokens,
    conversationHistory: historyTokens,
    ragContext: ragTokens,
    currentMessage: messageTokens,
    total: totalTokens,
    remaining: remainingTokens,
    percentage: Math.round(percentage * 10) / 10,
    estimatedCost: Math.round(estimatedCost * 10000) / 10000 // 4 decimal places
  };
}

/**
 * Calculate optimal context window for a conversation with automatic pruning
 */
export function calculateOptimalContext(
  messages: Array<{ content: string; role: string; tokens?: number; timestamp: Date }>,
  systemPrompt: string,
  ragDocuments: DocumentContext[],
  modelId: string,
  maxContextPercentage: number = 85 // Use 85% of context window max
): {
  includedMessages: Array<{ content: string; role: string; tokens?: number; timestamp: Date }>;
  excludedMessages: Array<{ content: string; role: string; tokens?: number; timestamp: Date }>;
  tokenStats: {
    total: number;
    system: number;
    rag: number;
    conversation: number;
    available: number;
  };
  pruningStrategy: 'none' | 'oldest_first' | 'compression_needed' | 'emergency';
} {
  const modelLimits = MODEL_LIMITS[modelId] || MODEL_LIMITS['gpt-4o-mini'];
  const maxTokens = Math.floor(modelLimits.contextWindow * (maxContextPercentage / 100));
  
  const systemTokens = estimateTokenCount(systemPrompt);
  const ragTokens = ragDocuments.reduce((sum, doc) => sum + doc.tokenCount, 0);
  const reservedTokens = systemTokens + ragTokens + (modelLimits.maxOutput || 2000);
  const availableForConversation = maxTokens - reservedTokens;
  
  if (availableForConversation <= 0) {
    return {
      includedMessages: [],
      excludedMessages: [...messages],
      tokenStats: {
        total: reservedTokens,
        system: systemTokens,
        rag: ragTokens,
        conversation: 0,
        available: 0
      },
      pruningStrategy: 'emergency'
    };
  }
  
  // Calculate tokens for all messages
  const messagesWithTokens = messages.map(msg => ({
    ...msg,
    calculatedTokens: msg.tokens || estimateTokenCount(msg.content)
  }));
  
  const totalConversationTokens = messagesWithTokens.reduce((sum, msg) => sum + msg.calculatedTokens, 0);
  
  if (totalConversationTokens <= availableForConversation) {
    return {
      includedMessages: messages,
      excludedMessages: [],
      tokenStats: {
        total: reservedTokens + totalConversationTokens,
        system: systemTokens,
        rag: ragTokens,
        conversation: totalConversationTokens,
        available: availableForConversation - totalConversationTokens
      },
      pruningStrategy: 'none'
    };
  }
  
  // Need to prune - start from oldest messages but keep recent context
  const sortedMessages = [...messagesWithTokens].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  const includedMessages: typeof messagesWithTokens = [];
  const excludedMessages: typeof messagesWithTokens = [];
  
  let currentTokens = 0;
  
  // Always try to include the most recent messages first
  const reversedMessages = [...sortedMessages].reverse();
  
  for (const msg of reversedMessages) {
    if (currentTokens + msg.calculatedTokens <= availableForConversation) {
      includedMessages.unshift(msg);
      currentTokens += msg.calculatedTokens;
    } else {
      excludedMessages.push(msg);
    }
  }
  
  return {
    includedMessages: includedMessages.map(({ calculatedTokens, ...msg }) => msg),
    excludedMessages: excludedMessages.map(({ calculatedTokens, ...msg }) => msg),
    tokenStats: {
      total: reservedTokens + currentTokens,
      system: systemTokens,
      rag: ragTokens,
      conversation: currentTokens,
      available: availableForConversation - currentTokens
    },
    pruningStrategy: excludedMessages.length > 0 ? 'oldest_first' : 'none'
  };
}

/**
 * Process document content and estimate tokens
 */
export function processDocumentForRAG(
  file: File,
  content: string
): DocumentContext {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'txt';
  const documentType = mapFileExtensionToType(extension);
  
  return {
    type: documentType,
    name: file.name,
    content: content,
    tokenCount: estimateTokenCount(content),
    size: file.size,
    uploadedAt: new Date()
  };
}

/**
 * Map file extensions to document types
 */
function mapFileExtensionToType(extension: string): DocumentContext['type'] {
  const typeMap: Record<string, DocumentContext['type']> = {
    'pdf': 'pdf',
    'docx': 'docx',
    'doc': 'docx',
    'txt': 'txt',
    'md': 'md',
    'markdown': 'md',
    'csv': 'csv',
    'json': 'json',
    'xml': 'xml',
    'html': 'xml',
    'htm': 'xml'
  };
  
  return typeMap[extension] || 'txt';
}

/**
 * Get model information including context limits
 */
export function getModelInfo(modelId: string): ModelTokenLimits {
  return MODEL_LIMITS[modelId] || MODEL_LIMITS['gpt-4o-mini'];
}

/**
 * Check if context is near limit and suggest actions
 */
export function getContextRecommendations(usage: TokenUsage | DetailedTokenUsage): {
  status: 'good' | 'warning' | 'critical';
  message: string;
  actions: string[];
} {
  if (usage.percentage < 70) {
    return {
      status: 'good',
      message: 'Context usage is healthy',
      actions: []
    };
  } else if (usage.percentage < 90) {
    return {
      status: 'warning',
      message: 'Context window is filling up',
      actions: [
        'Consider removing older documents from RAG',
        'Summarize conversation history',
        'Use a model with larger context window'
      ]
    };
  } else {
    return {
      status: 'critical',
      message: 'Context window nearly full - responses may be truncated',
      actions: [
        'Start a new conversation',
        'Remove documents from RAG context',
        'Switch to a model with larger context window',
        'Clear conversation history'
      ]
    };
  }
}

export default estimateTokenCount; 