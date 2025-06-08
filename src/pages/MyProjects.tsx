import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import gptsData from '../data/gpts.json';
import { 
  StarIcon, 
  DocumentDuplicateIcon, 
  PencilIcon, 
  TrashIcon,
  PlusCircleIcon,
  CpuChipIcon,
  PuzzlePieceIcon,
  AcademicCapIcon,
  EyeIcon,
  LinkIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import type { GPT } from '../types';

// Set the current user as ASU Enterprise Technology
const currentUser = "ASU Enterprise Technology";

interface ContributionItem {
  id: string;
  type: 'ai-project' | 'extension' | 'local-model' | 'tutorial' | 'viewed';
  name: string;
  description: string;
  link: string;
  category: string;
  tags: string[];
  createdAt: string;
  lastUpdated: string;
  status: 'draft' | 'published' | 'under-review';
  stats: {
    views: number;
    uses: number;
    rating: number;
    reviews: number;
  };
}

const MyContributions: React.FC = () => {
  const [aiProjects, setAiProjects] = useState<GPT[]>([]);
  const [contributions, setContributions] = useState<ContributionItem[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'ai-projects' | 'extensions' | 'local-models' | 'tutorials'>('all');

  useEffect(() => {
    // Load AI Projects from existing data
    const defaultUserProjects = gptsData.filter((project) => project.creator.name === currentUser);
    setAiProjects(defaultUserProjects);

    // Load other contributions from localStorage (mock data for demo)
    const mockContributions: ContributionItem[] = [
      {
        id: 'ext-1',
        type: 'extension',
        name: 'Customer Support Widget',
        description: 'Embeddable chat widget for customer support',
        link: 'https://github.com/user/support-widget',
        category: 'customer-support',
        tags: ['support', 'widget', 'embed'],
        createdAt: '2024-01-15',
        lastUpdated: '2024-01-20',
        status: 'published',
        stats: { views: 245, uses: 89, rating: 4.3, reviews: 12 }
      },
      {
        id: 'model-1',
        type: 'local-model',
        name: 'ASU Research Assistant',
        description: 'Fine-tuned model for academic research assistance',
        link: 'https://huggingface.co/asu/research-assistant',
        category: 'research',
        tags: ['research', 'academic', 'llama'],
        createdAt: '2024-01-10',
        lastUpdated: '2024-01-18',
        status: 'published',
        stats: { views: 1250, uses: 342, rating: 4.7, reviews: 28 }
      },
      {
        id: 'tut-1',
        type: 'tutorial',
        name: 'Building AI Extensions Guide',
        description: 'Complete guide for creating marketplace extensions',
        link: 'https://docs.asu.edu/ai-extensions',
        category: 'development',
        tags: ['tutorial', 'development', 'guide'],
        createdAt: '2024-01-05',
        lastUpdated: '2024-01-15',
        status: 'published',
        stats: { views: 890, uses: 156, rating: 4.5, reviews: 19 }
      }
    ];
    
    // Add user's community ideas to contributions
    const communityIdeas = JSON.parse(localStorage.getItem('communityIdeas') || '[]');
    console.log('Found community ideas:', communityIdeas.length);
    
    // Process community ideas into contributions format
    const userCommunityIdeas = communityIdeas.map((idea: any) => {
      // Convert tags string to array if needed
      const ideaTags = idea.tags 
        ? (typeof idea.tags === 'string' ? idea.tags.split(',').map((t: string) => t.trim()) : idea.tags) 
        : [idea.category || 'Development', idea.difficulty || 'intermediate'];
      
      return {
        id: idea.id,
        type: 'ai-project',
        name: idea.title || 'Untitled Idea',
        description: idea.description || (idea.prompt ? idea.prompt.substring(0, 150) + '...' : 'No description'),
        link: `/community-ideas/${idea.id}`,
        category: idea.category || 'Development',
        tags: ideaTags,
        createdAt: idea.createdAt || idea.timestamp || new Date().toISOString(),
        lastUpdated: idea.lastSuggested || idea.timestamp || new Date().toISOString(),
        status: 'published',
        stats: { 
          views: idea.views || 0, 
          uses: idea.popularity || idea.likes || 0, 
          rating: idea.likes ? (idea.likes > 0 ? 4.5 : 0) : 0, 
          reviews: 0 
        }
      };
    });
    
    console.log('Processed community ideas:', userCommunityIdeas.length);
      
    // Add user's viewed items from contribution history
    const userActivity = JSON.parse(localStorage.getItem('userActivity') || '{}');
    const viewedIds = userActivity.viewed || [];
    
    // Create an array of viewed items based on community ideas
    const userViewedItems = viewedIds
      .map((id: string) => {
        const viewedIdea = communityIdeas.find((idea: any) => idea.id === id);
        if (!viewedIdea) return null;
        
        return {
          id: viewedIdea.id,
          type: 'viewed',
          name: viewedIdea.title || 'Viewed Item',
          description: viewedIdea.description || 'You viewed this item recently',
          link: `/community-ideas/${viewedIdea.id}`,
          category: viewedIdea.category || 'history',
          tags: ['viewed', 'history'],
          createdAt: viewedIdea.timestamp || new Date().toISOString(),
          lastUpdated: viewedIdea.timestamp || new Date().toISOString(),
          status: 'published',
          stats: { views: 1, uses: 0, rating: 0, reviews: 0 }
        };
      })
      .filter(Boolean); // Remove nulls
    
    // Combine all contributions
    setContributions([...userCommunityIdeas, ...mockContributions, ...userViewedItems]);
  }, []);

  const getFilteredItems = () => {
    switch (activeTab) {
      case 'ai-projects':
                 return aiProjects.map(project => ({
           id: project.id,
           type: 'ai-project' as const,
           name: project.name,
           description: project.description,
           link: `/project/${project.id}`,
           category: project.category,
           tags: project.tags,
           createdAt: '2024-01-01',
           lastUpdated: project.lastUpdated,
           status: 'published' as const,
           stats: {
             views: 0,
             uses: project.clonedCount,
             rating: project.rating,
             reviews: project.reviewCount
           }
         }));
      case 'extensions':
        return contributions.filter(item => item.type === 'extension');
      case 'local-models':
        return contributions.filter(item => item.type === 'local-model');
      case 'tutorials':
        return contributions.filter(item => item.type === 'tutorial');
      default:
                 const allAiProjects = aiProjects.map(project => ({
           id: project.id,
           type: 'ai-project' as const,
           name: project.name,
           description: project.description,
           link: `/project/${project.id}`,
           category: project.category,
           tags: project.tags,
           createdAt: '2024-01-01',
           lastUpdated: project.lastUpdated,
           status: 'published' as const,
           stats: {
             views: 0,
             uses: project.clonedCount,
             rating: project.rating,
             reviews: project.reviewCount
           }
         }));
        return [...allAiProjects, ...contributions];
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ai-project': return PlusCircleIcon;
      case 'extension': return PuzzlePieceIcon;
      case 'local-model': return CpuChipIcon;
      case 'tutorial': return AcademicCapIcon;
      case 'viewed': return EyeIcon;
      default: return DocumentDuplicateIcon;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ai-project': return 'from-red-600 to-yellow-500';
      case 'extension': return 'from-blue-500 to-cyan-500';
      case 'local-model': return 'from-purple-500 to-pink-500';
      case 'tutorial': return 'from-green-500 to-teal-500';
      case 'viewed': return 'from-amber-500 to-orange-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Published</span>;
      case 'under-review':
        return <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Under Review</span>;
      case 'draft':
        return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Draft</span>;
      default:
        return null;
    }
  };

  const handleDelete = (id: string, type: string) => {
    if (confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      if (type === 'ai-project') {
        setAiProjects(prev => prev.filter(item => item.id !== id));
      } else {
        setContributions(prev => prev.filter(item => item.id !== id));
      }
    }
  };

  const renderContributionCard = (item: any) => {
    const Icon = getTypeIcon(item.type);
    const colorClass = getTypeColor(item.type);
    
    return (
      <div key={item.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:border-gray-300 transition-all">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${colorClass} flex items-center justify-center mr-4`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm text-gray-500 capitalize">{item.type.replace('-', ' ')}</span>
                <span className="text-gray-300">•</span>
                <span className="text-sm text-gray-500">{new Date(item.lastUpdated).toLocaleDateString()}</span>
                {getStatusBadge(item.status)}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <StarIcon className="h-4 w-4 text-yellow-400" />
            <span className="text-sm text-gray-600">{item.stats.rating.toFixed(1)}</span>
            <span className="text-xs text-gray-500">({item.stats.reviews})</span>
          </div>
        </div>

        <p className="text-gray-600 mb-4 line-clamp-2">{item.description}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {item.tags.slice(0, 4).map((tag: string) => (
            <span key={tag} className="bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
          {item.tags.length > 4 && (
            <span className="text-gray-500 text-xs">+{item.tags.length - 4} more</span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <EyeIcon className="h-4 w-4 mr-1" />
              <span>{item.stats.views}</span>
            </div>
            <div className="flex items-center">
              <DocumentDuplicateIcon className="h-4 w-4 mr-1" />
              <span>{item.stats.uses}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {item.type === 'ai-project' ? (
              <Link
                to={`/edit-project/${item.id}`}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Edit Project"
              >
                <PencilIcon className="h-4 w-4" />
              </Link>
            ) : (
              <button
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Edit"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
            )}
            
            <Link
              to={item.type === 'ai-project' ? item.link : item.link}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="View"
              target={item.type !== 'ai-project' ? '_blank' : undefined}
            >
              {item.type === 'ai-project' ? <EyeIcon className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
            </Link>
            
            <button
              onClick={() => handleDelete(item.id, item.type)}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const filteredItems = getFilteredItems();
  const totalItems = aiProjects.length + contributions.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Contributions</h1>
            <p className="text-gray-600">Manage all your marketplace contributions in one place.</p>
          </div>
          <Link 
            to="/contribute"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-yellow-500 text-white rounded-lg hover:from-red-700 hover:to-yellow-600 transition-all transform hover:scale-105 shadow-lg"
          >
            <PlusCircleIcon className="w-5 h-5 mr-2" />
            New Contribution
          </Link>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'all', label: 'All', count: totalItems },
              { key: 'ai-projects', label: 'AI Projects', count: aiProjects.length },
              { key: 'extensions', label: 'Extensions', count: contributions.filter(c => c.type === 'extension').length },
              { key: 'local-models', label: 'Local Models', count: contributions.filter(c => c.type === 'local-model').length },
              { key: 'tutorials', label: 'Tutorials', count: contributions.filter(c => c.type === 'tutorial').length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <PlusCircleIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No contributions yet</h3>
            <p className="text-gray-600 mb-6">Start sharing your work with the ASU community.</p>
            <Link 
              to="/contribute"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-yellow-500 text-white rounded-lg hover:from-red-700 hover:to-yellow-600 transition-all"
            >
              <PlusCircleIcon className="w-5 h-5 mr-2" />
              Make Your First Contribution
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredItems.map(renderContributionCard)}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyContributions; 