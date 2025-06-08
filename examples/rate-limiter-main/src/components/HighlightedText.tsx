/**
 * 🔍 Highlighted Text Component - Interactive RAG Source Highlighting
 * 
 * Highlights text sourced from RAG with clickable citations that show
 * source details and the incantations used to discover the information.
 */

import React, { useState } from 'react';
import { FileText, Zap } from 'lucide-react';
import { HighlightedText as HighlightedTextType, Citation, RAGDiscovery } from '../types/index';

interface HighlightedTextProps {
  segments: HighlightedTextType[];
  citations: Citation[];
  discoveries?: RAGDiscovery[];
  onCitationClick?: (citationId: string) => void;
  className?: string;
}

interface CitationTooltipProps {
  citation: Citation;
  discovery?: RAGDiscovery;
  isVisible: boolean;
  position: { x: number; y: number };
  onClose: () => void;
}

const CitationTooltip: React.FC<CitationTooltipProps> = ({
  citation,
  discovery,
  isVisible,
  position,
  onClose
}) => {
  if (!isVisible) return null;

  return (
    <div 
      className="fixed z-50 max-w-sm bg-white border border-gray-200 rounded-lg shadow-lg p-4"
      style={{ 
        left: Math.min(position.x, window.innerWidth - 400),
        top: Math.max(position.y - 100, 10)
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-blue-600" />
          <div>
            <h4 className="text-sm font-semibold text-gray-900">{citation.source}</h4>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>{Math.round(citation.relevance * 100)}% relevant</span>
              {citation.page && <span>Page {citation.page}</span>}
            </div>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>

      {/* Content Preview */}
      <div className="text-sm text-gray-700 mb-3">
        <p className="line-clamp-3">
          {citation.highlightedText || citation.content}
        </p>
      </div>

      {/* Incantation Used */}
      {discovery?.incantationUsed && (
        <div className="bg-purple-50 border border-purple-200 rounded p-2 mb-3">
          <div className="flex items-center space-x-1 mb-1">
            <Zap className="w-3 h-3 text-purple-600" />
            <span className="text-xs font-medium text-purple-800">Incantation Used</span>
          </div>
          <p className="text-xs text-purple-700">{discovery.incantationUsed}</p>
        </div>
      )}

      {/* Quality Indicators */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-3">
          <span>Quality: {Math.round((citation.quality || 0.5) * 100)}%</span>
          <span>Confidence: {Math.round((citation.confidence || 0.5) * 100)}%</span>
        </div>
        {citation.url && (
          <a 
            href={citation.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800"
          >
            View Source
          </a>
        )}
      </div>
    </div>
  );
};

const HighlightedText: React.FC<HighlightedTextProps> = ({
  segments,
  citations,
  discoveries = [],
  onCitationClick,
  className = ''
}) => {
  const [activeTooltip, setActiveTooltip] = useState<{
    citationId: string;
    position: { x: number; y: number };
  } | null>(null);

  const handleHighlightClick = (event: React.MouseEvent, citationId: string) => {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    setActiveTooltip({
      citationId,
      position: { x: rect.left, y: rect.top }
    });
    onCitationClick?.(citationId);
  };

  const handleCloseTooltip = () => {
    setActiveTooltip(null);
  };

  const getCitationById = (id: string) => 
    citations.find(c => c.id === id);

  const getDiscoveryByCitationId = (citationId: string) => 
    discoveries.find(d => d.results.some((r: Citation) => r.id === citationId));

  return (
    <div className={`relative ${className}`}>
      {/* Render highlighted text */}
      <span>
        {segments.map((segment, index) => (
          segment.isHighlighted && segment.citationId ? (
            <span
              key={index}
              className="bg-yellow-100 border-b-2 border-yellow-400 cursor-pointer hover:bg-yellow-200 transition-colors px-0.5 rounded"
              onClick={(e) => handleHighlightClick(e, segment.citationId!)}
              title="Click to see source details"
            >
              {segment.text}
            </span>
          ) : (
            <span key={index}>{segment.text}</span>
          )
        ))}
      </span>

      {/* Tooltip */}
      {activeTooltip && (
        <CitationTooltip
          citation={getCitationById(activeTooltip.citationId)!}
          discovery={getDiscoveryByCitationId(activeTooltip.citationId)}
          isVisible={true}
          position={activeTooltip.position}
          onClose={handleCloseTooltip}
        />
      )}
    </div>
  );
};

export default HighlightedText; 