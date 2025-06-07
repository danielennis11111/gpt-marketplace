export interface Creator {
  name: string;
  avatar: string;
}

export interface Review {
  user: string;
  rating: number;
  comment: string;
}

export interface GPT {
  id: string;
  name: string;
  description: string;
  creator: {
    name: string;
    avatar: string;
  };
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
  asuriteSpecific?: boolean;
  capabilities: string[];
  actions: string[];
  version: string;
  dateCreated: string;
  lastUpdated: string;
  reviews: {
    user: string;
    rating: number;
    comment: string;
  }[];
  exampleConversations?: {
    user: string;
    assistant: string;
  }[];
  demoUrl?: string;
} 