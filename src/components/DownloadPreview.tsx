import React, { useState, useMemo } from 'react';
import { 
  EyeIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  TableCellsIcon,
  DocumentIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { 
  downloadTextFile, 
  downloadJsonFile, 
  downloadCsvFile,
  parseContentForStructuredDownload 
} from '../utils/downloadHelper';

interface DownloadPreviewProps {
  content: string;
  title: string;
  filename?: string;
  trigger?: React.ReactNode;
}

const DownloadPreview: React.FC<DownloadPreviewProps> = ({
  content,
  title,
  filename = 'download',
  trigger
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Parse content to understand its structure
  const parsedContent = useMemo(() => {
    return parseContentForStructuredDownload(content);
  }, [content]);

  const handleDownload = (format: 'txt' | 'json' | 'csv' | 'md') => {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const baseFilename = `${filename}_${timestamp}`;
    
    try {
      switch (format) {
        case 'txt':
          downloadTextFile(content, {
            filename: `${baseFilename}.txt`,
            mimeType: 'text/plain'
          });
          break;
          
        case 'md':
          downloadTextFile(content, {
            filename: `${baseFilename}.md`,
            mimeType: 'text/markdown'
          });
          break;
          
        case 'json':
          if (parsedContent.type === 'table' || parsedContent.type === 'list') {
            downloadJsonFile(parsedContent.data, baseFilename);
          } else {
            downloadJsonFile({ content, metadata: { title, timestamp } }, baseFilename);
          }
          break;
          
        case 'csv':
          if (parsedContent.type === 'table' || parsedContent.type === 'list') {
            downloadCsvFile(parsedContent.data, baseFilename);
          } else {
            // Convert text to simple CSV
            const lines = content.split('\n').filter(line => line.trim());
            const csvData = lines.map((line, index) => ({ 
              line_number: index + 1, 
              content: line.trim() 
            }));
            downloadCsvFile(csvData, baseFilename);
          }
          break;
      }
      
      setIsOpen(false);
    } catch (error) {
      console.error('Download error:', error);
      alert(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getPreviewIcon = () => {
    switch (parsedContent.type) {
      case 'table':
        return <TableCellsIcon className="w-5 h-5 text-blue-600" />;
      case 'list':
        return <DocumentIcon className="w-5 h-5 text-green-600" />;
      default:
        return <DocumentTextIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getAvailableFormats = () => {
    const formats = [
      { key: 'txt', name: 'Text File', icon: DocumentTextIcon, description: 'Plain text format' },
      { key: 'md', name: 'Markdown', icon: DocumentTextIcon, description: 'Formatted markdown' }
    ];

    if (parsedContent.type === 'table' || parsedContent.type === 'list') {
      formats.push(
        { key: 'json', name: 'JSON', icon: DocumentIcon, description: 'Structured data format' },
        { key: 'csv', name: 'CSV', icon: TableCellsIcon, description: 'Spreadsheet compatible' }
      );
    } else {
      formats.push(
        { key: 'json', name: 'JSON', icon: DocumentIcon, description: 'With metadata' }
      );
    }

    return formats;
  };

  const DefaultTrigger = () => (
    <button
      onClick={() => setIsOpen(true)}
      className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
    >
      <EyeIcon className="w-4 h-4 mr-1" />
      Preview & Download
    </button>
  );

  return (
    <>
      {trigger ? (
        <div onClick={() => setIsOpen(true)} className="cursor-pointer">
          {trigger}
        </div>
      ) : (
        <DefaultTrigger />
      )}

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                {getPreviewIcon()}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                  <p className="text-sm text-gray-500">
                    {parsedContent.type === 'table' && `Table format detected`}
                    {parsedContent.type === 'list' && `List format detected`}
                    {parsedContent.type === 'text' && `Text content`}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col lg:flex-row max-h-[calc(90vh-120px)]">
              {/* Preview Section */}
              <div className="flex-1 p-4 overflow-auto">
                <h4 className="font-medium text-gray-900 mb-3">Content Preview</h4>
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                    {parsedContent.preview}
                  </pre>
                  {content.length > 200 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Showing preview of {content.length} characters total
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Download Options */}
              <div className="lg:w-80 p-4 border-t lg:border-t-0 lg:border-l border-gray-200 bg-gray-50">
                <h4 className="font-medium text-gray-900 mb-3">Download Options</h4>
                <div className="space-y-2">
                  {getAvailableFormats().map((format) => {
                    const IconComponent = format.icon;
                    return (
                      <button
                        key={format.key}
                        onClick={() => handleDownload(format.key as any)}
                        className="w-full flex items-center p-3 bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-colors text-left"
                      >
                        <IconComponent className="w-5 h-5 text-gray-600 mr-3" />
                        <div>
                          <div className="font-medium text-gray-900">{format.name}</div>
                          <div className="text-xs text-gray-500">{format.description}</div>
                        </div>
                        <ArrowDownTrayIcon className="w-4 h-4 text-gray-400 ml-auto" />
                      </button>
                    );
                  })}
                </div>

                {/* Data Summary */}
                {(parsedContent.type === 'table' || parsedContent.type === 'list') && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h5 className="font-medium text-blue-900 text-sm mb-1">Data Summary</h5>
                    <p className="text-xs text-blue-700">
                      {parsedContent.type === 'table' 
                        ? `${parsedContent.data.length} rows available for structured export`
                        : `${parsedContent.data.length} items available for structured export`
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DownloadPreview; 