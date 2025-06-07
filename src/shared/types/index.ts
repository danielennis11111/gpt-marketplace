export interface GptProject {
  id: string;
  name: string;
  description: string;
  creator: {
    name: string;
    avatar: string;
  };
  category: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  verified: boolean;
  clonedCount: number;
  capabilities?: string[];
  actions?: string[];
  version?: string;
  dateCreated: string;
  lastUpdated?: string;
}

export interface GptData {
  projects: GptProject[];
} 