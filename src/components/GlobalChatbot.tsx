import React, { useState, useRef, useEffect } from 'react';
import {
  XMarkIcon,
  PaperAirplaneIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useChatService } from '../hooks/useChatService';
import { usePageContext, generateContextualPrompt } from '../utils/contextAware';
import { getRelevantResources, formatResourcesForResponse } from '../utils/webKnowledge';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isError?: boolean;
}

interface GlobalChatbotProps {
  onClose: () => void;
  projectData?: any;
  projects?: any[];
  productTypes?: any[];
}

export const GlobalChatbot: React.FC<GlobalChatbotProps> = ({ onClose, projectData, projects = [], productTypes = [] }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { sendMessage, isConnected, isLoading, providerName } = useChatService();
  const pageContext = usePageContext(projectData);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        text: generateWelcomeMessage(),
        isUser: false,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isConnected, pageContext.pageName]);

  const generateWelcomeMessage = (): string => {
    if (isConnected) {
      return `Hi! I'm your ASU AI Assistant running with ${providerName}. I can help with ${pageContext.description.toLowerCase()}. What do you need?`;
    } else {
      return `Hi! I'm your ASU AI Assistant. I can help with ${pageContext.description.toLowerCase()}. Configure your AI service in settings for better responses!`;
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsTyping(true);

    try {
      let response: string;

      try {
        // Use AI service with context-aware prompt including real project data
        const contextualPrompt = generateContextualPrompt(currentInput, pageContext, projects);
        response = await sendMessage(contextualPrompt);
      } catch (error) {
        // Fallback to predefined responses with context awareness
        response = generateFallbackResponse(currentInput);
      }

      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: `Sorry, I encountered an error: ${error}. You can try asking again or configure your AI service in settings.`,
        isUser: false,
        timestamp: new Date(),
        isError: true
      };

      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const generateFallbackResponse = (userMessage: string): string => {
    const lowercaseMessage = userMessage.toLowerCase();
    let response = "";
    
    // Quick answers for simple questions
    if (lowercaseMessage.includes('what is') || lowercaseMessage.includes('what are')) {
      if (lowercaseMessage.includes('ai projects')) {
        return "AI Projects are custom assistants for productivity, coding, analytics, and more. Ready to use and customize!";
      }
      if (lowercaseMessage.includes('extensions')) {
        return "Extensions are chatbots you can embed on your own websites. Perfect for customer support or interactive help.";
      }
      if (lowercaseMessage.includes('local models')) {
        return "Local Models run on your computer with Ollama. Completely private, no internet needed once downloaded.";
      }
      if (lowercaseMessage.includes('ollama')) {
        return "Ollama runs AI models locally on your computer. Private, free, and works offline!";
      }
    }

    // How-to questions
    if (lowercaseMessage.includes('how do i') || lowercaseMessage.includes('how to')) {
      if (lowercaseMessage.includes('clone') || lowercaseMessage.includes('use project')) {
        return "Just click on any project, then hit 'Clone Project'. Follow the setup steps and you're ready to go!";
      }
      if (lowercaseMessage.includes('filter') || lowercaseMessage.includes('search')) {
        return "Use the category buttons above to filter, or just type in the search bar to find what you need.";
      }
    }
    
    // Check for specific project searches (marketplace functionality)
    if (projects.length > 0) {
      const matchingProject = projects.find(project => 
        project.name.toLowerCase().includes(lowercaseMessage) ||
        project.tags.some((tag: string) => tag.toLowerCase().includes(lowercaseMessage))
      );
      
      if (matchingProject) {
        response = `Found **${matchingProject.name}**! ${matchingProject.description.substring(0, 100)}... \n\n${matchingProject.rating}/5 stars • ${matchingProject.clonedCount} uses • ${matchingProject.category}`;
      }

      // Check for category searches
      if (!response) {
        const matchingCategory = projects.filter((project: any) => 
          project.category.toLowerCase().includes(lowercaseMessage)
        );
        
        if (matchingCategory.length > 0) {
          const categoryName = matchingCategory[0].category;
          const count = matchingCategory.length;
          const topProjects = matchingCategory.slice(0, 2).map((p: any) => p.name).join(', ');
          response = `Found ${count} ${categoryName.toLowerCase()} projects! Top ones: ${topProjects}. Use the filter above to see them all.`;
        }
      }
    }

    // Context-specific responses
    if (!response && pageContext.pageName === 'Marketplace') {
      if (lowercaseMessage.includes('popular') && lowercaseMessage.includes('project')) {
        // Show actual popular projects based on clone count
        const popularProjects = projects
          .filter((p: any) => p.category !== 'Tutorial' && p.category !== 'Extension' && p.category !== 'Local Model')
          .sort((a: any, b: any) => b.clonedCount - a.clonedCount)
          .slice(0, 3);
        
        if (popularProjects.length > 0) {
          const top = popularProjects[0];
          const others = popularProjects.slice(1, 3).map(p => p.name).join(', ');
          
          response = `**${top.name}** is most popular with ${top.clonedCount} uses! Also trending: ${others}. Check the sort dropdown for more.`;
        } else {
          response = `Use the sort dropdown above to see popular projects by usage.`;
        }
      } else if (lowercaseMessage.includes('project') || lowercaseMessage.includes('find') || lowercaseMessage.includes('help')) {
        const samples = projects
          .filter((p: any) => p.category !== 'Tutorial')
          .slice(0, 2)
          .map((p: any) => p.name)
          .join(', ');
        
        response = `${samples ? `Try ${samples} or others! ` : ''}Use the category buttons above or search bar to find what you need. Filter by AI Projects, Extensions, Local Models, or Tutorials.`;
      }
    } else if (!response && pageContext.pageName === 'Learning Hub') {
      if (lowercaseMessage.includes('setup') || lowercaseMessage.includes('install') || lowercaseMessage.includes('tutorial') || lowercaseMessage.includes('help')) {
        response = "We have tutorials for Gemini API, Local Llama setup, Multi-API integration, and the ASU Local Wrapper. Each has videos and step-by-step guides!";
      }
    }

    // AI service setup responses
    if (!response && (lowercaseMessage.includes('ollama') || lowercaseMessage.includes('local') || lowercaseMessage.includes('setup'))) {
      response = "Get Ollama from [ollama.com](https://ollama.com), then run `ollama serve` and `ollama pull llama3.3:8b`. You'll have private AI that works offline! Or configure Gemini API in settings for cloud-based AI.";
    }

    // Quick actions based on context
    if (!response && (lowercaseMessage.includes('help') || lowercaseMessage.includes('what can you do'))) {
      const quickActions = pageContext.quickActions.slice(0, 2);
      response = `I can help with ${quickActions.join(' or ')}. ${isConnected ? `Running with ${providerName}!` : 'Configure your AI service in settings for better responses!'}`;
    }

    // Default context-aware response
    if (!response) {
      const topics = pageContext.helpTopics.slice(0, 2).join(' and ');
      response = `I can help with ${pageContext.description.toLowerCase()}. Ask me about ${topics}, or anything else!`;
    }

    // Add relevant web resources
    const relevantResources = getRelevantResources(userMessage, 2);
    const resourcesText = formatResourcesForResponse(relevantResources);
    
    if (resourcesText) {
      response += `\n\n${resourcesText}`;
    }

    return response;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-yellow-500 rounded-full flex items-center justify-center mr-3">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">ASU AI Assistant</h3>
              <p className="text-sm text-gray-500">
                {isConnected ? `Connected via ${providerName}` : 'Offline mode'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.isUser
                    ? 'bg-red-600 text-white'
                    : message.isError
                    ? 'bg-red-50 text-red-800 border border-red-200'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.text}</div>
                <div className={`text-xs mt-1 ${
                  message.isUser ? 'text-red-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 p-3 rounded-lg">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about the marketplace..."
              className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              rows={1}
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
          
          {!isConnected && (
            <div className="mt-2 text-sm text-amber-600">
              💡 Configure your AI service in settings for enhanced responses
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 