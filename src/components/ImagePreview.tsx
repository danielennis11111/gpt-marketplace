import React, { useState, useEffect } from 'react';
import { ImageAnalysisProcessor } from '../utils/imageAnalysisProcessor';
import type { ProcessedImageDocument } from '../utils/imageAnalysisProcessor';
import { useGemini } from '../hooks/useGemini';

interface ImagePreviewProps {
  file: File;
  onAnalysisComplete?: (document: ProcessedImageDocument) => void;
  showFullAnalysis?: boolean;
  className?: string;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  file,
  onAnalysisComplete,
  showFullAnalysis = false,
  className = ''
}) => {
  const { geminiService, status } = useGemini();
  const [imageUrl, setImageUrl] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<ProcessedImageDocument | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create image URL for preview
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImageUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  // Start analysis when component mounts and Gemini service is available
  useEffect(() => {
    if (geminiService && status.isConnected && !analysisResult && !isAnalyzing) {
      startAnalysis();
    }
  }, [geminiService, status.isConnected]);

  const startAnalysis = async () => {
    if (!geminiService) {
      setError('Gemini service not available');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const processor = new ImageAnalysisProcessor(geminiService);
      const result = await processor.analyzeImageForRAG(file);
      
      setAnalysisResult(result);
      
      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }
      
      console.log('Image analysis completed:', result);
    } catch (err) {
      console.error('Image analysis failed:', err);
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`image-preview-container ${className}`}>
      {/* Image Display */}
      <div className="image-display">
        <img 
          src={imageUrl} 
          alt={file.name}
          className="preview-image"
          style={{ 
            maxWidth: '100%', 
            maxHeight: showFullAnalysis ? '300px' : '200px',
            objectFit: 'contain',
            borderRadius: '8px',
            border: '1px solid #e1e1e1'
          }}
        />
        
        {/* Image Info Overlay */}
        <div className="image-info-overlay">
          <div className="image-metadata">
            <span className="filename">{file.name}</span>
            <span className="file-details">
              {file.type} • {formatFileSize(file.size)}
              {analysisResult?.dimensions && 
                ` • ${analysisResult.dimensions.width}×${analysisResult.dimensions.height}`
              }
            </span>
          </div>
        </div>
      </div>

      {/* Analysis Status */}
      <div className="analysis-status">
        {isAnalyzing && (
          <div className="analyzing-indicator">
            <div className="spinner"></div>
            <span>Analyzing image with AI...</span>
          </div>
        )}

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
            <button onClick={startAnalysis} className="retry-button">
              Retry
            </button>
          </div>
        )}

        {analysisResult && !isAnalyzing && (
          <div className="analysis-complete">
            <span className="success-icon">✅</span>
            <span>
              Analysis complete 
              {analysisResult.analysisResult && (
                <span className="confidence-score">
                  ({Math.round(analysisResult.analysisResult.confidence * 100)}% confidence)
                </span>
              )}
            </span>
          </div>
        )}
      </div>

      {/* Analysis Results */}
      {showFullAnalysis && analysisResult?.analysisResult && (
        <div className="analysis-results">
          <div className="analysis-section">
            <h4>Visual Analysis</h4>
            <div className="analysis-content">
              {analysisResult.analysisResult.visualAnalysis}
            </div>
          </div>

          {analysisResult.analysisResult.extractedText && 
           !analysisResult.analysisResult.extractedText.includes('No text content detected') && (
            <div className="analysis-section">
              <h4>Extracted Text</h4>
              <div className="extracted-text">
                {analysisResult.analysisResult.extractedText}
              </div>
            </div>
          )}

          <div className="analysis-metadata">
            <span>Processing time: {analysisResult.analysisResult.processingTime}ms</span>
          </div>
        </div>
      )}

      {/* Quick Summary for compact view */}
      {!showFullAnalysis && analysisResult?.analysisResult && (
        <div className="quick-summary">
          <p>{analysisResult.analysisResult.summary}</p>
        </div>
      )}
    </div>
  );
}; 