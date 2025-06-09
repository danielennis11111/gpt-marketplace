import React, { useState, useRef, useEffect } from 'react';
import { ASU_PARTICIPANTS } from './ConversationParticipant';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface ParticipantSelectorProps {
  activeParticipant?: string;
  onSelectParticipant: (id: string) => void;
}

const ParticipantSelector: React.FC<ParticipantSelectorProps> = ({
  activeParticipant,
  onSelectParticipant
}) => {
  const [isOpen, setIsOpen] = useState(false);
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
  
  // Get current participant
  const currentParticipant = activeParticipant ? 
    ASU_PARTICIPANTS.find(p => p.id === activeParticipant) : 
    undefined;
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors border border-gray-200 hover:bg-gray-100"
      >
        {currentParticipant ? (
          <>
            <div className="w-6 h-6 rounded-full overflow-hidden">
              <img 
                src={currentParticipant.imgSrc} 
                alt={currentParticipant.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=ASU';
                }}
              />
            </div>
            <span>{currentParticipant.name}</span>
          </>
        ) : (
          <span>Select Partner</span>
        )}
        <ChevronDownIcon className="w-4 h-4" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 py-2 w-64 bg-white rounded-md shadow-lg z-20 border border-gray-200">
          <div className="px-4 py-2 text-xs font-medium text-gray-700 border-b border-gray-100">
            Conversation Partners
          </div>
          
          {activeParticipant && (
            <button
              onClick={() => {
                onSelectParticipant(activeParticipant);
                setIsOpen(false);
              }}
              className="px-4 py-2 text-sm text-left w-full hover:bg-red-50 text-red-600"
            >
              Clear Selection
            </button>
          )}
          
          {ASU_PARTICIPANTS.map((participant) => (
            <button
              key={participant.id}
              onClick={() => {
                onSelectParticipant(participant.id);
                setIsOpen(false);
              }}
              className={`flex items-center px-4 py-2 text-sm text-left w-full hover:bg-gray-100 ${
                activeParticipant === participant.id ? 'bg-yellow-50' : ''
              }`}
            >
              <div className="w-6 h-6 rounded-full overflow-hidden mr-2">
                <img 
                  src={participant.imgSrc} 
                  alt={participant.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=ASU';
                  }}
                />
              </div>
              <div>
                <div className="font-medium">{participant.name}</div>
                <div className="text-xs text-gray-500">{participant.role}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ParticipantSelector; 