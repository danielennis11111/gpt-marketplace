/**
 * 🔍 Enhanced RAG (Retrieval-Augmented Generation) System
 * 
 * Supports multiple document types:
 * - PDFs (existing)
 * - Word documents (.docx)
 * - Plain text files (.txt)
 * - Markdown files (.md)
 * - CSV files (.csv)
 * - JSON files (.json)
 * - XML/HTML files
 */

import { DocumentContext, processDocumentForRAG, estimateTokenCount } from './tokenCounter';

export interface ProcessedDocument extends DocumentContext {
  id: string;
  chunks: DocumentChunk[];
  metadata: DocumentMetadata;
}

export interface DocumentChunk {
  id: string;
  content: string;
  tokenCount: number;
  startIndex: number;
  endIndex: number;
  type: 'paragraph' | 'section' | 'code' | 'table' | 'list';
}

export interface DocumentMetadata {
  language?: string;
  keywords: string[];
  summary: string;
  structure: {
    hasHeaders: boolean;
    hasCode: boolean;
    hasTables: boolean;
    hasLists: boolean;
  };
}

export interface RAGQuery {
  query: string;
  maxResults: number;
  minRelevanceScore: number;
  documentTypes?: DocumentContext['type'][];
}

export interface RAGResult {
  chunk: DocumentChunk;
  document: ProcessedDocument;
  relevanceScore: number;
  context: string;
}

/**
 * Enhanced document processor that handles multiple file types
 */
export class EnhancedRAGProcessor {
  private documents: Map<string, ProcessedDocument> = new Map();
  
  /**
   * Process uploaded file based on its type
   */
  async processFile(file: File): Promise<ProcessedDocument> {
    const content = await this.extractContent(file);
    const documentContext = processDocumentForRAG(file, content);
    
    const processed: ProcessedDocument = {
      ...documentContext,
      id: this.generateDocumentId(file),
      chunks: this.chunkDocument(content, documentContext.type),
      metadata: this.extractMetadata(content, documentContext.type)
    };
    
    this.documents.set(processed.id, processed);
    return processed;
  }
  
  /**
   * Extract content from different file types
   */
  private async extractContent(file: File): Promise<string> {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return this.extractPDFContent(file);
      
      case 'docx':
      case 'doc':
        return this.extractWordContent(file);
      
      case 'txt':
      case 'md':
      case 'markdown':
        return this.extractTextContent(file);
      
      case 'csv':
        return this.extractCSVContent(file);
      
      case 'json':
        return this.extractJSONContent(file);
      
      case 'xml':
      case 'html':
      case 'htm':
        return this.extractXMLContent(file);
      
      default:
        // Fallback to text extraction
        return this.extractTextContent(file);
    }
  }
  
  /**
   * Extract PDF content (existing functionality)
   */
  private async extractPDFContent(file: File): Promise<string> {
    // Import dynamically to avoid circular dependencies
    const { PDFProcessor } = await import('./pdfProcessor');
    
    try {
      const processedPDF = await PDFProcessor.processPDF(file);
      return processedPDF.chunks.map(chunk => chunk.content).join('\n\n');
    } catch (error) {
      console.error('Error processing PDF with PDFProcessor:', error);
      // Fallback to basic text extraction
      return `[PDF Content from ${file.name} - Error: ${error}]`;
    }
  }
  
  /**
   * Extract content from Word documents
   */
  private async extractWordContent(file: File): Promise<string> {
    // In a real implementation, you'd use a library like mammoth.js
    const arrayBuffer = await file.arrayBuffer();
    
    // Placeholder for Word document processing
    // TODO: Integrate with mammoth.js or similar library
    return `[Word Document Content from ${file.name}]\n\nThis is a placeholder for Word document content extraction. In a production environment, this would use a library like mammoth.js to extract the actual text content from the .docx file.`;
  }
  
  /**
   * Extract plain text content
   */
  private async extractTextContent(file: File): Promise<string> {
    return file.text();
  }
  
  /**
   * Extract and format CSV content
   */
  private async extractCSVContent(file: File): Promise<string> {
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) return '';
    
    // Simple CSV parsing (in production, use a proper CSV library)
    const headers = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1).map(line => 
      line.split(',').map(cell => cell.trim())
    );
    
    // Convert to readable format
    let formatted = `CSV Data from ${file.name}\n\n`;
    formatted += `Columns: ${headers.join(', ')}\n\n`;
    
    rows.slice(0, 10).forEach((row, index) => { // Show first 10 rows
      formatted += `Row ${index + 1}:\n`;
      headers.forEach((header, i) => {
        formatted += `  ${header}: ${row[i] || 'N/A'}\n`;
      });
      formatted += '\n';
    });
    
    if (rows.length > 10) {
      formatted += `... and ${rows.length - 10} more rows\n`;
    }
    
    return formatted;
  }
  
  /**
   * Extract and format JSON content
   */
  private async extractJSONContent(file: File): Promise<string> {
    const text = await file.text();
    
    try {
      const jsonData = JSON.parse(text);
      let formatted = `JSON Data from ${file.name}\n\n`;
      
      // Pretty print the JSON with some analysis
      formatted += this.analyzeJSONStructure(jsonData, '', 0);
      
      return formatted;
    } catch (error) {
      return `Invalid JSON file: ${file.name}\nError: ${error}`;
    }
  }
  
  /**
   * Analyze JSON structure for better understanding
   */
  private analyzeJSONStructure(obj: any, path: string = '', depth: number = 0): string {
    if (depth > 3) return '[... nested data ...]'; // Prevent infinite recursion
    
    const indent = '  '.repeat(depth);
    let result = '';
    
    if (Array.isArray(obj)) {
      result += `${indent}Array with ${obj.length} items:\n`;
      if (obj.length > 0) {
        result += this.analyzeJSONStructure(obj[0], `${path}[0]`, depth + 1);
        if (obj.length > 1) {
          result += `${indent}  ... and ${obj.length - 1} more items\n`;
        }
      }
    } else if (typeof obj === 'object' && obj !== null) {
      const keys = Object.keys(obj);
      result += `${indent}Object with ${keys.length} properties:\n`;
      keys.slice(0, 5).forEach(key => { // Show first 5 properties
        const value = obj[key];
        const newPath = path ? `${path}.${key}` : key;
        result += `${indent}  ${key}: `;
        
        if (typeof value === 'object') {
          result += '\n' + this.analyzeJSONStructure(value, newPath, depth + 1);
        } else {
          result += `${typeof value} - ${String(value).slice(0, 50)}${String(value).length > 50 ? '...' : ''}\n`;
        }
      });
      
      if (keys.length > 5) {
        result += `${indent}  ... and ${keys.length - 5} more properties\n`;
      }
    } else {
      result += `${indent}${typeof obj}: ${String(obj).slice(0, 100)}${String(obj).length > 100 ? '...' : ''}\n`;
    }
    
    return result;
  }
  
  /**
   * Extract and format XML/HTML content
   */
  private async extractXMLContent(file: File): Promise<string> {
    const text = await file.text();
    
    // Simple XML/HTML parsing - extract text content
    const cleanedText = text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // Remove style tags
      .replace(/<[^>]*>/g, ' ') // Remove all HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    return `${file.name.endsWith('.html') ? 'HTML' : 'XML'} Content from ${file.name}\n\n${cleanedText}`;
  }
  
  /**
   * Split document into meaningful chunks
   */
  private chunkDocument(content: string, type: DocumentContext['type']): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];
    const maxChunkSize = 500; // tokens
    
    switch (type) {
      case 'md':
        return this.chunkMarkdown(content);
      
      case 'json':
      case 'xml':
        return this.chunkStructuredData(content);
      
      case 'csv':
        return this.chunkCSVData(content);
      
      default:
        return this.chunkPlainText(content, maxChunkSize);
    }
  }
  
  /**
   * Chunk markdown by headers and sections
   */
  private chunkMarkdown(content: string): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];
    const lines = content.split('\n');
    let currentChunk = '';
    let startIndex = 0;
    let chunkIndex = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // New section on headers
      if (line.startsWith('#') && currentChunk.trim()) {
        chunks.push({
          id: `chunk-${chunkIndex++}`,
          content: currentChunk.trim(),
          tokenCount: estimateTokenCount(currentChunk),
          startIndex,
          endIndex: content.indexOf(currentChunk) + currentChunk.length,
          type: 'section'
        });
        
        currentChunk = line + '\n';
        startIndex = content.indexOf(line);
      } else {
        currentChunk += line + '\n';
      }
    }
    
    // Add final chunk
    if (currentChunk.trim()) {
      chunks.push({
        id: `chunk-${chunkIndex}`,
        content: currentChunk.trim(),
        tokenCount: estimateTokenCount(currentChunk),
        startIndex,
        endIndex: content.length,
        type: 'section'
      });
    }
    
    return chunks;
  }
  
  /**
   * Chunk structured data by logical sections
   */
  private chunkStructuredData(content: string): DocumentChunk[] {
    // For structured data, treat the whole content as one chunk
    // In production, you might want to chunk by JSON objects or XML elements
    return [{
      id: 'chunk-0',
      content: content,
      tokenCount: estimateTokenCount(content),
      startIndex: 0,
      endIndex: content.length,
      type: 'paragraph'
    }];
  }
  
  /**
   * Chunk CSV data by rows or logical groups
   */
  private chunkCSVData(content: string): DocumentChunk[] {
    const lines = content.split('\n').filter(line => line.trim());
    const chunks: DocumentChunk[] = [];
    
    // First chunk: headers + first few rows
    const chunkSize = 10; // rows per chunk
    for (let i = 0; i < lines.length; i += chunkSize) {
      const chunkLines = lines.slice(i, i + chunkSize);
      const chunkContent = chunkLines.join('\n');
      
      chunks.push({
        id: `chunk-${Math.floor(i / chunkSize)}`,
        content: chunkContent,
        tokenCount: estimateTokenCount(chunkContent),
        startIndex: content.indexOf(chunkLines[0]),
        endIndex: content.indexOf(chunkLines[chunkLines.length - 1]) + chunkLines[chunkLines.length - 1].length,
        type: 'table'
      });
    }
    
    return chunks;
  }
  
  /**
   * Chunk plain text by paragraphs and size
   */
  private chunkPlainText(content: string, maxTokens: number): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    
    let currentChunk = '';
    let chunkIndex = 0;
    let startIndex = 0;
    
    for (const paragraph of paragraphs) {
      const testChunk = currentChunk + (currentChunk ? '\n\n' : '') + paragraph;
      
      if (estimateTokenCount(testChunk) > maxTokens && currentChunk) {
        // Save current chunk
        chunks.push({
          id: `chunk-${chunkIndex++}`,
          content: currentChunk.trim(),
          tokenCount: estimateTokenCount(currentChunk),
          startIndex,
          endIndex: content.indexOf(currentChunk) + currentChunk.length,
          type: 'paragraph'
        });
        
        currentChunk = paragraph;
        startIndex = content.indexOf(paragraph);
      } else {
        currentChunk = testChunk;
      }
    }
    
    // Add final chunk
    if (currentChunk.trim()) {
      chunks.push({
        id: `chunk-${chunkIndex}`,
        content: currentChunk.trim(),
        tokenCount: estimateTokenCount(currentChunk),
        startIndex,
        endIndex: content.length,
        type: 'paragraph'
      });
    }
    
    return chunks;
  }
  
  /**
   * Extract metadata from document content
   */
  private extractMetadata(content: string, type: DocumentContext['type']): DocumentMetadata {
    // Simple keyword extraction
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    const wordCount = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const keywords = Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
    
    // Simple summary (first few sentences)
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const summary = sentences.slice(0, 2).join('. ').trim() + '.';
    
    return {
      keywords,
      summary: summary.length > 200 ? summary.slice(0, 200) + '...' : summary,
      structure: {
        hasHeaders: /^#+\s/.test(content) || /<h[1-6]>/i.test(content),
        hasCode: /```|\bcode\b|function\s*\(/.test(content),
        hasTables: /\|.*\||\btable\b|<table>/i.test(content),
        hasLists: /^\s*[-*+]\s|^\s*\d+\.\s|<[uo]l>/im.test(content)
      }
    };
  }
  
  /**
   * Generate unique document ID
   */
  private generateDocumentId(file: File): string {
    return `doc-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9]/g, '-')}`;
  }
  
  /**
   * Search documents using improved keyword matching and phrase detection
   */
  searchDocuments(query: RAGQuery): RAGResult[] {
    const queryTerms = query.query.toLowerCase().split(/\s+/).filter(term => term.length > 2);
    const results: RAGResult[] = [];
    
    // Extract meaningful phrases (2-3 words)
    const phrases: string[] = [];
    for (let i = 0; i < queryTerms.length - 1; i++) {
      phrases.push(queryTerms.slice(i, i + 2).join(' '));
      if (i < queryTerms.length - 2) {
        phrases.push(queryTerms.slice(i, i + 3).join(' '));
      }
    }
    
    this.documents.forEach(doc => {
      // Filter by document type if specified
      if (query.documentTypes && !query.documentTypes.includes(doc.type)) {
        return;
      }
      
      doc.chunks.forEach(chunk => {
        const content = chunk.content.toLowerCase();
        const words = content.split(/\s+/);
        let relevanceScore = 0;
        
        // Phrase matching (higher weight)
        phrases.forEach(phrase => {
          if (content.includes(phrase)) {
            relevanceScore += 0.5; // High score for phrase matches
          }
        });
        
        // Individual keyword matching
        queryTerms.forEach(term => {
          const regex = new RegExp(`\\b${term}\\b`, 'g');
          const matches = content.match(regex) || [];
          relevanceScore += (matches.length * 0.1) / Math.max(words.length / 100, 1);
        });
        
        // Boost score for shorter chunks (more focused content)
        if (words.length < 100) {
          relevanceScore *= 1.2;
        }
        
        // Use much lower threshold for better results
        if (relevanceScore >= Math.max(0.05, query.minRelevanceScore * 0.1)) {
          results.push({
            chunk,
            document: doc,
            relevanceScore,
            context: this.extractBetterContext(chunk.content, queryTerms, phrases)
          });
        }
      });
    });
    
    return results
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, query.maxResults);
  }
  
  /**
   * Extract relevant context around query terms
   */
  private extractContext(content: string, queryTerms: string[]): string {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim());
    const relevantSentences = sentences.filter(sentence => 
      queryTerms.some(term => 
        sentence.toLowerCase().includes(term)
      )
    );
    
    return relevantSentences.slice(0, 3).join('. ') + '.';
  }

  /**
   * Extract better context with phrase awareness and surrounding sentences
   */
  private extractBetterContext(content: string, queryTerms: string[], phrases: string[]): string {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const relevantIndices: number[] = [];
    
    // Find sentences with phrases first (higher priority)
    sentences.forEach((sentence, index) => {
      const lowerSentence = sentence.toLowerCase();
      if (phrases.some(phrase => lowerSentence.includes(phrase))) {
        relevantIndices.push(index);
      }
    });
    
    // Then find sentences with individual terms
    sentences.forEach((sentence, index) => {
      const lowerSentence = sentence.toLowerCase();
      if (!relevantIndices.includes(index) && 
          queryTerms.some(term => lowerSentence.includes(term))) {
        relevantIndices.push(index);
      }
    });
    
    // Include surrounding context
    const expandedIndices = new Set<number>();
    relevantIndices.forEach(index => {
      expandedIndices.add(Math.max(0, index - 1)); // Previous sentence
      expandedIndices.add(index); // Current sentence
      expandedIndices.add(Math.min(sentences.length - 1, index + 1)); // Next sentence
    });
    
    // Sort and extract sentences
    const sortedIndices = Array.from(expandedIndices).sort((a, b) => a - b);
    const contextSentences = sortedIndices.map(i => sentences[i].trim());
    
    return contextSentences.slice(0, 5).join('. ') + '.';
  }
  
  /**
   * Get all documents
   */
  getDocuments(): ProcessedDocument[] {
    return Array.from(this.documents.values());
  }
  
  /**
   * Remove document
   */
  removeDocument(id: string): boolean {
    return this.documents.delete(id);
  }
  
  /**
   * Get total token count across all documents
   */
  getTotalTokenCount(): number {
    return Array.from(this.documents.values())
      .reduce((total, doc) => total + doc.tokenCount, 0);
  }
}

export default EnhancedRAGProcessor; 