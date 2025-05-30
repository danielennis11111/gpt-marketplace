import React, { useState, useEffect } from 'react';
import { FilterBar } from '../components/FilterBar';
import { ProjectCard } from '../components/ProjectCard';
import gptsData from '../data/gpts.json';
import heroImage from '../assets/ws-header-1920x516.jpg';
import { Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const [projects, setProjects] = useState(gptsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [capabilityFilter, setCapabilityFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [isGridView, setIsGridView] = useState(true);
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
  }, [searchTerm, categoryFilter, capabilityFilter, actionFilter, verificationFilter, sortBy]);

  const handleVerificationChange = (filter: string) => {
    setVerificationFilter(filter);
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
            <h1 className="text-4xl font-bold text-white">BetaLand Templates</h1>
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

        {projects.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 text-lg">No projects match your filters. Try broadening your search.</p>
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
    </div>
  );
};

export default HomePage; 