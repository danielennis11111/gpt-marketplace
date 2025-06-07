import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import gptsData from '../data/gpts.json';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log('ProjectDetail mounted with id:', id);
    console.log('Available projects:', gptsData.projects);
  }, [id]);

  const project = gptsData.projects.find(p => p.id === id);
  console.log('Found project:', project);

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
          <p className="text-gray-600 mb-4">ID: {id}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/')}
          className="mb-6 text-black-600 hover:text-black-700 flex items-center"
        >
          ← Back to Projects
        </button>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              {project.verified ? (
                <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                  Verified
                </span>
              ) : (
                <span className="bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full">
                  New
                </span>
              )}
            </div>

            <div className="flex items-center space-x-4 mb-6">
              <img
                src={project.creator.avatar}
                alt={project.creator.name}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <p className="text-gray-900 font-medium">{project.creator.name}</p>
                <p className="text-gray-500 text-sm">Creator</p>
              </div>
            </div>

            <div className="prose max-w-none mb-8">
              <p className="text-gray-600 text-lg">{project.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-500 text-sm">Rating</p>
                <p className="text-2xl font-bold text-gray-900">{project.rating} / 5</p>
                <p className="text-gray-500 text-sm">{project.reviewCount} reviews</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-500 text-sm">Times Cloned</p>
                <p className="text-2xl font-bold text-gray-900">{project.clonedCount}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-500 text-sm">Category</p>
                <p className="text-2xl font-bold text-gray-900">{project.category}</p>
              </div>
            </div>

            <div className="flex space-x-4">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 flex-1">
                Clone Project
              </button>
              <button className="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 flex-1">
                View Documentation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail; 