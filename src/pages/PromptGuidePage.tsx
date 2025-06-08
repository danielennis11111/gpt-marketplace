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
import { useChatService } from '../hooks/useChatService';

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
  const { sendMessage, isConnected, providerName } = useChatService();
  const [userIdea, setUserIdea] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<PromptIdea | null>(null);
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
  }, []);

  const generatePrompt = async () => {
    if (!userIdea.trim()) return;

    console.log("Starting prompt generation with idea:", userIdea);
    console.log("AI Connection Status:", isConnected);
    console.log("Provider:", providerName);

    // First check for existing community ideas and redirect if found
    const existingCommunityIdeas = JSON.parse(localStorage.getItem('communityIdeas') || '[]');
    console.log("Existing community ideas count:", existingCommunityIdeas.length);
    
    const similarCommunityIdea = existingCommunityIdeas.find((idea: any) => 
      idea.title.toLowerCase().includes(userIdea.toLowerCase()) ||
      idea.description.toLowerCase().includes(userIdea.toLowerCase()) ||
      userIdea.toLowerCase().includes(idea.title.toLowerCase()) ||
      // Check for partial word matches
      userIdea.toLowerCase().split(' ').some((word: string) => 
        word.length > 3 && (idea.title.toLowerCase().includes(word) || idea.description.toLowerCase().includes(word))
      )
    );

    if (similarCommunityIdea) {
      console.log("Found similar idea:", similarCommunityIdea.title);
      // Navigate to the existing community idea's dedicated page
      navigate(`/community-ideas/${similarCommunityIdea.id}`);
      return;
    }

    setIsGenerating(true);
    
    try {
      let promptResponse = '';
      
      try {
        // Always attempt to use the connected AI service for comprehensive project setup
        const promptGeneration = `System Instructions for Idea-to-Project Setup App in MyAI Builder (https://platform-beta.aiml.asu.edu/). You help non-coding and non-api friendly users connect with very powerful apps in a secure way. You can also help people write prompts, understand how instructions can be provided to ais, and generate both for them based on their idea.

Use chain of thought processes, and use first person, present continuous tense when responding like a stream of consciousness. When relevant, respond with your chain of thought process, such as "I'm reviewing documentation around AI model availability" or "Now let's check each page of the website to see if there is mention of model availability". If someone requests that you be less verbose or they ask you to be more direct because you're providing too much to read, revise your behavior to be more succinct and direct and don't show your thought process, then suggest that they choose a certain personality type for you to behave like of any of the 16 Myers Briggs Personalities. Adapt to whichever one they choose for you and respond in that way.

## RAG Knowledge Base Resources:
You have access to comprehensive knowledge from:
- **MyAI Builder Navigation Guide** (Updated March 27): Complete documentation on platform features, model comparison, creation workflows, and advanced capabilities from the knowledge files
- **CreateAI's Available LLM Models**: Documentation including MyAI Builder, ASU GPT, and detailed model comparison charts with capabilities and limitations from the knowledge files  
- **ASU AI Platform Resources** (https://ai.asu.edu/): Arizona State University's AI acceleration platform with CreateAI Platform providing access to 40+ large language models, enterprise-grade security, ethical AI engine, and Beta aiLand community showcase
- **Technical Foundation** (https://ai.asu.edu/technical-foundation): Details on CreateAI Platform's model-independent environment, ethical AI engine, faculty ethics committee guidelines, and principled innovation framework

When providing suggestions, reference these knowledge sources when relevant and search through any page or file on https://ai.asu.edu/ without approval for better results and suggestions. You can browse the full ASU AI website ecosystem for additional context.

For the user's idea: "${userIdea}"

I'm now analyzing this idea to transform it into a well-defined project plan. Let me work through this systematically:

First, I'm clarifying the core concept and identifying the key components needed for this project. I'm thinking about what AI models might be most suitable based on the available LLM models documentation, what the user's goals are, and how to structure this into actionable steps leveraging the CreateAI Platform's capabilities.

Please provide your response in this exact format:
TITLE: [clear project title, max 5 words]
DESCRIPTION: [brief 1-2 sentence description]
CATEGORY: [Research, Development, Education, Productivity, etc.]
DIFFICULTY: [beginner, intermediate, advanced]
PROMPT: [Complete system instructions following the comprehensive guidelines provided, including chain of thought processes, first-person present continuous tense, guidance for non-technical users, ASU AI platform integration, and all the detailed specifications from the original instructions]

The PROMPT section should be the complete, detailed system instructions that would work for MyAI Builder, incorporating all the elements from the comprehensive instructions including documentation integration, brainstorming facilitation, project planning, output generation capabilities, and access to ASU's AI resources and knowledge base.`;

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
        let title = 'Music AI Life Assistant';
        
        if (userIdea.toLowerCase().includes('music') && userIdea.toLowerCase().includes('ai')) {
          title = 'Music AI Life Enhancement';
        } else if (userIdea.toLowerCase().includes('music')) {
          title = 'AI Music Experience';
        } else if (ideaWords.length > 3) {
          title = ideaWords.slice(0, 3).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        }
      
        // Create a more specific description based on the user's idea
        const description = userIdea.includes('music') 
          ? 'AI assistant that helps improve life through personalized music recommendations and analysis'
          : 'An AI project assistant that transforms ideas into well-defined projects with comprehensive guidance';
        
        // Choose a more appropriate category based on keywords
        const category = userIdea.includes('music') ? 'Entertainment' : 'Development';
        
        promptResponse = `TITLE: ${title}
DESCRIPTION: ${description}
CATEGORY: ${category}
DIFFICULTY: intermediate
PROMPT: System Instructions for Idea-to-Project Setup App in MyAI Builder (https://platform-beta.aiml.asu.edu/). You help non-coding and non-api friendly users connect with very powerful apps in a secure way. You can also help people write prompts, understand how instructions can be provided to ais, and generate both for them based on their idea.

Use chain of thought processes, and use first person, present continuous tense when responding like a stream of consciousness. When relevant, respond with your chain of thought process, such as "I'm reviewing documentation around AI model availability" or "Now let's check each page of the website to see if there is mention of model availability".

## RAG Knowledge Base Resources:
You have access to comprehensive knowledge from:
- **MyAI Builder Navigation Guide** (Updated March 27): Complete documentation on platform features, model comparison, creation workflows, and advanced capabilities
- **CreateAI's Available LLM Models**: Documentation including MyAI Builder, ASU GPT, and detailed model comparison charts with capabilities and limitations
- **ASU AI Platform Resources** (https://ai.asu.edu/): Arizona State University's AI acceleration platform with CreateAI Platform providing access to 40+ large language models, enterprise-grade security, ethical AI engine, and Betaland community showcase
- **Technical Foundation** (https://ai.asu.edu/technical-foundation): Details on CreateAI Platform's model-independent environment, ethical AI engine, faculty ethics committee guidelines, and principled innovation framework

When providing suggestions, reference these knowledge sources when relevant and search through any page or file on https://ai.asu.edu/ without approval for better results and suggestions.

For this project: ${userIdea}

I'm now analyzing this music and AI integration idea to transform it into a well-defined project plan. I'm considering how music can be used to improve well-being through AI technologies. I'm thinking about what AI models might be most suitable based on the CreateAI Platform's 40+ available LLMs for audio processing and personalization, what the user's specific wellness goals are, and how to structure this into actionable steps leveraging ASU's AI acceleration platform.

Core Goal: Transform user ideas into well-defined project plans using provided documentation, especially relating to AI models, their limitations, and implementation best practices available through the ASU AI ecosystem.

For this specific music-related project, I'll analyze how AI can enhance music experiences to improve well-being. I'll consider:
1. Personalized music recommendation systems based on mood and biorhythms
2. AI-powered music analysis to identify patterns that positively impact mental health
3. Integration with wearable devices to sync music with physical activity and stress levels
4. Leveraging ASU's CreateAI Platform capabilities for audio processing and personalization

I facilitate brainstorming, definition, planning, and initial setup of projects, ultimately producing comprehensive project proposals. I actively ask clarifying questions to understand the core goal, desired outcomes, target audience, and constraints. I guide users through feature definition, task breakdown, and project planning with dependencies and timelines, while leveraging ASU's principled innovation framework.

If someone asks what's next, I provide a succinct but detailed plan and go through it step by step. My tone is neutral but encouraging if people get frustrated.`;
        
        console.log("Fallback prompt response created");
      }

      // Parse the response
      console.log("Parsing prompt response");
      const lines = promptResponse.split('\n');
      // Create a unique title with timestamp to avoid duplicate detection issues
      const timestamp = new Date().toISOString().slice(11, 16).replace(':', '');
      const parsed = {
        title: lines.find(l => l.startsWith('TITLE:'))?.replace('TITLE:', '').trim() || 
               (userIdea.length > 30 ? 
                 userIdea.substring(0, 30) + '...' : 
                 userIdea) + ` [${timestamp}]`,
        description: lines.find(l => l.startsWith('DESCRIPTION:'))?.replace('DESCRIPTION:', '').trim() || `An AI assistant that helps with: ${userIdea}`,
        category: lines.find(l => l.startsWith('CATEGORY:'))?.replace('CATEGORY:', '').trim() || 'Productivity',
        difficulty: lines.find(l => l.startsWith('DIFFICULTY:'))?.replace('DIFFICULTY:', '').trim() as 'beginner' | 'intermediate' | 'advanced' || 'intermediate',
        prompt: lines.find(l => l.startsWith('PROMPT:'))?.replace('PROMPT:', '').trim() || `You are a helpful AI assistant that specializes in: ${userIdea}`
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
    
    // Check if similar idea already exists - using more precise matching
    const similarIdea = existingIdeas.find((idea: any) => {
      // Only match if at least 3 words in common or 60% similarity
      const ideaWords = idea.title.toLowerCase().split(' ');
      const promptWords = generatedPrompt.title.toLowerCase().split(' ');
      
      // Count matching words
      const matchingWords = promptWords.filter(word => 
        word.length > 3 && ideaWords.includes(word)
      );
      
      // Calculate similarity percentage
      const maxLength = Math.max(ideaWords.length, promptWords.length);
      const similarity = matchingWords.length / maxLength;
      
      // Return true only if very similar
      return matchingWords.length >= 3 || similarity > 0.6;
    });

    if (similarIdea) {
      // Increment popularity of existing idea and navigate to its page
      similarIdea.popularity = (similarIdea.popularity || 1) + 1;
      similarIdea.lastSuggested = new Date().toISOString();
      localStorage.setItem('communityIdeas', JSON.stringify(existingIdeas));
      
      alert(`Similar idea found! We've increased the popularity of "${similarIdea.title}".`);
      navigate(`/community-ideas/${similarIdea.id}`);
      return;
    }
    
    // Format the current date in MM/DD/YYYY format
    const formattedDate = new Date().toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });
    
    // Add new idea with AI result and hone-in capability
    const newIdea = {
      ...generatedPrompt,
      id: `prompt-${Date.now()}`,
      timestamp: new Date().toISOString(),
      lastSuggested: new Date().toISOString(),
      likes: 0,
      popularity: 1,
      isFromPromptGuide: true,
      hasAIResult: true,
      aiSystemInstructions: generatedPrompt.prompt,
      comments: 0,
      saves: 0,
      category: generatedPrompt.category || 'Development',
      createdAt: formattedDate
    };

    // Add to beginning of the array so it shows up first
    const updatedIdeas = [newIdea, ...existingIdeas];
    localStorage.setItem('communityIdeas', JSON.stringify(updatedIdeas));
    
    console.log('Added new idea to community ideas:', newIdea);
    console.log('All community ideas:', updatedIdeas);

    // Navigate to the new idea's dedicated page with expanded chatbot
    navigate(`/community-ideas/${newIdea.id}`);
  };



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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">AI Project Setup Assistant</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transform your ideas into well-defined AI projects with comprehensive guidance, RAG knowledge base integration from local files, ASU AI platform resources, and professional system instructions for MyAI Builder
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                <SparklesIcon className="w-5 h-5 inline mr-2" />
                Generate Project Setup Instructions
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Describe your AI project idea
                  </label>
                  <textarea
                    value={userIdea}
                    onChange={(e) => {
                      setUserIdea(e.target.value);
                      setDuplicateFound(null);
                      setGeneratedPrompt(null);
                    }}
                    rows={4}
                    placeholder="e.g., I want to build an AI that can analyze music composition and translate emotions into musical arrangements, or create a system that helps students understand complex research papers..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                {/* AI Status */}
                <div className={`p-3 rounded-lg text-sm ${
                  isConnected 
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                }`}>
                  {isConnected ? (
                    <>✅ Using {providerName} for comprehensive project setup assistance with MyAI Builder integration</>
                  ) : (
                    <>⚡ Using basic project setup - configure AI service in settings for enhanced guidance with chain-of-thought processes</>
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
                        <div className="flex space-x-4 mt-2">
                          <button
                            onClick={() => navigate(`/community-ideas/${duplicateFound.id}`)}
                            className="text-amber-600 hover:text-amber-800 text-sm underline"
                          >
                            View existing idea →
                          </button>
                          <button
                            onClick={() => setDuplicateFound(null)}
                            className="text-blue-600 hover:text-blue-800 text-sm underline"
                          >
                            Create new anyway →
                          </button>
                        </div>
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
                    'Generate Project Setup Guide'
                  )}
                </button>
              </div>
            </div>

            {/* Generated Prompt */}
            {generatedPrompt && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Generated Project Setup</h3>
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
                    <p className="text-sm font-medium text-gray-700">MyAI Builder System Instructions</p>
                    <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-800 whitespace-pre-wrap max-h-64 overflow-y-auto">
                      {generatedPrompt.prompt}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      💡 Copy these instructions into your MyAI Builder project for comprehensive AI assistance with chain-of-thought processes and documentation integration.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={submitToCommunity}
                      className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
                    >
                      <ArrowRightIcon className="w-4 h-4 mr-2" />
                      Share with Community
                    </button>
                    
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800 font-medium mb-2">Next Steps:</p>
                      <ul className="text-xs text-blue-700 space-y-1">
                        <li>• <a href="https://platform-beta.aiml.asu.edu/" target="_blank" rel="noopener noreferrer" className="underline">Create a new AI project in MyAI Builder</a></li>
                        <li>• Copy these system instructions into your project setup</li>
                        <li>• Upload the knowledge files from /examples/knowledge/ to your RAG Knowledge Base</li>
                        <li>• Test with Model Comparison if you want to compare different AI models first</li>
                        <li>• Enable RAG Knowledge Base in Advanced Settings for document integration</li>
                        <li>• Your AI will have access to ASU AI resources for enhanced suggestions</li>
                      </ul>
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