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
import { estimateTokenCount, MODEL_LIMITS } from '../utils/rate-limiter/tokenCounter';
import { CompressionEngine } from '../utils/rate-limiter/compressionEngine';
import type { CompressionStrategy } from '../utils/rate-limiter/compressionEngine';
import { processDocumentForRAG } from '../utils/rate-limiter/tokenCounter';
import type { DocumentContext } from '../utils/rate-limiter/tokenCounter';
import RateLimitIndicator from './RateLimitIndicator';
import ContextOptimizationPanel from './ContextOptimizationPanel';
import AudioInputButton from './AudioInputButton';
import CompressionStatisticsPanel from './CompressionStatisticsPanel';
import { Upload } from 'lucide-react';
import { ASU_PARTICIPANTS, ParticipantGrid } from './ConversationParticipant';
import { PERSONA_CHAT_TEMPLATES, PersonaChatTemplate } from './PersonaChatSelection';

// Create a wrapper component for markdown content
const MarkdownContent: React.FC<{ content: string }> = ({ content }) => {
  return (
    <div className="prose prose-sm max-w-none overflow-auto">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
};

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
  const [ragDocuments, setRagDocuments] = useState<TokenCounterDocumentContext[]>([]);
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(settings.preferredChatProvider === 'gemini' ? 'gemini-2.0-flash' : (ollama.status.currentModel || 'llama3.1:8b'));
  const [activeParticipant, setActiveParticipant] = useState<string | undefined>(undefined);
  const [isScrolling, setIsScrolling] = useState(false);
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages]);
  
  // Calculate token usage when messages change
  useEffect(() => {
    const calculateTokens = () => {
      // Determine which model is being used
      const currentModel = settings.preferredChatProvider === 'gemini' ? 'gemini-2.0-flash' : 
                          ollama.status.currentModel || 'llama3.1:8b';
      
      // Get the context window size for this model
      const modelLimits = MODEL_LIMITS[currentModel] || MODEL_LIMITS['gemini-2.0-flash'];
      const maxTokens = modelLimits.contextWindow;
      
      // Count tokens in all messages
      let totalTokens = 0;
      conversation.messages.forEach(msg => {
        totalTokens += estimateTokenCount(msg.content);
      });
      
      // Add tokens from current input
      if (input) {
        totalTokens += estimateTokenCount(input);
      }
      
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
  }, [conversation.messages, input, settings.preferredChatProvider, ollama.status.currentModel]);
  
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
    msg.isVisible !== false && msg.role !== 'system'
  );
  
  // Get AI response based on currently selected provider
  const getAIResponse = async (userMessage: string): Promise<string> => {
    const preferredProvider = settings.preferredChatProvider;
    const hasGeminiApiKey = !!settings.geminiApiKey && settings.geminiApiKey.trim() !== '';
    
    // Build message history for context
    const messageHistory = conversation.messages
      .filter(msg => {
        // Include messages that are user or assistant messages
        return msg.role === 'user' || msg.role === 'assistant';
      })
      .map(msg => ({
        role: msg.role,
        content: msg.content
      }));
    
    // Add the new user message
    messageHistory.push({
      role: 'user',
      content: userMessage
    });
    
    // Use Gemini if it's the preferred provider and has an API key
    if (preferredProvider === 'gemini' && hasGeminiApiKey) {
      try {
        const response = await geminiService.generateChatCompletion(messageHistory);
        return response.text;
      } catch (error) {
        console.error("Error using Gemini:", error);
        throw new Error(`Gemini error: ${(error as Error).message}`);
      }
    } 
    // Otherwise use Ollama if connected
    else if (ollama.status.isConnected) {
      try {
        return await ollama.sendMessage(userMessage);
      } catch (error) {
        console.error("Error using Ollama:", error);
        throw new Error(`Ollama error: ${(error as Error).message}`);
      }
    } 
    // No available provider
    else {
      throw new Error("No available AI provider. Please configure Ollama or Gemini in Settings.");
    }
  };
  
  // Stream AI response
  const streamAIResponse = async (
    userMessage: string, 
    messageId: string
  ): Promise<string> => {
    const preferredProvider = settings.preferredChatProvider;
    const hasGeminiApiKey = !!settings.geminiApiKey && settings.geminiApiKey.trim() !== '';
    
    // Build message history for context
    const messageHistory = conversation.messages
      .filter(msg => {
        // Include messages that are user or assistant messages
        return msg.role === 'user' || msg.role === 'assistant';
      })
      .map(msg => ({
        role: msg.role,
        content: msg.content
      }));
    
    // Add the new user message
    messageHistory.push({
      role: 'user',
      content: userMessage
    });
    
    // Stream using Gemini if it's the preferred provider
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
          
          // Update the message with accumulated response
          conversationManager.updateMessage(
            conversation.id,
            messageId,
            { 
              content: fullResponse,
              role: 'assistant' // Explicitly ensure role is 'assistant'
            }
          );
          
          // Trigger UI update
          onConversationUpdate();
          
          // Add a small delay to make streaming smoother and reduce UI updates
          await new Promise(resolve => setTimeout(resolve, 10));
        }
        
        console.log('Gemini streaming complete, full response length:', fullResponse.length);
        
        // Make one final update to ensure the role is correct
        conversationManager.updateMessage(
          conversation.id,
          messageId,
          { 
            content: fullResponse,
            role: 'assistant'
          }
        );
        
        return fullResponse;
      } catch (error) {
        console.error("Error streaming from Gemini:", error);
        throw new Error(`Gemini streaming error: ${(error as Error).message}`);
      }
    }
    // Stream using Ollama if connected
    else if (ollama.status.isConnected && ollama.isStreamingSupported()) {
      try {
        console.log('Starting Ollama streaming response');
        let fullResponse = '';
        
        // Create the stream but handle it directly in the for-await loop
        const stream = ollama.sendMessageStream(userMessage);
        
        // Process the stream with for-await
        for await (const chunk of stream) {
          // Add the chunk to our response
          fullResponse += chunk;
          
          // Update the message with accumulated response
          conversationManager.updateMessage(
            conversation.id,
            messageId,
            { 
              content: fullResponse,
              role: 'assistant' // Explicitly ensure role is 'assistant'
            }
          );
          
          // Trigger UI update
          onConversationUpdate();
          
          // Add a small delay to make streaming smoother and reduce UI updates
          await new Promise(resolve => setTimeout(resolve, 10));
        }
        
        console.log('Ollama streaming complete, full response length:', fullResponse.length);
        
        // Make one final update to ensure the role is correct
        conversationManager.updateMessage(
          conversation.id,
          messageId,
          { 
            content: fullResponse,
            role: 'assistant'
          }
        );
        
        return fullResponse;
      } catch (error) {
        console.error("Error streaming from Ollama:", error);
        throw new Error(`Ollama streaming error: ${(error as Error).message}`);
      }
    } 
    // Fall back to non-streaming approach
    else {
      return getAIResponse(userMessage);
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
      // Create an initial empty message for the assistant
      const aiMessage: Omit<Message, 'id' | 'timestamp'> = {
        role: 'assistant',
        content: '',
        isVisible: true
      };
      
      // Add the empty message and get its ID
      const newMessage = conversationManager.addMessage(conversation.id, aiMessage);
      
      // Verify the role is set correctly for the new message
      console.log('Created assistant message with ID:', newMessage.id, 'and role:', newMessage.role);
      
      // Ensure the role is set correctly
      if (newMessage.role !== 'assistant') {
        console.warn('Message role was not set correctly, fixing...');
        conversationManager.updateMessage(conversation.id, newMessage.id, {
          role: 'assistant'
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
        
        // Update the assistant message with the response
        conversationManager.updateMessage(conversation.id, newMessage.id, {
          content: response,
          role: 'assistant' // Explicitly ensure role is assistant
        });
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
  const handleFilesProcessed = (newDocuments: TokenCounterDocumentContext[]) => {
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
    
    // If a new participant is selected, update the system prompt
    if (newActiveParticipant) {
      const participant = ASU_PARTICIPANTS.find(p => p.id === newActiveParticipant);
      if (participant) {
        console.log(`Selected participant: ${participant.name}`);
        
        // Find matching persona from PERSONA_CHAT_TEMPLATES
        const personaTemplate = PERSONA_CHAT_TEMPLATES.find(
          template => template.persona === participant.name
        );
        
        if (personaTemplate && personaTemplate.systemPrompt) {
          // Add or update system message
          const existingSystemMessage = conversation.messages.find(m => m.role === 'system');
          
          if (existingSystemMessage) {
            // Update existing system message
            conversationManager.updateMessage(
              conversation.id,
              existingSystemMessage.id,
              { content: personaTemplate.systemPrompt }
            );
          } else {
            // Add new system message
            const systemMessage = {
              role: 'system',
              content: personaTemplate.systemPrompt,
              isVisible: false
            };
            
            conversationManager.addMessageAtPosition(conversation.id, systemMessage, 0);
          }
          
          // Add a user-visible message about the participant
          const infoMessage = {
            role: 'assistant',
            content: `You are now chatting with **${participant.name}**, ${participant.role}. Feel free to ask about ${participant.expertise.join(', ')}.`,
            isVisible: true
          };
          
          conversationManager.addMessage(conversation.id, infoMessage);
          onConversationUpdate();
        }
      }
    } else if (activeParticipant && !newActiveParticipant) {
      // If participant is deselected, remove system prompt
      const existingSystemMessage = conversation.messages.find(m => m.role === 'system');
      
      if (existingSystemMessage) {
        // Remove the system message or reset to default
        conversationManager.hideMessage(conversation.id, existingSystemMessage.id);
        
        // Add a message about ending the specialized chat
        const endMessage = {
          role: 'assistant',
          content: 'You are now back to chatting with a general AI assistant.',
          isVisible: true
        };
        
        conversationManager.addMessage(conversation.id, endMessage);
        onConversationUpdate();
      }
    }
  };
  
  // Remove a RAG document
  const removeRagDocument = (index: number) => {
    const updatedDocuments = [...ragDocuments];
    updatedDocuments.splice(index, 1);
    setRagDocuments(updatedDocuments);
  };
  
  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header with model selection */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex flex-wrap items-center gap-2 justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {conversation.title || 'New Conversation'}
            </h2>
            <p className="text-sm text-gray-500">
              {providerInfo.name} - {providerInfo.status}
            </p>
          </div>
          
          <ModelSwitcher 
            currentModel={selectedModel} 
            onModelChange={handleModelChange}
            compact={true}
          />
        </div>
      </div>
      
      {/* Main chat area - now full width */}
      <div className="flex-1 overflow-auto p-4">
        {/* Participant selection (if implemented) */}
        <CollapsiblePanel 
          title="Conversation Partners" 
          initiallyExpanded={false}
          className="mb-4"
        >
          <ParticipantGrid 
            participants={ASU_PARTICIPANTS} 
            activeParticipant={activeParticipant}
            onSelectParticipant={handleSelectParticipant}
          />
        </CollapsiblePanel>
        
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
                  <MarkdownContent content={message.content} />
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
              title="Upload document for context"
            >
              <Upload className="w-5 h-5" />
              {isFileLoading && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
              )}
            </button>
            <input
              id="file-upload"
              type="file"
              accept=".pdf,.txt,.md,.doc,.docx"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setIsFileLoading(true);
                  
                  // Read the file content
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const content = event.target?.result as string;
                    // Now process the document with both file and content
                    const docContext = processDocumentForRAG(file, content);
                    handleFilesProcessed([docContext]);
                    setIsFileLoading(false);
                  };
                  
                  reader.onerror = () => {
                    console.error("Error reading file");
                    setIsFileLoading(false);
                  };
                  
                  // Start reading the file as text
                  reader.readAsText(file);
                  
                  // Clear the input so the same file can be uploaded again if needed
                  e.target.value = '';
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
          total={tokenUsage.total} 
          remaining={tokenUsage.remaining} 
          max={tokenUsage.maxTokens}
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