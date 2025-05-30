import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import gptsData from '../data/gpts.json';
import { StarIcon, DocumentDuplicateIcon, PencilIcon, ArrowPathIcon, TrashIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import type { GPT } from '../types';

// Set the current user as ASU Enterprise Technology
const currentUser = "ASU Enterprise Technology";

const MyProjects: React.FC = () => {
  const [projects, setProjects] = useState<GPT[]>([]);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [naturalLanguagePrompt, setNaturalLanguagePrompt] = useState('');
  const [processingCommand, setProcessingCommand] = useState(false);
  const [commandSuccess, setCommandSuccess] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    // First, get any user-created projects from localStorage
    const storedProjects = localStorage.getItem('userProjects');
    const userCreatedProjects = storedProjects ? JSON.parse(storedProjects) : [];
    
    // Then, filter the default projects where the current user is the creator
    const defaultUserProjects = gptsData.filter((project) => project.creator.name === currentUser);
    
    // Combine both sets of projects
    setProjects([...userCreatedProjects, ...defaultUserProjects]);
  }, []);

  const handleNaturalLanguageEdit = (projectId: string) => {
    if (!naturalLanguagePrompt.trim()) {
      setActionMessage('Please enter an instruction to modify the project.');
      return;
    }

    setProcessingCommand(true);
    
    // Simulate processing the natural language command
    setTimeout(() => {
      const project = projects.find(p => p.id === projectId);
      if (!project) return;
      
      const updatedProjects = [...projects];
      const projectIndex = updatedProjects.findIndex(p => p.id === projectId);
      
      // Simple keyword-based parsing for demo purposes
      const prompt = naturalLanguagePrompt.toLowerCase();
      
      if (prompt.includes('name') || prompt.includes('title')) {
        const nameMatch = prompt.match(/to "([^"]+)"/);
        if (nameMatch && nameMatch[1]) {
          updatedProjects[projectIndex] = {
            ...updatedProjects[projectIndex],
            name: nameMatch[1]
          };
        }
      }
      
      if (prompt.includes('description')) {
        const descMatch = prompt.match(/to "([^"]+)"/);
        if (descMatch && descMatch[1]) {
          updatedProjects[projectIndex] = {
            ...updatedProjects[projectIndex],
            description: descMatch[1]
          };
        }
      }
      
      if (prompt.includes('tag') || prompt.includes('tags')) {
        const tagMatches = prompt.match(/add tags? "([^"]+)"/);
        if (tagMatches && tagMatches[1]) {
          const newTags = tagMatches[1].split(',').map(tag => tag.trim());
          updatedProjects[projectIndex] = {
            ...updatedProjects[projectIndex],
            tags: [...updatedProjects[projectIndex].tags, ...newTags]
          };
        }
        
        const removeTagMatches = prompt.match(/remove tags? "([^"]+)"/);
        if (removeTagMatches && removeTagMatches[1]) {
          const tagsToRemove = removeTagMatches[1].split(',').map(tag => tag.trim());
          updatedProjects[projectIndex] = {
            ...updatedProjects[projectIndex],
            tags: updatedProjects[projectIndex].tags.filter(tag => !tagsToRemove.includes(tag))
          };
        }
      }
      
      if (prompt.includes('capability') || prompt.includes('capabilities')) {
        const capabilityMatches = prompt.match(/add capabilities? "([^"]+)"/);
        if (capabilityMatches && capabilityMatches[1]) {
          const newCapabilities = capabilityMatches[1].split(',').map(cap => cap.trim());
          updatedProjects[projectIndex] = {
            ...updatedProjects[projectIndex],
            capabilities: [...updatedProjects[projectIndex].capabilities, ...newCapabilities]
          };
        }
      }
      
      // Update the version number
      updatedProjects[projectIndex] = {
        ...updatedProjects[projectIndex],
        version: incrementVersion(updatedProjects[projectIndex].version),
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      
      setProjects(updatedProjects);
      setProcessingCommand(false);
      setCommandSuccess(true);
      setActionMessage('Project updated successfully!');
      setNaturalLanguagePrompt('');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setCommandSuccess(false);
        setActionMessage('');
      }, 3000);
    }, 1500); // Simulate processing delay
  };
  
  const incrementVersion = (version: string): string => {
    // Handle various version formats
    if (version.includes('.')) {
      const parts = version.split('.');
      if (parts.length === 3) {
        // Semantic versioning: x.y.z
        const patch = parseInt(parts[2]) + 1;
        return `${parts[0]}.${parts[1]}.${patch}`;
      } else if (parts.length === 2) {
        // Simple versioning: x.y
        const minor = parseInt(parts[1]) + 1;
        return `${parts[0]}.${minor}`;
      }
    }
    // If we can't parse, just return the same version
    return version;
  };
  
  const closeEditor = () => {
    setEditingProject(null);
    setNaturalLanguagePrompt('');
    setActionMessage('');
  };
  
  const publishToMarketplace = (projectId: string) => {
    setActionMessage('Project submitted for verification. It will appear in the marketplace once approved.');
    setTimeout(() => {
      setActionMessage('');
    }, 3000);
  };
  
  const renderProjectCard = (project: GPT) => (
    <div key={project.id} className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{project.name}</h2>
          <div className="flex items-center mt-1">
            <p className="text-sm text-gray-500">Version {project.version}</p>
            <span className="mx-2 text-gray-300">•</span>
            <p className="text-sm text-gray-500">Last updated: {new Date(project.lastUpdated).toLocaleDateString()}</p>
            {project.verified && (
              <>
                <span className="mx-2 text-gray-300">•</span>
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  Verified
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center">
          <StarIcon className="h-5 w-5 text-gray-400 mr-1" />
          <span className="text-gray-600">{project.rating.toFixed(1)}</span>
          <span className="text-xs text-gray-500 ml-1">({project.reviewCount})</span>
        </div>
      </div>
      
      <p className="text-gray-700 mb-4 line-clamp-2">{project.description}</p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {project.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {tag}
          </span>
        ))}
        {project.tags.length > 3 && (
          <span className="text-gray-500 text-xs">+{project.tags.length - 3} more</span>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex items-center text-sm text-gray-500">
          <DocumentDuplicateIcon className="h-4 w-4 mr-1" />
          <span>{project.clonedCount} uses</span>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mt-4">
        <Link
          to={`/edit-project/${project.id}`}
          className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
        >
          <PencilIcon className="h-4 w-4 mr-1" />
          Edit
        </Link>
        <button
          onClick={() => publishToMarketplace(project.id)}
          className="inline-flex items-center px-4 py-2 bg-amber-400 text-black rounded-full hover:bg-amber-500 transition-colors"
        >
          <ArrowPathIcon className="h-4 w-4 mr-1" />
          Publish Update
        </button>
        <Link
          to={`/project/${project.id}`}
          className="inline-flex items-center px-4 py-2 bg-transparent border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My AI Projects</h1>
        <p className="text-gray-600 mb-6">Manage your AI templates and projects.</p>
        
        {projects.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 mb-4">You haven't created any projects yet.</p>
            <Link to="/create-project" className="px-4 py-2 bg-amber-400 text-black rounded-full hover:bg-amber-500 transition-colors">
              Create New Project
            </Link>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <span className="text-gray-600">{projects.length} projects</span>
              </div>
              <Link to="/create-project" className="px-4 py-2 bg-amber-400 text-black rounded-full hover:bg-amber-500 transition-colors">
                Create New Project
              </Link>
            </div>
            
            {projects.map(renderProjectCard)}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProjects; 