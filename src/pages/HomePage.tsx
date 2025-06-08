import React, { useState, useEffect } from 'react';
import { FilterBar } from '../components/FilterBar';
import { ProjectCard } from '../components/ProjectCard';
import { ChatbotWidget } from '../components/ChatbotWidget';
import gptsData from '../data/gpts.json';
import heroImage from '../assets/ws-header-1920x516.jpg';
import { 
  Squares2X2Icon, 
  ListBulletIcon,
  CpuChipIcon,
  DocumentTextIcon,
  ChartBarIcon,
  PuzzlePieceIcon,
  LightBulbIcon,
  MegaphoneIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

// Define product types with their categories and icons
const PRODUCT_TYPES = [
  {
    id: 'ai-projects',
    name: 'AI Projects',
    icon: CpuChipIcon,
    description: 'Custom AI assistants and intelligent tools',
    categories: ['Productivity', 'Development', 'Analytics', 'Education', 'Research', 'Project Management', 'Music', 'Literature', 'Wellness', 'History'],
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  {
    id: 'extensions',
    name: 'Extensions',
    icon: PuzzlePieceIcon,
    description: 'Embeddable chatbots and website integrations',
    categories: [],
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  {
    id: 'repositories',
    name: 'Repositories',
    icon: DocumentTextIcon,
    description: 'Code repositories and development resources',
    categories: [],
    color: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  {
    id: 'local-models',
    name: 'Local Models',
    icon: ChartBarIcon,
    description: 'Downloadable AI models for local deployment',
    categories: [],
    color: 'bg-amber-100 text-amber-800 border-amber-200'
  }
];

const HomePage: React.FC = () => {
  const [projects, setProjects] = useState(gptsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [capabilityFilter, setCapabilityFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('');
  const [productTypeFilter, setProductTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [isGridView, setIsGridView] = useState(true);
  const [showChatbot, setShowChatbot] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let filteredProjects = gptsData;

    // Apply search filter
    if (searchTerm) {
      filteredProjects = filteredProjects.filter(
        (project) =>
          project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply product type filter
    if (productTypeFilter) {
      const productType = PRODUCT_TYPES.find(type => type.id === productTypeFilter);
      if (productType) {
        filteredProjects = filteredProjects.filter(
          (project) => productType.categories.includes(project.category)
        );
      }
    }

    // Apply category filter
    if (categoryFilter) {
      filteredProjects = filteredProjects.filter(
        (project) => project.category === categoryFilter
      );
    }

    // Apply capability filter
    if (capabilityFilter) {
      filteredProjects = filteredProjects.filter((project) =>
        project.capabilities.includes(capabilityFilter)
      );
    }

    // Apply action filter
    if (actionFilter) {
      filteredProjects = filteredProjects.filter((project) =>
        project.actions.includes(actionFilter)
      );
    }

    // Apply verification filter
    if (verificationFilter) {
      if (verificationFilter === 'verified') {
        filteredProjects = filteredProjects.filter(project => project.verified);
      } else if (verificationFilter === 'unverified') {
        filteredProjects = filteredProjects.filter(project => !project.verified);
      }
    }

    // Apply sorting
    switch (sortBy) {
      case 'popular':
        filteredProjects.sort((a, b) => b.clonedCount - a.clonedCount);
        break;
      case 'rating':
        filteredProjects.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filteredProjects.sort(
          (a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
        );
        break;
      case 'reviewCount':
        filteredProjects.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
    }

    setProjects(filteredProjects);
  }, [searchTerm, categoryFilter, capabilityFilter, actionFilter, verificationFilter, productTypeFilter, sortBy]);

  const handleVerificationChange = (filter: string) => {
    setVerificationFilter(filter);
  };

  const handleProductTypeFilter = (typeId: string) => {
    if (productTypeFilter === typeId) {
      setProductTypeFilter(''); // Clear filter if clicking the same type
      setCategoryFilter(''); // Also clear category filter
    } else {
      setProductTypeFilter(typeId);
      setCategoryFilter(''); // Clear category filter when selecting product type
    }
  };

  const getProjectCountByType = (typeId: string) => {
    const productType = PRODUCT_TYPES.find(type => type.id === typeId);
    if (!productType) return 0;
    
    return gptsData.filter(project => 
      productType.categories.includes(project.category)
    ).length;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div 
          className="relative rounded-xl shadow-lg overflow-hidden"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '300px'
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4">BetaLand Marketplace</h1>
              <p className="text-xl text-gray-200 max-w-2xl">
                Discover AI-powered tools, educational resources, and productivity solutions
              </p>
              <button
                onClick={() => setShowChatbot(true)}
                className="mt-6 inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <MegaphoneIcon className="w-5 h-5 mr-2" />
                Need Help? Ask Our AI Assistant
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Type Filter Buttons */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Shop by Product Type</h2>
            <button
              onClick={() => handleProductTypeFilter('')}
              className={`text-sm px-3 py-1 rounded-md transition-colors ${
                productTypeFilter === '' 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Show All
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PRODUCT_TYPES.map((type) => {
              const IconComponent = type.icon;
              const isActive = productTypeFilter === type.id;
              const projectCount = getProjectCountByType(type.id);
              
              return (
                <button
                  key={type.id}
                  onClick={() => handleProductTypeFilter(type.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left hover:shadow-md ${
                    isActive 
                      ? `${type.color} border-current shadow-md` 
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center mb-2">
                    <IconComponent className={`w-6 h-6 mr-2 ${
                      isActive ? 'text-current' : 'text-gray-600'
                    }`} />
                    <span className={`font-medium ${
                      isActive ? 'text-current' : 'text-gray-900'
                    }`}>
                      {type.name}
                    </span>
                  </div>
                  <p className={`text-sm mb-2 ${
                    isActive ? 'text-current opacity-80' : 'text-gray-600'
                  }`}>
                    {type.description}
                  </p>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    isActive 
                      ? 'bg-white bg-opacity-20' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {projectCount} projects
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FilterBar
          onSearch={setSearchTerm}
          onCategoryChange={setCategoryFilter}
          onSortChange={setSortBy}
          onCapabilityChange={setCapabilityFilter}
          onActionChange={setActionFilter}
          isGridView={isGridView}
          onViewChange={setIsGridView}
          onVerificationChange={handleVerificationChange}
        />

        {/* Results Summary */}
        <div className="mb-6 flex items-center justify-between">
          <div className="text-gray-600">
            {projects.length === gptsData.length ? (
              <span>Showing all {projects.length} projects</span>
            ) : (
              <span>Showing {projects.length} of {gptsData.length} projects</span>
            )}
            {productTypeFilter && (
              <span className="ml-2 text-blue-600 font-medium">
                • {PRODUCT_TYPES.find(t => t.id === productTypeFilter)?.name}
              </span>
            )}
          </div>
          
          <button
            onClick={() => setShowChatbot(true)}
            className="hidden sm:flex items-center px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          >
            <LightBulbIcon className="w-4 h-4 mr-2" />
            Need help finding something?
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <PuzzlePieceIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-500 mb-6">
                Try adjusting your filters or search terms to find what you're looking for.
              </p>
              <button
                onClick={() => setShowChatbot(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <LightBulbIcon className="w-4 h-4 mr-2" />
                Get Help Finding Projects
              </button>
            </div>
          </div>
        ) : (
          <div className={isGridView ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {projects.map((project) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                isGridView={isGridView}
                onViewDetails={(id) => navigate(`/project/${id}`)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Chatbot Widget */}
      {showChatbot && (
        <ChatbotWidget 
          onClose={() => setShowChatbot(false)}
          projects={gptsData}
          productTypes={PRODUCT_TYPES}
        />
      )}
    </div>
  );
};

export default HomePage; 