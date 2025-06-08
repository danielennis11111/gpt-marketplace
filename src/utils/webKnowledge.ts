// Web knowledge base for enhanced context-aware responses
export interface WebResource {
  title: string;
  url: string;
  description: string;
  tags: string[];
}

export const webKnowledge: Record<string, WebResource[]> = {
  ollama: [
    {
      title: "Ollama Official Website",
      url: "https://ollama.com",
      description: "Download and installation instructions for Ollama",
      tags: ["installation", "download", "setup"]
    },
    {
      title: "Ollama Models Library",
      url: "https://ollama.com/library",
      description: "Browse available models like Llama, Gemma, CodeLlama",
      tags: ["models", "library", "download"]
    },
    {
      title: "Ollama GitHub Repository",
      url: "https://github.com/ollama/ollama",
      description: "Source code, documentation, and community support",
      tags: ["github", "documentation", "support"]
    }
  ],
  
  apis: [
    {
      title: "Google Gemini API Documentation",
      url: "https://ai.google.dev/docs",
      description: "Official guide for setting up and using Gemini API",
      tags: ["gemini", "google", "api", "setup"]
    },
    {
      title: "OpenAI API Documentation",
      url: "https://platform.openai.com/docs",
      description: "Complete guide to OpenAI API integration",
      tags: ["openai", "api", "gpt", "setup"]
    },
    {
      title: "Anthropic Claude API",
      url: "https://docs.anthropic.com",
      description: "Documentation for integrating Claude AI",
      tags: ["anthropic", "claude", "api", "setup"]
    }
  ],

  tutorials: [
    {
      title: "AI Model Deployment Best Practices",
      url: "https://huggingface.co/docs/hub/models-deployment",
      description: "Enterprise-grade AI deployment strategies",
      tags: ["deployment", "enterprise", "best-practices"]
    },
    {
      title: "Local AI Privacy Guide",
      url: "https://github.com/awesome-selfhosted/awesome-selfhosted#machine-learning",
      description: "Self-hosted AI solutions for privacy",
      tags: ["privacy", "self-hosted", "local"]
    }
  ],

  security: [
    {
      title: "AI Security Best Practices",
      url: "https://owasp.org/www-project-ai-security-and-privacy-guide/",
      description: "OWASP guide for AI security and privacy",
      tags: ["security", "privacy", "owasp", "best-practices"]
    },
    {
      title: "API Rate Limiting Guide",
      url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Rate_limiting",
      description: "Understanding and implementing rate limiting",
      tags: ["rate-limiting", "api", "security"]
    }
  ],

  learning: [
    {
      title: "Machine Learning Crash Course",
      url: "https://developers.google.com/machine-learning/crash-course",
      description: "Google's free ML course for beginners",
      tags: ["learning", "machine-learning", "google", "free"]
    },
    {
      title: "Prompt Engineering Guide",
      url: "https://www.promptingguide.ai/",
      description: "Comprehensive guide to prompt engineering",
      tags: ["prompts", "engineering", "ai", "learning"]
    }
  ]
};

interface ScoredWebResource extends WebResource {
  relevanceScore: number;
}

export const getRelevantResources = (query: string, maxResults: number = 3): WebResource[] => {
  const lowercaseQuery = query.toLowerCase();
  const allResources: ScoredWebResource[] = [];
  
  // Collect all resources with relevance scores
  Object.values(webKnowledge).forEach(categoryResources => {
    categoryResources.forEach(resource => {
      let relevanceScore = 0;
      
      // Check title relevance
      if (resource.title.toLowerCase().includes(lowercaseQuery)) {
        relevanceScore += 3;
      }
      
      // Check description relevance
      if (resource.description.toLowerCase().includes(lowercaseQuery)) {
        relevanceScore += 2;
      }
      
      // Check tag relevance
      resource.tags.forEach(tag => {
        if (tag.toLowerCase().includes(lowercaseQuery) || lowercaseQuery.includes(tag.toLowerCase())) {
          relevanceScore += 1;
        }
      });
      
      if (relevanceScore > 0) {
        allResources.push({ ...resource, relevanceScore });
      }
    });
  });
  
  // Sort by relevance and return top results
  return allResources
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, maxResults)
    .map(({ relevanceScore, ...resource }) => resource);
};

export const formatResourcesForResponse = (resources: WebResource[]): string => {
  if (resources.length === 0) {
    return "";
  }
  
  let formatted = "\n\n📚 **Helpful Resources:**\n";
  resources.forEach((resource, index) => {
    formatted += `${index + 1}. [${resource.title}](${resource.url}) - ${resource.description}\n`;
  });
  
  return formatted;
}; 