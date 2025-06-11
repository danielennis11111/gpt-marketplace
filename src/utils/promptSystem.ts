/**
 * Unified Prompt System
 * Combines persona, additional instructions, RAG context, and base template prompts
 * into a cohesive system that works together rather than as separate components
 */

export interface SystemPromptComponents {
  baseTemplate?: string;
  persona?: {
    name: string;
    systemPrompt: string;
  };
  additionalInstructions?: {
    title: string;
    instructions: string;
  };
  ragContext?: {
    documents: Array<{
      name: string;
      content: string;
      type: string;
    }>;
  };
  conversationContext?: {
    isNewConversation: boolean;
    messageCount: number;
    lastUserMessage?: string;
  };
}

export class UnifiedPromptSystem {
  /**
   * Constructs a complete system prompt that combines all components
   */
  static buildSystemPrompt(components: SystemPromptComponents): string {
    const sections: string[] = [];

    // 1. Start with persona introduction if available
    if (components.persona) {
      sections.push(this.buildPersonaSection(components.persona));
    } else if (components.baseTemplate) {
      sections.push(components.baseTemplate);
    }

    // 2. Add specialized knowledge/capabilities if additional instructions provided
    if (components.additionalInstructions) {
      sections.push(this.buildAdditionalInstructionsSection(components.additionalInstructions));
    }

    // 3. Add RAG document context if available
    if (components.ragContext && components.ragContext.documents.length > 0) {
      sections.push(this.buildRAGContextSection(components.ragContext));
    }

    // 4. Add conversation flow instructions
    sections.push(this.buildConversationFlowSection());

    return sections.join('\n\n');
  }

  /**
   * Builds the persona section of the system prompt
   */
  private static buildPersonaSection(persona: { name: string; systemPrompt: string }): string {
    return `# PERSONA AND ROLE\n\n${persona.systemPrompt}`;
  }

  /**
   * Builds the additional instructions section
   */
  private static buildAdditionalInstructionsSection(
    instructions: { title: string; instructions: string }
  ): string {
    return `# SPECIALIZED KNOWLEDGE AND CAPABILITIES

You have been enhanced with specialized knowledge and capabilities related to "${instructions.title}". This gives you expert-level understanding and abilities in this specific area.

## Enhanced Capabilities:
${instructions.instructions}

**Integration Instructions:** Seamlessly integrate this specialized knowledge with your core persona and conversational abilities. When relevant to the user's requests, draw upon this expertise naturally while maintaining your authentic voice and approach.`;
  }

  /**
   * Builds the RAG context section
   */
  private static buildRAGContextSection(ragContext: {
    documents: Array<{ name: string; content: string; type: string }>
  }): string {
    const documentList = ragContext.documents.map((doc, index) => 
      `**Document ${index + 1}: ${doc.name}** (${doc.type})\n${doc.content}`
    ).join('\n\n');

    return `# CONTEXTUAL DOCUMENTS

You have access to the following uploaded documents that provide relevant context for this conversation:

${documentList}

**Integration Instructions:** Reference these documents when relevant to the user's questions. Cite specific information from the documents when applicable, and use this context to provide more informed and accurate responses.`;
  }

  /**
   * Builds conversation flow instructions
   */
  private static buildConversationFlowSection(): string {
    return `# CONVERSATION FLOW GUIDELINES

**Response Style:** Maintain your authentic persona while integrating all available knowledge and context seamlessly. Respond naturally as if all your capabilities and knowledge are part of your core identity.

**Context Integration:** When relevant, draw upon:
- Your specialized knowledge and enhanced capabilities
- Information from uploaded documents
- Previous conversation context
- Your core persona and expertise

**Adaptability:** Adjust your communication style based on user preferences. If they request more direct responses or less verbose explanations, adapt accordingly while maintaining helpfulness and accuracy.`;
  }

  /**
   * Creates a fallback system prompt for basic conversations
   */
  static createFallbackPrompt(): string {
    return this.buildSystemPrompt({
      baseTemplate: `You are a helpful AI assistant. Provide clear, accurate, and useful responses to user questions and requests. Maintain a friendly and professional tone while being informative and engaging.`,
    });
  }

  /**
   * Extracts and validates prompt components from conversation data
   */
  static extractPromptComponents(
    template: any,
    persona: any,
    additionalInstructions: any,
    ragDocuments: any[]
  ): SystemPromptComponents {
    const components: SystemPromptComponents = {};

    // Extract base template
    if (template?.systemPrompt) {
      components.baseTemplate = template.systemPrompt;
    }

    // Extract persona information
    if (persona?.name && persona?.systemPrompt) {
      components.persona = {
        name: persona.name,
        systemPrompt: persona.systemPrompt
      };
    }

    // Extract additional instructions
    if (additionalInstructions?.title && additionalInstructions?.instructions) {
      components.additionalInstructions = {
        title: additionalInstructions.title,
        instructions: additionalInstructions.instructions
      };
    }

    // Extract RAG context
    if (ragDocuments && ragDocuments.length > 0) {
      components.ragContext = {
        documents: ragDocuments.map(doc => ({
          name: doc.name || 'Unnamed Document',
          content: doc.content || '',
          type: doc.type || 'document'
        }))
      };
    }

    return components;
  }

  /**
   * Estimates token count for the complete system prompt
   */
  static estimateSystemPromptTokens(components: SystemPromptComponents): number {
    const systemPrompt = this.buildSystemPrompt(components);
    // Rough estimation: ~4 characters per token
    return Math.ceil(systemPrompt.length / 4);
  }

  /**
   * Validates that the system prompt won't exceed model limits
   */
  static validatePromptSize(
    components: SystemPromptComponents,
    maxTokens: number = 4000
  ): { valid: boolean; tokenCount: number; warning?: string } {
    const tokenCount = this.estimateSystemPromptTokens(components);
    
    if (tokenCount > maxTokens) {
      return {
        valid: false,
        tokenCount,
        warning: `System prompt (${tokenCount} tokens) exceeds maximum allowed (${maxTokens} tokens). Consider reducing RAG document content or additional instructions.`
      };
    }

    if (tokenCount > maxTokens * 0.8) {
      return {
        valid: true,
        tokenCount,
        warning: `System prompt is using ${Math.round((tokenCount / maxTokens) * 100)}% of allowed tokens. Consider optimizing for better performance.`
      };
    }

    return { valid: true, tokenCount };
  }
} 