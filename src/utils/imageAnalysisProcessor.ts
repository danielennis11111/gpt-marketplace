/**
 * Image Analysis Processor for RAG System
 * Handles comprehensive image analysis using Gemini Vision capabilities
 */

import { GeminiService } from '../services/geminiService';

export interface ImageAnalysisResult {
  visualAnalysis: string;
  extractedText: string;
  summary: string;
  confidence: number;
  processingTime: number;
}

export interface ProcessedImageDocument {
  id: string;
  name: string;
  type: string;
  content: string;
  analysisResult?: ImageAnalysisResult;
  base64Data: string;
  mimeType: string;
  size: number;
  dimensions?: { width: number; height: number };
  uploadedAt: Date;
}

export class ImageAnalysisProcessor {
  private geminiService: GeminiService;

  constructor(geminiService: GeminiService) {
    this.geminiService = geminiService;
  }

  /**
   * Analyze an image and generate comprehensive content for RAG
   */
  async analyzeImageForRAG(file: File): Promise<ProcessedImageDocument> {
    const startTime = Date.now();
    
    try {
      console.log('ImageAnalysisProcessor: Starting comprehensive image analysis for', file.name);

      // Convert file to base64
      const { data: base64Data, mimeType } = await this.geminiService.fileToBase64(file);
      
      // Get image dimensions
      const dimensions = await this.getImageDimensions(file);

      // Perform visual analysis
      const visualAnalysis = await this.geminiService.analyzeImage(file);
      
      // Extract text content (OCR)
      let extractedText = '';
      try {
        extractedText = await this.geminiService.extractTextFromImage(file);
      } catch (ocrError) {
        console.warn('OCR extraction failed:', ocrError);
        extractedText = '[No text content detected or extraction failed]';
      }

      // Calculate processing time
      const processingTime = Date.now() - startTime;

      // Generate summary
      const summary = this.generateSummary(visualAnalysis, extractedText, file.name);

      // Create comprehensive content for RAG
      const content = this.createRAGContent(file, visualAnalysis, extractedText, dimensions);

      const analysisResult: ImageAnalysisResult = {
        visualAnalysis,
        extractedText,
        summary,
        confidence: this.calculateConfidence(visualAnalysis, extractedText),
        processingTime
      };

      return {
        id: this.generateId(file),
        name: file.name,
        type: file.type,
        content,
        analysisResult,
        base64Data,
        mimeType,
        size: file.size,
        dimensions,
        uploadedAt: new Date()
      };

    } catch (error) {
      console.error('ImageAnalysisProcessor: Error analyzing image:', error);
      
      // Return basic document with error information
      const { data: base64Data, mimeType } = await this.geminiService.fileToBase64(file);
      
      return {
        id: this.generateId(file),
        name: file.name,
        type: file.type,
        content: `## Image Analysis: ${file.name}\n\n**Error:** Could not analyze image - ${error instanceof Error ? error.message : 'Unknown error'}\n\n**File Details:**\n- Type: ${file.type}\n- Size: ${(file.size / 1024).toFixed(1)}KB`,
        base64Data,
        mimeType,
        size: file.size,
        uploadedAt: new Date()
      };
    }
  }

  /**
   * Create comprehensive RAG content from analysis results
   */
  private createRAGContent(
    file: File, 
    visualAnalysis: string, 
    extractedText: string, 
    dimensions?: { width: number; height: number }
  ): string {
    let content = `# Image Document: ${file.name}\n\n`;
    
    // File metadata
    content += `## File Information\n`;
    content += `- **Filename:** ${file.name}\n`;
    content += `- **Type:** ${file.type}\n`;
    content += `- **Size:** ${(file.size / 1024).toFixed(1)} KB\n`;
    if (dimensions) {
      content += `- **Dimensions:** ${dimensions.width} × ${dimensions.height} pixels\n`;
    }
    content += `- **Uploaded:** ${new Date().toLocaleString()}\n\n`;

    // Visual analysis
    content += `## Visual Analysis\n\n`;
    content += `${visualAnalysis}\n\n`;

    // Text content if available
    if (extractedText && extractedText.trim() && !extractedText.includes('No text content detected')) {
      content += `## Text Content (OCR)\n\n`;
      content += `${extractedText}\n\n`;
    }

    // Searchable keywords
    content += `## Searchable Content\n`;
    content += `Keywords: image, visual, ${file.name}, ${file.type.replace('image/', '')}, `;
    
    // Extract keywords from analysis
    const keywords = this.extractKeywords(visualAnalysis + ' ' + extractedText);
    content += keywords.join(', ');

    return content;
  }

  /**
   * Generate a concise summary of the image analysis
   */
  private generateSummary(visualAnalysis: string, extractedText: string, filename: string): string {
    // Extract the first meaningful sentence from visual analysis
    const sentences = visualAnalysis.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const mainDescription = sentences[0]?.trim() || 'Image content analyzed';
    
    let summary = `${filename}: ${mainDescription}`;
    
    // Add text info if available
    if (extractedText && extractedText.trim() && !extractedText.includes('No text content detected')) {
      summary += `. Contains text content.`;
    }
    
    // Limit summary length
    if (summary.length > 150) {
      summary = summary.substring(0, 147) + '...';
    }
    
    return summary;
  }

  /**
   * Calculate confidence score based on analysis quality
   */
  private calculateConfidence(visualAnalysis: string, extractedText: string): number {
    let score = 0.5; // Base score
    
    // Higher score for detailed analysis
    if (visualAnalysis.length > 200) score += 0.2;
    if (visualAnalysis.length > 500) score += 0.1;
    
    // Higher score if text was extracted
    if (extractedText && !extractedText.includes('No text content detected')) {
      score += 0.2;
    }
    
    // Check for quality indicators
    const qualityIndicators = [
      'color', 'lighting', 'composition', 'detail', 'clear', 'visible', 'text', 'object'
    ];
    
    const foundIndicators = qualityIndicators.filter(indicator => 
      visualAnalysis.toLowerCase().includes(indicator)
    );
    
    score += (foundIndicators.length * 0.02);
    
    return Math.min(0.95, Math.max(0.3, score));
  }

  /**
   * Extract keywords from analysis text
   */
  private extractKeywords(text: string): string[] {
    // Simple keyword extraction
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !this.isStopWord(word));
    
    // Count frequency and return top keywords
    const frequency: Record<string, number> = {};
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });
    
    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  /**
   * Check if a word is a stop word
   */
  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'she', 'use', 'way', 'what', 'with', 'this', 'that', 'have', 'from', 'they', 'know', 'want', 'been', 'good', 'much', 'some', 'time', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make', 'many', 'over', 'such', 'take', 'than', 'them', 'well', 'were'
    ]);
    return stopWords.has(word);
  }

  /**
   * Get image dimensions
   */
  private async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
        URL.revokeObjectURL(img.src);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Generate unique ID for the document
   */
  private generateId(file: File): string {
    return `img-${file.name}-${file.size}-${Date.now()}`;
  }

  /**
   * Quick image analysis for previews
   */
  async quickAnalyze(file: File): Promise<string> {
    try {
      const summary = await this.geminiService.analyzeImage(file, 
        "Provide a brief 2-3 sentence description of this image, focusing on the main subject and key visual elements."
      );
      return summary;
    } catch (error) {
      return `Image: ${file.name} (${(file.size / 1024).toFixed(1)}KB) - Analysis not available`;
    }
  }
} 