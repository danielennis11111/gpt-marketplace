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
  className?: string;
  allowHtml?: boolean;
}

const MarkdownContent: React.FC<MarkdownContentProps> = ({ 
  content, 
  citations = [], 
  className = '',
  allowHtml = false 
}) => {
  // Process content to handle citation markers and clean formatting
  const processContent = (text: string): string => {
    // Clean up common markdown artifacts that might not render properly
    let cleaned = text
      // Fix bold formatting issues
      .replace(/\*\*\*([^*]+)\*\*\*/g, '**$1**') // Convert triple asterisks to bold
      .replace(/\*\*\s*([^*]+?)\s*\*\*/g, '**$1**') // Clean up spacing in bold
      // Fix italic formatting
      .replace(/\*([^*]+)\*/g, '*$1*')
      // Clean up extra whitespace
      .replace(/\n{3,}/g, '\n\n') // Limit consecutive newlines
      .replace(/[ \t]+$/gm, '') // Remove trailing whitespace
      .trim();

    return cleaned;
  };

  const processedContent = processContent(content);

  return (
    <div className={`prose prose-sm max-w-none overflow-auto ${className}`}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          // Custom components for better styling
          h1: ({ children }) => <h1 className="text-xl font-bold text-gray-900 mb-3">{children}</h1>,
          h2: ({ children }) => <h2 className="text-lg font-semibold text-gray-900 mb-2">{children}</h2>,
          h3: ({ children }) => <h3 className="text-base font-medium text-gray-900 mb-2">{children}</h3>,
          p: ({ children }) => <p className="text-gray-800 leading-relaxed mb-2">{children}</p>,
          ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-3 text-gray-800">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-3 text-gray-800">{children}</ol>,
          li: ({ children }) => <li className="text-gray-800">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-200 pl-4 italic text-gray-700 my-3">
              {children}
            </blockquote>
          ),
          code: ({ node, inline, children, ...props }: any) => {
            if (inline) {
              return <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-gray-800">{children}</code>;
            }
            return (
              <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto">
                <code className="text-sm font-mono text-gray-800">{children}</code>
              </pre>
            );
          },
          strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
          em: ({ children }) => <em className="italic text-gray-800">{children}</em>,
          // Handle any HTML elements if allowHtml is true
          ...(allowHtml && {
            span: ({ children, className, ...props }) => (
              <span className={className} {...props}>{children}</span>
            )
          })
        }}
      >
        {processedContent}
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