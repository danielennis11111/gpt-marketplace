import React, { useState, useRef, useEffect } from 'react';
import { useOllama } from '../hooks/useOllama';
import { useSettings } from '../contexts/SettingsContext';
import type { Conversation, ConversationTemplate, Message } from '../utils/rate-limiter/custom-adapter';
import { geminiService } from '../utils/rate-limiter/geminiService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import TokenUsagePreview from './TokenUsagePreview';
import ContextLimitWarning from './ContextLimitWarning';
import { estimateTokenCount, MODEL_LIMITS } from '../utils/rate-limiter/tokenCounter';
import { CompressionEngine } from '../utils/rate-limiter/compressionEngine';
import type { CompressionStrategy } from '../utils/rate-limiter/compressionEngine';
import { processDocumentForRAG } from '../utils/rate-limiter/tokenCounter';
import type { DocumentContext } from '../utils/rate-limiter/tokenCounter';
import RateLimitIndicator from './RateLimitIndicator';
import ContextOptimizationPanel from './ContextOptimizationPanel';
import FileUploadArea from './FileUploadArea';
import AudioInputButton from './AudioInputButton';
import ModelSwitcher from './ModelSwitcher';
import { ParticipantGrid, ASU_PARTICIPANTS } from './ConversationParticipant';
import CollapsiblePanel from './CollapsiblePanel';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const ollama = useOllama();
  const { settings } = useSettings();
  const [compressionEngine] = useState(() => CompressionEngine.getInstance());
  const [tokenUsage, setTokenUsage] = useState({
    total: 0,
    remaining: 0,
    percentage: 0,
    maxTokens: 0
  });
  
  // Add state for RAG documents
  const [ragDocuments, setRagDocuments] = useState<DocumentContext[]>([]);
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(settings.preferredChatProvider === 'gemini' ? 'gemini-2.0-flash' : (ollama.status.currentModel || 'llama3.1:8b'));
  const [activeParticipant, setActiveParticipant] = useState<string | undefined>(undefined);
  
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
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
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
      // Get response from AI provider
      const response = await getAIResponse(input);
      
      // Add AI response to conversation
      const aiMessage: Omit<Message, 'id' | 'timestamp'> = {
        role: 'assistant',
        content: response,
        isVisible: true
      };
      
      conversationManager.addMessage(conversation.id, aiMessage);
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
        status: 'Connected'
      };
    } else if (preferredProvider === 'ollama' && ollama.status.isConnected) {
      return {
        isConnected: true,
        name: ollama.status.currentModel || 'Ollama',
        status: 'Connected'
      };
    } else if (ollama.status.isConnected) {
      return {
        isConnected: true,
        name: ollama.status.currentModel || 'Ollama',
        status: 'Connected'
      };
    } else {
      return {
        isConnected: false,
        name: 'AI Provider',
        status: 'Not Connected'
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
    setActiveParticipant(participantId === activeParticipant ? undefined : participantId);
    
    // If a participant is selected, update the system prompt or conversation context
    if (participantId !== activeParticipant) {
      const participant = ASU_PARTICIPANTS.find(p => p.id === participantId);
      if (participant) {
        // Add participant context to conversation (simplified for example)
        console.log(`Selected participant: ${participant.name}`);
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
              {getProviderInfo()}
            </p>
          </div>
          
          <ModelSwitcher 
            currentModel={selectedModel} 
            onModelChange={handleModelChange}
          />
        </div>
      </div>
      
      {/* Main chat area */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Messages section */}
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
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-3xl rounded-lg p-3 ${
                    message.role === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white border border-gray-200 text-gray-900'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <MarkdownContent content={message.content} />
                  ) : (
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {/* Right sidebar with collapsible panels for context management */}
        <div className="md:w-80 p-4 border-t md:border-t-0 md:border-l border-gray-200 bg-white">
          {/* Context management tools */}
          <CollapsiblePanel 
            title="Context Window" 
            initiallyExpanded={true}
            className="mb-4"
          >
            <div className="space-y-4">
              <RateLimitIndicator percentage={tokenUsage.percentage} />
              <TokenUsagePreview 
                total={tokenUsage.total} 
                remaining={tokenUsage.remaining} 
                max={tokenUsage.maxTokens} 
              />
              
              {/* Only show warning if approaching limit */}
              {tokenUsage.percentage > 75 && (
                <ContextLimitWarning 
                  percentage={tokenUsage.percentage} 
                  onCompress={handleCompressHistory}
                />
              )}
            </div>
          </CollapsiblePanel>
          
          {/* File upload for RAG */}
          <CollapsiblePanel 
            title="Document Context" 
            initiallyExpanded={false}
            className="mb-4"
          >
            <div className="space-y-4">
              <FileUploadArea 
                onFilesProcessed={handleFilesProcessed}
                isLoading={isFileLoading}
                setIsLoading={setIsFileLoading}
                processDocumentForRAG={processDocumentForRAG}
              />
              
              {/* Display RAG documents */}
              {ragDocuments.length > 0 && (
                <div className="mt-2">
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Loaded Documents:</h4>
                  <ul className="space-y-1">
                    {ragDocuments.map((doc, index) => (
                      <li key={index} className="flex items-center justify-between text-sm">
                        <span className="truncate flex-1">{doc.title}</span>
                        <span className="text-xs text-gray-500 ml-2">{doc.tokenCount} tokens</span>
                        <button 
                          onClick={() => removeRagDocument(index)}
                          className="ml-2 text-red-600 hover:text-red-800"
                        >
                          &times;
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CollapsiblePanel>
          
          {/* Compression settings */}
          <CollapsiblePanel 
            title="Context Optimization" 
            initiallyExpanded={false}
            className="mb-4"
          >
            <ContextOptimizationPanel 
              onApplyCompression={handleCompressHistory}
              compressionStrategies={Object.values(CompressionStrategy)}
            />
          </CollapsiblePanel>
        </div>
      </div>
      
      {/* Input area */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <div className="flex space-x-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              disabled={isLoading}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <AudioInputButton 
              onTranscription={handleTranscription}
              disabled={isLoading}
              asugold={true}
            />
            
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-4 py-2 bg-yellow-500 text-black font-medium rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed flex-1"
              style={{ backgroundColor: '#FFC627' }}
            >
              {isLoading ? 'Thinking...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomConversationView;