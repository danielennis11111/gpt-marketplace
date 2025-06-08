import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LightBulbIcon,
  SparklesIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon
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

export const PromptGuidePage: React.FC = () => {
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
        console.log("Creating duplicate by user request");
      } else {
        // Increment popularity of existing idea and navigate to its page
        similarIdea.popularity = (similarIdea.popularity || 1) + 1;
        similarIdea.lastSuggested = new Date().toISOString();
        localStorage.setItem('communityIdeas', JSON.stringify(existingIdeas));
        
        console.log(`Using existing idea: "${similarIdea.title}"`);
        navigate(`/community-ideas/${similarIdea.id}`);
        return;
      }
    }
    
    // Format the current date in MM/DD/YYYY format
    const formattedDate = new Date().toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });
    
    // Add new idea with AI result and hone-in capability
    const uniqueId = `prompt-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    console.log("Creating new idea with ID:", uniqueId);
    const newIdea = {
      ...generatedPrompt,
      id: uniqueId,
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

  // Immediately hone in on the idea - auto shares and navigates to the detail page
  const honeInOnIdea = () => {
    // First add to community, then navigate to the hone-in page
    submitToCommunity();
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
          <button 
            onClick={resetCommunityIdeas}
            className="mt-2 text-xs text-gray-400 hover:text-gray-600"
          >
            Reset Community Ideas DB
          </button>
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
                      onClick={honeInOnIdea}
                      className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
                    >
                      <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
                      Hone In on This Idea
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