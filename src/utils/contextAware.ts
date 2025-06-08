import { useLocation } from 'react-router-dom';

interface PageContext {
  pageName: string;
  description: string;
  helpTopics: string[];
  quickActions: string[];
  contextPrompt: string;
}

export const getPageContext = (pathname: string, projectData?: any): PageContext => {
  switch (pathname) {
    case '/':
    case '/marketplace':
      return {
        pageName: 'Marketplace',
        description: 'Browse and discover AI projects, templates, and tools',
        helpTopics: [
          'Finding the right AI project for your needs',
          'Understanding project categories and tags',
          'How to clone and use projects',
          'Difference between AI Projects, Extensions, Repositories, and Local Models',
          'Using filters and search to find projects'
        ],
        quickActions: [
          'Show me popular AI projects',
          'Find projects for beginners',
          'Explain project categories',
          'How do I clone a project?'
        ],
        contextPrompt: `You are helping a user browse the AI Marketplace. The marketplace contains AI Projects (custom assistants), Extensions (embeddable chatbots), Repositories (code resources), and Local Models (downloadable AI models). Help users find the right tools for their needs, explain how different project types work, and guide them through using the marketplace features.`
      };

    case '/learning':
      return {
        pageName: 'Learning Hub',
        description: 'Tutorials and guides for AI development and deployment',
        helpTopics: [
          'Setting up API keys for different AI providers',
          'Local AI deployment with Ollama and Llama',
          'Multi-provider AI setup and configuration',
          'Understanding rate limiting and security',
          'ASU Local Wrapper features and usage'
        ],
        quickActions: [
          'How do I set up Gemini API?',
          'Guide me through local Llama setup',
          'Explain multi-API integration',
          'What is the ASU Local Wrapper?'
        ],
        contextPrompt: `You are helping a user learn about AI development and deployment. The learning section contains detailed tutorials about setting up AI APIs (Gemini, OpenAI, Anthropic), running local AI models with Ollama, and using the ASU Local Wrapper. Provide step-by-step guidance, explain technical concepts clearly, and help troubleshoot common issues.`
      };

    case '/create-project':
      return {
        pageName: 'Project Creator',
        description: 'Create new AI projects and custom assistants',
        helpTopics: [
          'Choosing the right project type for your use case',
          'Writing effective AI prompts and instructions',
          'Setting up project metadata and descriptions',
          'Configuring AI model parameters',
          'Best practices for project creation'
        ],
        quickActions: [
          'Help me choose a project type',
          'How do I write good AI prompts?',
          'What makes a project successful?',
          'Guide me through project setup'
        ],
        contextPrompt: `You are helping a user create a new AI project. Guide them through choosing the right project type, writing effective prompts, setting up metadata, and following best practices for successful AI projects. Help them understand the different options and make informed decisions about their project configuration.`
      };

    case '/myprojects':
      return {
        pageName: 'My Projects',
        description: 'Manage your created and cloned AI projects',
        helpTopics: [
          'Organizing and managing your projects',
          'Editing and updating existing projects',
          'Sharing projects with others',
          'Understanding project analytics and performance',
          'Troubleshooting project issues'
        ],
        quickActions: [
          'How do I edit my projects?',
          'Can I share my projects?',
          'How to organize my projects?',
          'Why isn\'t my project working?'
        ],
        contextPrompt: `You are helping a user manage their AI projects. This includes both projects they've created and ones they've cloned from the marketplace. Help them understand how to edit, organize, share, and troubleshoot their projects effectively.`
      };

    case '/community-ideas':
      return {
        pageName: 'Community Ideas',
        description: 'Share and discover new AI project ideas',
        helpTopics: [
          'Submitting effective project ideas',
          'Collaborating with the community',
          'Understanding idea voting and feedback',
          'From idea to implementation',
          'Community guidelines and best practices'
        ],
        quickActions: [
          'How do I submit an idea?',
          'What makes a good project idea?',
          'How can I collaborate with others?',
          'How do ideas become projects?'
        ],
        contextPrompt: `You are helping a user with the Community Ideas section. This is where users can share new AI project ideas, get feedback from the community, and collaborate on innovative solutions. Help them understand how to participate effectively in the community.`
      };

    case '/rate-limiter':
      return {
        pageName: 'Beta Land @ ASU',
        description: 'ASU Local Wrapper for enterprise AI deployment',
        helpTopics: [
          'Using the ASU Local Wrapper interface',
          'Understanding rate limiting and security features',
          'Voice interaction and file upload capabilities',
          'Conversation templates and customization',
          'Enterprise deployment and user management'
        ],
        quickActions: [
          'How do I use voice features?',
          'Explain rate limiting',
          'How to upload files?',
          'What are conversation templates?'
        ],
        contextPrompt: `You are helping a user with the ASU Local Wrapper, an enterprise-grade AI interface. This tool provides secure, rate-limited access to multiple AI providers with features like voice interaction, file uploads, and conversation templates. Help them understand and use these professional features effectively.`
      };

    default:
      if (pathname.startsWith('/project/')) {
        const projectName = projectData?.name || 'this project';
        return {
          pageName: 'Project Details',
          description: `Viewing details for ${projectName}`,
          helpTopics: [
            'Understanding project features and capabilities',
            'How to clone and use this project',
            'Customizing project settings',
            'Similar projects and alternatives',
            'Troubleshooting project issues'
          ],
          quickActions: [
            'How do I use this project?',
            'Can I customize this project?',
            'Show me similar projects',
            'What do the ratings mean?'
          ],
          contextPrompt: `You are helping a user understand a specific AI project: "${projectName}". ${projectData?.description || ''} Help them understand how to use it, what makes it valuable, how to clone it, and answer any questions about its features or implementation.`
        };
      }

      return {
        pageName: 'AI Assistant',
        description: 'General AI assistance',
        helpTopics: [
          'General AI and technology questions',
          'Help with using the platform',
          'Navigation and feature explanations',
          'Best practices and recommendations'
        ],
        quickActions: [
          'What can you help me with?',
          'How does this platform work?',
          'Show me around the interface',
          'What should I try first?'
        ],
        contextPrompt: `You are a helpful AI assistant for the MyAI Builder platform. Help users understand the platform, navigate its features, and accomplish their AI-related goals. Provide clear, friendly guidance and direct them to the right resources.`
      };
  }
};

export const generateContextualPrompt = (userMessage: string, context: PageContext): string => {
  return `${context.contextPrompt}

Current page: ${context.pageName} - ${context.description}

Key topics you can help with on this page:
${context.helpTopics.map(topic => `- ${topic}`).join('\n')}

User question: ${userMessage}

Please provide a helpful, specific response related to the current page context. If the question isn't directly related to this page, still try to connect it back to relevant features or guide them to the right section of the platform.

Guidelines for responses:
- Be concise but comprehensive
- Provide step-by-step instructions when helpful
- If mentioning external resources, format them as clickable links
- Focus on practical, actionable advice
- Connect responses back to the current page/context when possible`;
};

export const usePageContext = (projectData?: any) => {
  const location = useLocation();
  return getPageContext(location.pathname, projectData);
}; 