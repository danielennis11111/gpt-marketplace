import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import { ProjectDetail } from './components/ProjectDetail';
import LearningPage from './pages/LearningPage';
import MyProjects from './pages/MyProjects';
import ProjectEditor from './pages/ProjectEditor';
import CreateProject from './pages/CreateProject';
import CommunityIdeas from './pages/CommunityIdeas';
import { RateLimiterWrapper } from './components/RateLimiterWrapper';
import { FloatingChatButton } from './components/FloatingChatButton';
import { ProjectsProvider } from './contexts/ProjectsContext';
import {
  HomeIcon,
  PlusCircleIcon,
  FolderIcon,
  RocketLaunchIcon,
  AcademicCapIcon,
  ScaleIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  UserCircleIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import siteLogo from './assets/site-logo.png';

// Interface for NavItem props
interface NavItemProps {
  to: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  children: ReactNode;
  external?: boolean;
}

// NavItem component for consistent styling and active state
const NavItem: React.FC<NavItemProps> = ({ to, icon, children, external = false }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  const activeClass = isActive ? "text-maroon-700 font-medium" : "text-gray-700";
  const IconComponent = icon;
  
  const content = (
    <>
      <IconComponent className={`w-5 h-5 mr-2 ${isActive ? "text-maroon-700" : "text-gray-500"}`} />
      {children}
    </>
  );
  
  if (external) {
    return (
      <a
        href={to}
        className={`flex items-center px-4 py-2 ${activeClass} hover:bg-gray-100 rounded-md`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {content}
      </a>
    );
  }
  
  return (
    <Link
      to={to}
      className={`flex items-center px-4 py-2 ${activeClass} hover:bg-gray-100 rounded-md`}
    >
      {content}
    </Link>
  );
};

const AppContent = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile menu button */}
      <div className="fixed top-0 left-0 z-40 flex items-center p-4 md:hidden">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-gray-700 hover:text-gray-900 focus:outline-none"
        >
          {sidebarOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <div 
        className={`w-64 bg-white shadow-lg flex flex-col fixed inset-y-0 left-0 z-30 transition-transform duration-300 transform md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative`}
      >
        {/* Logo and Title */}
        <div className="p-4 flex items-center">
          <img src={siteLogo} alt="MyAI Builder Logo" className="w-10 mr-2" />
          <h1 className="text-base font-bold text-gray-800">MyAI Builder</h1>
          <div className="inline-flex items-center bg-amber-400 px-2 py-1 text-xs font-bold text-black rounded-md ml-2">
            BETA
          </div>
          
          {/* Mobile close button */}
          <button 
            onClick={() => setSidebarOpen(false)}
            className="ml-auto text-gray-500 md:hidden"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        {/* Main Navigation */}
        <nav className="mt-4 flex-1 overflow-y-auto px-4">
          <div className="space-y-2">
            <NavItem to="https://platform-beta.aiml.asu.edu/" icon={HomeIcon} external={true}>
              Dashboard
            </NavItem>
            <NavItem to="/create-project" icon={PlusCircleIcon}>
              Create New Project
            </NavItem>
            <NavItem to="/myprojects" icon={FolderIcon}>
              MyAI Projects
            </NavItem>
            <NavItem to="/marketplace" icon={RocketLaunchIcon}>
              BetaLand Templates
            </NavItem>
            <NavItem to="/community-ideas" icon={LightBulbIcon}>
              Community Ideas
            </NavItem>
            <NavItem to="/rate-limiter" icon={ChatBubbleLeftRightIcon}>
              Beta Land @ ASU
            </NavItem>
            <NavItem to="/learning" icon={AcademicCapIcon}>
              Learning
            </NavItem>
          </div>

          {/* Divider */}
          <div className="my-4 border-t border-gray-200"></div>
          
          {/* Other CreateAI apps section */}
          <div className="mb-2">
            <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Other CreateAI apps
            </h3>
          </div>
          <div className="space-y-2">
            <NavItem to="https://compare-beta.aiml.asu.edu/" icon={ScaleIcon} external={true}>
              Model Comparison
            </NavItem>
            <NavItem to="https://asugpt-beta.aiml.asu.edu/" icon={ChatBubbleLeftRightIcon} external={true}>
              ASU GPT
            </NavItem>
          </div>

          {/* Divider */}
          <div className="my-4 border-t border-gray-200"></div>
          
          {/* Support section */}
          <div className="mb-2">
            <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Support
            </h3>
          </div>
          <div className="space-y-2">
            <NavItem to="#" icon={ExclamationTriangleIcon}>
              Report A Problem
            </NavItem>
            <NavItem to="#" icon={ChatBubbleOvalLeftEllipsisIcon}>
              Give Feedback
            </NavItem>
          </div>
        </nav>

        {/* User Controls */}
        <div className="p-4 border-t border-gray-200">
          <div className="space-y-2">
            <NavItem to="#" icon={UserCircleIcon}>
              My Account Settings
            </NavItem>
            <button
              className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md text-left"
              onClick={() => console.log('Logout clicked')}
            >
              <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-2 text-gray-500" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto md:ml-0 pt-16 md:pt-0">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/marketplace" element={<HomePage />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/learning" element={<LearningPage />} />
          <Route path="/myprojects" element={<MyProjects />} />
          <Route path="/edit-project/:id" element={<ProjectEditor />} />
          <Route path="/create-project" element={<CreateProject />} />
          <Route path="/community-ideas" element={<CommunityIdeas />} />
          <Route path="/rate-limiter" element={<RateLimiterWrapper />} />
        </Routes>
      </div>

      {/* Global Floating Chat Assistant */}
      <FloatingChatButton />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Router>
      <ProjectsProvider>
        <AppContent />
      </ProjectsProvider>
    </Router>
  );
};
