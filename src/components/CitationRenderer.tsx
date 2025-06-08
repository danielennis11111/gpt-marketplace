import React from 'react';
import type { Citation, HighlightedText } from '../utils/rate-limiter/citationParser';

interface CitationRendererProps {
  citations: Citation[];
  segments: HighlightedText[];
  showCitations?: boolean;
}

/**
 * Renders text with highlighted citations and source attribution
 */
export const CitationRenderer: React.FC<CitationRendererProps> = ({
  citations,
  segments,
  showCitations = true
}) => {
  // If no segments or citations, just render plain text
  if (!segments || segments.length === 0) {
    return null;
  }

  return (
    <div className="citation-renderer">
      {/* Text with highlighting */}
      <div className="citation-text">
        {segments.map((segment, index) => (
          <span
            key={index}
            className={`${segment.isHighlighted ? 'bg-yellow-100 px-0.5 rounded' : ''}`}
            data-citation-id={segment.citationId}
          >
            {segment.text}
          </span>
        ))}
      </div>

      {/* Citations list */}
      {showCitations && citations.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Sources:</h4>
          <ul className="text-sm space-y-2">
            {citations.map((citation) => (
              <li key={citation.id} className="flex items-start">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs mr-2 mt-0.5">
                  {String.fromCharCode(9432)}
                </span>
                <div>
                  <div className="font-medium text-gray-800">{citation.source}</div>
                  {citation.highlightedText && (
                    <div className="text-gray-600 mt-1 italic">"{citation.highlightedText}"</div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CitationRenderer; 