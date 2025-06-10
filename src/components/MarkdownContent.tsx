import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Citation {
  id: string;
  source: string;
  type: 'rag' | 'web' | 'pdf' | 'file';
  content: string;
  relevance: number;
  documentId: string;
  confidence?: number;
}

interface MarkdownContentProps {
  content: string;
  citations?: Citation[];
}

const MarkdownContent: React.FC<MarkdownContentProps> = ({ content, citations = [] }) => {
  return (
    <div className="prose prose-sm max-w-none overflow-auto">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
      
      {citations && citations.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm font-medium text-gray-700 mb-2">Sources:</div>
          <div className="space-y-2">
            {citations.map((citation, index) => (
              <div key={citation.id || index} className="bg-gray-50 p-3 rounded-md text-xs">
                <div className="font-medium">{citation.source}</div>
                <div className="text-gray-600 mt-1 line-clamp-2">{citation.content}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MarkdownContent; 