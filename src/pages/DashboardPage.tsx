import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  RocketLaunchIcon,
  DocumentTextIcon,
  LightBulbIcon,
  FolderIcon,
  PlusCircleIcon,
  ChartBarIcon,
  UserGroupIcon,
  SparklesIcon,
  CalendarIcon,
  AcademicCapIcon,
  UserIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

interface SharedProject {
  id: string;
  title: string;
  description: string;
  creator: string;
  dateShared: string;
  type: 'class' | 'research' | 'working-group';
  stats: {
    users: number;
    lastUpdated: string;
  };
}

export const DashboardPage: React.FC = () => {
  const [sharedProjects, setSharedProjects] = useState<SharedProject[]>([]);
  const [communityIdeasCount, setCommunityIdeasCount] = useState(0);
  const [userContributionsCount, setUserContributionsCount] = useState(0);
  
  useEffect(() => {
    // Mock shared projects - in a real app, these would come from an API
    const mockProjects: SharedProject[] = [
      {
        id: 'shared-1',
        title: 'CSE 572: Data Mining Assistant',
        description: 'AI assistant fine-tuned for data mining tasks, tutorials and assignments.',
        creator: 'Dr. Jane Smith',
        dateShared: '2024-03-15',
        type: 'class',
        stats: {
          users: 52,
          lastUpdated: '2024-04-01'
        }
      },
      {
        id: 'shared-2',
        title: 'ASU AI Research Copilot',
        description: 'Research assistant AI optimized for machine learning paper analysis and research methodology.',
        creator: 'AI Research Center',
        dateShared: '2024-02-28',
        type: 'research',
        stats: {
          users: 128,
          lastUpdated: '2024-04-05'
        }
      },
      {
        id: 'shared-3',
        title: 'Cloud Computing Project Helper',
        description: 'Technical assistant for AWS/Azure implementation guidance with ASU cloud resources integration.',
        creator: 'Enterprise Tech Team',
        dateShared: '2024-03-21',
        type: 'working-group',
        stats: {
          users: 34,
          lastUpdated: '2024-04-02'
        }
      }
    ];
    
    setSharedProjects(mockProjects);
    
    // Get community ideas count from localStorage
    const communityIdeas = JSON.parse(localStorage.getItem('communityIdeas') || '[]');
    setCommunityIdeasCount(communityIdeas.length);
    
    // Get user contributions count from localStorage
    const userContributions = JSON.parse(localStorage.getItem('userContributions') || '[]');
    setUserContributionsCount(userContributions.length);
  }, []);

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'class': 
        return <AcademicCapIcon className="w-8 h-8 text-blue-600" />;
      case 'research': 
        return <SparklesIcon className="w-8 h-8 text-purple-600" />;
      case 'working-group': 
        return <UserGroupIcon className="w-8 h-8 text-green-600" />;
      default:
        return <DocumentTextIcon className="w-8 h-8 text-blue-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-yellow-500 rounded-full flex items-center justify-center">
              <SparklesIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to META aiLand</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your central hub for AI project creation, collaboration, and discovery at ASU
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <ChartBarIcon className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{sharedProjects.length}</p>
                <p className="text-sm text-gray-600">AI Projects Shared with You</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <UserGroupIcon className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{communityIdeasCount}</p>
                <p className="text-sm text-gray-600">Community Ideas</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <SparklesIcon className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{userContributionsCount}</p>
                <p className="text-sm text-gray-600">Your Contributions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Shared AI Projects */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Shared AI Projects</h2>
            <Link 
              to="/marketplace"
              className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center"
            >
              View All
              <ArrowRightIcon className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sharedProjects.map(project => (
              <div key={project.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
                <div className="flex items-start mb-4">
                  {getTypeIcon(project.type)}
                  <div className="ml-3">
                    <h3 className="text-xl font-semibold text-gray-900">{project.title}</h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <UserIcon className="w-4 h-4 mr-1" />
                      <span>{project.creator}</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center text-gray-500">
                    <CalendarIcon className="w-4 h-4 mr-1" />
                    <span>Shared: {new Date(project.dateShared).toLocaleDateString()}</span>
                  </div>
                  <div className="text-gray-500">
                    <span>{project.stats.users} users</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Link
                    to={`/shared-project/${project.id}`}
                    className="w-full py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors text-center block"
                  >
                    Open Project
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              to="/prompt-guide"
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow group"
            >
              <DocumentTextIcon className="w-12 h-12 text-red-600 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Start with Prompt Guide</h3>
              <p className="text-gray-600">
                Get AI assistance to create perfect prompts and generate new project ideas
              </p>
            </Link>

            <Link
              to="/marketplace"
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow group"
            >
              <RocketLaunchIcon className="w-12 h-12 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Explore Marketplace</h3>
              <p className="text-gray-600">
                Discover and clone existing AI projects, extensions, and local models
              </p>
            </Link>

            <Link
              to="/community-ideas"
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow group"
            >
              <LightBulbIcon className="w-12 h-12 text-yellow-600 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Community Ideas</h3>
              <p className="text-gray-600">
                Browse popular community-generated ideas and contribute your own
              </p>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          {userContributionsCount > 0 ? (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="space-y-4">
                {JSON.parse(localStorage.getItem('userContributions') || '[]')
                  .slice(0, 5)
                  .map((contribution: any, index: number) => (
                    <div key={index} className="flex items-start p-3 hover:bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                        <SparklesIcon className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {contribution.type === 'viewed' ? 'Viewed' : 'Created'}: {contribution.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(contribution.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                <Link
                  to="/myprojects"
                  className="text-sm font-medium text-red-600 hover:text-red-700"
                >
                  View All Activity →
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="text-center py-8">
                <SparklesIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Activity</h3>
                <p className="text-gray-600 mb-4">
                  Start creating projects or exploring the marketplace to see your activity here
                </p>
                <Link
                  to="/prompt-guide"
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <DocumentTextIcon className="w-4 h-4 mr-2" />
                  Create Your First Project
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 