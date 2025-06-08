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
 * Calculate detailed token usage including costs and context breakdown
 */
export function calculateDetailedTokenUsage(
  systemPrompt: string,
  messages: Array<{ content: string; role: string; tokens?: number }>,
  ragDocuments: DocumentContext[],
  currentMessage: string,
  modelId: string
): DetailedTokenUsage {
  const modelLimits = MODEL_LIMITS[modelId] || MODEL_LIMITS['gpt-4o-mini'];
  const contextWindow = modelLimits.contextWindow;
  
  // Calculate token counts for each component
  const systemTokens = estimateTokenCount(systemPrompt);
  
  // Separate input and output messages
  let inputTokensTotal = 0;
  let outputTokensTotal = 0;
  
  messages.forEach(message => {
    const tokenCount = message.tokens || estimateTokenCount(message.content);
    
    if (message.role === 'user') {
      inputTokensTotal += tokenCount;
    } else if (message.role === 'assistant') {
      outputTokensTotal += tokenCount;
    }
  });
  
  // Calculate RAG content tokens
  const ragTokens = ragDocuments.reduce((sum, doc) => sum + (doc.tokenCount || estimateTokenCount(doc.content)), 0);
  
  // Current message and expected response
  const currentInputTokens = estimateTokenCount(currentMessage);
  const expectedOutputTokens = Math.min(currentInputTokens * 2, modelLimits.maxOutput); // Estimate based on input
  
  // Total tokens in context
  const conversationHistoryTokens = inputTokensTotal + outputTokensTotal;
  const totalTokens = systemTokens + conversationHistoryTokens + ragTokens + currentInputTokens;
  
  // Available tokens and percentage
  const remainingTokens = Math.max(0, contextWindow - totalTokens);
  const usagePercentage = Math.min(100, Math.round((totalTokens / contextWindow) * 100));
  
  // Cost calculation
  const inputCost = ((systemTokens + inputTokensTotal + currentInputTokens + ragTokens) / 1000) * modelLimits.pricing.input;
  const outputCost = (outputTokensTotal / 1000) * modelLimits.pricing.output;
  const totalCost = inputCost + outputCost;
  
  // Context utilization breakdown
  const historyPercentage = Math.round((conversationHistoryTokens / contextWindow) * 100);
  const ragPercentage = Math.round((ragTokens / contextWindow) * 100);
  const systemPercentage = Math.round((systemTokens / contextWindow) * 100);
  const availableForResponse = Math.max(0, contextWindow - totalTokens);
  
  return {
    systemPrompt: systemTokens,
    conversationHistory: conversationHistoryTokens,
    ragContext: ragTokens,
    currentMessage: currentInputTokens,
    total: totalTokens,
    remaining: remainingTokens,
    percentage: usagePercentage,
    estimatedCost: Math.round(totalCost * 10000) / 10000,
    breakdown: {
      systemTokens,
      inputTokensTotal,
      outputTokensTotal,
      ragTokens,
      currentInputTokens,
      expectedOutputTokens
    },
    costs: {
      inputCost: Math.round(inputCost * 10000) / 10000,
      outputCost: Math.round(outputCost * 10000) / 10000,
      totalCost: Math.round(totalCost * 10000) / 10000
    },
    contextUtilization: {
      historyPercentage,
      ragPercentage,
      systemPercentage,
      availableForResponse
    }
  };
}

/**
 * Simplified token usage calculation
 */
export function calculateTokenUsage(
  systemPrompt: string,
  conversationHistory: string,
  ragDocuments: DocumentContext[],
  currentMessage: string,
  modelId: string
): TokenUsage {
  const modelLimits = MODEL_LIMITS[modelId] || MODEL_LIMITS['gpt-4o-mini'];
  const contextWindow = modelLimits.contextWindow;
  
  // Calculate token counts
  const systemTokens = estimateTokenCount(systemPrompt);
  const historyTokens = estimateTokenCount(conversationHistory);
  const ragTokens = ragDocuments.reduce((sum, doc) => sum + (doc.tokenCount || estimateTokenCount(doc.content)), 0);
  const currentInputTokens = estimateTokenCount(currentMessage);
  
  // Total tokens
  const totalTokens = systemTokens + historyTokens + ragTokens + currentInputTokens;
  
  // Available tokens and percentage
  const remainingTokens = Math.max(0, contextWindow - totalTokens);
  const usagePercentage = Math.min(100, Math.round((totalTokens / contextWindow) * 100));
  
  // Cost calculation (simplified)
  const inputCost = ((systemTokens + historyTokens + currentInputTokens + ragTokens) / 1000) * modelLimits.pricing.input;
  
  return {
    systemPrompt: systemTokens,
    conversationHistory: historyTokens,
    ragContext: ragTokens,
    currentMessage: currentInputTokens,
    total: totalTokens,
    remaining: remainingTokens,
    percentage: usagePercentage,
    estimatedCost: Math.round(inputCost * 10000) / 10000
  };
}

/**
 * Calculate optimal context window utilization by selecting which messages to include
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
  const contextWindow = modelLimits.contextWindow;
  const maxAllowedTokens = Math.floor(contextWindow * (maxContextPercentage / 100));
  
  // Fixed costs: System prompt and RAG
  const systemTokens = estimateTokenCount(systemPrompt);
  const ragTokens = ragDocuments.reduce((sum, doc) => sum + (doc.tokenCount || estimateTokenCount(doc.content)), 0);
  const fixedTokens = systemTokens + ragTokens;
  
  // Available for conversation
  const availableForConversation = maxAllowedTokens - fixedTokens;
  
  // Calculate tokens for each message
  const messagesWithTokens = messages.map(msg => ({
    ...msg,
    tokens: msg.tokens || estimateTokenCount(msg.content)
  }));
  
  // Sort by timestamp, newest first
  const sortedMessages = [...messagesWithTokens].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  let includedMessages: typeof sortedMessages = [];
  let currentTokens = 0;
  let pruningStrategy: 'none' | 'oldest_first' | 'compression_needed' | 'emergency' = 'none';
  
  // Always include the latest few messages
  const guaranteedMessages = sortedMessages.slice(0, 4);
  const guaranteedTokens = guaranteedMessages.reduce((sum, msg) => sum + (msg.tokens || 0), 0);
  
  if (guaranteedTokens + fixedTokens > maxAllowedTokens) {
    // Emergency mode - context window too small even for latest messages
    pruningStrategy = 'emergency';
    
    // Include as many of the latest messages as possible
    for (const msg of guaranteedMessages) {
      if (currentTokens + (msg.tokens || 0) + fixedTokens <= maxAllowedTokens) {
        includedMessages.push(msg);
        currentTokens += msg.tokens || 0;
      }
    }
  } else {
    // Include all guaranteed messages
    includedMessages = [...guaranteedMessages];
    currentTokens = guaranteedTokens;
    
    // Add more messages until we reach the limit
    for (const msg of sortedMessages.slice(4)) {
      if (currentTokens + (msg.tokens || 0) <= availableForConversation) {
        includedMessages.push(msg);
        currentTokens += msg.tokens || 0;
      } else {
        // We've hit the limit
        pruningStrategy = 'oldest_first';
        break;
      }
    }
  }
  
  // Sort included messages by original order (timestamp ascending)
  includedMessages.sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  
  // Find excluded messages
  const excludedMessages = messagesWithTokens.filter(
    msg => !includedMessages.some(m => 
      m.content === msg.content && m.timestamp.getTime() === msg.timestamp.getTime()
    )
  );
  
  // If we excluded messages but still have space, compression is needed
  if (excludedMessages.length > 0 && currentTokens < availableForConversation) {
    pruningStrategy = 'compression_needed';
  }
  
  return {
    includedMessages,
    excludedMessages,
    tokenStats: {
      total: currentTokens + fixedTokens,
      system: systemTokens,
      rag: ragTokens,
      conversation: currentTokens,
      available: maxAllowedTokens - (currentTokens + fixedTokens)
    },
    pruningStrategy
  };
}

/**
 * Process an uploaded document for RAG
 */
export function processDocumentForRAG(
  file: File,
  content: string
): DocumentContext {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  const type = mapFileExtensionToType(extension);
  
  const documentContext: DocumentContext = {
    type,
    name: file.name,
    content,
    tokenCount: estimateTokenCount(content),
    size: file.size,
    uploadedAt: new Date()
  };
  
  return documentContext;
}

function mapFileExtensionToType(extension: string): DocumentContext['type'] {
  const mapping: Record<string, DocumentContext['type']> = {
    'pdf': 'pdf',
    'docx': 'docx',
    'doc': 'docx',
    'txt': 'txt',
    'md': 'md',
    'csv': 'csv',
    'json': 'json',
    'xml': 'xml'
  };
  
  return mapping[extension] || 'txt';
}

/**
 * Get model information by model ID
 */
export function getModelInfo(modelId: string): ModelTokenLimits {
  return MODEL_LIMITS[modelId] || MODEL_LIMITS['gpt-4o-mini'];
}

/**
 * Get recommendations based on token usage
 */
export function getContextRecommendations(usage: TokenUsage | DetailedTokenUsage): {
  status: 'good' | 'warning' | 'critical';
  message: string;
  actions: string[];
} {
  const percentage = usage.percentage;
  
  if (percentage < 60) {
    return {
      status: 'good',
      message: 'Plenty of context space available.',
      actions: ['Add more context if needed', 'Increase detail in your messages']
    };
  }
  
  if (percentage < 85) {
    return {
      status: 'warning',
      message: 'Approaching context limit.',
      actions: [
        'Consider summarizing older messages',
        'Reduce RAG content if possible',
        'Be concise in new messages'
      ]
    };
  }
  
  return {
    status: 'critical',
    message: 'Context window nearly full.',
    actions: [
      'Start a new conversation',
      'Remove unnecessary RAG content',
      'Summarize or compress conversation history',
      'Enable auto-compression for older messages'
    ]
  };
} 