import React from 'react';
import type { ReactNode } from 'react';
import GeminiInitializer from './GeminiInitializer';

interface MainLayoutProps {
  children: ReactNode;
}

/**
 * MainLayout - Component that wraps the entire app and includes global components
 * 
 * This component serves as the main layout wrapper and includes components that
 * need to be rendered once for the entire app, such as service initializers.
 */
const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <>
      {/* Global service initializers */}
      <GeminiInitializer />
      
      {/* Main content */}
      {children}
    </>
  );
};

export default MainLayout; 