import React, { useState } from 'react';
import { 
  ArrowDownTrayIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  ChevronDownIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { 
  downloadTextFile, 
  downloadAllCodeBlocks, 
  extractCodeBlocks, 
  hasDownloadableContent,
  parseContentForStructuredDownload
} from '../utils/downloadHelper';
import DownloadPreview from './DownloadPreview';

interface DownloadButtonProps {
  content: string;
  filename?: string;
  title?: string;
  className?: string;
  compact?: boolean;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({
  content,
  filename = 'ai_response',
  title = 'AI Response',
  className = '',
  compact = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const codeBlocks = extractCodeBlocks(content);
  const hasCode = hasDownloadableContent(content);
  const parsedContent = parseContentForStructuredDownload(content);
  const hasStructuredData = parsedContent.type === 'table' || parsedContent.type === 'list';
  
  // Simple download for single file
  const downloadAsText = () => {
    downloadTextFile(content, {
      filename: `${filename}.txt`,
      addTimestamp: true
    });
    setIsOpen(false);
  };
  
  const downloadAsMarkdown = () => {
    downloadTextFile(content, {
      filename: `${filename}.md`,
      mimeType: 'text/markdown',
      addTimestamp: true
    });
    setIsOpen(false);
  };
  
  const downloadCodeBlocks = () => {
    downloadAllCodeBlocks(content, filename);
    setIsOpen(false);
  };
  
  const downloadSingleCodeBlock = (index: number) => {
    const block = codeBlocks[index];
    if (block) {
      downloadTextFile(block.code, {
        filename: block.filename,
        addTimestamp: true
      });
    }
    setIsOpen(false);
  };
  
  // If no content, don't render
  if (!content || content.trim().length === 0) {
    return null;
  }
  
  // Compact version - just a download icon
  if (compact) {
    return (
      <button
        onClick={downloadAsText}
        className={`p-1 text-gray-500 hover:text-blue-600 transition-colors ${className}`}
        title="Download as text file"
      >
        <ArrowDownTrayIcon className="w-4 h-4" />
      </button>
    );
  }
  
  // Full dropdown version
  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
      >
        <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
        Download
        <ChevronDownIcon className="w-3 h-3 ml-1" />
      </button>
      
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown menu */}
          <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-48">
            <div className="py-1">
              {/* Preview option for structured data */}
              {(hasStructuredData || content.length > 500) && (
                <>
                  <DownloadPreview 
                    content={content}
                    title={title || 'AI Response'}
                    filename={filename}
                    trigger={
                      <button className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <EyeIcon className="w-4 h-4 mr-2" />
                        Preview & Download ({hasStructuredData ? 'Multiple Formats' : 'Text'})
                      </button>
                    }
                  />
                  <hr className="my-1" />
                </>
              )}
              
              {/* Quick download options */}
              <button
                onClick={downloadAsText}
                className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <DocumentTextIcon className="w-4 h-4 mr-2" />
                Quick Download (.txt)
              </button>
              
              <button
                onClick={downloadAsMarkdown}
                className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <DocumentTextIcon className="w-4 h-4 mr-2" />
                As Markdown (.md)
              </button>
              
              {/* Code downloads */}
              {hasCode && (
                <>
                  <hr className="my-1" />
                  <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Code Files
                  </div>
                  
                  {codeBlocks.length > 1 && (
                    <button
                      onClick={downloadCodeBlocks}
                      className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <CodeBracketIcon className="w-4 h-4 mr-2" />
                      All Code Blocks ({codeBlocks.length} files)
                    </button>
                  )}
                  
                  {codeBlocks.map((block, index) => (
                    <button
                      key={index}
                      onClick={() => downloadSingleCodeBlock(index)}
                      className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <CodeBracketIcon className="w-4 h-4 mr-2" />
                      {block.language || 'Code'} ({block.filename})
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DownloadButton; 