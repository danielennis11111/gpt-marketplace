import React, { useState, useRef, useEffect } from 'react';
import { useOllama } from '../hooks/useOllama';
import { useSettings } from '../contexts/SettingsContext';
import type { Conversation, ConversationTemplate, Message } from '../utils/rate-limiter/custom-adapter';
import { geminiService } from '../utils/rate-limiter/geminiService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages]);
  
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
  
  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4 bg-gray-50">
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
      
      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={isLoading || !input.trim()}
          >
            Send
          </button>
        </form>
        <div className="mt-2 text-xs text-gray-500 flex items-center">
          <div className={`w-2 h-2 rounded-full ${providerInfo.isConnected ? 'bg-green-500' : 'bg-red-500'} mr-2`}></div>
          {providerInfo.isConnected 
            ? `Using ${providerInfo.name}` 
            : 'No AI provider connected. Please configure Ollama or Gemini in Settings.'}
        </div>
      </div>
    </div>
  );
};

export default CustomConversationView;