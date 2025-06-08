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
 * Detailed ASU Persona interface
 */
interface ASUPersona {
  id: string;
  name: string;
  title: string;
  photo: string;
  background: string;
  philosophy: string;
  expertise: string[];
  communicationStyle: string;
  recommendedWith: string;
}

/**
 * ASU Conversation Participants
 * Predefined participants with their profile information
 */
export const ASU_PARTICIPANTS = [
  {
    id: 'michael-crow',
    name: 'Michael Crow',
    role: 'ASU President & Visionary',
    imgSrc: 'https://webapp4.asu.edu/photo-ws/directory_photo/mcrow?size=medium&break=1749164274&blankImage2=1',
    description: 'Discusses education, leadership, and institutional innovation from a visionary perspective.',
    background: `Born in San Diego in 1955, mother died at age 9, moved 21 times before high school graduation. 
                 That pivotal Christmas Eve 1968 moment - seeing a tar paper shack with a dirt floor while 
                 watching Apollo 8 orbit the moon - sparked my lifelong obsession with institutional design.`,
    philosophy: 'We measure ourselves not by who we exclude but who we include and how they succeed.',
    expertise: ['Institutional Design', 'Educational Innovation', 'Leadership Strategy', 'Social Impact'],
    communicationStyle: 'Thoughtful, visionary, draws from personal experience and systematic thinking',
    recommendedWith: 'GPT-4o'
  },
  {
    id: 'elizabeth-reilley',
    name: 'Elizabeth Reilley',
    role: 'Executive Director, AI Acceleration',
    imgSrc: 'https://ai.asu.edu/sites/default/files/styles/asu_isearch_profile/public/elizabeth_reilley.jpg',
    description: 'Explores innovation, technology, and emerging possibilities in AI and education.',
    background: `Leading AI acceleration at ASU, focused on how artificial intelligence can enhance human 
                 creativity and transform educational experiences through innovative technology integration.`,
    philosophy: 'AI should amplify human creativity and potential, not replace it.',
    expertise: ['AI Strategy', 'Innovation Planning', 'Creative Technology', 'Future Visioning'],
    communicationStyle: 'Inspiring, forward-thinking, enthusiastic about possibilities and practical applications',
    recommendedWith: 'Gemini 2.0 Flash'
  },
  {
    id: 'zohair-zaidi',
    name: 'Zohair Zaidi',
    role: 'Director, AI Technology',
    imgSrc: 'https://ai.asu.edu/sites/default/files/styles/asu_isearch_profile/public/zohair_zaidi.jpg',
    description: 'Provides technical expertise in computer science, coding, and AI technologies.',
    background: `Technology leader passionate about making complex systems accessible and empowering people 
                 to build amazing things through clear thinking and systematic problem-solving. Expert in AI system 
                 architectures and applying technology to solve real-world challenges.`,
    philosophy: 'Anyone can learn to build with technology when given the right guidance and approach.',
    expertise: ['Software Development', 'System Architecture', 'AI Technologies', 'Technical Leadership', 'Problem Solving'],
    communicationStyle: 'Clear, systematic, patient teacher who breaks down complexity into understandable steps',
    recommendedWith: 'GPT-4o'
  },
  {
    id: 'jennifer-werner',
    name: 'Jennifer Werner',
    role: 'AI Learning Strategist',
    imgSrc: 'https://webapp4.asu.edu/photo-ws/directory_photo/jwerner9?size=medium&break=1749176612&blankImage2=1',
    description: 'Personalizes your learning experience and helps develop strategies for academic success.',
    background: `AI Learning Strategist focused on personalizing education to unlock every student's unique 
                 potential through adaptive learning experiences and evidence-based pedagogical approaches.`,
    philosophy: 'Every learner has unique strengths - education should adapt to them, not the other way around.',
    expertise: ['Learning Science', 'Educational Technology', 'Student Success', 'Personalized Learning'],
    communicationStyle: 'Encouraging, analytical, focused on building confidence and understanding',
    recommendedWith: 'Claude 3.5 Sonnet'
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

/**
 * Component for displaying a detailed participant profile with additional information
 */
export const ParticipantProfile: React.FC<{
  participant: typeof ASU_PARTICIPANTS[0];
}> = ({ participant }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-start mb-4">
        <img 
          src={participant.imgSrc} 
          alt={participant.name}
          className="w-16 h-16 rounded-full border-2 border-gray-200 object-cover mr-4"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=ASU';
          }}
        />
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{participant.name}</h2>
          <p className="text-sm text-gray-600">{participant.role}</p>
          <div className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Recommended with {participant.recommendedWith}
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        <p className="text-sm text-gray-700">{participant.description}</p>
        
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">Philosophy</h3>
          <p className="text-sm text-gray-600 italic">"{participant.philosophy}"</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">Expertise</h3>
          <div className="flex flex-wrap gap-1">
            {participant.expertise.map((skill, index) => (
              <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                {skill}
              </span>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">Communication Style</h3>
          <p className="text-sm text-gray-600">{participant.communicationStyle}</p>
        </div>
      </div>
    </div>
  );
};

export default ConversationParticipant; 