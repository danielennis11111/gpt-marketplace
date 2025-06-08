import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LightBulbIcon,
  SparklesIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { useOllama } from '../hooks/useOllama';

interface PromptIdea {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timestamp: Date;
}

export const PromptGuidePage: React.FC = () => {
  const navigate = useNavigate();
  const { status, sendMessage } = useOllama();
  const [userIdea, setUserIdea] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<PromptIdea | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [existingIdeas, setExistingIdeas] = useState<PromptIdea[]>([]);
  const [duplicateFound, setDuplicateFound] = useState<PromptIdea | null>(null);

  // Simulate existing ideas (in real app, would fetch from API)
  React.useEffect(() => {
    const mockIdeas: PromptIdea[] = [
      {
        id: '1',
        title: 'Research Paper Summarizer',
        description: 'AI that can analyze academic papers and create concise summaries',
        prompt: 'You are a research assistant that specializes in summarizing academic papers...',
        category: 'Research',
        difficulty: 'intermediate',
        timestamp: new Date('2024-01-15')
      },
      {
        id: '2',
        title: 'Code Review Assistant',
        description: 'Help developers review code for best practices and bugs',
        prompt: 'You are an expert code reviewer with experience in multiple programming languages...',
        category: 'Development',
        difficulty: 'advanced',
        timestamp: new Date('2024-01-10')
      }
    ];
    setExistingIdeas(mockIdeas);
  }, []);

  const searchForDuplicates = (idea: string) => {
    const lowercaseIdea = idea.toLowerCase();
    const duplicate = existingIdeas.find(existing => 
      existing.title.toLowerCase().includes(lowercaseIdea) ||
      existing.description.toLowerCase().includes(lowercaseIdea) ||
      lowercaseIdea.includes(existing.title.toLowerCase())
    );
    
    setDuplicateFound(duplicate || null);
    return duplicate;
  };

  const generatePrompt = async () => {
    if (!userIdea.trim()) return;

    // First check for duplicates
    const duplicate = searchForDuplicates(userIdea);
    if (duplicate) {
      return;
    }

    setIsGenerating(true);
    
    try {
      let promptResponse = '';
      
      if (status.isConnected) {
        // Use local Ollama for prompt generation
        const promptGeneration = `You are an expert AI prompt engineer. Help create a detailed, effective prompt for this idea: "${userIdea}"

Please provide:
1. A clear title (max 5 words)
2. A brief description (1-2 sentences)
3. A complete, professional prompt that would work well with AI models
4. Suggest an appropriate category (Research, Development, Education, Productivity, etc.)
5. Difficulty level (beginner, intermediate, advanced)

Format your response exactly like this:
TITLE: [title]
DESCRIPTION: [description]
CATEGORY: [category]
DIFFICULTY: [difficulty]
PROMPT: [the complete prompt]`;

        promptResponse = await sendMessage(promptGeneration);
      } else {
        // Fallback simple generation
        const title = userIdea.split(' ').slice(0, 3).map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ') + ' Assistant';
        
        promptResponse = `TITLE: ${title}
DESCRIPTION: An AI assistant that helps with ${userIdea.toLowerCase()}
CATEGORY: Productivity
DIFFICULTY: beginner
PROMPT: You are a helpful AI assistant specialized in ${userIdea.toLowerCase()}. Your role is to provide clear, accurate, and actionable guidance to users. Always be thorough in your responses and ask clarifying questions when needed to better understand the user's specific requirements.`;
      }

      // Parse the response
      const lines = promptResponse.split('\n');
      const parsed = {
        title: lines.find(l => l.startsWith('TITLE:'))?.replace('TITLE:', '').trim() || 'AI Assistant',
        description: lines.find(l => l.startsWith('DESCRIPTION:'))?.replace('DESCRIPTION:', '').trim() || 'A helpful AI assistant',
        category: lines.find(l => l.startsWith('CATEGORY:'))?.replace('CATEGORY:', '').trim() || 'Productivity',
        difficulty: lines.find(l => l.startsWith('DIFFICULTY:'))?.replace('DIFFICULTY:', '').trim() as 'beginner' | 'intermediate' | 'advanced' || 'beginner',
        prompt: lines.find(l => l.startsWith('PROMPT:'))?.replace('PROMPT:', '').trim() || 'You are a helpful AI assistant.'
      };

      const newIdea: PromptIdea = {
        id: Date.now().toString(),
        title: parsed.title,
        description: parsed.description,
        prompt: parsed.prompt,
        category: parsed.category,
        difficulty: parsed.difficulty,
        timestamp: new Date()
      };

      setGeneratedPrompt(newIdea);
    } catch (error) {
      console.error('Error generating prompt:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const submitToCommunity = () => {
    if (!generatedPrompt) return;

    // Add to community ideas (in real app, would API call)
    const communityIdeas = JSON.parse(localStorage.getItem('communityIdeas') || '[]');
    localStorage.setItem('communityIdeas', JSON.stringify([generatedPrompt, ...communityIdeas]));

    // Navigate to community ideas page
    navigate('/community-ideas');
  };

  const filteredExistingIdeas = existingIdeas.filter(idea =>
    idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    idea.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <LightBulbIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">AI Prompt Guide</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Describe your idea and let AI help you craft the perfect prompt for your needs
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Prompt Generation */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                <SparklesIcon className="w-5 h-5 inline mr-2" />
                Generate Your Prompt
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What do you want to accomplish?
                  </label>
                  <textarea
                    value={userIdea}
                    onChange={(e) => {
                      setUserIdea(e.target.value);
                      setDuplicateFound(null);
                      setGeneratedPrompt(null);
                    }}
                    rows={4}
                    placeholder="e.g., I want an AI that can analyze customer feedback and suggest improvements..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                {/* AI Status */}
                <div className={`p-3 rounded-lg text-sm ${
                  status.isConnected 
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                }`}>
                  {status.isConnected ? (
                    <>✅ Using local AI ({status.currentModel}) for enhanced prompt generation</>
                  ) : (
                    <>⚡ Using basic prompt generation - set up Ollama for better results</>
                  )}
                </div>

                {/* Duplicate Warning */}
                {duplicateFound && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start">
                      <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-amber-800 font-medium">Similar idea found!</p>
                        <p className="text-amber-700 text-sm mt-1">
                          "{duplicateFound.title}" - {duplicateFound.description}
                        </p>
                        <button
                          onClick={() => navigate('/community-ideas')}
                          className="text-amber-600 hover:text-amber-800 text-sm underline mt-2"
                        >
                          View existing idea →
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={generatePrompt}
                  disabled={!userIdea.trim() || isGenerating || !!duplicateFound}
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    !userIdea.trim() || isGenerating || duplicateFound
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-red-800 text-white hover:bg-red-900'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <SparklesIcon className="w-5 h-5 inline mr-2 animate-pulse" />
                      Generating Prompt...
                    </>
                  ) : (
                    'Generate AI Prompt'
                  )}
                </button>
              </div>
            </div>

            {/* Generated Prompt */}
            {generatedPrompt && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Generated Prompt</h3>
                  <CheckCircleIcon className="w-6 h-6 text-green-500" />
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Title</p>
                    <p className="text-gray-900">{generatedPrompt.title}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700">Description</p>
                    <p className="text-gray-600">{generatedPrompt.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Category</p>
                      <p className="text-gray-600">{generatedPrompt.category}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Difficulty</p>
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        generatedPrompt.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                        generatedPrompt.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {generatedPrompt.difficulty}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">AI Prompt</p>
                    <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-800 whitespace-pre-wrap">
                      {generatedPrompt.prompt}
                    </div>
                  </div>

                  <button
                    onClick={submitToCommunity}
                    className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    Share with Community
                    <ArrowRightIcon className="w-4 h-4 inline ml-2" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Existing Ideas */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Existing Community Ideas
              </h2>

              <div className="mb-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search existing ideas..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredExistingIdeas.map((idea) => (
                  <div key={idea.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <h4 className="font-medium text-gray-900">{idea.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{idea.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">{idea.category}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        idea.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                        idea.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {idea.difficulty}
                      </span>
                    </div>
                  </div>
                ))}
                
                {filteredExistingIdeas.length === 0 && searchQuery && (
                  <p className="text-gray-500 text-center py-4">No matching ideas found</p>
                )}
              </div>

              <button
                onClick={() => navigate('/community-ideas')}
                className="w-full mt-4 py-2 text-red-600 hover:text-red-800 font-medium transition-colors"
              >
                View All Community Ideas →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 