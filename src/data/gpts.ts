export interface GptProject {
  id: string;
  name: string;
  description: string;
  creator: string;
  creatorProfileImage: string;
  category: string;
  type: 'ai-project' | 'embedding-solution' | 'repository' | 'local-model' | 'model-wrapper';
  tags: string[];
  instructionsSnippet: string;
  clonedCount: number;
  rating: number;
  reviewCount: number;
  verified: boolean;
  previewDemoLink: string;
  canBeCloned: boolean;
  feedbackWanted: boolean;
  asuriteSpecific: boolean;
  capabilities: string[];
  actions: string[];
  version: string;
  dateCreated: string;
  lastUpdated: string;
  reviews: { user: string; rating: number; comment: string }[];
  repositoryUrl?: string;
  modelName?: string;
  modelProvider?: 'ollama' | 'huggingface' | 'github';
  modelSize?: string;
  installCommand?: string;
  embedInstructions?: string;
  localModelCompatible?: boolean;
  approved?: boolean;
}

export const gpts: GptProject[] = [
  {
    id: 'gpt-001',
    name: 'Marketing Copy Generator',
    description: 'Generates compelling marketing copy for various platforms (social media, ads, email).',
    creator: 'Alice Johnson',
    creatorProfileImage: 'https://randomuser.me/api/portraits/women/1.jpg',
    category: 'Marketing',
    type: 'ai-project',
    tags: ['marketing', 'copywriting', 'ads', 'social media'],
    instructionsSnippet: 'You are a marketing expert. Generate persuasive copy...',
    clonedCount: 125,
    rating: 4.5,
    reviewCount: 32,
    verified: true,
    previewDemoLink: 'https://example.com/demo/marketing-copy',
    canBeCloned: true,
    feedbackWanted: true,
    asuriteSpecific: false,
    capabilities: ['web-browsing', 'code-interpreter'],
    actions: ['send-email', 'post-to-twitter'],
    version: '1.2',
    dateCreated: '2024-01-15',
    lastUpdated: '2024-03-01',
    reviews: [
      { user: 'Bob Smith', rating: 5, comment: 'This GPT saved me hours of work! Highly recommended.' },
      { user: 'Carol Davis', rating: 4, comment: 'Good starting point, but required some customization.' }
    ]
  },
  {
    id: 'gpt-002',
    name: 'Customer Service Chatbot',
    description: 'A chatbot designed to answer customer inquiries and resolve common issues.',
    creator: 'Bob Williams',
    creatorProfileImage: 'https://randomuser.me/api/portraits/men/2.jpg',
    category: 'Customer Service',
    type: 'ai-project',
    tags: ['customer service', 'chatbot', 'support'],
    instructionsSnippet: 'You are a helpful customer service agent...',
    clonedCount: 87,
    rating: 4.2,
    reviewCount: 21,
    verified: false,
    previewDemoLink: 'https://example.com/demo/customer-service',
    canBeCloned: true,
    feedbackWanted: false,
    asuriteSpecific: true,
    capabilities: ['web-browsing'],
    actions: ['create-ticket', 'update-crm'],
    version: '1.0',
    dateCreated: '2024-02-01',
    lastUpdated: '2024-02-15',
    reviews: []
  },
  {
    id: 'embed-001',
    name: 'Copy-Paste Chat Widget',
    description: 'Easy-to-embed AI chatbot widget that works on any website with simple copy-paste integration.',
    creator: 'Daniel Dennis',
    creatorProfileImage: 'https://randomuser.me/api/portraits/men/3.jpg',
    category: 'Web Integration',
    type: 'embedding-solution',
    tags: ['embed', 'widget', 'javascript', 'copy-paste', 'website'],
    instructionsSnippet: 'Simple copy-paste solution for adding AI chat to any website...',
    clonedCount: 245,
    rating: 4.8,
    reviewCount: 67,
    verified: true,
    previewDemoLink: 'https://example.com/demo/chat-widget',
    canBeCloned: true,
    feedbackWanted: false,
    asuriteSpecific: false,
    capabilities: ['customizable-ui', 'api-integration'],
    actions: ['copy-code', 'customize-widget'],
    version: '2.1',
    dateCreated: '2024-01-10',
    lastUpdated: '2024-03-15',
    embedInstructions: 'Copy the script tag and paste into your website head section',
    reviews: [
      { user: 'Sarah Miller', rating: 5, comment: 'Works perfectly! Set up in 5 minutes.' },
      { user: 'Mike Johnson', rating: 5, comment: 'Great documentation and easy integration.' }
    ]
  },
  {
    id: 'repo-001',
    name: 'Rate Limiter Interface',
    description: 'A beautiful web interface for interacting with local AI models with built-in rate limiting.',
    creator: 'Daniel Dennis',
    creatorProfileImage: 'https://randomuser.me/api/portraits/men/3.jpg',
    category: 'Developer Tools',
    type: 'repository',
    tags: ['local-ai', 'rate-limiting', 'web-interface', 'ollama', 'react'],
    instructionsSnippet: 'Full-featured web interface for local AI model interaction...',
    clonedCount: 156,
    rating: 4.6,
    reviewCount: 34,
    verified: true,
    previewDemoLink: 'https://github.com/danielennis11111/rate-limiter',
    canBeCloned: true,
    feedbackWanted: true,
    asuriteSpecific: false,
    capabilities: ['voice-interaction', 'document-analysis', 'rate-limiting'],
    actions: ['clone-repo', 'fork-repo'],
    version: '1.0',
    dateCreated: '2024-02-20',
    lastUpdated: '2024-03-20',
    repositoryUrl: 'https://github.com/danielennis11111/rate-limiter',
    modelProvider: 'github',
    localModelCompatible: true,
    reviews: [
      { user: 'Alex Chen', rating: 5, comment: 'Excellent rate limiting implementation!' },
      { user: 'Emma Wilson', rating: 4, comment: 'Great UI, easy to customize.' }
    ]
  },
  {
    id: 'model-001',
    name: 'Llama 3.2 3B',
    description: 'Efficient 3B parameter model from Meta, perfect for local deployment with good performance.',
    creator: 'Meta AI',
    creatorProfileImage: 'https://randomuser.me/api/portraits/lego/1.jpg',
    category: 'Language Models',
    type: 'local-model',
    tags: ['llama', 'meta', '3b', 'local', 'efficient'],
    instructionsSnippet: 'High-quality language model optimized for local deployment...',
    clonedCount: 1420,
    rating: 4.7,
    reviewCount: 89,
    verified: true,
    previewDemoLink: 'https://ollama.com/library/llama3.2:3b',
    canBeCloned: false,
    feedbackWanted: false,
    asuriteSpecific: false,
    capabilities: ['text-generation', 'conversation', 'code-assistance'],
    actions: ['download-model', 'view-docs'],
    version: '3.2',
    dateCreated: '2024-09-25',
    lastUpdated: '2024-09-25',
    modelName: 'llama3.2:3b',
    modelProvider: 'ollama',
    modelSize: '3B parameters (~2GB)',
    installCommand: 'ollama pull llama3.2:3b',
    approved: true,
    reviews: [
      { user: 'Tech User', rating: 5, comment: 'Great balance of performance and efficiency!' },
      { user: 'Local AI Fan', rating: 5, comment: 'Perfect for local development.' }
    ]
  },
  {
    id: 'model-002',
    name: 'Gemma 2B',
    description: 'Google\'s efficient 2B parameter model, excellent for resource-constrained environments.',
    creator: 'Google DeepMind',
    creatorProfileImage: 'https://randomuser.me/api/portraits/lego/2.jpg',
    category: 'Language Models',
    type: 'local-model',
    tags: ['gemma', 'google', '2b', 'efficient', 'local'],
    instructionsSnippet: 'Lightweight model with excellent performance for its size...',
    clonedCount: 987,
    rating: 4.5,
    reviewCount: 56,
    verified: true,
    previewDemoLink: 'https://ollama.com/library/gemma:2b',
    canBeCloned: false,
    feedbackWanted: false,
    asuriteSpecific: false,
    capabilities: ['text-generation', 'conversation', 'summarization'],
    actions: ['download-model', 'view-docs'],
    version: '2B',
    dateCreated: '2024-02-21',
    lastUpdated: '2024-02-21',
    modelName: 'gemma:2b',
    modelProvider: 'ollama',
    modelSize: '2B parameters (~1.4GB)',
    installCommand: 'ollama pull gemma:2b',
    approved: true,
    reviews: [
      { user: 'Efficiency Expert', rating: 4, comment: 'Great for low-resource setups.' },
      { user: 'Mobile Dev', rating: 5, comment: 'Works well on laptops!' }
    ]
  },
  {
    id: 'wrapper-001',
    name: 'Beta Land @ ASU Interface',
    description: 'Feature-rich web interface for local AI models with voice interaction, document analysis, and 11 specialized templates.',
    creator: 'ASU Innovation Lab',
    creatorProfileImage: 'https://randomuser.me/api/portraits/men/4.jpg',
    category: 'AI Interfaces',
    type: 'model-wrapper',
    tags: ['web-interface', 'voice', 'documents', 'templates', 'asu'],
    instructionsSnippet: 'Comprehensive AI playground with advanced features...',
    clonedCount: 312,
    rating: 4.8,
    reviewCount: 45,
    verified: true,
    previewDemoLink: 'https://github.com/danielennis11111/rate-limiter',
    canBeCloned: true,
    feedbackWanted: true,
    asuriteSpecific: true,
    capabilities: ['voice-interaction', 'document-processing', 'specialized-templates', 'rate-limiting'],
    actions: ['clone-repo', 'demo-live'],
    version: '1.0',
    dateCreated: '2024-03-01',
    lastUpdated: '2024-03-25',
    repositoryUrl: 'https://github.com/danielennis11111/rate-limiter',
    modelProvider: 'ollama',
    localModelCompatible: true,
    reviews: [
      { user: 'Student Dev', rating: 5, comment: 'Amazing for learning AI development!' },
      { user: 'Research Assistant', rating: 5, comment: 'Document analysis is incredibly useful.' }
    ]
  }
  // Add more items as needed for each category
]; 