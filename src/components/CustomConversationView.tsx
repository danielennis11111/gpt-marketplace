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
  
  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4 bg-gray-50">
        {/* Context Limit Warning */}
        {tokenUsage.percentage >= 60 && (
          <ContextLimitWarning
            usagePercentage={tokenUsage.percentage}
            totalTokens={tokenUsage.total}
            maxTokens={tokenUsage.maxTokens}
            remainingTokens={tokenUsage.remaining}
            onCompressHistory={handleCompressHistory}
            onCreateNewConversation={() => {
              conversationManager.createConversation();
              onConversationUpdate();
            }}
          />
        )}

        {visibleMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p className="text-lg">Send a message to start a conversation</p>
            <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2 max-w-3xl">
              {template.suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-left hover:bg-gray-100 transition-colors"
                  onClick={() => {
                    setInput(question);
                  }}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        ) : (
          visibleMessages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-800'
                }`}
              >
                <MarkdownContent content={message.content} />
              </div>
            </div>
          ))
        )}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-3xl rounded-lg p-4 bg-white border border-gray-200">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce delay-100"></div>
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        
        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <div className="flex-1 relative">
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[60px]"
              placeholder="Type your message here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              rows={1}
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || !input.trim()}
          >
            Send
          </button>
        </form>
        
        {/* Provider Status */}
        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <div
              className={`w-2 h-2 rounded-full ${
                providerInfo.isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span>
              {providerInfo.name}: {providerInfo.status}
            </span>
          </div>
        </div>
        
        {/* Token Usage Preview */}
        <div className="mt-3">
          <TokenUsagePreview
            conversation={conversation}
            template={template}
            currentInput={input}
            currentModelId={settings.preferredChatProvider === 'gemini' ? 'gemini-2.0-flash' : (ollama.status.currentModel || undefined)}
          />
        </div>
      </div>
      <div ref={messagesEndRef} />
    </div>
  );
};

export default CustomConversationView;