import { ContextIndex, IndexEntry, SemanticNode } from '../types/contextOptimization';
import { Message, Conversation } from '../types';
import { Buffer } from 'buffer';

export class ContextIndexer {
  private static instance: ContextIndexer;
  private index: ContextIndex;
  
  static getInstance(): ContextIndexer {
    if (!ContextIndexer.instance) {
      ContextIndexer.instance = new ContextIndexer();
    }
    return ContextIndexer.instance;
  }

  constructor() {
    this.index = {
      entries: new Map(),
      semanticTree: [],
      keywordMap: new Map(),
      lastUpdated: new Date()
    };
  }

  // Index a new message with full context analysis
  indexMessage(message: Message, conversationId: string): void {
    const entry: IndexEntry = {
      id: `${conversationId}-${message.id}`,
      messageId: message.id,
      conversationId,
      content: message.content,
      keywords: this.extractKeywords(message.content),
      semanticHash: this.generateSemanticHash(message.content),
      importance: this.calculateImportance(message),
      references: this.findReferences(message.content),
      timestamp: message.timestamp
    };

    this.index.entries.set(entry.id, entry);
    this.updateKeywordMap(entry);
    this.updateSemanticTree(entry);
    this.index.lastUpdated = new Date();
  }

  // Git-like search with semantic similarity
  search(query: string, options: {
    fuzzy?: boolean;
    semantic?: boolean;
    timeRange?: { start: Date; end: Date };
    conversationId?: string;
    limit?: number;
  } = {}): IndexEntry[] {
    const results: Array<{ entry: IndexEntry; score: number }> = [];
    
    this.index.entries.forEach(entry => {
      let score = 0;
      
      // Time filter
      if (options.timeRange) {
        if (entry.timestamp < options.timeRange.start || entry.timestamp > options.timeRange.end) {
          return;
        }
      }
      
      // Conversation filter
      if (options.conversationId && entry.conversationId !== options.conversationId) {
        return;
      }
      
      // Exact keyword matching
      const queryKeywords = this.extractKeywords(query);
      const matchingKeywords = entry.keywords.filter(k => 
        queryKeywords.some(qk => k.toLowerCase().includes(qk.toLowerCase()))
      );
      score += matchingKeywords.length * 10;
      
      // Fuzzy content matching
      if (options.fuzzy !== false) {
        score += this.fuzzyMatch(query, entry.content);
      }
      
      // Semantic similarity
      if (options.semantic) {
        score += this.semanticSimilarity(query, entry.content) * 20;
      }
      
      // Importance weighting
      score *= entry.importance;
      
      if (score > 0) {
        results.push({ entry, score });
      }
    });
    
    // Sort by score and apply limit
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, options.limit || 10).map(r => r.entry);
  }

  // Create git-like commit for conversation state
  createSnapshot(conversationId: string, messages: Message[]): string {
    const snapshotId = `snap_${Date.now()}_${conversationId}`;
    const snapshot = {
      id: snapshotId,
      conversationId,
      messageCount: messages.length,
      totalTokens: messages.reduce((sum, m) => sum + this.estimateTokens(m.content), 0),
      checksum: this.generateConversationHash(messages),
      timestamp: new Date(),
      indexEntries: messages.map(m => `${conversationId}-${m.id}`)
    };
    
    // Store snapshot metadata (in real app, persist this)
    console.log('Created snapshot:', snapshot);
    return snapshotId;
  }

  // Git-like diff between conversation states
  diff(beforeSnapshot: string, afterSnapshot: string): {
    added: IndexEntry[];
    modified: IndexEntry[];
    removed: string[];
  } {
    // Simplified diff implementation
    // In real implementation, compare actual snapshots
    return {
      added: [],
      modified: [],
      removed: []
    };
  }

  // Efficient context window assembly
  buildOptimalContext(conversationId: string, maxTokens: number): {
    messages: string[];
    totalTokens: number;
    compressionUsed: boolean;
  } {
    const entries = Array.from(this.index.entries.values())
      .filter(e => e.conversationId === conversationId)
      .sort((a, b) => b.importance - a.importance);
    
    let totalTokens = 0;
    const selectedMessages: string[] = [];
    let compressionUsed = false;
    
    for (const entry of entries) {
      const tokens = this.estimateTokens(entry.content);
      
      if (totalTokens + tokens <= maxTokens) {
        selectedMessages.push(entry.content);
        totalTokens += tokens;
      } else if (maxTokens - totalTokens > 50) {
        // Try compression for remaining space
        const compressed = this.compressForSpace(entry.content, maxTokens - totalTokens);
        if (compressed) {
          selectedMessages.push(compressed);
          totalTokens += this.estimateTokens(compressed);
          compressionUsed = true;
        }
        break;
      }
    }
    
    return { messages: selectedMessages, totalTokens, compressionUsed };
  }

  private extractKeywords(content: string): string[] {
    // Extract meaningful keywords
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !this.isStopWord(word));
    
    // Get unique words with frequency > 1 or important single words
    const wordFreq = new Map<string, number>();
    words.forEach(word => {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    });
    
    return Array.from(wordFreq.entries())
      .filter(([word, freq]) => freq > 1 || this.isImportantWord(word))
      .map(([word]) => word)
      .slice(0, 10);
  }

  private generateSemanticHash(content: string): string {
    // Simple semantic hash based on content structure
    const words = this.extractKeywords(content);
    const structure = {
      wordCount: content.split(' ').length,
      hasQuestion: content.includes('?'),
      hasExclamation: content.includes('!'),
      keywordHash: words.join('').toLowerCase()
    };
    
    return Buffer.from(JSON.stringify(structure)).toString('base64').slice(0, 16);
  }

  private calculateImportance(message: Message): number {
    let importance = 1.0;
    
    // Questions are important
    if (message.content.includes('?')) importance += 0.5;
    
    // Long messages might be more important
    if (message.content.length > 200) importance += 0.3;
    
    // Contains decision keywords
    if (/\b(decided|choose|will|plan|important)\b/i.test(message.content)) {
      importance += 0.4;
    }
    
    // Recent messages are more important
    const ageInHours = (Date.now() - message.timestamp.getTime()) / (1000 * 60 * 60);
    if (ageInHours < 1) importance += 0.2;
    
    return Math.min(importance, 2.0);
  }

  private findReferences(content: string): string[] {
    // Find references to other parts of conversation
    const references: string[] = [];
    
    // Look for patterns like "as we discussed", "mentioned earlier", etc.
    const refPatterns = [
      /as we discussed/gi,
      /mentioned earlier/gi,
      /previously/gi,
      /referring to/gi
    ];
    
    refPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        references.push(pattern.source);
      }
    });
    
    return references;
  }

  private updateKeywordMap(entry: IndexEntry): void {
    entry.keywords.forEach(keyword => {
      const existing = this.index.keywordMap.get(keyword) || [];
      existing.push(entry.id);
      this.index.keywordMap.set(keyword, existing);
    });
  }

  private updateSemanticTree(entry: IndexEntry): void {
    // Find semantic similarities and build tree structure
    const similarEntries = this.findSemanticallySimilar(entry);
    
    const node: SemanticNode = {
      id: entry.id,
      content: entry.content.slice(0, 100) + '...',
      children: [],
      similarity: 1.0,
      cluster: this.assignCluster(entry)
    };
    
    this.index.semanticTree.push(node);
  }

  private fuzzyMatch(query: string, content: string): number {
    const queryWords = query.toLowerCase().split(' ');
    const contentWords = content.toLowerCase().split(' ');
    
    let matches = 0;
    queryWords.forEach(qWord => {
      if (contentWords.some(cWord => 
        cWord.includes(qWord) || qWord.includes(cWord) || 
        this.levenshteinDistance(qWord, cWord) <= 2
      )) {
        matches++;
      }
    });
    
    return (matches / queryWords.length) * 10;
  }

  private semanticSimilarity(query: string, content: string): number {
    // Simple semantic similarity based on keyword overlap
    const queryKeywords = this.extractKeywords(query);
    const contentKeywords = this.extractKeywords(content);
    
    const intersection = queryKeywords.filter(q => contentKeywords.includes(q));
    const union = Array.from(new Set([...queryKeywords, ...contentKeywords]));
    
    return union.length > 0 ? intersection.length / union.length : 0;
  }

  private findSemanticallySimilar(entry: IndexEntry): IndexEntry[] {
    return Array.from(this.index.entries.values())
      .filter(e => e.id !== entry.id)
      .filter(e => this.semanticSimilarity(entry.content, e.content) > 0.3)
      .slice(0, 5);
  }

  private assignCluster(entry: IndexEntry): string {
    // Simple clustering based on dominant keywords
    const dominantKeywords = entry.keywords.slice(0, 3);
    return dominantKeywords.join('_').toLowerCase() || 'general';
  }

  private isStopWord(word: string): boolean {
    const stopWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'this', 'that', 'these', 'those'];
    return stopWords.includes(word.toLowerCase());
  }

  private isImportantWord(word: string): boolean {
    const importantPatterns = /^(how|what|when|where|why|who|can|will|should|would|could|might|must|need|want|like|think|know|understand|help|problem|solution|issue|question|answer|important|critical|urgent|please|thanks|sorry)$/i;
    return importantPatterns.test(word);
  }

  private estimateTokens(content: string): number {
    return Math.ceil(content.length / 4);
  }

  private compressForSpace(content: string, maxTokens: number): string | null {
    const targetLength = maxTokens * 4;
    if (content.length <= targetLength) return content;
    
    // Simple truncation with ellipsis
    return content.slice(0, targetLength - 3) + '...';
  }

  private generateConversationHash(messages: Message[]): string {
    const content = messages.map(m => `${m.id}:${m.content.slice(0, 50)}`).join('|');
    return Buffer.from(content).toString('base64').slice(0, 16);
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }
} 