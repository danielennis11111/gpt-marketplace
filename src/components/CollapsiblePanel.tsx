import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface CollapsiblePanelProps {
  title: string;
  children: ReactNode;
  initiallyExpanded?: boolean;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  collapseButtonPosition?: 'left' | 'right';
}

/**
 * CollapsiblePanel Component
 * 
 * A reusable panel that can be collapsed/expanded to hide content
 * and reduce visual clutter in the UI
 */
const CollapsiblePanel: React.FC<CollapsiblePanelProps> = ({
  title,
  children,
  initiallyExpanded = false,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  collapseButtonPosition = 'right'
}) => {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      <div 
        className={`flex items-center justify-between p-3 bg-gray-50 cursor-pointer ${headerClassName}`}
        onClick={toggleExpanded}
      >
        {collapseButtonPosition === 'left' && (
          <button 
            className="p-1 rounded-full hover:bg-gray-200 transition-colors mr-2"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpanded();
            }}
          >
            {isExpanded ? (
              <ChevronUpIcon className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDownIcon className="h-4 w-4 text-gray-500" />
            )}
          </button>
        )}
        
        <h3 className={`font-medium text-gray-900 ${collapseButtonPosition === 'left' ? 'flex-1' : ''}`}>
          {title}
        </h3>
        
        {collapseButtonPosition === 'right' && (
          <button 
            className="p-1 rounded-full hover:bg-gray-200 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpanded();
            }}
          >
            {isExpanded ? (
              <ChevronUpIcon className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDownIcon className="h-4 w-4 text-gray-500" />
            )}
          </button>
        )}
      </div>
      
      {isExpanded && (
        <div className={`p-3 ${bodyClassName}`}>
          {children}
        </div>
      )}
    </div>
  );
};

export default CollapsiblePanel; 