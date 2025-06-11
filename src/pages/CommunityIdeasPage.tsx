import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CalendarIcon, 
  HeartIcon, 
  ChatBubbleLeftIcon, 
  BookmarkIcon,
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  Squares2X2Icon,
  ListBulletIcon
} from '@heroicons/react/24/outline';
import IdeaExportDialog from '../components/IdeaExportDialog';

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
  const [sortBy, setSortBy] = useState('newest');
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const navigate = useNavigate();
  
  // Clear all community ideas for a fresh start
  const clearAllIdeas = () => {
    const confirmed = confirm('Are you sure you want to clear all community ideas? This action cannot be undone.');
    if (confirmed) {
      localStorage.removeItem('communityIdeas');
      setCommunityIdeas([]);
      alert('✅ All community ideas have been cleared!');
    }
  };
  
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

  // Render single idea in list format
  const renderIdeaListItem = (idea: CommunityIdea) => {
    const isNew = isRecentlyAdded(idea);
    const isPopular = (idea.likes && idea.likes >= 3) || (idea.popularity && idea.popularity >= 5);
    
    // Handle click on idea
    const handleIdeaClick = () => {
      trackUserActivity('viewed', idea.id);
      navigate(`/community-ideas/${idea.id}`);
    };
    
    const isFromPromptGuide = idea.isFromPromptGuide === true;
    
    const getShortDescription = () => {
      if (!idea.prompt && !idea.aiSystemInstructions) return idea.description || "No description available";
      
      const sourceText = idea.aiSystemInstructions || idea.prompt || "";
      const firstParagraph = sourceText.split('\n\n')[0];
      if (firstParagraph && firstParagraph.length > 20 && firstParagraph.length < 300) {
        return firstParagraph;
      }
      
      const sentences = sourceText.split(/[.!?]+/);
      for (const sentence of sentences) {
        if (sentence.trim().length > 20 && sentence.trim().length < 300) {
          return sentence.trim();
        }
      }
      
      return sourceText.substring(0, 200) + (sourceText.length > 200 ? '...' : '');
    };
    
    const getCleanTitle = () => {
      if (!idea.title) return "Untitled Idea";
      return idea.title.replace(/\s*\[\d+\]$/, '').trim();
    };
    
    return (
      <div
        key={idea.id}
        className="bg-white border rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
        onClick={handleIdeaClick}
      >
        <div className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-semibold text-gray-900">{getCleanTitle()}</h3>
                <div className="flex space-x-2">
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
              
              <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">{getShortDescription()}</p>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <CalendarIcon className="w-4 h-4 mr-1" />
                  <span>{idea.createdAt || "Recently added"}</span>
                  {idea.category && (
                    <span className="ml-4 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {idea.category}
                    </span>
                  )}
                </div>
                <div className="flex space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <HeartIcon className="w-4 h-4 mr-1" />
                    <span>{idea.likes || 0}</span>
                  </div>
                  <div className="flex items-center">
                    <ChatBubbleLeftIcon className="w-4 h-4 mr-1" />
                    <span>{idea.comments || 0}</span>
                  </div>
                  <div className="flex items-center">
                    <BookmarkIcon className="w-4 h-4 mr-1" />
                    <span>{idea.saves || 0}</span>
                  </div>
                </div>
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
  
  // Filter and sort ideas based on search query and category
  const filteredIdeas = communityIdeas
    .filter(idea => {
      const matchesSearch = !searchQuery || 
        (idea.title && idea.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (idea.description && idea.description.toLowerCase().includes(searchQuery.toLowerCase()));
        
      const matchesCategory = selectedCategory === 'All' || 
        (idea.category && idea.category === selectedCategory);
        
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          // Sort by newest first (most recent timestamp)
          const dateA = new Date(a.timestamp || a.createdAt || 0);
          const dateB = new Date(b.timestamp || b.createdAt || 0);
          return dateB.getTime() - dateA.getTime();
        case 'popular':
          // Sort by most liked
          return (b.likes || 0) - (a.likes || 0);
        case 'mostSaved':
          // Sort by most saved
          return (b.saves || 0) - (a.saves || 0);
        case 'alphabetical':
          // Sort alphabetically by title
          return (a.title || '').localeCompare(b.title || '');
        default:
          // Default to newest
          const defaultDateA = new Date(a.timestamp || a.createdAt || 0);
          const defaultDateB = new Date(b.timestamp || b.createdAt || 0);
          return defaultDateB.getTime() - defaultDateA.getTime();
      }
    });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header with Export Button */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Community Ideas</h1>
        <div className="flex items-center space-x-3">
          {communityIdeas.length > 0 && (
            <>
              <button
                onClick={clearAllIdeas}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowExportDialog(true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                Export All Ideas
              </button>
            </>
          )}
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search ideas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label htmlFor="sortBy" className="text-sm font-medium text-gray-700">
                Sort by:
              </label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="popular">Most Liked</option>
                <option value="mostSaved">Most Saved</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
            </div>
            
            <div className="text-sm text-gray-500">
              {filteredIdeas.length} {filteredIdeas.length === 1 ? 'idea' : 'ideas'} found
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Grid View"
            >
              <Squares2X2Icon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="List View"
            >
              <ListBulletIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Ideas Display */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading ideas...</p>
        </div>
      ) : filteredIdeas.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No ideas found. Create your first idea in the Launch Pad!</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIdeas.map(idea => renderIdeaCard(idea))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredIdeas.map(idea => renderIdeaListItem(idea))}
        </div>
      )}

      {/* Export Dialog */}
      <IdeaExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        allIdeas={communityIdeas}
      />
    </div>
  );
} 