import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    description: string;
    creator: {
      name: string;
      avatar: string;
    };
    rating: number;
    reviewCount: number;
    verified: boolean;
    clonedCount: number;
  };
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    console.log('Navigating to project:', project.id);
    navigate(`/project/${project.id}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-xl transition duration-300 flex flex-col cursor-pointer">
      <div className="flex items-center mb-3">
        <div className="relative mr-3">
          <div className="w-12 h-12 flex-shrink-0 rounded-full overflow-hidden bg-gray-100">
            <img src={project.creator.avatar} alt={project.creator.name} className="w-full h-auto object-cover" />
          </div>
          {project.verified && (
            <span className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
              </svg>
            </span>
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{project.name}</h3>
          <span className="text-sm text-gray-500">by {project.creator.name}</span>
        </div>
      </div>
      <p className="text-gray-700 text-sm mb-4 line-clamp-2">{project.description}</p>
      <div className="flex items-center text-sm text-gray-500 mb-2">
        <span className="flex items-center mr-4">
          {[...Array(5)].map((_, i) => (
            <span key={i} className={i < Math.floor(project.rating) ? "text-yellow-400" : "text-gray-300"}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005z" clipRule="evenodd" />
              </svg>
            </span>
          ))}
          <span className="ml-1">({project.reviewCount})</span>
        </span>
        <span>{project.clonedCount} clones</span>
      </div>
      <div className="flex justify-between items-center">
        <button 
          onClick={handleViewDetails}
          className="mt-auto w-full bg-black hover:bg-gray-900 text-white font-semibold py-2 px-4 rounded transition-colors duration-200"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default ProjectCard; 