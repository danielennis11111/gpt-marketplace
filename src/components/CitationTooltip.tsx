import React, { useState, useRef, useEffect } from 'react';
import type { Citation } from '../utils/rate-limiter/citationParser';

interface CitationTooltipProps {
  citation: Citation;
  isVisible: boolean;
  position: { x: number, y: number };
  onClose: () => void;
}

/**
 * Tooltip component that shows detailed citation information on hover
 */
export const CitationTooltip: React.FC<CitationTooltipProps> = ({
  citation,
  isVisible,
  position,
  onClose
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  
  // Adjust tooltip position to stay within viewport
  useEffect(() => {
    if (isVisible && tooltipRef.current) {
      const tooltip = tooltipRef.current;
      const tooltipRect = tooltip.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Calculate position
      let top = position.y + 10; // Show below the cursor
      let left = position.x + 10; // Show to the right of the cursor
      
      // Adjust if tooltip would go outside viewport
      if (left + tooltipRect.width > viewportWidth) {
        left = position.x - tooltipRect.width - 10; // Show to the left
      }
      
      if (top + tooltipRect.height > viewportHeight) {
        top = position.y - tooltipRect.height - 10; // Show above
      }
      
      setTooltipPosition({ top, left });
    }
  }, [isVisible, position]);
  
  // Handle click outside to close tooltip
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, onClose]);
  
  if (!isVisible) return null;
  
  // Format date for display
  const formattedDate = citation.timestamp 
    ? new Date(citation.timestamp).toLocaleDateString() 
    : 'Unknown date';
  
  return (
    <div
      ref={tooltipRef}
      style={{
        top: tooltipPosition.top,
        left: tooltipPosition.left,
        position: 'fixed',
        zIndex: 1000
      }}
      className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-base font-semibold text-gray-900">{citation.source}</h3>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          &times;
        </button>
      </div>
      
      <div className="text-sm text-gray-600 mb-3">
        {formattedDate} • {citation.type.toUpperCase()}
      </div>
      
      {citation.highlightedText && (
        <blockquote className="border-l-4 border-blue-500 pl-3 py-1 my-2 italic text-gray-700">
          {citation.highlightedText}
        </blockquote>
      )}
      
      <div className="mt-2 text-xs text-gray-500">
        {citation.documentId && (
          <div className="mb-1">Document ID: {citation.documentId}</div>
        )}
        {citation.incantationUsed && (
          <div className="mb-1">Search method: {citation.incantationUsed}</div>
        )}
        {citation.confidence !== undefined && (
          <div className="mb-1">
            Confidence: {Math.round(citation.confidence * 100)}%
          </div>
        )}
      </div>
    </div>
  );
};

export default CitationTooltip; 