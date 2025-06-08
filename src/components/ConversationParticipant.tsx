import React from 'react';

interface ParticipantProps {
  name: string;
  role: string;
  imgSrc: string;
  active?: boolean;
  onClick?: () => void;
}

/**
 * Component for displaying conversation participants with profile pictures
 * Used to represent conversation partners like faculty, staff, and students
 */
const ConversationParticipant: React.FC<ParticipantProps> = ({
  name,
  role,
  imgSrc,
  active = false,
  onClick
}) => {
  return (
    <div 
      className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
        active 
          ? 'bg-yellow-100 border border-yellow-300' 
          : 'hover:bg-gray-100 border border-transparent'
      }`}
      onClick={onClick}
    >
      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
        <img 
          src={imgSrc} 
          alt={name} 
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback for missing images
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=ASU';
          }}
        />
      </div>
      <div className="ml-3">
        <h3 className="font-medium text-gray-900">{name}</h3>
        <p className="text-sm text-gray-500">{role}</p>
      </div>
    </div>
  );
};

/**
 * ASU Conversation Participants
 * Predefined participants with their profile information
 */
export const ASU_PARTICIPANTS = [
  {
    id: 'michael-crow',
    name: 'Michael Crow',
    role: 'ASU President & Visionary',
    imgSrc: '/images/participants/michael-crow.jpg',
    description: 'Discusses education, leadership, and institutional innovation from a visionary perspective.',
    modelId: 'gpt-4o'
  },
  {
    id: 'elizabeth-reilley',
    name: 'Elizabeth Reilley',
    role: 'Executive Director, AI Acceleration',
    imgSrc: '/images/participants/elizabeth-reilley.jpg',
    description: 'Explores innovation, technology, and emerging possibilities in AI and education.',
    modelId: 'gemini-2.0-flash'
  },
  {
    id: 'zohair',
    name: 'Zohair Alam',
    role: 'Computer Science Researcher',
    imgSrc: '/images/participants/zohair-alam.jpg',
    description: 'Provides technical expertise in computer science, coding, and AI technologies.',
    modelId: 'gpt-4-turbo'
  },
  {
    id: 'jennifer-werner',
    name: 'Jennifer Werner',
    role: 'Sustainability Director',
    imgSrc: '/images/participants/jennifer-werner.jpg',
    description: 'Discusses sustainability initiatives and environmental science approaches at ASU.',
    modelId: 'gemini-2.0-flash'
  }
];

/**
 * Component for displaying a grid of conversation participants
 */
export const ParticipantGrid: React.FC<{
  participants: typeof ASU_PARTICIPANTS;
  activeParticipant?: string;
  onSelectParticipant: (id: string) => void;
}> = ({
  participants,
  activeParticipant,
  onSelectParticipant
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {participants.map((participant) => (
        <ConversationParticipant
          key={participant.id}
          name={participant.name}
          role={participant.role}
          imgSrc={participant.imgSrc}
          active={activeParticipant === participant.id}
          onClick={() => onSelectParticipant(participant.id)}
        />
      ))}
    </div>
  );
};

export default ConversationParticipant; 