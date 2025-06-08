export interface Message {
  id: string;
  content: string;
  timestamp: Date;
  isUser: boolean;
  compressed?: boolean;
  originalTokens?: number;
  compressionRatio?: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  tokenCount: number;
  compressionEnabled?: boolean;
  snapshots?: string[];
  lastOptimized?: Date;
}

export interface ContextWindowInfo {
  currentTokens: number;
  maxTokens: number;
  warningThreshold: number; // percentage when to show warning
  modelName: string;
  compressionActive?: boolean;
  optimizationScore?: number;
}

export interface ModelInfo {
  name: string;
  maxContextTokens: number;
  description: string;
  costPer1kTokens: number;
  supportsCompression?: boolean;
  emergencyFallback?: string;
}

export interface RateLimitInfo {
  currentRequests: number;
  maxRequests: number;
  resetTime: Date;
  isBlocked: boolean;
  emergencyModeTriggered?: boolean;
}

export interface PDFDocument {
  id: string;
  name: string;
  size: number;
  pageCount: number;
  uploadedAt: Date;
  tokenCount: number;
  chunks?: PDFChunk[];
}

export interface PDFChunk {
  id: string;
  pageNumber: number;
  content: string;
  tokenCount: number;
  metadata: {
    title?: string;
    section?: string;
    importance: number;
  };
}

// Re-export context optimization types
export * from './types/contextOptimization'; 