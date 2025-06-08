import React, { useState, useRef, useEffect } from 'react';
import { 
  XMarkIcon, 
  PaperAirplaneIcon, 
  ChatBubbleLeftRightIcon,
  PlayIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  CommandLineIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useOllama } from '../hooks/useOllama';
import { usePageContext, generateContextualPrompt } from '../utils/contextAware';
import { getRelevantResources, formatResourcesForResponse } from '../utils/webKnowledge';
import { MarkdownMessage } from './MarkdownMessage';

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
  
  const { status, isLoading, sendMessage, startOllama, pullModel, checkOllamaStatus } = useOllama();
  const pageContext = usePageContext(projectData);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize welcome message based on context
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: '1',
        text: generateWelcomeMessage(),
        isUser: false,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [status.isConnected, pageContext.pageName]);

  const generateWelcomeMessage = (): string => {
    if (status.isConnected && status.currentModel) {
      return `Hi! I'm your ASU AI Assistant running locally with ${status.currentModel}. I can help with ${pageContext.description.toLowerCase()}. What do you need?`;
    } else if (status.error) {
      return `Hi! I'm your ASU AI Assistant. I can help with ${pageContext.description.toLowerCase()}. Want better responses? Set up Ollama for private local AI!`;
    } else {
      return `Hi! I'm your ASU AI Assistant. I can help with ${pageContext.description.toLowerCase()}. What can I do for you?`;
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

      if (status.isConnected) {
        // Use local Ollama with context-aware prompt including real project data
        const contextualPrompt = generateContextualPrompt(currentInput, pageContext, projects);
        response = await sendMessage(contextualPrompt);
      } else {
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
        text: `Sorry, I encountered an error: ${error}. You can try asking again or start Ollama for better local AI assistance.`,
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
             } else if (lowercaseMessage.includes('top rated') || lowercaseMessage.includes('best project')) {
        // Show top-rated projects
        const topRated = projects
          .filter((p: any) => p.category !== 'Tutorial' && p.category !== 'Extension' && p.category !== 'Local Model')
          .sort((a: any, b: any) => b.rating - a.rating)
          .slice(0, 5);
        
        if (topRated.length > 0) {
          const best = topRated[0];
          const others = topRated.slice(1, 3).map(p => `${p.name} (${p.rating}/5)`).join(', ');
          
          response = `**${best.name}** has the highest rating at ${best.rating}/5 stars! Also great: ${others}. Sort by "Rating" to see more.`;
        }
      } else if (lowercaseMessage.includes('newest') || lowercaseMessage.includes('recent project')) {
        // Show newest projects
        const newest = projects
          .filter((p: any) => p.category !== 'Tutorial' && p.category !== 'Extension' && p.category !== 'Local Model')
          .sort((a: any, b: any) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime())
          .slice(0, 5);
        
        if (newest.length > 0) {
          const latest = newest.slice(0, 3).map(p => p.name).join(', ');
          
          response = `Latest additions: ${latest}. Sort by "Newest" to see all recent projects!`;
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

    // Ollama-specific responses
    if (!response && (lowercaseMessage.includes('ollama') || lowercaseMessage.includes('local') || lowercaseMessage.includes('setup'))) {
      response = "Get Ollama from [ollama.com](https://ollama.com), then run `ollama serve` and `ollama pull llama3.3:8b`. You'll have private AI that works offline!";
    }

    // Quick actions based on context
    if (!response && (lowercaseMessage.includes('help') || lowercaseMessage.includes('what can you do'))) {
      const quickActions = pageContext.quickActions.slice(0, 2);
      response = `I can help with ${quickActions.join(' or ')}. ${status.isConnected ? 'Running locally for privacy!' : 'Want better responses? Try setting up Ollama!'}`;
    }

    // Default context-aware response
    if (!response) {
      const topics = pageContext.helpTopics.slice(0, 2).join(' and ');
      response = `I can help with ${pageContext.description.toLowerCase()}. Ask me about ${topics}, or anything else!`;
    }

    // Add relevant web resources
    const relevantResources = getRelevantResources(userMessage, 2);
    const resourcesText = formatResourcesForResponse(relevantResources);
    
    return response + resourcesText;
  };

  const handleStartOllama = async () => {
    setIsTyping(true);
    try {
      const result = await startOllama();
      
      const statusMessage: ChatMessage = {
        id: Date.now().toString(),
        text: result.success 
          ? "✅ Ollama started successfully! You now have private local AI."
          : "💡 To start Ollama, open your terminal and run: `ollama serve`\n\nThen I'll be able to provide enhanced AI assistance with complete privacy!",
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, statusMessage]);
      
      // Check status after a delay
      setTimeout(() => {
        checkOllamaStatus();
      }, 3000);
      
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        text: "Unable to start Ollama automatically. Please run `ollama serve` in your terminal manually.",
        isUser: false,
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handlePullModel = async (modelName: string = 'llama3.3:8b') => {
    setIsTyping(true);
    try {
      const result = await pullModel(modelName);
      
      const statusMessage: ChatMessage = {
        id: Date.now().toString(),
        text: result.success 
          ? `✅ ${modelName} downloaded successfully! Ready for private AI conversations.`
          : `❌ Failed to download ${modelName}: ${result.message}`,
        isUser: false,
        timestamp: new Date(),
        isError: !result.success
      };
      
      setMessages(prev => [...prev, statusMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        text: `Error downloading model: ${error}`,
        isUser: false,
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = status.isConnected 
    ? pageContext.quickActions 
    : [
        "Help me set up local AI",
        "What is Ollama?",
        ...pageContext.quickActions.slice(0, 2)
      ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-end p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md h-[500px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-red-800 to-yellow-600 text-white rounded-t-lg">
          <div className="flex items-center">
            {status.isConnected ? (
                             <div className="flex items-center">
                 <SparklesIcon className="w-6 h-6 mr-2" />
                 <div>
                   <h3 className="font-semibold">ASU AI Assistant</h3>
                   <p className="text-xs opacity-80">Local • {status.currentModel}</p>
                 </div>
               </div>
             ) : (
               <div className="flex items-center">
                 <ChatBubbleLeftRightIcon className="w-6 h-6 mr-2" />
                 <div>
                   <h3 className="font-semibold">ASU AI Assistant</h3>
                   <p className="text-xs opacity-80">{pageContext.pageName} • MyAI Builder</p>
                 </div>
               </div>
             )}
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded-md transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Status Banner */}
        {!status.isConnected && !isLoading && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mr-2" />
              <div className="flex-1">
                <p className="text-sm text-yellow-800">
                  Enhanced AI available. {status.models.length === 0 ? 'Set up local Ollama for privacy!' : 'Start Ollama for better responses.'}
                </p>
              </div>
              <button
                onClick={handleStartOllama}
                className="ml-2 flex items-center px-3 py-1 bg-yellow-500 text-yellow-900 rounded-md text-xs hover:bg-yellow-600 transition-colors"
              >
                <PlayIcon className="w-4 h-4 mr-1" />
                Setup
              </button>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.isUser
                    ? 'bg-blue-600 text-white'
                    : message.isError 
                    ? 'bg-red-100 text-red-900 border border-red-200'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <MarkdownMessage content={message.text} />
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        {messages.length <= 2 && (
          <div className="px-4 pb-2">
            <p className="text-xs text-gray-500 mb-2">Quick actions:</p>
            <div className="grid grid-cols-1 gap-2">
              {quickActions.slice(0, 3).map((action, index) => (
                <button
                  key={index}
                  onClick={() => setInputValue(action)}
                  className="flex items-center p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded-md transition-colors text-left"
                >
                  <LightBulbIcon className="w-4 h-4 mr-1 text-gray-400" />
                  <span className="truncate">{action}</span>
                </button>
              ))}
              {!status.isConnected && status.models.length === 0 && (
                <button
                  onClick={() => handlePullModel('llama3.3:8b')}
                  className="flex items-center p-2 text-xs bg-blue-50 hover:bg-blue-100 rounded-md transition-colors text-left text-blue-700"
                >
                  <CommandLineIcon className="w-4 h-4 mr-1 text-blue-500" />
                  <span>Download Llama 3.3 model</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={status.isConnected ? "Ask me anything..." : "Ask me about this page..."}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 text-sm"
              disabled={isTyping}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className="px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <PaperAirplaneIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 