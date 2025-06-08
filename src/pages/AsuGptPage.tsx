// Import process polyfill first to ensure it's loaded before any other imports
import '../utils/process-polyfill';

import React, { useState, useEffect, useRef } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useOllama } from '../hooks/useOllama';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Import our custom implementations instead of the rate-limiter ones
import { ModelManager, ConversationManager } from '../utils/rate-limiter/custom-adapter';
import type { Conversation, ConversationTemplate } from '../utils/rate-limiter/custom-adapter';
import { llamaService } from '../utils/rate-limiter/llamaService';
import SafeCustomModelStatusBar from '../components/SafeCustomModelStatusBar';
import SafeCustomConversationView from '../components/SafeCustomConversationView';
import OllamaStatusIndicator from '../components/OllamaStatusIndicator';
import PersonaChatSelection, { PERSONA_CHAT_TEMPLATES } from '../components/PersonaChatSelection';
import type { PersonaChatTemplate } from '../components/PersonaChatSelection';

export const AsuGptPage: React.FC = () => {
  const { settings } = useSettings();
  const ollama = useOllama();
  
  // Initialize LlamaService with our Ollama instance
  useEffect(() => {
    llamaService.setOllamaInstance(ollama);
  }, [ollama]);
  
  // State management
  const [modelManager] = useState(() => new ModelManager());
  const [conversationManager] = useState(() => new ConversationManager());
  const [models, setModels] = useState<any[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [templates, setTemplates] = useState<ConversationTemplate[]>([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize model manager with settings
  useEffect(() => {
    try {
      modelManager.syncWithSettings(settings, ollama);
      const availableModels = modelManager.getAllModels();
      setModels(availableModels);
    } catch (error) {
      console.error('Error initializing model manager:', error);
      setError('Failed to initialize model manager. Please try reloading the page.');
    }
  }, [settings, ollama.status, modelManager]);

  // Initialize conversation data
  useEffect(() => {
    try {
      // Load templates
      const availableTemplates = conversationManager.getAllTemplates();
      setTemplates(availableTemplates);
      
      // Load conversations
      const allConversations = conversationManager.getAllConversations();
      setConversations(allConversations);
      
      // Set active conversation if available
      const active = conversationManager.getActiveConversation();
      setActiveConversation(active);
      
      // If we have conversations, but no active one, show welcome
      if (allConversations.length > 0 && !active) {
        setShowWelcome(true);
      } else if (active) {
        setShowWelcome(false);
      }
      
      // Check if mobile
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };
      
      checkMobile();
      window.addEventListener('resize', checkMobile);
      
      return () => {
        window.removeEventListener('resize', checkMobile);
      };
    } catch (error) {
      console.error('Error initializing conversations:', error);
      setError('Failed to load conversations. Please try reloading the page.');
    }
  }, [conversationManager]);

  // Handlers for conversation actions
  const handleCreateConversation = (templateId: string) => {
    try {
      const conversation = conversationManager.createConversation(templateId);
      conversationManager.setActiveConversation(conversation.id);
      
      // Update local state
      const updatedConversations = conversationManager.getAllConversations();
      setConversations(updatedConversations);
      
      const updatedActive = conversationManager.getActiveConversation();
      setActiveConversation(updatedActive);
      
      setShowWelcome(false);
      
      // Close sidebar on mobile
      if (isMobile) {
        setIsSidebarOpen(false);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      setError('Failed to create a new conversation. Please try again.');
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    try {
      conversationManager.setActiveConversation(conversationId);
      
      // Update local state
      const updatedActive = conversationManager.getActiveConversation();
      setActiveConversation(updatedActive);
      
      setShowWelcome(false);
      
      // Close sidebar on mobile
      if (isMobile) {
        setIsSidebarOpen(false);
      }
    } catch (error) {
      console.error('Error selecting conversation:', error);
      setError('Failed to select conversation. Please try again.');
    }
  };

  const handleDeleteConversation = (conversationId: string) => {
    try {
      conversationManager.deleteConversation(conversationId);
      
      // Update local state
      const updatedConversations = conversationManager.getAllConversations();
      setConversations(updatedConversations);
      
      const updatedActive = conversationManager.getActiveConversation();
      setActiveConversation(updatedActive);
      
      // Show welcome if no conversations left
      if (updatedConversations.length === 0) {
        setShowWelcome(true);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      setError('Failed to delete conversation. Please try again.');
    }
  };

  const handleNewExperience = () => {
    setShowWelcome(true);
    setActiveConversation(null);
    
    try {
      conversationManager.setActiveConversation(null);
    } catch (error) {
      console.error('Error resetting active conversation:', error);
      // Not critical, so no user-facing error
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Handle selecting a persona chat template
  const handleSelectPersonaChat = (template: PersonaChatTemplate) => {
    try {
      // Create a conversation using the default template
      const conversation = conversationManager.createConversation('default-chat');
      
      // Update the conversation title to match the persona
      conversationManager.updateConversationTitle(conversation.id, template.name);
      
      // Add system message with the persona's system prompt to replace default
      conversationManager.addMessage(conversation.id, {
        role: 'system',
        content: template.systemPrompt,
        isVisible: false
      });
      
      // Set the model ID for the conversation if available
      if (template.modelId) {
        // In a real implementation, we would update the conversation's model ID
        // This is a mock-up since the example doesn't have this feature
        console.log(`Setting model to: ${template.modelId} for conversation ${conversation.id}`);
        
        // Add a message indicating which model is being used
        conversationManager.addMessage(conversation.id, {
          role: 'assistant',
          content: `This conversation is using the ${template.modelId} model with the ${template.persona} persona.`,
          isVisible: true
        });
      }
      
      // Set as active conversation
      conversationManager.setActiveConversation(conversation.id);
      
      // Update local state
      const updatedConversations = conversationManager.getAllConversations();
      setConversations(updatedConversations);
      
      const updatedActive = conversationManager.getActiveConversation();
      setActiveConversation(updatedActive);
      
      setShowWelcome(false);
      
      // Close sidebar on mobile
      if (isMobile) {
        setIsSidebarOpen(false);
      }
    } catch (error) {
      console.error('Error creating persona chat:', error);
      setError('Failed to create a new conversation. Please try again.');
    }
  };

  // Show error message if something went wrong
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="max-w-md p-6 bg-white shadow-lg rounded-lg">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // Show welcome screen if no active conversation
  if (showWelcome) {
    return (
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <div className={`
          ${isMobile ? 'fixed' : 'relative'} 
          ${isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'}
          transition-transform duration-300 ease-in-out
          ${isMobile ? 'z-50' : 'z-10'}
          w-64 bg-white border-r border-gray-200 flex flex-col
        `}>
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Conversations</h2>
          </div>
          
          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto p-2">
            {conversations.map(conv => (
              <div 
                key={conv.id}
                className={`p-2 mb-1 rounded-md cursor-pointer hover:bg-gray-100 ${
                  activeConversation?.id === conv.id ? 'bg-gray-100' : ''
                }`}
                onClick={() => handleSelectConversation(conv.id)}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium truncate">{conv.title}</span>
                  <button
                    className="text-gray-500 hover:text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteConversation(conv.id);
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Create New Button */}
          <div className="p-4 border-t border-gray-200">
            <button
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              onClick={() => setShowWelcome(true)}
            >
              New Conversation
            </button>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            {/* Mobile Menu Button */}
            {isMobile && (
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            
            {/* Title */}
            <div className="text-lg font-semibold text-[#8C1D40]">
              ASU GPT
            </div>
            
            {/* Model Status */}
            <SafeCustomModelStatusBar />
          </div>

          {/* Welcome Content */}
          <div className="flex-1 overflow-auto">
            <div className="max-w-6xl mx-auto">
              <div className="p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Welcome to ASU GPT</h1>
                <p className="text-lg text-gray-700 mb-4">
                  A powerful AI assistant to help with your questions about ASU, academics, and more.
                </p>
                
                <div className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <OllamaStatusIndicator />
                </div>
                
                {/* Persona Chat Selection Component */}
                <PersonaChatSelection onSelectChat={handleSelectPersonaChat} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show conversation view when active conversation exists
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`
        ${isMobile ? 'fixed' : 'relative'} 
        ${isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'}
        transition-transform duration-300 ease-in-out
        ${isMobile ? 'z-50' : 'z-10'}
        w-64 bg-white border-r border-gray-200 flex flex-col
      `}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Conversations</h2>
        </div>
        
        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-2">
          {conversations.map(conv => (
            <div 
              key={conv.id}
              className={`p-2 mb-1 rounded-md cursor-pointer hover:bg-gray-100 ${
                activeConversation?.id === conv.id ? 'bg-gray-100' : ''
              }`}
              onClick={() => handleSelectConversation(conv.id)}
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium truncate">{conv.title}</span>
                <button
                  className="text-gray-500 hover:text-red-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteConversation(conv.id);
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Create New Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            onClick={() => handleCreateConversation(templates[0]?.id)}
          >
            New Conversation
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          {/* Mobile Menu Button */}
          {isMobile && (
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          
          {/* Conversation Title */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleNewExperience}
              className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-600 hover:text-[#8C1D40] hover:bg-[#8C1D40] hover:bg-opacity-10 rounded-lg transition-colors"
              title="Back to ASU GPT Homepage"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>ASU GPT</span>
            </button>
            <div className="h-4 w-px bg-gray-300"></div>
            <h1 className="text-lg font-semibold text-gray-900">
              {activeConversation?.title || 'Conversation'}
            </h1>
          </div>
          
          {/* Model Status */}
          <SafeCustomModelStatusBar />
        </div>

        {/* Conversation View */}
        <div className="flex-1 overflow-hidden">
          {activeConversation && (
            <SafeCustomConversationView
              conversation={activeConversation}
              template={templates.find(t => t.id === activeConversation.templateId) || templates[0]}
              modelManager={modelManager}
              conversationManager={conversationManager}
              onConversationUpdate={() => {
                // Refresh the conversation list after updates
                try {
                  const updatedConversations = conversationManager.getAllConversations();
                  setConversations(updatedConversations);
                  
                  const updatedActive = conversationManager.getActiveConversation();
                  setActiveConversation(updatedActive);
                } catch (error) {
                  console.error('Error updating conversation data:', error);
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AsuGptPage; 