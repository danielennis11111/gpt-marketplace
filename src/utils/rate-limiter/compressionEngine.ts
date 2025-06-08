import { Message } from '../../types';

export interface CompressionStrategy {
  type: 'lossless' | 'semantic' | 'summary' | 'hybrid';
  options?: {
    preserveRatio?: number;
    summaryLength?: number;
    includeChecksum?: boolean;
  };
}

export interface CompressionEvent {
  id: string;
  timestamp: Date;
  strategy: CompressionStrategy['type'];
  originalTokens: number;
  compressedTokens: number;
  ratio: number;
  accuracy: number;
  conversationId: string;
  messageCount: number;
}

export interface CompressionStatistics {
  totalCompressions: number;
  compressionsByType: Record<string, number>;
  averageCompressionRatio: number;
  totalTokensSaved: number;
  losslessPercentage: number;
  averageAccuracy: number;
  mostEffectiveStrategy: string;
  recentCompressions: CompressionEvent[];
  compressionHistory: {
    daily: { date: string; compressions: number; tokensSaved: number }[];
    weekly: { week: string; compressions: number; tokensSaved: number }[];
  };
}

export class CompressionEngine {
  private static instance: CompressionEngine;
  private compressionEvents: CompressionEvent[] = [];
  private statistics: CompressionStatistics;
  
  constructor() {
    this.statistics = {
      totalCompressions: 0,
      compressionsByType: {},
      averageCompressionRatio: 1.0,
      totalTokensSaved: 0,
      losslessPercentage: 0,
      averageAccuracy: 1.0,
      mostEffectiveStrategy: 'lossless',
      recentCompressions: [],
      compressionHistory: {
        daily: [],
        weekly: []
      }
    };
  }
  
  static getInstance(): CompressionEngine {
    if (!CompressionEngine.instance) {
      CompressionEngine.instance = new CompressionEngine();
    }
    return CompressionEngine.instance;
  }

  // Record a compression event and update statistics
  private recordCompressionEvent(
    strategy: CompressionStrategy['type'],
    originalTokens: number,
    compressedTokens: number,
    ratio: number,
    accuracy: number,
    conversationId: string,
    messageCount: number
  ): void {
    const event: CompressionEvent = {
      id: `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      strategy,
      originalTokens,
      compressedTokens,
      ratio,
      accuracy,
      conversationId,
      messageCount
    };

    this.compressionEvents.push(event);
    
    // Keep only last 100 events to prevent memory issues
    if (this.compressionEvents.length > 100) {
      this.compressionEvents = this.compressionEvents.slice(-100);
    }

    this.updateStatistics();
  }

  // Update comprehensive compression statistics
  private updateStatistics(): void {
    const events = this.compressionEvents;
    
    if (events.length === 0) return;

    // Basic stats
    this.statistics.totalCompressions = events.length;
    this.statistics.averageCompressionRatio = events.reduce((sum, e) => sum + e.ratio, 0) / events.length;
    this.statistics.totalTokensSaved = events.reduce((sum, e) => sum + (e.originalTokens - e.compressedTokens), 0);
    this.statistics.averageAccuracy = events.reduce((sum, e) => sum + e.accuracy, 0) / events.length;

    // Compressions by type
    this.statistics.compressionsByType = events.reduce((acc, event) => {
      acc[event.strategy] = (acc[event.strategy] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Lossless percentage
    const losslessCompressions = events.filter(e => e.strategy === 'lossless' || e.accuracy >= 0.99).length;
    this.statistics.losslessPercentage = (losslessCompressions / events.length) * 100;

    // Most effective strategy (highest token savings)
    const strategyEffectiveness = events.reduce((acc, event) => {
      const saved = event.originalTokens - event.compressedTokens;
      acc[event.strategy] = (acc[event.strategy] || 0) + saved;
      return acc;
    }, {} as Record<string, number>);
    
    this.statistics.mostEffectiveStrategy = Object.entries(strategyEffectiveness)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'lossless';

    // Recent compressions (last 10)
    this.statistics.recentCompressions = events.slice(-10);

    // Daily/weekly history
    this.updateCompressionHistory();
  }

  // Update compression history for trends
  private updateCompressionHistory(): void {
    const events = this.compressionEvents;
    const now = new Date();
    
    // Daily history (last 7 days)
    const dailyMap = new Map<string, { compressions: number; tokensSaved: number }>();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyMap.set(dateStr, { compressions: 0, tokensSaved: 0 });
    }

    events.forEach(event => {
      const dateStr = event.timestamp.toISOString().split('T')[0];
      const existing = dailyMap.get(dateStr);
      if (existing) {
        existing.compressions++;
        existing.tokensSaved += event.originalTokens - event.compressedTokens;
      }
    });

    this.statistics.compressionHistory.daily = Array.from(dailyMap.entries())
      .map(([date, stats]) => ({ date, ...stats }));

    // Weekly history (last 4 weeks)
    const weeklyMap = new Map<string, { compressions: number; tokensSaved: number }>();
    
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + 7 * i));
      const weekStr = `Week of ${weekStart.toISOString().split('T')[0]}`;
      weeklyMap.set(weekStr, { compressions: 0, tokensSaved: 0 });
    }

    events.forEach(event => {
      const eventDate = new Date(event.timestamp);
      const weekStart = new Date(eventDate);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekStr = `Week of ${weekStart.toISOString().split('T')[0]}`;
      
      const existing = weeklyMap.get(weekStr);
      if (existing) {
        existing.compressions++;
        existing.tokensSaved += event.originalTokens - event.compressedTokens;
      }
    });

    this.statistics.compressionHistory.weekly = Array.from(weeklyMap.entries())
      .map(([week, stats]) => ({ week, ...stats }));
  }

  // Get comprehensive compression statistics
  getCompressionStatistics(): CompressionStatistics {
    return { ...this.statistics };
  }

  // Lossless compression using run-length encoding and pattern detection
  compressLossless(content: string, conversationId: string = 'unknown', messageCount: number = 1): { compressed: string; ratio: number } {
    const originalTokens = Math.ceil(content.length / 4); // Rough token estimate

    // Simple RLE compression for repeated patterns
    const compressed = content.replace(/(.)\1{2,}/g, (match, char) => {
      return `${char}[${match.length}]`;
    });
    
    // Pattern-based compression for common phrases
    const patterns = new Map([
      ['I understand', '§IU§'],
      ['can you help', '§CYH§'],
      ['thank you', '§TY§'],
      ['let me know', '§LMK§'],
      ['by the way', '§BTW§'],
    ]);
    
    let result = compressed;
    patterns.forEach((replacement, pattern) => {
      result = result.replace(new RegExp(pattern, 'gi'), replacement);
    });
    
    const ratio = result.length / content.length;
    const compressedTokens = Math.ceil(result.length / 4);
    
    // Record the compression event
    this.recordCompressionEvent('lossless', originalTokens, compressedTokens, ratio, 1.0, conversationId, messageCount);
    
    return { compressed: result, ratio };
  }

  // Semantic compression using key phrase extraction
  compressSemantic(content: string, preserveRatio: number = 0.7, conversationId: string = 'unknown', messageCount: number = 1): { compressed: string; ratio: number } {
    const originalTokens = Math.ceil(content.length / 4);
    
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const importantSentences = sentences.slice(0, Math.ceil(sentences.length * preserveRatio));
    
    const compressed = importantSentences.join('. ') + '.';
    const ratio = compressed.length / content.length;
    const compressedTokens = Math.ceil(compressed.length / 4);
    
    // Accuracy is estimated based on how much content was preserved
    const accuracy = preserveRatio * 0.9; // Slightly lower than preserve ratio due to information loss
    
    this.recordCompressionEvent('semantic', originalTokens, compressedTokens, ratio, accuracy, conversationId, messageCount);
    
    return { compressed, ratio };
  }

  // Summary-based compression
  compressSummary(messages: Message[], conversationId: string = 'unknown'): { compressed: string; ratio: number } {
    const originalContent = messages.map(m => m.content).join(' ');
    const originalTokens = Math.ceil(originalContent.length / 4);
    
    // Extract key topics and decisions
    const keyPoints = this.extractKeyPoints(messages);
    const compressed = `[SUMMARY] Key points: ${keyPoints.join('; ')}`;
    
    const ratio = compressed.length / originalContent.length;
    const compressedTokens = Math.ceil(compressed.length / 4);
    
    this.recordCompressionEvent('summary', originalTokens, compressedTokens, ratio, 0.7, conversationId, messages.length);
    
    return { compressed, ratio };
  }

  // Hybrid compression - combines multiple approaches
  compressHybrid(messages: Message[], strategy: CompressionStrategy, conversationId: string = 'unknown'): { compressed: string; ratio: number } {
    const originalContent = messages.map(m => m.content).join(' ');
    const originalTokens = Math.ceil(originalContent.length / 4);
    
    let compressed = '';
    
    // For newer messages, use lossless compression
    const recentMessages = messages.slice(-3);
    const olderMessages = messages.slice(0, -3);
    
    // Use summary for older messages
    if (olderMessages.length > 0) {
      const keyPoints = this.extractKeyPoints(olderMessages);
      compressed += `[EARLIER] ${keyPoints.join('; ')}. `;
    }
    
    // Use lossless for recent messages
    if (recentMessages.length > 0) {
      const recentText = recentMessages.map(m => `${m.role}: ${m.content}`).join('\n');
      const { compressed: losslessCompressed } = this.compressLossless(recentText, conversationId);
      compressed += `[RECENT] ${losslessCompressed}`;
    }
    
    const ratio = compressed.length / originalContent.length;
    const compressedTokens = Math.ceil(compressed.length / 4);
    
    this.recordCompressionEvent('hybrid', originalTokens, compressedTokens, ratio, 0.85, conversationId, messages.length);
    
    return { compressed, ratio };
  }

  // Decompress content based on compression strategy
  decompress(compressed: string, strategy: CompressionStrategy): string {
    if (strategy.type === 'lossless') {
      // Reverse pattern compression
      const patterns = new Map([
        ['§IU§', 'I understand'],
        ['§CYH§', 'can you help'],
        ['§TY§', 'thank you'],
        ['§LMK§', 'let me know'],
        ['§BTW§', 'by the way'],
      ]);
      
      let result = compressed;
      patterns.forEach((replacement, pattern) => {
        result = result.replace(new RegExp(pattern, 'gi'), replacement);
      });
      
      // Reverse RLE compression
      result = result.replace(/(.)\[(\d+)\]/g, (_, char, count) => {
        return char.repeat(parseInt(count, 10));
      });
      
      return result;
    }
    
    // For other compression types, we can't fully restore the original
    // So we just return the compressed version with a note
    if (strategy.type === 'summary' || strategy.type === 'hybrid') {
      return `[This content was compressed using ${strategy.type} compression]:\n${compressed}`;
    }
    
    return compressed;
  }

  // Analyze conversation and recommend best compression strategy
  analyzeAndRecommendStrategy(messages: Message[], tokenCount: number): CompressionStrategy {
    // If small enough, use lossless to preserve everything
    if (tokenCount < 1000) {
      return { type: 'lossless' };
    }
    
    // If messages contain lots of repetition, use lossless
    if (this.detectPatterns(messages)) {
      return { type: 'lossless' };
    }
    
    // For medium conversations, use semantic compression
    if (tokenCount < 5000) {
      return { 
        type: 'semantic', 
        options: { 
          preserveRatio: 0.8
        } 
      };
    }
    
    // For large conversations, use hybrid approach
    return { 
      type: 'hybrid', 
      options: { 
        preserveRatio: 0.6,
        includeChecksum: true
      } 
    };
  }

  // Extract key points from a set of messages
  private extractKeyPoints(messages: Message[]): string[] {
    // Simple implementation - extract first sentence from each message
    const keyPoints = messages.map(message => {
      const sentences = message.content.split(/[.!?]+/).filter(s => s.trim().length > 0);
      return sentences[0] || message.content.substring(0, 100);
    });
    
    // Deduplicate and limit to reasonable number
    return Array.from(new Set(keyPoints)).slice(0, 5);
  }

  // Detect if messages contain patterns that would benefit from lossless compression
  private detectPatterns(messages: Message[]): boolean {
    const combinedText = messages.map(m => m.content).join(' ');
    
    // Check for repeated characters
    const hasRepeatedChars = /(.)\1{5,}/.test(combinedText);
    
    // Check for common phrases that we can compress
    const hasCommonPhrases = /I understand|can you help|thank you|let me know|by the way/i.test(combinedText);
    
    return hasRepeatedChars || hasCommonPhrases;
  }

  // Generate a checksum for verification after decompression
  generateChecksum(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
  }

  // Reset statistics for testing or clearing history
  resetStatistics(): void {
    this.compressionEvents = [];
    this.statistics = {
      totalCompressions: 0,
      compressionsByType: {},
      averageCompressionRatio: 1.0,
      totalTokensSaved: 0,
      losslessPercentage: 0,
      averageAccuracy: 1.0,
      mostEffectiveStrategy: 'lossless',
      recentCompressions: [],
      compressionHistory: {
        daily: [],
        weekly: []
      }
    };
  }

  // Get efficiency report for dashboard
  getEfficiencyReport(): {
    totalTokensSaved: number;
    averageCompressionRatio: number;
    losslessPercentage: number;
    compressionsByStrategy: Array<{ strategy: string; count: number; tokensSaved: number; avgRatio: number }>;
  } {
    const { totalTokensSaved, averageCompressionRatio, losslessPercentage, compressionsByType } = this.statistics;
    
    // Calculate detailed stats by strategy
    const compressionsByStrategy = Object.entries(compressionsByType).map(([strategy, count]) => {
      const events = this.compressionEvents.filter(e => e.strategy === strategy);
      const tokensSaved = events.reduce((sum, e) => sum + (e.originalTokens - e.compressedTokens), 0);
      const avgRatio = events.reduce((sum, e) => sum + e.ratio, 0) / (events.length || 1);
      
      return { strategy, count, tokensSaved, avgRatio };
    });
    
    return {
      totalTokensSaved,
      averageCompressionRatio,
      losslessPercentage,
      compressionsByStrategy
    };
  }
} 