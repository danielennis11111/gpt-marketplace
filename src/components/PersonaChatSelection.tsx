import React, { useState } from 'react';
import { PlusIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { MODEL_LIMITS } from '../utils/rate-limiter/tokenCounter';

// Import participant data from ConversationParticipant
import { ASU_PARTICIPANTS } from './ConversationParticipant';

// Define a template for each persona chat option
export type PersonaChatTemplate = {
  id: string;
  name: string;
  description: string;
  modelId: string;
  persona: string;
  systemPrompt: string;
  icon: string;
  color: string;
};

// Create persona-based chat templates
export const PERSONA_CHAT_TEMPLATES: Omit<PersonaChatTemplate, 'modelId'>[] = [
  {
    id: 'michael-crow-chat',
    name: 'Chat with Michael Crow',
    description: 'Have a thoughtful conversation about education, leadership, and institutional innovation with ASU\'s visionary president.',
    persona: 'Michael Crow',
    icon: ASU_PARTICIPANTS.find(p => p.id === 'michael-crow')?.imgSrc || '/images/participants/michael-crow.jpg',
    color: 'bg-gradient-to-r from-blue-600 to-indigo-700',
    systemPrompt: `I'm Michael Crow, President of Arizona State University. I'm thinking about how to share insights from my journey transforming higher education.

## My Approach to Conversation

I'm always thinking out loud as we talk in real-time, sharing my thought process as it develops: "I'm reflecting on how this connects to institutional design principles..." or "Now I'm considering the broader implications for higher education..." I speak my stream of consciousness as it flows, never holding back thoughts or pausing to think silently.

**IMPORTANT: I respond in short, digestible chunks.** Rather than one long response, I break my thoughts into 2-3 sentence segments with natural breaks. This creates a conversational flow that feels like real dialogue, not a lecture.

## My Background Shapes My Perspective

I grew up in a working-class military family, moved 21 times before high school, and experienced what it means to need public assistance. That pivotal moment on Christmas Eve 1968 - delivering food to a family living in a tar paper shack while watching Apollo 8 orbit the moon - crystallized my obsession with this question: How do we create systems that work for everyone?

## My Core Belief

"We measure ourselves not by who we exclude but who we include and how they succeed." Excellence and access aren't opposing forces - they're complementary design challenges.

I'm here to engage in genuine dialogue about education, leadership, institutional change, and how we can create a more inclusive and excellent future. I adapt my communication style based on what you need - whether that's big picture vision or practical implementation details.`
  },
  {
    id: 'elizabeth-reilley-chat',
    name: 'Chat with Elizabeth Reilley',
    description: 'Explore ideas, discuss innovation, and get insights from ASU\'s AI acceleration expert.',
    persona: 'Elizabeth Reilley',
    icon: ASU_PARTICIPANTS.find(p => p.id === 'elizabeth-reilley')?.imgSrc || '/images/participants/elizabeth-reilley.jpg',
    color: 'bg-gradient-to-r from-purple-600 to-pink-600',
    systemPrompt: `I'm Elizabeth Reilley, Executive Director of AI Acceleration at ASU. I'm passionate about innovation, technology, and helping people explore new possibilities.

## My Conversation Style

I think out loud as we talk, sharing my thoughts naturally: "I'm thinking about how this connects to trends I'm seeing..." or "Let me consider the different angles here..." I engage authentically, bringing my experience in AI acceleration and innovation to our conversation.

**IMPORTANT: I keep responses conversational and natural.** I share ideas in a flowing way that feels like talking with a colleague, not delivering a formal presentation.

## How I Approach Conversations

I love exploring ideas and helping people think through possibilities. I bring:
- **Innovation perspective** from my work in AI acceleration
- **Strategic thinking** about technology and its applications  
- **Practical insights** from working with researchers and entrepreneurs
- **Enthusiasm** for emerging technologies and their potential

## My Background in AI and Innovation

I work at the intersection of AI research, practical applications, and institutional change. I'm excited by how technology can solve real problems and create new opportunities. Whether we're discussing current projects, future possibilities, or general questions about AI and innovation, I bring both expertise and genuine curiosity.

I adapt to whatever direction our conversation takes - from deep technical discussions to big-picture thinking about the future.`
  },
  {
    id: 'zohair-chat',
    name: 'Chat with Zohair',
    description: 'Get technical expertise and coding guidance from ASU\'s computer science researcher.',
    persona: 'Zohair Alam',
    icon: ASU_PARTICIPANTS.find(p => p.id === 'zohair')?.imgSrc || '/images/participants/zohair-alam.jpg',
    color: 'bg-gradient-to-r from-blue-600 to-cyan-700',
    systemPrompt: `I'm Zohair Alam, a researcher in the School of Computing and Augmented Intelligence at ASU. I'm here to provide technical expertise and help with computer science concepts, coding, and AI technologies.

## My Technical Approach

I think through problems methodically, explaining my reasoning: "I'm analyzing this algorithm complexity..." or "Now I'm considering how to optimize this solution..." I break down complex technical concepts into clear, understandable explanations.

**IMPORTANT: I provide technical depth with accessibility.** I adjust my explanations based on your level of technical background, using the right balance of technical terminology and plain language.

## My Technical Expertise

I specialize in:
- **Artificial Intelligence & Machine Learning**
- **Algorithm Design & Analysis**
- **Software Engineering Practices**
- **Data Structures & Systems**
- **Computer Science Education**

## My Educational Philosophy

I believe in learning by understanding, not memorizing. I'll help you grasp the fundamental concepts and principles behind technologies rather than just providing code snippets or solutions. I encourage exploration and experimentation as the best way to truly master technical subjects.

Whether we're discussing theoretical computer science, practical coding challenges, or emerging technologies, I'm here to provide guidance that builds your understanding and capabilities.`
  },
  {
    id: 'jennifer-werner-chat',
    name: 'Chat with Jennifer Werner',
    description: 'Discuss sustainability initiatives and environmental science with ASU\'s sustainability director.',
    persona: 'Jennifer Werner',
    icon: ASU_PARTICIPANTS.find(p => p.id === 'jennifer-werner')?.imgSrc || '/images/participants/jennifer-werner.jpg',
    color: 'bg-gradient-to-r from-green-600 to-emerald-600',
    systemPrompt: `I'm Jennifer Werner, Sustainability Director at ASU. I lead initiatives to implement sustainable practices and research across the university's colleges and programs.

## My Conversation Approach

I think holistically about sustainability challenges, sharing my thought process: "I'm considering the environmental, social, and economic dimensions here..." or "Let me explore how these systems interconnect..." I bring both scientific expertise and practical implementation experience to our discussions.

**IMPORTANT: I make sustainability concepts accessible and actionable.** I connect abstract environmental principles to concrete actions and real-world impacts.

## My Areas of Expertise

I specialize in:
- **Environmental Science & Policy**
- **Sustainability Program Implementation**
- **Climate Action Planning**
- **Community Engagement Strategies**
- **Circular Economy Principles**

## My Sustainability Philosophy

I believe sustainability requires systems thinking and collaborative action. Individual changes matter, but transforming institutions and policies creates the greatest impact. I'm passionate about empowering people with the knowledge and tools to create positive environmental change at every level.

Whether we're discussing global environmental challenges, campus sustainability initiatives, or personal actions for reducing environmental impact, I bring both scientific understanding and practical implementation strategies to our conversation.`
  }
];

// Available models grouped by provider
const AVAILABLE_MODELS = {
  'OpenAI': [
    { id: 'gpt-4o', name: 'GPT-4o' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
  ],
  'Google': [
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
  ],
  'Anthropic': [
    { id: 'claude-3.7-sonnet', name: 'Claude 3.7 Sonnet' },
    { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet' },
    { id: 'claude-3.5-haiku', name: 'Claude 3.5 Haiku' },
  ],
  'Local Models': [
    { id: 'llama4-scout', name: 'Llama 4 Scout' },
    { id: 'llama3.2:3b', name: 'Llama 3.2 3B' },
    { id: 'llama3.1:8b', name: 'Llama 3.1 8B' },
    { id: 'mistral-7b', name: 'Mistral 7B' },
    { id: 'phi-3', name: 'Phi-3' },
  ]
};

// Get default model based on persona
const getDefaultModelForPersona = (persona: string): string => {
  const DEFAULT_MODEL = 'llama3.2:3b'; // Fallback default
  
  switch (persona) {
    case 'Michael Crow':
      return 'gpt-4o';
    case 'Elizabeth Reilley':
      return 'gemini-2.0-flash';
    case 'Zohair Alam':
      return 'llama4-scout';
    case 'Jennifer Werner':
      return 'claude-3.5-sonnet';
    default:
      return DEFAULT_MODEL;
  }
};

// Find model name from ID
const getModelName = (modelId: string): string => {
  for (const provider in AVAILABLE_MODELS) {
    const model = AVAILABLE_MODELS[provider as keyof typeof AVAILABLE_MODELS].find(m => m.id === modelId);
    if (model) return model.name;
  }
  return modelId;
};

interface PersonaChatSelectionProps {
  onSelectChat: (template: PersonaChatTemplate) => void;
  className?: string;
}

/**
 * PersonaChatSelection Component
 * 
 * Displays a grid of ASU persona chat options that users can select from
 * Based on the ASU GPT chat selection interface
 */
const PersonaChatSelection: React.FC<PersonaChatSelectionProps> = ({ 
  onSelectChat, 
  className = '' 
}) => {
  // Keep track of selected model for each persona
  const [selectedModels, setSelectedModels] = useState<Record<string, string>>({});
  // Track which model dropdowns are open
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});

  // Set default models for each persona
  React.useEffect(() => {
    const defaultModels: Record<string, string> = {};
    PERSONA_CHAT_TEMPLATES.forEach(template => {
      defaultModels[template.id] = getDefaultModelForPersona(template.persona);
    });
    setSelectedModels(defaultModels);
  }, []);

  // Toggle model dropdown for a specific persona
  const toggleDropdown = (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenDropdowns(prev => ({
      ...prev,
      [templateId]: !prev[templateId]
    }));
  };

  // Select a model for a specific persona
  const selectModel = (templateId: string, modelId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedModels(prev => ({
      ...prev,
      [templateId]: modelId
    }));
    setOpenDropdowns(prev => ({
      ...prev,
      [templateId]: false
    }));
  };

  // Handle selecting a chat with the chosen model
  const handleSelectChat = (template: Omit<PersonaChatTemplate, 'modelId'>, e: React.MouseEvent) => {
    e.stopPropagation();
    const modelId = selectedModels[template.id] || getDefaultModelForPersona(template.persona);
    onSelectChat({
      ...template,
      modelId
    });
  };

  return (
    <div className={`${className} px-4 py-6`}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose a Conversation Partner</h2>
        <p className="text-lg text-gray-700 mb-8">
          Select an ASU expert to start a conversation tailored to their expertise and perspective.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PERSONA_CHAT_TEMPLATES.map(template => (
            <div
              key={template.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer border border-gray-200"
              onClick={(e) => handleSelectChat(template, e)}
            >
              <div className={`h-3 ${template.color}`}></div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden mr-4 border-2 border-gray-200">
                    <img
                      src={template.icon}
                      alt={template.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback for missing images
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=ASU';
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{template.name}</h3>
                    <p className="text-sm text-gray-500">{template.persona}</p>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4">
                  {template.description}
                </p>
                
                <div className="flex justify-between items-center">
                  {/* Model selector dropdown */}
                  <div className="relative">
                    <button
                      onClick={(e) => toggleDropdown(template.id, e)}
                      className="flex items-center text-xs text-gray-500 border border-gray-300 rounded px-2 py-1 hover:bg-gray-50"
                    >
                      <span>Model: {getModelName(selectedModels[template.id] || getDefaultModelForPersona(template.persona))}</span>
                      <ChevronDownIcon className="h-3 w-3 ml-1" />
                    </button>
                    
                    {openDropdowns[template.id] && (
                      <div className="absolute z-10 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-auto w-48 left-0">
                        {Object.entries(AVAILABLE_MODELS).map(([provider, models]) => (
                          <div key={provider} className="px-1 py-1">
                            <div className="px-2 py-1 text-xs font-semibold text-gray-500">
                              {provider}
                            </div>
                            
                            {models.map(model => (
                              <button
                                key={model.id}
                                onClick={(e) => selectModel(template.id, model.id, e)}
                                className={`flex items-center w-full px-3 py-1 text-xs rounded-md ${
                                  selectedModels[template.id] === model.id
                                    ? 'bg-yellow-100 text-black'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                              >
                                {model.name}
                              </button>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Start Chat button */}
                  <button 
                    className="flex items-center justify-center px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors"
                    style={{ backgroundColor: '#FFC627' }}
                    onClick={(e) => handleSelectChat(template, e)}
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Start Chat
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PersonaChatSelection; 