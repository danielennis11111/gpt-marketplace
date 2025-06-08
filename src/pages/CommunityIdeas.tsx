import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HoneInChatbot } from '../components/HoneInChatbot';
import { 
  ArrowPathIcon, 
  LightBulbIcon, 
  MagnifyingGlassIcon, 
  DocumentDuplicateIcon, 
  HandThumbUpIcon,
  HandThumbDownIcon,
  ChatBubbleLeftRightIcon,
  BookmarkIcon,
  ChevronDownIcon,
  SparklesIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';

// Mock community ideas data
const MOCK_COMMUNITY_IDEAS = [
  {
    id: 'idea-001',
    title: 'Research Paper Analyzer',
    creator: {
      name: 'Dr. Sarah Chen',
      avatar: 'https://ui-avatars.com/api/?name=SC&background=random'
    },
    createdAt: '2023-11-15',
    idea: 'I want to create an AI assistant that can analyze scientific papers and summarize the key findings, methodologies, and implications. It should also be able to identify the most important citations and explain why they are significant.',
    aiConceptualization: `
Based on your idea, I recommend creating an AI assistant that can analyze data and provide insights.

This project could be implemented using GPT-4 with the following components:

1. Natural language understanding to interpret user requests
2. Data processing capabilities to handle structured information
3. A conversational interface for interactive sessions
4. API endpoints for integration with existing systems

The assistant would be configured to understand scientific terminology and provide structured summaries following academic standards.
    `,
    likes: 42,
    tags: ['research', 'summarization', 'scientific papers', 'academic'],
    isFeatured: true,
    comments: 12,
    saves: 28
  },
  {
    id: 'idea-002',
    title: 'AI Podcast Generator',
    creator: {
      name: 'Marcus Johnson',
      avatar: 'https://ui-avatars.com/api/?name=MJ&background=random'
    },
    createdAt: '2023-12-01',
    idea: 'I want to create an AI system that can generate podcast-like conversations between fictional experts on specific topics. Users can define the topic, the personas (including their backgrounds and perspectives), and listen to a natural-sounding discussion with Gemini voices.',
    aiConceptualization: `
Based on your idea, I recommend creating an AI assistant that can assist with generating creative content and ideas.

This project could be implemented using Claude 3 Opus with the following components:

1. Natural language understanding to interpret user requests
2. Creative content generation with customizable parameters
3. Text-to-speech integration using Gemini or similar technology
4. A user-friendly interface for direct interaction

The assistant would be configured to create realistic dialogue between multiple AI personas with distinct voices and conversational styles.
    `,
    likes: 78,
    tags: ['podcast', 'conversation', 'text-to-speech', 'creative'],
    isFeatured: true,
    comments: 23,
    saves: 46
  },
  {
    id: 'idea-003',
    title: 'Course Content Generator',
    creator: {
      name: 'Prof. James Wilson',
      avatar: 'https://ui-avatars.com/api/?name=JW&background=random'
    },
    createdAt: '2024-01-05',
    idea: 'I want to build an assistant that helps professors create course content including syllabi, lecture outlines, discussion questions, and assessments based on learning objectives. It should follow educational best practices and be adaptable to different disciplines.',
    aiConceptualization: `
Based on your idea, I recommend creating an AI assistant that can assist with generating creative content and ideas.

This project could be implemented using GPT-4 with the following components:

1. Natural language understanding to interpret user requests
2. Creative content generation with customizable parameters
3. A conversational interface for interactive sessions
4. A user-friendly interface for direct interaction

The assistant would be configured to understand educational frameworks, learning taxonomies, and discipline-specific terminology to generate high-quality educational materials.
    `,
    likes: 65,
    tags: ['education', 'course development', 'syllabus', 'academic'],
    isFeatured: false,
    comments: 19,
    saves: 37
  },
  {
    id: 'idea-004',
    title: 'Data Visualization Assistant',
    creator: {
      name: 'Alex Rivera',
      avatar: 'https://ui-avatars.com/api/?name=AR&background=random'
    },
    createdAt: '2024-01-20',
    idea: 'I want to create an AI tool that recommends the most appropriate data visualization methods based on the data provided and the story the user wants to tell. It should generate code for implementation in popular libraries like matplotlib, ggplot, or D3.js.',
    aiConceptualization: `
Based on your idea, I recommend creating an AI assistant that can analyze data and provide insights.

This project could be implemented using Claude 3 Sonnet with the following components:

1. Natural language understanding to interpret user requests
2. Data processing capabilities to handle structured information
3. A conversational interface for interactive sessions
4. Code generation capabilities for visualization libraries

The assistant would be configured to understand data visualization best practices and generate appropriate code based on data characteristics and user goals.
    `,
    likes: 53,
    tags: ['data visualization', 'coding', 'analytics', 'matplotlib', 'd3.js'],
    isFeatured: false,
    comments: 15,
    saves: 31
  },
  {
    id: 'idea-005',
    title: 'AI Study Buddy',
    creator: {
      name: 'Emma Thompson',
      avatar: 'https://ui-avatars.com/api/?name=ET&background=random'
    },
    createdAt: '2024-02-08',
    idea: 'I want to create an AI study companion that helps students learn by using the Socratic method and spaced repetition. It should be able to ask questions about the material, provide hints when needed, and adapt to the student\'s learning pace.',
    aiConceptualization: `
Based on your idea, I recommend creating an AI assistant that can assist with generating creative content and ideas.

This project could be implemented using Gemini Pro with the following components:

1. Natural language understanding to interpret user requests
2. Creative content generation with customizable parameters
3. A conversational interface for interactive sessions
4. A user-friendly interface for direct interaction

The assistant would be configured to use pedagogical techniques like Socratic questioning and implement spaced repetition algorithms to optimize learning.
    `,
    likes: 87,
    tags: ['education', 'learning', 'Socratic method', 'spaced repetition'],
    isFeatured: true,
    comments: 27,
    saves: 59
  }
];

// Filter options
const CATEGORIES = [
  'All Categories',
  'Education',
  'Research',
  'Data Analysis',
  'Creative',
  'Productivity',
  'Development',
  'Other'
];

const SORT_OPTIONS = [
  { label: 'Most Popular', value: 'popular' },
  { label: 'Newest', value: 'newest' },
  { label: 'Most Saved', value: 'saved' }
];

const CommunityIdeas: React.FC = () => {
  const [ideas, setIdeas] = useState(MOCK_COMMUNITY_IDEAS);
  const [filteredIdeas, setFilteredIdeas] = useState(MOCK_COMMUNITY_IDEAS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('popular');
  const [expandedIdeas, setExpandedIdeas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [honeInChatbot, setHoneInChatbot] = useState<{
    isOpen: boolean;
    idea: any | null;
  }>({ isOpen: false, idea: null });

  // Load ideas from Prompt Guide
  useEffect(() => {
    const promptGuideIdeas = JSON.parse(localStorage.getItem('communityIdeas') || '[]');
    if (promptGuideIdeas.length > 0) {
      // Convert prompt guide format to community ideas format
      const convertedIdeas = promptGuideIdeas.map((idea: any) => ({
        id: idea.id,
        title: idea.title,
        creator: {
          name: 'Community Member',
          avatar: 'https://ui-avatars.com/api/?name=CM&background=random'
        },
        createdAt: new Date(idea.timestamp).toISOString().split('T')[0],
        idea: idea.description,
        aiConceptualization: `Generated AI Prompt:\n\n${idea.prompt}`,
        likes: 0,
        tags: [idea.category.toLowerCase(), idea.difficulty],
        isFeatured: false,
        comments: 0,
        saves: 0,
        isFromPromptGuide: true,
        difficulty: idea.difficulty,
        originalPrompt: idea.prompt
      }));
      
      setIdeas([...convertedIdeas, ...MOCK_COMMUNITY_IDEAS]);
      setFilteredIdeas([...convertedIdeas, ...MOCK_COMMUNITY_IDEAS]);
    }
  }, []);
  
  // Toggle idea expansion
  const toggleIdeaExpansion = (ideaId: string) => {
    if (expandedIdeas.includes(ideaId)) {
      setExpandedIdeas(expandedIdeas.filter(id => id !== ideaId));
    } else {
      setExpandedIdeas([...expandedIdeas, ideaId]);
    }
  };
  
  // Filter and sort ideas
  useEffect(() => {
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      let filtered = [...ideas];
      
      // Apply search filter
      if (searchTerm) {
        filtered = filtered.filter(idea => 
          idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          idea.idea.toLowerCase().includes(searchTerm.toLowerCase()) ||
          idea.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }
      
      // Apply category filter
      if (selectedCategory !== 'All Categories') {
        filtered = filtered.filter(idea => 
          idea.tags.some(tag => tag.toLowerCase().includes(selectedCategory.toLowerCase()))
        );
      }
      
      // Apply sorting
      switch (sortBy) {
        case 'popular':
          filtered.sort((a, b) => b.likes - a.likes);
          break;
        case 'newest':
          filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case 'saved':
          filtered.sort((a, b) => b.saves - a.saves);
          break;
        default:
          break;
      }
      
      setFilteredIdeas(filtered);
      setLoading(false);
    }, 300);
  }, [searchTerm, selectedCategory, sortBy, ideas]);

  // Like an idea (simplified for demo)
  const handleLikeIdea = (ideaId: string) => {
    setIdeas(ideas.map(idea => {
      if (idea.id === ideaId) {
        return { ...idea, likes: idea.likes + 1 };
      }
      return idea;
    }));
  };
  
  // Save an idea (simplified for demo)
  const handleSaveIdea = (ideaId: string) => {
    setIdeas(ideas.map(idea => {
      if (idea.id === ideaId) {
        return { ...idea, saves: idea.saves + 1 };
      }
      return idea;
    }));
  };
  
  // Clone an idea (simplified for demo)
  const handleCloneIdea = (ideaId: string) => {
    console.log(`Cloning idea ${ideaId}`);
    // In a real app, this would navigate to the create project page with the idea pre-filled
  };

  const handleHoneIn = (idea: any) => {
    setHoneInChatbot({
      isOpen: true,
      idea: {
        title: idea.title,
        description: idea.idea,
        aiConceptualization: idea.aiConceptualization
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Community Ideas</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            Discover AI prompts and project ideas created by the community. Use the Prompt Guide to generate new ideas or submit your own.
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/prompt-guide"
              className="inline-flex items-center px-6 py-3 bg-red-800 text-white rounded-lg font-medium hover:bg-red-900 transition-colors"
            >
              <SparklesIcon className="w-5 h-5 mr-2" />
              Create Idea with AI
            </Link>
            <button className="inline-flex items-center px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              <PlusIcon className="w-5 h-5 mr-2" />
              Submit Manual Idea
            </button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-8 border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-grow">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  placeholder="Search ideas, topics, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              
              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Ideas list */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <ArrowPathIcon className="w-8 h-8 text-amber-500 animate-spin" />
            </div>
          ) : filteredIdeas.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
              <LightBulbIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-medium text-gray-900 mb-2">No matching ideas found</h2>
              <p className="text-gray-600 mb-6">
                Try adjusting your search filters or share your own idea.
              </p>
              <Link
                to="/prompt-guide"
                className="inline-flex items-center px-6 py-3 bg-red-800 text-white rounded-lg font-medium hover:bg-red-900 transition-colors"
              >
                <SparklesIcon className="w-5 h-5 mr-2" />
                Create Idea with AI
              </Link>
            </div>
          ) : (
            filteredIdeas.map((idea) => (
              <div
                key={idea.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Idea header */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start">
                      <img
                        src={idea.creator.avatar}
                        alt={idea.creator.name}
                        className="w-10 h-10 rounded-full mr-4"
                      />
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 hover:text-amber-600 transition-colors">
                          {idea.title}
                        </h2>
                        <p className="text-sm text-gray-600">
                          By {idea.creator.name} • {new Date(idea.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {(idea as any).isFromPromptGuide && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <SparklesIcon className="w-3 h-3 mr-1" />
                          AI Generated
                        </span>
                      )}
                      {idea.isFeatured && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          <StarIcon className="w-3 h-3 mr-1" />
                          Featured
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4">
                    {idea.idea.length > 240 && !expandedIdeas.includes(idea.id)
                      ? `${idea.idea.substring(0, 240)}...`
                      : idea.idea}
                    {idea.idea.length > 240 && (
                      <button
                        onClick={() => toggleIdeaExpansion(idea.id)}
                        className="text-amber-600 hover:text-amber-700 font-medium ml-2"
                      >
                        {expandedIdeas.includes(idea.id) ? 'Show less' : 'Show more'}
                      </button>
                    )}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {idea.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-gray-500">
                    <button
                      onClick={() => handleLikeIdea(idea.id)}
                      className="flex items-center hover:text-amber-600 transition-colors"
                    >
                      <HandThumbUpIcon className="w-5 h-5 mr-1" />
                      <span>{idea.likes}</span>
                    </button>
                    <button className="flex items-center hover:text-amber-600 transition-colors">
                      <ChatBubbleLeftRightIcon className="w-5 h-5 mr-1" />
                      <span>{idea.comments}</span>
                    </button>
                    <button
                      onClick={() => handleSaveIdea(idea.id)}
                      className="flex items-center hover:text-amber-600 transition-colors"
                    >
                      <BookmarkIcon className="w-5 h-5 mr-1" />
                      <span>{idea.saves}</span>
                    </button>
                  </div>
                </div>
                
                {/* AI Conceptualization */}
                <div className="px-6 pt-4 pb-6 bg-amber-50 border-t border-amber-100">
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleIdeaExpansion(idea.id)}
                  >
                    <h3 className="font-medium text-amber-900">AI Conceptualization</h3>
                    <ChevronDownIcon 
                      className={`w-5 h-5 text-amber-700 transition-transform ${
                        expandedIdeas.includes(idea.id) ? 'transform rotate-180' : ''
                      }`} 
                    />
                  </div>
                  
                  {expandedIdeas.includes(idea.id) && (
                    <>
                      <p className="mt-3 text-amber-800 whitespace-pre-line">{idea.aiConceptualization}</p>
                      
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => handleHoneIn(idea)}
                          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-600 to-yellow-500 text-white rounded-lg hover:from-red-700 hover:to-yellow-600 transition-all transform hover:scale-105 shadow-lg"
                        >
                          <DocumentDuplicateIcon className="w-5 h-5 mr-2" />
                          Hone In
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Hone In Chatbot */}
      {honeInChatbot.idea && (
        <HoneInChatbot
          isOpen={honeInChatbot.isOpen}
          onClose={() => setHoneInChatbot({ isOpen: false, idea: null })}
          initialIdea={honeInChatbot.idea}
        />
      )}
    </div>
  );
};

export default CommunityIdeas; 