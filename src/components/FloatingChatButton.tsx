import React, { useState, useEffect } from 'react';
import { 
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { GlobalChatbot } from './GlobalChatbot';
import { useOllama } from '../hooks/useOllama';
import { useProjects } from '../contexts/ProjectsContext';

interface FloatingChatButtonProps {
  projectData?: any;
}

export const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ projectData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPulse, setShowPulse] = useState(false);
  const { status, isLoading } = useOllama();
  const { projects, productTypes } = useProjects();

  // Show pulse animation when Ollama status changes
  useEffect(() => {
    if (!isLoading) {
      setShowPulse(true);
      const timer = setTimeout(() => setShowPulse(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [status.isConnected, isLoading]);

  const handleToggleChat = () => {
    setIsOpen(!isOpen);
    setShowPulse(false);
  };

  const handleCloseChat = () => {
    setIsOpen(false);
  };

  // Don't show the button if we're still loading initial state
  if (isLoading && status.isConnected === false && status.error === null) {
    return null;
  }

  const getButtonStyle = () => {
    // ASU Maroon and Gold branding
    if (status.isConnected) {
      return 'bg-gradient-to-r from-red-800 to-yellow-500 hover:from-red-900 hover:to-yellow-600';
    } else if (status.error) {
      return 'bg-gradient-to-r from-red-700 to-orange-500 hover:from-red-800 hover:to-orange-600';
    }
    return 'bg-gradient-to-r from-gray-600 to-red-800 hover:from-gray-700 hover:to-red-900';
  };

  const getIcon = () => {
    if (status.isConnected) {
      return <SparklesIcon className="w-6 h-6" />;
    } else if (status.error) {
      return <ExclamationTriangleIcon className="w-6 h-6" />;
    }
    return <ChatBubbleLeftRightIcon className="w-6 h-6" />;
  };

  const getTooltipText = () => {
    if (status.isConnected) {
      return `Local AI Assistant (${status.currentModel})`;
    } else if (status.error) {
      return 'AI Assistant (Setup required)';
    }
    return 'AI Assistant';
  };

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="relative group">
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
            {getTooltipText()}
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>

          {/* Chat Button */}
          <button
            onClick={handleToggleChat}
            className={`
              relative w-14 h-14 rounded-full text-white shadow-lg transition-all duration-200 
              ${getButtonStyle()}
              ${isOpen ? 'rotate-45 scale-95' : 'rotate-0 scale-100 hover:scale-105'}
            `}
          >
            {/* Status Indicator */}
            <div className="absolute -top-1 -right-1">
                          {status.isConnected ? (
              <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            ) : status.error ? (
              <div className="w-4 h-4 bg-amber-500 rounded-full border-2 border-white"></div>
            ) : (
              <div className="w-4 h-4 bg-gray-400 rounded-full border-2 border-white"></div>
            )}
            </div>

            {/* Icon */}
            <div className={`transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}>
              {getIcon()}
            </div>

            {/* Background Effect */}
            <div className="absolute inset-0 rounded-full bg-white opacity-0 hover:opacity-10 transition-opacity duration-200"></div>
          </button>


        </div>
      </div>

      {/* Global Chatbot Modal */}
      {isOpen && (
        <GlobalChatbot 
          onClose={handleCloseChat}
          projectData={projectData}
          projects={projects}
          productTypes={productTypes}
        />
      )}
    </>
  );
}; 