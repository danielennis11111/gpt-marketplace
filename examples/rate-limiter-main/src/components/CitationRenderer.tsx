/**
 * 🔗 Citation Renderer - RAG Citation Display Component
 * 
 * Renders citations from RAG sources in an accessible, professional format.
 * Integrates with the character system to show persona-aware citations.
 */

import React, { useState } from 'react';
import { FileText, ExternalLink, ChevronDown, ChevronRight, Quote, Globe } from 'lucide-react';
import { Citation } from '../types/index';

export interface CitationReference {
  citationId: string;
  inlineText: string;
  position: number;
}

interface CitationRendererProps {
  citations: Citation[];
  showRelevanceScores?: boolean;
  maxPreviewLength?: number;
  className?: string;
}

interface CitationCardProps {
  citation: Citation;
  showRelevance?: boolean;
  maxPreviewLength?: number;
}

const CitationCard: React.FC<CitationCardProps> = ({ 
  citation, 
  showRelevance = false, 
  maxPreviewLength = 200 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getTypeIcon = (type: Citation['type']) => {
    switch (type) {
      case 'rag':
      case 'document':
      case 'pdf':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'web':
        return <Globe className="w-4 h-4 text-blue-600" />;
      case 'external':
        return <ExternalLink className="w-4 h-4 text-green-600" />;
      case 'knowledge':
        return <Quote className="w-4 h-4 text-purple-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };
  
  const getTypeColor = (type: Citation['type']) => {
    switch (type) {
      case 'rag':
      case 'document':
      case 'pdf':
      case 'web':
        return 'border-blue-200 bg-blue-50';
      case 'external':
        return 'border-green-200 bg-green-50';
      case 'knowledge':
        return 'border-purple-200 bg-purple-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };
  
  const truncatedContent = citation.content.length > maxPreviewLength
    ? citation.content.substring(0, maxPreviewLength) + '...'
    : citation.content;
  
  const contentToShow = isExpanded ? citation.content : truncatedContent;
  const needsTruncation = citation.content.length > maxPreviewLength;
  
  return (
    <div className={`border rounded-lg p-3 ${getTypeColor(citation.type)} hover:shadow-sm transition-shadow`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {getTypeIcon(citation.type)}
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {citation.source}
            </h4>
            <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
              <span className="capitalize">{citation.type}</span>
              {citation.page && (
                <span>Page {citation.page}</span>
              )}
              {showRelevance && (
                <span className="text-blue-600 font-medium">
                  {Math.round(citation.relevance * 100)}% relevance
                </span>
              )}
              {citation.timestamp && (
                <span>{citation.timestamp.toLocaleDateString()}</span>
              )}
            </div>
          </div>
        </div>
        
        {citation.url && (
          <a
            href={citation.url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 p-1 text-gray-400 hover:text-blue-600 transition-colors"
            title="Open source"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>
      
      {/* Content */}
      <div className="text-sm text-gray-700 leading-relaxed">
        <p className="whitespace-pre-wrap">{contentToShow}</p>
        
        {needsTruncation && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronDown className="w-3 h-3" />
                <span>Show less</span>
              </>
            ) : (
              <>
                <ChevronRight className="w-3 h-3" />
                <span>Show more</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

const CitationRenderer: React.FC<CitationRendererProps> = ({
  citations,
  showRelevanceScores = false,
  maxPreviewLength = 200,
  className = ''
}) => {
  if (!citations || citations.length === 0) {
    return null;
  }
  
  // Sort citations by relevance (highest first)
  const sortedCitations = [...citations].sort((a, b) => b.relevance - a.relevance);
  
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
        <Quote className="w-4 h-4" />
        <span className="font-medium">
          Sources ({citations.length})
        </span>
        {showRelevanceScores && (
          <span className="text-xs text-gray-500">
            • Showing relevance scores
          </span>
        )}
      </div>
      
      <div className="space-y-2">
        {sortedCitations.map((citation, index) => (
          <CitationCard
            key={citation.id || `citation-${index}`}
            citation={citation}
            showRelevance={showRelevanceScores}
            maxPreviewLength={maxPreviewLength}
          />
        ))}
      </div>
    </div>
  );
};

export default CitationRenderer; 