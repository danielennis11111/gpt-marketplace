import React from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import type { GPT } from '../types';

export interface ProjectCardProps {
  project: GPT;
  isGridView: boolean;
  onViewDetails: (id: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, isGridView, onViewDetails }) => {
  if (isGridView) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 flex flex-col h-full">
        <div className="p-6 flex flex-col flex-grow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">{project.name}</h3>
            {project.verified && (
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Verified
              </span>
            )}
          </div>

          <div className="flex items-center mb-4">
            <img
              src={project.creator.avatar}
              alt={project.creator.name}
              className="w-8 h-8 rounded-full mr-2"
            />
            <span className="text-sm text-gray-600">{project.creator.name}</span>
          </div>
          
          <div className="flex items-center mb-4">
            <StarIcon className="h-5 w-5 text-yellow-400" />
            <span className="ml-1 text-gray-600">{project.rating.toFixed(1)}</span>
            <span className="ml-1 text-gray-500">({project.reviewCount})</span>
          </div>

          <p className="text-gray-600 mb-4">{project.description}</p>

          <div className="flex flex-wrap gap-2 mb-4">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex space-x-2 mt-auto">
            <button
              onClick={() => onViewDetails(project.id)}
              className="flex-1 bg-amber-400 text-black font-semibold py-2 px-4 rounded-full hover:bg-amber-500 transition-colors duration-200"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="p-6">
        <div className="flex items-start">
          <img
            src={project.creator.avatar}
            alt={project.creator.name}
            className="w-12 h-12 rounded-full mr-4"
          />
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                <p className="text-sm text-gray-500">by {project.creator.name}</p>
              </div>
              <div className="flex items-center">
                <StarIcon className="h-5 w-5 text-yellow-400 mr-1" />
                <span className="text-gray-700">{project.rating.toFixed(1)}</span>
                <span className="text-gray-500 text-sm ml-1">
                  ({project.reviewCount} reviews)
                </span>
              </div>
            </div>
            
            <p className="text-gray-600 mb-4">{project.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
            
            <div className="flex items-center justify-end mt-auto">
              <div className="flex space-x-2">
                <button
                  onClick={() => onViewDetails(project.id)}
                  className="bg-amber-400 hover:bg-amber-500 text-black font-semibold py-2 px-4 rounded-full transition-colors duration-200"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 