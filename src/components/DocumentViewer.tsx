import React, { useState, useEffect, useRef } from 'react';
import { XMarkIcon, DocumentTextIcon, MagnifyingGlassIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { type Citation, type SourceDocument } from '../utils/citationProcessor';

interface DocumentViewerProps {
  isOpen: boolean;
  document: SourceDocument | null;
  citation: Citation | null;
  allCitations: Citation[];
  onClose: () => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  isOpen,
  document,
  citation,
  allCitations,
  onClose
}) => {
  const [highlightedContent, setHighlightedContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentHighlight, setCurrentHighlight] = useState(0);
  const [highlights, setHighlights] = useState<Array<{start: number, end: number, type: 'citation' | 'search'}>>([]);
  const contentRef = useRef<HTMLDivElement>(null);

  // Process document content with highlights
  useEffect(() => {
    if (!document) return;

    let content = document.content;
    const newHighlights: Array<{start: number, end: number, type: 'citation' | 'search'}> = [];

    // Add citation highlights
    const documentCitations = allCitations.filter(c => c.sourceDocument === document.name);
    documentCitations.forEach(cite => {
      if (cite.startIndex < cite.endIndex) {
        newHighlights.push({
          start: cite.startIndex,
          end: cite.endIndex,
          type: 'citation'
        });
      }
    });

    // Add search highlights if there's a search query
    if (searchQuery.trim()) {
      const searchRegex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      let match;
      while ((match = searchRegex.exec(content)) !== null) {
        newHighlights.push({
          start: match.index,
          end: match.index + match[0].length,
          type: 'search'
        });
      }
    }

    // Sort highlights by position
    newHighlights.sort((a, b) => a.start - b.start);
    setHighlights(newHighlights);

    // Create highlighted content
    let highlightedText = '';
    let lastIndex = 0;

    newHighlights.forEach((highlight, index) => {
      // Add text before highlight
      highlightedText += escapeHtml(content.substring(lastIndex, highlight.start));
      
      // Add highlighted text
      const highlightClass = highlight.type === 'citation' 
        ? 'bg-blue-200 border-b-2 border-blue-400 font-medium'
        : 'bg-yellow-200 border-b-2 border-yellow-400';
      
      highlightedText += `<mark class="${highlightClass}" data-highlight-index="${index}">`;
      highlightedText += escapeHtml(content.substring(highlight.start, highlight.end));
      highlightedText += '</mark>';
      
      lastIndex = highlight.end;
    });

    // Add remaining text
    highlightedText += escapeHtml(content.substring(lastIndex));
    
    setHighlightedContent(highlightedText);
  }, [document, allCitations, searchQuery]);

  // Scroll to specific citation
  useEffect(() => {
    if (citation && document && contentRef.current) {
      setTimeout(() => {
        const citationHighlight = highlights.findIndex(h => 
          h.type === 'citation' && 
          h.start >= citation.startIndex - 50 && 
          h.end <= citation.endIndex + 50
        );
        
        if (citationHighlight !== -1) {
          setCurrentHighlight(citationHighlight);
          scrollToHighlight(citationHighlight);
        }
      }, 100);
    }
  }, [citation, document, highlights]);

  const escapeHtml = (text: string): string => {
    const div = window.document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  const scrollToHighlight = (index: number) => {
    if (!contentRef.current) return;
    
    const highlightElement = contentRef.current.querySelector(`[data-highlight-index="${index}"]`);
    if (highlightElement) {
      highlightElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      
      // Add temporary pulse effect
      highlightElement.classList.add('animate-pulse');
      setTimeout(() => {
        highlightElement.classList.remove('animate-pulse');
      }, 2000);
    }
  };

  const navigateHighlight = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'next' 
      ? Math.min(currentHighlight + 1, highlights.length - 1)
      : Math.max(currentHighlight - 1, 0);
    
    setCurrentHighlight(newIndex);
    scrollToHighlight(newIndex);
  };

  const formatFileSize = (size: number): string => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!isOpen || !document) return null;

  const citationCount = allCitations.filter(c => c.sourceDocument === document.name).length;
  const searchCount = highlights.filter(h => h.type === 'search').length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative z-10 flex h-full">
        <div className="flex flex-col w-full max-w-4xl mx-auto bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <DocumentTextIcon className="w-6 h-6 text-gray-600" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{document.name}</h2>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{document.type.toUpperCase()}</span>
                  <span>{formatFileSize(document.content.length)}</span>
                  <span>{citationCount} citation{citationCount !== 1 ? 's' : ''}</span>
                  <span>Uploaded {document.uploadedAt.toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Search and Navigation */}
          <div className="flex items-center gap-4 p-4 border-b border-gray-200 bg-white">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search in document..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Highlight Navigation */}
            {highlights.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {currentHighlight + 1} of {highlights.length}
                </span>
                <div className="flex border border-gray-300 rounded">
                  <button
                    onClick={() => navigateHighlight('prev')}
                    disabled={currentHighlight === 0}
                    className="p-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeftIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigateHighlight('next')}
                    disabled={currentHighlight === highlights.length - 1}
                    className="p-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Search Results Info */}
          {searchQuery && (
            <div className="px-4 py-2 bg-yellow-50 border-b border-yellow-200">
              <span className="text-sm text-yellow-800">
                {searchCount > 0 
                  ? `Found ${searchCount} match${searchCount !== 1 ? 'es' : ''} for "${searchQuery}"`
                  : `No matches found for "${searchQuery}"`
                }
              </span>
            </div>
          )}

          {/* Document Content */}
          <div className="flex-1 overflow-auto p-6">
            <div 
              ref={contentRef}
              className="prose prose-sm max-w-none font-mono text-sm leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: highlightedContent }}
            />
          </div>

          {/* Legend */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-2 bg-blue-200 border-b-2 border-blue-400 rounded-sm"></div>
                <span className="text-gray-600">Citation Sources</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-2 bg-yellow-200 border-b-2 border-yellow-400 rounded-sm"></div>
                <span className="text-gray-600">Search Results</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer; 