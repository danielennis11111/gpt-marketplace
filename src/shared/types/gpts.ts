export interface GptProject {
  id: string;
  name: string;
  description: string;
  creator: string;
  creatorProfileImage: string;
  category: string;
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
}

export const gpts: GptProject[] = [
  {
    id: 'gpt-001',
    name: 'Marketing Copy Generator',
    description: 'Generates compelling marketing copy for various platforms (social media, ads, email).',
    creator: 'Alice Johnson',
    creatorProfileImage: 'https://randomuser.me/api/portraits/women/1.jpg',
    category: 'Marketing',
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
  // Add more GPT projects as needed for realism
]; 