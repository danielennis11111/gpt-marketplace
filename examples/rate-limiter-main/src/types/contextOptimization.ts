export interface CompressionStrategy {
  type: 'lossless' | 'semantic' | 'summary' | 'hybrid';
  compressionRatio: number;
  preserveKey: boolean;
  metadata: {
    originalTokens: number;
    compressedTokens: number;
    accuracy: number;
  };
}

export interface ChatHistoryCache {
  id: string;
  conversationId: string;
  compressed: boolean;
  strategy?: CompressionStrategy;
  data: string;
  timestamp: Date;
  accessCount: number;
  size: number;
  checksum: string;
}

export interface IndexEntry {
  id: string;
  messageId: string;
  conversationId: string;
  content: string;
  keywords: string[];
  semanticHash: string;
  importance: number;
  references: string[];
  timestamp: Date;
}

export interface ContextIndex {
  entries: Map<string, IndexEntry>;
  semanticTree: SemanticNode[];
  keywordMap: Map<string, string[]>;
  lastUpdated: Date;
}

export interface SemanticNode {
  id: string;
  content: string;
  children: string[];
  parent?: string;
  similarity: number;
  cluster: string;
}

export interface PDFChunk {
  id: string;
  sourceFile: string;
  pageStart: number;
  pageEnd: number;
  content: string;
  tokens: number;
  metadata: {
    title?: string;
    section?: string;
    importance: number;
  };
}

export interface EmergencyMode {
  active: boolean;
  reason: 'bandwidth' | 'rate_limit' | 'context_overflow' | 'system_error';
  fallbackStrategy: 'compression' | 'truncation' | 'summarization' | 'cache_only';
  reducedFeatures: string[];
  emergencyCache: ChatHistoryCache[];
}

export interface ContextOptimizationState {
  cache: ChatHistoryCache[];
  index: ContextIndex;
  compressionEnabled: boolean;
  emergencyMode: EmergencyMode;
  pdfChunks: PDFChunk[];
  settings: {
    maxCacheSize: number;
    compressionThreshold: number;
    indexingEnabled: boolean;
    semanticSearchEnabled: boolean;
    autoCompressionEnabled: boolean;
    emergencyModeThreshold: number;
  };
}

export interface OptimizationAction {
  type: 'compress' | 'decompress' | 'index' | 'search' | 'chunk_pdf' | 'emergency_mode' | 'cache_clear';
  payload: any;
  timestamp: Date;
  result?: {
    success: boolean;
    tokensAffected: number;
    compressionRatio?: number;
    error?: string;
  };
} 