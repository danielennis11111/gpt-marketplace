import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import CommunityIdeaSelector from './CommunityIdeaSelector';

interface CommunityIdea {
  id: string;
  title: string;
  description: string;
  prompt?: string;
  category: string;
  aiSystemInstructions?: string;
}

interface ChatInstructionsSelectorProps {
  activeInstruction?: CommunityIdea;
  onSelectInstruction: (idea: CommunityIdea | null) => void;
}

const ChatInstructionsSelector: React.FC<ChatInstructionsSelectorProps> = ({
  activeInstruction,
  onSelectInstruction
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isIdeaSelectorOpen, setIsIdeaSelectorOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle selecting an instruction
  const handleSelectIdea = (idea: CommunityIdea) => {
    // Only use ideas tagged as instructions
    if (idea.category === 'instructions') {
      onSelectInstruction(idea);
    } else {
      // You could show an error message here
      console.warn('Selected idea is not an instruction');
    }
    setIsIdeaSelectorOpen(false);
  };
  
  // Handle clearing the instruction
  const clearInstruction = () => {
    onSelectInstruction(null);
    setIsOpen(false);
  };
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors border hover:bg-gray-100 ${
          activeInstruction ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'
        }`}
      >
        <LightBulbIcon className="w-4 h-4" />
        {activeInstruction ? (
          <span className="truncate max-w-[150px]">{activeInstruction.title}</span>
        ) : (
          <span>Add Instructions</span>
        )}
        <ChevronDownIcon className="w-4 h-4" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 py-2 w-64 bg-white rounded-md shadow-lg z-20 border border-gray-200">
          <div className="px-4 py-2 text-xs font-medium text-gray-700 border-b border-gray-100">
            Chat Instructions
          </div>
          
          <div className="px-4 py-2 text-xs text-gray-500">
            Select instructions from community ideas to guide your conversation.
          </div>
          
          {activeInstruction && (
            <>
              <div className="px-4 py-2 text-sm font-medium text-gray-800">
                Current Instruction:
              </div>
              <div className="px-4 py-2 text-sm bg-yellow-50">
                <div className="font-medium text-gray-900">{activeInstruction.title}</div>
                <div className="text-xs text-gray-600 mt-1 line-clamp-2">{activeInstruction.description}</div>
              </div>
              <button
                onClick={clearInstruction}
                className="px-4 py-2 text-sm text-left w-full hover:bg-red-50 text-red-600"
              >
                Clear Instructions
              </button>
              <div className="border-t border-gray-100 my-2"></div>
            </>
          )}
          
          <button
            onClick={() => {
              setIsOpen(false);
              setIsIdeaSelectorOpen(true);
            }}
            className="px-4 py-2 text-sm text-left w-full hover:bg-blue-50 text-blue-600 flex items-center"
          >
            <LightBulbIcon className="w-4 h-4 mr-2" />
            Browse Community Instructions
          </button>
        </div>
      )}
      
      {/* Community Idea Selector Modal */}
      <CommunityIdeaSelector
        isOpen={isIdeaSelectorOpen}
        onClose={() => setIsIdeaSelectorOpen(false)}
        onSelectIdea={handleSelectIdea}
      />
    </div>
  );
};

export default ChatInstructionsSelector; 