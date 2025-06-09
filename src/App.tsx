import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectDetail } from './components/ProjectDetail';
import MyProjects from './pages/MyProjects';
import ProjectEditor from './pages/ProjectEditor';
import CommunityIdeas from './pages/CommunityIdeas';
import { ContributePage } from './pages/ContributePage';
import { LaunchPadPage } from './pages/LaunchPadPage';
import { AsuGptPage } from './pages/AsuGptPage';
import { FloatingChatButton } from './components/FloatingChatButton';
import { ProjectsProvider } from './contexts/ProjectsContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { SettingsPage } from './pages/SettingsPage';
import { CommunityIdeaDetail } from './pages/CommunityIdeaDetail';
import MainLayout from './components/MainLayout';
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
  LightBulbIcon,
  DocumentTextIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon
} from '@heroicons/react/24/outline';
import siteLogo from './assets/site-logo.png';

// Interface for NavItem props
interface NavItemProps {
  to: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  children: ReactNode;
  external?: boolean;
  collapsed?: boolean;
}

// NavItem component for consistent styling and active state
const NavItem: React.FC<NavItemProps> = ({ to, icon, children, external = false, collapsed = false }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  const activeClass = isActive ? "text-asu-maroon font-medium" : "text-gray-700";
  const IconComponent = icon;
  
  const content = (
    <>
      <IconComponent className={`w-5 h-5 ${collapsed ? 'mx-auto' : 'mr-2'} ${isActive ? "text-asu-maroon" : "text-gray-500"}`} />
      {!collapsed && children}
    </>
  );
  
  const baseClasses = `flex items-center ${collapsed ? 'justify-center px-2' : 'px-4'} py-2 ${activeClass} hover:bg-gray-100 rounded-md ${collapsed ? 'mx-2' : ''} ${isActive ? 'border-l-4 border-asu-gold' : ''}`;
  
  if (external) {
    return (
      <a
        href={to}
        className={baseClasses}
        target="_blank"
        rel="noopener noreferrer"
        title={collapsed ? children as string : undefined}
      >
        {content}
      </a>
    );
  }
  
  return (
    <Link
      to={to}
      className={baseClasses}
      title={collapsed ? children as string : undefined}
    >
      {content}
    </Link>
  );
};

const AppContent = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation(); // Get current location
  
  // Check if mobile and handle resizing
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Define a breakpoint for mobile
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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
        className={`${sidebarCollapsed ? 'w-24' : 'w-64'} bg-white shadow-lg flex flex-col fixed inset-y-0 left-0 z-30 transition-all duration-300 transform md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative`}
      >
        {/* Logo and Title */}
        <div className="p-4 flex items-center">
          <img src={siteLogo} alt="META aiLand Logo" className="w-10 mr-2" />
          {!sidebarCollapsed && (
            <>
              <div className="inline-flex items-center bg-amber-400 px-2 py-1 text-xs font-bold text-black rounded-md ml-2">
                META 
              </div>
              <h1 className="text-base font-bold text-gray-800"> &nbsp; aiLand</h1>
              
            </>
          )}
          
          {/* Collapse button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`${sidebarCollapsed ? 'ml-auto' : 'ml-auto'} text-gray-500 hover:text-gray-700 transition-colors hidden md:block`}
          >
            {sidebarCollapsed ? (
              <ChevronDoubleRightIcon className="h-5 w-5" />
            ) : (
              <ChevronDoubleLeftIcon className="h-5 w-5" />
            )}
          </button>
          
          {/* Mobile close button */}
          <button 
            onClick={() => setSidebarOpen(false)}
            className={`${sidebarCollapsed ? 'hidden' : 'ml-2'} text-gray-500 md:hidden`}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        {/* Main Navigation */}
        <nav className="mt-4 flex-1 overflow-y-auto px-4">
          <div className="space-y-2">
            <NavItem to="/" icon={HomeIcon} collapsed={sidebarCollapsed}>
              Dashboard
            </NavItem>
            <NavItem to="/marketplace" icon={RocketLaunchIcon} collapsed={sidebarCollapsed}>
              Marketplace
            </NavItem>
            <NavItem to="/launch-pad" icon={LightBulbIcon} collapsed={sidebarCollapsed}>
              Launch Pad
            </NavItem>
            <NavItem to="/community-ideas" icon={LightBulbIcon} collapsed={sidebarCollapsed}>
              Community Ideas
            </NavItem>
            <NavItem to="/myprojects" icon={FolderIcon} collapsed={sidebarCollapsed}>
              My Contributions
            </NavItem>
          </div>

          {/* Divider */}
          <div className="my-4 border-t border-gray-200"></div>
          
          {/* Other CreateAI apps section */}
          {!sidebarCollapsed && (
            <div className="mb-2">
              <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Other CreateAI apps
              </h3>
            </div>
          )}
          <div className="space-y-2">
            <NavItem to="https://platform-beta.aiml.asu.edu/" icon={HomeIcon} external={true} collapsed={sidebarCollapsed}>
              MyAI Builder
            </NavItem>
            <NavItem to="https://compare-beta.aiml.asu.edu/" icon={ScaleIcon} external={true} collapsed={sidebarCollapsed}>
              Model Comparison
            </NavItem>
            <NavItem to="/asugpt" icon={ChatBubbleLeftRightIcon} collapsed={sidebarCollapsed}>
              ASU GPT
            </NavItem>
          </div>

          {/* Divider */}
          <div className="my-4 border-t border-gray-200"></div>
          
          {/* Support section */}
          {!sidebarCollapsed && (
            <div className="mb-2">
              <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Support
              </h3>
            </div>
          )}
          <div className="space-y-2">
            <NavItem to="#" icon={ExclamationTriangleIcon} collapsed={sidebarCollapsed}>
              Report A Problem
            </NavItem>
          </div>
        </nav>

        {/* User Controls */}
        <div className="p-4 border-t border-gray-200">
          <div className="space-y-2">
            <NavItem to="/settings" icon={UserCircleIcon} collapsed={sidebarCollapsed}>
              My Account Settings
            </NavItem>
            <button
              className={`flex items-center w-full ${sidebarCollapsed ? 'justify-center px-2 mx-2' : 'px-4'} py-2 text-gray-700 hover:bg-gray-100 rounded-md text-left`}
              onClick={() => console.log('Logout clicked')}
              title={sidebarCollapsed ? 'Logout' : undefined}
            >
              <ArrowLeftOnRectangleIcon className={`w-5 h-5 ${sidebarCollapsed ? 'mx-auto' : 'mr-2'} text-gray-500`} />
              {!sidebarCollapsed && 'Logout'}
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
          <Route path="/" element={<DashboardPage />} />
          <Route path="/marketplace" element={<HomePage />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/myprojects" element={<MyProjects />} />
          <Route path="/edit-project/:id" element={<ProjectEditor />} />
          <Route path="/contribute" element={<ContributePage />} />
          <Route path="/launch-pad" element={<LaunchPadPage />} />
          <Route path="/community-ideas" element={<CommunityIdeas />} />
          <Route path="/community-ideas/:id" element={<CommunityIdeaDetail />} />
          <Route path="/asugpt" element={<AsuGptPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>

      {/* Global Floating Chat Assistant - Hidden on AsuGptPage */}
      {location.pathname !== '/asugpt' && <FloatingChatButton />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Router>
      <SettingsProvider>
        <ProjectsProvider>
          <MainLayout>
            <AppContent />
          </MainLayout>
        </ProjectsProvider>
      </SettingsProvider>
    </Router>
  );
};

