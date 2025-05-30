import React, { useState } from 'react';
import { Squares2X2Icon, ListBulletIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';

export interface FilterBarProps {
  onSearch: (term: string) => void;
  onCategoryChange: (category: string) => void;
  onSortChange: (sort: string) => void;
  onCapabilityChange: (capability: string) => void;
  onActionChange: (action: string) => void;
  onVerificationChange?: (verification: string) => void;
  isGridView: boolean;
  onViewChange: (isGrid: boolean) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  onSearch,
  onCategoryChange,
  onSortChange,
  onCapabilityChange,
  onActionChange,
  onVerificationChange,
  isGridView,
  onViewChange
}) => {
  const [showFilters, setShowFilters] = useState(false);

  // Update the verification filter handler
  const handleVerificationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onVerificationChange) {
      onVerificationChange(e.target.value);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
      <div className="flex flex-col space-y-4">
        {/* Search and Toggle Filters */}
        <div className="flex items-center">
          <div className="flex-grow">
            <input
              type="text"
              placeholder="Search BetaLand Templates..."
              className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="ml-3 p-2 rounded-md hover:bg-gray-100 border border-gray-300 flex items-center"
          >
            {showFilters ? (
              <>
                <XMarkIcon className="h-5 w-5 text-gray-600" />
                <span className="ml-1 hidden sm:inline">Hide Filters</span>
              </>
            ) : (
              <>
                <FunnelIcon className="h-5 w-5 text-gray-600" />
                <span className="ml-1 hidden sm:inline">Show Filters</span>
              </>
            )}
          </button>
          <button
            onClick={() => onViewChange(!isGridView)}
            className="ml-3 p-2 rounded-md hover:bg-gray-100 border border-gray-300"
            title={isGridView ? "Switch to List View" : "Switch to Grid View"}
          >
            {isGridView ? (
              <ListBulletIcon className="h-5 w-5 text-gray-600" />
            ) : (
              <Squares2X2Icon className="h-5 w-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Category Filter - Enhanced with more options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => onCategoryChange(e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="Productivity">Productivity</option>
                <option value="Development">Development</option>
                <option value="Education">Education</option>
                <option value="Analytics">Analytics</option>
                <option value="Research">Research</option>
                <option value="Project Management">Project Management</option>
                <option value="Music">Music</option>
                <option value="Literature">Literature</option>
                <option value="History">History</option>
                <option value="Wellness">Wellness</option>
              </select>
            </div>

            {/* Capability Filter - Enhanced with more options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capability</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => onCapabilityChange(e.target.value)}
              >
                <option value="">All Capabilities</option>
                <option value="Content Creation">Content Creation</option>
                <option value="Analysis">Analysis</option>
                <option value="Learning">Learning</option>
                <option value="Integration">Integration</option>
                <option value="Planning">Planning</option>
                <option value="code-conversion">Code Conversion</option>
                <option value="syntax-analysis">Syntax Analysis</option>
                <option value="music-generation">Music Generation</option>
                <option value="emotion-analysis">Emotion Analysis</option>
                <option value="process-analysis">Process Analysis</option>
                <option value="text-analysis">Text Analysis</option>
                <option value="literary-criticism">Literary Criticism</option>
                <option value="historical-simulation">Historical Simulation</option>
                <option value="dialogue-generation">Dialogue Generation</option>
                <option value="writing-prompts">Writing Prompts</option>
              </select>
            </div>

            {/* Action Filter - Enhanced with more options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => onActionChange(e.target.value)}
              >
                <option value="">All Actions</option>
                <option value="Generate">Generate</option>
                <option value="Create">Create</option>
                <option value="Analyze">Analyze</option>
                <option value="Configure">Configure</option>
                <option value="Track">Track</option>
                <option value="convert-code">Convert Code</option>
                <option value="optimize-output">Optimize Output</option>
                <option value="generate-melody">Generate Melody</option>
                <option value="export-midi">Export MIDI</option>
                <option value="generate-checklist">Generate Checklist</option>
                <option value="export-to-jira">Export to Jira</option>
                <option value="analyze-text">Analyze Text</option>
                <option value="compare-styles">Compare Styles</option>
                <option value="simulate-conversation">Simulate Conversation</option>
              </select>
            </div>

            {/* Sort Options */}
            <div className="md:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => onSortChange(e.target.value)}
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
                <option value="reviewCount">Most Reviewed</option>
              </select>
            </div>

            {/* Verification Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Verification</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={handleVerificationChange}
              >
                <option value="">All Projects</option>
                <option value="verified">Verified Only</option>
                <option value="unverified">Unverified Only</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 