import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CalendarIcon, 
  HeartIcon, 
  ChatBubbleLeftIcon, 
  BookmarkIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

// Types for community ideas
interface CommunityIdea {
  id: string;
  title: string;
  description?: string;
  prompt?: string;
  aiSystemInstructions?: string;
  createdAt?: string;
  timestamp?: string;
  likes?: number;
  comments?: number;
  saves?: number;
  popularity?: number;
  isFromPromptGuide?: boolean;
  hasAIResult?: boolean;
  category?: string;
}

// CommunityIdeasPage component
export default function CommunityIdeasPage() {
  const [communityIdeas, setCommunityIdeas] = useState<CommunityIdea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const navigate = useNavigate();
  
  // Check if an idea was recently added (within last 48 hours)
  const isRecentlyAdded = (idea: CommunityIdea) => {
    if (!idea.timestamp) return false;
    const ideaDate = new Date(idea.timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - ideaDate.getTime());
    const diffHours = diffTime / (1000 * 60 * 60);
    return diffHours < 48;
  };
  
  // Track user activity (views, likes, etc.)
  const trackUserActivity = (action: string, ideaId: string) => {
    // Get user activity from localStorage
    const userActivity = JSON.parse(localStorage.getItem('userActivity') || '{"viewed":[],"liked":[],"saved":[],"contributed":[]}');
    
    // Add the idea to the appropriate list if not already there
    if (!userActivity[action]?.includes(ideaId)) {
      userActivity[action] = [...(userActivity[action] || []), ideaId];
      localStorage.setItem('userActivity', JSON.stringify(userActivity));
    }
  };

  // Format the prompt for display, handling markdown and special formats
  const formatPromptForDisplay = (prompt: string) => {
    if (!prompt) return '';
    
    // Replace markdown headers with styled elements
    let formattedPrompt = prompt
      .replace(/^## (.*$)/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^# (.*$)/gm, '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>')
      // Replace bullet points
      .replace(/^\* (.*$)/gm, '<li class="ml-4">• $1</li>')
      .replace(/^- (.*$)/gm, '<li class="ml-4">• $1</li>')
      // Replace numbered lists
      .replace(/^\d\. (.*$)/gm, '<li class="ml-4 list-decimal">$1</li>')
      // Replace double line breaks with paragraphs
      .replace(/\n\n/g, '</p><p class="my-2">')
      // Add basic paragraph if not already wrapped
      .replace(/^([^<].*)/gm, '<p class="my-2">$1</p>');
    
    return formattedPrompt;
  };

  // Render single idea card
  const renderIdeaCard = (idea: CommunityIdea) => {
    const isNew = isRecentlyAdded(idea);
    const isPopular = (idea.likes && idea.likes >= 3) || (idea.popularity && idea.popularity >= 5);
    
    // Handle click on idea card
    const handleIdeaClick = () => {
      // Track that the user viewed this idea
      trackUserActivity('viewed', idea.id);
      navigate(`/community-ideas/${idea.id}`);
    };
    
    // Determine if it's from the Prompt Guide
    const isFromPromptGuide = idea.isFromPromptGuide === true;
    
    // Extract a short description from the prompt/system instructions
    const getShortDescription = () => {
      if (!idea.prompt && !idea.aiSystemInstructions) return idea.description || "No description available";
      
      const sourceText = idea.aiSystemInstructions || idea.prompt || "";
      
      // First paragraph approach - get first coherent paragraph
      const firstParagraph = sourceText.split('\n\n')[0];
      if (firstParagraph && firstParagraph.length > 20 && firstParagraph.length < 200) {
        return firstParagraph;
      }
      
      // Try to get the first sentence that's a reasonable length
      const sentences = sourceText.split(/[.!?]+/);
      for (const sentence of sentences) {
        if (sentence.trim().length > 20 && sentence.trim().length < 200) {
          return sentence.trim();
        }
      }
      
      // Fallback to truncated text
      return sourceText.substring(0, 150) + (sourceText.length > 150 ? '...' : '');
    };
    
    // Get a cleaner title without timestamp markers
    const getCleanTitle = () => {
      if (!idea.title) return "Untitled Idea";
      return idea.title.replace(/\s*\[\d+\]$/, '').trim();
    };
    
    return (
      <div
        key={idea.id}
        className="relative bg-white border rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
        onClick={handleIdeaClick}
      >
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-medium text-gray-900">{getCleanTitle()}</h3>
            <div className="flex space-x-1">
              {isNew && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  New
                </span>
              )}
              {isPopular && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                  Popular
                </span>
              )}
              {isFromPromptGuide && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  AI Generated
                </span>
              )}
            </div>
          </div>
          
          <p className="text-sm text-gray-600 line-clamp-3">{getShortDescription()}</p>
          
          <div className="mt-3 flex items-center text-xs text-gray-500 justify-between">
            <div className="flex items-center">
              <CalendarIcon className="w-3.5 h-3.5 mr-1" />
              <span>{idea.createdAt || "Recently added"}</span>
            </div>
            <div className="flex space-x-3">
              <div className="flex items-center">
                <HeartIcon className="w-3.5 h-3.5 mr-1" />
                <span>{idea.likes || 0}</span>
              </div>
              <div className="flex items-center">
                <ChatBubbleLeftIcon className="w-3.5 h-3.5 mr-1" />
                <span>{idea.comments || 0}</span>
              </div>
              <div className="flex items-center">
                <BookmarkIcon className="w-3.5 h-3.5 mr-1" />
                <span>{idea.saves || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Load community ideas on component mount
  useEffect(() => {
    // Load from localStorage
    const ideas = JSON.parse(localStorage.getItem('communityIdeas') || '[]');
    setCommunityIdeas(ideas);
    setIsLoading(false);
  }, []);
  
  // Filter ideas based on search query and category
  const filteredIdeas = communityIdeas.filter(idea => {
    const matchesSearch = !searchQuery || 
      (idea.title && idea.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (idea.description && idea.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesCategory = selectedCategory === 'All' || 
      (idea.category && idea.category === selectedCategory);
      
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Page content goes here */}
      <h1>Community Ideas</h1>
      {/* Render filtered ideas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {filteredIdeas.map(idea => renderIdeaCard(idea))}
      </div>
    </div>
  );
} 