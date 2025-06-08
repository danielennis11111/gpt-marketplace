import React from 'react';
import { Menu, MessageSquare, Plus } from 'lucide-react';
import { Conversation } from '../types';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  isOpen,
  onToggle
}) => {
  const groupConversationsByTime = (conversations: Conversation[]) => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const groups = {
      'Past 7 Days': [] as Conversation[],
      'May': [] as Conversation[],
      'Older': [] as Conversation[]
    };

    conversations.forEach(conv => {
      if (conv.createdAt >= sevenDaysAgo) {
        groups['Past 7 Days'].push(conv);
      } else if (conv.createdAt >= thirtyDaysAgo) {
        groups['May'].push(conv);
      } else {
        groups['Older'].push(conv);
      }
    });

    return groups;
  };

  const conversationGroups = groupConversationsByTime(conversations);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-80 bg-white border-r border-gray-200
        transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 transition-transform duration-200 ease-in-out
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <img 
              src={`${process.env.PUBLIC_URL}/site-logo.png`}
              alt="Site Logo" 
              className="w-14 pl-2"
            />
            <span className="font-semibold text-gray-900 text-xl">AI @ ASU</span>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button
            onClick={onNewConversation}
            className="w-full flex items-center justify-center px-4 py-2 bg-asu-maroon text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </button>
        </div>

        {/* Conversation Groups */}
        <div className="flex-1 overflow-y-auto">
          {Object.entries(conversationGroups).map(([groupName, groupConversations]) => (
            groupConversations.length > 0 && (
              <div key={groupName} className="mb-6">
                <h3 className="px-4 py-2 text-sm font-semibold text-gray-600 uppercase tracking-wider">
                  {groupName}
                </h3>
                <div className="space-y-1 px-2">
                  {groupConversations.map(conversation => (
                    <button
                      key={conversation.id}
                      onClick={() => onSelectConversation(conversation.id)}
                      className={`
                        w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer text-left ${
                          activeConversationId === conversation.id ? 'bg-gray-100 text-asu-maroon' : 'text-gray-700'
                        }`}
                    >
                      <MessageSquare className={`w-5 h-5 ${
                        activeConversationId === conversation.id ? 'text-asu-maroon' : 'text-gray-400'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {conversation.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {conversation.messages.length} messages • {Math.round(conversation.tokenCount / 1000)}K tokens
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      </div>
    </>
  );
}; 