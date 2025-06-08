import React, { useState, useEffect } from 'react';
import { ModelManager } from '../services/ModelManager';
import { ConversationManager } from '../services/ConversationManager';
import { AIModel, Conversation, ConversationTemplate } from '../types/index';
import ConversationSidebar from './ConversationSidebar';
import ConversationView from './ConversationView';
import ModelStatusBar from './ModelStatusBar';
import WelcomeExperience from './WelcomeExperience';
import DebugPanel from './DebugPanel';

interface ConversationHubProps {
  // Future props for integration
}

const ConversationHub: React.FC<ConversationHubProps> = () => {
  const [modelManager] = useState(() => new ModelManager());
  const [conversationManager] = useState(() => new ConversationManager());
  const [models, setModels] = useState<AIModel[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [templates, setTemplates] = useState<ConversationTemplate[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Initialize data
    setModels(modelManager.getAllModels());
    setTemplates(conversationManager.getAllTemplates());
    
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      modelManager.stopStatusMonitoring();
    };
  }, [modelManager, conversationManager]);

  useEffect(() => {
    // Update conversations when they change
    setConversations(conversationManager.getAllConversations());
    setActiveConversation(conversationManager.getActiveConversation());
  }, [conversationManager]);

  const handleCreateConversation = (templateId: string) => {
    const conversation = conversationManager.createConversation(templateId);
    conversationManager.setActiveConversation(conversation.id);
    setConversations(conversationManager.getAllConversations());
    setActiveConversation(conversationManager.getActiveConversation());
    setShowWelcome(false);
    
    // Close sidebar on mobile after creating conversation
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    conversationManager.setActiveConversation(conversationId);
    setActiveConversation(conversationManager.getActiveConversation());
    setShowWelcome(false);
    
    // Close sidebar on mobile after selecting conversation
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const handleDeleteConversation = (conversationId: string) => {
    conversationManager.deleteConversation(conversationId);
    setConversations(conversationManager.getAllConversations());
    setActiveConversation(conversationManager.getActiveConversation());
    
    // Show welcome if no conversations left
    if (conversationManager.getAllConversations().length === 0) {
      setShowWelcome(true);
    }
  };

  const handleNewExperience = () => {
    setShowWelcome(true);
    setActiveConversation(null);
    conversationManager['activeConversationId'] = null;
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
              title="ASU AI Experiences Homepage"
            >
              ASU AI Experiences
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
              title="Back to AI Experiences Homepage"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Experiences</span>
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
          <ConversationView
            conversation={activeConversation}
            template={
              templates.find(t => t.id === activeConversation.templateId) ||
              templates[0]
            }
            conversationManager={conversationManager}
            modelManager={modelManager}
            onConversationUpdate={() => {
              setConversations(conversationManager.getAllConversations());
              setActiveConversation(conversationManager.getActiveConversation());
            }}
          />
        </div>
      </div>
      
      {/* Debug Panel */}
      <DebugPanel modelManager={modelManager} />
    </div>
  );
};

export default ConversationHub; 