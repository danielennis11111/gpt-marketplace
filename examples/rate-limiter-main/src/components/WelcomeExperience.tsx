import React from 'react';
import { ConversationTemplate } from '../types/index';
import ServiceLogo from './ServiceLogo';

interface WelcomeExperienceProps {
  experiences: ConversationTemplate[];
  onSelectExperience: (experienceId: string) => void;
}

const WelcomeExperience: React.FC<WelcomeExperienceProps> = ({ 
  experiences, 
  onSelectExperience 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl w-full mx-auto p-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
  
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                Beta Land @ ASU
              </h1>
              <p className="text-xl text-gray-600">
                Experience the amazing qualities of AI with our ASU experts
              </p>
            </div>
          </div>
        </div>

        {/* Experience Cards - Condensed Grid */}
        <div className="space-y-8 mb-8">
          {/* First Row - Jennifer Werner */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {experiences.slice(0, 3).map((experience) => (
              <div
                key={experience.id}
                onClick={() => onSelectExperience(experience.id)}
                className={`
                  group relative overflow-hidden rounded-xl p-4 cursor-pointer
                  transition-all duration-200 hover:scale-102 hover:shadow-lg
                  ${experience.color} text-white
                  border border-white border-opacity-20
                `}
              >
                {/* Content */}
                <div className="relative">
                  {/* Expert Photo & Info */}
                  <div className="flex items-center mb-3">
                    {experience.icon.startsWith('http') ? (
                      <img 
                        src={experience.icon} 
                        alt={experience.persona}
                        className="w-10 h-10 rounded-full border-2 border-white border-opacity-50 object-cover mr-3"
                      />
                    ) : (
                      <div className="text-2xl mr-3">{experience.icon}</div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold leading-tight">{experience.name}</h3>
                      <p className="text-white text-opacity-80 text-sm">{experience.persona}</p>
                    </div>
                    {/* Hover Arrow */}
                    <div className="transition-transform duration-200 group-hover:translate-x-1">
                      <svg className="w-4 h-4 text-white text-opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-white text-opacity-90 mb-3 text-sm leading-relaxed" style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {experience.description}
                  </p>

                  {/* Key Capabilities */}
                  <div className="space-y-1 mb-3">
                    {experience.capabilities.slice(0, 2).map((capability, index) => (
                      <div key={index} className="flex items-center text-white text-opacity-80">
                        <div className="w-1.5 h-1.5 bg-white bg-opacity-60 rounded-full mr-2"></div>
                        <span className="text-xs">{capability}</span>
                      </div>
                    ))}
                  </div>

                  {/* Model & Voice Info */}
                  <div className="flex items-center justify-between text-white text-opacity-70 text-xs">
                    <div className="flex items-center space-x-1">
                      <ServiceLogo modelId={experience.modelId} variant="dark" size="sm" />
                      <span>{experience.modelId}</span>
                    </div>
                    <span>🎙️ {experience.features.voicePersona}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sustainable Private Local Models Section */}
          {experiences.length > 3 && (
            <>
              <div className="text-center mb-6">
                <div>
                  
                  <h2 className="text-2xl font-bold">Sustainable Private Local Models</h2>
                </div>
                <p className="text-gray-600 mt-3 max-w-3xl mx-auto leading-relaxed">
                  Experience the power of <strong>Llama 4 Scout</strong> running entirely on your machine. Transform ideas into 
                  working applications in minutes with our browser-based dependency installer. No internet required, complete privacy, 
                  unlimited usage - this is the future of AI development.
                </p>
              </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {experiences.slice(3).map((experience) => (
                   <div
                     key={experience.id}
                     onClick={() => onSelectExperience(experience.id)}
                     className={`
                       group relative overflow-hidden rounded-xl p-4 cursor-pointer
                       transition-all duration-200 hover:scale-102 hover:shadow-lg
                       ${experience.color} text-white
                       border border-white border-opacity-20
                     `}
                   >
                     {/* Content */}
                     <div className="relative">
                       {/* Expert Photo & Info */}
                       <div className="flex items-center mb-3">
                         {experience.icon.startsWith('http') ? (
                           <img 
                             src={experience.icon} 
                             alt={experience.persona}
                             className="w-10 h-10 rounded-full border-2 border-white border-opacity-50 object-cover mr-3"
                           />
                         ) : (
                           <div className="text-2xl mr-3">{experience.icon}</div>
                         )}
                         <div className="flex-1">
                           <h3 className="text-lg font-bold leading-tight">{experience.name}</h3>
                           <p className="text-white text-opacity-80 text-sm">{experience.persona}</p>
                         </div>
                         {/* Hover Arrow */}
                         <div className="transition-transform duration-200 group-hover:translate-x-1">
                           <svg className="w-4 h-4 text-white text-opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                           </svg>
                         </div>
                       </div>

                       {/* Description */}
                       <p className="text-white text-opacity-90 mb-3 text-sm leading-relaxed" style={{
                         display: '-webkit-box',
                         WebkitLineClamp: 2,
                         WebkitBoxOrient: 'vertical',
                         overflow: 'hidden'
                       }}>
                         {experience.description}
                       </p>

                       {/* Key Capabilities */}
                       <div className="space-y-1 mb-3">
                         {experience.capabilities.slice(0, 2).map((capability, index) => (
                           <div key={index} className="flex items-center text-white text-opacity-80">
                             <div className="w-1.5 h-1.5 bg-white bg-opacity-60 rounded-full mr-2"></div>
                             <span className="text-xs">{capability}</span>
                           </div>
                         ))}
                       </div>

                       {/* Model & Voice Info */}
                       <div className="flex items-center justify-between text-white text-opacity-70 text-xs">
                         <div className="flex items-center space-x-1">
                           <ServiceLogo modelId={experience.modelId} variant="dark" size="sm" />
                           <span>{experience.modelId}</span>
                         </div>
                         <span>🎙️ {experience.features.voicePersona}</span>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             </>
           )}
         </div>

        {/* Features Showcase */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Powered by Advanced AI
            </h2>
            <p className="text-gray-600">
              Switch between OpenAI, Google Gemini, and local Llama models seamlessly
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
                          <div className="w-12 h-12 bg-[#FFC627] bg-opacity-20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-[#FFC627]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Natural Conversations</h3>
              <p className="text-sm text-gray-600">Stream of consciousness thinking with authentic personalities</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Voice Interaction</h3>
              <p className="text-sm text-gray-600">High-quality OpenAI voices matched to each expert</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Model Switching</h3>
              <p className="text-sm text-gray-600">Choose the best AI model for each task automatically</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            Built with ❤️ by the ASU AI Innovation Team
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeExperience; 