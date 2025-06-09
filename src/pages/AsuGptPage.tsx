// Import process polyfill first to ensure it's loaded before any other imports
import '../utils/process-polyfill';

import React, { useState, useEffect, useRef } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useOllama } from '../hooks/useOllama';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { geminiService } from '../utils/rate-limiter/geminiService';
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

// Import our custom implementations with aliases to avoid name conflicts
import { CustomModelManager as ModelManager, CustomConversationManager as ConversationManager } from '../utils/rate-limiter/custom-adapter';
import type { Conversation, ConversationTemplate, Message } from '../utils/rate-limiter/custom-adapter';

// Define the CommunityIdea type
interface CommunityIdea {
  id: string;
  title: string;
  description: string;
  prompt?: string;
  category: string;
  aiSystemInstructions?: string;
}

// Define the Participant type based on ASU_PARTICIPANTS structure
type Participant = typeof ASU_PARTICIPANTS[0];

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
  
  // Define a default template to use
  const defaultTemplate: ConversationTemplate = {
    id: 'default-chat',
    name: 'ASU GPT',
    description: 'General conversation with ASU GPT',
    modelId: 'gpt-4o-mini',
    systemPrompt: 'You are ASU GPT, a helpful AI assistant for Arizona State University. Provide accurate information about ASU, its programs, policies, and resources. Be friendly, helpful, and concise. If you don\'t know something, say so rather than making up information.',
    suggestedQuestions: [
      'What majors does ASU offer?',
      'How do I apply for financial aid?',
      'When is the application deadline?',
      'Tell me about the Barrett Honors College',
      'What clubs and organizations are available?'
    ],
    persona: 'ASU GPT'
  };
  
  const [templates, setTemplates] = useState<ConversationTemplate[]>([defaultTemplate]);
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

  // Automatically create a new conversation if none exists
  useEffect(() => {
    if (showWelcome && conversationManager) {
      try {
        // Use the default template directly
        const conversation = handleCreateConversation(defaultTemplate.id);
        if (conversation) {
          // Successfully created conversation
          setShowWelcome(false);
        } else {
          console.error("Failed to create conversation automatically");
        }
      } catch (error) {
        console.error('Error auto-creating conversation:', error);
      }
    }
  }, [showWelcome, conversationManager]);

  // Handlers for conversation actions
  const handleCreateConversation = (templateId: string): Conversation | null => {
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
      
      return conversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      setError('Failed to create a new conversation. Please try again.');
      return null;
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

  // Add a participant system message to the conversation
  const setupConversation = async (conversation: Conversation, selectedParticipant: Participant | null, selectedInstruction: CommunityIdea | null, template: ConversationTemplate) => {
    try {
      // Add participant-specific system message
      if (selectedParticipant) {
        const participantMsg = {
          role: 'system' as const,
          content: `You are speaking with ${selectedParticipant.name}, ${selectedParticipant.description}. Tailor your responses accordingly. Keep track of details they share about their situation and refer to them in your responses when relevant.`,
          isVisible: false
        };
        conversationManager.addMessage(conversation.id, participantMsg);
      }
      
      // Add instruction-specific system message
      if (selectedInstruction && selectedInstruction.aiSystemInstructions) {
        const instructionMsg = {
          role: 'system' as const,
          content: selectedInstruction.aiSystemInstructions,
          isVisible: false
        };
        conversationManager.addMessage(conversation.id, instructionMsg);
      }
      
      // Add a system message with the main ASU prompt if we're in a fresh conversation
      if (conversation.messages.length === 0) {
        const asuSystemMessage = {
          role: 'system' as const,
          content: template.systemPrompt,
          isVisible: false
        };
        conversationManager.addMessage(conversation.id, asuSystemMessage);
      }
      
      // Save state
      setActiveConversation(conversationManager.getActiveConversation());
      
      return conversation;
    } catch (error) {
      console.error('Error setting up conversation:', error);
      setError('Failed to set up conversation. Please try again.');
      return conversation;
    }
  };

  // Handle selection of a template
  const handleSelectPersonaChat = (template: PersonaChatTemplate) => {
    if (!template || !template.id) {
      console.error('Invalid template selected');
      return;
    }
    
    try {
      // Create a new conversation using the default template
      const createdConversation = handleCreateConversation(defaultTemplate.id);
      
      // When handleCreateConversation doesn't return a conversation directly, get it from the manager
      if (!createdConversation) {
        const activeConv = conversationManager.getActiveConversation();
        if (!activeConv) {
          console.error('Failed to create conversation for template');
          return;
        }
        
        // Find participant that matches the template persona
        const matchingParticipant = ASU_PARTICIPANTS.find(
          participant => participant.name === template.persona
        );
        
        if (matchingParticipant) {
          // Set the active participant
          setActiveParticipant(matchingParticipant.id);
          
          // Setup the conversation with the selected participant and adapted template
          const adaptedTemplate: ConversationTemplate = {
            ...defaultTemplate,
            systemPrompt: template.systemPrompt,
            id: template.id,
            name: template.name,
            description: template.description,
          };
          
          setupConversation(activeConv, matchingParticipant, null, adaptedTemplate);
        }
      }
    } catch (error) {
      console.error('Error handling persona chat selection:', error);
      setError('Failed to setup persona chat. Please try again.');
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
        
        if (personaTemplate) {
          // Filter out any existing participant-related system messages
          const updatedMessages = activeConversation.messages.filter(msg => 
            !(msg.isVisible === false && 
              msg.role === 'system' && 
              msg.content.includes("You are speaking with"))
          );
          
          // Create a new conversation object with filtered messages
          const updatedConversation = {
            ...activeConversation,
            messages: updatedMessages
          };
          
          // Update the conversation
          conversationManager.updateConversation(updatedConversation);
          
          // Add the new participant system message
          const participantMsg = {
            role: 'system' as const,
            content: personaTemplate.systemPrompt,
            isVisible: false
          };
          conversationManager.addMessage(activeConversation.id, participantMsg);
          
          // Add AI message explaining the change
          conversationManager.addMessage(activeConversation.id, {
            role: 'assistant' as const,
            content: `I'm now speaking as ${participant.name}, ${participant.role}. How can I help you today?`,
            isVisible: true
          });
          
          // Refresh the active conversation
          setActiveConversation(conversationManager.getActiveConversation());
        }
      }
    } else {
      // If participant is deselected, remove persona-specific system messages
      const updatedMessages = activeConversation.messages.filter(msg => 
        !(msg.isVisible === false && 
          msg.role === 'system' && 
          msg.content.includes("You are speaking with"))
      );
      
      // Create a new conversation object with filtered messages
      const updatedConversation = {
        ...activeConversation,
        messages: updatedMessages
      };
      
      // Update the conversation
      conversationManager.updateConversation(updatedConversation);
      
      // Add a system message with default ASU GPT prompt
      if (templates && templates.length > 0) {
        const asuSystemMessage = {
          role: 'system' as const,
          content: templates[0].systemPrompt,
          isVisible: false
        };
        conversationManager.addMessage(activeConversation.id, asuSystemMessage);
      }
      
      // Add AI message explaining the change
      conversationManager.addMessage(activeConversation.id, {
        role: 'assistant' as const,
        content: `I'm now ASU GPT, a general AI assistant. How can I help you today?`,
        isVisible: true
      });
      
      // Refresh the active conversation
      setActiveConversation(conversationManager.getActiveConversation());
    }
  };
  
  // Handle chat instruction selection
  const handleSelectInstruction = (idea: CommunityIdea | null) => {
    setActiveInstruction(idea);
    
    // Add instruction system message to the conversation
    if (activeConversation && idea && idea.aiSystemInstructions) {
      // First, clear any existing instruction messages
      const updatedMessages = activeConversation.messages.filter(msg => 
        !(msg.isVisible === false && 
          msg.role === 'system' && 
          !msg.content.includes("You are speaking with") &&
          !msg.content.includes(templates[0]?.systemPrompt || "You are ASU GPT"))
      );
      
      // Create a new conversation object with filtered messages
      const updatedConversation = {
        ...activeConversation,
        messages: updatedMessages
      };
      
      // Update the conversation
      conversationManager.updateConversation(updatedConversation);
      
      // Add the new instruction message
      const instructionMsg = {
        role: 'system' as const,
        content: idea.aiSystemInstructions,
        isVisible: false
      };
      conversationManager.addMessage(activeConversation.id, instructionMsg);
      
      // Add AI message explaining the change
      conversationManager.addMessage(activeConversation.id, {
        role: 'assistant' as const,
        content: `I'll now focus on helping with "${idea.title}". ${idea.description}`,
        isVisible: true
      });
      
      // Refresh the active conversation
      setActiveConversation(conversationManager.getActiveConversation());
    } else if (activeConversation && !idea) {
      // If no instruction is selected, add a message indicating we're back to general mode
      conversationManager.addMessage(activeConversation.id, {
        role: 'assistant' as const,
        content: "I'll now return to general ASU assistance mode. How can I help you?",
        isVisible: true
      });
      
      // Refresh the active conversation
      setActiveConversation(conversationManager.getActiveConversation());
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
        modelId: 'gemini-2.0-flash',
        provider: 'gemini'
      };
    } else if (preferredProvider === 'ollama' && ollama.status.isConnected) {
      return {
        isConnected: true,
        name: ollama.status.currentModel || 'Ollama',
        status: 'Connected',
        canStream: ollama.isStreamingSupported(),
        modelId: ollama.status.currentModel || 'llama3.1:8b',
        provider: 'ollama'
      };
    } else {
      return {
        isConnected: false,
        name: 'AI Provider',
        status: 'Not Connected',
        canStream: false,
        modelId: 'gpt-4o-mini', // Default model when no provider is connected
        provider: 'openai'
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
            onClick={() => {
              setError(null);
              // Try to create a new conversation with safe values
              try {
                const safeTemplate = {
                  id: 'default-chat',
                  name: 'ASU GPT',
                  description: 'General conversation with ASU GPT',
                  modelId: 'gpt-4o-mini',
                  systemPrompt: 'You are ASU GPT, a helpful AI assistant.',
                  suggestedQuestions: [],
                  persona: 'ASU GPT'
                };
                const conversation = conversationManager.createConversation('default-chat');
                conversationManager.setActiveConversation(conversation.id);
                setActiveConversation(conversation);
                setShowWelcome(false);
              } catch (recoverError) {
                console.error('Error recovering from previous error:', recoverError);
                window.location.reload();
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors mr-2"
          >
            Try to Fix
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // Main rendering with error handling
  try {
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
                {/* Model Switcher */}
                <ModelSwitcher 
                  currentModel={currentModel}
                  onModelChange={handleModelChange}
                  compact={true}
                  provider={getProviderInfo().provider as 'openai' | 'gemini' | 'ollama' | 'anthropic'}
                />
              </div>
            </div>

            {/* Welcome Content */}
            <div className="flex-1 overflow-auto flex items-center justify-center">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8C1D40] mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-700">Starting ASU GPT...</h2>
                <p className="text-gray-500 mt-2">Your conversation will begin momentarily.</p>
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
              {/* Model Switcher */}
              <ModelSwitcher 
                currentModel={currentModel}
                onModelChange={handleModelChange}
                compact={true}
                provider={getProviderInfo().provider as 'openai' | 'gemini' | 'ollama' | 'anthropic'}
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
  } catch (renderError) {
    console.error("Error rendering UI:", renderError);
    // Fallback UI on render errors
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="max-w-md p-6 bg-white shadow-lg rounded-lg">
          <h2 className="text-xl font-semibold text-red-600 mb-4">UI Rendering Error</h2>
          <p className="text-gray-700 mb-4">Something went wrong displaying the UI. Please try again.</p>
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
};

export default AsuGptPage; 