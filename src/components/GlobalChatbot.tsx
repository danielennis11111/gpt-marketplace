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
      return `## 👋 **Welcome to Your Local AI Assistant!**\n\nI'm powered by **${status.currentModel}** running locally on your machine. I'm here to help you with **${pageContext.description}**.\n\n### 🔒 **Privacy First:**\n• All conversations stay on your device\n• No data sent to external servers\n• Unlimited usage with no API costs\n\n*What can I help you with today?*`;
    } else if (status.error) {
      return `## 🤖 **${pageContext.pageName} Assistant**\n\nI'm here to help you with **${pageContext.description}**!\n\n### 🚀 **Enhanced AI Available:**\nI notice Ollama isn't running yet. Would you like me to help you set up **local AI for complete privacy**?\n\n### 💡 **I can help with:**\n• General questions about the platform\n• Navigation and feature explanations\n• Setting up local AI for enhanced assistance\n\n*How can I assist you?*`;
    } else {
      return `## 🤖 **${pageContext.pageName} Assistant**\n\nI'm here to help you with **${pageContext.description}**!\n\n🔍 *Checking for local AI models...*\n\n### 💡 **I can help with:**\n${pageContext.helpTopics.slice(0, 3).map(topic => `• ${topic}`).join('\n')}\n\n*What would you like to know?*`;
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
        // Use local Ollama with context-aware prompt
        const contextualPrompt = generateContextualPrompt(currentInput, pageContext);
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
    
    // Check for specific project searches (marketplace functionality)
    if (projects.length > 0) {
      const matchingProject = projects.find(project => 
        project.name.toLowerCase().includes(lowercaseMessage) ||
        project.tags.some((tag: string) => tag.toLowerCase().includes(lowercaseMessage))
      );
      
      if (matchingProject) {
        response = `## 🎯 Found: **${matchingProject.name}**\n\n${matchingProject.description}\n\n**Category:** ${matchingProject.category}\n**Rating:** ${'⭐'.repeat(Math.floor(matchingProject.rating))} ${matchingProject.rating}/5\n**Cloned:** ${matchingProject.clonedCount} times\n\n*Would you like to know more about this or similar projects?*`;
      }

      // Check for category searches
      if (!response) {
        const matchingCategory = projects.filter((project: any) => 
          project.category.toLowerCase().includes(lowercaseMessage)
        );
        
        if (matchingCategory.length > 0) {
          const categoryName = matchingCategory[0].category;
          const count = matchingCategory.length;
          const topProjects = matchingCategory.slice(0, 3).map((p: any) => `• **${p.name}**`).join('\n');
          response = `## 📂 ${categoryName} Projects\n\nI found **${count} projects** in this category!\n\n### Top Projects:\n${topProjects}\n\n*Want to explore this category further?*`;
        }
      }
    }

    // Context-specific responses
    if (!response && pageContext.pageName === 'Marketplace') {
      if (lowercaseMessage.includes('project') || lowercaseMessage.includes('find')) {
        response = "## 🛍️ **Marketplace Navigation Help**\n\nI can help you find the perfect AI tool! Here's how:\n\n### **Product Types:**\n• **AI Projects** - Custom assistants & intelligent tools\n• **Extensions** - Embeddable chatbots for websites\n• **Local Models** - Downloadable AI models\n• **Tutorials** - Step-by-step guides\n\n### **Tips:**\n• Use the **filters** at the top to narrow down by category\n• Try the **search bar** for specific keywords\n• Check the **ratings** and **clone counts** for quality indicators\n\n*What type of tool are you looking for?*";
      }
    } else if (!response && pageContext.pageName === 'Learning Hub') {
      if (lowercaseMessage.includes('setup') || lowercaseMessage.includes('install') || lowercaseMessage.includes('tutorial')) {
        response = "## 📚 **Learning Hub Guide**\n\nGreat choice! Our tutorials cover:\n\n### **Available Tutorials:**\n• **Gemini API Setup** - Google's AI integration\n• **Local Llama with Ollama** - Private AI deployment\n• **Multi-API Integration** - Using multiple AI providers\n• **ASU Local Wrapper** - Enterprise features\n\n### **Getting Started:**\n1. Choose your **experience level**\n2. Follow **step-by-step instructions**\n3. Watch **video tutorials** for complex concepts\n4. Use the **troubleshooting** sections\n\n*Which tutorial interests you most?*";
      }
    }

    // Ollama-specific responses
    if (!response && (lowercaseMessage.includes('ollama') || lowercaseMessage.includes('local') || lowercaseMessage.includes('install'))) {
      response = "## 🤖 **Local AI Setup Guide**\n\nLet's get you set up with **private, local AI**!\n\n### **Quick Setup:**\n1. **Install Ollama** from [ollama.com](https://ollama.com)\n2. **Start the service**: `ollama serve`\n3. **Download a model**: `ollama pull llama3.3:8b`\n\n### **Benefits:**\n• 🔒 **Complete privacy** - no data leaves your machine\n• ⚡ **Fast responses** - no internet required\n• 💰 **No API costs** - run unlimited conversations\n\n### **Popular Models:**\n• **Llama 3.3 8B** - Best balance of speed & quality\n• **Gemma 2B** - Lightweight option\n• **CodeLlama** - Programming assistance\n\n*Need help with any specific step?*";
    }

    // Quick actions based on context
    if (!response && (lowercaseMessage.includes('help') || lowercaseMessage.includes('what can you do'))) {
      const quickActions = pageContext.quickActions.slice(0, 3);
      const formattedActions = quickActions.map(action => `• ${action}`).join('\n');
      response = `## 💡 **How I Can Help**\n\nI'm your **${pageContext.pageName}** assistant! Here are popular questions:\n\n${formattedActions}\n\n### **Enhanced with Local AI:**\n${status.isConnected ? '✅ **Ollama Connected** - Enjoying private, enhanced AI!' : '🔧 **Setup Available** - Get private AI with one click!'}\n\n*What would you like to explore?*`;
    }

    // Default context-aware response
    if (!response) {
      response = `## 🎯 **${pageContext.pageName} Assistant**\n\nI'm here to help with **${pageContext.description}**!\n\n### **Current Page Features:**\n${pageContext.helpTopics.slice(0, 3).map(topic => `• ${topic}`).join('\n')}\n\n### **AI Enhancement:**\n${status.isConnected ? 
        '🟢 **Local AI Active** - Your conversations are completely private!' : 
        '🟡 **Local AI Available** - Set up Ollama for enhanced privacy!'}\n\n*How can I assist you today?*`;
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
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center">
            {status.isConnected ? (
              <div className="flex items-center">
                <SparklesIcon className="w-6 h-6 mr-2" />
                <div>
                  <h3 className="font-semibold">Local AI Assistant</h3>
                  <p className="text-xs opacity-80">{status.currentModel}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center">
                <ChatBubbleLeftRightIcon className="w-6 h-6 mr-2" />
                <div>
                  <h3 className="font-semibold">{pageContext.pageName} Assistant</h3>
                  <p className="text-xs opacity-80">Context-aware help</p>
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
          <div className="bg-amber-50 border-l-4 border-amber-400 p-3">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-amber-400 mr-2" />
              <div className="flex-1">
                <p className="text-sm text-amber-800">
                  Ollama not detected. {status.models.length === 0 ? 'Set up local AI for privacy!' : 'Start Ollama for enhanced AI.'}
                </p>
              </div>
              <button
                onClick={handleStartOllama}
                className="ml-2 flex items-center px-3 py-1 bg-amber-400 text-amber-900 rounded-md text-xs hover:bg-amber-500 transition-colors"
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
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              disabled={isTyping}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <PaperAirplaneIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 