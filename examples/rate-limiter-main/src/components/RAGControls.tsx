import React, { useState, useRef } from 'react';
import { Database, Upload, FileText, X, Settings, AlertCircle } from 'lucide-react';

interface PDFDocument {
  id: string;
  name: string;
  size: number;
  pageCount: number;
  uploadedAt: Date;
  tokenCount: number;
}

interface RAGControlsProps {
  ragEnabled: boolean;
  onToggleRAG: (enabled: boolean) => void;
  uploadedPDFs: PDFDocument[];
  onUploadPDF: (file: File) => Promise<void>;
  onRemovePDF: (id: string) => void;
  isLoading?: boolean;
}

export const RAGControls: React.FC<RAGControlsProps> = ({
  ragEnabled,
  onToggleRAG,
  uploadedPDFs,
  onUploadPDF,
  onRemovePDF,
  isLoading = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
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
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Database className={`w-4 h-4 ${ragEnabled ? 'text-green-600' : 'text-gray-400'}`} />
          <span className="text-sm font-medium text-gray-900">RAG Knowledge Base</span>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            ragEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
          }`}>
            {ragEnabled ? 'Active' : 'Disabled'}
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 rounded-md hover:bg-gray-100 transition-colors"
        >
          <Settings className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Quick Toggle */}
      <div className="flex items-center justify-between mb-3">
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
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FFC627]"></div>
        </label>
      </div>

      {/* Expanded Controls */}
      {isExpanded && (
        <div className="border-t border-gray-200 pt-3 space-y-4">
          {/* Upload Area */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Upload Documents</h4>
            <div
              className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                dragOver 
                  ? 'border-[#FFC627] bg-[#FFC627] bg-opacity-20' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Drop PDF files here or{' '}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[#FFC627] hover:text-yellow-600 underline"
                  disabled={isLoading}
                >
                  browse
                </button>
              </p>
              <p className="text-xs text-gray-500">
                Supports PDF files up to 50MB
              </p>
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
          </div>

          {/* Document List */}
          {uploadedPDFs.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Uploaded Documents</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {uploadedPDFs.map((pdf) => (
                  <div key={pdf.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
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
                      className="p-1 rounded-md hover:bg-gray-200 text-gray-500 hover:text-red-600 transition-colors flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              
              {/* Summary */}
              <div className="mt-3 p-2 bg-[#FFC627] bg-opacity-20 rounded-md">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-[#FFC627]" />
                  <span className="text-sm text-[#191919]">
                    Total: {formatFileSize(totalSize)} • {totalTokens.toLocaleString()} tokens
                  </span>
                </div>
                <p className="text-xs text-gray-700 mt-1">
                  RAG will search these documents to provide contextual answers to your questions.
                </p>
              </div>
            </div>
          )}

          {/* Info */}
          {uploadedPDFs.length === 0 && (
            <div className="p-3 bg-yellow-50 rounded-md">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-800 font-medium">No documents uploaded</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Upload PDF documents to enable AI-powered contextual search and answers.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 