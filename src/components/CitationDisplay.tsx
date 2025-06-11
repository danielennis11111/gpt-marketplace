import React, { useState, useRef, useEffect } from 'react';
import { DocumentTextIcon, EyeIcon, XMarkIcon, InformationCircleIcon, CpuChipIcon } from '@heroicons/react/24/outline';
import { type Citation, type SourceDocument, type ThinkingProcess } from '../utils/citationProcessor';
import MarkdownContent from './MarkdownContent';

interface CitationDisplayProps {
  content: string;
  citations: Citation[];
  sourceDocuments: SourceDocument[];
  thinkingProcess?: ThinkingProcess;
  onViewDocument?: (document: SourceDocument, citation: Citation) => void;
}

interface CitationTooltipProps {
  citation: Citation;
  isVisible: boolean;
  position: { x: number; y: number };
  onViewSource: () => void;
  onClose: () => void;
}

interface ResponseSummaryProps {
  content: string;
  citations: Citation[];
  className?: string;
}

interface ThinkingProcessDisplayProps {
  thinkingProcess: ThinkingProcess;
  className?: string;
}

const ResponseSummary: React.FC<ResponseSummaryProps> = ({ content, citations, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [summary, setSummary] = useState<string>('');

  // Generate a quick summary of the response
  useEffect(() => {
    const generateSummary = () => {
      const cleanContent = content.replace(/<[^>]*>/g, '').replace(/\*\*\*/g, '').replace(/\*\*/g, '').trim();
      const sentences = cleanContent.split(/[.!?]+/).filter(s => s.trim().length > 10);
      const wordCount = cleanContent.split(/\s+/).length;
      const sourceCount = new Set(citations.map(c => c.sourceDocument)).size;
      
      let summaryText = `📄 **Response Overview**\n\n`;
      summaryText += `• **Length**: ${wordCount} words, ${sentences.length} sentences\n`;
      summaryText += `• **Sources**: ${sourceCount} document${sourceCount !== 1 ? 's' : ''} referenced\n`;
      summaryText += `• **Citations**: ${citations.length} citation${citations.length !== 1 ? 's' : ''} found\n\n`;
      
      if (sentences.length > 0) {
        summaryText += `**Key Points**:\n`;
        const keyPoints = sentences.slice(0, 3).map(s => s.trim());
        keyPoints.forEach((point, i) => {
          if (point.length > 80) {
            point = point.substring(0, 80) + '...';
          }
          summaryText += `${i + 1}. ${point}\n`;
        });
      }

      if (citations.length > 0) {
        summaryText += `\n**Sources Referenced**:\n`;
        const uniqueSources = Array.from(new Set(citations.map(c => c.sourceDocument)));
        uniqueSources.forEach((source, i) => {
          const citationCount = citations.filter(c => c.sourceDocument === source).length;
          summaryText += `• ${source} (${citationCount} reference${citationCount !== 1 ? 's' : ''})\n`;
        });
      }

      setSummary(summaryText);
    };

    generateSummary();
  }, [content, citations]);

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-full border border-blue-200 transition-colors"
        title="Response Summary"
      >
        <InformationCircleIcon className="w-3 h-3" />
        <span>Summary</span>
      </button>

      {isVisible && (
        <div className="absolute z-50 top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <div className="text-sm">
            <MarkdownContent content={summary} />
          </div>
        </div>
      )}
    </div>
  );
};

const ThinkingProcessDisplay: React.FC<ThinkingProcessDisplayProps> = ({ thinkingProcess, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeInSeconds = (thinkingProcess.totalThinkingTime / 1000).toFixed(1);

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded-full border border-purple-200 transition-colors"
        title="AI Thinking Process"
      >
        <CpuChipIcon className="w-3 h-3" />
        <span>Thought {timeInSeconds}s</span>
      </button>

      {isVisible && (
        <div className="absolute z-50 top-full left-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <div className="text-sm">
            <div className="flex items-center gap-2 mb-2 text-purple-700">
              <CpuChipIcon className="w-4 h-4" />
              <span className="font-semibold">AI Reasoning Process</span>
            </div>
            
            <div className="mb-3">
              <div className="text-xs text-gray-600 mb-1">
                🧠 **Analyzed topics:** {thinkingProcess.topicsAnalyzed.join(', ')}
              </div>
              <div className="text-xs text-gray-600">
                🎯 **Confidence:** {Math.round(thinkingProcess.confidenceLevel * 100)}%
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-700">Reasoning Steps:</div>
              {thinkingProcess.reasoningSteps.map((step, index) => (
                <div key={index} className="bg-gray-50 p-2 rounded text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-800">{step.step}. {step.description}</span>
                    <span className="text-purple-600 bg-purple-100 px-1 py-0.5 rounded">
                      {(step.timeSpent / 1000).toFixed(1)}s
                    </span>
                  </div>
                  {step.keyInsights.length > 0 && (
                    <div className="text-gray-600 pl-2">
                      {step.keyInsights.map((insight, i) => (
                        <div key={i} className="text-xs">• {insight}</div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CitationTooltip: React.FC<CitationTooltipProps> = ({
  citation,
  isVisible,
  position,
  onViewSource,
  onClose
}) => {
  if (!isVisible) return null;

  return (
    <div 
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm"
      style={{ 
        left: Math.min(position.x, window.innerWidth - 320),
        top: Math.max(10, position.y - 100)
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <DocumentTextIcon className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-gray-900">Citation</span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Source Info */}
      <div className="mb-3">
        <div className="text-sm font-medium text-gray-900">{citation.sourceDocument}</div>
        <div className="text-xs text-gray-500">
          {Math.round(citation.confidence * 100)}% confidence match
        </div>
      </div>

      {/* Text Preview */}
      <div className="mb-3">
        <div className="text-xs text-gray-600 mb-1">Source text:</div>
        <div className="text-sm text-gray-800 bg-gray-50 p-2 rounded border-l-2 border-blue-200">
          "{citation.textSnippet.length > 150 
            ? citation.textSnippet.substring(0, 150) + '...' 
            : citation.textSnippet}"
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onViewSource}
          className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
        >
          <EyeIcon className="w-3 h-3" />
          View Source
        </button>
      </div>
    </div>
  );
};

const CitationDisplay: React.FC<CitationDisplayProps> = ({ 
  content, 
  citations, 
  sourceDocuments,
  thinkingProcess,
  onViewDocument 
}) => {
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const contentRef = useRef<HTMLDivElement>(null);

  const handleCitationClick = (event: React.MouseEvent, citationId: string) => {
    event.preventDefault();
    const citation = citations.find(c => c.id === citationId);
    if (!citation) return;

    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top
    });
    setActiveCitation(citation);
  };

  const handleViewSource = () => {
    if (activeCitation && onViewDocument) {
      const sourceDoc = sourceDocuments.find(doc => doc.name === activeCitation.sourceDocument);
      if (sourceDoc) {
        onViewDocument(sourceDoc, activeCitation);
      }
    }
    setActiveCitation(null);
  };

  const processContentWithCitations = (text: string): string => {
    // First, process citations to add clickable elements
    let processedText = text;
    
    // Find and replace citation markers with interactive elements
    const citationRegex = /<cite data-citation-id="([^"]+)" data-source="([^"]+)">(\[[^\]]+\])<\/cite>/g;
    
    processedText = processedText.replace(citationRegex, (match, citationId, source, citationText) => {
      return `<span class="citation-marker" data-citation-id="${citationId}" data-source="${source}">${citationText}</span>`;
    });
    
    return processedText;
  };

  // Process content and create enhanced markdown
  const enhancedContent = processContentWithCitations(content);

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        setActiveCitation(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Add click handlers to citation markers after render
  useEffect(() => {
    if (contentRef.current) {
      const citationMarkers = contentRef.current.querySelectorAll('.citation-marker');
      
      const handleMarkerClick = (event: Event) => {
        const target = event.target as HTMLElement;
        const citationId = target.getAttribute('data-citation-id');
        if (citationId) {
          handleCitationClick(event as any, citationId);
        }
      };

      citationMarkers.forEach(marker => {
        marker.addEventListener('click', handleMarkerClick);
        marker.classList.add(
          'inline-flex', 'items-center', 'ml-1', 'text-blue-600', 'hover:text-blue-800', 
          'cursor-pointer', 'bg-blue-50', 'px-1', 'py-0.5', 'rounded', 'text-sm', 
          'border', 'border-blue-200', 'hover:bg-blue-100', 'transition-colors'
        );
        marker.setAttribute('title', 'Click to view source');
      });

      return () => {
        citationMarkers.forEach(marker => {
          marker.removeEventListener('click', handleMarkerClick);
        });
      };
    }
  }, [enhancedContent]);

  return (
    <div className="relative" ref={contentRef}>
      {/* Response Summary and Info */}
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <ResponseSummary content={content} citations={citations} />
        
        {thinkingProcess && (
          <ThinkingProcessDisplay thinkingProcess={thinkingProcess} />
        )}
        
        {citations.length > 0 && (
          <div className="inline-flex items-center gap-2">
            {/* Source count with highlights */}
            <div className="inline-flex items-center gap-2 text-xs text-blue-700 bg-blue-100 px-3 py-1 rounded-full border border-blue-300 font-medium">
              <DocumentTextIcon className="w-3 h-3" />
              <span className="font-semibold">{citations.length}</span>
              <span>citation{citations.length !== 1 ? 's' : ''} from</span>
              <span className="font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                {Array.from(new Set(citations.map(c => c.sourceDocument))).length}
              </span>
              <span>source{Array.from(new Set(citations.map(c => c.sourceDocument))).length !== 1 ? 's' : ''}</span>
            </div>
            
            {/* Quick source access buttons */}
            <div className="flex gap-1">
              {Array.from(new Set(citations.map(c => c.sourceDocument))).slice(0, 3).map((sourceName, index) => {
                const sourceDoc = sourceDocuments.find(doc => doc.name === sourceName);
                const sourceCitations = citations.filter(c => c.sourceDocument === sourceName);
                
                return (
                  <button
                    key={sourceName}
                    onClick={() => {
                      if (sourceDoc && sourceCitations.length > 0) {
                        if (onViewDocument) {
                          onViewDocument(sourceDoc, sourceCitations[0]);
                        }
                      }
                    }}
                    className="inline-flex items-center gap-1 text-xs bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 hover:from-orange-200 hover:to-red-200 px-2 py-1 rounded-full border border-orange-300 transition-all hover:shadow-sm"
                    title={`Click to view: ${sourceName}`}
                  >
                    <span className="font-semibold">[{index + 1}]</span>
                    <span className="max-w-[80px] truncate">{sourceName.replace(/\.[^/.]+$/, "")}</span>
                    <span className="text-orange-600 bg-orange-200 px-1 py-0.5 rounded text-xs">
                      {sourceCitations.length}
                    </span>
                  </button>
                );
              })}
              
              {Array.from(new Set(citations.map(c => c.sourceDocument))).length > 3 && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  +{Array.from(new Set(citations.map(c => c.sourceDocument))).length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main content with enhanced markdown rendering */}
      <div className="prose prose-sm max-w-none">
        <MarkdownContent content={enhancedContent} />
      </div>

      {/* Citation Bibliography */}
      {citations.length > 0 && (
        <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <DocumentTextIcon className="w-4 h-4 text-blue-600" />
            Referenced Sources
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
              {Array.from(new Set(citations.map(c => c.sourceDocument))).length} document{Array.from(new Set(citations.map(c => c.sourceDocument))).length !== 1 ? 's' : ''}
            </span>
          </h4>
          <div className="space-y-2">
            {Array.from(new Set(citations.map(c => c.sourceDocument))).map((docName, index) => {
              const docCitations = citations.filter(c => c.sourceDocument === docName);
              const avgConfidence = Math.round(
                docCitations.reduce((sum, c) => sum + c.confidence, 0) / docCitations.length * 100
              );
              const sourceDoc = sourceDocuments.find(doc => doc.name === docName);
              
              return (
                <button
                  key={docName}
                  onClick={() => {
                    if (sourceDoc && docCitations.length > 0 && onViewDocument) {
                      onViewDocument(sourceDoc, docCitations[0]);
                    }
                  }}
                  className="w-full text-left text-xs text-gray-700 flex items-center gap-3 p-3 bg-white hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-all hover:shadow-sm group"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded-full border border-blue-200 group-hover:bg-blue-200 transition-colors">
                      [{index + 1}]
                    </span>
                    <EyeIcon className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 group-hover:text-blue-900 transition-colors">
                      {docName}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Click to view • {docCitations.length} citation{docCitations.length !== 1 ? 's' : ''} • {avgConfidence}% avg. confidence
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      avgConfidence >= 80 ? 'text-green-700 bg-green-100' :
                      avgConfidence >= 60 ? 'text-yellow-700 bg-yellow-100' :
                      'text-orange-700 bg-orange-100'
                    }`}>
                      {avgConfidence}%
                    </span>
                    <span className="text-blue-600 bg-blue-100 px-2 py-1 rounded-full font-medium">
                      {docCitations.length} ref{docCitations.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-600 flex items-center gap-4">
              <span>💡 <strong>Tip:</strong> Click any source to view the full document</span>
              <span>🎯 <strong>Confidence:</strong> How well the AI matched content to sources</span>
            </div>
          </div>
        </div>
      )}

      {/* Citation Tooltip */}
      <CitationTooltip
        citation={activeCitation!}
        isVisible={!!activeCitation}
        position={tooltipPosition}
        onViewSource={handleViewSource}
        onClose={() => setActiveCitation(null)}
      />
    </div>
  );
};

export default CitationDisplay; 