/**
 * Rate-Limiter Adapter
 * 
 * This file adapts components from the rate-limiter-main project
 * to work within our application structure.
 */

// Re-export the components
export { default as ConversationView } from '../../../examples/rate-limiter-main/src/components/ConversationView';
export { default as ConversationSidebar } from '../../../examples/rate-limiter-main/src/components/ConversationSidebar';
export { default as WelcomeExperience } from '../../../examples/rate-limiter-main/src/components/WelcomeExperience';
export { default as ModelStatusBar } from '../../../examples/rate-limiter-main/src/components/ModelStatusBar';

// Export our local implementation of ServiceLogo
export { default as ServiceLogo } from './ServiceLogo';

// Re-export the services
export { ModelManager } from '../../../examples/rate-limiter-main/src/services/ModelManager';
export { ConversationManager } from '../../../examples/rate-limiter-main/src/services/ConversationManager';
export { default as AIServiceRouter } from './AIServiceRouter';
export { default as LocalTTSService } from './LocalTTSService';
export { getUnifiedTTS } from './UnifiedTTSService';

// Export our local service adapters
export { LlamaService } from './llamaService';
export { PDFProcessor } from './pdfProcessor';
export { EnhancedRAGProcessor } from './enhancedRAG';

// Export utility functions
export { estimateTokenCount } from './tokenCounter';
export { convertRAGResultsToCitations, filterAndRankCitations, createRAGDiscovery, parseTextWithHighlighting } from './citationParser';
export { generateChatSummary, formatLastMessageTime } from './chatSummary';

// Re-export types from types.ts
export type { Conversation, Message } from '../../../examples/rate-limiter-main/src/types';

// Re-export types from types/index.ts
export type { AIModel, ConversationTemplate } from '../../../examples/rate-limiter-main/src/types/index'; 