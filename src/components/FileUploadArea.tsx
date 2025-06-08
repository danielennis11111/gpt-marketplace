import React, { useState, useRef, useCallback } from 'react';
import { DocumentTextIcon, XMarkIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import type { DocumentContext } from '../utils/rate-limiter/tokenCounter';

interface FileUploadAreaProps {
  onFilesProcessed: (documents: DocumentContext[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  processDocumentForRAG: (file: File, content: string) => DocumentContext;
}

/**
 * File Upload Area with Drag and Drop capabilities for RAG documents
 */
const FileUploadArea: React.FC<FileUploadAreaProps> = ({
  onFilesProcessed,
  isLoading,
  setIsLoading,
  processDocumentForRAG
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  }, [isDragging]);

  // Process files
  const processFiles = useCallback(async (files: FileList) => {
    if (files.length === 0) return;
    
    setIsLoading(true);
    
    try {
      const newDocuments: DocumentContext[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Skip unsupported file types
        if (!isSupportedFileType(file.name)) {
          console.warn(`Unsupported file type: ${file.name}`);
          continue;
        }
        
        // Read file content
        const content = await readFileContent(file);
        
        // Process document for RAG
        const document = processDocumentForRAG(file, content);
        
        newDocuments.push(document);
      }
      
      onFilesProcessed(newDocuments);
    } catch (error) {
      console.error('Error processing files:', error);
    } finally {
      setIsLoading(false);
    }
  }, [onFilesProcessed, setIsLoading, processDocumentForRAG]);

  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const { files } = e.dataTransfer;
    processFiles(files);
  }, [processFiles]);

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files) {
      processFiles(files);
    }
    
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [processFiles]);

  // Helper function to read file content
  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      
      // Read file as text
      reader.readAsText(file);
    });
  };

  // Check if file type is supported
  const isSupportedFileType = (filename: string): boolean => {
    const supportedExtensions = ['.txt', '.pdf', '.md', '.csv', '.json'];
    const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
    return supportedExtensions.includes(ext);
  };

  return (
    <div className="mb-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          multiple
          accept=".txt,.pdf,.md,.csv,.json"
          disabled={isLoading}
        />
        
        <div className="flex flex-col items-center justify-center space-y-2">
          {isLoading ? (
            <div className="animate-pulse flex flex-col items-center">
              <DocumentTextIcon className="h-8 w-8 text-blue-500" />
              <p className="mt-2 text-sm text-gray-600">Processing files...</p>
            </div>
          ) : (
            <>
              <ArrowUpTrayIcon className="h-8 w-8 text-gray-400" />
              <p className="text-sm font-medium text-gray-700">
                Drag and drop files here, or click to select
              </p>
              <p className="text-xs text-gray-500">
                Supported formats: TXT, PDF, MD, CSV, JSON
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUploadArea; 