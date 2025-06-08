import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, X, FileText, Upload, Database, ChevronDown, ChevronUp } from 'lucide-react';

interface PDFDocument {
  id: string;
  name: string;
  size: number;
  pageCount: number;
  uploadedAt: Date;
  tokenCount: number;
}

interface InlineRAGControlsProps {
  ragEnabled: boolean;
  onToggleRAG: (enabled: boolean) => void;
  uploadedPDFs: PDFDocument[];
  onUploadPDF: (file: File) => Promise<void>;
  onRemovePDF: (id: string) => void;
  isLoading?: boolean;
}

const InlineRAGControls: React.FC<InlineRAGControlsProps> = ({
  ragEnabled,
  onToggleRAG,
  uploadedPDFs,
  onUploadPDF,
  onRemovePDF,
  isLoading = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Debug logging for expansion
  const handleSetExpanded = (value: boolean) => {
    console.log('🔧 RAG Panel expansion changed:', value);
    setIsExpanded(value);
  };
  
  // Debug prop changes that might trigger unwanted expansion
  useEffect(() => {
    console.log('🔧 InlineRAGControls props changed:', {
      ragEnabled,
      uploadedPDFs: uploadedPDFs.length,
      isLoading
    });
  }, [ragEnabled, uploadedPDFs.length, isLoading]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalTokens = uploadedPDFs.reduce((sum, pdf) => sum + pdf.tokenCount, 0);
  const totalSize = uploadedPDFs.reduce((sum, pdf) => sum + pdf.size, 0);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type === 'application/pdf') {
        try {
          await onUploadPDF(file);
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
        }
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex items-center">
      {/* Removed automatic RAG status display - only show on user interaction */}
      
      {/* Attachment Button */}
      <div className="relative">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔧 Paperclip button clicked explicitly');
            handleSetExpanded(!isExpanded);
          }}
          className={`p-2 rounded-lg transition-all duration-200 ${
            uploadedPDFs.length > 0
              ? 'bg-[#FFC627] bg-opacity-20 text-[#FFC627] hover:bg-opacity-30'
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
          }`}
          title={uploadedPDFs.length > 0 ? `${uploadedPDFs.length} documents uploaded` : 'Upload documents'}
        >
          <Paperclip className="w-4 h-4" />
        </button>

        {/* Expanded Panel */}
        {isExpanded && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => handleSetExpanded(false)}
            />
            
            {/* Panel */}
            <div className="absolute bottom-full left-0 mb-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-20">
              {/* Header */}
              <div className="flex items-center justify-between p-3 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <Database className={`w-4 h-4 ${ragEnabled ? 'text-[#FFC627]' : 'text-gray-400'}`} />
                  <span className="text-sm font-medium text-gray-900">Knowledge Base</span>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    ragEnabled ? 'bg-[#FFC627] bg-opacity-20 text-[#191919]' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {ragEnabled ? 'Active' : 'Disabled'}
                  </div>
                </div>
                <button
                  onClick={() => handleSetExpanded(false)}
                  className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Status and Toggle */}
              <div className="p-3 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">
                    {uploadedPDFs.length} documents • {totalTokens.toLocaleString()} tokens
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ragEnabled}
                      onChange={(e) => onToggleRAG(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#FFC627] peer-focus:ring-opacity-30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FFC627]"></div>
                  </label>
                </div>

                {/* Upload Button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center space-x-2 p-2 border border-dashed border-gray-300 rounded-lg hover:border-[#FFC627] hover:bg-[#FFC627] hover:bg-opacity-10 transition-colors disabled:opacity-50"
                >
                  <Upload className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {isLoading ? 'Uploading...' : 'Upload PDFs'}
                  </span>
                </button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  multiple
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                  disabled={isLoading}
                />
              </div>

              {/* Document List */}
              {uploadedPDFs.length > 0 ? (
                <div className="max-h-40 overflow-y-auto">
                  {uploadedPDFs.map((pdf) => (
                    <div key={pdf.id} className="flex items-center justify-between p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <FileText className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{pdf.name}</p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(pdf.size)} • {pdf.pageCount} pages • {pdf.tokenCount.toLocaleString()} tokens
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => onRemovePDF(pdf.id)}
                        className="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center">
                  <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">No documents uploaded</p>
                  <p className="text-xs text-gray-500">
                    Upload PDFs to enable contextual search
                  </p>
                </div>
              )}

              {/* Summary */}
              {uploadedPDFs.length > 0 && ragEnabled && (
                <div className="p-3 bg-[#FFC627] bg-opacity-10 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-[#FFC627] rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-700">
                      RAG active - AI will search your documents for relevant context
                    </span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Removed Quick Status Indicator to prevent automatic UI popups */}
    </div>
  );
};

export default InlineRAGControls; 