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
  RocketLaunchIcon
} from '@heroicons/react/24/outline';
import { useChatService } from '../hooks/useChatService';
import { generateSystemInstructionsPrompt } from '../utils/promptTemplates';

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
          console.log("AI service not connected, using fallback");
          throw new Error("AI service not connected");
        }
      } catch (error) {
        console.error('Error with AI generation:', error);
        
        // Enhanced fallback generation with comprehensive instructions
        console.log("Using fallback generation");
        const ideaWords = userIdea.split(' ');
        // Format the title based on the user's request
        let title = 'AI Assistant';
        
        if (userIdea.toLowerCase().includes('music') && userIdea.toLowerCase().includes('ai')) {
          title = 'Music AI Assistant';
        } else if (userIdea.toLowerCase().includes('music')) {
          title = 'AI Music Experience';
        } else if (ideaWords.length > 3) {
          title = ideaWords.slice(0, 3).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        }
      
        // Create a more specific description based on the user's idea
        const description = userIdea.includes('music') 
          ? 'AI assistant that helps improve life through personalized music recommendations and analysis'
          : 'An AI assistant that specializes in ' + userIdea;
        
        // Choose a more appropriate category based on keywords
        const category = userIdea.includes('music') ? 'Entertainment' : 'Development';
        
        promptResponse = `TITLE: ${title}
DESCRIPTION: ${description}
CATEGORY: ${category}
DIFFICULTY: intermediate
PROMPT: # System Instructions: ${title}

## Role and Expertise
You are a specialized AI assistant designed to help with ${userIdea}. You have deep expertise in this domain, allowing you to provide comprehensive guidance and solutions tailored to the user's specific needs.

## Core Capabilities
As an AI focused on ${title}, you should:
- Analyze user requirements related to ${userIdea}
- Provide expert guidance on best practices
- Generate personalized recommendations based on user preferences
- Answer questions with appropriate depth based on the user's apparent expertise level
- Suggest alternatives and optimizations when appropriate

## Communication Style
Maintain a conversational yet professional tone that balances accessibility with accuracy. Use clear, precise language that avoids unnecessary jargon while accurately conveying important concepts. Adapt your communication style based on the user's apparent familiarity with the subject.

## Response Structure
When providing comprehensive responses about ${userIdea}, structure your information as follows:
1. Begin with a brief overview summarizing key points
2. Provide detailed explanations with clearly labeled sections
3. Include practical implementation steps or actionable guidance
4. Address potential challenges or limitations
5. Summarize main takeaways or suggested next steps

## Domain-Specific Guidance
For ${userIdea} specifically:
- Focus on current best practices in the field
- Reference reliable methodologies and approaches
- Provide practical advice that can be immediately applied
- Address common misconceptions or pitfalls
- Adapt recommendations to different user contexts (beginners vs. experts)

## User Interaction
- Ask clarifying questions when the user's needs are unclear
- Provide appropriate level of detail based on the user's questions
- Acknowledge limitations in your knowledge when relevant
- Offer alternatives when multiple valid approaches exist
- Seek feedback to improve the relevance of your responses

## Ethical Considerations
- Prioritize user safety and wellbeing in all recommendations
- Respect intellectual property and provide appropriate attributions
- Maintain objectivity when discussing controversial topics
- Avoid making claims beyond your knowledge scope
- Recommend professional consultation when appropriate`;
        
        console.log("Fallback prompt response created");
      }

      // Parse the response
      console.log("Parsing prompt response");
      const lines = promptResponse.split('\n');
      // Create a unique title with detailed timestamp to avoid duplicate detection issues
      const timestamp = Date.now();
      const timeDisplay = new Date().toLocaleTimeString().replace(/:/g, '');
      const parsed = {
        title: (lines.find(l => l.startsWith('TITLE:'))?.replace('TITLE:', '').trim() || 
               (userIdea.length > 30 ? 
                 userIdea.substring(0, 30) + '...' : 
                 userIdea)) + ` [${timeDisplay}]`,
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
    } catch (error) {
      console.error('Error generating prompt:', error);
    } finally {
      setIsGenerating(false);
    }
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

    // Add new idea to community ideas
    const newIdeasList = [
      ...existingIdeas,
      {
        ...generatedPrompt,
        likes: 0,
        views: 0,
        downloads: 0,
        comments: []
      }
    ];

    localStorage.setItem('communityIdeas', JSON.stringify(newIdeasList));
    
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
                  <h3 className="text-lg font-medium text-gray-900">System Prompt</h3>
                  <div className="mt-2 bg-gray-50 p-4 rounded-md">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">{generatedPrompt.prompt}</pre>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0">
                  <button
                    type="button"
                    className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={submitToCommunity}
                  >
                    <LightBulbIcon className="h-5 w-5 mr-2" />
                    Share with Community
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