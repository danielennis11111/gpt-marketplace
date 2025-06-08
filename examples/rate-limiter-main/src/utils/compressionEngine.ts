import { CompressionStrategy, ChatHistoryCache } from '../types/contextOptimization';
import { Message } from '../types/index';

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
  compressSummary(messages: any[], conversationId: string = 'unknown'): { compressed: string; ratio: number } {
    const originalContent = messages.map(m => m.content).join(' ');
    const originalTokens = Math.ceil(originalContent.length / 4);
    
    // Extract key topics and decisions
    const keyPoints = this.extractKeyPoints(messages);
    const compressed = `[SUMMARY] Key points: ${keyPoints.join('; ')}`;
    
    const ratio = compressed.length / originalContent.length;
    const compressedTokens = Math.ceil(compressed.length / 4);
    
    // Summary compression has lower accuracy but high compression
    const accuracy = 0.6;
    
    this.recordCompressionEvent('summary', originalTokens, compressedTokens, ratio, accuracy, conversationId, messages.length);
    
    return { compressed, ratio };
  }

  // Hybrid compression combining multiple strategies
  compressHybrid(messages: any[], strategy: CompressionStrategy, conversationId: string = 'unknown'): { compressed: string; ratio: number } {
    const originalContent = messages.map(m => m.content).join(' ');
    const originalTokens = Math.ceil(originalContent.length / 4);
    
    const recentMessages = messages.slice(-5); // Keep recent messages uncompressed
    const oldMessages = messages.slice(0, -5);
    
    let compressedOld = '';
    if (oldMessages.length > 0) {
      const { compressed } = this.compressSummary(oldMessages, conversationId);
      compressedOld = compressed;
    }
    
    const recentContent = recentMessages.map(m => {
      // Handle both message interface types
      const isUser = 'role' in m ? m.role === 'user' : (m as any).isUser;
      return `${isUser ? 'User' : 'AI'}: ${m.content}`;
    }).join('\n');
    const finalContent = compressedOld + '\n\n[RECENT]\n' + recentContent;
    
    const ratio = finalContent.length / originalContent.length;
    const compressedTokens = Math.ceil(finalContent.length / 4);
    
    // Hybrid has good accuracy for recent messages, lower for old
    const accuracy = 0.8;
    
    this.recordCompressionEvent('hybrid', originalTokens, compressedTokens, ratio, accuracy, conversationId, messages.length);
    
    return { compressed: finalContent, ratio };
  }

  // Decompress content back to readable format
  decompress(compressed: string, strategy: CompressionStrategy): string {
    let result = compressed;
    
    if (strategy.type === 'lossless') {
      // Reverse pattern replacements
      const patterns = new Map([
        ['§IU§', 'I understand'],
        ['§CYH§', 'can you help'],
        ['§TY§', 'thank you'],
        ['§LMK§', 'let me know'],
        ['§BTW§', 'by the way'],
      ]);
      
      patterns.forEach((original, replacement) => {
        result = result.replace(new RegExp(replacement, 'g'), original);
      });
      
      // Reverse RLE
      result = result.replace(/(.)\[(\d+)\]/g, (match, char, count) => {
        return char.repeat(parseInt(count));
      });
    }
    
    return result;
  }

  // Create compression strategy based on content analysis
  analyzeAndRecommendStrategy(messages: any[], tokenCount: number): CompressionStrategy {
    const avgMessageLength = messages.reduce((sum, m) => sum + m.content.length, 0) / messages.length;
    const hasRepeatedPatterns = this.detectPatterns(messages);
    
    let type: CompressionStrategy['type'] = 'lossless';
    let preserveKey = true;
    
    if (tokenCount > 8000) {
      type = 'hybrid';
      preserveKey = false;
    } else if (avgMessageLength > 200) {
      type = 'semantic';
    } else if (hasRepeatedPatterns) {
      type = 'lossless';
    }
    
    return {
      type,
      compressionRatio: 0.7,
      preserveKey,
      metadata: {
        originalTokens: tokenCount,
        compressedTokens: 0,
        accuracy: type === 'lossless' ? 1.0 : 0.8
      }
    };
  }

  private extractKeyPoints(messages: any[]): string[] {
    const allContent = messages.map(m => m.content).join(' ');
    
    // Simple keyword extraction (in real implementation, use NLP)
    const keywords = allContent.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
    const questions = allContent.match(/[^.!?]*\?[^.!?]*/g) || [];
    const decisions = allContent.match(/(?:decided|chose|selected|will|going to)[^.!?]*/gi) || [];
    
    return Array.from(new Set([...keywords.slice(0, 3), ...questions.slice(0, 2), ...decisions.slice(0, 2)]));
  }

  private detectPatterns(messages: any[]): boolean {
    const contents = messages.map(m => m.content);
    const patterns = ['I understand', 'can you help', 'thank you'];
    
    return patterns.some(pattern => 
      contents.filter(content => content.toLowerCase().includes(pattern.toLowerCase())).length > 1
    );
  }

  // Generate checksum for integrity verification
  generateChecksum(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  // Reset statistics (for testing or cleanup)
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

  // Get compression efficiency report
  getEfficiencyReport(): {
    totalTokensSaved: number;
    averageCompressionRatio: number;
    losslessPercentage: number;
    compressionsByStrategy: Array<{ strategy: string; count: number; tokensSaved: number; avgRatio: number }>;
  } {
    const events = this.compressionEvents;
    
    const strategyStats = events.reduce((acc, event) => {
      if (!acc[event.strategy]) {
        acc[event.strategy] = {
          count: 0,
          tokensSaved: 0,
          totalRatio: 0
        };
      }
      
      acc[event.strategy].count++;
      acc[event.strategy].tokensSaved += event.originalTokens - event.compressedTokens;
      acc[event.strategy].totalRatio += event.ratio;
      
      return acc;
    }, {} as Record<string, { count: number; tokensSaved: number; totalRatio: number }>);

    const compressionsByStrategy = Object.entries(strategyStats).map(([strategy, stats]) => ({
      strategy,
      count: stats.count,
      tokensSaved: stats.tokensSaved,
      avgRatio: stats.totalRatio / stats.count
    }));

    return {
      totalTokensSaved: this.statistics.totalTokensSaved,
      averageCompressionRatio: this.statistics.averageCompressionRatio,
      losslessPercentage: this.statistics.losslessPercentage,
      compressionsByStrategy
    };
  }
} 