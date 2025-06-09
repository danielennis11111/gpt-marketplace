import React, { useState, useRef, useCallback } from 'react';
import { DocumentTextIcon, XMarkIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import type { DocumentContext } from '../utils/rate-limiter/tokenCounter';
import { PDFProcessor } from '../utils/rate-limiter/pdfProcessor';

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
  const [uploadStatus, setUploadStatus] = useState<{[key: string]: string}>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfProcessor = useRef(new PDFProcessor());

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
    setUploadStatus({});
    
    try {
      const newDocuments: DocumentContext[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileId = `${file.name}-${file.size}`;
        
        try {
          // Skip unsupported file types
          if (!isSupportedFileType(file.name)) {
            setUploadStatus(prev => ({
              ...prev,
              [fileId]: `Unsupported file type: ${getFileExtension(file.name)}`
            }));
            console.warn(`Unsupported file type: ${file.name}`);
            continue;
          }
          
          setUploadStatus(prev => ({
            ...prev,
            [fileId]: 'Processing...'
          }));
          
          // Read file content based on file type
          const content = await readFileContent(file);
          
          // Process document for RAG
          const document = processDocumentForRAG(file, content);
          
          newDocuments.push(document);
          
          setUploadStatus(prev => ({
            ...prev,
            [fileId]: 'Complete'
          }));
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
          setUploadStatus(prev => ({
            ...prev,
            [fileId]: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
          }));
        }
      }
      
      if (newDocuments.length > 0) {
        onFilesProcessed(newDocuments);
      }
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

  // Get file extension
  const getFileExtension = (filename: string): string => {
    return filename.substring(filename.lastIndexOf('.')).toLowerCase();
  };

  // Helper function to read file content based on file type
  const readFileContent = async (file: File): Promise<string> => {
    const fileExt = getFileExtension(file.name);
    
    // Handle PDF files
    if (fileExt === '.pdf') {
      return await pdfProcessor.current.extractText(file);
    }
    
    // Handle binary files
    if (['.docx', '.doc', '.xlsx', '.xls', '.pptx', '.ppt'].includes(fileExt)) {
      return `[Binary file: ${file.name}]\n\nThis file type (${fileExt}) requires specialized processing.`;
    }
    
    // For text-based files, use the standard text reader
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
    const supportedExtensions = [
      '.txt', '.pdf', '.md', '.csv', '.json', 
      '.xml', '.html', '.htm', '.js', '.ts', 
      '.jsx', '.tsx', '.py', '.java', '.c', 
      '.cpp', '.cs', '.go', '.rb'
    ];
    const ext = getFileExtension(filename);
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
          accept=".txt,.pdf,.md,.csv,.json,.xml,.html,.htm,.js,.ts,.jsx,.tsx,.py,.java,.c,.cpp,.cs,.go,.rb"
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
                Supported formats: TXT, PDF, MD, CSV, JSON, XML, HTML, code files
              </p>
            </>
          )}
        </div>
      </div>
      
      {/* File processing status */}
      {Object.keys(uploadStatus).length > 0 && (
        <div className="mt-2 text-xs">
          {Object.entries(uploadStatus).map(([fileId, status]) => (
            <div key={fileId} className="flex justify-between items-center py-1">
              <span>{fileId.split('-')[0]}</span>
              <span className={status === 'Complete' ? 'text-green-600' : status.startsWith('Error') ? 'text-red-600' : 'text-blue-600'}>
                {status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUploadArea; 