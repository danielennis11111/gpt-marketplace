import React, { useState } from 'react';
import { Citation } from '../types/index';
import { ExternalLink, FileText, Globe } from 'lucide-react';

interface CitationTooltipProps {
  citation: Citation;
  children: React.ReactNode;
  citationNumber: number;
}

const CitationTooltip: React.FC<CitationTooltipProps> = ({
  citation,
  children,
  citationNumber
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const getIcon = () => {
    switch (citation.type) {
      case 'web':
        return <Globe className="w-3 h-3" />;
      case 'document':
      case 'pdf':
        return <FileText className="w-3 h-3" />;
      default:
        return <FileText className="w-3 h-3" />;
    }
  };

  const handleClick = () => {
    if (citation.url) {
      window.open(citation.url, '_blank', 'noopener,noreferrer');
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <span className="relative inline-block">
      <span
        className="relative"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
        <sup
          className="ml-0.5 text-xs font-medium text-[#FFC627] hover:text-yellow-600 cursor-pointer bg-[#FFC627] bg-opacity-20 px-1 rounded"
          onClick={handleClick}
        >
          [{citationNumber}]
        </sup>
      </span>

      {/* Tooltip */}
      {isVisible && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
          <div className="bg-gray-900 text-white text-sm rounded-lg shadow-xl p-4 max-w-sm border border-gray-700">
            {/* Header */}
            <div className="flex items-start space-x-2 mb-2">
              <div className="text-[#FFC627] mt-0.5">
                {getIcon()}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-white truncate">
                  {citation.title || citation.source || 'Untitled Source'}
                </h4>
                <div className="flex items-center space-x-2 text-xs text-gray-300 mt-1">
                  <span>{citation.type === 'web' ? 'Web' : 'Document'}</span>
                  {(citation.pageNumber || citation.page) && (
                    <>
                      <span>•</span>
                      <span>Page {citation.pageNumber || citation.page}</span>
                    </>
                  )}
                  {citation.timestamp && (
                    <>
                      <span>•</span>
                      <span>{formatDate(citation.timestamp)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Excerpt */}
            <div className="mb-3">
              <p className="text-gray-200 text-sm leading-relaxed">
                {citation.excerpt || citation.content || 'No preview available'}
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-400">
                {citation.documentName || citation.source || (citation.url && new URL(citation.url).hostname) || 'Unknown source'}
              </div>
              {citation.url && (
                <button
                  onClick={handleClick}
                  className="flex items-center space-x-1 text-xs text-[#FFC627] hover:text-yellow-400 transition-colors"
                >
                  <span>Open</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Relevance Score */}
            {(citation.relevanceScore || citation.relevance) && (citation.relevanceScore || citation.relevance) > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-700">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Relevance</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-16 h-1 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#FFC627] rounded-full transition-all duration-300"
                        style={{ width: `${(citation.relevanceScore || citation.relevance) * 100}%` }}
                      />
                    </div>
                    <span className="text-gray-300">
                      {Math.round((citation.relevanceScore || citation.relevance) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2">
            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </span>
  );
};

export default CitationTooltip; 