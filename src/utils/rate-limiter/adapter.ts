import { ConversationManager as OriginalConversationManager } from '../../../examples/rate-limiter-main/src/services/ConversationManager';
import { ModelManager as OriginalModelManager } from '../../../examples/rate-limiter-main/src/services/ModelManager';
import type { AIModel, Conversation, ConversationTemplate, Message } from '../../../examples/rate-limiter-main/src/types/index';
import { useSettings } from '../../contexts/SettingsContext';
import { useOllama } from '../../hooks/useOllama';
import { llamaService } from './llamaService';

// Adapter for the ModelManager class
export class AsuModelManager {
  private modelManager: OriginalModelManager;
  
  constructor() {
    // Create the model manager first
    this.modelManager = new OriginalModelManager();
    
    // Disable status monitoring after creation using an approach that doesn't
    // directly access private methods
    try {
      // @ts-ignore - Using a custom method to stop monitoring
      if (typeof this.modelManager.stopStatusMonitoring === 'function') {
        // @ts-ignore
        this.modelManager.stopStatusMonitoring();
      }
    } catch (e) {
      console.error('Error stopping status monitoring:', e);
    }
    
    // Clear any default models and initialize with our own
    try {
      // @ts-ignore - Accessing private property
      this.modelManager.models = new Map();
    } catch (e) {
      console.error('Error clearing models:', e);
    }
    
    this.initialize();
  }

  private initialize() {
    // Add Ollama model only
    try {
      this.modelManager.addModel({
        id: 'ollama-local',
        name: 'Ollama (Local)',
        maxContextLength: 8192,
        isConnected: false,
        userDisplay: {
          displayName: 'Ollama',
          description: 'Run local models with Ollama',
          logoPath: '/ollama-logo.png',
        }
      } as any); // Use type assertion as a workaround
    } catch (error) {
      console.error('Failed to add Ollama model:', error);
    }
  }

  // Public methods to expose functionality
  syncWithSettings(settings: ReturnType<typeof useSettings>['settings'], ollama: ReturnType<typeof useOllama>) {
    // Update model status based on settings
    if (settings.preferredChatProvider === 'ollama' && ollama.status.isConnected) {
      try {
        // Reset models to only include the current Ollama model
        try {
          // @ts-ignore - Accessing private property
          this.modelManager.models = new Map();
        } catch (e) {
          console.error('Error clearing models:', e);
        }
        
        // Add the current Ollama model
        const modelName = ollama.status.currentModel || 'Unknown Model';
        this.modelManager.addModel({
          id: 'ollama-local',
          name: `Ollama (${modelName})`,
          maxContextLength: 8192,
          isConnected: true,
          userDisplay: {
            displayName: 'Ollama',
            description: `Local Ollama model: ${modelName}`,
            logoPath: '/ollama-logo.png',
          }
        } as any);
        
        // Update the LlamaService with our Ollama instance
        llamaService.setOllamaInstance(ollama);
      } catch (error) {
        console.error('Error syncing with settings:', error);
      }
    } else {
      // If Ollama is not connected, mark the model as disconnected
      try {
        const models = this.getAllModels();
        const ollamaModel = models.find(m => m.id === 'ollama-local');
        
        if (ollamaModel) {
          const updatedModel = {
            ...ollamaModel,
            isConnected: false,
            name: 'Ollama (Disconnected)'
          };
          
          this.modelManager.addModel(updatedModel as any);
        }
      } catch (error) {
        console.error('Error updating model status:', error);
      }
    }
    
    return this;
  }

  getAllModels(): AIModel[] {
    try {
      return this.modelManager.getAllModels();
    } catch (error) {
      console.error('Error getting models:', error);
      return [];
    }
  }

  // Add more wrapper methods as needed
  getOriginalManager() {
    // Set a flag to disable API checks in the rate-limiter code
    // @ts-ignore - Adding a custom property
    this.modelManager.disableApiChecks = true;
    
    return this.modelManager;
  }
}

// Adapter for the ConversationManager class
export class AsuConversationManager {
  private conversationManager: OriginalConversationManager;
  
  constructor() {
    this.conversationManager = new OriginalConversationManager();
    this.initialize();
  }

  private initialize() {
    // Add default templates if none exist
    try {
      const templates = this.getAllTemplates();
      if (templates.length === 0) {
        const defaultTemplate = {
          id: 'default-chat',
          name: 'General Chat',
          description: 'General purpose chat template',
          modelId: 'ollama-local',
          systemPrompt: 'You are ASU GPT, a helpful AI assistant created by ASU. You provide clear, accurate and thoughtful responses.',
          suggestedQuestions: [
            'What resources are available for students at ASU?',
            'How can I learn more about AI and machine learning?',
            'What are the latest research areas at ASU?',
            'Can you help me understand a complex topic?'
          ],
          persona: 'ASU AI Assistant',
        } as ConversationTemplate;
        
        // Add the template to the manager's internal collection
        // Note: We don't call methods directly since they may not exist
        try {
          // Access the internal collection if possible
          // This is a workaround since we don't know the exact API
          // @ts-ignore - We're intentionally trying to access a property that may not be public
          if (this.conversationManager.templates) {
            // @ts-ignore
            this.conversationManager.templates.set(defaultTemplate.id, defaultTemplate);
          }
        } catch (e) {
          console.error('Error adding template:', e);
        }
      }
    } catch (error) {
      console.error('Error initializing templates:', error);
    }
  }

  // Public methods to expose functionality
  getAllConversations(): Conversation[] {
    try {
      const conversations = this.conversationManager.getAllConversations();
      if (conversations.length === 0) {
        // Create a default conversation
        const templates = this.getAllTemplates();
        if (templates.length > 0) {
          try {
            const newConversation = this.createConversation(templates[0].id);
            return [newConversation];
          } catch (error) {
            console.error('Error creating default conversation:', error);
          }
        }
      }
      return conversations;
    } catch (error) {
      console.error('Error getting conversations:', error);
      return [];
    }
  }

  getAllTemplates(): ConversationTemplate[] {
    try {
      return this.conversationManager.getAllTemplates();
    } catch (error) {
      console.error('Error getting templates:', error);
      return [];
    }
  }

  createConversation(templateId: string): Conversation {
    try {
      return this.conversationManager.createConversation(templateId);
    } catch (error) {
      console.error('Error creating conversation:', error);
      // Return a minimal conversation object to prevent errors
      // Cast as unknown first to avoid type errors
      return {
        id: `error-${Date.now()}`,
        title: 'New Conversation',
        messages: [],
        updatedAt: new Date(),
        templateId: templateId,
        starredMessageIds: [],
        lastUpdated: new Date(),
        isActive: false
      } as unknown as Conversation;
    }
  }

  setActiveConversation(conversationId: string | null) {
    try {
      if (conversationId === null) {
        // Handle null case specially
        // @ts-ignore - The internal implementation might accept null
        this.conversationManager.setActiveConversation(null);
      } else {
        this.conversationManager.setActiveConversation(conversationId);
      }
    } catch (error) {
      console.error('Error setting active conversation:', error);
    }
  }

  getActiveConversation(): Conversation | null {
    try {
      return this.conversationManager.getActiveConversation();
    } catch (error) {
      console.error('Error getting active conversation:', error);
      return null;
    }
  }

  updateConversation(conversation: Conversation) {
    try {
      // Try to update the conversation title at minimum
      this.conversationManager.updateConversationTitle(conversation.id, conversation.title);
      
      // Try to update the messages directly in the internal storage
      try {
        // @ts-ignore - Direct access to internal storage
        const conversations = this.conversationManager.conversations;
        if (conversations && typeof conversations.set === 'function') {
          conversations.set(conversation.id, conversation);
        }
      } catch (e) {
        console.error('Error updating conversation in internal storage:', e);
      }
    } catch (error) {
      console.error('Error updating conversation:', error);
    }
  }

  deleteConversation(conversationId: string) {
    try {
      this.conversationManager.deleteConversation(conversationId);
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  }

  // Add more wrapper methods as needed
  getOriginalManager() {
    return this.conversationManager;
  }
}

// Re-export types
export type {
  AIModel,
  Conversation,
  ConversationTemplate,
  Message
}; 