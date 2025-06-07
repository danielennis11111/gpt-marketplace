import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjectCard } from '../components/ProjectCard';
import { FilterBar } from '../components/FilterBar';
import type { GPT } from '../types';
import gptsData from '../data/gpts.json';

export const Marketplace: React.FC = () => {
  const navigate = useNavigate();
  const [gpts, setGpts] = useState<GPT[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [capabilityFilter, setCapabilityFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [isGridView, setIsGridView] = useState(true);

  // Load data from localStorage if available, otherwise use default data
  useEffect(() => {
    const storedProjects = localStorage.getItem('marketplaceProjects');
    const initialData = storedProjects ? JSON.parse(storedProjects) : gptsData;
    setGpts(initialData);
  }, []);

  useEffect(() => {
    // Apply search and category filters
    let filteredGpts = JSON.parse(localStorage.getItem('marketplaceProjects') || JSON.stringify(gptsData));

    if (searchTerm) {
      filteredGpts = filteredGpts.filter((gpt: GPT) =>
        gpt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gpt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (gpt.tags && gpt.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }

    if (categoryFilter) {
      filteredGpts = filteredGpts.filter((gpt: GPT) => gpt.category === categoryFilter);
    }

    if (capabilityFilter) {
      filteredGpts = filteredGpts.filter((gpt: GPT) => gpt.capabilities.includes(capabilityFilter));
    }

    if (actionFilter) {
      filteredGpts = filteredGpts.filter((gpt: GPT) => gpt.actions.includes(actionFilter));
    }

    // Apply sorting
    filteredGpts = [...filteredGpts].sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.clonedCount - a.clonedCount;
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          return new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime();
        default:
          return 0;
      }
    });

    setGpts(filteredGpts);
  }, [searchTerm, categoryFilter, capabilityFilter, actionFilter, sortBy]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleCategoryChange = (category: string) => {
    setCategoryFilter(category);
  };

  const handleCapabilityChange = (capability: string) => {
    setCapabilityFilter(capability);
  };

  const handleActionChange = (action: string) => {
    setActionFilter(action);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
  };

  const handleViewChange = (isGrid: boolean) => {
    setIsGridView(isGrid);
  };

  const handleViewDetails = (id: string) => {
    navigate(`/project/${id}`);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">GPT Marketplace</h1>
      <FilterBar 
        onSearch={handleSearch}
        onCategoryChange={handleCategoryChange}
        onCapabilityChange={handleCapabilityChange}
        onActionChange={handleActionChange}
        onSortChange={handleSortChange}
        isGridView={isGridView}
        onViewChange={handleViewChange}
      />
      <div className={`grid ${isGridView ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-4`}>
        {gpts.map((gpt) => (
          <ProjectCard 
            key={gpt.id} 
            project={gpt} 
            isGridView={isGridView}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>
    </div>
  );
}; 