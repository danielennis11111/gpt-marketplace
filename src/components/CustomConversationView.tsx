import React, { useState, useRef, useEffect } from 'react';
import { useOllama } from '../hooks/useOllama';
import { useSettings } from '../contexts/SettingsContext';
import type { Conversation, ConversationTemplate, Message } from '../utils/rate-limiter/custom-adapter';
import { geminiService } from '../utils/rate-limiter/geminiService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ProgressiveThinkingIndicator from './ProgressiveThinkingIndicator';
import TokenUsagePreview from './TokenUsagePreview';
import ModelSwitcher from './ModelSwitcher';
import CollapsiblePanel from './CollapsiblePanel';
import ContextLimitWarning from './ContextLimitWarning';
import { estimateTokenCount, MODEL_LIMITS, processDocumentForRAG } from '../utils/rate-limiter/tokenCounter';
import type { DocumentContext } from '../utils/rate-limiter/tokenCounter';
import { CompressionEngine } from '../utils/rate-limiter/compressionEngine';
import type { CompressionStrategy, DocumentContext as CompressionDocumentContext } from '../utils/rate-limiter/compressionEngine';
import RateLimitIndicator from './RateLimitIndicator';
import ContextOptimizationPanel from './ContextOptimizationPanel';
import AudioInputButton from './AudioInputButton';
import CompressionStatisticsPanel from './CompressionStatisticsPanel';
import { Upload } from 'lucide-react';
import { ASU_PARTICIPANTS, ParticipantGrid } from './ConversationParticipant';
import { PERSONA_CHAT_TEMPLATES } from './PersonaChatSelection';
import type { PersonaChatTemplate } from './PersonaChatSelection';

// Import the MarkdownContent component
import MarkdownContent from './MarkdownContent';
import DownloadButton from './DownloadButton';
import { EnhancedRAGProcessor } from '../utils/enhancedRAGProcessor';
import { UnifiedPromptSystem, type SystemPromptComponents } from '../utils/promptSystem';
import SystemPromptPreview from './SystemPromptPreview';

interface CustomConversationViewProps {
  conversation: Conversation;
  template: ConversationTemplate;
  modelManager: any;
  conversationManager: any;
  onConversationUpdate: () => void;
}

const CustomConversationView: React.FC<CustomConversationViewProps> = ({
  conversation,
  template,
  conversationManager,
  onConversationUpdate
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const ollama = useOllama();
  const { settings } = useSettings();
  const [compressionEngine] = useState(() => CompressionEngine.getInstance());
  const [tokenUsage, setTokenUsage] = useState({
    total: 0,
    remaining: 32000,
    percentage: 0,
    maxTokens: 32000 // Default max context window size
  });
  
  // Add state for RAG documents
  const [ragDocuments, setRagDocuments] = useState<DocumentContext[]>([]);
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(settings.preferredChatProvider === 'gemini' ? 'gemini-2.0-flash' : (ollama.status.currentModel || 'llama3.1:8b'));
  const [activeParticipant, setActiveParticipant] = useState<string | undefined>(undefined);
  const [isScrolling, setIsScrolling] = useState(false);
  
  // Initialize RAG processor based on current model
  const [ragProcessor, setRagProcessor] = useState(() => new EnhancedRAGProcessor(selectedModel));
  
  // Update RAG processor when model changes
  useEffect(() => {
    const currentModel = settings.preferredChatProvider === 'gemini' ? 'gemini-2.0-flash' : 
                         ollama.status.currentModel || 'llama3.1:8b';
    setRagProcessor(new EnhancedRAGProcessor(currentModel));
  }, [settings.preferredChatProvider, ollama.status.currentModel]);

  // Build unified system prompt combining all components
  const buildUnifiedSystemPrompt = (): string => {
    // Get current participant for persona
    const participant = ASU_PARTICIPANTS.find(p => p.id === activeParticipant);
    let persona = null;
    
    if (participant) {
      const personaTemplate = PERSONA_CHAT_TEMPLATES.find(
        t => t.persona === participant.name
      );
      if (personaTemplate) {
        persona = {
          name: participant.name,
          systemPrompt: personaTemplate.systemPrompt
        };
      }
    }

    // Extract additional instructions from enhanced template
    let additionalInstructions = null;
    const enhancedTemplate = template as any; // Type assertion for enhanced properties
    if (enhancedTemplate.enhancedWithIdea?.systemInstructions) {
      additionalInstructions = {
        title: enhancedTemplate.enhancedWithIdea.title,
        instructions: enhancedTemplate.enhancedWithIdea.systemInstructions
      };
    }

    // Build prompt components
    const components: SystemPromptComponents = UnifiedPromptSystem.extractPromptComponents(
      template,
      persona,
      additionalInstructions,
      ragDocuments
    );

    return UnifiedPromptSystem.buildSystemPrompt(components);
  };
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages]);
  
      // Calculate token usage when messages change
  useEffect(() => {
    const calculateTokens = () => {
      // Look for latest assistant message to identify model being used
      const assistantMessages = conversation.messages.filter(msg => 
        msg.role === 'assistant' && msg.metadata?.modelUsed
      );
      
      let modelId;
      if (assistantMessages.length > 0) {
        // Use the model from the most recent assistant message
        modelId = assistantMessages[assistantMessages.length - 1]?.metadata?.modelUsed;
        console.log("Using model from last assistant message:", modelId);
      } else {
        // Fallback to current provider settings
        modelId = settings.preferredChatProvider === 'gemini' ? 'gemini-2.0-flash' : 
                 ollama.status.currentModel || 'llama3.1:8b';
        console.log("No assistant message found with model, using current provider:", modelId);
      }
      
      // Get accurate model limits based on used model
      const modelLimits = MODEL_LIMITS[modelId];
      if (!modelLimits) {
        console.warn(`Model ${modelId} not found in MODEL_LIMITS, using claude-3.7-sonnet as fallback`);
      }
      
      const maxTokens = modelLimits ? modelLimits.contextWindow : MODEL_LIMITS['claude-3.7-sonnet'].contextWindow;
      
      console.log(`Using model ${modelId} with context window of ${maxTokens} tokens for token calculation`);
      
      // Count tokens in all messages, skipping empty or placeholder content
      let totalTokens = 0;
      conversation.messages.forEach(msg => {
        // Skip empty or placeholder messages
        const content = msg.content || '';
        if (content.trim() && content !== '...') {
          const msgTokens = estimateTokenCount(content);
          totalTokens += msgTokens;
          console.log(`Message (${msg.role}): ${msgTokens} tokens`);
        }
      });
      
      // Add tokens from current input
      if (input) {
        const inputTokens = estimateTokenCount(input);
        totalTokens += inputTokens;
        console.log(`Current input: ${inputTokens} tokens`);
      }
      
      // Add tokens from RAG documents
      const ragTokens = ragDocuments.reduce((sum, doc) => sum + doc.tokenCount, 0);
      totalTokens += ragTokens;
      console.log(`RAG documents: ${ragTokens} tokens`);
      
      // Calculate remaining and percentage
      const remaining = Math.max(0, maxTokens - totalTokens);
      const percentage = Math.min(100, Math.round((totalTokens / maxTokens) * 100));
      
      // Update token usage immediately
      setTokenUsage({
        total: totalTokens,
        remaining,
        percentage,
        maxTokens
      });
    };
    
    calculateTokens();
  }, [conversation.messages, input, settings.preferredChatProvider, ollama.status.currentModel, ragDocuments]);
  
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      setIsScrolling(true);
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      
      // Reset scrolling state after animation completes
      setTimeout(() => {
        setIsScrolling(false);
      }, 500);
    }
  };
  
      // Filter visible messages
  const visibleMessages = conversation.messages.filter(msg => 
    msg.isVisible !== false && 
    msg.role !== 'system' &&
    msg.content && 
    msg.content.trim() !== '' &&
    msg.content !== '...' // Filter out placeholder message
  );
  
  // Get AI response based on currently selected provider
  const getAIResponse = async (userMessage: string): Promise<string> => {
    const preferredProvider = settings.preferredChatProvider;
    const hasGeminiApiKey = !!settings.geminiApiKey && settings.geminiApiKey.trim() !== '';
    const hasLlamaApiKey = !!settings.llamaApiKey && settings.llamaApiKey.trim() !== '';
    
    // Build unified system prompt
    const systemPrompt = buildUnifiedSystemPrompt();
    
    // Build message history for context
    const messageHistory = [
      // Start with system message
      {
        role: 'system',
        content: systemPrompt
      },
      // Add conversation history (exclude system messages as we have our own)
      ...conversation.messages
        .filter(msg => {
          return (msg.role === 'user' || msg.role === 'assistant') && 
                 msg.content && msg.content.trim() !== '';
        })
        .map(msg => ({
          role: msg.role,
          content: msg.content
        })),
      // Add the new user message
      {
        role: 'user',
        content: userMessage
      }
    ];
    
    // Try providers in order of preference with fallbacks
    
    // First try preferred provider
    if (preferredProvider === 'gemini' && hasGeminiApiKey) {
      try {
        const response = await geminiService.generateChatCompletion(messageHistory);
        return response.text;
      } catch (error) {
        console.error("Error using Gemini:", error);
        // Fall through to fallback providers
      }
    } else if (preferredProvider === 'llama' && hasLlamaApiKey) {
      try {
        // Implement llama API call here
        throw new Error("Llama API support not fully implemented");
      } catch (error) {
        console.error("Error using Llama API:", error);
        // Fall through to fallback providers
      }
    } else if (preferredProvider === 'ollama' && ollama.status.isConnected) {
      try {
        return await ollama.sendMessage(userMessage);
      } catch (error) {
        console.error("Error using Ollama:", error);
        // Fall through to fallback providers
      }
    }
    
    // Try fallbacks if preferred provider failed
    
    // Try Gemini as fallback
    if (preferredProvider !== 'gemini' && hasGeminiApiKey) {
      try {
        console.log("Trying Gemini as fallback...");
        const response = await geminiService.generateChatCompletion(messageHistory);
        return response.text;
      } catch (error) {
        console.error("Error using Gemini as fallback:", error);
      }
    }
    
    // Try Ollama as fallback
    if (preferredProvider !== 'ollama' && ollama.status.isConnected) {
      try {
        console.log("Trying Ollama as fallback...");
        return await ollama.sendMessage(userMessage);
      } catch (error) {
        console.error("Error using Ollama as fallback:", error);
      }
    }
    
    // Try Llama as fallback
    if (preferredProvider !== 'llama' && hasLlamaApiKey) {
      try {
        console.log("Trying Llama as fallback...");
        // Implement llama API call here
        throw new Error("Llama API support not fully implemented");
      } catch (error) {
        console.error("Error using Llama as fallback:", error);
      }
    }
    
    // All providers failed or none available
    throw new Error("No available AI provider. Please configure Ollama, Gemini, or Llama in Settings.");
  };
  
  // Stream AI response
  const streamAIResponse = async (
    userMessage: string, 
    messageId: string
  ): Promise<string> => {
    const preferredProvider = settings.preferredChatProvider;
    const hasGeminiApiKey = !!settings.geminiApiKey && settings.geminiApiKey.trim() !== '';
    const hasLlamaApiKey = !!settings.llamaApiKey && settings.llamaApiKey.trim() !== '';
    
    // Get current model for token tracking
    const currentModel = settings.preferredChatProvider === 'gemini' ? 'gemini-2.0-flash' : 
                         ollama.status.currentModel || 'llama3.1:8b';
    console.log(`Using model ${currentModel} for streaming response`);
    
    // Build unified system prompt
    const systemPrompt = buildUnifiedSystemPrompt();
    
    // Build message history for context (filter out empty messages)
    const messageHistory = [
      // Start with unified system message
      {
        role: 'system',
        content: systemPrompt
      },
      // Add conversation history (exclude system messages as we have our own)
      ...conversation.messages
        .filter(msg => {
          return (msg.role === 'user' || msg.role === 'assistant') && 
                 msg.content && msg.content.trim() && 
                 msg.content !== '...'; // Filter out placeholder content
        })
        .map(msg => ({
          role: msg.role,
          content: msg.content
        })),
      // Add the new user message
      {
        role: 'user',
        content: userMessage
      }
    ];
    
    // Try streaming with preferred provider first
    
    // Try Gemini streaming
    if (preferredProvider === 'gemini' && hasGeminiApiKey && geminiService.isStreamingSupported()) {
      try {
        console.log('Starting Gemini streaming response');
        let fullResponse = '';
        
        // Create the stream but handle it directly in the for-await loop
        const stream = geminiService.generateChatCompletionStream(
          messageHistory,
          undefined,
          {}
        );
        
        // Process the stream with for-await
        for await (const chunk of stream) {
          // Add the chunk to our response
          fullResponse += chunk;
          
          // Only update if we have actual content to avoid empty messages
          if (fullResponse.trim()) {
            // Update the message with accumulated response
            conversationManager.updateMessage(
              conversation.id,
              messageId,
              { 
                content: fullResponse,
                role: 'assistant', // Explicitly ensure role is 'assistant'
                metadata: {
                  citations: [],
                  modelUsed: currentModel
                }
              }
            );
            
            // Trigger UI update
            onConversationUpdate();
          }
          
          // Add a small delay to make streaming smoother and reduce UI updates
          await new Promise(resolve => setTimeout(resolve, 10));
        }
        
        console.log('Gemini streaming complete, full response length:', fullResponse.length);
        
        // Verify we have a valid response to avoid blank messages
        if (!fullResponse || !fullResponse.trim()) {
          throw new Error("Empty response received from Gemini");
        }
        
        // Make one final update to ensure the role is correct and model is tracked
        conversationManager.updateMessage(
          conversation.id,
          messageId,
          { 
            content: fullResponse,
            role: 'assistant',
            metadata: {
              citations: [],
              modelUsed: currentModel
            }
          }
        );
        
        return fullResponse;
      } catch (error) {
        console.error("Error streaming from Gemini:", error);
        // Fall through to other providers
      }
    }
    
    // Try Ollama streaming
    if ((preferredProvider === 'ollama' || preferredProvider !== 'gemini') && 
        ollama.status.isConnected && ollama.isStreamingSupported()) {
      try {
        console.log('Starting Ollama streaming response');
        let fullResponse = '';
        
        // Create the stream but handle it directly in the for-await loop
        const stream = ollama.sendMessageStream(userMessage);
        
        // Process the stream with for-await
        for await (const chunk of stream) {
          // Add the chunk to our response
          fullResponse += chunk;
          
          // Only update if we have actual content to avoid empty messages
          if (fullResponse.trim()) {
            // Update the message with accumulated response
            conversationManager.updateMessage(
              conversation.id,
              messageId,
              { 
                content: fullResponse,
                role: 'assistant', // Explicitly ensure role is 'assistant'
                metadata: {
                  citations: [],
                  modelUsed: currentModel
                }
              }
            );
            
            // Trigger UI update
            onConversationUpdate();
          }
          
          // Add a small delay to make streaming smoother and reduce UI updates
          await new Promise(resolve => setTimeout(resolve, 10));
        }
        
        return fullResponse;
      } catch (error) {
        console.error("Error streaming from Ollama:", error);
      }
    }
    
    // If streaming failed or isn't supported, fall back to non-streaming approach
    try {
      console.log("Streaming not available, falling back to non-streaming approach");
      const response = await getAIResponse(userMessage);
      
      // Update with final response
      conversationManager.updateMessage(
        conversation.id,
        messageId,
        { 
          content: response,
          role: 'assistant',
          metadata: {
            citations: [],
            modelUsed: currentModel
          }
        }
      );
      
      return response;
    } catch (error) {
      console.error("All response methods failed:", error);
      const errorMessage = `Error: ${(error as Error).message}. Please check your settings and try again.`;
      
      // Update with error message
      conversationManager.updateMessage(
        conversation.id,
        messageId,
        { 
          content: errorMessage,
          role: 'assistant',
          isError: true
        }
      );
      
      return errorMessage;
    }
  };
  
  // Check if streaming is supported for the current provider
  const isStreamingSupportedForCurrentProvider = (): boolean => {
    const preferredProvider = settings.preferredChatProvider;
    const hasGeminiApiKey = !!settings.geminiApiKey && settings.geminiApiKey.trim() !== '';
    
    if (preferredProvider === 'gemini' && hasGeminiApiKey) {
      return geminiService.isStreamingSupported();
    } else if (preferredProvider === 'ollama' && ollama.status.isConnected) {
      return ollama.isStreamingSupported();
    }
    
    return false;
  };
  
  // Handle submitting a new message
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;
    
    // Add user message to conversation
    const userMessage: Omit<Message, 'id' | 'timestamp'> = {
      role: 'user',
      content: input,
      isVisible: true
    };
    
    // Add message via conversation manager
    conversationManager.addMessage(conversation.id, userMessage);
    setInput('');
    setIsLoading(true);
    onConversationUpdate();
    
    try {
      // Identify correct model for token calculations
      const currentModel = settings.preferredChatProvider === 'gemini' ? 'gemini-2.0-flash' : 
                           ollama.status.currentModel || 'llama3.1:8b';
      
      // Create an initial message for the assistant
      const aiMessage: Omit<Message, 'id' | 'timestamp'> = {
        role: 'assistant',
        content: '...',  // Use placeholder instead of empty string
        isVisible: true,
        metadata: { 
          citations: [],
          modelUsed: currentModel  // Track which model is being used
        }
      };
      
      // Add the message and get its ID
      const newMessage = conversationManager.addMessage(conversation.id, aiMessage);
      
      // Verify the role is set correctly for the new message
      console.log('Created assistant message with ID:', newMessage.id, 'and role:', newMessage.role, 'using model:', currentModel);
      
      // Ensure the role and metadata are set correctly
      if (newMessage.role !== 'assistant' || !newMessage.metadata?.modelUsed) {
        console.warn('Message properties were not set correctly, fixing...');
        conversationManager.updateMessage(conversation.id, newMessage.id, {
          role: 'assistant',
          metadata: {
            ...newMessage.metadata,
            modelUsed: currentModel
          }
        });
      }
      
      onConversationUpdate();
      
      // Check if streaming is supported for the current provider
      const canStream = isStreamingSupportedForCurrentProvider();
      setIsStreaming(canStream);
      
      let response: string;
      
      // Use streaming if supported
      if (canStream) {
        response = await streamAIResponse(input, newMessage.id);
      } else {
        // Get response from AI provider (non-streaming)
        response = await getAIResponse(input);
        
        // Verify the response is not empty
        if (response && response.trim()) {
          // Update the assistant message with the response
          conversationManager.updateMessage(conversation.id, newMessage.id, {
            content: response,
            role: 'assistant', // Explicitly ensure role is assistant
            metadata: {
              ...newMessage.metadata,
              modelUsed: currentModel
            }
          });
        } else {
          console.error("Empty response received from AI provider");
          throw new Error("Empty response received from AI provider");
        }
      }
      
      onConversationUpdate();
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Add error message
      const errorMessage: Omit<Message, 'id' | 'timestamp'> = {
        role: 'assistant',
        content: `Sorry, there was an error: ${(error as Error).message}`,
        isVisible: true
      };
      
      conversationManager.addMessage(conversation.id, errorMessage);
      onConversationUpdate();
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };
  
  // Get current provider info for display
  const getProviderInfo = () => {
    const preferredProvider = settings.preferredChatProvider;
    const hasGeminiApiKey = !!settings.geminiApiKey && settings.geminiApiKey.trim() !== '';
    
    if (preferredProvider === 'gemini' && hasGeminiApiKey) {
      return {
        isConnected: true,
        name: 'Gemini 2.0 Flash',
        status: 'Connected',
        canStream: geminiService.isStreamingSupported()
      };
    } else if (preferredProvider === 'ollama' && ollama.status.isConnected) {
      return {
        isConnected: true,
        name: ollama.status.currentModel || 'Ollama',
        status: 'Connected',
        canStream: ollama.isStreamingSupported()
      };
    } else {
      return {
        isConnected: false,
        name: 'AI Provider',
        status: 'Not Connected',
        canStream: false
      };
    }
  };
  
  // Change conversation title based on content
  useEffect(() => {
    // Update conversation title based on first user message if title is still default
    if (conversation.title === 'New Conversation' && visibleMessages.length > 0) {
      const firstUserMessage = visibleMessages.find(msg => msg.role === 'user');
      if (firstUserMessage) {
        const title = firstUserMessage.content.substring(0, 30) + (firstUserMessage.content.length > 30 ? '...' : '');
        conversationManager.updateConversationTitle(conversation.id, title);
        onConversationUpdate();
      }
    }
  }, [conversation, visibleMessages, conversationManager, onConversationUpdate]);
  
  const providerInfo = getProviderInfo();
  
  // Handle compression of conversation history
  const handleCompressHistory = () => {
    try {
      // Get all messages excluding system prompts
      const messagesToCompress = conversation.messages
        .filter(msg => msg.role !== 'system')
        .slice(0, -2); // Skip the last 2 messages
      
      if (messagesToCompress.length < 3) {
        // Not enough messages to compress
        return;
      }
      
      // Use the compression engine to compress the messages
      const strategy = compressionEngine.analyzeAndRecommendStrategy(
        messagesToCompress, 
        tokenUsage.total
      );
      
      if (strategy.type === 'lossless') {
        // Apply lossless compression to each message
        messagesToCompress.forEach(message => {
          const { compressed } = compressionEngine.compressLossless(
            message.content,
            conversation.id,
            1
          );
          
          // Update the message content with compressed version
          conversationManager.updateMessage(
            conversation.id,
            message.id,
            { content: compressed }
          );
        });
      } else {
        // Apply hybrid compression for long conversations
        const { compressed } = compressionEngine.compressHybrid(
          messagesToCompress,
          strategy,
          conversation.id
        );
        
        // Remove all original messages that were compressed
        messagesToCompress.forEach(message => {
          conversationManager.hideMessage(conversation.id, message.id);
        });
        
        // Add a single summary message
        const summaryMessage: Omit<Message, 'id' | 'timestamp'> = {
          role: 'assistant',
          content: `*Conversation history summarized:* ${compressed}`,
          isVisible: true
        };
        
        // Add the summary at the beginning
        conversationManager.addMessageAtPosition(
          conversation.id, 
          summaryMessage,
          0
        );
      }
      
      // Update the conversation
      onConversationUpdate();
    } catch (error) {
      console.error("Error compressing history:", error);
    }
  };
  
  // Handle file processing from FileUploadArea
  const handleFilesProcessed = (newDocuments: DocumentContext[]) => {
    setRagDocuments(prevDocuments => [...prevDocuments, ...newDocuments]);
  };
  
  // Handle audio transcription
  const handleTranscription = (text: string) => {
    setInput(prevInput => prevInput + ' ' + text);
  };
  
  // Handle model change
  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    // Additional logic to notify parent component if needed
  };
  
  // Handle participant selection
  const handleSelectParticipant = (participantId: string) => {
    // Toggle off if the same participant is selected again
    const newActiveParticipant = participantId === activeParticipant ? undefined : participantId;
    setActiveParticipant(newActiveParticipant);
    
    // If a new participant is selected, add user-visible message
    if (newActiveParticipant) {
      const participant = ASU_PARTICIPANTS.find(p => p.id === newActiveParticipant);
      if (participant) {
        console.log(`Selected participant: ${participant.name}`);
        
        // Add a user-visible message about the participant (system prompt handled by unified system)
        const infoMessage = {
          role: 'assistant',
          content: `You are now chatting with **${participant.name}**, ${participant.role}. Feel free to ask about ${participant.expertise.join(', ')}.`,
          isVisible: true
        };
        
        conversationManager.addMessage(conversation.id, infoMessage);
        onConversationUpdate();
      }
    } else if (activeParticipant && !newActiveParticipant) {
      // If participant is deselected, add message about general chat
      const endMessage = {
        role: 'assistant',
        content: 'You are now back to chatting with a general AI assistant.',
        isVisible: true
      };
      
      conversationManager.addMessage(conversation.id, endMessage);
      onConversationUpdate();
    }
  };
  
  // Remove a RAG document
  const removeRagDocument = (index: number) => {
    const updatedDocuments = [...ragDocuments];
    updatedDocuments.splice(index, 1);
    setRagDocuments(updatedDocuments);
  };
  
  // Add this function to handle uploading files with enhanced RAG processor
  const handleFileUpload = async (file: File) => {
    setIsFileLoading(true);
    try {
      // Check if file is supported by current model
      const validation = ragProcessor.isFileSupported(file);
      if (!validation.supported) {
        alert(validation.reason || 'File not supported');
        return;
      }
      
      // Process the file using enhanced processor
      const processedFile = await ragProcessor.processFile(file);
      
      // Map fileType to compatible type
      const mapFileTypeToDocumentType = (fileType: string): "pdf" | "docx" | "txt" | "md" | "csv" | "json" | "xml" | "html" | "code" | "binary" => {
        switch (fileType) {
          case 'image': return 'binary';
          case 'audio': return 'binary';
          case 'video': return 'binary';
          case 'data': return 'json';
          case 'code': return 'code';
          case 'document': return 'pdf';
          default: return 'txt';
        }
      };
      
      // Convert to DocumentContext for compatibility
      const docContext: DocumentContext = {
        type: mapFileTypeToDocumentType(processedFile.fileType),
        name: processedFile.name,
        content: processedFile.content,
        tokenCount: processedFile.tokenCount,
        size: processedFile.size,
        uploadedAt: processedFile.uploadedAt
      };
      
      // Check if we need to compress based on context size
      const currentModelId = settings.preferredChatProvider === 'gemini' ? 'gemini-2.0-flash' : 
                             ollama.status.currentModel || 'llama3.1:8b';
      const modelLimits = MODEL_LIMITS[currentModelId] || MODEL_LIMITS['claude-3.7-sonnet'];
      const maxContextSize = modelLimits.contextWindow;
      
      let newDocuments = [...ragDocuments, docContext];
      
      // Calculate if we need to compress
      const totalRagTokens = newDocuments.reduce((sum, doc) => sum + doc.tokenCount, 0);
      const percentageUsed = (totalRagTokens / maxContextSize) * 100;
      
      // If RAG documents exceed 30% of context window, compress them
      if (percentageUsed > 30) {
        console.log(`RAG documents exceeding 30% of context window (${percentageUsed.toFixed(1)}%), compressing...`);
        try {
          // Type cast to any to avoid TypeScript errors between different DocumentContext interfaces
          const compressedDocs = compressionEngine.compressRagDocuments(
            newDocuments as any, 
            30,  // Target max percentage 
            maxContextSize
          );
          // Verify compression was successful
          if (compressedDocs && compressedDocs.length === newDocuments.length) {
            // Type cast to avoid TypeScript errors
            newDocuments = compressedDocs as typeof newDocuments;
            console.log("RAG compression successful:", newDocuments);
          } else {
            console.error("RAG compression returned invalid result:", compressedDocs);
          }
        } catch (compressionError) {
          console.error("Error during RAG compression:", compressionError);
        }
      }
      
      // Update state with processed documents
      setRagDocuments(newDocuments);
      
      // Show enhanced notification with file type and capabilities info
      let notification = `Added ${processedFile.fileType}: "${file.name}" (${docContext.tokenCount.toLocaleString()} tokens)`;
      
      if (processedFile.fileType === 'image' && processedFile.metadata.dimensions) {
        notification += ` - ${processedFile.metadata.dimensions.width}x${processedFile.metadata.dimensions.height}`;
      }
      
      if (percentageUsed > 30) {
        notification += '. Documents were compressed to fit in context window.';
      }
      
      alert(notification);
    } catch (error) {
      console.error("Error processing document:", error);
      alert(`Error processing document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsFileLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header with model selection - Removed as it's already in AsuGptPage */}
      
      {/* Main chat area - now full width */}
      <div className="flex-1 overflow-auto p-4">
        
        {/* System Prompt Preview (for debugging/transparency) */}
        <div className="mb-4">
          <SystemPromptPreview
            template={template}
            persona={activeParticipant ? ASU_PARTICIPANTS.find(p => p.id === activeParticipant) : null}
            additionalInstructions={(template as any).enhancedWithIdea}
            ragDocuments={ragDocuments}
          />
        </div>
        {/* Conversation Partners panel removed - now in top bar */}
        
        {/* Messages */}
        <div className="space-y-4 mb-4">
          {visibleMessages.map((message, index) => (
            <div 
              key={message.id || index} 
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
            >
              <div 
                className={`max-w-3xl rounded-lg p-3 transition-all duration-300 ${
                  message.role === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white border border-gray-200 text-gray-900'
                }`}
              >
                {message.role === 'user' ? (
                  <div className="whitespace-pre-wrap">{message.content}</div>
                ) : (
                  <div className="space-y-2">
                    <MarkdownContent content={message.content} />
                    {/* Download button for assistant messages */}
                    <div className="flex justify-end">
                      <DownloadButton 
                        content={message.content} 
                        filename={`ai_response_${index + 1}`}
                        title={`AI Response ${index + 1}`}
                        compact={true}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <>
              <ProgressiveThinkingIndicator 
                isThinking={isLoading} 
                modelName={providerInfo.name}
                canStream={isStreaming} 
              />
            </>
          )}
          <div ref={messagesEndRef} className={`h-4 ${isScrolling ? 'animate-bounce' : ''}`} />
        </div>
      </div>
      
      {/* Input area with RAG controls */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          {/* Voice Input Button */}
          <AudioInputButton 
            onTranscription={handleTranscription}
            disabled={isLoading}
            asugold={true}
          />
          
          {/* RAG File Upload Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={isLoading || isFileLoading}
              className={`p-3 rounded-lg transition-colors bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50`}
              title={`Upload files for context - ${ragProcessor.getCapabilitiesString()}`}
            >
              <Upload className="w-5 h-5" />
              {isFileLoading && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
              )}
            </button>
            <input
              id="file-upload"
              type="file"
              accept={ragProcessor.getAcceptString()}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileUpload(file);
                }
              }}
              className="hidden"
            />
          </div>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isLoading ? "Thinking..." : "Type your message..."}
            disabled={isLoading}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC627] focus:border-transparent disabled:opacity-50"
          />
          
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-6 py-3 bg-[#FFC627] text-[#191919] rounded-lg hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
      
      {/* Document context display */}
      {ragDocuments.length > 0 && (
        <div className="flex-shrink-0 px-4 py-2 border-t border-gray-200 bg-white">
          <div className="flex items-center flex-wrap gap-2">
            <span className="text-xs font-medium text-gray-700">Using context from:</span>
            {ragDocuments.map((doc, index) => (
              <div key={index} className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-xs">
                <span className="truncate max-w-[150px]">{doc.name || 'Document'}</span>
                <span className="ml-1 text-gray-500">({doc.tokenCount} tokens)</span>
                <button 
                  onClick={() => removeRagDocument(index)}
                  className="ml-2 text-red-600 hover:text-red-800"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Token Usage Preview - moved below chat input */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-gray-200 bg-white">
        <TokenUsagePreview 
          conversation={conversation as any}
          template={template as any}
          currentInput={input}
          currentModelId={selectedModel}
          ragContext=""
          ragDocuments={ragDocuments as any}
        />
        
        {/* Only show warning if approaching limit */}
        {tokenUsage.percentage > 75 && (
          <div className="mt-2">
            <ContextLimitWarning 
              percentage={tokenUsage.percentage} 
              onCompress={handleCompressHistory}
            />
          </div>
        )}
        
        {/* Compression Statistics Panel */}
        <div className="mt-2">
          <CompressionStatisticsPanel 
            compressionEngine={compressionEngine}
            refreshInterval={10000}
          />
        </div>
      </div>
      
      {/* AI Disclaimer */}
      <div className="flex-shrink-0 p-3 border-t border-gray-200 bg-white">
        <div className="text-center">
          <p className="text-xs text-gray-500">
            You are speaking with an AI assistant. Responses are generated with artificial intelligence.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomConversationView;