import React from 'react';
import { MessageCircle, Cpu, Zap, FlaskConical, Trash2 } from 'lucide-react';
import ServiceLogo from './ServiceLogo';
import { Conversation, ConversationTemplate } from '../types/index';
import { generateChatSummary, formatLastMessageTime } from '../utils/chatSummary';

interface ConversationSidebarProps {
  conversations: Conversation[];
  templates: ConversationTemplate[];
  activeConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onDeleteConversation: (conversationId: string) => void;
  onCreateConversation: () => void;
  onCloseSidebar: () => void;
  isMobile: boolean;
}

const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  conversations,
  templates,
  activeConversationId,
  onSelectConversation,
  onDeleteConversation,
  onCreateConversation,
  onCloseSidebar,
  isMobile
}) => {
  const getTemplateIcon = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    
    // If template has a modelId, use the service logo with white variant for better contrast
    if (template?.modelId) {
      return <ServiceLogo modelId={template.modelId} variant="dark" size="sm" />;
    }
    
    // Fallback for templates without model IDs
    const icon = template?.icon;
    if (typeof icon === 'string') {
      switch (icon) {
        case 'llama':
          return <ServiceLogo modelId="llama3.1:8b" variant="dark" size="sm" />;
        case 'rocket':
          return <Zap className="w-4 h-4 text-white" />;
        case 'research':
          return <FlaskConical className="w-4 h-4 text-white" />;
        default:
          return <Cpu className="w-4 h-4 text-white" />;
      }
    }
    
    return icon || <Cpu className="w-4 h-4 text-white" />;
  };

  const getTemplateColor = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    return template?.color || '#3B82F6';
  };



  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          
          {isMobile && (
            <button
              onClick={onCloseSidebar}
              className="p-1 hover:bg-gray-100 rounded"
              aria-label="Close sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        <button
          onClick={onCreateConversation}
          className="w-full mt-3 bg-[#FFC627] text-[#191919] py-2 px-4 rounded-lg hover:bg-yellow-400 transition-colors flex items-center justify-center space-x-2"
          title="Start a new conversation or return to AI experiences"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>{activeConversationId ? 'New Experience' : 'New Chat'}</span>
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <div className="flex justify-center items-center mb-2">
              <MessageCircle className="w-16 h-16 text-gray-400" />
            </div>
            <p className="text-sm">No conversations yet</p>
            <p className="text-xs mt-1">Create your first chat to get started</p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {conversations.map((conversation) => {
              const isActive = conversation.id === activeConversationId;
              const templateIcon = getTemplateIcon(conversation.templateId);
              const templateColor = getTemplateColor(conversation.templateId);
              
              return (
                <div
                  key={conversation.id}
                  className={`
                    relative group p-3 rounded-lg cursor-pointer transition-colors
                    ${isActive 
                      ? 'bg-[#FFC627] bg-opacity-20 border border-[#FFC627] border-opacity-40' 
                      : 'hover:bg-gray-50 border border-transparent'
                    }
                  `}
                  onClick={() => onSelectConversation(conversation.id)}
                >
                  <div className="flex items-start space-x-3">
                    {/* Template Icon */}
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0"
                      style={{ backgroundColor: templateColor }}
                    >
                      {templateIcon}
                    </div>
                    
                    {/* Conversation Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900 truncate flex-1">
                          {generateChatSummary(conversation.messages)}
                        </h3>
                        
                        {/* Delete Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteConversation(conversation.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-100 rounded-md transition-all ml-2 flex-shrink-0"
                          aria-label="Delete conversation"
                          title="Delete conversation"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      </div>
                      
                      <p className="text-xs text-gray-500 mt-1">
                        {conversation.messages.length} messages
                      </p>
                      
                      <p className="text-xs text-gray-400 mt-1">
                        {formatLastMessageTime(conversation.lastUpdated)}
                      </p>
                      
                      {/* Last message preview */}
                      {conversation.messages.length > 0 && (
                        <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                          {(() => {
                            const lastMessage = conversation.messages[conversation.messages.length - 1];
                            let preview = lastMessage.content
                              .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
                              .replace(/\*(.*?)\*/g, '$1')     // Remove italic
                              .replace(/`(.*?)`/g, '$1')       // Remove code
                              .replace(/#{1,6}\s/g, '')        // Remove headers
                              .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
                              .replace(/\n+/g, ' ')            // Replace newlines
                              .trim();
                            
                            return preview.length > 60 ? preview.slice(0, 60) + '...' : preview;
                          })()}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-[#FFC627] rounded-r" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onCreateConversation}
          className="w-full flex items-center justify-center space-x-2 p-2 hover:bg-gray-50 rounded-lg transition-colors group"
          title="Return to AI Experiences Homepage"
        >
          <img src={`${process.env.PUBLIC_URL}/site-logo.png`} alt="Beta Land @ ASU" className="w-11" />
          <div className="text-xs text-gray-500 group-hover:text-[#FFC627]">
            Beta Land @ ASU
          </div>
        </button>
      </div>
    </div>
  );
};

export default ConversationSidebar; 