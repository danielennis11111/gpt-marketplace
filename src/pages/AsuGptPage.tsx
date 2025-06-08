import React, { useEffect, useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useOllama } from '../hooks/useOllama';

// Import components and types from our adapter
import {
  ModelManager,
  ConversationManager,
  ConversationView,
  ConversationSidebar,
  WelcomeExperience,
  ModelStatusBar,
  Conversation,
  AIModel,
  ConversationTemplate,
} from '../utils/rate-limiter';

export const AsuGptPage: React.FC = () => {
  const { settings } = useSettings();
  const ollama = useOllama();
  
  // Rate-limiter state
  const [modelManager] = useState(() => new ModelManager());
  const [conversationManager] = useState(() => new ConversationManager());
  const [models, setModels] = useState<AIModel[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [templates, setTemplates] = useState<ConversationTemplate[]>([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Update rate-limiter with our app's model settings
  useEffect(() => {
    // Initialize with our app's preferred model
    if (settings.preferredChatProvider === 'ollama' && ollama.status.currentModel) {
      // Use the appropriate method available in ModelManager
      try {
        // This will depend on the actual ModelManager implementation
        // For now, just log the model selection
        console.log('Using Ollama model:', ollama.status.currentModel);
      } catch (error) {
        console.error('Error setting preferred model:', error);
      }
    } else if (settings.preferredChatProvider === 'gemini' && settings.geminiApiKey) {
      // Use the appropriate method available in ModelManager
      try {
        // This will depend on the actual ModelManager implementation
        // For now, just log the model selection
        console.log('Using Gemini with API key:', settings.geminiApiKey);
      } catch (error) {
        console.error('Error setting preferred model:', error);
      }
    }
  }, [settings, ollama.status.currentModel]);

  useEffect(() => {
    // Initialize data
    try {
      const availableModels = modelManager.getAllModels();
      setModels(availableModels);
      
      const availableTemplates = conversationManager.getAllTemplates();
      setTemplates(availableTemplates);
      
      // Check if mobile
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };
      
      checkMobile();
      window.addEventListener('resize', checkMobile);
      
      return () => {
        window.removeEventListener('resize', checkMobile);
        // Only call if the method exists
        if (typeof modelManager.stopStatusMonitoring === 'function') {
          modelManager.stopStatusMonitoring();
        }
      };
    } catch (error) {
      console.error('Error initializing data:', error);
    }
  }, [modelManager, conversationManager]);

  useEffect(() => {
    // Update conversations when they change
    try {
      const allConversations = conversationManager.getAllConversations();
      setConversations(allConversations);
      
      const active = conversationManager.getActiveConversation();
      setActiveConversation(active);
    } catch (error) {
      console.error('Error updating conversations:', error);
    }
  }, [conversationManager]);

  const handleCreateConversation = (templateId: string) => {
    try {
      const conversation = conversationManager.createConversation(templateId);
      conversationManager.setActiveConversation(conversation.id);
      
      // Update state with the latest data
      const updatedConversations = conversationManager.getAllConversations();
      setConversations(updatedConversations);
      
      const updatedActive = conversationManager.getActiveConversation();
      setActiveConversation(updatedActive);
      
      setShowWelcome(false);
      
      // Close sidebar on mobile after creating conversation
      if (isMobile) {
        setIsSidebarOpen(false);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    try {
      conversationManager.setActiveConversation(conversationId);
      
      const updatedActive = conversationManager.getActiveConversation();
      setActiveConversation(updatedActive);
      
      setShowWelcome(false);
      
      // Close sidebar on mobile after selecting conversation
      if (isMobile) {
        setIsSidebarOpen(false);
      }
    } catch (error) {
      console.error('Error selecting conversation:', error);
    }
  };

  const handleDeleteConversation = (conversationId: string) => {
    try {
      conversationManager.deleteConversation(conversationId);
      
      const updatedConversations = conversationManager.getAllConversations();
      setConversations(updatedConversations);
      
      const updatedActive = conversationManager.getActiveConversation();
      setActiveConversation(updatedActive);
      
      // Show welcome if no conversations left
      if (conversationManager.getAllConversations().length === 0) {
        setShowWelcome(true);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const handleNewExperience = () => {
    setShowWelcome(true);
    setActiveConversation(null);
    
    // This may need to be adapted based on the actual implementation
    try {
      // Set the active conversation to null in the manager
      if (typeof conversationManager.setActiveConversation === 'function') {
        conversationManager.setActiveConversation(null);
      } else {
        // Alternative approach if direct property access is needed
        (conversationManager as any).activeConversationId = null;
      }
    } catch (error) {
      console.error('Error setting new experience:', error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Show welcome screen if no active conversation
  if (showWelcome || !activeConversation) {
    return (
      <div className="flex h-screen bg-gray-50">
        {/* Mobile Overlay */}
        {isMobile && isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        {(conversations.length > 0 || !isMobile) && (
          <div className={`
            ${isMobile ? 'fixed' : 'relative'} 
            ${isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'}
            transition-transform duration-300 ease-in-out
            ${isMobile ? 'z-50' : 'z-10'}
            w-80 bg-white border-r border-gray-200 flex flex-col
          `}>
            <ConversationSidebar
              conversations={conversations}
              templates={templates}
              activeConversationId={null}
              onSelectConversation={handleSelectConversation}
              onDeleteConversation={handleDeleteConversation}
              onCreateConversation={handleNewExperience}
              onCloseSidebar={() => setIsSidebarOpen(false)}
              isMobile={isMobile}
            />
          </div>
        )}

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
            <button
              onClick={handleNewExperience}
              className="text-lg font-semibold text-gray-900 hover:text-[#FFC627] transition-colors"
              title="ASU GPT Homepage"
            >
              ASU GPT
            </button>
            
            {/* Model Status */}
            <div className="flex items-center">
              <ModelStatusBar models={models} />
            </div>
          </div>

          {/* Welcome Experience */}
          <div className="flex-1 overflow-scroll">
            <WelcomeExperience
              experiences={templates}
              onSelectExperience={handleCreateConversation}
            />
          </div>
        </div>
      </div>
    );
  }

  // Show conversation view when active conversation exists
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        ${isMobile ? 'fixed' : 'relative'} 
        ${isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'}
        transition-transform duration-300 ease-in-out
        ${isMobile ? 'z-50' : 'z-10'}
        w-80 bg-white border-r border-gray-200 flex flex-col
      `}>
        <ConversationSidebar
          conversations={conversations}
          templates={templates}
          activeConversationId={activeConversation?.id || null}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversation}
          onCreateConversation={handleNewExperience}
          onCloseSidebar={() => setIsSidebarOpen(false)}
          isMobile={isMobile}
        />
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
          
          {/* Conversation Title and Navigation */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleNewExperience}
              className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-600 hover:text-[#FFC627] hover:bg-[#FFC627] hover:bg-opacity-10 rounded-lg transition-colors"
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
          <div className="flex items-center">
            <ModelStatusBar models={models} />
          </div>
        </div>

        {/* Conversation View */}
        <div className="flex-1 overflow-hidden">
          {activeConversation && (
            <ConversationView
              conversation={activeConversation}
              template={templates.find(t => t.id === activeConversation.templateId) || templates[0]}
              modelManager={modelManager}
              onUpdateConversation={(updatedConversation) => {
                try {
                  conversationManager.updateConversation(updatedConversation);
                  // Set state with a copy to trigger re-render
                  setActiveConversation({...updatedConversation});
                } catch (error) {
                  console.error('Error updating conversation:', error);
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