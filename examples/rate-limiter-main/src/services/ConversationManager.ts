import { Conversation, ConversationTemplate, Message } from '../types/index';
import { coreExperiences } from '../data/coreExperiences';

export class ConversationManager {
  private conversations: Map<string, Conversation> = new Map();
  private activeConversationId: string | null = null;
  private templates: Map<string, ConversationTemplate> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates(): void {
    coreExperiences.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  createConversation(templateId: string, customTitle?: string): Conversation {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const conversationId = this.generateId();
    const conversation: Conversation = {
      id: conversationId,
      templateId,
      messages: [],
      title: customTitle || template.name,
      lastUpdated: new Date(),
      isActive: false
    };

    this.conversations.set(conversationId, conversation);
    return conversation;
  }

  getConversation(conversationId: string): Conversation | undefined {
    return this.conversations.get(conversationId);
  }

  getAllConversations(): Conversation[] {
    return Array.from(this.conversations.values())
      .sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());
  }

  getActiveConversation(): Conversation | null {
    if (!this.activeConversationId) return null;
    return this.conversations.get(this.activeConversationId) || null;
  }

  setActiveConversation(conversationId: string): void {
    // Deactivate previous conversation
    if (this.activeConversationId) {
      const prevConversation = this.conversations.get(this.activeConversationId);
      if (prevConversation) {
        prevConversation.isActive = false;
      }
    }

    // Activate new conversation
    const conversation = this.conversations.get(conversationId);
    if (conversation) {
      conversation.isActive = true;
      this.activeConversationId = conversationId;
    }
  }

  addMessage(conversationId: string, message: Omit<Message, 'id' | 'timestamp'>): Message {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    const fullMessage: Message = {
      ...message,
      id: this.generateId(),
      timestamp: new Date()
    };

    conversation.messages.push(fullMessage);
    conversation.lastUpdated = new Date();

    return fullMessage;
  }

  deleteConversation(conversationId: string): void {
    const conversation = this.conversations.get(conversationId);
    if (conversation && conversation.isActive) {
      this.activeConversationId = null;
    }
    this.conversations.delete(conversationId);
  }

  getTemplate(templateId: string): ConversationTemplate | undefined {
    return this.templates.get(templateId);
  }

  getAllTemplates(): ConversationTemplate[] {
    return Array.from(this.templates.values());
  }

  getConversationsByTemplate(templateId: string): Conversation[] {
    return this.getAllConversations().filter(conv => conv.templateId === templateId);
  }

  clearConversationMessages(conversationId: string): void {
    const conversation = this.conversations.get(conversationId);
    if (conversation) {
      conversation.messages = [];
      conversation.lastUpdated = new Date();
    }
  }

  updateConversationTitle(conversationId: string, title: string): void {
    const conversation = this.conversations.get(conversationId);
    if (conversation) {
      conversation.title = title;
      conversation.lastUpdated = new Date();
    }
  }

  getConversationSummary(conversationId: string): string {
    const conversation = this.conversations.get(conversationId);
    if (!conversation || conversation.messages.length === 0) {
      return 'No messages yet';
    }

    const lastMessage = conversation.messages[conversation.messages.length - 1];
    const preview = lastMessage.content.slice(0, 50);
    return preview + (lastMessage.content.length > 50 ? '...' : '');
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }
} 