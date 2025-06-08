/**
 * PDF Processor Adapter
 * 
 * This is a minimal implementation to satisfy the imports in the rate-limiter project
 * A full implementation would handle PDF processing with pdfjs-dist
 */

export class PDFProcessor {
  // Mock implementation
  async extractText(file: File): Promise<string> {
    console.warn('PDF Processing is not fully implemented in this version');
    return 'PDF text extraction is not available in this version.';
  }

  async getPageCount(file: File): Promise<number> {
    return 1; // Mock implementation
  }

  async extractChunks(file: File): Promise<{ text: string; page: number }[]> {
    return [{ text: 'PDF chunk extraction is not available in this version.', page: 1 }];
  }
} 