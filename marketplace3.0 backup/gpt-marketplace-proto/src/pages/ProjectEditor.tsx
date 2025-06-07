import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, ArrowPathIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import gptsData from '../data/gpts.json';
import type { GPT } from '../types';

const ProjectEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<GPT | null>(null);
  const [editMode, setEditMode] = useState<'form' | 'natural'>('form');
  const [naturalLanguagePrompt, setNaturalLanguagePrompt] = useState('');
  const [processingCommand, setProcessingCommand] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [actionSuccess, setActionSuccess] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [capabilities, setCapabilities] = useState('');
  const [actions, setActions] = useState('');
  const [instructionsSnippet, setInstructionsSnippet] = useState('');

  useEffect(() => {
    if (!id) return;
    
    // Check localStorage for user projects first
    const storedUserProjects = localStorage.getItem('userProjects');
    const userProjects = storedUserProjects ? JSON.parse(storedUserProjects) : [];
    
    // Look for the project in user projects first
    let foundProject = userProjects.find((p: GPT) => p.id === id);
    
    // If not found in user projects, check marketplace projects
    if (!foundProject) {
      const storedMarketplaceProjects = localStorage.getItem('marketplaceProjects');
      const marketplaceProjects = storedMarketplaceProjects ? JSON.parse(storedMarketplaceProjects) : gptsData;
      foundProject = marketplaceProjects.find((p: GPT) => p.id === id);
    }
    
    // If still not found, check default gptsData
    if (!foundProject) {
      foundProject = gptsData.find((p: GPT) => p.id === id);
    }
    
    if (foundProject) {
      setProject(foundProject);
      // Initialize form fields
      setName(foundProject.name);
      setDescription(foundProject.description);
      setCategory(foundProject.category);
      setTags(foundProject.tags.join(', '));
      setCapabilities(foundProject.capabilities.join(', '));
      setActions(foundProject.actions.join(', '));
      setInstructionsSnippet(foundProject.instructionsSnippet);
    }
  }, [id]);

  const saveProjectToLocalStorage = (updatedProject: GPT) => {
    // Check localStorage for user projects
    const storedUserProjects = localStorage.getItem('userProjects');
    const userProjects = storedUserProjects ? JSON.parse(storedUserProjects) : [];
    
    // Find the index of the project in user projects
    const projectIndex = userProjects.findIndex((p: GPT) => p.id === updatedProject.id);
    
    // If found, update it
    if (projectIndex !== -1) {
      userProjects[projectIndex] = updatedProject;
      localStorage.setItem('userProjects', JSON.stringify(userProjects));
    } else {
      // If not found in user projects, check marketplace projects
      const storedMarketplaceProjects = localStorage.getItem('marketplaceProjects');
      const marketplaceProjects = storedMarketplaceProjects ? JSON.parse(storedMarketplaceProjects) : gptsData;
      
      const marketplaceIndex = marketplaceProjects.findIndex((p: GPT) => p.id === updatedProject.id);
      
      if (marketplaceIndex !== -1) {
        marketplaceProjects[marketplaceIndex] = updatedProject;
        localStorage.setItem('marketplaceProjects', JSON.stringify(marketplaceProjects));
      }
    }
  };

  const handleNaturalLanguageEdit = () => {
    if (!naturalLanguagePrompt.trim()) {
      setActionMessage('Please enter an instruction to modify the project.');
      setActionSuccess(false);
      return;
    }

    setProcessingCommand(true);
    
    // Simulate processing the natural language command
    setTimeout(() => {
      if (!project) return;
      
      let updatedProject = { ...project };
      
      // Simple keyword-based parsing for demo purposes
      const prompt = naturalLanguagePrompt.toLowerCase();
      
      if (prompt.includes('name') || prompt.includes('title')) {
        const nameMatch = prompt.match(/to "([^"]+)"/);
        if (nameMatch && nameMatch[1]) {
          updatedProject.name = nameMatch[1];
          setName(nameMatch[1]);
        }
      }
      
      if (prompt.includes('description')) {
        const descMatch = prompt.match(/to "([^"]+)"/);
        if (descMatch && descMatch[1]) {
          updatedProject.description = descMatch[1];
          setDescription(descMatch[1]);
        }
      }
      
      if (prompt.includes('category')) {
        const catMatch = prompt.match(/to "([^"]+)"/);
        if (catMatch && catMatch[1]) {
          updatedProject.category = catMatch[1];
          setCategory(catMatch[1]);
        }
      }
      
      if (prompt.includes('tag') || prompt.includes('tags')) {
        const tagMatches = prompt.match(/add tags? "([^"]+)"/);
        if (tagMatches && tagMatches[1]) {
          const newTags = tagMatches[1].split(',').map(tag => tag.trim());
          updatedProject.tags = [...updatedProject.tags, ...newTags];
          setTags(updatedProject.tags.join(', '));
        }
        
        const removeTagMatches = prompt.match(/remove tags? "([^"]+)"/);
        if (removeTagMatches && removeTagMatches[1]) {
          const tagsToRemove = removeTagMatches[1].split(',').map(tag => tag.trim());
          updatedProject.tags = updatedProject.tags.filter(tag => !tagsToRemove.includes(tag));
          setTags(updatedProject.tags.join(', '));
        }
      }
      
      if (prompt.includes('capability') || prompt.includes('capabilities')) {
        const capabilityMatches = prompt.match(/add capabilities? "([^"]+)"/);
        if (capabilityMatches && capabilityMatches[1]) {
          const newCapabilities = capabilityMatches[1].split(',').map(cap => cap.trim());
          updatedProject.capabilities = [...updatedProject.capabilities, ...newCapabilities];
          setCapabilities(updatedProject.capabilities.join(', '));
        }
        
        const removeCapMatches = prompt.match(/remove capabilities? "([^"]+)"/);
        if (removeCapMatches && removeCapMatches[1]) {
          const capsToRemove = removeCapMatches[1].split(',').map(cap => cap.trim());
          updatedProject.capabilities = updatedProject.capabilities.filter(cap => !capsToRemove.includes(cap));
          setCapabilities(updatedProject.capabilities.join(', '));
        }
      }
      
      if (prompt.includes('action') || prompt.includes('actions')) {
        const actionMatches = prompt.match(/add actions? "([^"]+)"/);
        if (actionMatches && actionMatches[1]) {
          const newActions = actionMatches[1].split(',').map(act => act.trim());
          updatedProject.actions = [...updatedProject.actions, ...newActions];
          setActions(updatedProject.actions.join(', '));
        }
      }
      
      if (prompt.includes('instruction') || prompt.includes('prompt')) {
        const instructMatch = prompt.match(/to "([^"]+)"/);
        if (instructMatch && instructMatch[1]) {
          updatedProject.instructionsSnippet = instructMatch[1];
          setInstructionsSnippet(instructMatch[1]);
        }
      }
      
      // Update the version number and last updated date
      updatedProject.version = incrementVersion(updatedProject.version);
      updatedProject.lastUpdated = new Date().toISOString().split('T')[0];
      
      // Save changes to localStorage
      saveProjectToLocalStorage(updatedProject);
      
      setProject(updatedProject);
      setProcessingCommand(false);
      setActionSuccess(true);
      setActionMessage('Project updated successfully!');
      setNaturalLanguagePrompt('');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setActionSuccess(false);
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
  
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!project) return;
    
    // Update project with form values
    const updatedProject = {
      ...project,
      name,
      description,
      category,
      tags: tags.split(',').map(tag => tag.trim()),
      capabilities: capabilities.split(',').map(cap => cap.trim()),
      actions: actions.split(',').map(action => action.trim()),
      instructionsSnippet,
      version: incrementVersion(project.version),
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    
    // Save changes to localStorage
    saveProjectToLocalStorage(updatedProject);
    
    setProject(updatedProject);
    setActionSuccess(true);
    setActionMessage('Project updated successfully!');
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setActionSuccess(false);
      setActionMessage('');
    }, 3000);
  };

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Project not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/myprojects')}
          className="mb-6 inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back to My Projects
        </button>
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Edit Project</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setEditMode('form')}
              className={`px-4 py-2 rounded-full ${
                editMode === 'form'
                  ? 'bg-amber-400 text-black'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Form Editor
            </button>
            <button
              onClick={() => setEditMode('natural')}
              className={`px-4 py-2 rounded-full ${
                editMode === 'natural'
                  ? 'bg-amber-400 text-black'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Natural Language
            </button>
          </div>
        </div>
        
        {actionMessage && (
          <div className={`p-4 mb-6 rounded-lg ${actionSuccess ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
            {actionSuccess && <CheckCircleIcon className="h-5 w-5 inline mr-2" />}
            {actionMessage}
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          {editMode === 'form' ? (
            <form onSubmit={handleFormSubmit}>
              <div className="grid grid-cols-1 gap-6 mb-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Project Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  ></textarea>
                </div>
                
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    id="category"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="Education">Education</option>
                    <option value="Productivity">Productivity</option>
                    <option value="Development">Development</option>
                    <option value="Analytics">Analytics</option>
                    <option value="Research">Research</option>
                    <option value="Creative">Creative</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    id="tags"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="capabilities" className="block text-sm font-medium text-gray-700 mb-1">
                    Capabilities (comma-separated)
                  </label>
                  <input
                    type="text"
                    id="capabilities"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
                    value={capabilities}
                    onChange={(e) => setCapabilities(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="actions" className="block text-sm font-medium text-gray-700 mb-1">
                    Actions (comma-separated)
                  </label>
                  <input
                    type="text"
                    id="actions"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
                    value={actions}
                    onChange={(e) => setActions(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-1">
                    Instructions Snippet
                  </label>
                  <textarea
                    id="instructions"
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
                    value={instructionsSnippet}
                    onChange={(e) => setInstructionsSnippet(e.target.value)}
                    required
                  ></textarea>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-400 text-black font-medium rounded-full hover:bg-amber-500 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Edit with Natural Language</h2>
                <p className="text-gray-600 mb-4">
                  Type instructions to modify this project. For example:
                </p>
                <ul className="text-sm text-gray-500 list-disc list-inside mb-6">
                  <li>Change the name to "New Project Name"</li>
                  <li>Update the description to "A better description of what this does"</li>
                  <li>Change the category to "Education"</li>
                  <li>Add tags "new-tag, another-tag"</li>
                  <li>Remove tags "old-tag"</li>
                  <li>Add capabilities "new-capability"</li>
                  <li>Update the instructions to "New instructions text here"</li>
                </ul>
                
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
                  rows={6}
                  placeholder="Enter your instructions here..."
                  value={naturalLanguagePrompt}
                  onChange={(e) => setNaturalLanguagePrompt(e.target.value)}
                  disabled={processingCommand}
                ></textarea>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={handleNaturalLanguageEdit}
                  disabled={processingCommand || !naturalLanguagePrompt.trim()}
                  className={`inline-flex items-center px-6 py-2 rounded-full font-medium transition-colors ${
                    processingCommand || !naturalLanguagePrompt.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-amber-400 text-black hover:bg-amber-500'
                  }`}
                >
                  {processingCommand ? (
                    <>
                      <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Apply Changes'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Project Preview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Basic Information</h3>
              <p className="text-sm text-gray-500 mb-1">Name: <span className="text-gray-900">{project.name}</span></p>
              <p className="text-sm text-gray-500 mb-1">Category: <span className="text-gray-900">{project.category}</span></p>
              <p className="text-sm text-gray-500 mb-1">Version: <span className="text-gray-900">{project.version}</span></p>
              <p className="text-sm text-gray-500 mb-1">Last Updated: <span className="text-gray-900">{new Date(project.lastUpdated).toLocaleDateString()}</span></p>
              <p className="text-sm text-gray-500 mb-3">Created: <span className="text-gray-900">{new Date(project.dateCreated).toLocaleDateString()}</span></p>
              
              <h3 className="font-medium text-gray-700 mb-2">Description</h3>
              <p className="text-sm text-gray-900 mb-3">{project.description}</p>
              
              <h3 className="font-medium text-gray-700 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {project.tags.map((tag) => (
                  <span key={tag} className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Capabilities</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {project.capabilities.map((capability) => (
                  <span key={capability} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {capability}
                  </span>
                ))}
              </div>
              
              <h3 className="font-medium text-gray-700 mb-2">Actions</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {project.actions.map((action) => (
                  <span key={action} className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {action}
                  </span>
                ))}
              </div>
              
              <h3 className="font-medium text-gray-700 mb-2">Instructions Snippet</h3>
              <div className="bg-gray-50 p-3 rounded-lg text-sm">
                <p className="text-gray-900 whitespace-pre-wrap">{project.instructionsSnippet.substring(0, 200)}...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectEditor; 