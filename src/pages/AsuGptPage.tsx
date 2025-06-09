// Import process polyfill first to ensure it's loaded before any other imports
import '../utils/process-polyfill';

import React, { useState, useEffect, useRef } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useOllama } from '../hooks/useOllama';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { geminiService } from '../utils/rate-limiter/geminiService';

// Import our custom implementations instead of the rate-limiter ones
import { ModelManager, ConversationManager } from '../utils/rate-limiter/custom-adapter';
import type { Conversation, ConversationTemplate, Message } from '../utils/rate-limiter/custom-adapter';
import { llamaService } from '../utils/rate-limiter/llamaService';
import SafeCustomModelStatusBar from '../components/SafeCustomModelStatusBar';
import SafeCustomConversationView from '../components/SafeCustomConversationView';
import OllamaStatusIndicator from '../components/OllamaStatusIndicator';
import ModelSwitcher from '../components/ModelSwitcher';
import PersonaChatSelection, { PERSONA_CHAT_TEMPLATES } from '../components/PersonaChatSelection';
import type { PersonaChatTemplate } from '../components/PersonaChatSelection';
import ParticipantSelector from '../components/ParticipantSelector';
import ChatInstructionsSelector from '../components/ChatInstructionsSelector';
import { ASU_PARTICIPANTS } from '../components/ConversationParticipant';

// Define the CommunityIdea type
interface CommunityIdea {
  id: string;
  title: string;
  description: string;
  prompt?: string;
  category: string;
  aiSystemInstructions?: string;
}

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentModel, setCurrentModel] = useState('gpt-4o-mini');

  // Add new state for participant and instructions
  const [activeParticipant, setActiveParticipant] = useState<string | undefined>(undefined);
  const [activeInstruction, setActiveInstruction] = useState<CommunityIdea | null>(null);

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
      const handleResize = () => {
        setIsMobile(window.innerWidth < 768);
      };
      
      handleResize();
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
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

  // Toggle sidebar collapsed/expanded
  const toggleSidebarCollapse = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  // Handle selecting a persona chat
  const handleSelectPersonaChat = (template: PersonaChatTemplate) => {
    try {
      // Create a new conversation based on the selected template
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
      const modelId = template.modelId || 'gpt-4o-mini'; // Default to gpt-4o-mini if modelId is undefined
      
      // In a real implementation, we would update the conversation's model ID
      // This is a mock-up since the example doesn't have this feature
      console.log(`Setting model to: ${modelId} for conversation ${conversation.id}`);
      
      // Add a message indicating which model is being used
      let welcomeMessage = `This conversation is using the ${modelId} model with the ${template.persona} persona.`;
      
      // Add enhancement information if available
      if (template.enhancedWithIdea) {
        welcomeMessage += `\n\nThis persona has been enhanced with specialized knowledge from the community idea: **${template.enhancedWithIdea.title}**`;
      }
      
      conversationManager.addMessage(conversation.id, {
        role: 'assistant',
        content: welcomeMessage,
        isVisible: true
      });
      
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

  const handleModelChange = (modelId: string) => {
    setCurrentModel(modelId);
  };

  // Handle participant selection
  const handleSelectParticipant = (participantId: string) => {
    // Toggle off if the same participant is selected again
    const newActiveParticipant = participantId === activeParticipant ? undefined : participantId;
    setActiveParticipant(newActiveParticipant);
    
    // Only proceed if we have an active conversation
    if (!activeConversation) return;
    
    // If a new participant is selected, update the system prompt
    if (newActiveParticipant) {
      const participant = ASU_PARTICIPANTS.find(p => p.id === newActiveParticipant);
      if (participant) {
        console.log(`Selected participant: ${participant.name}`);
        
        // Find matching persona from PERSONA_CHAT_TEMPLATES
        const personaTemplate = PERSONA_CHAT_TEMPLATES.find(
          template => template.persona === participant.name
        );
        
        if (personaTemplate && personaTemplate.systemPrompt) {
          // Add or update system message
          const existingSystemMessage = activeConversation.messages.find(m => m.role === 'system');
          
          if (existingSystemMessage) {
            // Update existing system message
            conversationManager.updateMessage(
              activeConversation.id,
              existingSystemMessage.id,
              { content: personaTemplate.systemPrompt }
            );
          } else {
            // Add new system message
            const systemMessage = {
              role: 'system',
              content: personaTemplate.systemPrompt,
              isVisible: false
            };
            
            conversationManager.addMessageAtPosition(activeConversation.id, systemMessage, 0);
          }
          
          // Add a user-visible message about the participant
          const infoMessage = {
            role: 'assistant',
            content: `You are now chatting with **${participant.name}**, ${participant.role}. Feel free to ask about ${participant.expertise.join(', ')}.`,
            isVisible: true
          };
          
          conversationManager.addMessage(activeConversation.id, infoMessage);
          
          // Update our local state
          const updatedActive = conversationManager.getActiveConversation();
          setActiveConversation(updatedActive);
        }
      }
    } else if (activeParticipant && !newActiveParticipant) {
      // If participant is deselected, remove system prompt
      const existingSystemMessage = activeConversation.messages.find(m => m.role === 'system');
      
      if (existingSystemMessage) {
        // Remove the system message or reset to default
        conversationManager.hideMessage(activeConversation.id, existingSystemMessage.id);
        
        // Add a message about ending the specialized chat
        const endMessage = {
          role: 'assistant',
          content: 'You are now back to chatting with a general AI assistant.',
          isVisible: true
        };
        
        conversationManager.addMessage(activeConversation.id, endMessage);
        
        // Update our local state
        const updatedActive = conversationManager.getActiveConversation();
        setActiveConversation(updatedActive);
      }
    }
  };
  
  // Handle chat instruction selection
  const handleSelectInstruction = (idea: CommunityIdea | null) => {
    setActiveInstruction(idea);
    
    // Only proceed if we have an active conversation
    if (!activeConversation) return;
    
    if (idea && idea.aiSystemInstructions) {
      // Find existing system message
      const existingSystemMessage = activeConversation.messages.find(m => m.role === 'system');
      
      let newSystemContent = idea.aiSystemInstructions;
      
      // If there's an active participant, combine their system prompt with the instructions
      if (activeParticipant) {
        const participant = ASU_PARTICIPANTS.find(p => p.id === activeParticipant);
        if (participant) {
          const personaTemplate = PERSONA_CHAT_TEMPLATES.find(
            template => template.persona === participant.name
          );
          
          if (personaTemplate && personaTemplate.systemPrompt) {
            newSystemContent = `${personaTemplate.systemPrompt}\n\n## Additional Instructions\n${idea.aiSystemInstructions}`;
          }
        }
      }
      
      if (existingSystemMessage) {
        // Update existing system message
        conversationManager.updateMessage(
          activeConversation.id,
          existingSystemMessage.id,
          { content: newSystemContent }
        );
      } else {
        // Add new system message
        const systemMessage = {
          role: 'system',
          content: newSystemContent,
          isVisible: false
        };
        
        conversationManager.addMessageAtPosition(activeConversation.id, systemMessage, 0);
      }
      
      // Add a user-visible message about the instructions
      const infoMessage = {
        role: 'assistant',
        content: `Added instruction: **${idea.title}**\n\n${idea.description}`,
        isVisible: true
      };
      
      conversationManager.addMessage(activeConversation.id, infoMessage);
      
      // Update our local state
      const updatedActive = conversationManager.getActiveConversation();
      setActiveConversation(updatedActive);
    } else if (!idea && activeInstruction) {
      // If instructions are cleared, update system message with just the participant prompt if any
      const existingSystemMessage = activeConversation.messages.find(m => m.role === 'system');
      
      if (existingSystemMessage) {
        if (activeParticipant) {
          // If there's still an active participant, restore just their system prompt
          const participant = ASU_PARTICIPANTS.find(p => p.id === activeParticipant);
          if (participant) {
            const personaTemplate = PERSONA_CHAT_TEMPLATES.find(
              template => template.persona === participant.name
            );
            
            if (personaTemplate && personaTemplate.systemPrompt) {
              conversationManager.updateMessage(
                activeConversation.id,
                existingSystemMessage.id,
                { content: personaTemplate.systemPrompt }
              );
            }
          }
        } else {
          // If no active participant, remove the system message
          conversationManager.hideMessage(activeConversation.id, existingSystemMessage.id);
        }
        
        // Add a message about removing the instructions
        const endMessage = {
          role: 'assistant',
          content: 'Chat instructions have been removed.',
          isVisible: true
        };
        
        conversationManager.addMessage(activeConversation.id, endMessage);
        
        // Update our local state
        const updatedActive = conversationManager.getActiveConversation();
        setActiveConversation(updatedActive);
      }
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
        status: 'Connected',
        canStream: geminiService.isStreamingSupported(),
        modelId: 'gemini-2.0-flash'
      };
    } else if (preferredProvider === 'ollama' && ollama.status.isConnected) {
      return {
        isConnected: true,
        name: ollama.status.currentModel || 'Ollama',
        status: 'Connected',
        canStream: ollama.isStreamingSupported(),
        modelId: ollama.status.currentModel || 'llama3.1:8b'
      };
    } else {
      return {
        isConnected: false,
        name: 'AI Provider',
        status: 'Not Connected',
        canStream: false,
        modelId: 'gpt-4o-mini' // Default model when no provider is connected
      };
    }
  };
  
  // Update current model based on provider info
  useEffect(() => {
    const providerInfo = getProviderInfo();
    setCurrentModel(providerInfo.modelId);
  }, [settings.preferredChatProvider, settings.geminiApiKey, ollama.status]);

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

  // Show welcome view when no active conversation
  if (!activeConversation) {
    return (
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <div className={`
          ${isMobile ? 'fixed' : 'relative'} 
          ${isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'}
          transition-transform duration-300 ease-in-out
          ${isMobile ? 'z-50' : 'z-10'}
          ${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-gray-200 flex flex-col
        `}>
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            {!isSidebarCollapsed ? (
              <h2 className="text-lg font-semibold text-gray-800">Conversations</h2>
            ) : (
              <h2 className="text-sm font-semibold text-gray-800">Chats</h2>
            )}
            
            {/* Collapse Button (only shown on desktop) */}
            {!isMobile && (
              <button 
                onClick={toggleSidebarCollapse}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100"
                title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isSidebarCollapsed ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                )}
              </button>
            )}
          </div>
          
          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto p-2">
            {Array.isArray(conversations) && (conversations as {id: string, title: string}[]).map(conv => (
              <div 
                key={conv.id}
                className={`p-2 mb-1 rounded-md cursor-pointer hover:bg-gray-100 ${
                  activeConversation?.id === conv.id ? 'bg-gray-100 border-l-4 border-asu-gold' : ''
                }`}
                onClick={() => handleSelectConversation(conv.id)}
              >
                <div className="flex justify-between items-center">
                  {!isSidebarCollapsed ? (
                    <>
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
                    </>
                  ) : (
                    <div className="w-full flex justify-center">
                      <span className="text-lg font-medium">{conv.title.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Create New Button */}
          <div className={`p-4 border-t border-gray-200 ${isSidebarCollapsed ? 'flex justify-center' : ''}`}>
            <button
              className={`${isSidebarCollapsed ? 'w-12 h-12 rounded-full flex items-center justify-center' : 'w-full px-4 py-2 rounded-md'} bg-[#FFC627] text-black font-medium hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-300 transition-colors`}
              onClick={() => handleCreateConversation(templates[0]?.id)}
              title={isSidebarCollapsed ? "New Conversation" : undefined}
            >
              {isSidebarCollapsed ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              ) : (
                "New Conversation"
              )}
            </button>
          </div>
        </div>
        
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
            
            {/* Right Section with Model Switcher and Status */}
            <div className="flex items-center space-x-2">
              {/* Connection Status Indicator */}
              <div className="flex items-center mr-2">
                <div 
                  className={`w-2 h-2 rounded-full mr-2 ${
                    getProviderInfo().isConnected ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                <span className="text-xs text-gray-600">
                  {getProviderInfo().name}: {getProviderInfo().status}
                </span>
              </div>
              
              {/* Model Switcher */}
              <ModelSwitcher 
                currentModel={currentModel}
                onModelChange={handleModelChange}
                compact={true}
              />
            </div>
          </div>

          {/* Welcome Content */}
          <div className="flex-1 overflow-auto">
            <div className="max-w-6xl mx-auto">
              <div className="p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Welcome to ASU GPT</h1>
                <p className="text-lg text-gray-700 mb-4">
                  A powerful AI assistant to help with your questions about ASU, academics, and more.
                </p>
                
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
        ${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-gray-200 flex flex-col
      `}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          {!isSidebarCollapsed ? (
            <h2 className="text-lg font-semibold text-gray-800">Conversations</h2>
          ) : (
            <h2 className="text-sm font-semibold text-gray-800">Chats</h2>
          )}
          
          {/* Collapse Button (only shown on desktop) */}
          {!isMobile && (
            <button 
              onClick={toggleSidebarCollapse}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100"
              title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isSidebarCollapsed ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              )}
            </button>
          )}
        </div>
        
        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-2">
          {Array.isArray(conversations) && (conversations as {id: string, title: string}[]).map(conv => (
            <div 
              key={conv.id}
              className={`p-2 mb-1 rounded-md cursor-pointer hover:bg-gray-100 ${
                activeConversation?.id === conv.id ? 'bg-gray-100 border-l-4 border-asu-gold' : ''
              }`}
              onClick={() => handleSelectConversation(conv.id)}
            >
              <div className="flex justify-between items-center">
                {!isSidebarCollapsed ? (
                  <>
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
                  </>
                ) : (
                  <div className="w-full flex justify-center">
                    <span className="text-lg font-medium">{conv.title.charAt(0).toUpperCase()}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Create New Button */}
        <div className={`p-4 border-t border-gray-200 ${isSidebarCollapsed ? 'flex justify-center' : ''}`}>
          <button
            className={`${isSidebarCollapsed ? 'w-12 h-12 rounded-full flex items-center justify-center' : 'w-full px-4 py-2 rounded-md'} bg-[#FFC627] text-black font-medium hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-300 transition-colors`}
            onClick={() => handleCreateConversation(templates[0]?.id)}
            title={isSidebarCollapsed ? "New Conversation" : undefined}
          >
            {isSidebarCollapsed ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            ) : (
              "New Conversation"
            )}
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar - Condensed with all elements and connection status */}
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
          
          {/* Left Section with Back Button and Conversation Title */}
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
          
          {/* Center Section with Participant and Instructions Selectors */}
          <div className="flex items-center space-x-2">
            <ParticipantSelector 
              activeParticipant={activeParticipant}
              onSelectParticipant={handleSelectParticipant}
            />
            
            <ChatInstructionsSelector
              activeInstruction={activeInstruction || undefined}
              onSelectInstruction={handleSelectInstruction}
            />
          </div>
          
          {/* Right Section with Model Switcher and Status */}
          <div className="flex items-center space-x-2">
            {/* Connection Status Indicator */}
            <div className="flex items-center mr-2">
              <div 
                className={`w-2 h-2 rounded-full mr-2 ${
                  getProviderInfo().isConnected ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <span className="text-xs text-gray-600">
                {getProviderInfo().name}: {getProviderInfo().status}
              </span>
            </div>
            
            {/* Model Switcher */}
            <ModelSwitcher 
              currentModel={currentModel}
              onModelChange={handleModelChange}
              compact={true}
            />
          </div>
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