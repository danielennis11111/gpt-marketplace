import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  HeartIcon,
  ShareIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  TagIcon,
  UserIcon,
  SparklesIcon,
  ClipboardDocumentIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { HoneInChatbot } from '../components/HoneInChatbot';
import IdeaExportDialog from '../components/IdeaExportDialog';

interface CommunityIdea {
  id: string;
  title: string;
  description: string;
  prompt?: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timestamp: string;
  lastSuggested?: string;
  likes: number;
  popularity: number;
  isFromPromptGuide?: boolean;
  hasAIResult?: boolean;
  aiSystemInstructions?: string;
}

export const CommunityIdeaDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [idea, setIdea] = useState<CommunityIdea | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [showChatbot, setShowChatbot] = useState(true);
  const [showSystemInstructions, setShowSystemInstructions] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

  useEffect(() => {
    // Load the specific idea from localStorage
    const communityIdeas = JSON.parse(localStorage.getItem('communityIdeas') || '[]');
    const foundIdea = communityIdeas.find((idea: CommunityIdea) => idea.id === id);
    
    if (foundIdea) {
      setIdea(foundIdea);
      // Check if user has already liked this idea
      const likedIdeas = JSON.parse(localStorage.getItem('likedIdeas') || '[]');
      setIsLiked(likedIdeas.includes(id));
      
      // Record this view in the user's contribution history
      const userContributions = JSON.parse(localStorage.getItem('userContributions') || '[]');
      if (!userContributions.some((contribution: any) => contribution.id === id)) {
        const newContribution = {
          id: foundIdea.id,
          type: 'viewed',
          timestamp: new Date().toISOString(),
          title: foundIdea.title
        };
        localStorage.setItem('userContributions', JSON.stringify([newContribution, ...userContributions]));
      }
      
      // Auto-open chatbot if coming from prompt guide (new ideas)
      if (foundIdea.isFromPromptGuide && foundIdea.id.startsWith('prompt-')) {
        setShowChatbot(true);
      }
    }
  }, [id]);

  const handleLike = () => {
    if (!idea) return;

    const communityIdeas = JSON.parse(localStorage.getItem('communityIdeas') || '[]');
    const likedIdeas = JSON.parse(localStorage.getItem('likedIdeas') || '[]');
    
    const updatedIdeas = communityIdeas.map((communityIdea: CommunityIdea) => {
      if (communityIdea.id === id) {
        if (isLiked) {
          // Unlike
          communityIdea.likes = Math.max(0, communityIdea.likes - 1);
        } else {
          // Like
          communityIdea.likes += 1;
        }
        return communityIdea;
      }
      return communityIdea;
    });

    // Update liked ideas
    let updatedLikedIdeas;
    if (isLiked) {
      updatedLikedIdeas = likedIdeas.filter((ideaId: string) => ideaId !== id);
    } else {
      updatedLikedIdeas = [...likedIdeas, id];
    }

    localStorage.setItem('communityIdeas', JSON.stringify(updatedIdeas));
    localStorage.setItem('likedIdeas', JSON.stringify(updatedLikedIdeas));
    
    setIdea(updatedIdeas.find((i: CommunityIdea) => i.id === id));
    setIsLiked(!isLiked);
  };

  const copySystemInstructions = () => {
    if (idea?.aiSystemInstructions) {
      navigator.clipboard.writeText(idea.aiSystemInstructions);
      alert('System instructions copied to clipboard!');
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  if (!idea) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Idea Not Found</h2>
          <p className="text-gray-600 mb-4">The community idea you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/community-ideas')}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Community Ideas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/community-ideas')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Community Ideas
          </button>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{idea.title}</h1>
                <p className="text-lg text-gray-600 mb-4">{idea.description}</p>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <TagIcon className="w-4 h-4 mr-1" />
                    {idea.category}
                  </div>
                  <div className="flex items-center">
                    <SparklesIcon className="w-4 h-4 mr-1" />
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      idea.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                      idea.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {idea.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-1" />
                    {new Date(idea.timestamp).toLocaleDateString()}
                  </div>
                  {idea.isFromPromptGuide && (
                    <div className="flex items-center">
                      <UserIcon className="w-4 h-4 mr-1" />
                      AI Generated
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3 mt-4 md:mt-0">
                <button
                  onClick={handleLike}
                  className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                    isLiked 
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {isLiked ? (
                    <HeartIconSolid className="w-4 h-4 mr-1" />
                  ) : (
                    <HeartIcon className="w-4 h-4 mr-1" />
                  )}
                  {idea.likes}
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <ShareIcon className="w-4 h-4 mr-1" />
                  Share
                </button>

                <button
                  onClick={() => setShowExportDialog(true)}
                  className="flex items-center px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                >
                  <DocumentArrowDownIcon className="w-4 h-4 mr-1" />
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* System Instructions (if available) */}
        {idea.hasAIResult && idea.aiSystemInstructions && (
          <div className="mb-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">AI System Instructions</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={copySystemInstructions}
                    className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <ClipboardDocumentIcon className="w-4 h-4 mr-1" />
                    Copy Instructions
                  </button>
                  <button
                    onClick={() => setShowSystemInstructions(!showSystemInstructions)}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    {showSystemInstructions ? 'Hide' : 'Show'} Instructions
                  </button>
                </div>
              </div>

              {showSystemInstructions && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap max-h-64 overflow-y-auto">
                    {idea.aiSystemInstructions}
                  </pre>
                </div>
              )}

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 font-medium mb-2">Use this idea:</p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• <a href="https://platform-beta.aiml.asu.edu/" target="_blank" rel="noopener noreferrer" className="underline">Create a new AI project in MyAI Builder</a></li>
                  <li>• Copy the system instructions above into your project setup</li>
                  <li>• Enable RAG Knowledge Base in Advanced Settings for document integration</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Chat Interface */}
        <div className="mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
                Hone In on This Idea
              </h2>
              <button
                onClick={() => setShowChatbot(!showChatbot)}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                {showChatbot ? 'Hide Chat' : 'Open Chat'}
              </button>
            </div>
            
            <p className="text-gray-600 mb-4">
              Use AI to refine this idea, explore features, implementation details, and next steps.
              Our AI will help you transform this idea into a comprehensive project plan.
            </p>
            
            {!showChatbot && (
              <button
                onClick={() => setShowChatbot(true)}
                className="w-full py-3 bg-gradient-to-r from-red-600 to-yellow-500 text-white rounded-lg font-medium hover:from-red-700 hover:to-yellow-600 transition-colors"
              >
                Start Honing In
              </button>
            )}
          </div>
        </div>

        {showChatbot && idea && (
          <HoneInChatbot 
            isOpen={showChatbot} 
            onClose={() => setShowChatbot(false)} 
            initialIdea={{
              title: idea.title,
              description: idea.description,
              aiConceptualization: idea.aiSystemInstructions || idea.prompt
            }} 
          />
        )}

        {/* Popularity Stats */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Community Stats</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-red-600">{idea.likes}</div>
              <div className="text-sm text-gray-500">Likes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{idea.popularity}</div>
              <div className="text-sm text-gray-500">Suggestions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {idea.lastSuggested ? Math.floor((Date.now() - new Date(idea.lastSuggested).getTime()) / (1000 * 60 * 60 * 24)) : 0}
              </div>
              <div className="text-sm text-gray-500">Days Since Last Suggested</div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Dialog */}
      <IdeaExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        idea={idea}
      />
    </div>
  );
}; 