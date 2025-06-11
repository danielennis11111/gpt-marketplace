import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LightBulbIcon,
  SparklesIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  RocketLaunchIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { useChatService } from '../hooks/useChatService';
import { generateSystemInstructionsPrompt } from '../utils/promptTemplates';
import { downloadInstructions } from '../utils/downloadHelper';
import DownloadPreview from '../components/DownloadPreview';

interface PromptIdea {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timestamp: Date;
}

export const LaunchPadPage: React.FC = () => {
  const navigate = useNavigate();
  const { sendMessage, isConnected, providerName } = useChatService();
  const [userIdea, setUserIdea] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<PromptIdea | null>(null);
  const [duplicateFound, setDuplicateFound] = useState<PromptIdea | null>(null);
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debug function to reset community ideas
  const resetCommunityIdeas = () => {
    if (confirm("Reset all community ideas? This will clear all existing ideas.")) {
      localStorage.setItem('communityIdeas', '[]');
      alert("Community ideas reset. The database is now empty.");
      console.log("Community ideas database reset");
    }
  };

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
  }, []);

  // Helper function to extract fields from text response
  const extractField = (text: string, fieldName: string): string | null => {
    const regex = new RegExp(`${fieldName}:(.*)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : null;
  };

  // Generate a better title using AI based on the user's full input
  const generateIdeaTitle = async (userIdea: string): Promise<string> => {
    try {
      if (!isConnected) {
        // Fallback to improved manual title generation
        const words = userIdea.trim().split(/\s+/);
        if (words.length <= 6) {
          return userIdea.charAt(0).toUpperCase() + userIdea.slice(1);
        }
        
        // Create a better title from first part
        const firstPart = words.slice(0, 6).join(' ');
        const capitalizedFirst = firstPart.charAt(0).toUpperCase() + firstPart.slice(1);
        
        // Add descriptive suffix based on keywords following AI tool patterns
        if (userIdea.toLowerCase().includes('analy')) return 'Analytics with AI';
        if (userIdea.toLowerCase().includes('website')) return 'Website AI Tool';
        if (userIdea.toLowerCase().includes('tutoring') || userIdea.toLowerCase().includes('tutor')) return 'Tutor AI';
        if (userIdea.toLowerCase().includes('music')) return 'Music with AI';
        if (userIdea.toLowerCase().includes('business')) return 'Business AI Tool';
        if (userIdea.toLowerCase().includes('code') || userIdea.toLowerCase().includes('coding')) return 'Code with AI';
        if (userIdea.toLowerCase().includes('writing') || userIdea.toLowerCase().includes('write')) return 'Writing AI Tool';
        if (userIdea.toLowerCase().includes('learning') || userIdea.toLowerCase().includes('learn')) return 'Learning with AI';
        if (userIdea.toLowerCase().includes('planning') || userIdea.toLowerCase().includes('plan')) return 'Planning AI Tool';
        
        return 'Smart AI Assistant';
      }

      const titlePrompt = `You are an expert at creating concise, descriptive titles for AI project ideas. Based on the user's idea below, generate a clear, professional title that follows the pattern of successful AI tools.

User's idea: "${userIdea}"

Requirements:
- Maximum 4 words
- Follow patterns like "X with AI", "AI Y Tool", "Smart X Assistant"
- Clear and descriptive
- Professional tone
- Focus on the core function or outcome
- Make it appealing to potential users

Examples:
- "I need help analyzing my website analytics" → "Analytics with AI"
- "I want a language tutor for Spanish" → "Spanish Tutor AI"
- "I need help with meal planning" → "Meal Planning AI"
- "I want help coding Python" → "Code with AI"
- "I need help writing essays" → "Writing Assistant AI"
- "I want to learn guitar" → "Guitar Learning AI"

Generate ONLY the title, no additional text:`;

      const titleResponse = await sendMessage(titlePrompt);
      const generatedTitle = titleResponse.trim().replace(/^["']|["']$/g, ''); // Remove quotes
      
      // Validate title isn't too long and has substance
      if (generatedTitle.length > 30 || generatedTitle.length < 5) {
        // Fallback to manual generation with AI patterns
        if (userIdea.toLowerCase().includes('analy')) return 'Analytics with AI';
        if (userIdea.toLowerCase().includes('website')) return 'Website AI Tool';
        if (userIdea.toLowerCase().includes('tutoring') || userIdea.toLowerCase().includes('tutor')) return 'Tutor AI';
        if (userIdea.toLowerCase().includes('music')) return 'Music with AI';
        if (userIdea.toLowerCase().includes('business')) return 'Business AI Tool';
        if (userIdea.toLowerCase().includes('code') || userIdea.toLowerCase().includes('coding')) return 'Code with AI';
        if (userIdea.toLowerCase().includes('writing') || userIdea.toLowerCase().includes('write')) return 'Writing AI Tool';
        return 'Smart AI Assistant';
      }
      
      return generatedTitle;
    } catch (error) {
      console.error('Error generating title:', error);
      // Fallback to improved manual title generation
      const words = userIdea.trim().split(/\s+/).slice(0, 5).join(' ');
      return words.charAt(0).toUpperCase() + words.slice(1) + ' Assistant';
    }
  };

  const generatePrompt = async () => {
    if (!userIdea.trim()) return;

    console.log("Starting prompt generation with idea:", userIdea);
    console.log("AI Connection Status:", isConnected);
    console.log("Provider:", providerName);

    // First check for existing community ideas - using very loose matching
    const existingCommunityIdeas = JSON.parse(localStorage.getItem('communityIdeas') || '[]');
    console.log("Existing community ideas count:", existingCommunityIdeas.length);
       
    // Almost always create a new idea by default
    // Only match if the idea is EXACTLY the same (exact title match, case insensitive)
    const similarCommunityIdea = existingCommunityIdeas.find((idea: any) => 
      idea.title.toLowerCase() === userIdea.toLowerCase()
    );

    if (similarCommunityIdea) {
      console.log("Found EXACT same idea:", similarCommunityIdea.title);
      const confirmRedirect = confirm(`We found an identical idea: "${similarCommunityIdea.title}". View it instead?`);
      if (confirmRedirect) {
        // Only navigate if user confirms
        navigate(`/community-ideas/${similarCommunityIdea.id}`);
        return;
      }
      // Otherwise continue with new idea generation
    }

    setIsGenerating(true);
       
    try {
      let promptResponse = '';
      
      try {
        // Use our specialized prompt template for high-quality system instructions
        const promptGeneration = generateSystemInstructionsPrompt(userIdea);
        
        console.log("Attempting to use AI service for generation");
        
        if (isConnected) {
          promptResponse = await sendMessage(promptGeneration);
          console.log("AI Response received:", promptResponse.substring(0, 100) + "...");
        } else {
          console.log("AI service not connected, throwing error instead of using fallback");
          throw new Error(`No AI services are configured. ${providerName}`);
        }
      } catch (error) {
        console.error('Error with AI generation:', error);
        const errorMessage = error instanceof Error ? error.message : 'AI service error';
        
        // Instead of fallback, show a proper error to the user
        if (errorMessage.includes('No AI services') || errorMessage.includes('not configured')) {
          alert('Please configure an AI service (Gemini, Llama, or Ollama) in Settings to generate prompts.');
        } else if (errorMessage.includes('API key')) {
          alert('API key issue detected. Please check your API key configuration in Settings.');
        } else if (errorMessage.includes('rate limit')) {
          alert('Rate limit exceeded. Please wait a moment and try again.');
        } else {
          alert(`Error generating prompt: ${errorMessage}`);
        }
        
        setIsGenerating(false);
        return;
      }

      // Parse the response
      console.log("Parsing prompt response");
      const lines = promptResponse.split('\n');
      
      // Generate a better title using AI instead of truncating user input
      console.log("Generating AI-powered title...");
      const aiGeneratedTitle = await generateIdeaTitle(userIdea);
      console.log("Generated title:", aiGeneratedTitle);
      
      const parsed = {
        title: aiGeneratedTitle, // Use AI-generated title instead of parsed response or truncated input
        description: lines.find(l => l.startsWith('DESCRIPTION:'))?.replace('DESCRIPTION:', '').trim() || `An AI assistant that helps with: ${userIdea}`,
        category: lines.find(l => l.startsWith('CATEGORY:'))?.replace('CATEGORY:', '').trim() || 'Productivity',
        difficulty: lines.find(l => l.startsWith('DIFFICULTY:'))?.replace('DIFFICULTY:', '').trim() as 'beginner' | 'intermediate' | 'advanced' || 'intermediate',
        prompt: lines.slice(lines.findIndex(l => l.startsWith('PROMPT:')) + 1).join('\n').trim() || 
                `You are a helpful AI assistant that specializes in: ${userIdea}`
      };
      
      console.log("Parsed response:", parsed);

      const newIdea: PromptIdea = {
        id: Date.now().toString(),
        title: parsed.title,
        description: parsed.description,
        prompt: parsed.prompt,
        category: parsed.category,
        difficulty: parsed.difficulty,
        timestamp: new Date()
      };
      
      console.log("New idea created:", newIdea);
      setGeneratedPrompt(newIdea);
      
      // Automatically add to community ideas
      addToCommunityAutomatically(newIdea);
    } catch (error) {
      console.error('Error generating prompt:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to generate prompt: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Automatically add idea to community when generated
  const addToCommunityAutomatically = (prompt: PromptIdea) => {
    const existingIdeas = JSON.parse(localStorage.getItem('communityIdeas') || '[]');
    
    // Check if this exact idea already exists
    const existingIdea = existingIdeas.find((idea: any) => idea.id === prompt.id);
    if (existingIdea) {
      console.log("Idea already exists in community:", prompt.id);
      return;
    }

    // Create properly formatted community idea
    const communityIdea = {
      id: prompt.id,
      title: prompt.title,
      description: prompt.description,
      category: prompt.category,
      difficulty: prompt.difficulty,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric', 
        year: 'numeric'
      }),
      likes: 0,
      comments: 0,
      saves: 0,
      popularity: 1,
      isFromPromptGuide: false,
      isFromLaunchPad: true,
      hasAIResult: true,
      aiSystemInstructions: prompt.prompt,
      prompt: prompt.prompt
    };

    // Add to beginning of array (newest first)
    const updatedIdeas = [communityIdea, ...existingIdeas];
    localStorage.setItem('communityIdeas', JSON.stringify(updatedIdeas));
    
    console.log('Automatically added idea to community:', communityIdea.title);
  };

  const submitToCommunity = () => {
    if (!generatedPrompt) return;

    // Get existing community ideas with popularity tracking
    const existingIdeas = JSON.parse(localStorage.getItem('communityIdeas') || '[]');
    
    // Check if idea EXACTLY matches an existing one - very strict matching
    const similarIdea = existingIdeas.find((idea: any) => {
      // Only match if it's the exact same title (ignoring timestamps in brackets)
      const ideaTitle = idea.title.toLowerCase().replace(/\s*\[\d+\]$/, '').trim();
      const promptTitle = generatedPrompt.title.toLowerCase().replace(/\s*\[\d+\]$/, '').trim();
      
      // Exact match only
      return ideaTitle === promptTitle;
    });

    if (similarIdea) {
      // Ask user if they want to create a new idea anyway
      const createNewAnyway = confirm(`This exact idea already exists as "${similarIdea.title}". Create a new copy anyway?`);
      
      if (createNewAnyway) {
        // User wants to create a new copy - continue with creation
        console.log("Creating duplicate idea at user request");
      } else {
        // User doesn't want a duplicate - just show the existing one
        setDuplicateFound(similarIdea);
        return;
      }
    }

    // Navigate to the community ideas page or the specific idea
    navigate(`/community-ideas/${generatedPrompt.id}`);
  };

  const honeInOnIdea = () => {
    if (!generatedPrompt) return;
    navigate('/asugpt', { 
      state: { 
        initialPrompt: generatedPrompt.prompt,
        initialUserPrompt: `I want to talk about: ${userIdea}`
      } 
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await sendMessage(prompt);
    setResponse(result);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <RocketLaunchIcon className="h-12 w-12 text-indigo-600 mx-auto mb-3" />
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Launch Pad
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Your starting point for AI-powered experiences. Describe your idea and get started instantly.
          </p>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            {!generatedPrompt ? (
              <div className="space-y-8">
                <div>
                  <label htmlFor="idea" className="block text-lg font-medium text-gray-700">
                    <div className="flex items-center">
                      <LightBulbIcon className="h-5 w-5 text-yellow-500 mr-2" />
                      <span>Describe your AI project idea</span>
                    </div>
                  </label>
                  <p className="mt-1 text-sm text-gray-500">
                    Enter a clear description of what you want your AI assistant to do.
                  </p>
                  <div className="mt-3">
                    <textarea
                      id="idea"
                      name="idea"
                      rows={3}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md p-6"
                      placeholder="Example: I want to create an AI music app"
                      value={userIdea}
                      onChange={(e) => setUserIdea(e.target.value)}
                      disabled={isGenerating}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <div className="flex items-start">
                      <SparklesIcon className="h-5 w-5 text-indigo-600 mr-2 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-indigo-900">Creative</h3>
                        <p className="text-sm text-indigo-700">
                          "I need an AI that generates personalized book recommendations"
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-start">
                      <ChatBubbleLeftRightIcon className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-green-900">Specific</h3>
                        <p className="text-sm text-green-700">
                          "I want a language tutor that helps me practice conversational Spanish"
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-start">
                      <MagnifyingGlassIcon className="h-5 w-5 text-purple-600 mr-2 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-purple-900">Problem-Solving</h3>
                        <p className="text-sm text-purple-700">
                          "I need help analyzing my website analytics and identifying optimization opportunities"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    type="button"
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
                      isGenerating || !userIdea.trim()
                        ? 'bg-indigo-300 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                    }`}
                    onClick={generatePrompt}
                    disabled={isGenerating || !userIdea.trim()}
                  >
                    {isGenerating ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating Your AI Experience...
                      </>
                    ) : (
                      <>
                        Generate AI Experience <ArrowRightIcon className="ml-2 -mr-1 h-5 w-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">{generatedPrompt.title}</h2>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      generatedPrompt.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                      generatedPrompt.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {generatedPrompt.difficulty.charAt(0).toUpperCase() + generatedPrompt.difficulty.slice(1)}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-600">{generatedPrompt.description}</p>
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-indigo-100 text-indigo-800">
                      {generatedPrompt.category}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium text-gray-900">System Prompt</h3>
                    <div className="flex items-center space-x-2">
                      <DownloadPreview 
                        content={generatedPrompt.prompt}
                        title={`${generatedPrompt.title} - System Instructions`}
                        filename={`${generatedPrompt.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_instructions`}
                        trigger={
                          <button className="inline-flex items-center px-3 py-1.5 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors">
                            <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
                            Preview & Download
                          </button>
                        }
                      />
                      <button
                        onClick={() => downloadInstructions(generatedPrompt.prompt, generatedPrompt.title)}
                        className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                        title="Quick download as text file"
                      >
                        <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
                        Quick .txt
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 bg-gray-50 p-4 rounded-md">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">{generatedPrompt.prompt}</pre>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-800">
                        <strong>Success!</strong> Your idea has been automatically added to the Community Ideas page where others can discover and build upon it.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0">
                  <button
                    type="button"
                    className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={submitToCommunity}
                  >
                    <LightBulbIcon className="h-5 w-5 mr-2" />
                    View in Community
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    onClick={honeInOnIdea}
                  >
                    <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                    Start Conversation
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={() => setGeneratedPrompt(null)}
                  >
                    Try Another Idea
                  </button>
                </div>
              </div>
            )}

            {duplicateFound && (
              <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Duplicate Idea Found</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        A similar idea "{duplicateFound.title}" already exists in the community. 
                        Would you like to:
                      </p>
                      <div className="mt-3 flex space-x-4">
                        <button
                          type="button"
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                          onClick={() => navigate(`/community-ideas/${duplicateFound.id}`)}
                        >
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          View Existing Idea
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-yellow-700 bg-white hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                          onClick={() => setDuplicateFound(null)}
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaunchPadPage; 