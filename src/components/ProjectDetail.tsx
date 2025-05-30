import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StarIcon } from '@heroicons/react/24/solid';
import { DocumentDuplicateIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline';
import gptsData from '../data/gpts.json';
import type { GPT } from '../types';

export const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<GPT | null>(null);
  const [cloningProject, setCloningProject] = useState(false);
  
  // State for review form
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    if (id) {
      // First check localStorage for the project
      const storedMarketplaceProjects = localStorage.getItem('marketplaceProjects');
      const marketplaceProjects = storedMarketplaceProjects ? JSON.parse(storedMarketplaceProjects) : gptsData;
      
      const storedUserProjects = localStorage.getItem('userProjects');
      const userProjects = storedUserProjects ? JSON.parse(storedUserProjects) : [];
      
      // Check both sources for the project
      let foundProject = marketplaceProjects.find((p: GPT) => p.id === id);
      
      if (!foundProject) {
        foundProject = userProjects.find((p: GPT) => p.id === id);
      }
      
      if (!foundProject) {
        foundProject = gptsData.find((p: GPT) => p.id === id);
      }
      
      setProject(foundProject || null);
    }
  }, [id]);

  const handleUseTemplate = () => {
    if (!project) return;
    
    setCloningProject(true);
    
    // Generate a new unique ID for the cloned project
    const newProjectId = `gpt-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    
    // Create a clone of the project with some modifications
    const clonedProject = {
      ...project,
      id: newProjectId,
      name: `Copy of ${project.name}`,
      creator: {
        name: "ASU Enterprise Technology", // Current user
        avatar: "/asu-logo.png"
      },
      verified: false,
      clonedCount: 0,
      rating: 0,
      reviewCount: 0,
      version: "1.0.0",
      dateCreated: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      reviews: []
    };
    
    // Increment the original project's cloned count in local storage
    const storedMarketplaceProjects = localStorage.getItem('marketplaceProjects');
    if (storedMarketplaceProjects) {
      const marketplaceProjects = JSON.parse(storedMarketplaceProjects);
      const projectIndex = marketplaceProjects.findIndex((p: GPT) => p.id === project.id);
      
      if (projectIndex !== -1) {
        marketplaceProjects[projectIndex] = {
          ...marketplaceProjects[projectIndex],
          clonedCount: marketplaceProjects[projectIndex].clonedCount + 1
        };
        localStorage.setItem('marketplaceProjects', JSON.stringify(marketplaceProjects));
      }
    }
    
    // Add the cloned project to user's projects
    const storedUserProjects = localStorage.getItem('userProjects');
    const userProjects = storedUserProjects ? JSON.parse(storedUserProjects) : [];
    localStorage.setItem('userProjects', JSON.stringify([...userProjects, clonedProject]));
    
    // Simulate a delay for better UX
    setTimeout(() => {
      setCloningProject(false);
      // Navigate to edit page or project customization
      navigate(`/edit-project/${newProjectId}`);
    }, 1000);
  };

  if (!project) {
    return <div className="container mx-auto px-4 py-8 text-center">Project not found</div>;
  }
  
  const handleRatingClick = (selectedRating: number) => {
    setRating(selectedRating);
  };
  
  const handleRatingHover = (hoveredRating: number) => {
    setHoveredRating(hoveredRating);
  };
  
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('Please select a rating before submitting');
      return;
    }
    
    // In a real app, we would send this to an API
    console.log('Submitting review:', {
      projectId: id,
      rating,
      comment
    });
    
    // Reset form and show success message
    setReviewSubmitted(true);
    setRating(0);
    setComment('');
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setReviewSubmitted(false);
    }, 3000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/')}
        className="mb-6 inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
      >
        <ArrowLeftIcon className="w-5 h-5 mr-2" />
        Back to Home
      </button>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main content area (80%) */}
        <div className="w-full lg:w-4/5 bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            {project.verified && (
              <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                Verified
              </span>
            )}
          </div>

          <div className="flex items-center mb-6">
            <img
              src={project.creator.avatar}
              alt={project.creator.name}
              className="w-12 h-12 rounded-full mr-4"
            />
            <div>
              <p className="text-gray-600">Created by {project.creator.name}</p>
              <p className="text-sm text-gray-500">
                Last updated: {new Date(project.lastUpdated).toLocaleDateString()}
              </p>
            </div>
          </div>

          <p className="text-gray-700 mb-6">{project.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Capabilities</h2>
              <div className="flex flex-wrap gap-2">
                {project.capabilities.map((capability: string) => (
                  <span
                    key={capability}
                    className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full"
                  >
                    {capability}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Actions</h2>
              <div className="flex flex-wrap gap-2">
                {project.actions.map((action: string) => (
                  <span
                    key={action}
                    className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full"
                  >
                    {action}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Instructions</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{project.instructionsSnippet}</p>
          </div>

          {project.exampleConversations && project.exampleConversations.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Example Conversations</h2>
              <div className="space-y-4">
                {project.exampleConversations.map((conversation: { user: string; assistant: string }, index: number) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium text-gray-900 mb-2">User: {conversation.user}</p>
                    <p className="text-gray-700">Assistant: {conversation.assistant}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Reviews</h2>
            <div className="flex items-center mb-4">
              <StarIcon className="h-6 w-6 text-yellow-400" />
              <span className="ml-2 text-xl font-semibold">{project.rating.toFixed(1)}</span>
              <span className="ml-2 text-gray-600">({project.reviewCount} reviews)</span>
            </div>
            
            {/* Review Form */}
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="font-semibold text-lg mb-4">Write a Review</h3>
              
              {reviewSubmitted ? (
                <div className="bg-green-100 text-green-800 p-3 rounded-md mb-4">
                  Thank you for your feedback! Your review has been submitted.
                </div>
              ) : (
                <form onSubmit={handleSubmitReview}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rating
                    </label>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRatingClick(star)}
                          onMouseEnter={() => handleRatingHover(star)}
                          onMouseLeave={() => handleRatingHover(0)}
                          className="focus:outline-none p-1"
                        >
                          {(hoveredRating || rating) >= star ? (
                            <StarIcon className="h-8 w-8 text-yellow-400" />
                          ) : (
                            <StarIconOutline className="h-8 w-8 text-gray-400" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                      Comment (optional)
                    </label>
                    <textarea
                      id="comment"
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
                      placeholder="Share your experience with this template..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    ></textarea>
                  </div>
                  
                  <button
                    type="submit"
                    className="px-6 py-2 bg-amber-400 text-black font-medium rounded-full hover:bg-amber-500 transition-colors"
                  >
                    Submit Review
                  </button>
                </form>
              )}
            </div>
            
            {/* Existing Reviews */}
            <div className="space-y-4">
              {project.reviews.length > 0 ? (
                project.reviews.map((review: { user: string; rating: number; comment: string }, index: number) => (
                  <div key={index} className="border-b pb-4">
                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`h-5 w-5 ${
                              i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-gray-600">{review.user}</span>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No reviews yet. Be the first to review!</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar (20%) */}
        <div className="w-full lg:w-1/5">
          <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
            <div className="space-y-4">
              {project.previewDemoLink && (
                <a
                  href={project.previewDemoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center px-6 py-3 bg-transparent border border-amber-400 text-sm font-medium rounded-full text-black hover:bg-amber-50 transition-colors"
                >
                  Try Demo
                </a>
              )}
              <button
                onClick={handleUseTemplate}
                disabled={cloningProject}
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-amber-400 text-sm font-medium rounded-full text-black hover:bg-amber-500 transition-colors disabled:bg-amber-300 disabled:cursor-not-allowed"
              >
                {cloningProject ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Copying Template...
                  </>
                ) : (
                  <>
                    <DocumentDuplicateIcon className="h-5 w-5 mr-2" />
                    Use Template
                  </>
                )}
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-700 mb-2">Template Info</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Version:</span>
                  <span className="text-sm font-medium">{project.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Created:</span>
                  <span className="text-sm font-medium">{new Date(project.dateCreated).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Updated:</span>
                  <span className="text-sm font-medium">{new Date(project.lastUpdated).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Times Used:</span>
                  <span className="text-sm font-medium">{project.clonedCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 