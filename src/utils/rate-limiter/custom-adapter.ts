import { useSettings } from '../../contexts/SettingsContext';
import { useOllama } from '../../hooks/useOllama';
import { llamaService } from './llamaService';
import { geminiService } from './geminiService';

// Define minimal types needed
export interface AIModel {
  id: string;
  name: string;
  isConnected: boolean;
  provider?: string;
  capabilities?: any;
  maxContextLength?: number;
  userDisplay?: {
    displayName: string;
    description: string;
    logoPath: string;
  };
}

export interface Message {
  id: string;
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  timestamp: Date;
  isVisible?: boolean;
  metadata?: any;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  templateId: string;
  updatedAt: Date;
  lastUpdated?: Date;
  isActive?: boolean;
  starredMessageIds: string[];
}

export interface ConversationTemplate {
  id: string;
  name: string;
  description: string;
  modelId: string;
  systemPrompt: string;
  suggestedQuestions: string[];
  persona: string;
  capabilities?: {
    contextCompression?: boolean;
    fileUploading?: boolean;
    codeInterpreter?: boolean;
    audioDictation?: boolean;
    audioResponse?: boolean;
  };
}

// Custom implementation of ModelManager
export class CustomModelManager {
  private models: Map<string, AIModel> = new Map();
  private statusCheckInterval: any = null;
  
  constructor() {
    // Add only the Ollama model - don't add any other models that would cause status checks
    const ollamaModel: AIModel = {
      id: 'ollama-local',
      name: 'Ollama (Local)',
      isConnected: false, // Will be updated later
      provider: 'ollama',
      maxContextLength: 8192,
      capabilities: {
        chat: true,
        completion: true,
      },
      userDisplay: {
        displayName: 'Ollama',
        description: 'Run local models with Ollama',
        logoPath: '/ollama-logo.png',
      }
    };
    
    // Add Gemini model
    const geminiModel: AIModel = {
      id: 'gemini-flash',
      name: 'Gemini 2.0 Flash',
      isConnected: false, // Will be updated later
      provider: 'gemini',
      maxContextLength: 1000000, // Gemini 2.0 Flash has a very large context window
      capabilities: {
        chat: true,
        completion: true,
      },
      userDisplay: {
        displayName: 'Gemini 2.0 Flash',
        description: 'Google Gemini 2.0 Flash model',
        logoPath: '/gemini-logo.png',
      }
    };
    
    this.models.set(ollamaModel.id, ollamaModel);
    this.models.set(geminiModel.id, geminiModel);
    
    // Don't add any other models to avoid unnecessary status checks
  }
  
  // Add a model to the collection
  addModel(model: AIModel): void {
    this.models.set(model.id, model);
  }
  
  // Get all models
  getAllModels(): AIModel[] {
    return Array.from(this.models.values());
  }
  
  // Get a model by ID
  getModel(id: string): AIModel | undefined {
    return this.models.get(id);
  }
  
  // Update the Ollama model status
  syncWithSettings(settings: ReturnType<typeof useSettings>['settings'], ollama: ReturnType<typeof useOllama>) {
    // Update Ollama status
    if (ollama) {
      const modelName = ollama.status.currentModel || 'Unknown';
      this.addModel({
        id: 'ollama-local',
        name: `Ollama (${modelName})`,
        isConnected: ollama.status.isConnected,
        provider: 'ollama',
        maxContextLength: 8192,
        capabilities: {
          chat: true,
          completion: true,
        },
        userDisplay: {
          displayName: 'Ollama',
          description: `Local Ollama model: ${modelName}`,
          logoPath: '/ollama-logo.png',
        }
      });
      
      // Update the LlamaService with our Ollama instance
      llamaService.setOllamaInstance(ollama);
    }
    
    // Update Gemini status based on settings
    const hasGeminiApiKey = !!settings.geminiApiKey && settings.geminiApiKey.trim() !== '';
    
    // Update geminiService with API key
    if (hasGeminiApiKey) {
      geminiService.setApiKey(settings.geminiApiKey || '');
    }
    
    this.addModel({
      id: 'gemini-flash',
      name: 'Gemini 2.0 Flash',
      isConnected: hasGeminiApiKey,
      provider: 'gemini',
      maxContextLength: 1000000,
      capabilities: {
        chat: true,
        completion: true,
      },
      userDisplay: {
        displayName: 'Gemini 2.0 Flash',
        description: hasGeminiApiKey ? 'Connected' : 'API Key Required',
        logoPath: '/gemini-logo.png',
      }
    });
    
    return this;
  }
  
  // Mock method to match original interface
  startStatusMonitoring(): void {
    // Do nothing - we don't want to check model status
    return;
  }
  
  // Mock method to match original interface
  stopStatusMonitoring(): void {
    if (this.statusCheckInterval) {
      clearInterval(this.statusCheckInterval);
      this.statusCheckInterval = null;
    }
  }
}

// Custom implementation of ConversationManager
export class CustomConversationManager {
  private conversations: Map<string, Conversation> = new Map();
  private templates: Map<string, ConversationTemplate> = new Map();
  private activeConversationId: string | null = null;
  
  constructor() {
    this.loadFromLocalStorage();
    this.initializeDefaultTemplate();
  }
  
  private loadFromLocalStorage(): void {
    try {
      // Load conversations
      const conversationsJson = localStorage.getItem('asu-gpt-conversations');
      if (conversationsJson) {
        const parsed = JSON.parse(conversationsJson);
        parsed.forEach((conv: Conversation) => {
          this.conversations.set(conv.id, {
            ...conv,
            updatedAt: new Date(conv.updatedAt),
            messages: conv.messages.map(msg => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }))
          });
        });
      }
      
      // Load active conversation
      const activeId = localStorage.getItem('asu-gpt-active-conversation');
      if (activeId) {
        this.activeConversationId = activeId;
      }
    } catch (error) {
      console.error('Error loading conversations from localStorage:', error);
    }
  }
  
  private saveToLocalStorage(): void {
    try {
      localStorage.setItem(
        'asu-gpt-conversations', 
        JSON.stringify(Array.from(this.conversations.values()))
      );
      
      if (this.activeConversationId) {
        localStorage.setItem('asu-gpt-active-conversation', this.activeConversationId);
      } else {
        localStorage.removeItem('asu-gpt-active-conversation');
      }
    } catch (error) {
      console.error('Error saving conversations to localStorage:', error);
    }
  }
  
  private initializeDefaultTemplate(): void {
    const defaultTemplate: ConversationTemplate = {
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
      capabilities: {
        contextCompression: true,
        fileUploading: true,
        codeInterpreter: true,
        audioDictation: true,
        audioResponse: true
      }
    };
    
    this.templates.set(defaultTemplate.id, defaultTemplate);
  }
  
  // Get all templates
  getAllTemplates(): ConversationTemplate[] {
    return Array.from(this.templates.values());
  }
  
  // Get all conversations
  getAllConversations(): Conversation[] {
    return Array.from(this.conversations.values());
  }
  
  // Create a new conversation
  createConversation(templateId: string): Conversation {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }
    
    const id = `conv_${Date.now()}`;
    const newConversation: Conversation = {
      id,
      title: 'New Conversation',
      messages: [
        {
          id: `msg_${Date.now()}`,
          role: 'system',
          content: template.systemPrompt,
          timestamp: new Date(),
          isVisible: false
        }
      ],
      templateId,
      updatedAt: new Date(),
      lastUpdated: new Date(),
      isActive: true,
      starredMessageIds: []
    };
    
    this.conversations.set(id, newConversation);
    this.activeConversationId = id;
    this.saveToLocalStorage();
    
    return newConversation;
  }
  
  // Get the active conversation
  getActiveConversation(): Conversation | null {
    if (!this.activeConversationId) return null;
    return this.conversations.get(this.activeConversationId) || null;
  }
  
  // Set the active conversation
  setActiveConversation(conversationId: string | null): void {
    this.activeConversationId = conversationId;
    
    // Mark all conversations as inactive
    this.conversations.forEach(conv => {
      conv.isActive = false;
    });
    
    // Mark the active conversation as active
    if (conversationId) {
      const conv = this.conversations.get(conversationId);
      if (conv) {
        conv.isActive = true;
      }
    }
    
    this.saveToLocalStorage();
  }
  
  // Update a conversation
  updateConversation(conversation: Conversation): void {
    this.conversations.set(conversation.id, {
      ...conversation,
      updatedAt: new Date(),
      lastUpdated: new Date()
    });
    this.saveToLocalStorage();
  }
  
  // Update a conversation title
  updateConversationTitle(conversationId: string, title: string): void {
    const conversation = this.conversations.get(conversationId);
    if (conversation) {
      conversation.title = title;
      conversation.updatedAt = new Date();
      conversation.lastUpdated = new Date();
      this.saveToLocalStorage();
    }
  }
  
  // Delete a conversation
  deleteConversation(conversationId: string): void {
    this.conversations.delete(conversationId);
    
    // If the deleted conversation was active, reset the active conversation
    if (this.activeConversationId === conversationId) {
      this.activeConversationId = null;
      
      // Set the first available conversation as active
      const firstConv = this.getAllConversations()[0];
      if (firstConv) {
        this.setActiveConversation(firstConv.id);
      }
    }
    
    this.saveToLocalStorage();
  }
  
  // Add a message to a conversation
  addMessage(conversationId: string, message: Omit<Message, 'id' | 'timestamp'>): Message {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error(`Conversation not found: ${conversationId}`);
    }
    
    const newMessage: Message = {
      ...message,
      id: `msg_${Date.now()}`,
      timestamp: new Date()
    };
    
    conversation.messages.push(newMessage);
    conversation.updatedAt = new Date();
    conversation.lastUpdated = new Date();
    
    this.saveToLocalStorage();
    
    return newMessage;
  }
}

// Export the custom implementations
export { CustomModelManager as ModelManager, CustomConversationManager as ConversationManager }; 