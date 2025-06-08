import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import gptsData from '../data/gpts.json';

interface Project {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  verified: boolean;
  rating: number;
  clonedCount: number;
  [key: string]: any;
}

interface ProductType {
  id: string;
  name: string;
  description: string;
  categories: string[];
  [key: string]: any;
}

interface ProjectsContextType {
  projects: Project[];
  productTypes: ProductType[];
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

// Define product types (same as in HomePage)
const PRODUCT_TYPES: ProductType[] = [
  {
    id: 'ai-projects',
    name: 'AI Projects',
    description: 'Custom AI assistants and intelligent tools',
    categories: ['Productivity', 'Development', 'Analytics', 'Education', 'Research', 'Project Management', 'Music', 'Literature', 'Wellness', 'History'],
  },
  {
    id: 'extensions',
    name: 'Extensions',
    description: 'Embeddable chatbots and website integrations',
    categories: ['Extension'],
  },
  {
    id: 'local-models',
    name: 'Local Models',
    description: 'Downloadable AI models for local deployment',
    categories: ['Local Model'],
  },
  {
    id: 'tutorials',
    name: 'Tutorials',
    description: 'Step-by-step guides and educational resources',
    categories: ['Tutorial'],
  }
];

interface ProjectsProviderProps {
  children: ReactNode;
}

export const ProjectsProvider: React.FC<ProjectsProviderProps> = ({ children }) => {
  const value: ProjectsContextType = {
    projects: gptsData as Project[],
    productTypes: PRODUCT_TYPES,
  };

  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  );
};

export const useProjects = (): ProjectsContextType => {
  const context = useContext(ProjectsContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectsProvider');
  }
  return context;
}; 