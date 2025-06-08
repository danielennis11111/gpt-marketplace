import React, { useState, useRef, useEffect } from 'react';
import { XMarkIcon, PaperAirplaneIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useChatService } from '../hooks/useChatService';
import { generateHoneInPrompt } from '../utils/promptTemplates';

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
  const { sendMessage, isConnected, providerName } = useChatService();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Initialize with welcome message when chatbot opens
      const welcomeMessage: Message = {
        id: 'welcome',
        type: 'assistant',
        content: `I'm here to help you refine your idea: "${initialIdea.title}"\n\nLet's explore this concept in more detail and develop it into something implementable. What specific aspect would you like to focus on first?`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, initialIdea.title, messages.length]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      let response: string;
      
      try {
        // Use our specialized prompt template to generate a high-quality response
        const prompt = generateHoneInPrompt(
          initialIdea.title,
          initialIdea.description,
          initialIdea.aiConceptualization,
          inputMessage
        );
        
        response = await sendMessage(prompt);
      } catch (error) {
        console.error('Error generating response:', error);
        // Fallback responses when AI provider is not connected
        response = generateFallbackResponse(inputMessage);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I'm having trouble processing that right now. Could you try rephrasing your question?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Only used as a fallback when AI provider is not connected
  const generateFallbackResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('feature') || message.includes('functionality')) {
      return "That's an interesting feature idea! What specific problem would this feature solve for users? Have you considered how it would integrate with the core functionality?";
    }
    
    if (message.includes('technical') || message.includes('implement')) {
      return "For the technical implementation, what's your preferred technology stack? Are there any constraints or requirements we should consider?";
    }
    
    if (message.includes('user') || message.includes('audience')) {
      return "Understanding your target users is crucial. What are their main pain points, and how does your idea address them? Can you describe a typical user scenario?";
    }
    
    if (message.includes('challenge') || message.includes('problem')) {
      return "Good thinking about potential challenges. What resources do you have available to tackle this? Have you considered breaking it down into smaller, manageable pieces?";
    }
    
    if (message.includes('monetize') || message.includes('business')) {
      return "That's a smart business consideration. What value proposition does your idea offer? Who would be willing to pay for this solution?";
    }
    
    return "That's a great direction to explore! Can you tell me more about what you envision? What would success look like for this aspect of your project?";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-4 py-3 flex items-center space-x-2">
                <ArrowPathIcon className="w-4 h-4 text-gray-500 animate-spin" />
                <span className="text-gray-600">Thinking...</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-6">
          {!isConnected && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                {providerName} is not connected. Using fallback responses.
              </p>
            </div>
          )}
          
          <div className="flex space-x-4">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about features, implementation, users, challenges..."
              className="flex-1 resize-none border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              rows={2}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-yellow-500 text-white rounded-lg hover:from-red-700 hover:to-yellow-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <p className="text-xs text-gray-500">
              Press Enter to send, Shift+Enter for new line
            </p>
            <button
              onClick={() => setMessages([])}
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              Clear conversation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 