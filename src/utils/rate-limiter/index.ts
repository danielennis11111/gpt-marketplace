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

// Re-export the services
export { ModelManager } from '../../../examples/rate-limiter-main/src/services/ModelManager';
export { ConversationManager } from '../../../examples/rate-limiter-main/src/services/ConversationManager';

// Re-export types from types.ts
export type { Conversation, Message } from '../../../examples/rate-limiter-main/src/types';

// Re-export types from types/index.ts
export type { AIModel, ConversationTemplate } from '../../../examples/rate-limiter-main/src/types/index'; 