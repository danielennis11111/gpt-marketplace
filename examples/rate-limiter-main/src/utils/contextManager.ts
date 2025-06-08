/**
 * 🧠 Context Manager
 * 
 * Intelligent context window management with automatic optimization
 * Handles conversation history pruning, compression, and optimization
 * to maintain optimal performance as conversations grow.
 */

import { Message } from '../types/index';
import { 
  calculateOptimalContext, 
  calculateDetailedTokenUsage,
  DocumentContext,
  estimateTokenCount,
  MODEL_LIMITS
} from './tokenCounter';
import { CompressionEngine } from './compressionEngine';

export interface ContextOptimizationResult {
  optimizedMessages: Message[];
  removedMessages: Message[];
  tokensSaved: number;
  strategy: 'none' | 'oldest_first' | 'compression' | 'smart_pruning' | 'emergency';
  recommendations: string[];
  contextUtilization: {
    before: number;
    after: number;
    improvement: number;
  };
}

export interface ConversationSummary {
  id: string;
  messageCount: number;
  timeSpan: string;
  topics: string[];
  keyPoints: string[];
  tokenCount: number;
}

export class ContextManager {
  private readonly MAX_CONTEXT_PERCENTAGE = 85; // Use 85% of context window
  private readonly WARNING_THRESHOLD = 70; // Start optimizing at 70%
  private readonly EMERGENCY_THRESHOLD = 95; // Emergency pruning at 95%
  private compressionEngine: CompressionEngine;

  constructor() {
    this.compressionEngine = CompressionEngine.getInstance();
  }

  /**
   * Automatically optimize conversation context when needed
   */
  public optimizeContext(
    messages: Message[],
    systemPrompt: string,
    ragDocuments: DocumentContext[],
    currentInput: string,
    modelId: string
  ): ContextOptimizationResult {
    const currentUsage = calculateDetailedTokenUsage(
      systemPrompt,
      messages,
      ragDocuments,
      currentInput,
      modelId
    );

    // If we're under the warning threshold, no optimization needed
    if (currentUsage.percentage < this.WARNING_THRESHOLD) {
      return {
        optimizedMessages: messages,
        removedMessages: [],
        tokensSaved: 0,
        strategy: 'none',
        recommendations: [],
        contextUtilization: {
          before: currentUsage.percentage,
          after: currentUsage.percentage,
          improvement: 0
        }
      };
    }

    // Choose optimization strategy based on current usage
    let strategy: ContextOptimizationResult['strategy'] = 'oldest_first';
    let optimizedMessages: Message[] = [];
    let removedMessages: Message[] = [];

    if (currentUsage.percentage >= this.EMERGENCY_THRESHOLD) {
      // Emergency: Keep only the most recent messages
      strategy = 'emergency';
      const result = this.emergencyPruning(messages, systemPrompt, ragDocuments, modelId);
      optimizedMessages = result.includedMessages;
      removedMessages = result.excludedMessages;
    } else if (currentUsage.percentage >= 90) {
      // Smart pruning: Keep important messages and recent context
      strategy = 'smart_pruning';
      const result = this.smartPruning(messages, systemPrompt, ragDocuments, modelId);
      optimizedMessages = result.includedMessages;
      removedMessages = result.excludedMessages;
    } else {
      // Standard pruning: Remove oldest messages first
      strategy = 'oldest_first';
      const result = calculateOptimalContext(
        messages,
        systemPrompt,
        ragDocuments,
        modelId,
        this.MAX_CONTEXT_PERCENTAGE
      );
      optimizedMessages = result.includedMessages as Message[];
      removedMessages = result.excludedMessages as Message[];
    }

    // Calculate improvement
    const newUsage = calculateDetailedTokenUsage(
      systemPrompt,
      optimizedMessages,
      ragDocuments,
      currentInput,
      modelId
    );

    const tokensSaved = currentUsage.total - newUsage.total;
    
    // Record compression event if significant tokens were saved
    if (tokensSaved > 100) {
      const compressionRatio = newUsage.total / currentUsage.total;
      const accuracy = strategy === 'smart_pruning' ? 0.9 : 
                     strategy === 'oldest_first' ? 0.7 : 0.5;
      
      // Simulate compression recording (we're not actually compressing text, just optimizing context)
      this.compressionEngine.compressSemantic(
        removedMessages.map(m => m.content).join('\n'),
        compressionRatio,
        `context_optimization_${Date.now()}`,
        removedMessages.length
      );
    }

    const recommendations = this.generateRecommendations(currentUsage, newUsage, strategy);

    return {
      optimizedMessages,
      removedMessages,
      tokensSaved,
      strategy,
      recommendations,
      contextUtilization: {
        before: currentUsage.percentage,
        after: newUsage.percentage,
        improvement: currentUsage.percentage - newUsage.percentage
      }
    };
  }

  /**
   * Smart pruning: Keep important messages and maintain conversation coherence
   */
  private smartPruning(
    messages: Message[],
    systemPrompt: string,
    ragDocuments: DocumentContext[],
    modelId: string
  ): { includedMessages: Message[]; excludedMessages: Message[] } {
    const modelLimits = MODEL_LIMITS[modelId] || MODEL_LIMITS['gpt-4o-mini'];
    const maxTokens = Math.floor(modelLimits.contextWindow * (this.MAX_CONTEXT_PERCENTAGE / 100));
    
    const systemTokens = estimateTokenCount(systemPrompt);
    const ragTokens = ragDocuments.reduce((sum, doc) => sum + doc.tokenCount, 0);
    const reservedTokens = systemTokens + ragTokens + (modelLimits.maxOutput || 2000);
    const availableForConversation = maxTokens - reservedTokens;

    // Always keep the last 3 message pairs (6 messages) for context
    const recentMessages = messages.slice(-6);
    const olderMessages = messages.slice(0, -6);

    // Calculate tokens for recent messages
    const recentTokens = recentMessages.reduce((sum, msg) => 
      sum + (msg.tokens || estimateTokenCount(msg.content)), 0
    );

    // If recent messages already exceed available space, use emergency pruning
    if (recentTokens >= availableForConversation) {
      return this.emergencyPruning(messages, systemPrompt, ragDocuments, modelId);
    }

    // Score older messages by importance
    const scoredMessages = olderMessages.map((msg, index) => ({
      ...msg,
      score: this.calculateMessageImportance(msg, index, olderMessages),
      calculatedTokens: msg.tokens || estimateTokenCount(msg.content)
    }));

    // Sort by importance (highest first)
    scoredMessages.sort((a, b) => b.score - a.score);

    // Add important older messages until we hit the token limit
    const includedMessages: Message[] = [...recentMessages];
    const excludedMessages: Message[] = [];
    let currentTokens = recentTokens;

    for (const msg of scoredMessages) {
      if (currentTokens + msg.calculatedTokens <= availableForConversation) {
        const { score, calculatedTokens, ...cleanMsg } = msg;
        includedMessages.push(cleanMsg);
        currentTokens += msg.calculatedTokens;
      } else {
        const { score, calculatedTokens, ...cleanMsg } = msg;
        excludedMessages.push(cleanMsg);
      }
    }

    // Sort included messages by timestamp to maintain conversation order
    const orderedIncluded = includedMessages.sort((a, b) => 
      a.timestamp.getTime() - b.timestamp.getTime()
    );

    return {
      includedMessages: orderedIncluded,
      excludedMessages
    };
  }

  /**
   * Emergency pruning: Keep only the most recent messages
   */
  private emergencyPruning(
    messages: Message[],
    systemPrompt: string,
    ragDocuments: DocumentContext[],
    modelId: string
  ): { includedMessages: Message[]; excludedMessages: Message[] } {
    const modelLimits = MODEL_LIMITS[modelId] || MODEL_LIMITS['gpt-4o-mini'];
    const maxTokens = Math.floor(modelLimits.contextWindow * 0.5); // Use only 50% in emergency
    
    const systemTokens = estimateTokenCount(systemPrompt);
    const ragTokens = ragDocuments.reduce((sum, doc) => sum + doc.tokenCount, 0);
    const reservedTokens = systemTokens + ragTokens + (modelLimits.maxOutput || 2000);
    const availableForConversation = maxTokens - reservedTokens;

    const includedMessages: Message[] = [];
    const excludedMessages: Message[] = [];
    let currentTokens = 0;

    // Start from the most recent messages
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      const tokens = msg.tokens || estimateTokenCount(msg.content);
      
      if (currentTokens + tokens <= availableForConversation) {
        includedMessages.unshift(msg);
        currentTokens += tokens;
      } else {
        excludedMessages.unshift(msg);
      }
    }

    return { includedMessages, excludedMessages };
  }

  /**
   * Calculate message importance score for smart pruning
   */
  private calculateMessageImportance(
    message: Message,
    index: number,
    allMessages: Message[]
  ): number {
    let score = 0;

    // Recency bonus (more recent = higher score)
    score += (index / allMessages.length) * 10;

    // Length bonus (longer messages often contain more information)
    const contentLength = message.content.length;
    if (contentLength > 200) score += 3;
    if (contentLength > 500) score += 2;

    // Question/Answer pattern bonus
    if (message.content.includes('?')) score += 2;
    if (message.role === 'assistant' && contentLength > 100) score += 3;

    // Code or technical content bonus
    if (message.content.includes('```') || message.content.includes('function') || 
        message.content.includes('class') || message.content.includes('import')) {
      score += 4;
    }

    // Important keywords bonus
    const importantKeywords = ['error', 'solution', 'fix', 'problem', 'help', 'explain', 'how to'];
    const hasImportantKeywords = importantKeywords.some(keyword => 
      message.content.toLowerCase().includes(keyword)
    );
    if (hasImportantKeywords) score += 3;

    return score;
  }

  /**
   * Generate recommendations based on optimization results
   */
  private generateRecommendations(
    beforeUsage: any,
    afterUsage: any,
    strategy: string
  ): string[] {
    const recommendations: string[] = [];

    if (strategy === 'emergency') {
      recommendations.push('Emergency context pruning was applied - many messages were removed');
      recommendations.push('Consider starting a new conversation to maintain context');
      recommendations.push('Save important information from this conversation before continuing');
    } else if (strategy === 'smart_pruning') {
      recommendations.push('Smart pruning was applied - less important messages were removed');
      recommendations.push('Recent conversation context has been preserved');
    }

    if (beforeUsage.breakdown?.ragTokens > 10000) {
      recommendations.push('RAG documents are using significant context - consider removing unused documents');
    }

    if (afterUsage.percentage > 80) {
      recommendations.push('Context window is still quite full - consider switching to a model with larger context');
      recommendations.push('Available models: Gemini 2.0 Flash (1M tokens), Llama 4 Scout (10M tokens)');
    }

    if (beforeUsage.costs?.totalCost > 0.1) {
      recommendations.push('Consider using cost-effective models like GPT-4o-mini or local Llama models');
    }

    return recommendations;
  }

  /**
   * Create a summary of removed messages for user reference
   */
  public createConversationSummary(
    removedMessages: Message[],
    conversationId: string
  ): ConversationSummary {
    if (removedMessages.length === 0) {
      return {
        id: conversationId,
        messageCount: 0,
        timeSpan: '',
        topics: [],
        keyPoints: [],
        tokenCount: 0
      };
    }

    const firstMessage = removedMessages[0];
    const lastMessage = removedMessages[removedMessages.length - 1];
    const timeSpan = `${firstMessage.timestamp.toLocaleDateString()} - ${lastMessage.timestamp.toLocaleDateString()}`;

    // Extract topics and key points (simplified version)
    const topics = this.extractTopics(removedMessages);
    const keyPoints = this.extractKeyPoints(removedMessages);
    const totalTokens = removedMessages.reduce((sum, msg) => 
      sum + (msg.tokens || estimateTokenCount(msg.content)), 0
    );

    return {
      id: conversationId,
      messageCount: removedMessages.length,
      timeSpan,
      topics,
      keyPoints,
      tokenCount: totalTokens
    };
  }

  /**
   * Extract topics from removed messages
   */
  private extractTopics(messages: Message[]): string[] {
    const topics = new Set<string>();
    
    messages.forEach(msg => {
      const content = msg.content.toLowerCase();
      
      // Simple topic extraction based on common patterns
      if (content.includes('react') || content.includes('component')) topics.add('React Development');
      if (content.includes('javascript') || content.includes('js')) topics.add('JavaScript');
      if (content.includes('typescript') || content.includes('ts')) topics.add('TypeScript');
      if (content.includes('css') || content.includes('style')) topics.add('CSS/Styling');
      if (content.includes('api') || content.includes('endpoint')) topics.add('API Development');
      if (content.includes('database') || content.includes('sql')) topics.add('Database');
      if (content.includes('error') || content.includes('bug')) topics.add('Debugging');
      if (content.includes('ai') || content.includes('llm') || content.includes('gpt')) topics.add('AI/ML');
    });

    return Array.from(topics).slice(0, 5); // Limit to 5 topics
  }

  /**
   * Extract key points from removed messages
   */
  private extractKeyPoints(messages: Message[]): string[] {
    const keyPoints: string[] = [];
    
    messages.forEach(msg => {
      if (msg.role === 'assistant' && msg.content.length > 100) {
        // Extract first sentence or key insight
        const sentences = msg.content.split('. ');
        if (sentences.length > 0 && sentences[0].length > 20 && sentences[0].length < 150) {
          keyPoints.push(sentences[0] + '.');
        }
      }
    });

    return keyPoints.slice(0, 3); // Limit to 3 key points
  }

  /**
   * Check if context optimization is recommended
   */
  public shouldOptimize(
    messages: Message[],
    systemPrompt: string,
    ragDocuments: DocumentContext[],
    currentInput: string,
    modelId: string
  ): { shouldOptimize: boolean; reason: string; urgency: 'low' | 'medium' | 'high' } {
    const usage = calculateDetailedTokenUsage(
      systemPrompt,
      messages,
      ragDocuments,
      currentInput,
      modelId
    );

    if (usage.percentage >= this.EMERGENCY_THRESHOLD) {
      return {
        shouldOptimize: true,
        reason: 'Context window nearly full - immediate optimization required',
        urgency: 'high'
      };
    }

    if (usage.percentage >= 90) {
      return {
        shouldOptimize: true,
        reason: 'Context window is filling up - optimization recommended',
        urgency: 'medium'
      };
    }

    if (usage.percentage >= this.WARNING_THRESHOLD) {
      return {
        shouldOptimize: true,
        reason: 'Context usage is getting high - proactive optimization suggested',
        urgency: 'low'
      };
    }

    return {
      shouldOptimize: false,
      reason: 'Context usage is healthy',
      urgency: 'low'
    };
  }
}

export const contextManager = new ContextManager(); 