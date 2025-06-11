import React, { useState, useCallback } from 'react';
import { ImagePreview } from './ImagePreview';
import CitationDisplay from './CitationDisplay';
import type { ProcessedImageDocument } from '../utils/imageAnalysisProcessor';
import { useGemini } from '../hooks/useGemini';

interface ImageAnalysisDemoProps {
  className?: string;
}

export const ImageAnalysisDemo: React.FC<ImageAnalysisDemoProps> = ({ className = '' }) => {
  const { status } = useGemini();
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [analyzedDocuments, setAnalyzedDocuments] = useState<ProcessedImageDocument[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;

    const imageFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/')
    );

    if (imageFiles.length > 0) {
      setUploadedImages(prev => [...prev, ...imageFiles]);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  }, [handleFiles]);

  const handleAnalysisComplete = useCallback((document: ProcessedImageDocument) => {
    setAnalyzedDocuments(prev => {
      // Replace existing document with same id, or add new one
      const existingIndex = prev.findIndex(doc => doc.id === document.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = document;
        return updated;
      }
      return [...prev, document];
    });
  }, []);

  const removeImage = useCallback((index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    // Also remove the corresponding analyzed document
    const imageToRemove = uploadedImages[index];
    if (imageToRemove) {
      setAnalyzedDocuments(prev => 
        prev.filter(doc => !doc.name.includes(imageToRemove.name))
      );
    }
  }, [uploadedImages]);

  const clearAll = useCallback(() => {
    setUploadedImages([]);
    setAnalyzedDocuments([]);
  }, []);

  const generateMockResponse = useCallback(() => {
    if (analyzedDocuments.length === 0) return '';

    const response = `Based on the uploaded images, I can see several interesting elements:

${analyzedDocuments.map((doc, index) => {
  const citationIndex = index + 1;
  return `The image "${doc.name}" [${citationIndex}] shows ${doc.analysisResult?.summary || 'content that has been analyzed'}. ${doc.analysisResult?.extractedText && !doc.analysisResult.extractedText.includes('No text content detected') ? `The image contains readable text content [${citationIndex}].` : ''}`;
}).join('\n\n')}

This comprehensive visual analysis [${analyzedDocuments.map((_, i) => i + 1).join(', ')}] demonstrates how AI can understand and interpret visual content for research and documentation purposes.`;

    return response;
  }, [analyzedDocuments]);

  return (
    <div className={`image-analysis-demo ${className}`}>
      <div className="demo-header">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          🖼️ Image Analysis & RAG Citation Demo
        </h2>
        <p className="text-gray-600 mb-6">
          Upload images to see comprehensive AI analysis with automatic citation integration. 
          {!status.isConnected && (
            <span className="text-amber-600 font-medium">
              {' '}(Configure your Gemini API key in Settings to enable analysis)
            </span>
          )}
        </p>
      </div>

      {/* Upload Area */}
      <div className="upload-section mb-8">
        <div
          className={`image-upload-area ${dragActive ? 'dragover' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById('image-input')?.click()}
        >
          <div className="upload-icon">📷</div>
          <div className="upload-text">
            {dragActive ? 'Drop images here!' : 'Click or drag images to upload'}
          </div>
          <div className="upload-hint">
            Supports JPG, PNG, GIF, WebP (max 20MB each)
          </div>
          <input
            id="image-input"
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.gif,.webp"
            onChange={handleFileInput}
            style={{ display: 'none' }}
          />
        </div>

        {uploadedImages.length > 0 && (
          <div className="upload-controls mt-4 flex justify-between items-center">
            <span className="text-sm text-gray-600">
              {uploadedImages.length} image{uploadedImages.length !== 1 ? 's' : ''} uploaded
            </span>
            <button
              onClick={clearAll}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Image Grid */}
      {uploadedImages.length > 0 && (
        <div className="images-section mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Uploaded Images</h3>
          <div className="image-grid">
            {uploadedImages.map((file, index) => (
              <div key={`${file.name}-${index}`} className="image-item">
                <div className="relative">
                  <ImagePreview
                    file={file}
                    onAnalysisComplete={handleAnalysisComplete}
                    showFullAnalysis={false}
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors text-sm"
                    title="Remove image"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analyzedDocuments.length > 0 && (
        <div className="analysis-section mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Detailed Analysis</h3>
          <div className="space-y-4">
            {analyzedDocuments.map((doc, index) => (
              <div key={doc.id} className="analysis-card">
                <ImagePreview
                  file={new File([], doc.name, { type: doc.type })}
                  showFullAnalysis={true}
                  className="border-l-4 border-blue-500"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RAG Citation Demo */}
      {analyzedDocuments.length > 0 && (
        <div className="citation-demo-section">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            RAG Citation Integration
          </h3>
          <div className="bg-gray-50 p-6 rounded-lg border">
            <h4 className="font-medium text-gray-800 mb-3">Sample AI Response with Image Citations:</h4>
                         <CitationDisplay
               content={generateMockResponse()}
               citations={analyzedDocuments.map((doc, index) => ({
                 id: `citation-${index + 1}`,
                 sourceDocument: doc.name,
                 sourceType: 'image',
                 textSnippet: doc.analysisResult?.summary || 'Image analysis content',
                 pageNumber: 1,
                 startIndex: 0,
                 endIndex: 100,
                 confidence: doc.analysisResult?.confidence || 0.85,
                 timestamp: doc.uploadedAt,
                 highlightedText: doc.analysisResult?.summary || 'Image analysis content',
                 responseStartIndex: 0,
                 responseEndIndex: 100
               }))}
               sourceDocuments={analyzedDocuments.map(doc => ({
                 id: doc.id,
                 name: doc.name,
                 content: doc.content,
                 type: doc.type,
                 uploadedAt: doc.uploadedAt,
                 tokenCount: Math.ceil(doc.content.length / 4),
                 size: doc.size
                                }))}
               thinkingProcess={{
                 totalThinkingTime: 3500,
                 startTime: new Date(Date.now() - 3500),
                 endTime: new Date(),
                 reasoningSteps: [
                   {
                     step: 1,
                     description: 'Analyzing uploaded images for content and context',
                     timeSpent: 1500,
                     sourceDocumentsConsidered: analyzedDocuments.map(doc => doc.name),
                     keyInsights: ['Identifying objects and scenes', 'Extracting text content (OCR)', 'Analyzing visual composition']
                   },
                   {
                     step: 2,
                     description: 'Integrating visual analysis with text processing',
                     timeSpent: 1200,
                     sourceDocumentsConsidered: analyzedDocuments.map(doc => doc.name),
                     keyInsights: ['Matching visual content to query context', 'Generating searchable keywords', 'Creating citation mappings']
                   },
                   {
                     step: 3,
                     description: 'Composing response with proper citations',
                     timeSpent: 800,
                     sourceDocumentsConsidered: analyzedDocuments.map(doc => doc.name),
                     keyInsights: ['Structuring response with citations', 'Ensuring accuracy of references', 'Formatting for readability']
                   }
                 ],
                 topicsAnalyzed: ['visual', 'image', 'analysis', 'content', 'extraction'],
                 confidenceLevel: 0.88
               }}
             />
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="instructions-section mt-8 p-6 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-3">How it works:</h4>
        <ol className="list-decimal list-inside space-y-2 text-blue-700">
          <li>Upload one or more images using the drag-and-drop area or file selector</li>
          <li>Gemini 2.0 Flash analyzes each image for visual content and text (OCR)</li>
          <li>The system creates comprehensive searchable documents from the analysis</li>
          <li>Citations are automatically generated linking responses to specific images</li>
          <li>Users can click citations to view the original image and analysis</li>
        </ol>
        
        <div className="mt-4 p-4 bg-white rounded border-l-4 border-blue-400">
          <p className="text-sm text-gray-600">
            <strong>Pro Tip:</strong> Try uploading screenshots of documents, charts, diagrams, or any visual content. 
            The AI can extract text, describe visual elements, and make this content searchable in your RAG system.
          </p>
        </div>
      </div>
    </div>
  );
}; 