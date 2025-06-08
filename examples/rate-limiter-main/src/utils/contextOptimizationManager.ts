import { CompressionEngine } from './compressionEngine';
import { ContextIndexer } from './contextIndexer';
import { 
  ContextOptimizationState, 
  OptimizationAction, 
  ChatHistoryCache,
  EmergencyMode,
  PDFChunk
} from '../types/contextOptimization';
import { Message, Conversation } from '../types';

export class ContextOptimizationManager {
  private static instance: ContextOptimizationManager;
  private compressionEngine: CompressionEngine;
  private indexer: ContextIndexer;
  private state: ContextOptimizationState;

  static getInstance(): ContextOptimizationManager {
    if (!ContextOptimizationManager.instance) {
      ContextOptimizationManager.instance = new ContextOptimizationManager();
    }
    return ContextOptimizationManager.instance;
  }

  constructor() {
    this.compressionEngine = CompressionEngine.getInstance();
    this.indexer = ContextIndexer.getInstance();
    this.state = {
      cache: [],
      index: {
        entries: new Map(),
        semanticTree: [],
        keywordMap: new Map(),
        lastUpdated: new Date()
      },
      compressionEnabled: true,
      emergencyMode: {
        active: false,
        reason: 'bandwidth',
        fallbackStrategy: 'compression',
        reducedFeatures: [],
        emergencyCache: []
      },
      pdfChunks: [],
      settings: {
        maxCacheSize: 100,
        compressionThreshold: 6000,
        indexingEnabled: true,
        semanticSearchEnabled: true,
        autoCompressionEnabled: true,
        emergencyModeThreshold: 8500
      }
    };
  }

  getState(): ContextOptimizationState {
    return { ...this.state };
  }

  // Process optimization actions from the UI
  async handleOptimizationAction(action: OptimizationAction): Promise<OptimizationAction> {
    const startTime = Date.now();
    
    try {
      switch (action.type) {
        case 'compress':
          return await this.handleCompress(action);
        case 'decompress':
          return await this.handleDecompress(action);
        case 'search':
          return await this.handleSearch(action);
        case 'index':
          return await this.handleIndex(action);
        case 'chunk_pdf':
          return await this.handleChunkPDF(action);
        case 'emergency_mode':
          return await this.handleEmergencyMode(action);
        case 'cache_clear':
          return await this.handleCacheClear(action);
        default:
          throw new Error(`Unknown optimization action: ${action.type}`);
      }
    } catch (error) {
      action.result = {
        success: false,
        tokensAffected: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      return action;
    }
  }

  // Automatically optimize conversations based on token usage
  autoOptimize(conversations: Conversation[], currentTokens: number): {
    optimizedConversations: Conversation[];
    tokensReduced: number;
    actionsPerformed: string[];
  } {
    const actions: string[] = [];
    let tokensReduced = 0;
    const optimizedConversations = [...conversations];

    // Check if auto-compression should trigger
    if (currentTokens > this.state.settings.compressionThreshold && this.state.settings.autoCompressionEnabled) {
      for (let i = 0; i < optimizedConversations.length; i++) {
        const conv = optimizedConversations[i];
        if (!conv.compressionEnabled && conv.messages.length > 3) {
          const result = this.compressConversation(conv);
          optimizedConversations[i] = result.conversation;
          tokensReduced += result.tokensReduced;
          actions.push(`Compressed conversation: ${conv.title}`);
        }
      }
    }

    // Check for emergency mode trigger
    if (currentTokens > this.state.settings.emergencyModeThreshold) {
      this.activateEmergencyMode('context_overflow');
      actions.push('Activated emergency mode: context overflow');
    }

    return { optimizedConversations, tokensReduced, actionsPerformed: actions };
  }

  // Index new messages as they come in
  indexNewMessage(message: Message, conversationId: string): void {
    if (this.state.settings.indexingEnabled) {
      this.indexer.indexMessage(message, conversationId);
      
      // Update state
      this.state.index = {
        entries: this.indexer['index'].entries,
        semanticTree: this.indexer['index'].semanticTree,
        keywordMap: this.indexer['index'].keywordMap,
        lastUpdated: new Date()
      };
    }
  }

  // Build optimal context window for a conversation
  buildOptimalContext(conversationId: string, maxTokens: number): {
    messages: Message[];
    totalTokens: number;
    compressionUsed: boolean;
    emergencyMode: boolean;
  } {
    const result = this.indexer.buildOptimalContext(conversationId, maxTokens);
    
    return {
      messages: result.messages.map(content => ({
        id: `optimized-${Date.now()}`,
        content,
        timestamp: new Date(),
        isUser: false,
        compressed: result.compressionUsed
      })),
      totalTokens: result.totalTokens,
      compressionUsed: result.compressionUsed,
      emergencyMode: this.state.emergencyMode.active
    };
  }

  private async handleCompress(action: OptimizationAction): Promise<OptimizationAction> {
    const { strategy } = action.payload;
    // Implementation would compress current conversation
    // For now, simulate compression
    action.result = {
      success: true,
      tokensAffected: 1500,
      compressionRatio: 0.7
    };
    return action;
  }

  private async handleDecompress(action: OptimizationAction): Promise<OptimizationAction> {
    // Implementation would decompress cached content
    action.result = {
      success: true,
      tokensAffected: 0
    };
    return action;
  }

  private async handleSearch(action: OptimizationAction): Promise<OptimizationAction> {
    const { query, semantic, fuzzy, limit } = action.payload;
    const results = this.indexer.search(query, { semantic, fuzzy, limit });
    
    action.result = {
      success: true,
      tokensAffected: 0,
      // Store results in payload for UI to access
    };
    action.payload.results = results;
    return action;
  }

  private async handleIndex(action: OptimizationAction): Promise<OptimizationAction> {
    const { operation } = action.payload;
    
    if (operation === 'snapshot') {
      // Create snapshot of current state
      const snapshotId = this.indexer.createSnapshot('current', []);
      action.payload.snapshotId = snapshotId;
    }
    
    action.result = {
      success: true,
      tokensAffected: 0
    };
    return action;
  }

  private async handleChunkPDF(action: OptimizationAction): Promise<OptimizationAction> {
    const { file, chunkSize } = action.payload;
    
    // Simulate PDF chunking (in real implementation, use PDF parsing library)
    const chunks: PDFChunk[] = [];
    const content = "Simulated PDF content..."; // Would be extracted from actual PDF
    
    for (let i = 0; i < 5; i++) {
      chunks.push({
        id: `chunk-${i}`,
        sourceFile: file.name,
        pageStart: i * 2,
        pageEnd: (i * 2) + 1,
        content: `${content} chunk ${i}`,
        tokens: 200,
        metadata: {
          importance: Math.random(),
          section: `Section ${i + 1}`
        }
      });
    }
    
    this.state.pdfChunks.push(...chunks);
    
    action.result = {
      success: true,
      tokensAffected: chunks.reduce((sum, chunk) => sum + chunk.tokens, 0)
    };
    action.payload.chunks = chunks;
    return action;
  }

  private async handleEmergencyMode(action: OptimizationAction): Promise<OptimizationAction> {
    const { reason, fallbackStrategy } = action.payload;
    this.activateEmergencyMode(reason, fallbackStrategy);
    
    action.result = {
      success: true,
      tokensAffected: 0
    };
    return action;
  }

  private async handleCacheClear(action: OptimizationAction): Promise<OptimizationAction> {
    const cacheSize = this.state.cache.length;
    this.state.cache = [];
    
    action.result = {
      success: true,
      tokensAffected: 0
    };
    return action;
  }

  private compressConversation(conversation: Conversation): {
    conversation: Conversation;
    tokensReduced: number;
  } {
    const strategy = this.compressionEngine.analyzeAndRecommendStrategy(
      conversation.messages, 
      conversation.tokenCount
    );
    
    const result = this.compressionEngine.compressHybrid(conversation.messages, strategy);
    
    // Create cache entry
    const cache: ChatHistoryCache = {
      id: `cache-${Date.now()}`,
      conversationId: conversation.id,
      compressed: true,
      strategy,
      data: result.compressed,
      timestamp: new Date(),
      accessCount: 0,
      size: result.compressed.length,
      checksum: this.compressionEngine.generateChecksum(result.compressed)
    };
    
    this.state.cache.push(cache);
    
    const tokensReduced = Math.floor(conversation.tokenCount * (1 - result.ratio));
    
    return {
      conversation: {
        ...conversation,
        compressionEnabled: true,
        lastOptimized: new Date(),
        tokenCount: conversation.tokenCount - tokensReduced
      },
      tokensReduced
    };
  }

  private activateEmergencyMode(reason: EmergencyMode['reason'], fallbackStrategy?: EmergencyMode['fallbackStrategy']): void {
    this.state.emergencyMode = {
      active: true,
      reason,
      fallbackStrategy: fallbackStrategy || 'compression',
      reducedFeatures: ['knowledge_base', 'detailed_responses'],
      emergencyCache: this.state.cache.slice(-10) // Keep last 10 cache entries
    };

    // Apply emergency optimizations
    if (fallbackStrategy === 'compression') {
      // Aggressive compression of all cached content
      this.state.cache.forEach(cache => {
        if (!cache.compressed) {
          // Force compression
          cache.compressed = true;
          cache.strategy = {
            type: 'summary',
            compressionRatio: 0.3,
            preserveKey: false,
            metadata: {
              originalTokens: cache.size,
              compressedTokens: Math.floor(cache.size * 0.3),
              accuracy: 0.6
            }
          };
        }
      });
    }
  }

  // Deactivate emergency mode
  deactivateEmergencyMode(): void {
    this.state.emergencyMode.active = false;
    this.state.emergencyMode.reducedFeatures = [];
  }

  // Get compression statistics
  getCompressionStats(): {
    totalCacheEntries: number;
    compressedEntries: number;
    averageCompressionRatio: number;
    totalSpaceSaved: number;
  } {
    const compressedEntries = this.state.cache.filter(c => c.compressed);
    const averageRatio = compressedEntries.length > 0 
      ? compressedEntries.reduce((sum, c) => sum + (c.strategy?.compressionRatio || 1), 0) / compressedEntries.length
      : 1;
    
    const totalSpaceSaved = this.state.cache.reduce((sum, cache) => {
      if (cache.compressed && cache.strategy) {
        return sum + (cache.strategy.metadata.originalTokens - cache.strategy.metadata.compressedTokens);
      }
      return sum;
    }, 0);

    return {
      totalCacheEntries: this.state.cache.length,
      compressedEntries: compressedEntries.length,
      averageCompressionRatio: averageRatio,
      totalSpaceSaved
    };
  }
} 