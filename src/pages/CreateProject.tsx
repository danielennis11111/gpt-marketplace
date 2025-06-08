import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  ArrowRightIcon, 
  CheckCircleIcon, 
  PaperAirplaneIcon, 
  DocumentTextIcon,
  BeakerIcon,
  AcademicCapIcon,
  CpuChipIcon,
  ChatBubbleLeftRightIcon,
  MicrophoneIcon,
  CodeBracketIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import { ArrowPathIcon } from '@heroicons/react/24/solid';
import gptsData from '../data/gpts.json';

// Define the steps in the project creation process
const STEPS = [
  'idea',
  'model',
  'capabilities',
  'instructions',
  'testing',
  'publish'
];

// Define the models available to use
const AVAILABLE_MODELS = [
  { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI', description: 'Advanced reasoning, following complex instructions, and generating detailed content.' },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic', description: 'Anthropic\'s most powerful model with superior reasoning, expertise, and language understanding.' },
  { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash', provider: 'Google', description: 'Google\'s latest experimental model with enhanced speed and performance for reasoning, following instructions, and generating creative content.' },
  { id: 'llama-3', name: 'Llama 3', provider: 'Meta', description: 'Open model with strong capabilities for chat, reasoning, and content creation.' },
  { id: 'mixtral-8x7b', name: 'Mixtral 8x7B', provider: 'Mistral AI', description: 'Open mixture-of-experts model with efficient performance across many tasks.' },
  { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'Anthropic', description: 'Balanced performance for most use cases with excellent reasoning and safety.' }
];

// Define deployment options
const DEPLOYMENT_OPTIONS = [
  { id: 'api', name: 'REST API', icon: CodeBracketIcon, description: 'Deploy as an API endpoint for integration with your applications' },
  { id: 'slack', name: 'Slack Bot', icon: ChatBubbleLeftRightIcon, description: 'Create a Slack bot for team collaboration' },
  { id: 'voice', name: 'Voice Assistant', icon: MicrophoneIcon, description: 'Build a voice-enabled assistant with Gemini text-to-speech' },
  { id: 'teams', name: 'Microsoft Teams', icon: ChatBubbleLeftRightIcon, description: 'Integrate with Microsoft Teams for workplace assistance' },
  { id: 'discord', name: 'Discord Bot', icon: ChatBubbleLeftRightIcon, description: 'Create a Discord bot for community engagement' },
  { id: 'podcast', name: 'AI Podcast', icon: MicrophoneIcon, description: 'Generate podcast-style conversations between AI personas' }
];

const CreateProject: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generatingResponse, setGeneratingResponse] = useState(false);
  const [projectIdea, setProjectIdea] = useState('');
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [projectTitle, setProjectTitle] = useState('');
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([]);
  const [deploymentOptions, setDeploymentOptions] = useState<string[]>([]);
  const [instructions, setInstructions] = useState('');
  const [generatedParameters, setGeneratedParameters] = useState<any>(null);
  const [aiConceptualization, setAiConceptualization] = useState('');
  const [testPrompt, setTestPrompt] = useState('');
  const [testResponse, setTestResponse] = useState('');
  const [publishToMarketplace, setPublishToMarketplace] = useState(false);
  const [publishToPrivate, setPublishToPrivate] = useState(true);
  const [isSharingCommunity, setIsSharingCommunity] = useState(false);
  
  // Capabilities options
  const capabilities = [
    { id: 'reasoning', name: 'Reasoning & Problem Solving', icon: AcademicCapIcon },
    { id: 'creative', name: 'Creative Content Generation', icon: LightBulbIcon },
    { id: 'data-analysis', name: 'Data Analysis', icon: BeakerIcon },
    { id: 'coding', name: 'Code Generation & Explanation', icon: CodeBracketIcon },
    { id: 'conversation', name: 'Conversational', icon: ChatBubbleLeftRightIcon },
    { id: 'multimodal', name: 'Multimodal (Images, Audio)', icon: DocumentTextIcon },
    { id: 'memory', name: 'Long-term Memory', icon: CpuChipIcon },
    { id: 'persona', name: 'Character/Persona', icon: ChatBubbleLeftRightIcon }
  ];

  // Handle next step
  const handleNextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Handle previous step
  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle idea submission
  const handleIdeaSubmission = () => {
    if (!projectIdea.trim()) return;
    
    setGeneratingResponse(true);
    
    // Simulate AI processing the idea
    setTimeout(() => {
      // Generate a project title based on the idea
      const suggestedTitle = projectIdea.split(' ')
        .slice(0, 3)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ') + ' Assistant';
      
      setProjectTitle(suggestedTitle);
      
      // Generate AI conceptualization
      const conceptualization = `
Based on your idea, I recommend creating an AI assistant that can ${projectIdea.toLowerCase().includes('analyze') ? 'analyze data and provide insights' : 'assist with generating creative content and ideas'}.

This project could be implemented using ${selectedModel || 'GPT-4'} with the following components:

1. Natural language understanding to interpret user requests
2. ${projectIdea.toLowerCase().includes('data') ? 'Data processing capabilities to handle structured information' : 'Creative content generation with customizable parameters'}
3. ${projectIdea.toLowerCase().includes('voice') || projectIdea.toLowerCase().includes('speak') ? 'Text-to-speech integration using Gemini or similar technology' : 'A conversational interface for interactive sessions'}
4. ${projectIdea.toLowerCase().includes('api') ? 'API endpoints for integration with existing systems' : 'A user-friendly interface for direct interaction'}

The assistant would be configured to understand domain-specific terminology and provide responses that align with your organization's best practices.
      `;
      
      setAiConceptualization(conceptualization);
      setGeneratingResponse(false);
      handleNextStep();
    }, 2500);
  };

  // Handle model selection
  const handleModelSelection = (modelId: string) => {
    setSelectedModel(modelId);
  };

  // Handle capability selection
  const handleCapabilitySelection = (capabilityId: string) => {
    if (selectedCapabilities.includes(capabilityId)) {
      setSelectedCapabilities(selectedCapabilities.filter(id => id !== capabilityId));
    } else {
      setSelectedCapabilities([...selectedCapabilities, capabilityId]);
    }
  };

  // Handle deployment option selection
  const handleDeploymentSelection = (optionId: string) => {
    if (deploymentOptions.includes(optionId)) {
      setDeploymentOptions(deploymentOptions.filter(id => id !== optionId));
    } else {
      setDeploymentOptions([...deploymentOptions, optionId]);
    }
  };

  // Generate JSON parameters based on selections
  const generateParameters = () => {
    setLoading(true);
    
    // Simulate API call to generate parameters
    setTimeout(() => {
      const params = {
        model: selectedModel || 'gpt-4',
        project_name: projectTitle,
        capabilities: selectedCapabilities,
        deployment: deploymentOptions,
        instructions: instructions,
        parameters: {
          temperature: 0.7,
          max_tokens: 2000,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0
        },
        creator: "ASU Enterprise Technology",
        created_at: new Date().toISOString()
      };
      
      setGeneratedParameters(params);
      setLoading(false);
      handleNextStep();
    }, 2000);
  };

  // Simulate testing the AI with a prompt
  const testAI = () => {
    if (!testPrompt.trim()) return;
    
    setLoading(true);
    
    // Simulate AI response
    setTimeout(() => {
      let response = '';
      
      if (testPrompt.toLowerCase().includes('hello') || testPrompt.toLowerCase().includes('hi')) {
        response = `Hello! I'm your ${projectTitle} assistant. How can I help you today?`;
      } else if (testPrompt.toLowerCase().includes('what can you do')) {
        response = `As your ${projectTitle} assistant, I can ${selectedCapabilities.includes('reasoning') ? 'help solve complex problems, ' : ''}${selectedCapabilities.includes('creative') ? 'generate creative content, ' : ''}${selectedCapabilities.includes('data-analysis') ? 'analyze data and provide insights, ' : ''}${selectedCapabilities.includes('coding') ? 'write and explain code, ' : ''}${selectedCapabilities.includes('conversation') ? 'engage in natural conversations, ' : ''}${selectedCapabilities.includes('multimodal') ? 'work with images and audio, ' : ''}${selectedCapabilities.includes('memory') ? 'remember our conversation history, ' : ''}${selectedCapabilities.includes('persona') ? 'adopt specific personas for different scenarios, ' : ''}and more based on your needs.`;
      } else {
        response = `I understand you're asking about "${testPrompt}". Based on my configuration as a ${projectTitle} assistant, I would approach this by ${selectedCapabilities.includes('reasoning') ? 'analyzing the key elements of your request and providing a structured response' : 'generating helpful content that addresses your specific needs'}. Is there a particular aspect of this you'd like me to elaborate on?`;
      }
      
      setTestResponse(response);
      setLoading(false);
    }, 1500);
  };

  // Handle project creation completion
  const handleCreateProject = () => {
    setLoading(true);
    
    // Generate a unique ID for the new project
    const newProjectId = `gpt-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    
    // Create a new project object based on user inputs
    const newProject = {
      id: newProjectId,
      name: projectTitle,
      description: projectIdea,
      creator: {
        name: "ASU Enterprise Technology",
        avatar: "/asu-logo.png"
      },
      category: selectedCapabilities.length > 0 ? selectedCapabilities[0] : "Productivity",
      tags: selectedCapabilities.map(cap => cap.toLowerCase()),
      instructionsSnippet: instructions,
      clonedCount: 0,
      rating: 0,
      reviewCount: 0,
      verified: false,
      previewDemoLink: "",
      canBeCloned: true,
      feedbackWanted: true,
      asuriteSpecific: !publishToMarketplace,
      capabilities: selectedCapabilities,
      actions: deploymentOptions,
      version: "1.0.0",
      dateCreated: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      reviews: [],
      exampleConversations: []
    };
    
    // In a real app, this would call an API to save the project
    // For this prototype, we'll simulate adding it to the JSON data
    
    // Add the new project to local storage to simulate persistence
    const existingProjects = JSON.parse(localStorage.getItem('userProjects') || '[]');
    localStorage.setItem('userProjects', JSON.stringify([...existingProjects, newProject]));
    
    // Add to "marketplace" if publishToMarketplace is true
    if (publishToMarketplace) {
      const marketplaceProjects = JSON.parse(localStorage.getItem('marketplaceProjects') || JSON.stringify(gptsData));
      localStorage.setItem('marketplaceProjects', JSON.stringify([...marketplaceProjects, newProject]));
    }
    
    setTimeout(() => {
      setLoading(false);
      // Navigate to the project detail page instead of myprojects
      navigate(`/project/${newProjectId}`);
    }, 2000);
  };

  // Get content for current step
  const renderStepContent = () => {
    switch (STEPS[currentStep]) {
      case 'idea':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">What's your project idea?</h2>
            <p className="text-gray-600">
              Describe your idea in natural language. Our AI will help conceptualize it into a project.
            </p>
            
            <div>
              <label htmlFor="projectIdea" className="sr-only">
                Your project idea
              </label>
              <textarea
                id="projectIdea"
                rows={6}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                placeholder="I want to create an AI assistant that can analyze scientific papers and summarize the key findings, methodologies, and implications..."
                value={projectIdea}
                onChange={(e) => setProjectIdea(e.target.value)}
              ></textarea>
            </div>
            
            {aiConceptualization && (
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                <h3 className="font-medium text-amber-900 mb-2">AI Conceptualization</h3>
                <p className="text-amber-800 whitespace-pre-line">{aiConceptualization}</p>
              </div>
            )}
            
            <div className="flex justify-end">
              <button
                onClick={handleIdeaSubmission}
                disabled={!projectIdea.trim() || generatingResponse}
                className={`inline-flex items-center px-6 py-3 rounded-full font-medium ${
                  !projectIdea.trim() || generatingResponse
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-amber-400 text-black hover:bg-amber-500'
                } transition-colors`}
              >
                {generatingResponse ? (
                  <>
                    <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <PaperAirplaneIcon className="w-5 h-5 mr-2" />
                    Analyze My Idea
                  </>
                )}
              </button>
            </div>
          </div>
        );
        
      case 'model':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Select a Foundation Model</h2>
            <p className="text-gray-600">
              Choose the AI model that will power your project.
            </p>
            
            <div className="mt-4">
              <label htmlFor="projectTitle" className="block text-sm font-medium text-gray-700 mb-2">
                Project Title
              </label>
              <input
                type="text"
                id="projectTitle"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                placeholder="Enter a title for your project"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {AVAILABLE_MODELS.map((model) => (
                <div
                  key={model.id}
                  onClick={() => handleModelSelection(model.id)}
                  className={`
                    p-4 rounded-lg border cursor-pointer transition-all
                    ${selectedModel === model.id
                      ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-400'
                      : 'border-gray-200 hover:border-amber-200 hover:bg-amber-50'
                    }
                  `}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{model.name}</h3>
                      <p className="text-sm text-gray-500">{model.provider}</p>
                    </div>
                    {selectedModel === model.id && (
                      <CheckCircleIcon className="w-6 h-6 text-amber-500" />
                    )}
                  </div>
                  <p className="mt-2 text-sm text-gray-600">{model.description}</p>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between mt-8">
              <button
                onClick={handlePrevStep}
                className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Back
              </button>
              
              <button
                onClick={handleNextStep}
                disabled={!selectedModel || !projectTitle.trim()}
                className={`inline-flex items-center px-6 py-3 rounded-full font-medium ${
                  !selectedModel || !projectTitle.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-amber-400 text-black hover:bg-amber-500'
                } transition-colors`}
              >
                Continue
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        );
        
      case 'capabilities':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Configure Capabilities</h2>
            <p className="text-gray-600">
              Select the capabilities your AI assistant should have and how it will be deployed.
            </p>
            
            <div>
              <h3 className="font-medium text-gray-800 mb-3">Capabilities</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {capabilities.map((capability) => {
                  const Icon = capability.icon;
                  return (
                    <div
                      key={capability.id}
                      onClick={() => handleCapabilitySelection(capability.id)}
                      className={`
                        p-3 rounded-lg border cursor-pointer transition-all flex items-center
                        ${selectedCapabilities.includes(capability.id)
                          ? 'border-amber-400 bg-amber-50'
                          : 'border-gray-200 hover:border-amber-200 hover:bg-amber-50'
                        }
                      `}
                    >
                      <Icon className={`w-6 h-6 mr-3 ${selectedCapabilities.includes(capability.id) ? 'text-amber-500' : 'text-gray-400'}`} />
                      <span className="font-medium">{capability.name}</span>
                      {selectedCapabilities.includes(capability.id) && (
                        <CheckCircleIcon className="w-5 h-5 text-amber-500 ml-auto" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="font-medium text-gray-800 mb-3">Deployment Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {DEPLOYMENT_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  return (
                    <div
                      key={option.id}
                      onClick={() => handleDeploymentSelection(option.id)}
                      className={`
                        p-3 rounded-lg border cursor-pointer transition-all
                        ${deploymentOptions.includes(option.id)
                          ? 'border-amber-400 bg-amber-50'
                          : 'border-gray-200 hover:border-amber-200 hover:bg-amber-50'
                        }
                      `}
                    >
                      <div className="flex items-center">
                        <Icon className={`w-6 h-6 mr-3 ${deploymentOptions.includes(option.id) ? 'text-amber-500' : 'text-gray-400'}`} />
                        <div>
                          <h4 className="font-medium">{option.name}</h4>
                          <p className="text-sm text-gray-500">{option.description}</p>
                        </div>
                        {deploymentOptions.includes(option.id) && (
                          <CheckCircleIcon className="w-5 h-5 text-amber-500 ml-auto" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="flex justify-between mt-8">
              <button
                onClick={handlePrevStep}
                className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Back
              </button>
              
              <button
                onClick={handleNextStep}
                disabled={selectedCapabilities.length === 0 || deploymentOptions.length === 0}
                className={`inline-flex items-center px-6 py-3 rounded-full font-medium ${
                  selectedCapabilities.length === 0 || deploymentOptions.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-amber-400 text-black hover:bg-amber-500'
                } transition-colors`}
              >
                Continue
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        );
        
      case 'instructions':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Customize Instructions</h2>
            <p className="text-gray-600">
              Provide detailed instructions for your AI assistant. This will guide its behavior and responses.
            </p>
            
            <div>
              <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-2">
                System Instructions
              </label>
              <textarea
                id="instructions"
                rows={10}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                placeholder="You are a helpful assistant specialized in [specific domain]. Your role is to [main purpose]. When responding, always [specific behaviors or constraints]..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              ></textarea>
              
              <div className="mt-2 text-sm text-gray-500">
                <p>Include details about:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>The assistant's role and purpose</li>
                  <li>Specific knowledge areas it should focus on</li>
                  <li>Tone, style, and persona it should adopt</li>
                  <li>Format for responses</li>
                  <li>Any constraints or guidelines it should follow</li>
                </ul>
              </div>
            </div>
            
            <div className="flex justify-between mt-8">
              <button
                onClick={handlePrevStep}
                className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Back
              </button>
              
              <button
                onClick={generateParameters}
                disabled={!instructions.trim() || loading}
                className={`inline-flex items-center px-6 py-3 rounded-full font-medium ${
                  !instructions.trim() || loading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-amber-400 text-black hover:bg-amber-500'
                } transition-colors`}
              >
                {loading ? (
                  <>
                    <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    Generate Parameters
                    <DocumentTextIcon className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
            </div>
          </div>
        );
        
      case 'testing':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Test Your Assistant</h2>
            <p className="text-gray-600">
              Try out your AI assistant with some sample prompts to see how it responds.
            </p>
            
            {generatedParameters && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-2">Generated Parameters</h3>
                <pre className="text-xs text-gray-700 overflow-auto p-3 bg-gray-100 rounded-md">
                  {JSON.stringify(generatedParameters, null, 2)}
                </pre>
              </div>
            )}
            
            <div className="mt-6">
              <label htmlFor="testPrompt" className="block text-sm font-medium text-gray-700 mb-2">
                Test Prompt
              </label>
              <div className="flex">
                <input
                  type="text"
                  id="testPrompt"
                  className="flex-grow px-4 py-3 rounded-l-lg border border-gray-300 focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  placeholder="Enter a test prompt..."
                  value={testPrompt}
                  onChange={(e) => setTestPrompt(e.target.value)}
                />
                <button
                  onClick={testAI}
                  disabled={!testPrompt.trim() || loading}
                  className={`px-4 py-3 rounded-r-lg font-medium ${
                    !testPrompt.trim() || loading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-amber-400 text-black hover:bg-amber-500'
                  } transition-colors`}
                >
                  {loading ? 'Testing...' : 'Test'}
                </button>
              </div>
            </div>
            
            {testResponse && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-2">AI Response</h3>
                <p className="text-gray-700">{testResponse}</p>
              </div>
            )}
            
            <div className="flex justify-between mt-8">
              <button
                onClick={handlePrevStep}
                className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Back
              </button>
              
              <button
                onClick={handleNextStep}
                className="inline-flex items-center px-6 py-3 bg-amber-400 text-black rounded-full hover:bg-amber-500 transition-colors"
              >
                Continue
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        );
        
      case 'publish':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Publish Your Project</h2>
            <p className="text-gray-600">
              Choose how you want to share your AI assistant.
            </p>
            
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="publishPrivate"
                    className="mt-1"
                    checked={publishToPrivate}
                    onChange={(e) => setPublishToPrivate(e.target.checked)}
                  />
                  <div className="ml-3">
                    <label htmlFor="publishPrivate" className="font-medium text-gray-900">
                      Add to My Projects
                    </label>
                    <p className="text-sm text-gray-500">
                      Save this project to your personal workspace
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="publishMarketplace"
                    className="mt-1"
                    checked={publishToMarketplace}
                    onChange={(e) => setPublishToMarketplace(e.target.checked)}
                  />
                  <div className="ml-3">
                    <label htmlFor="publishMarketplace" className="font-medium text-gray-900">
                      Publish to Marketplace
                    </label>
                    <p className="text-sm text-gray-500">
                      Share your project with the ASU community (requires verification)
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="shareCommunity"
                    className="mt-1"
                    checked={isSharingCommunity}
                    onChange={(e) => setIsSharingCommunity(e.target.checked)}
                  />
                  <div className="ml-3">
                    <label htmlFor="shareCommunity" className="font-medium text-gray-900">
                      Share in Community Ideas
                    </label>
                    <p className="text-sm text-gray-500">
                      Add your project idea to the community ideas page for inspiration
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between mt-8">
              <button
                onClick={handlePrevStep}
                className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Back
              </button>
              
              <button
                onClick={handleCreateProject}
                disabled={loading || (!publishToPrivate && !publishToMarketplace && !isSharingCommunity)}
                className={`inline-flex items-center px-6 py-3 rounded-full font-medium ${
                  loading || (!publishToPrivate && !publishToMarketplace && !isSharingCommunity)
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-amber-400 text-black hover:bg-amber-500'
                } transition-colors`}
              >
                {loading ? (
                  <>
                    <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create Project
                    <CheckCircleIcon className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back
        </button>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
          <p className="text-gray-600 mt-2">
            Turn your ideas into AI-powered projects in a few simple steps.
          </p>
        </div>
        
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step} className="flex flex-col items-center">
                <div 
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    ${index < currentStep ? 'bg-green-500 text-white' : 
                      index === currentStep ? 'bg-amber-400 text-black' : 
                      'bg-gray-200 text-gray-500'}
                  `}
                >
                  {index < currentStep ? (
                    <CheckCircleIcon className="w-6 h-6" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span className="mt-2 text-xs text-gray-500 capitalize">{step}</span>
              </div>
            ))}
          </div>
          <div className="relative mt-2">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="h-0.5 w-full bg-gray-200"></div>
            </div>
            <div className="relative flex justify-between">
              {STEPS.map((step, index) => (
                <div 
                  key={`line-${step}`}
                  className={`w-10 h-0.5 ${index < currentStep ? 'bg-green-500' : 'bg-gray-200'}`}
                  style={{ visibility: index === STEPS.length - 1 ? 'hidden' : 'visible' }}
                ></div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-200">
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
};

export default CreateProject; 