import React, { useState, useRef, useEffect } from 'react';
import { 
  XMarkIcon, 
  PaperAirplaneIcon, 
  ChatBubbleLeftRightIcon,
  LightBulbIcon,
  MagnifyingGlassIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ProductType {
  id: string;
  name: string;
  description: string;
  categories: string[];
}

interface Project {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  verified: boolean;
  rating: number;
  clonedCount: number;
}

interface ChatbotWidgetProps {
  onClose: () => void;
  projects: Project[];
  productTypes: ProductType[];
}

// Sample responses for the chatbot
const SAMPLE_RESPONSES = [
  {
    trigger: ['help', 'assist', 'support'],
    response: "I'm here to help you find the perfect AI tools and resources! You can ask me about specific project types, search for tools by functionality, or get recommendations based on your needs."
  },
  {
    trigger: ['ai assistant', 'productivity', 'automation'],
    response: "Looking for AI assistants? I recommend checking out our AI Assistants section which includes productivity tools, development helpers, and analytics assistants. Popular ones include 'Plan with AI' and 'C-3PO Coding Helper'."
  },
  {
    trigger: ['learning', 'education', 'study', 'teach'],
    response: "For educational tools, explore our Learning Tools section! We have interactive games like 'Adventure: ASU Edition', poetry analysis tools, and various educational resources designed to enhance learning experiences."
  },
  {
    trigger: ['content', 'writing', 'creative', 'music'],
    response: "Creative professionals love our Content Creators section! You'll find tools for writing assistance, music generation, poetry analysis, and other creative applications."
  },
  {
    trigger: ['data', 'analytics', 'research', 'business'],
    response: "For data analysis and business intelligence, check out our Data & Analytics section. The 'Data Chatbot - ASU Analytics' is particularly popular for understanding analytics platforms."
  },
  {
    trigger: ['project management', 'planning', 'organize'],
    response: "Project management made easy! Our Project Tools section includes planning assistants and organizational tools. 'Plan with AI' is excellent for transforming ideas into structured project plans."
  },
  {
    trigger: ['game', 'interactive', 'simulation'],
    response: "Interested in interactive experiences? Our Interactive & Games section features educational games and simulations like 'Adventure: ASU Edition' that combine learning with engagement."
  }
];

export const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ 
  onClose, 
  projects, 
  productTypes 
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: "Hi! I'm your BetaLand assistant. I can help you find AI tools, answer questions about our projects, or recommend resources based on your needs. What can I help you with today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateResponse = (userMessage: string): string => {
    const lowercaseMessage = userMessage.toLowerCase();
    
    // Check for specific project searches
    const matchingProject = projects.find(project => 
      project.name.toLowerCase().includes(lowercaseMessage) ||
      project.tags.some(tag => tag.toLowerCase().includes(lowercaseMessage))
    );
    
    if (matchingProject) {
      return `I found "${matchingProject.name}"! ${matchingProject.description} It's in the ${matchingProject.category} category and has a ${matchingProject.rating} star rating. Would you like to know more about this or similar projects?`;
    }

    // Check for category searches
    const matchingCategory = projects.filter(project => 
      project.category.toLowerCase().includes(lowercaseMessage)
    );
    
    if (matchingCategory.length > 0) {
      const categoryName = matchingCategory[0].category;
      const count = matchingCategory.length;
      return `I found ${count} projects in the ${categoryName} category! Some popular ones include: ${matchingCategory.slice(0, 3).map(p => p.name).join(', ')}. Would you like to explore this category?`;
    }

    // Check sample responses
    for (const sample of SAMPLE_RESPONSES) {
      if (sample.trigger.some(trigger => lowercaseMessage.includes(trigger))) {
        return sample.response;
      }
    }

    // Default responses
    const defaultResponses = [
      "That's a great question! You can browse our projects by category using the filters above, or try searching for specific keywords in the search bar.",
      "I'd recommend exploring our different product types - we have AI Assistants, Learning Tools, Content Creators, Data & Analytics tools, Project Management tools, and Interactive Games.",
      "You can use the filter options to narrow down projects by category, capabilities, or verification status. Is there a specific type of tool you're looking for?",
      "Feel free to browse our verified projects for quality-assured tools, or check out the newest additions to see what's trending!"
    ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
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
    setInputValue('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: generateResponse(inputValue),
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    { text: "Show me AI assistants", icon: SparklesIcon },
    { text: "Find learning tools", icon: LightBulbIcon },
    { text: "Browse data analytics", icon: MagnifyingGlassIcon },
    { text: "Help me get started", icon: ChatBubbleLeftRightIcon }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-end p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md h-96 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-blue-600 text-white rounded-t-lg">
          <div className="flex items-center">
            <ChatBubbleLeftRightIcon className="w-6 h-6 mr-2" />
            <h3 className="font-semibold">BetaLand Assistant</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-blue-700 rounded-md transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
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
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.isUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.text}</p>
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

        {/* Quick Actions (only show when no messages from user yet) */}
        {messages.length === 1 && (
          <div className="px-4 pb-2">
            <p className="text-xs text-gray-500 mb-2">Quick actions:</p>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action, index) => {
                const IconComponent = action.icon;
                return (
                  <button
                    key={index}
                    onClick={() => setInputValue(action.text)}
                    className="flex items-center p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded-md transition-colors text-left"
                  >
                    <IconComponent className="w-4 h-4 mr-1 text-gray-400" />
                    <span className="truncate">{action.text}</span>
                  </button>
                );
              })}
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
              placeholder="Ask me anything about our tools..."
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