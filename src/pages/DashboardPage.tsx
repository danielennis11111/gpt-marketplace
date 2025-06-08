import React from 'react';
import { Link } from 'react-router-dom';
import {
  RocketLaunchIcon,
  DocumentTextIcon,
  LightBulbIcon,
  FolderIcon,
  PlusCircleIcon,
  ChartBarIcon,
  UserGroupIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

export const DashboardPage: React.FC = () => {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to AI Beta Land</h1>
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
                <p className="text-2xl font-bold text-gray-900">12</p>
                <p className="text-sm text-gray-600">Projects Created</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <UserGroupIcon className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">5</p>
                <p className="text-sm text-gray-600">Community Ideas</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <SparklesIcon className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">3</p>
                <p className="text-sm text-gray-600">Active Contributions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
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

          <Link
            to="/myprojects"
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow group"
          >
            <FolderIcon className="w-12 h-12 text-green-600 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">My Contributions</h3>
            <p className="text-gray-600">
              Manage your projects, extensions, models, and community contributions
            </p>
          </Link>

          <Link
            to="/contribute"
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow group"
          >
            <PlusCircleIcon className="w-12 h-12 text-purple-600 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Add to Marketplace</h3>
            <p className="text-gray-600">
              Share your AI projects, extensions, or local models with the community
            </p>
          </Link>

          <div className="bg-gradient-to-r from-red-600 to-yellow-500 rounded-xl shadow-lg p-6 text-white">
            <SparklesIcon className="w-12 h-12 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
            <p className="text-red-100">
              Advanced analytics, collaboration tools, and enhanced AI features
            </p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
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
        </div>
      </div>
    </div>
  );
}; 