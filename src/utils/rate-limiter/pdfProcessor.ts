/**
 * PDF Processor for RAG Applications
 * 
 * This implementation handles PDF text extraction using pdfjs-dist
 * It provides methods to extract text content from PDF files for use in RAG systems
 */

import * as pdfjsLib from 'pdfjs-dist';

// Ensure PDF.js worker is set up
const pdfWorkerSrc = new URL('pdfjs-dist/build/pdf.worker.min.js', import.meta.url).toString();
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

export class PDFProcessor {
  /**
   * Extract text from a PDF file
   */
  async extractText(file: File): Promise<string> {
    try {
      console.log(`📄 Starting PDF extraction: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`);
      
      // Validate file type
      if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
        throw new Error(`Invalid file type: ${file.type}. Expected PDF.`);
      }
      
      // Convert File to ArrayBuffer for PDF.js
      const arrayBuffer = await file.arrayBuffer();
      
      // Load PDF document using PDF.js
      const loadingTask = pdfjsLib.getDocument({ 
        data: arrayBuffer,
        useWorkerFetch: false,
        disableAutoFetch: false,
        disableStream: false,
        stopAtErrors: false
      });
      
      const pdf = await loadingTask.promise;
      console.log(`✅ PDF loaded successfully: ${pdf.numPages} pages`);
      
      let extractedText = '';
      
      // Extract text from each page
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        extractedText += `\n--- Page ${pageNum} ---\n`;
        
        try {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          
          // Combine text items into readable text
          const pageText = textContent.items
            .map((item: any) => item.str || '')
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();
          
          extractedText += pageText + '\n\n';
        } catch (error) {
          console.error(`Error extracting text from page ${pageNum}:`, error);
          extractedText += `[Error extracting text from page ${pageNum}]\n\n`;
        }
      }
      
      return extractedText;
    } catch (error) {
      console.error('PDF extraction failed:', error);
      return `[Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}]`;
    }
  }

  /**
   * Get the page count of a PDF file
   */
  async getPageCount(file: File): Promise<number> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      return pdf.numPages;
    } catch (error) {
      console.error('Error getting PDF page count:', error);
      return 0;
    }
  }

  /**
   * Extract text chunks from a PDF file with page numbers
   */
  async extractChunks(file: File): Promise<{ text: string; page: number }[]> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      const chunks: { text: string; page: number }[] = [];
      
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          .map((item: any) => item.str || '')
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        if (pageText) {
          chunks.push({
            text: pageText,
            page: pageNum
          });
        }
      }
      
      return chunks;
    } catch (error) {
      console.error('Error extracting PDF chunks:', error);
      return [];
    }
  }
} 