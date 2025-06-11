import React, { useState, useRef, useEffect } from 'react';
import { XMarkIcon, PaperAirplaneIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useChatService } from '../hooks/useChatService';
import { generateHoneInPrompt } from '../utils/promptTemplates';
import ProgressiveThinkingIndicator from './ProgressiveThinkingIndicator';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface HoneInChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  initialIdea: {
    title: string;
    description: string;
    aiConceptualization?: string;
  };
}

export const HoneInChatbot: React.FC<HoneInChatbotProps> = ({
  isOpen,
  onClose,
  initialIdea
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatService = useChatService();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getStatusMessage = () => {
    if (chatService.isConnected) {
      return `Connected via ${chatService.providerName}`;
    } else if (chatService.error) {
      return `Configure AI services in Settings to get enhanced responses`;
    } else {
      return 'Loading AI services...';
    }
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Initialize with welcome message when chatbot opens
      const welcomeMessage: Message = {
        id: 'welcome',
        type: 'assistant',
        content: `I'm here to help you refine your idea: "${initialIdea.title}"\n\nLet's explore this concept in more detail and develop it into something implementable. What specific aspect would you like to focus on first?\n\n*${getStatusMessage()}*`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, initialIdea.title, messages.length, chatService.isConnected, chatService.providerName, chatService.error]);

  const handleSendMessage = async (message: string) => {
    if (isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      console.log('HoneIn: Attempting to send message via chat service');
      console.log('HoneIn: Chat service connected:', chatService.isConnected);
      console.log('HoneIn: Provider:', chatService.providerName);

      if (!chatService.isConnected) {
        console.error('HoneIn: No AI services available:', chatService.error);
        throw new Error(`No AI services are configured. ${chatService.error || 'Please configure an AI service in Settings.'}`);
      }

      // Generate context-aware prompt
      const honeInPrompt = generateHoneInPrompt(
        initialIdea?.title || 'General Discussion',
        initialIdea?.description || '',
        initialIdea?.aiConceptualization || '',
        message
      );

      console.log('HoneIn: Generated context-aware prompt');
      const response = await chatService.sendMessage(honeInPrompt);
      console.log('HoneIn: Received AI response successfully');

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('HoneIn: Error sending message:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      let displayMessage = '';
      if (errorMessage.includes('No AI services') || errorMessage.includes('not configured')) {
        displayMessage = 'AI services are not configured. Please set up your API keys in Settings to continue the conversation.';
      } else if (errorMessage.includes('API key')) {
        displayMessage = 'There\'s an issue with your API key. Please check your configuration in Settings.';
      } else if (errorMessage.includes('rate limit')) {
        displayMessage = 'Rate limit exceeded. Please wait a moment before sending another message.';
      } else {
        displayMessage = `I apologize, but I encountered an error: ${errorMessage}. Please try again or check your Settings.`;
      }

      const errorResponseMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: displayMessage,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorResponseMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputMessage);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Hone In: {initialIdea.title}</h2>
            <p className="text-sm text-gray-600 mt-1">Refine and develop your idea with AI guidance</p>
            <div className="text-xs text-gray-500 mt-1 flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${chatService.isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              {getStatusMessage()}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl rounded-lg px-4 py-3 ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-red-600 to-yellow-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-2 ${
                  message.type === 'user' ? 'text-red-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          
          {/* Progressive Thinking Indicator */}
          <ProgressiveThinkingIndicator
            isThinking={isLoading}
            modelName={chatService.providerName}
          />
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                placeholder={isLoading ? "Thinking..." : "Type your message..."}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                rows={3}
              />
            </div>
            <button
              onClick={() => handleSendMessage(inputMessage)}
              disabled={!inputMessage.trim() || isLoading}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-yellow-500 text-white rounded-lg hover:from-red-700 hover:to-yellow-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading ? (
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
              ) : (
                <PaperAirplaneIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 