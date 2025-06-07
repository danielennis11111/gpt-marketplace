import type { GPT } from '../types';

export const gptsData: GPT[] = [
  {
    id: 'gpt-001',
    name: 'AI Code Assistant',
    description: 'An intelligent coding assistant that helps you write, debug, and optimize code across multiple programming languages.',
    creator: {
      name: 'Sarah Chen',
      avatar: 'https://i.pravatar.cc/150?img=1'
    },
    category: 'Development',
    tags: ['coding', 'debugging', 'optimization', 'programming'],
    instructionsSnippet: `You are an expert programming assistant with deep knowledge of multiple programming languages and frameworks.

Your capabilities include:
- Writing clean, efficient, and well-documented code
- Debugging and fixing issues in existing code
- Optimizing code for better performance
- Explaining complex programming concepts
- Suggesting best practices and design patterns

When helping users:
1. Always ask for clarification if requirements are unclear
2. Provide explanations for your solutions
3. Consider edge cases and error handling
4. Follow language-specific conventions and best practices
5. Suggest improvements when appropriate

Remember to:
- Be patient and thorough in your explanations
- Break down complex problems into manageable steps
- Consider security implications of your suggestions
- Stay up-to-date with the latest programming trends and tools`,
    clonedCount: 1250,
    rating: 4.8,
    reviewCount: 342,
    verified: true,
    demoUrl: 'https://example.com/demo/code-assistant',
    previewDemoLink: 'https://example.com/preview/code-assistant',
    canBeCloned: true,
    feedbackWanted: true,
    asuriteSpecific: false,
    capabilities: ['code-generation', 'debugging', 'optimization'],
    actions: ['create-file', 'edit-code', 'run-tests'],
    version: '2.1.0',
    dateCreated: '2024-01-15',
    lastUpdated: '2024-03-01',
    exampleConversations: [
      {
        user: 'Can you help me optimize this React component?',
        assistant: 'I\'d be happy to help optimize your React component. Could you share the code you\'d like to improve? I can suggest performance optimizations, better state management, or component structure improvements.'
      },
      {
        user: 'I\'m getting a TypeError when trying to access a property of undefined. Here\'s the error...',
        assistant: 'This error typically occurs when trying to access a property of an undefined object. Let\'s debug this step by step. First, let\'s add some console.logs to track the object\'s state...'
      }
    ],
    reviews: [
      {
        user: 'Alex Thompson',
        rating: 5,
        comment: 'This GPT has been a game-changer for my development workflow. It catches bugs I would have missed and suggests optimizations I hadn\'t considered.'
      },
      {
        user: 'Maria Rodriguez',
        rating: 4,
        comment: 'Great for quick code reviews and debugging. Sometimes needs more context to provide the best solutions, but overall very helpful.'
      }
    ]
  },
  {
    id: 'gpt-002',
    name: 'Creative Writing Coach',
    description: 'A writing assistant that helps you develop your creative writing skills, from brainstorming ideas to polishing your final draft.',
    creator: {
      name: 'James Wilson',
      avatar: 'https://i.pravatar.cc/150?img=2'
    },
    category: 'Writing',
    tags: ['writing', 'creativity', 'editing', 'storytelling'],
    instructionsSnippet: 'You are a creative writing coach...',
    clonedCount: 876,
    rating: 4.6,
    reviewCount: 215,
    verified: true,
    demoUrl: 'https://example.com/demo/writing-coach',
    previewDemoLink: 'https://example.com/preview/writing-coach',
    canBeCloned: true,
    feedbackWanted: true,
    asuriteSpecific: false,
    capabilities: ['idea-generation', 'editing', 'feedback'],
    actions: ['suggest-improvements', 'check-grammar', 'analyze-style'],
    version: '1.5.0',
    dateCreated: '2024-02-01',
    lastUpdated: '2024-02-28',
    exampleConversations: [
      {
        user: 'I\'m stuck on how to develop my main character. Any suggestions?',
        assistant: 'Let\'s explore your character\'s background, motivations, and conflicts. What drives them? What are their fears and desires? This will help create a more compelling character arc.'
      },
      {
        user: 'Can you help me improve the opening paragraph of my story?',
        assistant: 'I\'d be happy to help! A strong opening should hook the reader and set the tone. Let\'s look at your current opening and explore ways to make it more engaging.'
      }
    ],
    reviews: [
      {
        user: 'Emma Davis',
        rating: 5,
        comment: 'This GPT has helped me overcome writer\'s block and develop my writing skills. The feedback is always constructive and insightful.'
      },
      {
        user: 'Michael Brown',
        rating: 4,
        comment: 'Great for getting fresh perspectives on my writing. Sometimes the suggestions are a bit generic, but overall very helpful for improving my work.'
      }
    ]
  },
  {
    id: 'gpt-003',
    name: 'Research Paper Assistant',
    description: 'An academic writing assistant that helps you structure, write, and format research papers according to academic standards.',
    creator: {
      name: 'Dr. Emily Parker',
      avatar: 'https://i.pravatar.cc/150?img=3'
    },
    category: 'Academic',
    tags: ['research', 'academic', 'writing', 'citations'],
    instructionsSnippet: 'You are an academic writing assistant...',
    clonedCount: 543,
    rating: 4.7,
    reviewCount: 178,
    verified: true,
    demoUrl: 'https://example.com/demo/research-assistant',
    previewDemoLink: 'https://example.com/preview/research-assistant',
    canBeCloned: true,
    feedbackWanted: true,
    asuriteSpecific: true,
    capabilities: ['research', 'writing', 'citation'],
    actions: ['format-paper', 'check-citations', 'suggest-sources'],
    version: '1.2.0',
    dateCreated: '2024-02-15',
    lastUpdated: '2024-03-01',
    exampleConversations: [
      {
        user: 'How should I structure my literature review?',
        assistant: 'A literature review should be organized thematically or chronologically. Let\'s outline the key themes in your research and structure the review accordingly.'
      },
      {
        user: 'Can you help me format my citations in APA style?',
        assistant: 'I\'d be happy to help with APA formatting. Please share the citation information, and I\'ll show you the correct format for different types of sources.'
      }
    ],
    reviews: [
      {
        user: 'David Lee',
        rating: 5,
        comment: 'This GPT has been invaluable for my thesis work. It helps me maintain proper academic standards and improve my writing.'
      },
      {
        user: 'Sophie Anderson',
        rating: 4,
        comment: 'Great for formatting and citations. The suggestions for improving academic writing are always helpful and well-explained.'
      }
    ]
  }
]; 